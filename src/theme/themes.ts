import type { ThemeId } from "../types";

/**
 * A theme is a flat palette of design tokens. Components read colors from the
 * active palette via useTheme() instead of hard-coding hex values, so switching
 * a theme instantly recolors the whole app.
 *
 * The "glass" tokens power the liquid-glass look: soft gradient blobs are drawn
 * behind every screen (GlassBackdrop) and cards use a translucent surface with
 * a light border, so the color bleeds through like frosted glass.
 */
export interface Palette {
  /** True for dark themes — drives the status bar / contrast choices. */
  dark: boolean;
  bg: string;
  surface: string;
  surface2: string;
  text: string;
  textMuted: string;
  textFaint: string;
  border: string;
  primary: string;
  primarySoft: string;
  onPrimary: string;
  accent: string;
  success: string;
  danger: string;
  trophy: string;
  /** Background tint for a completed set row (Hevy-style highlight). */
  rowDone: string;
  /** Translucent card surface for the frosted-glass look. */
  glassSurface: string;
  /** Light hairline border that sells the glass edge. */
  glassBorder: string;
  /** Colors of the two soft gradient blobs behind each screen. */
  blobA: string;
  blobB: string;
  /** Peak opacity of the blobs (kept subtle on purpose). */
  blobOpacity: number;
}

export interface ThemeDef {
  id: ThemeId;
  name: string;
  description: string;
  /** Swatches shown in the theme picker. */
  swatches: string[];
  palette: Palette;
}

export const THEMES: ThemeDef[] = [
  {
    id: "volt",
    name: "Volt",
    description: "Dark & athletic with an electric lime accent",
    swatches: ["#0d0f14", "#1a1f2b", "#c6f432", "#ffffff"],
    palette: {
      dark: true,
      bg: "#0d0f14",
      surface: "#151a23",
      surface2: "#1d2430",
      text: "#f2f5fa",
      textMuted: "#9aa4b5",
      textFaint: "#5d6675",
      border: "#262e3b",
      primary: "#c6f432",
      primarySoft: "#2c3414",
      onPrimary: "#121602",
      accent: "#7cdfee",
      success: "#3ddc84",
      danger: "#ff6b6b",
      trophy: "#ffc857",
      rowDone: "#1c2b16",
      glassSurface: "rgba(255,255,255,0.055)",
      glassBorder: "rgba(255,255,255,0.10)",
      blobA: "#c6f432",
      blobB: "#7cdfee",
      blobOpacity: 0.14,
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Clean & bright, professional blue",
    swatches: ["#2563eb", "#3b82f6", "#eef2fb", "#0f172a"],
    palette: {
      dark: false,
      bg: "#eef2f9",
      surface: "#ffffff",
      surface2: "#e7edf8",
      text: "#0f172a",
      textMuted: "#64748b",
      textFaint: "#94a3b8",
      border: "#dfe6f2",
      primary: "#2563eb",
      primarySoft: "#dce7ff",
      onPrimary: "#ffffff",
      accent: "#0ea5e9",
      success: "#16a34a",
      danger: "#ef4444",
      trophy: "#f59e0b",
      rowDone: "#ddf3e6",
      glassSurface: "rgba(255,255,255,0.66)",
      glassBorder: "rgba(255,255,255,0.95)",
      blobA: "#2563eb",
      blobB: "#22d3ee",
      blobOpacity: 0.12,
    },
  },
  {
    id: "carbon",
    name: "Carbon",
    description: "Deep dark with a cool indigo glow",
    swatches: ["#0b0d12", "#171b24", "#6d8bff", "#ffffff"],
    palette: {
      dark: true,
      bg: "#0b0d12",
      surface: "#141822",
      surface2: "#1c2230",
      text: "#eef1f7",
      textMuted: "#8b94a7",
      textFaint: "#565f73",
      border: "#242b3a",
      primary: "#6d8bff",
      primarySoft: "#1e2747",
      onPrimary: "#ffffff",
      accent: "#a78bfa",
      success: "#34d399",
      danger: "#fb7185",
      trophy: "#fbbf24",
      rowDone: "#16233f",
      glassSurface: "rgba(255,255,255,0.05)",
      glassBorder: "rgba(255,255,255,0.09)",
      blobA: "#6d8bff",
      blobB: "#a78bfa",
      blobOpacity: 0.13,
    },
  },
  {
    id: "matcha",
    name: "Matcha Strawberry",
    description: "Soft greens & strawberry pinks",
    swatches: ["#4A6644", "#C66F80", "#9FAA74", "#FCEBF1"],
    palette: {
      dark: false,
      bg: "#fcebf1",
      surface: "#ffffff",
      surface2: "#f6eee0",
      text: "#3f5a3a",
      textMuted: "#8a9a68",
      textFaint: "#b7af9b",
      border: "#ece0cd",
      primary: "#4a6644",
      primarySoft: "#f4c7d0",
      onPrimary: "#fceef2",
      accent: "#c66f80",
      success: "#4a6644",
      danger: "#c66f80",
      trophy: "#c66f80",
      rowDone: "#eef3e2",
      glassSurface: "rgba(255,255,255,0.68)",
      glassBorder: "rgba(255,255,255,0.95)",
      blobA: "#9faa74",
      blobB: "#c66f80",
      blobOpacity: 0.22,
    },
  },
];

export const DEFAULT_THEME: ThemeId = "volt";

export function paletteFor(id: ThemeId): Palette {
  return (THEMES.find((t) => t.id === id) ?? THEMES[0]).palette;
}
