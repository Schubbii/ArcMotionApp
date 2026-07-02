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
      glassSurface: "rgba(255,255,255,0.045)",
      glassBorder: "rgba(255,255,255,0.10)",
      blobA: "#c6f432",
      blobB: "#7cdfee",
      blobOpacity: 0.30,
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
      glassSurface: "rgba(255,255,255,0.38)",
      glassBorder: "rgba(255,255,255,0.95)",
      blobA: "#2563eb",
      blobB: "#22d3ee",
      blobOpacity: 0.28,
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
      blobOpacity: 0.28,
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
      glassSurface: "rgba(255,255,255,0.38)",
      glassBorder: "rgba(255,255,255,0.95)",
      blobA: "#9faa74",
      blobB: "#c66f80",
      blobOpacity: 0.42,
    },
  },
  {
    id: "crimson",
    name: "Crimson",
    description: "Pure black with an aggressive red edge",
    swatches: ["#0a0a0b", "#1c1c21", "#ff2e44", "#ffffff"],
    palette: {
      dark: true,
      bg: "#0a0a0b",
      surface: "#131316",
      surface2: "#1c1c21",
      text: "#f5f2f3",
      textMuted: "#a39da1",
      textFaint: "#5f5a5e",
      border: "#262329",
      primary: "#ff2e44",
      primarySoft: "#3a1218",
      onPrimary: "#ffffff",
      accent: "#ff8a5c",
      success: "#3ddc84",
      danger: "#ff5470",
      trophy: "#ffc857",
      rowDone: "#142519",
      glassSurface: "rgba(255,255,255,0.045)",
      glassBorder: "rgba(255,255,255,0.10)",
      blobA: "#ff2e44",
      blobB: "#ff7a45",
      blobOpacity: 0.24,
    },
  },
  {
    id: "bluelock",
    name: "Blue Lock",
    description: "Ego mode — deep navy & electric blue",
    swatches: ["#060c19", "#142244", "#2e7dff", "#ffd60a"],
    palette: {
      dark: true,
      bg: "#060c19",
      surface: "#0d1730",
      surface2: "#142244",
      text: "#eaf1ff",
      textMuted: "#8fa2c7",
      textFaint: "#55648a",
      border: "#1d2c52",
      primary: "#2e7dff",
      primarySoft: "#10254d",
      onPrimary: "#ffffff",
      accent: "#ffd60a",
      success: "#34d399",
      danger: "#ff6b6b",
      trophy: "#ffd60a",
      rowDone: "#0e2a3f",
      glassSurface: "rgba(255,255,255,0.05)",
      glassBorder: "rgba(255,255,255,0.10)",
      blobA: "#1e5eff",
      blobB: "#00c2ff",
      blobOpacity: 0.30,
    },
  },
  {
    id: "shadow",
    name: "Shadow Monarch",
    description: "Arise — glowing violet on black",
    swatches: ["#0b0813", "#1e1730", "#a259ff", "#38bdf8"],
    palette: {
      dark: true,
      bg: "#0b0813",
      surface: "#151022",
      surface2: "#1e1730",
      text: "#f0ecfa",
      textMuted: "#9c92b8",
      textFaint: "#5c5378",
      border: "#2a2142",
      primary: "#a259ff",
      primarySoft: "#2c1a4d",
      onPrimary: "#ffffff",
      accent: "#38bdf8",
      success: "#34d399",
      danger: "#fb7185",
      trophy: "#fbbf24",
      rowDone: "#142a1e",
      glassSurface: "rgba(255,255,255,0.05)",
      glassBorder: "rgba(255,255,255,0.10)",
      blobA: "#7c3aed",
      blobB: "#38bdf8",
      blobOpacity: 0.30,
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Cinematic coral & pink glow",
    swatches: ["#160d12", "#2a1a20", "#ff7a59", "#ff4f9a"],
    palette: {
      dark: true,
      bg: "#160d12",
      surface: "#201318",
      surface2: "#2a1a20",
      text: "#fdf1ec",
      textMuted: "#b89b93",
      textFaint: "#6f5a56",
      border: "#34222a",
      primary: "#ff7a59",
      primarySoft: "#3d1e18",
      onPrimary: "#331309",
      accent: "#ff4f9a",
      success: "#3ddc84",
      danger: "#ff5470",
      trophy: "#ffc857",
      rowDone: "#14291c",
      glassSurface: "rgba(255,255,255,0.05)",
      glassBorder: "rgba(255,255,255,0.10)",
      blobA: "#ff7a59",
      blobB: "#ff4f9a",
      blobOpacity: 0.26,
    },
  },
  {
    id: "mocha",
    name: "Mocha",
    description: "Warm latte neutrals, calm & cozy",
    swatches: ["#a47864", "#7d5a45", "#efe6db", "#38291f"],
    palette: {
      dark: false,
      bg: "#f6f0e9",
      surface: "#ffffff",
      surface2: "#efe6db",
      text: "#38291f",
      textMuted: "#8a7364",
      textFaint: "#b3a291",
      border: "#e5d9c9",
      primary: "#7d5a45",
      primarySoft: "#ecdcd0",
      onPrimary: "#fff8f2",
      accent: "#c96b4e",
      success: "#4c8051",
      danger: "#cf5a4e",
      trophy: "#c98f3e",
      rowDone: "#e7eedd",
      glassSurface: "rgba(255,255,255,0.38)",
      glassBorder: "rgba(255,255,255,0.95)",
      blobA: "#a47864",
      blobB: "#dba679",
      blobOpacity: 0.34,
    },
  },
  {
    id: "aurora",
    name: "Aurora",
    description: "Northern lights — mint & violet on deep green",
    swatches: ["#06120f", "#152722", "#45e0bd", "#a78bfa"],
    palette: {
      dark: true,
      bg: "#06120f",
      surface: "#0e1c18",
      surface2: "#152722",
      text: "#eafaf4",
      textMuted: "#8fb3a7",
      textFaint: "#4f7268",
      border: "#1e332c",
      primary: "#45e0bd",
      primarySoft: "#0f3b30",
      onPrimary: "#04231b",
      accent: "#a78bfa",
      success: "#3ddc84",
      danger: "#fb7185",
      trophy: "#fbbf24",
      rowDone: "#113126",
      glassSurface: "rgba(255,255,255,0.05)",
      glassBorder: "rgba(255,255,255,0.10)",
      blobA: "#2dd4bf",
      blobB: "#8b5cf6",
      blobOpacity: 0.28,
    },
  },
];

export const DEFAULT_THEME: ThemeId = "volt";

export function paletteFor(id: ThemeId): Palette {
  return (THEMES.find((t) => t.id === id) ?? THEMES[0]).palette;
}
