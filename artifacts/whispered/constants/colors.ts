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
  text: "#FFFFFF",
  background: "#0A1628",
  foreground: "#FFFFFF",
  card: "rgba(20, 40, 70, 0.6)",
  cardForeground: "#FFFFFF",
  muted: "rgba(30, 60, 100, 0.4)",
  mutedForeground: "#94A3B8",
  destructive: "#EF4444",
  destructiveForeground: "#FFFFFF",
  input: "rgba(30, 60, 100, 0.5)",
  surface: "rgba(15, 35, 65, 0.5)",
  success: "#22D3A5",
  rose: "#FF4FA3",
};

export const THEME_PALETTES: Record<Theme, Palette> = {
  // Ocean — deep ocean blues + white (default)
  calm: {
    ...base,
    tint: "#0EA5E9",
    primary: "#0EA5E9",
    primaryForeground: "#FFFFFF",
    secondary: "#06B6D4",
    secondaryForeground: "#FFFFFF",
    accent: "#38BDF8",
    accentForeground: "#FFFFFF",
    border: "rgba(14, 165, 233, 0.3)",
    streak: "#0EA5E9",
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
