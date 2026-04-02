import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../lib/theme';

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.updated}>Last updated: January 1, 2025</Text>

        <Section title="1. Acceptance of Terms">
          {`By accessing or using SecureScan ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.`}
        </Section>

        <Section title="2. Permitted Use">
          {`SecureScan is a security scanning tool. You may only use it to scan websites and domains for which you have explicit written permission or ownership.

Prohibited uses include:
• Scanning websites without authorisation
• Using the Service to attack, disrupt, or harm any system
• Attempting to circumvent rate limits or access controls
• Sharing your account credentials with others
• Reverse engineering the application`}
        </Section>

        <Section title="3. Subscriptions & Payments">
          {`Free Plan: 5 scans per month at no charge.

Pro and Team plans are billed on a monthly or annual basis. Prices are displayed in USD.

• Payment is charged to your App Store or Google Play account at purchase confirmation
• Subscriptions automatically renew unless cancelled 24+ hours before period end
• Cancel anytime in your device's subscription management settings
• No refunds for partial subscription periods, except where required by law
• We reserve the right to change pricing with 30 days' notice`}
        </Section>

        <Section title="4. Cancellation">
          {`You may cancel your subscription at any time through:
• iOS: Settings → Apple ID → Subscriptions → SecureScan
• Android: Google Play → Subscriptions → SecureScan

Cancellation takes effect at the end of your current billing period. You retain access until then.`}
        </Section>

        <Section title="5. Disclaimer of Warranties">
          {`The Service is provided "AS IS" without warranties of any kind. SecureScan does not guarantee that:
• Scans are 100% accurate or comprehensive
• The Service will be uninterrupted or error-free
• Security findings represent all vulnerabilities

SecureScan is a diagnostic tool, not a substitute for professional security assessments.`}
        </Section>

        <Section title="6. Limitation of Liability">
          {`To the maximum extent permitted by law, SecureScan shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, even if advised of the possibility of such damages.

Our total liability shall not exceed the amount you paid in the 12 months preceding the claim.`}
        </Section>

        <Section title="7. Intellectual Property">
          {`All content, features, and functionality of the Service are owned by SecureScan and are protected by copyright, trademark, and other intellectual property laws.

You may not copy, modify, distribute, or create derivative works without prior written consent.`}
        </Section>

        <Section title="8. Termination">
          {`We reserve the right to suspend or terminate your account if you violate these Terms, engage in fraudulent activity, or misuse the Service. You may terminate your account at any time by contacting support@securescan.io.`}
        </Section>

        <Section title="9. Changes to Terms">
          {`We may modify these Terms at any time. Significant changes will be communicated via email or in-app notification. Continued use after the effective date constitutes acceptance.`}
        </Section>

        <Section title="10. Governing Law">
          {`These Terms are governed by the laws of the United Kingdom. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.`}
        </Section>

        <Section title="11. Contact">
          {`SecureScan\nEmail: legal@securescan.io\nWebsite: https://securescan.io/terms`}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.bg2 },
  content:      { padding: 20, paddingBottom: 48 },
  title:        { fontSize: 26, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  updated:      { fontSize: 13, color: COLORS.text3, marginBottom: 24 },
  section:      { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  sectionBody:  { fontSize: 14, color: COLORS.text2, lineHeight: 22 },
});
