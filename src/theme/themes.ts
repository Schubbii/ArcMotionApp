import type { ThemeId } from "../types";

/**
 * A theme is a flat palette of design tokens. Components read colors from the
 * active Palette (via useTheme) rather than hard-coding hex values, so swapping
 * themes instantly recolors the whole app.
 */
export interface Palette {
  bg: string;
  surface: string;
  surface2: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primarySoft: string;
  onPrimary: string;
  accent: string;
  success: string;
  danger: string;
  trophy: string;
}

export interface ThemeDef {
  id: ThemeId;
  name: string;
  description: string;
  dark: boolean;
  /** Swatches shown in the theme picker. */
  swatches: string[];
  palette: Palette;
}

export const THEMES: ThemeDef[] = [
  {
    id: "ocean",
    name: "Ocean",
    description: "Clean & modern, bright blue accent",
    dark: false,
    swatches: ["#2563eb", "#3b82f6", "#eef2fb", "#0f172a"],
    palette: {
      bg: "#f4f6fb",
      surface: "#ffffff",
      surface2: "#eef2fb",
      text: "#0f172a",
      textMuted: "#64748b",
      border: "#e7ecf5",
      primary: "#2563eb",
      primarySoft: "#e8eeff",
      onPrimary: "#ffffff",
      accent: "#3b82f6",
      success: "#16a34a",
      danger: "#ef4444",
      trophy: "#f59e0b",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Dark mode with an energizing neon lime",
    dark: true,
    swatches: ["#0d0f14", "#1f2531", "#d4f23a", "#ffffff"],
    palette: {
      bg: "#0d0f14",
      surface: "#161a22",
      surface2: "#1f2531",
      text: "#f1f5f9",
      textMuted: "#8b94a7",
      border: "#2a313e",
      primary: "#d4f23a",
      primarySoft: "#2b3315",
      onPrimary: "#11160a",
      accent: "#9be870",
      success: "#4ade80",
      danger: "#fb7185",
      trophy: "#fbbf24",
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Paper-light and distraction-free",
    dark: false,
    swatches: ["#00bcd4", "#f0f2f5", "#ffffff", "#1f2933"],
    palette: {
      bg: "#f5f6f8",
      surface: "#ffffff",
      surface2: "#f0f2f5",
      text: "#1f2933",
      textMuted: "#7b8794",
      border: "#e4e7eb",
      primary: "#00bcd4",
      primarySoft: "#e0f7fa",
      onPrimary: "#ffffff",
      accent: "#26c6da",
      success: "#43a047",
      danger: "#e53935",
      trophy: "#fbc02d",
    },
  },
  {
    id: "matcha",
    name: "Matcha Strawberry",
    description: "Soft greens & strawberry pinks",
    dark: false,
    swatches: ["#4A6644", "#C66F80", "#9FAA74", "#FCEBF1"],
    palette: {
      bg: "#fcebf1",
      surface: "#ffffff",
      surface2: "#ece3d2",
      text: "#4a6644",
      textMuted: "#9faa74",
      border: "#e6dcc6",
      primary: "#4a6644",
      primarySoft: "#f4c7d0",
      onPrimary: "#fceef2",
      accent: "#c66f80",
      success: "#4a6644",
      danger: "#c66f80",
      trophy: "#c66f80",
    },
  },
];

export const DEFAULT_THEME: ThemeId = "ocean";

export function paletteFor(id: ThemeId): Palette {
  return (THEMES.find((t) => t.id === id) ?? THEMES[0]).palette;
}
