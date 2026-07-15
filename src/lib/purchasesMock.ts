import { loadJSON, saveJSON, STORAGE_KEYS } from "./storage";
import type { PurchasesBackend, SubPackage } from "./purchases.types";

/**
 * A local, no-charge stand-in for the store. Used on web and on native until
 * RevenueCat keys are configured, so the whole paywall / gating flow can be
 * built and tested without an App Store or Play account. "Buying" just writes a
 * flag to AsyncStorage; "restore" reads it back.
 */
const MOCK_PACKAGES: SubPackage[] = [
  { id: "mock.annual", period: "annual", priceString: "€29.99", priceAmount: 29.99, hasTrial: true, trialLabel: "7-day free trial" },
  { id: "mock.monthly", period: "monthly", priceString: "€3.99", priceAmount: 3.99, hasTrial: true, trialLabel: "7-day free trial" },
];

export function createMockBackend(): PurchasesBackend {
  const listeners = new Set<(isPro: boolean) => void>();
  const emit = (isPro: boolean) => listeners.forEach((cb) => cb(isPro));

  return {
    mode: "mock",
    async configure() {
      /* nothing to set up for the mock */
    },
    async isPro() {
      return loadJSON(STORAGE_KEYS.proMock, false);
    },
    async listPackages() {
      return MOCK_PACKAGES;
    },
    async purchase(packageId) {
      const pkg = MOCK_PACKAGES.find((p) => p.id === packageId);
      if (!pkg) return { ok: false, error: "That plan is no longer available." };
      await saveJSON(STORAGE_KEYS.proMock, true);
      emit(true);
      return { ok: true };
    },
    async restore() {
      const owned = await loadJSON(STORAGE_KEYS.proMock, false);
      emit(owned);
      return { ok: owned, error: owned ? undefined : "No previous purchase found." };
    },
    subscribe(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    async devRevoke() {
      await saveJSON(STORAGE_KEYS.proMock, false);
      emit(false);
    },
  };
}
