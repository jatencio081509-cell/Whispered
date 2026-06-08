import { useContext } from "react";
import { AppContext } from "@/context/AppContext";
import { THEME_PALETTES } from "@/constants/colors";

/**
 * Returns the design-token palette for the user's chosen theme.
 * Reads `theme` from AppContext so switching themes re-renders every screen.
 */
export function useColors() {
  const { theme } = useContext(AppContext);
  return { ...THEME_PALETTES[theme], radius: 14 };
}
