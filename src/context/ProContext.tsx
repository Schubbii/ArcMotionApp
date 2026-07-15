import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { loadJSON, saveJSON, STORAGE_KEYS } from "../lib/storage";
import { getPurchases } from "../lib/purchases";
import type { PurchaseResult, SubPackage } from "../lib/purchases.types";

/**
 * Owns the Pro entitlement for the whole app. Screens call usePro() to ask
 * "is this user Pro?" and to run the buy / restore flows; the actual store
 * (RevenueCat or the local mock) is hidden behind src/lib/purchases.
 *
 * Offline-first: the last known entitlement is cached in AsyncStorage and used
 * as the initial value, so a cold start (or no network) still knows the state
 * instantly. The store SDK then confirms/updates it in the background.
 */

/** Dev-only override to preview each state without a real purchase.
 *  "live" defers to the real (or cached) entitlement. */
type DevMode = "pro" | "free" | "live";

interface ProValue {
  ready: boolean;
  /** Effective Pro status (respects the dev override in development builds). */
  isPro: boolean;
  /** "revenuecat" once real keys are set, otherwise "mock". */
  mode: "revenuecat" | "mock";
  packages: SubPackage[];
  purchasing: boolean;
  restoring: boolean;
  purchase: (packageId: string) => Promise<PurchaseResult>;
  restore: () => Promise<PurchaseResult>;
  /** Undo the fake purchase — only available in mock/test mode. */
  revokeMockPro: (() => Promise<void>) | null;
  /** Development builds only — the current override and a setter. */
  devMode: DevMode;
  setDevMode: (m: DevMode) => void;
  /** True in development builds, where the debug toggle is shown. */
  devToolsEnabled: boolean;
}

const Ctx = createContext<ProValue | null>(null);

export function ProProvider({ children }: { children: ReactNode }) {
  const backend = useMemo(() => getPurchases(), []);
  const [ready, setReady] = useState(false);
  const [entitlement, setEntitlement] = useState(false);
  const [packages, setPackages] = useState<SubPackage[]>([]);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [devMode, setDevModeState] = useState<DevMode>("live");
  const mounted = useRef(true);

  const cacheEntitlement = useCallback((v: boolean) => {
    setEntitlement(v);
    saveJSON(STORAGE_KEYS.pro, v);
  }, []);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      // 1) Instant, offline: trust the last cached entitlement + saved override.
      const [cached, savedDev] = await Promise.all([
        loadJSON(STORAGE_KEYS.pro, false),
        loadJSON<DevMode | null>(STORAGE_KEYS.proDebug, null),
      ]);
      if (!mounted.current) return;
      setEntitlement(cached);
      // Seed dev builds as unlocked once, so daily development isn't gated —
      // the toggle still lets you preview "free". Never runs in release builds.
      if (savedDev) {
        setDevModeState(savedDev);
      } else if (__DEV__) {
        setDevModeState("pro");
        saveJSON(STORAGE_KEYS.proDebug, "pro");
      }
      setReady(true);

      // 2) Confirm with the store in the background.
      try {
        await backend.configure();
        const [pro, pkgs] = await Promise.all([backend.isPro(), backend.listPackages()]);
        if (!mounted.current) return;
        cacheEntitlement(pro);
        setPackages(pkgs);
      } catch {
        /* store unreachable — the cached value stands */
      }
    })();

    const unsub = backend.subscribe((pro) => {
      if (mounted.current) cacheEntitlement(pro);
    });
    return () => {
      mounted.current = false;
      unsub();
    };
  }, [backend, cacheEntitlement]);

  const value = useMemo<ProValue>(() => {
    const isPro = devMode === "pro" ? true : devMode === "free" ? false : entitlement;
    return {
      ready,
      isPro,
      mode: backend.mode,
      packages,
      purchasing,
      restoring,
      purchase: async (packageId) => {
        setPurchasing(true);
        const res = await backend.purchase(packageId);
        if (mounted.current) {
          setPurchasing(false);
          if (res.ok) cacheEntitlement(true);
        }
        return res;
      },
      restore: async () => {
        setRestoring(true);
        const res = await backend.restore();
        if (mounted.current) {
          setRestoring(false);
          if (res.ok) cacheEntitlement(true);
        }
        return res;
      },
      revokeMockPro: backend.devRevoke
        ? async () => {
            await backend.devRevoke!();
            if (mounted.current) cacheEntitlement(false);
          }
        : null,
      devMode,
      setDevMode: (m) => {
        setDevModeState(m);
        saveJSON(STORAGE_KEYS.proDebug, m);
      },
      devToolsEnabled: __DEV__,
    };
  }, [ready, entitlement, devMode, packages, purchasing, restoring, backend, cacheEntitlement]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePro(): ProValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePro must be used within ProProvider");
  return ctx;
}
