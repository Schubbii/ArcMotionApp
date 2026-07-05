import { createContext, useContext } from "react";
import type { Palette } from "./themes";
import { paletteFor } from "./themes";

/** Provides the active palette to all components. */
export const ThemeContext = createContext<Palette>(paletteFor("volt"));

export function useTheme(): Palette {
  return useContext(ThemeContext);
}
