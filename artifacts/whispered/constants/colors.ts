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

export const THEME_PALETTES: Record<Theme, Palette> = {
  // Ocean - bright sea glass, deep navy text, translucent water panels
  ocean: {
    text: "#082F49",
    tint: "#0284C7",
    background: "#DFF7FF",
    foreground: "#082F49",
    card: "rgba(255, 255, 255, 0.74)",
    cardForeground: "#082F49",
    primary: "#0284C7",
    primaryForeground: "#FFFFFF",
    chatBoxes: "#BAE6FD",
    chatBoxesForeground: "#075985",
    muted: "rgba(186, 230, 253, 0.64)",
    mutedForeground: "#25637B",
    accent: "#14B8A6",
    accentForeground: "#042F2E",
    destructive: "#DC2626",
    destructiveForeground: "#FFFFFF",
    border: "rgba(2, 132, 199, 0.26)",
    input: "rgba(255, 255, 255, 0.82)",
    surface: "rgba(224, 242, 254, 0.78)",
    streak: "#0EA5E9",
    success: "#059669",
    rose: "#EC4899",
  },
  // Romance - candlelit blush, wine accents, soft paper-like panels
  romance: {
    text: "#4A102A",
    tint: "#BE185D",
    background: "#FFF1F5",
    foreground: "#4A102A",
    card: "rgba(255, 248, 250, 0.86)",
    cardForeground: "#4A102A",
    primary: "#BE185D",
    primaryForeground: "#FFFFFF",
    chatBoxes: "#FBCFE8",
    chatBoxesForeground: "#831843",
    muted: "rgba(252, 231, 243, 0.76)",
    mutedForeground: "#9D4568",
    accent: "#FB7185",
    accentForeground: "#FFFFFF",
    destructive: "#E11D48",
    destructiveForeground: "#FFFFFF",
    border: "rgba(190, 24, 93, 0.2)",
    input: "rgba(255, 255, 255, 0.78)",
    surface: "rgba(255, 228, 230, 0.72)",
    streak: "#E11D48",
    success: "#16A34A",
    rose: "#DB2777",
  },
  // Futuristic - dark glass, cyan circuits, high contrast neon
  futuristic: {
    text: "#FFFFFF",
    tint: "#00E5FF",
    background: "#07111F",
    foreground: "#FFFFFF",
    card: "rgba(13, 31, 55, 0.72)",
    cardForeground: "#FFFFFF",
    primary: "#00E5FF",
    primaryForeground: "#000000",
    chatBoxes: "#00E5FF",
    chatBoxesForeground: "#000000",
    muted: "rgba(24, 52, 85, 0.52)",
    mutedForeground: "#9FB6CC",
    accent: "#00FFFF",
    accentForeground: "#000000",
    destructive: "#FF4D6D",
    destructiveForeground: "#FFFFFF",
    border: "rgba(0, 229, 255, 0.3)",
    input: "rgba(15, 35, 65, 0.72)",
    surface: "rgba(8, 23, 42, 0.7)",
    streak: "#00E5FF",
    success: "#22D3A5",
    rose: "#FF4FA3",
  },
  // Simplistic - airy light mode with quiet ink and thin graphite borders
  simplistic: {
    text: "#171717",
    tint: "#404040",
    background: "#F7F7F4",
    foreground: "#171717",
    card: "rgba(255, 255, 255, 0.92)",
    cardForeground: "#171717",
    primary: "#262626",
    primaryForeground: "#FFFFFF",
    chatBoxes: "#E5E5E5",
    chatBoxesForeground: "#171717",
    muted: "rgba(229, 229, 229, 0.72)",
    mutedForeground: "#737373",
    accent: "#A3A3A3",
    accentForeground: "#171717",
    destructive: "#B91C1C",
    destructiveForeground: "#FFFFFF",
    border: "rgba(38, 38, 38, 0.12)",
    input: "rgba(255, 255, 255, 0.96)",
    surface: "rgba(245, 245, 245, 0.9)",
    streak: "#525252",
    success: "#15803D",
    rose: "#BE123C",
  },
  // Nature - moss, sage, clay, and warm parchment
  nature: {
    text: "#20351F",
    tint: "#3F7D20",
    background: "#EFF4E6",
    foreground: "#20351F",
    card: "rgba(255, 252, 237, 0.82)",
    cardForeground: "#20351F",
    primary: "#3F7D20",
    primaryForeground: "#FFFCEF",
    chatBoxes: "#D9EBC8",
    chatBoxesForeground: "#20351F",
    muted: "rgba(217, 235, 200, 0.72)",
    mutedForeground: "#64764B",
    accent: "#B7791F",
    accentForeground: "#FFF8E6",
    destructive: "#B42318",
    destructiveForeground: "#FFFFFF",
    border: "rgba(63, 125, 32, 0.22)",
    input: "rgba(255, 252, 237, 0.9)",
    surface: "rgba(230, 239, 214, 0.78)",
    streak: "#6B8E23",
    success: "#2F855A",
    rose: "#C05621",
  },
};

// Kept for any legacy imports that reference `colors.light` / `colors.dark`
const colors = {
  light: THEME_PALETTES.ocean,
  dark: THEME_PALETTES.futuristic,
  radius: 14,
};

export default colors;
