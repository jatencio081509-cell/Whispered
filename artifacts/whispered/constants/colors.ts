import type { Theme } from "@/context/AppContext";

export interface Palette {
  text: string;
  tint: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  chatBoxes: string;
  chatBoxesForeground: string;
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

export interface CustomColors {
  text?: string;
  tint?: string;
  background?: string;
  foreground?: string;
  card?: string;
  cardForeground?: string;
  primary?: string;
  primaryForeground?: string;
  chatBoxes?: string;
  chatBoxesForeground?: string;
  muted?: string;
  mutedForeground?: string;
  accent?: string;
  accentForeground?: string;
  destructive?: string;
  destructiveForeground?: string;
  border?: string;
  input?: string;
  surface?: string;
  streak?: string;
  success?: string;
  rose?: string;
}

const base: Omit<Palette, "primary" | "primaryForeground" | "chatBoxes" | "chatBoxesForeground" | "accent" | "accentForeground" | "border" | "tint" | "streak"> = {
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
  // Ocean — deep ocean blues + white
  ocean: {
    ...base,
    tint: "#0EA5E9",
    primary: "#0EA5E9",
    primaryForeground: "#FFFFFF",
    chatBoxes: "#06B6D4",
    chatBoxesForeground: "#FFFFFF",
    accent: "#38BDF8",
    accentForeground: "#FFFFFF",
    border: "rgba(14, 165, 233, 0.3)",
    streak: "#0EA5E9",
  },
  // Romance — soft pinks + rose
  romance: {
    ...base,
    tint: "#F43F5E",
    primary: "#F43F5E",
    primaryForeground: "#FFFFFF",
    chatBoxes: "#F472B6",
    chatBoxesForeground: "#FFFFFF",
    accent: "#FB7185",
    accentForeground: "#FFFFFF",
    border: "rgba(244,63,94,0.2)",
    streak: "#F43F5E",
  },
  // Futuristic — cyan + dark (current theme)
  futuristic: {
    ...base,
    tint: "#00E5FF",
    primary: "#00E5FF",
    primaryForeground: "#000000",
    chatBoxes: "#00E5FF",
    chatBoxesForeground: "#000000",
    accent: "#00FFFF",
    accentForeground: "#000000",
    border: "rgba(0, 229, 255, 0.3)",
    streak: "#00E5FF",
  },
  // Simplistic — clean grays + white
  simplistic: {
    ...base,
    tint: "#6B7280",
    primary: "#6B7280",
    primaryForeground: "#FFFFFF",
    chatBoxes: "#9CA3AF",
    chatBoxesForeground: "#FFFFFF",
    accent: "#D1D5DB",
    accentForeground: "#000000",
    border: "rgba(107,114,128,0.2)",
    streak: "#6B7280",
  },
  // Nature — forest greens + earth tones
  nature: {
    ...base,
    tint: "#22C55E",
    primary: "#22C55E",
    primaryForeground: "#FFFFFF",
    chatBoxes: "#4ADE80",
    chatBoxesForeground: "#FFFFFF",
    accent: "#86EFAC",
    accentForeground: "#000000",
    border: "rgba(34,197,94,0.3)",
    streak: "#22C55E",
  },
};

// Kept for any legacy imports that reference `colors.light` / `colors.dark`
const colors = {
  light: THEME_PALETTES.ocean,
  dark: THEME_PALETTES.futuristic,
  radius: 14,
};

export default colors;
