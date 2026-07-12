import { Platform } from "react-native";
import { ENTITLEMENT_ID } from "./entitlements";
import { createMockBackend } from "./purchasesMock";
import { revenueCatKeyFor } from "./purchasesConfig";
import type { BillingPeriod, PurchasesBackend, SubPackage } from "./purchases.types";

/**
 * Native purchase backend. Metro resolves `purchases.web.ts` on web, so
 * `react-native-purchases` (a native module) never enters the web bundle.
 *
 * We pick the backend once: if a RevenueCat key is configured for this platform
 * we use the real store, otherwise the local mock. The RevenueCat SDK is loaded
 * with a dynamic import so a build/runtime that lacks the native module (e.g.
 * Expo Go, or an older OTA'd build) degrades gracefully instead of crashing.
 */
let cached: PurchasesBackend | null = null;

export function getPurchases(): PurchasesBackend {
  if (cached) return cached;
  const key = revenueCatKeyFor(Platform.OS);
  cached = key ? createRevenueCatBackend(key) : createMockBackend();
  return cached;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

const isActive = (info: AnyObj | null | undefined): boolean =>
  !!info?.entitlements?.active?.[ENTITLEMENT_ID];

/** Map a RevenueCat package onto our platform-neutral SubPackage. */
function toSubPackage(pkg: AnyObj): SubPackage | null {
  const type = String(pkg?.packageType ?? "").toUpperCase();
  const period: BillingPeriod | null =
    type === "ANNUAL" ? "annual" : type === "MONTHLY" ? "monthly" : null;
  if (!period) return null; // ignore weekly/lifetime/custom for this paywall
  const product: AnyObj = pkg.product ?? {};
  const intro: AnyObj | undefined = product.introPrice ?? undefined;
  const hasTrial = !!intro && Number(intro.price) === 0;
  return {
    id: String(pkg.identifier),
    period,
    priceString: String(product.priceString ?? ""),
    priceAmount: Number(product.price ?? 0),
    hasTrial,
    trialLabel: hasTrial ? "Free trial" : undefined,
  };
}

function createRevenueCatBackend(apiKey: string): PurchasesBackend {
  let sdk: AnyObj | null = null;
  let configured = false;
  const listeners = new Set<(isPro: boolean) => void>();

  // Load + memoize the native module. Throws are caught by callers, which then
  // fall back to safe defaults so a missing module never crashes the app.
  const load = async (): Promise<AnyObj> => {
    if (sdk) return sdk;
    const mod: AnyObj = await import("react-native-purchases");
    sdk = mod.default ?? mod;
    return sdk!;
  };

  const currentPackages = async (): Promise<AnyObj[]> => {
    const P = await load();
    const offerings = await P.getOfferings();
    return offerings?.current?.availablePackages ?? [];
  };

  return {
    mode: "revenuecat",
    async configure() {
      if (configured) return;
      const P = await load();
      await P.configure({ apiKey });
      configured = true;
      // Push future entitlement changes (renewals, cross-device restores) out.
      P.addCustomerInfoUpdateListener((info: AnyObj) => {
        const pro = isActive(info);
        listeners.forEach((cb) => cb(pro));
      });
    },
    async isPro() {
      try {
        const P = await load();
        return isActive(await P.getCustomerInfo());
      } catch {
        return false;
      }
    },
    async listPackages() {
      try {
        return (await currentPackages())
          .map(toSubPackage)
          .filter((p): p is SubPackage => p !== null);
      } catch {
        return [];
      }
    },
    async purchase(packageId) {
      try {
        const P = await load();
        const pkg = (await currentPackages()).find((p) => p.identifier === packageId);
        if (!pkg) return { ok: false, error: "That plan is no longer available." };
        const { customerInfo } = await P.purchasePackage(pkg);
        return { ok: isActive(customerInfo) };
      } catch (e) {
        const err = e as AnyObj;
        if (err?.userCancelled) return { ok: false, cancelled: true };
        return { ok: false, error: err?.message ?? "Purchase failed." };
      }
    },
    async restore() {
      try {
        const P = await load();
        const info = await P.restorePurchases();
        const ok = isActive(info);
        return { ok, error: ok ? undefined : "No active subscription found to restore." };
      } catch (e) {
        return { ok: false, error: (e as AnyObj)?.message ?? "Restore failed." };
      }
    },
    subscribe(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
  };
}
