import { createContext, useContext } from "react";
import type { Palette } from "../theme/themes";
import { paletteFor } from "../theme/themes";

/** Provides the active palette to all components. */
export const ThemeContext = createContext<Palette>(paletteFor("ocean"));

export function useTheme(): Palette {
  return useContext(ThemeContext);
}
