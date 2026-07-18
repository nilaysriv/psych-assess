// Validated via the dataviz skill's validate_palette.js (all checks pass,
// light + dark) as a 4-color categorical/status set, plus a desaturated
// neutral fallback. "orange" was dropped from the severity-band color
// options because it sat too close to amber for deuteranopia (CVD ΔE 8.7,
// below the safe floor).
export const SEVERITY_COLOR_NAMES = ["green", "amber", "red", "blue", "neutral"] as const;
export type SeverityColorName = (typeof SEVERITY_COLOR_NAMES)[number];

export const SEVERITY_COLOR_HEX: Record<SeverityColorName, string> = {
  green: "#16a34a",
  amber: "#d97706",
  red: "#dc2626",
  blue: "#2563eb",
  neutral: "#71717a",
};

export function severityHex(color: string | undefined): string {
  return SEVERITY_COLOR_HEX[color as SeverityColorName] ?? SEVERITY_COLOR_HEX.neutral;
}
