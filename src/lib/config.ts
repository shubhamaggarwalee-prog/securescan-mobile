// ── UPDATE THESE THREE VALUES ────────────────────────────────────────────────
export const API_BASE        = "https://YOUR_RAILWAY_URL.up.railway.app";
export const SUPABASE_URL    = "https://YOUR_PROJECT.supabase.co";
export const SUPABASE_ANON   = "YOUR_SUPABASE_ANON_KEY";
export const REVENUECAT_KEY  = "YOUR_REVENUECAT_API_KEY"; // appl_... or goog_...
// ─────────────────────────────────────────────────────────────────────────────

export const COLORS = {
  // Brand
  primary:    "#0077cc",
  primaryDark:"#005fa3",
  primaryLight:"#e8f3fb",
  // Grays
  bg:         "#f0f4f8",
  bg2:        "#ffffff",
  bg3:        "#e8edf2",
  border:     "#d0d9e3",
  text:       "#0f1923",
  text2:      "#3a4a5c",
  text3:      "#7a8fa6",
  // Severity
  critical:   "#d9002e",
  criticalBg: "#fff0f3",
  high:       "#c44b00",
  highBg:     "#fff5ee",
  medium:     "#8a6000",
  mediumBg:   "#fffbea",
  low:        "#007a33",
  lowBg:      "#edfff4",
  // Grade
  gradeA:     "#007a33",
  gradeB:     "#2e7d32",
  gradeC:     "#8a6000",
  gradeD:     "#c44b00",
  gradeF:     "#d9002e",
  // UI
  white:      "#ffffff",
  black:      "#000000",
  shadow:     "rgba(0,0,0,0.08)",
};

export const FONTS = {
  mono: "Courier New",
  sans: "System",
};

export const PLAN_LIMITS = {
  free:  { scans: 5,    sites: 1,  pdf: false, ai: false, alerts: false },
  pro:   { scans: 100,  sites: 10, pdf: true,  ai: true,  alerts: true  },
  team:  { scans: 9999, sites: 50, pdf: true,  ai: true,  alerts: true  },
};

export const GRADE_COLOR = (g: string) => ({
  A: COLORS.gradeA, B: COLORS.gradeB, C: COLORS.gradeC,
  D: COLORS.gradeD, F: COLORS.gradeF,
}[g] || COLORS.text3);

export const SEV_COLOR = (s: string) => ({
  critical: COLORS.critical, high: COLORS.high,
  medium:   COLORS.medium,   low:  COLORS.low,
}[s] || COLORS.text3);

export const SEV_BG = (s: string) => ({
  critical: COLORS.criticalBg, high: COLORS.highBg,
  medium:   COLORS.mediumBg,   low:  COLORS.lowBg,
}[s] || COLORS.bg3);
