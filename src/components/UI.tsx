import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, useColorScheme, ViewStyle, TextStyle,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, GRADE_COLOR, SEVERITY_CONFIG } from '../lib/theme';

// ── useTheme hook ─────────────────────────────────────────────────────────────
export function useTheme() {
  const scheme = useColorScheme();
  const dark   = scheme === 'dark';
  return {
    dark,
    colors: {
      bg:      dark ? COLORS.darkBg      : COLORS.bg,
      bg2:     dark ? COLORS.darkBg2     : COLORS.bg2,
      bg3:     dark ? COLORS.darkBg3     : COLORS.bg3,
      text:    dark ? COLORS.darkText    : COLORS.text,
      text2:   dark ? COLORS.darkText2   : COLORS.text2,
      text3:   dark ? COLORS.darkText3   : COLORS.text3,
      border:  dark ? COLORS.darkBorder  : COLORS.border,
      primary: COLORS.primary,
    },
  };
}

// ── Logo ─────────────────────────────────────────────────────────────────────
export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const { colors } = useTheme();
  const iconSize = { sm: 32, md: 42, lg: 56 }[size];
  const fontSize = { sm: 14, md: 18, lg: 24 }[size];
  const tagSize  = { sm: 9,  md: 10, lg: 11 }[size];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={[styles.logoIcon, { width: iconSize, height: iconSize, borderRadius: iconSize * 0.27 }]}>
        <Text style={{ fontSize: iconSize * 0.5 }}>⚡</Text>
      </View>
      <View>
        <Text style={[styles.logoName, { fontSize, color: colors.text }]}>SECURESCAN</Text>
        <Text style={[styles.logoTag, { fontSize: tagSize }]}>WEBSITE SECURITY SCANNER</Text>
      </View>
    </View>
  );
}

// ── ScoreRing ─────────────────────────────────────────────────────────────────
export function ScoreRing({ score, grade, size = 120 }: { score: number; grade: string; size?: number }) {
  const { dark } = useTheme();
  const r    = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const fill = circ - (score / 100) * circ;
  const col  = GRADE_COLOR(grade, dark);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={dark ? 'rgba(255,255,255,0.06)' : '#e8edf2'} strokeWidth={9} />
        <Circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={col} strokeWidth={9}
          strokeDasharray={circ} strokeDashoffset={fill}
          strokeLinecap="round" />
      </Svg>
      <View style={StyleSheet.absoluteFillObject as ViewStyle}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: 'Courier', fontSize: size * 0.26, fontWeight: '900', color: col }}>{grade}</Text>
          <Text style={{ fontFamily: 'Courier', fontSize: size * 0.1, color: '#7a8fa6', marginTop: 2 }}>{score}/100</Text>
        </View>
      </View>
    </View>
  );
}

// ── SeverityBadge ─────────────────────────────────────────────────────────────
export function SeverityBadge({ severity }: { severity: string }) {
  const cfg = (SEVERITY_CONFIG as any)[severity] || SEVERITY_CONFIG.low;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.color }]}>
      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

// ── GradeCircle ───────────────────────────────────────────────────────────────
export function GradeCircle({ grade, score, size = 48 }: { grade: string; score: number; size?: number }) {
  const { dark } = useTheme();
  const col = GRADE_COLOR(grade, dark);
  return (
    <View style={[styles.gradeCircle, { width: size, height: size, borderRadius: size / 2, borderColor: col }]}>
      <Text style={[styles.gradeLetter, { color: col, fontSize: size * 0.35 }]}>{grade}</Text>
      <Text style={[styles.gradeScore, { color: '#7a8fa6', fontSize: size * 0.18 }]}>{score}</Text>
    </View>
  );
}

// ── PrimaryButton ─────────────────────────────────────────────────────────────
export function PrimaryButton({
  title, onPress, loading, disabled, style, variant = 'primary'
}: {
  title: string; onPress: () => void; loading?: boolean;
  disabled?: boolean; style?: ViewStyle; variant?: 'primary' | 'secondary' | 'danger';
}) {
  const bg = variant === 'danger' ? COLORS.critical
           : variant === 'secondary' ? 'transparent' : COLORS.primary;
  const border = variant === 'secondary' ? COLORS.border : bg;
  const textColor = variant === 'secondary' ? COLORS.text2 : '#fff';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.btn, { backgroundColor: bg, borderColor: border, opacity: (disabled || loading) ? 0.5 : 1 }, style]}
      activeOpacity={0.85}
    >
      {loading
        ? <ActivityIndicator color={textColor} size="small" />
        : <Text style={[styles.btnText, { color: textColor }]}>{title}</Text>
      }
    </TouchableOpacity>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.bg2, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({
  placeholder, value, onChangeText, secureTextEntry, autoCapitalize, keyboardType, style, label
}: any) {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: 14 }}>
      {label && <Text style={[styles.inputLabel, { color: colors.text3 }]}>{label}</Text>}
      <View style={[styles.input, { backgroundColor: colors.bg3, borderColor: colors.border }]}>
        <Text
          style={{ color: colors.text, fontSize: 15, fontFamily: 'Courier', flex: 1 }}
          // Note: In real app this is a TextInput — simplified for display
        >{value || placeholder}</Text>
      </View>
    </View>
  );
}

// ── SectionHeader ─────────────────────────────────────────────────────────────
export function SectionHeader({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.sectionHeader, { color: colors.text3 }]}>{title}</Text>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      {subtitle && <Text style={[styles.emptySub, { color: colors.text3 }]}>{subtitle}</Text>}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  logoIcon: { backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
              shadowColor: COLORS.primary, shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  logoName: { fontFamily: 'Courier', fontWeight: '800', letterSpacing: 1.5 },
  logoTag:  { fontFamily: 'Courier', color: COLORS.primary, letterSpacing: 0.8, marginTop: 2 },

  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  badgeText: { fontFamily: 'Courier', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },

  gradeCircle: { borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  gradeLetter: { fontFamily: 'Courier', fontWeight: '900', lineHeight: undefined },
  gradeScore:  { fontFamily: 'Courier', marginTop: 1 },

  btn: { borderRadius: 12, paddingVertical: 15, paddingHorizontal: 24,
         alignItems: 'center', justifyContent: 'center', borderWidth: 1.5,
         shadowColor: COLORS.primary, shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  btnText: { fontFamily: 'Courier', fontWeight: '800', fontSize: 14, letterSpacing: 0.5 },

  card: { borderRadius: 14, padding: 18, borderWidth: 1,
          shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },

  input: { borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row' },
  inputLabel: { fontFamily: 'Courier', fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 6, textTransform: 'uppercase' },

  sectionHeader: { fontFamily: 'Courier', fontSize: 11, fontWeight: '700', letterSpacing: 1.5,
                   textTransform: 'uppercase', marginBottom: 12, marginTop: 8 },

  empty: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyIcon:  { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontFamily: 'Courier', fontSize: 16, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptySub:   { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
