export const HIGH_SCORE_KEY = "speed_clicker_high_score_v1";

export const COLORS = {
  bg: "#09090B",
  surface: "#18181B",
  surface2: "#27272A",
  border: "#27272A",
  borderStrong: "#52525B",
  text: "#FFFFFF",
  textDim: "#A1A1AA",
  brand: "#F43F5E", // coral red
  brandAccent: "#A3E635", // volt green
  brandTertiary: "#F97316", // neon orange
  warning: "#FBBF24",
};

export const SHAPES = ["circle", "square", "triangle", "star", "hexagon"] as const;
export type ShapeKind = (typeof SHAPES)[number];

export const SHAPE_PALETTE = [
  "#F43F5E", // coral
  "#A3E635", // volt green
  "#F97316", // orange
  "#FBBF24", // amber
  "#2DD4BF", // teal accent
];

export const DURATION_OPTIONS = [10, 20, 30] as const;
export type DurationOption = (typeof DURATION_OPTIONS)[number];