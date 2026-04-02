import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};

export const API_BASE   = extra.apiUrl         || 'https://YOUR-RAILWAY-URL.up.railway.app';
export const SUPA_URL   = extra.supabaseUrl    || 'https://YOUR-PROJECT.supabase.co';
export const SUPA_KEY   = extra.supabaseAnonKey || 'YOUR-SUPABASE-ANON-KEY';
export const STRIPE_KEY = extra.stripePublishableKey || 'pk_test_YOUR-KEY';

export const COLORS = {
  // Primary
  primary:    '#0077cc',
  primary2:   '#005fa3',
  primaryLight:'#e8f3fb',
  // Backgrounds (light)
  bg:     '#f0f4f8',
  bg2:    '#ffffff',
  bg3:    '#e8edf2',
  bg4:    '#dde3ea',
  // Text (light)
  text:   '#0f1923',
  text2:  '#3a4a5c',
  text3:  '#7a8fa6',
  // Borders
  border: '#d0d9e3',
  // Severity
  critical: '#d9002e',  criticalBg: '#fff0f3',
  high:     '#c44b00',  highBg:     '#fff5ee',
  medium:   '#8a6000',  mediumBg:   '#fffbea',
  low:      '#007a33',  lowBg:      '#edfff4',
  // Grades
  gradeA: '#007a33', gradeB: '#2e7d32', gradeC: '#8a6000',
  gradeD: '#c44b00', gradeF: '#d9002e',
  // Dark theme
  darkBg:     '#080c10',
  darkBg2:    '#0d1117',
  darkBg3:    '#161b22',
  darkText:   '#ffffff',
  darkText2:  'rgba(255,255,255,0.72)',
  darkText3:  'rgba(255,255,255,0.38)',
  darkBorder: 'rgba(255,255,255,0.09)',
  darkCritical: '#ff2d55', darkCriticalBg: 'rgba(255,45,85,0.12)',
  darkHigh:     '#ff6b35', darkHighBg:     'rgba(255,107,53,0.12)',
  darkMedium:   '#ffd60a', darkMediumBg:   'rgba(255,214,10,0.12)',
  darkLow:      '#30d158', darkLowBg:      'rgba(48,209,88,0.12)',
  darkGradeA: '#30d158', darkGradeB: '#34c759', darkGradeC: '#ffd60a',
  darkGradeD: '#ff9f0a', darkGradeF: '#ff2d55',
};

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    scans: 5,
    sites: 1,
    features: ['5 scans/month', '1 monitored site', 'Basic reports'],
  },
  pro: {
    name: 'Pro',
    monthlyPrice: 29,
    yearlyPrice: 249,
    scans: 100,
    sites: 10,
    features: ['100 scans/month', '10 monitored sites', 'PDF reports', 'AI summaries', 'Email alerts', 'Priority support'],
  },
  team: {
    name: 'Team',
    monthlyPrice: 99,
    yearlyPrice: 849,
    scans: 9999,
    sites: 50,
    features: ['Unlimited scans', '50 monitored sites', 'PDF reports', 'AI summaries', 'Slack alerts', 'CI/CD webhooks', 'API access'],
  },
};

export const SEVERITY_CONFIG = {
  critical: { label: 'CRITICAL', color: COLORS.critical, bg: COLORS.criticalBg },
  high:     { label: 'HIGH',     color: COLORS.high,     bg: COLORS.highBg },
  medium:   { label: 'MEDIUM',   color: COLORS.medium,   bg: COLORS.mediumBg },
  low:      { label: 'LOW',      color: COLORS.low,      bg: COLORS.lowBg },
};

export const GRADE_COLOR = (grade: string, dark = false) => {
  const map = dark
    ? { A: COLORS.darkGradeA, B: COLORS.darkGradeB, C: COLORS.darkGradeC, D: COLORS.darkGradeD, F: COLORS.darkGradeF }
    : { A: COLORS.gradeA, B: COLORS.gradeB, C: COLORS.gradeC, D: COLORS.gradeD, F: COLORS.gradeF };
  return (map as any)[grade] || '#888';
};
