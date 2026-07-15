/**
 * The contract every purchase backend implements. Two backends satisfy it:
 *  - RevenueCat (real store purchases) — native, only when an API key is set.
 *  - Mock (a local AsyncStorage flag) — web, and native until keys are added,
 *    so the paywall and gating are fully testable without a store account.
 *
 * ProContext talks only to this interface, so screens never touch the SDK.
 */

export type BillingPeriod = "monthly" | "annual";

export interface SubPackage {
  /** Opaque id handed back to purchase(). */
  id: string;
  period: BillingPeriod;
  /** Localized, currency-formatted price, e.g. "€3.99". */
  priceString: string;
  /** Numeric price in the store currency (0 if unknown) — for savings math. */
  priceAmount: number;
  /** True when the subscription starts with an intro free trial. */
  hasTrial: boolean;
  /** Short trial label, e.g. "7-day free trial". */
  trialLabel?: string;
}

export interface PurchaseResult {
  ok: boolean;
  /** User backed out of the store sheet — not an error, show nothing. */
  cancelled?: boolean;
  error?: string;
}

export interface PurchasesBackend {
  /** Real store vs local mock — lets the paywall show a "test mode" hint. */
  readonly mode: "revenuecat" | "mock";
  /** Initialize the SDK. Safe to call more than once. */
  configure(): Promise<void>;
  /** Current Pro state. May read the SDK's on-device cache (works offline). */
  isPro(): Promise<boolean>;
  /** Available subscription options for the paywall. */
  listPackages(): Promise<SubPackage[]>;
  purchase(packageId: string): Promise<PurchaseResult>;
  restore(): Promise<PurchaseResult>;
  /** Subscribe to entitlement changes; returns an unsubscribe function. */
  subscribe(cb: (isPro: boolean) => void): () => void;
  /**
   * Remove the fake purchase again (mock/test mode only). Real subscriptions
   * are cancelled through the store account, so the RevenueCat backend
   * deliberately doesn't implement this.
   */
  devRevoke?(): Promise<void>;
}
