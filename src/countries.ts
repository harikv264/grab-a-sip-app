// Supported countries for phone login (India-first). Keep in sync with the web.
export type Country = { code: string; name: string; dial: string; flag: string };

export const COUNTRIES: Country[] = [
  { code: "IN", name: "India", dial: "91", flag: "🇮🇳" },
  { code: "US", name: "United States", dial: "1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dial: "44", flag: "🇬🇧" },
  { code: "AE", name: "UAE", dial: "971", flag: "🇦🇪" },
  { code: "AU", name: "Australia", dial: "61", flag: "🇦🇺" },
  { code: "SG", name: "Singapore", dial: "65", flag: "🇸🇬" },
  { code: "SA", name: "Saudi Arabia", dial: "966", flag: "🇸🇦" },
];

export const DEFAULT_COUNTRY = COUNTRIES[0];

export function combineE164(dial: string, national: string): string | null {
  const nd = (national || "").replace(/\D/g, "");
  if (nd.length < 6) return null;
  return `+${dial}${nd}`;
}
