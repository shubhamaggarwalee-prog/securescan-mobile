import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { usePurchases } from '../lib/purchases';
import { COLORS, PLANS } from '../lib/theme';

const CHECKMARK = '✓';

export default function UpgradeScreen() {
  const navigation = useNavigation();
  const route      = useRoute<any>();
  const { packages, purchasing, isPro, isTeam, purchasePackage, restorePurchases } = usePurchases();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [selected, setSelected] = useState<'pro' | 'team'>('pro');

  const getPackage = (planId: 'pro' | 'team') => {
    // RevenueCat package identifiers: $rc_monthly, $rc_annual, or custom
    const suffix = billing === 'monthly' ? 'monthly' : 'annual';
    return packages.find(p =>
      p.identifier.toLowerCase().includes(planId) &&
      p.identifier.toLowerCase().includes(suffix)
    ) || packages.find(p => p.identifier.toLowerCase().includes(planId));
  };

  const handlePurchase = async () => {
    const pkg = getPackage(selected);
    if (!pkg) {
      Alert.alert('Not Available', 'This plan is not available in your region. Please try again later.');
      return;
    }
    const success = await purchasePackage(pkg);
    if (success) navigation.goBack();
  };

  const planData = [
    {
      id: 'pro' as const,
      name: 'Pro',
      badge: 'Most Popular',
      monthlyPrice: '$29',
      yearlyPrice: '$249',
      yearlyMonthly: '$20.75',
      features: [
        '100 scans / month',
        '10 monitored sites',
        'PDF security reports',
        'AI remediation summaries',
        'Email alerts',
        'Priority support',
      ],
    },
    {
      id: 'team' as const,
      name: 'Team',
      badge: 'Best Value',
      monthlyPrice: '$99',
      yearlyPrice: '$849',
      yearlyMonthly: '$70.75',
      features: [
        'Unlimited scans',
        '50 monitored sites',
        'PDF reports + AI summaries',
        'Slack alerts',
        'CI/CD webhook integration',
        'REST API access',
        'Team member management',
        'White-label reports',
      ],
    },
  ];

  if (isPro || isTeam) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.alreadyPro}>
          <Text style={styles.proIcon}>⭐</Text>
          <Text style={styles.proTitle}>You're already on {isTeam ? 'Team' : 'Pro'}!</Text>
          <Text style={styles.proBody}>All premium features are active. Thank you for your support.</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upgrade SecureScan</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.headline}>Protect more. Worry less.</Text>
        <Text style={styles.subhead}>Unlock professional security scanning for your business.</Text>

        {/* Billing toggle */}
        <View style={styles.billingToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, billing === 'monthly' && styles.toggleActive]}
            onPress={() => setBilling('monthly')}
          >
            <Text style={[styles.toggleText, billing === 'monthly' && styles.toggleActiveText]}>Monthly</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, billing === 'yearly' && styles.toggleActive]}
            onPress={() => setBilling('yearly')}
          >
            <Text style={[styles.toggleText, billing === 'yearly' && styles.toggleActiveText]}>Yearly</Text>
            <View style={styles.saveBadge}><Text style={styles.saveText}>Save 30%</Text></View>
          </TouchableOpacity>
        </View>

        {/* Plan cards */}
        {planData.map(plan => {
          const isSelected = selected === plan.id;
          const price = billing === 'monthly' ? plan.monthlyPrice : plan.yearlyMonthly;
          return (
            <TouchableOpacity
              key={plan.id}
              style={[styles.planCard, isSelected && styles.planCardSelected]}
              onPress={() => setSelected(plan.id)}
              activeOpacity={0.85}
            >
              <View style={styles.planHeader}>
                <View>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.planBadge}>
                      <Text style={styles.planBadgeText}>{plan.badge}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.priceBlock}>
                  <Text style={styles.price}>{price}</Text>
                  <Text style={styles.pricePer}>/mo</Text>
                </View>
              </View>
              {billing === 'yearly' && (
                <Text style={styles.billedAnnually}>Billed {plan.yearlyPrice}/year</Text>
              )}
              <View style={styles.featureList}>
                {plan.features.map((f, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Text style={styles.checkmark}>{CHECKMARK}</Text>
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
              {isSelected && <View style={styles.selectedBorder} />}
            </TouchableOpacity>
          );
        })}

        {/* CTA */}
        <TouchableOpacity
          style={[styles.cta, purchasing && styles.ctaDisabled]}
          onPress={handlePurchase}
          disabled={purchasing}
          activeOpacity={0.85}
        >
          {purchasing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.ctaText}>
              Start {selected === 'pro' ? 'Pro' : 'Team'} — {billing === 'monthly'
                ? (selected === 'pro' ? '$29/mo' : '$99/mo')
                : (selected === 'pro' ? '$249/yr' : '$849/yr')}
            </Text>
          )}
        </TouchableOpacity>

        {/* Legal — REQUIRED for App Store */}
        <View style={styles.legal}>
          <Text style={styles.legalText}>
            Payment will be charged to your {Platform.OS === 'ios' ? 'Apple ID' : 'Google Play'} account at confirmation.
            Subscription automatically renews unless cancelled at least 24 hours before the end of the current period.
            You can manage or cancel your subscription in your {Platform.OS === 'ios' ? 'App Store account settings' : 'Google Play account'}.
          </Text>

          <TouchableOpacity onPress={restorePurchases} disabled={purchasing}>
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </TouchableOpacity>

          <View style={styles.legalLinks}>
            <TouchableOpacity onPress={() => (navigation as any).navigate('PrivacyPolicy')}>
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.legalSep}> · </Text>
            <TouchableOpacity onPress={() => (navigation as any).navigate('Terms')}>
              <Text style={styles.legalLink}>Terms of Service</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: COLORS.bg },
  header:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  closeBtn:          { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  closeText:         { fontSize: 18, color: COLORS.text3 },
  headerTitle:       { fontSize: 17, fontWeight: '700', color: COLORS.text },
  content:           { padding: 20, paddingBottom: 48 },
  headline:          { fontSize: 26, fontWeight: '900', color: COLORS.text, textAlign: 'center', marginBottom: 8 },
  subhead:           { fontSize: 15, color: COLORS.text2, textAlign: 'center', marginBottom: 24 },
  billingToggle:     { flexDirection: 'row', backgroundColor: COLORS.bg3, borderRadius: 12, padding: 4, marginBottom: 20 },
  toggleBtn:         { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  toggleActive:      { backgroundColor: COLORS.bg2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  toggleText:        { fontSize: 14, fontWeight: '600', color: COLORS.text3 },
  toggleActiveText:  { color: COLORS.text },
  saveBadge:         { backgroundColor: COLORS.low, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  saveText:          { color: '#fff', fontSize: 10, fontWeight: '700' },
  planCard:          { backgroundColor: COLORS.bg2, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 2, borderColor: COLORS.border },
  planCardSelected:  { borderColor: COLORS.primary },
  planHeader:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  planName:          { fontSize: 20, fontWeight: '800', color: COLORS.text },
  badgeRow:          { flexDirection: 'row', marginTop: 4 },
  planBadge:         { backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  planBadgeText:     { color: COLORS.primary, fontSize: 11, fontWeight: '700' },
  priceBlock:        { flexDirection: 'row', alignItems: 'flex-end' },
  price:             { fontSize: 28, fontWeight: '900', color: COLORS.text },
  pricePer:          { fontSize: 13, color: COLORS.text3, marginBottom: 4, marginLeft: 2 },
  billedAnnually:    { fontSize: 12, color: COLORS.text3, marginBottom: 12 },
  featureList:       { marginTop: 14, gap: 8 },
  featureRow:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkmark:         { color: COLORS.low, fontSize: 14, fontWeight: '700' },
  featureText:       { fontSize: 14, color: COLORS.text2 },
  selectedBorder:    { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 16, borderWidth: 2, borderColor: COLORS.primary },
  cta:               { backgroundColor: COLORS.primary, borderRadius: 14, padding: 17, alignItems: 'center', marginTop: 8, marginBottom: 24 },
  ctaDisabled:       { opacity: 0.6 },
  ctaText:           { color: '#fff', fontSize: 17, fontWeight: '800' },
  legal:             { alignItems: 'center', gap: 12 },
  legalText:         { fontSize: 11, color: COLORS.text3, textAlign: 'center', lineHeight: 16 },
  restoreText:       { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  legalLinks:        { flexDirection: 'row', alignItems: 'center' },
  legalLink:         { fontSize: 12, color: COLORS.primary },
  legalSep:          { fontSize: 12, color: COLORS.text3 },
  alreadyPro:        { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  proIcon:           { fontSize: 64, marginBottom: 20 },
  proTitle:          { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 12, textAlign: 'center' },
  proBody:           { fontSize: 16, color: COLORS.text2, textAlign: 'center', lineHeight: 24 },
  doneBtn:           { marginTop: 32, backgroundColor: COLORS.primary, paddingHorizontal: 40, paddingVertical: 14, borderRadius: 12 },
  doneBtnText:       { color: '#fff', fontSize: 16, fontWeight: '700' },
});
