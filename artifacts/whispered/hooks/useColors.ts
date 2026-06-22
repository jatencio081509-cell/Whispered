import { useContext } from "react";
import { AppContext } from "@/context/AppContext";
import { THEME_PALETTES, CustomColors, Palette } from "@/constants/colors";

/**
 * Returns the design-token palette for the user's chosen theme.
 * Reads `theme` from AppContext so switching themes re-renders every screen.
 * Merges custom colors from user metadata if they exist.
 */
export function useColors() {
  const { theme, customColors } = useContext(AppContext);
  
  const basePalette = THEME_PALETTES[theme];
  
  // Merge custom colors with the base palette
  if (customColors) {
    const mergedPalette: Palette = { ...basePalette };
    Object.keys(customColors).forEach((key) => {
      const colorKey = key as keyof Palette;
      if (customColors[colorKey]) {
        (mergedPalette as any)[colorKey] = customColors[colorKey];
      }
    });
    return { ...mergedPalette, radius: 14 };
  }
  
  return { ...basePalette, radius: 14 };
}
