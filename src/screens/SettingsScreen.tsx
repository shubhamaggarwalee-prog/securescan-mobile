import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Switch, Alert, Linking, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../lib/AuthContext';
import { usePurchases } from '../lib/purchases';
import { COLORS, GRADE_COLOR } from '../lib/theme';

const APP_STORE_URL = 'https://apps.apple.com/app/securescan/id000000000';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=io.securescan.app';
const SUPPORT_URL = 'https://securescan.io/support';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { profile, signOut } = useAuth();
  const { isPro, isTeam, restorePurchases, customerInfo } = usePurchases();
  const [notifEmail, setNotifEmail] = useState(profile?.notification_email !== false);

  const plan = profile?.plan || 'free';
  const planLabel = isTeam ? 'Team' : isPro ? 'Pro' : 'Free';

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account, all scan history, and monitored sites. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account', style: 'destructive',
          onPress: () => WebBrowser.openBrowserAsync('https://securescan.io/delete-account'),
        },
      ]
    );
  };

  const openRateApp = () => {
    const url = Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
    Linking.openURL(url);
  };

  const manageSubscription = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('https://apps.apple.com/account/subscriptions');
    } else {
      Linking.openURL('https://play.google.com/store/account/subscriptions');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        {/* Profile section */}
        <View style={styles.section}>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{profile?.email?.[0]?.toUpperCase() || '?'}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.email}>{profile?.email}</Text>
              <View style={[styles.planBadge, { backgroundColor: isPro ? COLORS.primaryLight : COLORS.bg3 }]}>
                <Text style={[styles.planLabel, { color: isPro ? COLORS.primary : COLORS.text3 }]}>
                  {planLabel} Plan
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Scan usage */}
        <SectionTitle>Scan Usage</SectionTitle>
        <View style={styles.section}>
          <View style={styles.usageRow}>
            <Text style={styles.usageLabel}>Scans this month</Text>
            <Text style={styles.usageValue}>
              {profile?.scans_this_month || 0} / {profile?.scan_limit || 5}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill,
              { width: `${Math.min(100, ((profile?.scans_this_month || 0) / (profile?.scan_limit || 5)) * 100)}%` }
            ]} />
          </View>
        </View>

        {/* Subscription */}
        <SectionTitle>Subscription</SectionTitle>
        <View style={styles.section}>
          {!isPro ? (
            <Row label="Upgrade to Pro" icon="⭐" onPress={() => navigation.navigate('Upgrade')} highlight />
          ) : (
            <Row label="Manage Subscription" icon="💳" onPress={manageSubscription} />
          )}
          <Row label="Restore Purchases" icon="🔄" onPress={restorePurchases} />
        </View>

        {/* Notifications */}
        <SectionTitle>Notifications</SectionTitle>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Email Alerts</Text>
            <Switch
              value={notifEmail}
              onValueChange={setNotifEmail}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* App */}
        <SectionTitle>App</SectionTitle>
        <View style={styles.section}>
          <Row label="Rate SecureScan" icon="⭐" onPress={openRateApp} />
          <Row label="Share App" icon="📤" onPress={() => {
            const url = Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
            Linking.openURL(url);
          }} />
          <Row label="Contact Support" icon="💬" onPress={() => WebBrowser.openBrowserAsync(SUPPORT_URL)} />
          <Row label="What's New" icon="🆕" onPress={() => WebBrowser.openBrowserAsync('https://securescan.io/changelog')} />
        </View>

        {/* Legal - REQUIRED for App Store */}
        <SectionTitle>Legal</SectionTitle>
        <View style={styles.section}>
          <Row label="Privacy Policy" icon="🔒" onPress={() => navigation.navigate('PrivacyPolicy')} />
          <Row label="Terms of Service" icon="📄" onPress={() => navigation.navigate('Terms')} />
          <Row label="Open-Source Licenses" icon="📦" onPress={() => WebBrowser.openBrowserAsync('https://securescan.io/licenses')} />
        </View>

        {/* Account */}
        <SectionTitle>Account</SectionTitle>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={handleSignOut}>
            <Text style={[styles.rowLabel, { color: COLORS.critical }]}>Sign Out</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={handleDeleteAccount}>
            <Text style={[styles.rowLabel, { color: COLORS.critical }]}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>SecureScan v1.0.0 · io.securescan.app</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function Row({ label, icon, onPress, highlight }: { label: string; icon?: string; onPress: () => void; highlight?: boolean }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      {icon && <Text style={styles.rowIcon}>{icon}</Text>}
      <Text style={[styles.rowLabel, highlight && { color: COLORS.primary, fontWeight: '700' }]}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.bg },
  title:        { fontSize: 28, fontWeight: '900', color: COLORS.text, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.text3, textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 6 },
  section:      { backgroundColor: COLORS.bg2, marginHorizontal: 16, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  profileCard:  { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  avatar:       { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText:   { color: '#fff', fontSize: 20, fontWeight: '800' },
  profileInfo:  { flex: 1 },
  email:        { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  planBadge:    { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  planLabel:    { fontSize: 12, fontWeight: '700' },
  usageRow:     { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },
  usageLabel:   { fontSize: 14, color: COLORS.text2 },
  usageValue:   { fontSize: 14, fontWeight: '700', color: COLORS.text },
  progressBar:  { height: 4, backgroundColor: COLORS.bg3, marginHorizontal: 16, marginBottom: 14, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },
  row:          { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
  rowIcon:      { fontSize: 16, marginRight: 12, width: 22, textAlign: 'center' },
  rowLabel:     { flex: 1, fontSize: 15, color: COLORS.text },
  chevron:      { fontSize: 20, color: COLORS.text3 },
  version:      { textAlign: 'center', color: COLORS.text3, fontSize: 12, paddingVertical: 20 },
});
