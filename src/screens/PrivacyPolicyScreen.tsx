import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../lib/theme';

const LAST_UPDATED = 'January 1, 2025';

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.updated}>Last updated: {LAST_UPDATED}</Text>

        <Section title="1. Information We Collect">
          {`Account Information: When you create an account, we collect your email address and password (stored securely via Supabase authentication).

Usage Data: We collect information about how you use the app, including URLs you scan, scan results, and feature usage. This helps us improve the service.

Device Information: We may collect device type, operating system, and app version for debugging and analytics.

Payment Information: Payment processing is handled entirely by Stripe (iOS) or Google Play (Android). We never store your full credit card details.`}
        </Section>

        <Section title="2. How We Use Your Information">
          {`• Provide and operate the SecureScan service
• Send security alerts and scan result notifications
• Process payments and manage subscriptions
• Improve and personalise the app experience
• Respond to support requests
• Comply with legal obligations`}
        </Section>

        <Section title="3. Data Storage & Security">
          {`Your data is stored on Supabase infrastructure with industry-standard encryption at rest and in transit. Scan results are associated with your account and protected by row-level security.

We retain your data for as long as your account is active. You can request deletion of your account and all associated data at any time by contacting support@securescan.io.`}
        </Section>

        <Section title="4. Data Sharing">
          {`We do not sell your personal data. We share data with:

• Supabase: Database and authentication provider
• Stripe / Apple / Google: Payment processing
• SendGrid: Transactional email delivery
• Anthropic: AI-powered scan summaries (scan data only, no personal info)

All third-party providers are bound by data processing agreements and privacy regulations.`}
        </Section>

        <Section title="5. Scanned URLs">
          {`URLs you submit for scanning are processed by our servers. The scan results (including security findings) are stored and linked to your account. We do not share scan results with third parties without your consent.

By scanning a website, you confirm you have permission to scan that domain.`}
        </Section>

        <Section title="6. Push Notifications">
          {`With your permission, we send push notifications for security alerts, scan completion, and monitoring updates. You can disable these at any time in your device Settings → Notifications → SecureScan.`}
        </Section>

        <Section title="7. Your Rights (GDPR / CCPA)">
          {`You have the right to:
• Access the personal data we hold about you
• Correct inaccurate data
• Delete your account and all associated data
• Export your data in a machine-readable format
• Opt out of marketing communications

To exercise these rights, contact: privacy@securescan.io`}
        </Section>

        <Section title="8. Children's Privacy">
          {`SecureScan is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us immediately.`}
        </Section>

        <Section title="9. Changes to This Policy">
          {`We may update this Privacy Policy from time to time. We will notify you of significant changes via email or in-app notification. Continued use of the app after changes constitutes acceptance.`}
        </Section>

        <Section title="10. Contact">
          {`SecureScan\nEmail: privacy@securescan.io\nWebsite: https://securescan.io/privacy`}
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
