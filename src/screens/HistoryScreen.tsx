import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { listScans, deleteScan } from '../lib/api';
import { COLORS, GRADE_COLOR } from '../lib/theme';
import { formatDistanceToNow } from 'date-fns';

export default function HistoryScreen() {
  const navigation = useNavigation<any>();
  const [scans,    setScans]    = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,    setError]    = useState('');

  const loadScans = async () => {
    try {
      setError('');
      const data = await listScans();
      setScans(data.scans || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load scan history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadScans(); }, []));

  const onRefresh = () => { setRefreshing(true); loadScans(); };

  const handleDelete = (scanId: string) => {
    Alert.alert('Delete Scan', 'Remove this scan from your history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteScan(scanId);
            setScans(prev => prev.filter(s => s.id !== scanId));
          } catch { Alert.alert('Error', 'Could not delete scan'); }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: any }) => {
    const gradeColor = GRADE_COLOR(item.grade);
    const timeAgo    = item.created_at
      ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true })
      : '';
    const counts = item.severity_counts || {};

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ScanResult', { scanId: item.id })}
        onLongPress={() => handleDelete(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.cardLeft}>
          <View style={[styles.gradeCircle, { borderColor: gradeColor }]}>
            <Text style={[styles.gradeText, { color: gradeColor }]}>{item.grade}</Text>
          </View>
        </View>
        <View style={styles.cardCenter}>
          <Text style={styles.hostname} numberOfLines={1}>{item.hostname}</Text>
          <Text style={styles.timeAgo}>{timeAgo}</Text>
          <View style={styles.severityRow}>
            {counts.critical > 0 && <SevChip count={counts.critical} type="critical" />}
            {counts.high     > 0 && <SevChip count={counts.high}     type="high"     />}
            {counts.medium   > 0 && <SevChip count={counts.medium}   type="medium"   />}
            {counts.low      > 0 && <SevChip count={counts.low}      type="low"      />}
          </View>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.score}>{item.score}</Text>
          <Text style={styles.scoreLabel}>/100</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan History</Text>
        <Text style={styles.subtitle}>{scans.length} scan{scans.length !== 1 ? 's' : ''}</Text>
      </View>
      {error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadScans} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={scans}
          renderItem={renderItem}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No scans yet</Text>
              <Text style={styles.emptyBody}>Go to the Scan tab and enter any domain to get started.</Text>
            </View>
          }
          ListFooterComponent={scans.length > 0 ? (
            <Text style={styles.hint}>Long press a scan to delete it</Text>
          ) : null}
        />
      )}
    </SafeAreaView>
  );
}

function SevChip({ count, type }: { count: number; type: string }) {
  const colors: Record<string, [string, string]> = {
    critical: [COLORS.critical, COLORS.criticalBg],
    high:     [COLORS.high, COLORS.highBg],
    medium:   [COLORS.medium, COLORS.mediumBg],
    low:      [COLORS.low, COLORS.lowBg],
  };
  const [color, bg] = colors[type] || ['#888', '#f0f0f0'];
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <Text style={[styles.chipText, { color }]}>{count} {type}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.bg },
  header:       { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  title:        { fontSize: 28, fontWeight: '900', color: COLORS.text },
  subtitle:     { fontSize: 14, color: COLORS.text3 },
  list:         { padding: 16, gap: 12, paddingBottom: 32 },
  card:         { backgroundColor: COLORS.bg2, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: COLORS.border },
  cardLeft:     {},
  gradeCircle:  { width: 48, height: 48, borderRadius: 24, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  gradeText:    { fontSize: 18, fontWeight: '900' },
  cardCenter:   { flex: 1 },
  hostname:     { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  timeAgo:      { fontSize: 12, color: COLORS.text3, marginBottom: 6 },
  severityRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  chip:         { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  chipText:     { fontSize: 11, fontWeight: '700' },
  cardRight:    { alignItems: 'flex-end' },
  score:        { fontSize: 22, fontWeight: '900', color: COLORS.text },
  scoreLabel:   { fontSize: 11, color: COLORS.text3 },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText:    { color: COLORS.critical, fontSize: 15, textAlign: 'center', marginBottom: 16 },
  retryBtn:     { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  retryText:    { color: '#fff', fontWeight: '700' },
  empty:        { alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyIcon:    { fontSize: 56, marginBottom: 16 },
  emptyTitle:   { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  emptyBody:    { fontSize: 14, color: COLORS.text2, textAlign: 'center', lineHeight: 20 },
  hint:         { textAlign: 'center', color: COLORS.text3, fontSize: 12, paddingVertical: 16 },
});
