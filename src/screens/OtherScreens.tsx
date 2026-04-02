import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput, ActivityIndicator, Linking, RefreshControl } from "react-native";
import { api } from "../lib/api";
import { useAuth } from "../lib/AuthContext";
import { COLORS, GRADE_COLOR, SEV_COLOR, SEV_BG, PLAN_LIMITS } from "../lib/config";
import { format } from "date-fns";

// ── Shared components ─────────────────────────────────────────────────────────
function Card({ children, style }: any) {
  return <View style={[ss.card, style]}>{children}</View>;
}
function SectionTitle({ text }: { text: string }) {
  return <Text style={ss.sectionTitle}>{text}</Text>;
}
function EmptyState({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <View style={ss.emptyWrap}>
      <Text style={ss.emptyIcon}>{icon}</Text>
      <Text style={ss.emptyTitle}>{title}</Text>
      <Text style={ss.emptySub}>{sub}</Text>
    </View>
  );
}

// ── History Screen ────────────────────────────────────────────────────────────
export function HistoryScreen({ navigation }: any) {
  const [scans, setScans]       = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.listScans(50);
      setScans(data.scans || []);
    } catch (e: any) { Alert.alert("Error", e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, []);

  async function deleteScan(id: string) {
    Alert.alert("Delete Scan", "Remove this scan from your history?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          await api.deleteScan(id);
          setScans(s => s.filter(x => x.id !== id));
        }
      }
    ]);
  }

  if (loading) return <View style={ss.center}><ActivityIndicator color={COLORS.primary} /></View>;

  return (
    <ScrollView style={ss.root} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}>
      <View style={{ padding: 16 }}>
        <SectionTitle text="SCAN HISTORY" />
        {scans.length === 0 && <EmptyState icon="📋" title="No scans yet" sub="Start your first scan from the Scanner tab" />}
        {scans.map(scan => {
          const gc = GRADE_COLOR(scan.grade);
          const sc = scan.severity_counts || {};
          return (
            <Card key={scan.id} style={{ marginBottom: 10 }}>
              <TouchableOpacity onPress={() => navigation?.navigate?.("ScanDetail", { scan })} style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                <View style={[ss.gradeBadge, { borderColor: gc }]}>
                  <Text style={[ss.gradeLetter, { color: gc }]}>{scan.grade}</Text>
                  <Text style={ss.gradeScore}>{scan.score}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={ss.scanHost} numberOfLines={1}>{scan.hostname}</Text>
                  <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                    {[["critical",sc.critical],["high",sc.high],["medium",sc.medium]].filter(([,c]) => (c as number) > 0).map(([k,c]) => (
                      <View key={k as string} style={{ backgroundColor: SEV_BG(k as string), borderRadius: 3, paddingHorizontal: 5, paddingVertical: 1 }}>
                        <Text style={{ fontFamily: "Courier New", fontSize: 9, color: SEV_COLOR(k as string), fontWeight: "800" }}>{c} {(k as string).toUpperCase()}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={ss.scanDate}>{scan.created_at ? format(new Date(scan.created_at), "MMM d, yyyy · HH:mm") : ""}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteScan(scan.id)} style={{ padding: 8 }}>
                  <Text style={{ color: COLORS.critical, fontSize: 16 }}>🗑</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ── Monitoring Screen ─────────────────────────────────────────────────────────
export function MonitoringScreen() {
  const { profile } = useAuth();
  const [sites, setSites]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl]         = useState("");
  const [adding, setAdding]   = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isPro = ["pro","team"].includes(profile?.plan || "free");

  const load = useCallback(async () => {
    try { const d = await api.listSites(); setSites(d.sites || []); }
    catch {} finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { if (isPro) load(); else setLoading(false); }, [isPro]);

  async function addSite() {
    if (!url.trim()) { Alert.alert("Required", "Enter a URL."); return; }
    setAdding(true);
    try {
      const d = await api.addSite(url.trim());
      setSites(s => [...s, d.site]);
      setUrl("");
    } catch (e: any) { Alert.alert("Error", e.message); }
    finally { setAdding(false); }
  }

  async function removeSite(id: string) {
    Alert.alert("Remove Site", "Stop monitoring this site?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: async () => { await api.deleteSite(id); setSites(s => s.filter(x => x.id !== id)); } }
    ]);
  }

  if (!isPro) {
    return (
      <View style={[ss.root, ss.center]}>
        <Card style={{ margin: 24, alignItems: "center" }}>
          <Text style={{ fontSize: 40, marginBottom: 16 }}>🔒</Text>
          <Text style={{ fontSize: 18, fontWeight: "800", color: COLORS.text, marginBottom: 8 }}>Pro Feature</Text>
          <Text style={{ color: COLORS.text2, textAlign: "center", marginBottom: 20 }}>Upgrade to Pro to monitor sites 24/7 and get instant alerts when security issues are found.</Text>
          <TouchableOpacity style={ss.primaryBtn} onPress={() => {}}>
            <Text style={ss.primaryBtnText}>Upgrade to Pro →</Text>
          </TouchableOpacity>
        </Card>
      </View>
    );
  }

  if (loading) return <View style={ss.center}><ActivityIndicator color={COLORS.primary} /></View>;

  const limit = PLAN_LIMITS[profile?.plan || "free"]?.sites || 1;

  return (
    <ScrollView style={ss.root} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}>
      <View style={{ padding: 16 }}>
        <SectionTitle text="MONITORED SITES" />
        <Card>
          <Text style={ss.label}>ADD SITE TO MONITOR</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput style={[ss.input, { flex: 1 }]} placeholder="https://example.com" placeholderTextColor={COLORS.text3} value={url} onChangeText={setUrl} autoCapitalize="none" autoCorrect={false} keyboardType="url" />
            <TouchableOpacity style={[ss.primaryBtn, { paddingHorizontal: 16 }, adding && { opacity: 0.6 }]} onPress={addSite} disabled={adding}>
              {adding ? <ActivityIndicator color="#fff" size="small" /> : <Text style={ss.primaryBtnText}>Add</Text>}
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 11, color: COLORS.text3, marginTop: 8 }}>{sites.length}/{limit} sites used</Text>
        </Card>

        {sites.length === 0 && <EmptyState icon="👁" title="No sites monitored" sub="Add your first site above to start 24/7 monitoring" />}

        {sites.map(site => {
          const gc = site.last_grade ? GRADE_COLOR(site.last_grade) : COLORS.text3;
          return (
            <Card key={site.id} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <Text style={ss.scanHost} numberOfLines={1}>{site.url.replace(/^https?:\/\//,"")}</Text>
                  <Text style={ss.scanDate}>Every {site.interval_hours}h · {site.last_scanned_at ? `Last: ${format(new Date(site.last_scanned_at),"MMM d HH:mm")}` : "Not scanned yet"}</Text>
                </View>
                {site.last_grade && (
                  <View style={[ss.gradeBadge, { borderColor: gc, marginRight: 8 }]}>
                    <Text style={[ss.gradeLetter, { color: gc }]}>{site.last_grade}</Text>
                    <Text style={ss.gradeScore}>{site.last_score}</Text>
                  </View>
                )}
                <TouchableOpacity onPress={() => removeSite(site.id)}>
                  <Text style={{ color: COLORS.critical, fontSize: 18 }}>✕</Text>
                </TouchableOpacity>
              </View>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ── Alerts Screen ─────────────────────────────────────────────────────────────
export function AlertsScreen() {
  const [alerts, setAlerts]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { const d = await api.listAlerts(); setAlerts(d.alerts || []); }
    catch {} finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, []);

  async function markAllRead() {
    await api.markAllAlertsRead();
    setAlerts(a => a.map(x => ({ ...x, read: true })));
  }

  const TYPE_ICON: Record<string, string> = {
    score_drop: "📉", critical_finding: "🚨", cert_expiry: "🔐", scan_complete: "✅"
  };

  if (loading) return <View style={ss.center}><ActivityIndicator color={COLORS.primary} /></View>;

  const unread = alerts.filter(a => !a.read).length;

  return (
    <ScrollView style={ss.root} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <Text style={[ss.sectionTitle, { flex: 1, marginBottom: 0 }]}>ALERTS</Text>
          {unread > 0 && (
            <TouchableOpacity onPress={markAllRead}>
              <Text style={{ color: COLORS.primary, fontWeight: "700", fontSize: 13 }}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>

        {alerts.length === 0 && <EmptyState icon="🔔" title="No alerts" sub="Alerts appear here when monitoring finds issues" />}

        {alerts.map(alert => (
          <Card key={alert.id} style={{ marginBottom: 8, borderLeftWidth: 3, borderLeftColor: alert.read ? COLORS.border : COLORS.primary, opacity: alert.read ? 0.7 : 1 }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Text style={{ fontSize: 20 }}>{TYPE_ICON[alert.type] || "⚠️"}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "700", color: COLORS.text, fontSize: 14, marginBottom: 4 }}>{alert.message}</Text>
                <Text style={ss.scanDate}>{alert.sent_at ? format(new Date(alert.sent_at), "MMM d, yyyy · HH:mm") : ""}</Text>
              </View>
              {!alert.read && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginTop: 6 }} />}
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

// ── Pricing Screen ────────────────────────────────────────────────────────────
export function PricingScreen() {
  const { profile, refreshProfile } = useAuth();
  const [loading, setLoading]       = useState<string | null>(null);
  const [cycle, setCycle]           = useState<"monthly"|"yearly">("monthly");
  const currentPlan = profile?.plan || "free";

  async function subscribe(plan: string) {
    setLoading(plan);
    try {
      const { url } = await api.createCheckout(
        plan, cycle,
        "securescan://payment-success",
        "securescan://payment-cancel"
      );
      await Linking.openURL(url);
    } catch (e: any) { Alert.alert("Error", e.message); }
    finally { setLoading(null); }
  }

  async function manageSubscription() {
    try {
      const { url } = await api.getBillingPortal();
      await Linking.openURL(url);
    } catch (e: any) { Alert.alert("Error", e.message); }
  }

  const plans = [
    {
      key: "free", name: "Free", monthlyPrice: 0, yearlyPrice: 0,
      features: ["5 scans / month","1 monitored site","Basic results","Community support"],
      cta: "Current Plan",
    },
    {
      key: "pro", name: "Pro", monthlyPrice: 29, yearlyPrice: 249,
      features: ["100 scans / month","10 monitored sites","PDF reports","AI summaries","Email alerts","Priority support"],
      cta: "Upgrade to Pro", highlight: true,
    },
    {
      key: "team", name: "Team", monthlyPrice: 99, yearlyPrice: 849,
      features: ["Unlimited scans","50 monitored sites","Everything in Pro","API access","CI/CD webhooks","Team seats"],
      cta: "Upgrade to Team",
    },
  ];

  return (
    <ScrollView style={ss.root} contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
      <SectionTitle text="PLANS & PRICING" />

      {/* Billing cycle toggle */}
      <View style={ss.cycleToggle}>
        {(["monthly","yearly"] as const).map(c => (
          <TouchableOpacity key={c} style={[ss.cycleBtn, cycle === c && ss.cycleBtnActive]} onPress={() => setCycle(c)}>
            <Text style={[ss.cycleBtnText, cycle === c && { color: "#fff" }]}>
              {c === "monthly" ? "Monthly" : "Yearly (save 30%)"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {plans.map(plan => {
        const isCurrent = currentPlan === plan.key;
        const price = cycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
        return (
          <Card key={plan.key} style={[{ marginBottom: 12 }, plan.highlight && { borderWidth: 2, borderColor: COLORS.primary }]}>
            {plan.highlight && (
              <View style={ss.popularBadge}><Text style={ss.popularText}>MOST POPULAR</Text></View>
            )}
            <Text style={ss.planName}>{plan.name}</Text>
            <Text style={ss.planPrice}>
              {price === 0 ? "Free" : `$${price}`}
              {price > 0 && <Text style={{ fontSize: 14, color: COLORS.text3 }}>/{cycle === "monthly" ? "mo" : "yr"}</Text>}
            </Text>
            {plan.features.map(f => (
              <View key={f} style={{ flexDirection: "row", gap: 8, marginBottom: 6 }}>
                <Text style={{ color: COLORS.low }}>✓</Text>
                <Text style={{ color: COLORS.text2, fontSize: 14 }}>{f}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={[ss.primaryBtn, { marginTop: 16 }, isCurrent && { backgroundColor: COLORS.bg3 }, loading === plan.key && { opacity: 0.6 }]}
              onPress={isCurrent && currentPlan !== "free" ? manageSubscription : () => plan.key !== "free" && subscribe(plan.key)}
              disabled={isCurrent && currentPlan === "free" || loading === plan.key}
            >
              {loading === plan.key ? <ActivityIndicator color="#fff" size="small" /> :
                <Text style={[ss.primaryBtnText, isCurrent && { color: COLORS.text2 }]}>
                  {isCurrent ? (currentPlan !== "free" ? "Manage Subscription" : "Current Plan") : plan.cta}
                </Text>
              }
            </TouchableOpacity>
          </Card>
        );
      })}
    </ScrollView>
  );
}

// ── Settings Screen ───────────────────────────────────────────────────────────
export function SettingsScreen() {
  const { profile, signOut, refreshProfile } = useAuth();
  const [notifications, setNotifications]   = useState(profile?.notification_email ?? true);

  async function handleSignOut() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ]);
  }

  const rows = [
    { label: "Email", value: profile?.email || "—" },
    { label: "Plan",  value: (profile?.plan || "free").toUpperCase() },
    { label: "Scans this month", value: `${profile?.scans_this_month || 0} / ${profile?.scan_limit || 5}` },
    { label: "Scans remaining",  value: String(profile?.scans_remaining ?? "—") },
  ];

  return (
    <ScrollView style={ss.root}>
      <View style={{ padding: 16 }}>
        <SectionTitle text="ACCOUNT" />
        <Card style={{ marginBottom: 20 }}>
          {rows.map((r, i) => (
            <View key={r.label} style={[{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 12 }, i < rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: COLORS.border }]}>
              <Text style={{ color: COLORS.text3, fontSize: 14 }}>{r.label}</Text>
              <Text style={{ color: COLORS.text, fontSize: 14, fontWeight: "600", fontFamily: "Courier New" }}>{r.value}</Text>
            </View>
          ))}
        </Card>

        <SectionTitle text="PREFERENCES" />
        <Card style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: COLORS.text, fontSize: 14 }}>Email notifications</Text>
            <TouchableOpacity
              style={[ss.toggle, notifications && ss.toggleOn]}
              onPress={() => setNotifications(n => !n)}
            >
              <View style={[ss.toggleThumb, notifications && ss.toggleThumbOn]} />
            </TouchableOpacity>
          </View>
        </Card>

        <SectionTitle text="LINKS" />
        <Card style={{ marginBottom: 20 }}>
          {[
            ["Privacy Policy",    "https://securescan.io/privacy"],
            ["Terms of Service",  "https://securescan.io/terms"],
            ["Support",           "mailto:support@securescan.io"],
            ["Rate the App ⭐",   "https://apps.apple.com/app/securescan"],
          ].map(([label, url]) => (
            <TouchableOpacity key={label} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border }} onPress={() => Linking.openURL(url)}>
              <Text style={{ color: COLORS.primary, fontSize: 14 }}>{label}</Text>
            </TouchableOpacity>
          ))}
        </Card>

        <TouchableOpacity style={[ss.primaryBtn, { backgroundColor: COLORS.critical }]} onPress={handleSignOut}>
          <Text style={ss.primaryBtnText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={{ textAlign: "center", color: COLORS.text3, fontSize: 11, marginTop: 20 }}>
          SecureScan v1.0.0 · Made with ⚡
        </Text>
      </View>
    </ScrollView>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const ss = StyleSheet.create({
  root:        { flex: 1, backgroundColor: COLORS.bg },
  center:      { flex: 1, justifyContent: "center", alignItems: "center" },
  card:        { backgroundColor: COLORS.bg2, borderRadius: 14, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  sectionTitle:{ fontFamily: "Courier New", fontSize: 11, fontWeight: "800", color: COLORS.text3, letterSpacing: 1.5, marginBottom: 10 },
  label:       { fontFamily: "Courier New", fontSize: 10, color: COLORS.text3, letterSpacing: 1.5, marginBottom: 8 },
  input:       { backgroundColor: COLORS.bg3, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, padding: 12, fontSize: 14, color: COLORS.text },
  primaryBtn:  { backgroundColor: COLORS.primary, borderRadius: 12, padding: 14, alignItems: "center" },
  primaryBtnText:{ color: "#fff", fontWeight: "800", fontSize: 15, fontFamily: "Courier New" },
  gradeBadge:  { width: 50, height: 50, borderRadius: 25, borderWidth: 2.5, justifyContent: "center", alignItems: "center" },
  gradeLetter: { fontFamily: "Courier New", fontSize: 18, fontWeight: "900" },
  gradeScore:  { fontFamily: "Courier New", fontSize: 9, color: COLORS.text3 },
  scanHost:    { fontFamily: "Courier New", fontWeight: "700", fontSize: 14, color: COLORS.text },
  scanDate:    { fontSize: 11, color: COLORS.text3, marginTop: 4 },
  emptyWrap:   { alignItems: "center", paddingVertical: 48 },
  emptyIcon:   { fontSize: 40, marginBottom: 12 },
  emptyTitle:  { fontSize: 16, fontWeight: "800", color: COLORS.text, marginBottom: 6 },
  emptySub:    { fontSize: 13, color: COLORS.text3, textAlign: "center" },
  cycleToggle: { flexDirection: "row", backgroundColor: COLORS.bg3, borderRadius: 10, padding: 4, marginBottom: 16 },
  cycleBtn:    { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  cycleBtnActive: { backgroundColor: COLORS.primary },
  cycleBtnText: { fontWeight: "700", fontSize: 13, color: COLORS.text3 },
  planName:    { fontFamily: "Courier New", fontWeight: "800", fontSize: 18, color: COLORS.text, marginBottom: 4 },
  planPrice:   { fontSize: 32, fontWeight: "900", color: COLORS.text, marginBottom: 16 },
  popularBadge:{ backgroundColor: COLORS.primary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start", marginBottom: 10 },
  popularText: { fontFamily: "Courier New", fontSize: 10, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },
  toggle:      { width: 50, height: 28, borderRadius: 14, backgroundColor: COLORS.border, justifyContent: "center", paddingHorizontal: 3 },
  toggleOn:    { backgroundColor: COLORS.low },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#fff", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  toggleThumbOn: { transform: [{ translateX: 22 }] },
});
