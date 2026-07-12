/**
 * RevenueCat public SDK keys. These are *publishable* keys and are safe to ship
 * inside the app (they can only start purchases, not refund or read secrets).
 *
 * Leave them empty to run in mock mode — the paywall and Pro gating work fully,
 * but "purchases" just flip a local flag (great for Expo Go / development).
 *
 * To go live (see MONETIZATION.md):
 *   1. Create a RevenueCat project, add your App Store & Play Store apps.
 *   2. Copy the public API keys (Project settings → API keys):
 *        iOS  key starts with "appl_"
 *        Android key starts with "goog_"
 *   3. Paste them below and ship a new build (native change → rebuild required).
 */
export const REVENUECAT_API_KEYS = {
  ios: "",
  android: "",
};

/** The publishable key for a platform, or "" to fall back to the mock store. */
export function revenueCatKeyFor(os: string): string {
  if (os === "ios") return REVENUECAT_API_KEYS.ios;
  if (os === "android") return REVENUECAT_API_KEYS.android;
  return "";
}
