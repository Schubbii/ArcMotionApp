import { createMockBackend } from "./purchasesMock";
import type { PurchasesBackend } from "./purchases.types";

/**
 * Web build of the purchase backend. Metro resolves this instead of
 * `purchases.ts` on web, so the native `react-native-purchases` module is never
 * bundled for the browser. The web preview is UX-only, so the mock is all it
 * needs.
 */
let cached: PurchasesBackend | null = null;

export function getPurchases(): PurchasesBackend {
  return (cached ??= createMockBackend());
}
