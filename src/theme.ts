// Grab A Sip brand palette (mirrors the web "Liquid Neon" theme).
export const theme = {
  ink: "#0B0A12",
  surface: "#14121E",
  surface2: "#1C1930",
  border: "rgba(255,255,255,0.12)",
  text: "#ECEAF6",
  muted: "#A6A2BD",
  dim: "#726E88",
  lime: "#C6FF4F",
  mango: "#FFC542",
  berry: "#FF3E9A",
  aqua: "#38F5C9",
  grape: "#A855F7",
  orange: "#FF6B2C",
};

// Target fresh boxes in a festival-free month — the "full glass".
export const MONTHLY_BOXES = 26;

// Maps any plan/product name to the {fill, garnish} used by <JuiceGlass>.
const PLAN_COLORS: { match: string; fill: string; garnish: string }[] = [
  { match: "large", fill: "#C6FF4F", garnish: "#38F5C9" },
  { match: "small", fill: "#FFC542", garnish: "#FF6B2C" },
  { match: "abc", fill: "#FF3E9A", garnish: "#A855F7" },
  { match: "classic", fill: "#38F5C9", garnish: "#C6FF4F" },
];

export function planColors(planName?: string | null): { fill: string; garnish: string } {
  const n = (planName ?? "").toLowerCase();
  const hit = PLAN_COLORS.find((p) => n.includes(p.match));
  return hit ? { fill: hit.fill, garnish: hit.garnish } : { fill: "#FFC542", garnish: "#FF6B2C" };
}
