# Monetization — ArcMotion Pro

ArcMotion is **free to use** and stays **account-free**. "Pro" is a subscription
that unlocks extra features. This document explains what's already built, how it
behaves today, and the exact steps **you** do (with your store accounts) to turn
on real purchases.

> **Account-free?** Yes. In-app purchases are tied to the user's **Apple ID /
> Google account**, never to an ArcMotion login. There is no backend and no
> sign-up. "Restore purchases" asks Apple/Google whether that store account owns
> the subscription — that's the only identity involved.

---

## What's already in the app

| Piece | File | Role |
|---|---|---|
| Gating rules | `src/lib/entitlements.ts` | The **single source of truth** for what's free vs Pro |
| Store abstraction | `src/lib/purchases.ts` (+ `.web.ts`, `purchasesMock.ts`) | RevenueCat on native, a local mock everywhere else |
| Keys/config | `src/lib/purchasesConfig.ts` | Where you paste your RevenueCat keys |
| State hub | `src/context/ProContext.tsx` | `usePro()` → `isPro`, `purchase()`, `restore()` |
| Paywall | `src/screens/PaywallScreen.tsx` | The subscription screen |
| Gates | Settings (themes), History→Calendar | Locked features route to the paywall |

**What Pro unlocks today** (all listed in `PRO_FEATURES` in `entitlements.ts`):
- **All 10 color themes** (free users get `volt`, `ocean`, `carbon`).
- **Calendar overview** (the month grid in History).

To change the free/Pro split, edit `entitlements.ts` — nothing else hard-codes it.

---

## How it behaves right now (no setup needed)

Because `purchasesConfig.ts` has **empty keys**, the app runs in **mock mode**:
- The paywall works end-to-end; "buying" flips a local flag (no real charge).
- Restore reads that flag back.

**In development (Expo Go / `expo start`)** you are seeded as **Pro** so daily
testing isn't gated. Use the **Settings → DEV · Preview Pro state** toggle to
switch between:
- **Pro** — everything unlocked,
- **Free** — see the locks + paywall exactly as a free user would,
- **Live** — use the real (or mock) purchase result.

This toggle is **only visible in development builds** — release builds always use
the real entitlement.

---

## Going live — step by step

You only need this when you want to charge real money. It requires paid developer
accounts (Apple $99/yr, Google $25 once) and a RevenueCat account (free up to
$2.5k/mo revenue).

### 1. RevenueCat project
1. Sign up at https://www.revenuecat.com and create a **project**.
2. Add your apps (iOS bundle id `com.arcmotion.app`, Android package
   `com.arcmotion.app`).
3. **Entitlements** → create one with identifier **`pro`** (must match
   `ENTITLEMENT_ID` in `entitlements.ts`).

### 2. Create the subscription products in the stores
**App Store Connect** (iOS):
1. Your app → **Subscriptions** → create a **Subscription Group** (e.g. "ArcMotion Pro").
2. Add two subscriptions: **Monthly** and **Yearly**. Give each a product id
   (e.g. `pro_monthly`, `pro_yearly`), a price, and — if you want the trial —
   an **Introductory Offer → Free, 1 week**.
3. Fill in the localizations + review info (Apple requires a screenshot of the
   paywall and a review note; see §5).

**Google Play Console** (Android):
1. **Monetize → Subscriptions** → create a subscription (e.g. `pro`) with two
   **base plans**: monthly and yearly, each with an optional **free-trial offer**.

### 3. Wire products into RevenueCat
1. In RevenueCat → **Products**: import/add the store products you just made.
2. Attach both products to the **`pro`** entitlement.
3. **Offerings** → create/keep the **`default`** offering with two **packages**:
   a **Monthly** package → your monthly product, and an **Annual** package →
   your yearly product. (The paywall reads `packageType` `MONTHLY` / `ANNUAL`.)

### 4. Paste the keys
In `src/lib/purchasesConfig.ts`:
```ts
export const REVENUECAT_API_KEYS = {
  ios: "appl_XXXXXXXXXXXXXXXXXXXX",
  android: "goog_XXXXXXXXXXXXXXXXXXXX",
};
```
These are **public** keys (Project settings → API keys) — safe to ship in the app.

### 5. Rebuild (native change!)
Adding real purchases pulls in the `react-native-purchases` native module, so an
OTA update is **not** enough — you must build:
```bash
# bump the version first so it starts a clean update lineage
# (app.json → expo.version 1.0.0 → 1.1.0, android.versionCode + ios.buildNumber)
eas build --profile preview --platform android
```
Install that build. From then on, JS-only tweaks still ship via `eas update`.

---

## Testing that purchases actually work

You don't create test users *inside ArcMotion* — you use the stores' sandbox:

**iOS (Sandbox):**
1. App Store Connect → **Users and Access → Sandbox → Testers** → add a tester
   (any email not already an Apple ID).
2. On the iPhone, sign out of the real App Store sandbox account (Settings → your
   name isn't needed; the purchase sheet will prompt for the sandbox account).
3. Run a **TestFlight** or preview build, open the paywall, subscribe — it uses
   sandbox money (free) and renews on an accelerated clock.

**Android (License testing):**
1. Play Console → **Setup → License testing** → add your tester Gmail addresses.
2. Upload the build to an **Internal testing** track and install it via the opt-in
   link with that Google account. Purchases are free for license testers.

**RevenueCat** automatically treats non-production builds as **sandbox** and shows
every test transaction live in its dashboard → a great confirmation the wiring
works.

**Test checklist:**
- [ ] Paywall shows real localized prices from the store.
- [ ] Buy monthly → app unlocks (`isPro` true), themes + calendar accessible.
- [ ] Buy annual → "SAVE x%" badge correct, trial label shown.
- [ ] Kill + reopen the app → still Pro (cached + confirmed).
- [ ] "Restore purchases" on a fresh install of the same store account → Pro back.
- [ ] Cancel in the store → after the period, app returns to free (theme falls
      back automatically via `resolveTheme`).

---

## Store-review must-haves (subscriptions)

Both stores reject subscription apps that miss these — the paywall already has the
text; you must supply the **links**:
- **Auto-renew disclosure** (present on the paywall).
- **Restore purchases** button (present).
- Links to your **Terms of Use (EULA)** and **Privacy Policy**. Replace the plain
  "Terms of Use · Privacy Policy" text at the bottom of `PaywallScreen.tsx` with
  real tappable URLs before submitting.
- Apple: for iOS you must also add the standard EULA/functional links in App Store
  Connect metadata.

---

## Notes & gotchas

- **OTA vs rebuild:** changing *which* features are Pro, paywall copy, or prices'
  presentation is JS-only → ships via `eas update`. Adding the native module or
  new store products the first time needs a **rebuild**.
- **Runtime version:** bumping `expo.version` starts a fresh OTA lineage — ship a
  new build for that version (see `BUILD.md`).
- **The mock never charges** and never talks to a store, so it's safe to keep keys
  empty in development branches.
- **Don't gate the core.** Logging workouts, history, backups and FitNotes import
  stay free on purpose — that's what earns the reviews that sell Pro.
