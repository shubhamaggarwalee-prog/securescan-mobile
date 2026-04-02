import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, TextInput, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { listSites, addSite, deleteSite } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import { COLORS, GRADE_COLOR } from '../lib/theme';
import { formatDistanceToNow } from 'date-fns';

export default function MonitoringScreen() {
  const navigation = useNavigation<any>();
  const { profile } = useAuth();
  const [sites,      setSites]      = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newUrl,     setNewUrl]     = useState('');
  const [adding,     setAdding]     = useState(false);
  const [error,      setError]      = useState('');

  const isPro = profile?.plan === 'pro' || profile?.plan === 'team';

  const loadSites = async () => {
    try {
      const data = await listSites();
      setSites(data.sites || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load sites');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadSites(); }, []));

  const handleAddSite = async () => {
    if (!newUrl.trim()) return;
    setAdding(true);
    try {
      const data = await addSite(newUrl.trim());
      setSites(prev => [...prev, data.site]);
      setModalVisible(false);
      setNewUrl('');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to add site');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = (siteId: string, url: string) => {
    Alert.alert('Remove Site', `Stop monitoring ${url}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          try {
            await deleteSite(siteId);
            setSites(prev => prev.filter(s => s.id !== siteId));
          } catch { Alert.alert('Error', 'Could not remove site'); }
        },
      },
    ]);
  };

  const renderSite = ({ item }: { item: any }) => {
    const lastScanned = item.last_scanned_at
      ? formatDistanceToNow(new Date(item.last_scanned_at), { addSuffix: true })
      : 'Never scanned';
    const gradeColor = item.last_grade ? GRADE_COLOR(item.last_grade) : COLORS.text3;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={[styles.statusDot, { backgroundColor: item.active ? COLORS.low : COLORS.text3 }]} />
          <Text style={styles.siteUrl} numberOfLines={1}>{item.url}</Text>
          {item.last_grade && (
            <View style={[styles.gradePill, { borderColor: gradeColor }]}>
              <Text style={[styles.gradeText, { color: gradeColor }]}>
                {item.last_grade} {item.last_score ?? ''}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.cardBottom}>
          <Text style={styles.meta}>Last scanned: {lastScanned}</Text>
          <Text style={styles.meta}>Every {item.interval_hours}h</Text>
          <TouchableOpacity onPress={() => handleDelete(item.id, item.url)} style={styles.deleteBtn}>
            <Text style={styles.deleteText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Monitoring</Text>
        {isPro && (
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.addBtnText}>+ Add Site</Text>
          </TouchableOpacity>
        )}
      </View>

      {!isPro ? (
        <View style={styles.upsell}>
          <Text style={styles.upsellIcon}>👁</Text>
          <Text style={styles.upsellTitle}>Continuous Monitoring</Text>
          <Text style={styles.upsellBody}>Automatically scan your websites every 24 hours and get instant alerts when your security score drops.</Text>
          <TouchableOpacity style={styles.upgradeBtn} onPress={() => navigation.navigate('Upgrade')}>
            <Text style={styles.upgradeBtnText}>Upgrade to Pro</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sites}
          renderItem={renderSite}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadSites(); }} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>👁</Text>
              <Text style={styles.emptyTitle}>No sites monitored</Text>
              <Text style={styles.emptyBody}>Tap "+ Add Site" to start monitoring a domain.</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Site to Monitor</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="https://example.com"
            placeholderTextColor={COLORS.text3}
            value={newUrl}
            onChangeText={setNewUrl}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.confirmBtn, adding && { opacity: 0.6 }]}
            onPress={handleAddSite}
            disabled={adding}
          >
            {adding ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>Start Monitoring</Text>}
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.bg },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  title:         { fontSize: 28, fontWeight: '900', color: COLORS.text },
  addBtn:        { backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addBtnText:    { color: '#fff', fontWeight: '700', fontSize: 14 },
  list:          { padding: 16, gap: 12 },
  card:          { backgroundColor: COLORS.bg2, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  cardTop:       { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  statusDot:     { width: 8, height: 8, borderRadius: 4 },
  siteUrl:       { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.text },
  gradePill:     { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  gradeText:     { fontSize: 12, fontWeight: '800' },
  cardBottom:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  meta:          { fontSize: 12, color: COLORS.text3 },
  deleteBtn:     { marginLeft: 'auto' as any },
  deleteText:    { fontSize: 12, color: COLORS.critical, fontWeight: '600' },
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
  modal:         { flex: 1, backgroundColor: COLORS.bg2, padding: 24, paddingTop: 40 },
  modalHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle:    { fontSize: 20, fontWeight: '800', color: COLORS.text },
  closeText:     { fontSize: 20, color: COLORS.text3 },
  input:         { backgroundColor: COLORS.bg3, borderRadius: 12, padding: 16, fontSize: 15, color: COLORS.text, marginBottom: 16 },
  confirmBtn:    { backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, alignItems: 'center' },
  confirmText:   { color: '#fff', fontSize: 16, fontWeight: '800' },
});
