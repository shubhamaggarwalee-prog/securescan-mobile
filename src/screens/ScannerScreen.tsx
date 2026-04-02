import React, { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Animated, Share } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { api, pollScan } from "../lib/api";
import { COLORS, GRADE_COLOR, SEV_COLOR, SEV_BG } from "../lib/config";
import { useAuth } from "../lib/AuthContext";

const STEPS = [
  "SSL / TLS Certificates", "TLS Deep Analysis", "Security Headers",
  "Content Security", "DNS & Email", "Sensitive Files",
  "Open Ports", "CORS Policy", "WAF & Rate Limiting",
  "Server Fingerprinting", "API & Injection", "Finalising report…"
];

function ScoreRing({ score, grade }: { score: number; grade: string }) {
  const r = 52, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color  = GRADE_COLOR(grade);
  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={130} height={130} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={65} cy={65} r={r} fill="none" stroke={COLORS.bg3} strokeWidth={9} />
        <Circle cx={65} cy={65} r={r} fill="none" stroke={color} strokeWidth={9}
          strokeDasharray={`${circ} ${circ}`} strokeDashoffset={offset} strokeLinecap="round" />
      </Svg>
      <View style={{ position: "absolute", top: 35, alignItems: "center" }}>
        <Text style={{ fontFamily: "Courier New", fontSize: 34, fontWeight: "900", color }}>{grade}</Text>
        <Text style={{ fontFamily: "Courier New", fontSize: 11, color: COLORS.text3 }}>{score}/100</Text>
      </View>
    </View>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  return (
    <View style={{ backgroundColor: SEV_BG(severity), borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
      <Text style={{ fontFamily: "Courier New", fontSize: 9, fontWeight: "800", color: SEV_COLOR(severity) }}>
        {severity.toUpperCase()}
      </Text>
    </View>
  );
}

export default function ScannerScreen() {
  const { profile } = useAuth();
  const [url, setUrl]           = useState("");
  const [scanning, setScanning] = useState(false);
  const [stepIdx, setStepIdx]   = useState(0);
  const [result, setResult]     = useState<any>(null);
  const [expanded, setExpanded] = useState<Record<string,boolean>>({});
  const stepTimer = useRef<any>(null);

  async function startScan() {
    const clean = url.trim();
    if (!clean) { Alert.alert("Required", "Enter a URL to scan."); return; }
    setScanning(true); setResult(null); setStepIdx(0);
    stepTimer.current = setInterval(() => setStepIdx(i => Math.min(i + 1, STEPS.length - 1)), 3000);
    try {
      const { scan_id } = await api.startScan(clean);
      const data = await pollScan(scan_id);
      setResult(data);
    } catch (err: any) {
      Alert.alert("Scan Failed", err.message);
    } finally {
      clearInterval(stepTimer.current);
      setScanning(false);
    }
  }

  async function sharePdf() {
    if (!result) return;
    try {
      const url = await api.downloadPdf(result.id);
      await Share.share({ url, title: `SecureScan Report — ${result.hostname}` });
    } catch (err: any) {
      if (err.message?.includes("403")) {
        Alert.alert("Pro Feature", "Upgrade to Pro to download PDF reports.");
      } else {
        Alert.alert("Error", err.message);
      }
    }
  }

  const scansLeft = profile?.scans_remaining ?? "—";
  const plan      = profile?.plan ?? "free";

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

      {/* Usage bar */}
      <View style={s.usageBar}>
        <Text style={s.usageText}>⚡ {scansLeft} scans remaining · <Text style={{ color: COLORS.primary }}>{plan.toUpperCase()}</Text></Text>
      </View>

      {/* Input */}
      <View style={s.inputCard}>
        <Text style={s.inputLabel}>ENTER A URL TO SCAN</Text>
        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            placeholder="example.com"
            placeholderTextColor={COLORS.text3}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            onSubmitEditing={startScan}
            editable={!scanning}
          />
          <TouchableOpacity style={[s.scanBtn, scanning && { opacity: 0.5 }]} onPress={startScan} disabled={scanning}>
            {scanning ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.scanBtnText}>SCAN</Text>}
          </TouchableOpacity>
        </View>
        <Text style={s.disclaimer}>⚠ Only scan sites you own or have permission to test.</Text>
      </View>

      {/* Progress */}
      {scanning && (
        <View style={s.card}>
          <Text style={s.sectionTitle}>⚡ Scanning {url.replace(/^https?:\/\//i, "")}…</Text>
          <Text style={{ fontSize: 11, color: COLORS.text3, marginBottom: 16 }}>Running 100+ security checks</Text>
          {STEPS.map((step, i) => (
            <View key={step} style={s.stepRow}>
              <View style={[s.stepDot, { backgroundColor: i <= stepIdx ? (i < stepIdx ? COLORS.low : COLORS.primary) : COLORS.border }]} />
              <Text style={[s.stepText, i < stepIdx && { color: COLORS.low }, i === stepIdx && { color: COLORS.primary }]}>
                {step}
              </Text>
              {i < stepIdx && <Text style={{ color: COLORS.low, marginLeft: "auto", fontSize: 12 }}>✓</Text>}
            </View>
          ))}
        </View>
      )}

      {/* Result */}
      {result && (
        <>
          {/* Score */}
          <View style={[s.card, { alignItems: "center" }]}>
            <ScoreRing score={result.score} grade={result.grade} />
            <Text style={[s.hostname]}>{result.hostname}</Text>
            <View style={s.sevRow}>
              {[["critical",COLORS.critical],["high",COLORS.high],["medium",COLORS.medium],["low",COLORS.low]].map(([k,c]) => (
                <View key={k} style={s.sevCell}>
                  <Text style={[s.sevNum, { color: c as string }]}>{result.severity_counts?.[k] ?? 0}</Text>
                  <Text style={s.sevLab}>{(k as string).toUpperCase()}</Text>
                </View>
              ))}
            </View>
            <Text style={s.meta}>{result.total_checks} checks · {Math.round((result.scan_duration_ms||0)/1000)}s</Text>

            {/* PDF button */}
            <TouchableOpacity style={s.pdfBtn} onPress={sharePdf}>
              <Text style={s.pdfBtnText}>📄  Download PDF Report</Text>
            </TouchableOpacity>
          </View>

          {/* AI Summary */}
          {result.ai_summary && (
            <View style={[s.card, { borderLeftWidth: 3, borderLeftColor: COLORS.primary }]}>
              <Text style={s.aiTitle}>🤖 AI SUMMARY</Text>
              <Text style={s.aiText}>{result.ai_summary}</Text>
            </View>
          )}

          {/* Categories */}
          {(result.categories || []).map((cat: any) => {
            const fails = (cat.findings || []).filter((f: any) => f.status === "fail");
            if (!fails.length) return null;
            const catColor = cat.score >= 80 ? COLORS.low : cat.score >= 60 ? COLORS.medium : COLORS.critical;
            const isOpen   = expanded[cat.id];
            return (
              <View key={cat.id} style={s.catWrap}>
                <TouchableOpacity style={s.catHdr} onPress={() => setExpanded(e => ({ ...e, [cat.id]: !e[cat.id] }))}>
                  <Text style={s.catIcon}>{cat.icon}</Text>
                  <Text style={s.catName}>{cat.name}</Text>
                  <Text style={[s.catScore, { color: catColor }]}>{cat.score}</Text>
                  <Text style={s.chevron}>{isOpen ? "▲" : "▼"}</Text>
                </TouchableOpacity>
                {isOpen && fails.map((f: any, fi: number) => {
                  const fKey = `${cat.id}-${fi}`;
                  const fOpen = expanded[fKey];
                  return (
                    <View key={fKey} style={s.finding}>
                      <TouchableOpacity style={s.findingHdr} onPress={() => setExpanded(e => ({ ...e, [fKey]: !e[fKey] }))}>
                        <SeverityBadge severity={f.severity} />
                        <Text style={s.findingTitle} numberOfLines={fOpen ? undefined : 2}>{f.title}</Text>
                        <Text style={s.chevron}>{fOpen ? "▲" : "▼"}</Text>
                      </TouchableOpacity>
                      {fOpen && (
                        <View style={s.findingBody}>
                          <Text style={s.findingDetail}>{f.detail}</Text>
                          {f.fix && (
                            <View style={s.fixBox}>
                              <Text style={s.fixLabel}>HOW TO FIX</Text>
                              <Text style={s.fixText}>{f.fix}</Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 80 },
  usageBar: { backgroundColor: COLORS.primaryLight, borderRadius: 8, padding: 10, marginBottom: 12, alignItems: "center" },
  usageText: { fontFamily: "Courier New", fontSize: 12, color: COLORS.text2 },
  inputCard: { backgroundColor: COLORS.bg2, borderRadius: 16, padding: 20, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  inputLabel: { fontFamily: "Courier New", fontSize: 10, color: COLORS.text3, letterSpacing: 1.5, marginBottom: 10 },
  inputRow: { flexDirection: "row", gap: 8 },
  input: { flex: 1, backgroundColor: COLORS.bg3, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, padding: 13, fontSize: 15, color: COLORS.text, fontFamily: "Courier New" },
  scanBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 20, justifyContent: "center", shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  scanBtnText: { color: "#fff", fontFamily: "Courier New", fontWeight: "800", fontSize: 13 },
  disclaimer: { fontSize: 11, color: COLORS.text3, marginTop: 10 },
  card: { backgroundColor: COLORS.bg2, borderRadius: 16, padding: 20, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontFamily: "Courier New", fontWeight: "800", fontSize: 14, color: COLORS.text, marginBottom: 4 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 5 },
  stepDot: { width: 7, height: 7, borderRadius: 4 },
  stepText: { fontFamily: "Courier New", fontSize: 12, color: COLORS.text3, flex: 1 },
  hostname: { fontFamily: "Courier New", fontSize: 14, color: COLORS.primary, marginTop: 12, marginBottom: 16 },
  sevRow: { flexDirection: "row", gap: 20, marginBottom: 10 },
  sevCell: { alignItems: "center" },
  sevNum: { fontFamily: "Courier New", fontSize: 24, fontWeight: "900" },
  sevLab: { fontFamily: "Courier New", fontSize: 9, color: COLORS.text3, marginTop: 2 },
  meta: { fontFamily: "Courier New", fontSize: 11, color: COLORS.text3, marginBottom: 16 },
  pdfBtn: { borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24, alignItems: "center" },
  pdfBtnText: { color: COLORS.primary, fontWeight: "700", fontSize: 14 },
  aiTitle: { fontFamily: "Courier New", fontSize: 11, fontWeight: "800", color: COLORS.primary, letterSpacing: 1, marginBottom: 8 },
  aiText: { fontSize: 14, color: COLORS.text2, lineHeight: 22 },
  catWrap: { marginBottom: 8 },
  catHdr: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.bg2, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 12, gap: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  catIcon: { fontSize: 16 },
  catName: { fontFamily: "Courier New", fontSize: 12, fontWeight: "700", flex: 1, color: COLORS.text },
  catScore: { fontFamily: "Courier New", fontSize: 12, fontWeight: "800" },
  chevron: { fontSize: 10, color: COLORS.text3 },
  finding: { backgroundColor: COLORS.bg2, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, marginTop: 4, overflow: "hidden" },
  findingHdr: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10 },
  findingTitle: { flex: 1, fontSize: 12, color: COLORS.text2, fontFamily: "Courier New" },
  findingBody: { padding: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  findingDetail: { fontSize: 13, color: COLORS.text2, lineHeight: 20, marginBottom: 10 },
  fixBox: { backgroundColor: COLORS.lowBg, borderLeftWidth: 3, borderLeftColor: COLORS.low, borderRadius: 6, padding: 10 },
  fixLabel: { fontFamily: "Courier New", fontSize: 9, fontWeight: "800", color: COLORS.low, letterSpacing: 1.5, marginBottom: 4 },
  fixText: { fontSize: 12, color: COLORS.text2, lineHeight: 18 },
});
