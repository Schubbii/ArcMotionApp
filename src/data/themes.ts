import type { ThemeId } from "../types";

export interface ThemeDef {
  id: ThemeId;
  name: string;
  description: string;
  dark: boolean;
  /** Swatches shown in the theme picker. */
  swatches: string[];
}

/**
 * Theme metadata used by the settings picker. The actual color values live in
 * styles/themes.css as CSS custom properties scoped by [data-theme].
 */
export const THEMES: ThemeDef[] = [
  {
    id: "ocean",
    name: "Ocean",
    description: "Clean & modern, bright blue accent",
    dark: false,
    swatches: ["#2563eb", "#3b82f6", "#eff4ff", "#0f172a"],
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Dark mode with an energizing neon lime",
    dark: true,
    swatches: ["#0d0f14", "#1a1d26", "#d4f23a", "#ffffff"],
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Paper-light and distraction-free",
    dark: false,
    swatches: ["#00bcd4", "#f5f6f8", "#ffffff", "#1f2933"],
  },
  {
    id: "matcha",
    name: "Matcha Strawberry",
    description: "Soft greens & strawberry pinks",
    dark: false,
    swatches: ["#4A6644", "#C66F80", "#9FAA74", "#FCEBF1"],
  },
];

export const DEFAULT_THEME: ThemeId = "ocean";
