import type { ThemeId } from "../types";

/**
 * The single source of truth for what "Pro" unlocks. Gating logic lives here as
 * pure functions so it can be unit-tested (npm test) without pulling in the
 * native purchase SDK or React. Screens ask these helpers "is this locked?" and
 * route the user to the paywall when it is.
 *
 * To change what's behind the paywall, edit PRO_FEATURES + the FREE_* limits
 * below — nothing else in the app hard-codes the free/Pro split.
 */

/** RevenueCat entitlement identifier. Must match the one configured on the
 *  RevenueCat dashboard (Entitlements → add "pro"). */
export const ENTITLEMENT_ID = "pro";

/** A gated capability. Add one here, then enforce it with a helper below. */
export type ProFeatureId = "themes" | "calendar";

export interface ProFeature {
  id: ProFeatureId;
  /** Shown as a paywall bullet. */
  title: string;
  desc: string;
}

/** The selling points listed on the paywall, in display order. */
export const PRO_FEATURES: ProFeature[] = [
  {
    id: "themes",
    title: "All 10 color themes",
    desc: "Unlock every palette — Shadow Monarch, Aurora, Blue Lock and more.",
  },
  {
    id: "calendar",
    title: "Calendar overview",
    desc: "See your whole training month at a glance, color-coded by muscle group.",
  },
];

/**
 * Themes a free user can pick. The rest are Pro. Kept deliberately small but
 * varied (one light, two dark) so the free look is still good.
 */
export const FREE_THEME_IDS: readonly ThemeId[] = ["volt", "ocean", "carbon"];

/** True if this theme requires Pro for the given entitlement state. */
export function isThemeLocked(id: ThemeId, isPro: boolean): boolean {
  if (isPro) return false;
  return !FREE_THEME_IDS.includes(id);
}

/** True if the Calendar overview requires Pro for the given entitlement state. */
export function isCalendarLocked(isPro: boolean): boolean {
  return !isPro;
}

/**
 * A free user who somehow ended up on a Pro theme (e.g. their subscription
 * lapsed, or a restored backup carried a Pro theme) is quietly moved back to a
 * free theme so the app never looks "half-locked". Returns the theme to use.
 */
export function resolveTheme(id: ThemeId, isPro: boolean): ThemeId {
  return isThemeLocked(id, isPro) ? FREE_THEME_IDS[0] : id;
}

/**
 * How much the annual plan saves vs. paying monthly for a year, as a rounded
 * percentage (e.g. 37 → "Save 37%"). Returns 0 when either price is unknown or
 * the annual plan isn't actually cheaper, so the paywall can hide the badge.
 */
export function annualSavingsPercent(monthlyAmount: number, annualAmount: number): number {
  if (monthlyAmount <= 0 || annualAmount <= 0) return 0;
  const yearlyAtMonthly = monthlyAmount * 12;
  if (annualAmount >= yearlyAtMonthly) return 0;
  return Math.round((1 - annualAmount / yearlyAtMonthly) * 100);
}
