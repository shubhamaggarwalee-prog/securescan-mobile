import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getScan, downloadPdf } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import { COLORS, GRADE_COLOR } from '../lib/theme';

export default function ScanResultScreen() {
  const navigation = useNavigation<any>();
  const route      = useRoute<any>();
  const { profile } = useAuth();
  const { scanId }  = route.params;

  const [scan,       setScan]       = useState<any>(null);
  const [loading,    setLoading]    = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [expanded,   setExpanded]   = useState<Record<string, boolean>>({});

  const isPro = profile?.plan === 'pro' || profile?.plan === 'team';

  useEffect(() => {
    loadScan();
  }, [scanId]);

  const loadScan = async () => {
    try {
      const data = await getScan(scanId);
      setScan(data);
    } catch (e: any) {
      Alert.alert('Error', 'Could not load scan result');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!isPro) { navigation.navigate('Upgrade'); return; }
    setPdfLoading(true);
    try {
      const bytes = await downloadPdf(scanId);
      const path  = `${FileSystem.documentDirectory}securescan-${scan.hostname}.pdf`;
      await FileSystem.writeAsStringAsync(path, bytes, { encoding: FileSystem.EncodingType.Base64 });
      await Sharing.shareAsync(path, { mimeType: 'application/pdf' });
    } catch (e: any) {
      Alert.alert('Error', 'Could not download PDF report');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleShare = async () => {
    if (!scan) return;
    await Share.share({
      title: `SecureScan: ${scan.hostname}`,
      message: `Security report for ${scan.hostname}: Grade ${scan.grade} (${scan.score}/100)\n${scan.severity_counts?.critical || 0} critical, ${scan.severity_counts?.high || 0} high issues found.\n\nScan with SecureScan: https://securescan.io`,
    });
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  if (!scan)   return null;

  const gradeColor = GRADE_COLOR(scan.grade);
  const sev = scan.severity_counts || {};
  const cats = scan.categories || [];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.hostname} numberOfLines={1}>{scan.hostname}</Text>
        <TouchableOpacity onPress={handleShare}>
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Score card */}
        <View style={[styles.scoreCard, { borderColor: gradeColor }]}>
          <Text style={[styles.grade, { color: gradeColor }]}>{scan.grade}</Text>
          <Text style={styles.score}>{scan.score}/100</Text>
          <View style={styles.sevRow}>
            {sev.critical > 0 && <SevBadge n={sev.critical} type="critical" />}
            {sev.high     > 0 && <SevBadge n={sev.high}     type="high"     />}
            {sev.medium   > 0 && <SevBadge n={sev.medium}   type="medium"   />}
            {sev.low      > 0 && <SevBadge n={sev.low}      type="low"      />}
          </View>
        </View>

        {/* AI Summary */}
        {scan.ai_summary && (
          <View style={styles.aiCard}>
            <Text style={styles.aiLabel}>⚡ AI Summary</Text>
            <Text style={styles.aiText}>{scan.ai_summary}</Text>
          </View>
        )}

        {/* PDF button */}
        <TouchableOpacity
          style={[styles.pdfBtn, pdfLoading && { opacity: 0.6 }]}
          onPress={handleDownloadPdf}
          disabled={pdfLoading}
        >
          {pdfLoading
            ? <ActivityIndicator color={COLORS.primary} />
            : <Text style={styles.pdfBtnText}>{isPro ? '📄 Download PDF Report' : '🔒 PDF Report (Pro)'}</Text>}
        </TouchableOpacity>

        {/* Categories */}
        {cats.map((cat: any) => {
          const isOpen     = expanded[cat.id];
          const fails      = cat.findings?.filter((f: any) => f.status === 'fail') || [];
          const catColor   = cat.score >= 80 ? COLORS.low : cat.score >= 60 ? COLORS.medium : COLORS.critical;

          return (
            <View key={cat.id} style={styles.catCard}>
              <TouchableOpacity
                style={styles.catHeader}
                onPress={() => setExpanded(p => ({ ...p, [cat.id]: !p[cat.id] }))}
                activeOpacity={0.7}
              >
                <Text style={styles.catIcon}>{cat.icon}</Text>
                <Text style={styles.catName}>{cat.name}</Text>
                <View style={[styles.catScore, { backgroundColor: catColor + '22' }]}>
                  <Text style={[styles.catScoreText, { color: catColor }]}>{cat.score}</Text>
                </View>
                <Text style={styles.expandIcon}>{isOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {isOpen && cat.findings?.map((f: any, i: number) => (
                <View key={i} style={[styles.finding, f.status !== 'fail' && styles.findingPass]}>
                  <View style={styles.findingHeader}>
                    <Text style={styles.findingStatus}>{f.status === 'pass' ? '✓' : f.status === 'fail' ? '✗' : '!'}</Text>
                    <Text style={[styles.findingTitle, f.status !== 'fail' && { color: COLORS.text3 }]} numberOfLines={2}>
                      {f.title}
                    </Text>
                  </View>
                  {f.detail && f.status === 'fail' && (
                    <Text style={styles.findingDetail}>{f.detail}</Text>
                  )}
                  {f.fix && (
                    <Text style={styles.findingFix}>→ {f.fix}</Text>
                  )}
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function SevBadge({ n, type }: { n: number; type: string }) {
  const cfg: Record<string, [string, string]> = {
    critical: [COLORS.critical, COLORS.criticalBg],
    high:     [COLORS.high, COLORS.highBg],
    medium:   [COLORS.medium, COLORS.mediumBg],
    low:      [COLORS.low, COLORS.lowBg],
  };
  const [color, bg] = cfg[type] || ['#888', '#eee'];
  return (
    <View style={[styles.sevBadge, { backgroundColor: bg }]}>
      <Text style={[styles.sevText, { color }]}>{n} {type}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.bg },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  closeBtn:      { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  closeText:     { fontSize: 18, color: COLORS.text3 },
  hostname:      { flex: 1, fontSize: 16, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginHorizontal: 8 },
  shareText:     { fontSize: 15, color: COLORS.primary, fontWeight: '600' },
  content:       { padding: 16, gap: 12, paddingBottom: 40 },
  scoreCard:     { backgroundColor: COLORS.bg2, borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 2 },
  grade:         { fontSize: 56, fontWeight: '900', fontFamily: 'monospace' },
  score:         { fontSize: 22, fontWeight: '700', color: COLORS.text, marginTop: 4 },
  sevRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12, justifyContent: 'center' },
  sevBadge:      { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  sevText:       { fontSize: 12, fontWeight: '700' },
  aiCard:        { backgroundColor: COLORS.primaryLight, borderRadius: 12, padding: 14, borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  aiLabel:       { fontSize: 12, fontWeight: '700', color: COLORS.primary, marginBottom: 6 },
  aiText:        { fontSize: 14, color: COLORS.text2, lineHeight: 20 },
  pdfBtn:        { backgroundColor: COLORS.bg2, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  pdfBtnText:    { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  catCard:       { backgroundColor: COLORS.bg2, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  catHeader:     { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  catIcon:       { fontSize: 20, width: 28, textAlign: 'center' },
  catName:       { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.text },
  catScore:      { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  catScoreText:  { fontSize: 13, fontWeight: '800' },
  expandIcon:    { fontSize: 12, color: COLORS.text3 },
  finding:       { borderTopWidth: 1, borderTopColor: COLORS.border, padding: 12, paddingLeft: 16 },
  findingPass:   { opacity: 0.55 },
  findingHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  findingStatus: { fontSize: 14, fontWeight: '800', width: 16, color: COLORS.text },
  findingTitle:  { flex: 1, fontSize: 13, fontWeight: '600', color: COLORS.text },
  findingDetail: { fontSize: 12, color: COLORS.text2, marginTop: 4, marginLeft: 24, lineHeight: 18 },
  findingFix:    { fontSize: 12, color: COLORS.low, marginTop: 4, marginLeft: 24, fontStyle: 'italic', lineHeight: 18 },
  center:        { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
