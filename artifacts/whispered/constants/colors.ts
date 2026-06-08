import type { Theme } from "@/context/AppContext";

interface Palette {
  text: string;
  tint: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  surface: string;
  streak: string;
  success: string;
  rose: string;
}

const base: Omit<Palette, "primary" | "primaryForeground" | "secondary" | "secondaryForeground" | "accent" | "accentForeground" | "border" | "tint" | "streak"> = {
  text: "#EEF2FF",
  background: "#04060E",
  foreground: "#EEF2FF",
  card: "#080D1A",
  cardForeground: "#EEF2FF",
  muted: "#0A0F1E",
  mutedForeground: "#5B7A9A",
  destructive: "#EF4444",
  destructiveForeground: "#FFFFFF",
  input: "#080D1A",
  surface: "#060B16",
  success: "#22D3A5",
  rose: "#FF4FA3",
};

export const THEME_PALETTES: Record<Theme, Palette> = {
  // Cyber — electric cyan + purple (default)
  calm: {
    ...base,
    tint: "#00E5FF",
    primary: "#00E5FF",
    primaryForeground: "#030712",
    secondary: "#7B2FFF",
    secondaryForeground: "#FFFFFF",
    accent: "#7B2FFF",
    accentForeground: "#FFFFFF",
    border: "rgba(0,229,255,0.12)",
    streak: "#00E5FF",
  },
  // Warm — rose pink + amber
  warm: {
    ...base,
    tint: "#F43F5E",
    primary: "#F43F5E",
    primaryForeground: "#FFFFFF",
    secondary: "#F59E0B",
    secondaryForeground: "#030712",
    accent: "#F59E0B",
    accentForeground: "#030712",
    border: "rgba(244,63,94,0.15)",
    streak: "#F59E0B",
  },
  // Playful — emerald green + orange
  playful: {
    ...base,
    tint: "#22C55E",
    primary: "#22C55E",
    primaryForeground: "#030712",
    secondary: "#F97316",
    secondaryForeground: "#030712",
    accent: "#F97316",
    accentForeground: "#030712",
    border: "rgba(34,197,94,0.15)",
    streak: "#22C55E",
  },
  // Elegant — cool silver + slate
  elegant: {
    ...base,
    tint: "#CBD5E1",
    primary: "#CBD5E1",
    primaryForeground: "#030712",
    secondary: "#94A3B8",
    secondaryForeground: "#030712",
    accent: "#94A3B8",
    accentForeground: "#030712",
    border: "rgba(203,213,225,0.12)",
    streak: "#CBD5E1",
  },
};

// Kept for any legacy imports that reference `colors.light` / `colors.dark`
const colors = {
  light: THEME_PALETTES.calm,
  dark: THEME_PALETTES.calm,
  radius: 14,
};

export default colors;
