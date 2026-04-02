import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { listAlerts, markAllAlertsRead } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import { COLORS } from '../lib/theme';
import { formatDistanceToNow } from 'date-fns';

const ALERT_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  score_drop:       { icon: '📉', color: COLORS.high,     bg: COLORS.highBg },
  critical_finding: { icon: '🚨', color: COLORS.critical, bg: COLORS.criticalBg },
  cert_expiry:      { icon: '🔐', color: COLORS.medium,   bg: COLORS.mediumBg },
  scan_complete:    { icon: '✅', color: COLORS.low,      bg: COLORS.lowBg },
};

export default function AlertsScreen() {
  const navigation = useNavigation<any>();
  const { profile } = useAuth();
  const [alerts,    setAlerts]    = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isPro = profile?.plan === 'pro' || profile?.plan === 'team';

  const loadAlerts = async () => {
    if (!isPro) { setLoading(false); return; }
    try {
      const data = await listAlerts();
      setAlerts(data.alerts || []);
    } catch {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadAlerts(); }, []));

  const handleMarkAllRead = async () => {
    try {
      await markAllAlertsRead();
      setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    } catch {}
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  const renderAlert = ({ item }: { item: any }) => {
    const cfg = ALERT_CONFIG[item.type] || ALERT_CONFIG.scan_complete;
    const timeAgo = item.sent_at
      ? formatDistanceToNow(new Date(item.sent_at), { addSuffix: true })
      : '';
    return (
      <View style={[styles.card, !item.read && styles.cardUnread, { borderLeftColor: cfg.color }]}>
        <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
          <Text style={styles.icon}>{cfg.icon}</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.time}>{timeAgo}</Text>
        </View>
        {!item.read && <View style={[styles.unreadDot, { backgroundColor: cfg.color }]} />}
      </View>
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Alerts</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markRead}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {!isPro ? (
        <View style={styles.upsell}>
          <Text style={styles.upsellIcon}>🔔</Text>
          <Text style={styles.upsellTitle}>Security Alerts</Text>
          <Text style={styles.upsellBody}>
            Get instant notifications when your site's security score drops, a critical vulnerability is found, or your SSL certificate is about to expire.
          </Text>
          <TouchableOpacity style={styles.upgradeBtn} onPress={() => navigation.navigate('Upgrade')}>
            <Text style={styles.upgradeBtnText}>Upgrade to Pro</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={alerts}
          renderItem={renderAlert}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadAlerts(); }} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyTitle}>No alerts yet</Text>
              <Text style={styles.emptyBody}>Alerts will appear here when monitoring detects security changes.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.bg },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  title:         { fontSize: 28, fontWeight: '900', color: COLORS.text },
  markRead:      { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  list:          { padding: 16, gap: 10 },
  card:          { backgroundColor: COLORS.bg2, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderLeftWidth: 3, borderWidth: 1, borderColor: COLORS.border },
  cardUnread:    { backgroundColor: COLORS.primaryLight },
  iconWrap:      { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  icon:          { fontSize: 18 },
  cardBody:      { flex: 1 },
  message:       { fontSize: 14, color: COLORS.text, lineHeight: 20, marginBottom: 4 },
  time:          { fontSize: 12, color: COLORS.text3 },
  unreadDot:     { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  center:        { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty:         { alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyIcon:     { fontSize: 56, marginBottom: 16 },
  emptyTitle:    { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  emptyBody:     { fontSize: 14, color: COLORS.text2, textAlign: 'center', lineHeight: 20 },
  upsell:        { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  upsellIcon:    { fontSize: 64, marginBottom: 20 },
  upsellTitle:   { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 12, textAlign: 'center' },
  upsellBody:    { fontSize: 15, color: COLORS.text2, textAlign: 'center', lineHeight: 23, marginBottom: 28 },
  upgradeBtn:    { backgroundColor: COLORS.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  upgradeBtnText:{ color: '#fff', fontSize: 16, fontWeight: '800' },
});
