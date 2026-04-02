import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { signIn, signUp, resetPassword } from "../lib/supabase";
import { COLORS } from "../lib/config";

type Mode = "login" | "register" | "reset";

export default function AuthScreen() {
  const [mode, setMode]         = useState<Mode>("login");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [biometricAvail, setBiometricAvail] = useState(false);

  useEffect(() => { checkBiometric(); }, []);

  async function checkBiometric() {
    const hw  = await LocalAuthentication.hasHardwareAsync();
    const enr = await LocalAuthentication.isEnrolledAsync();
    setBiometricAvail(hw && enr);
    if (hw && enr) tryBiometric();
  }

  async function tryBiometric() {
    const savedEmail = await SecureStore.getItemAsync("ss_bio_email");
    if (!savedEmail) return;
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Sign in to SecureScan",
      fallbackLabel: "Use Password",
    });
    if (result.success) {
      const creds = await SecureStore.getItemAsync("ss_creds");
      if (creds) { const { e, p } = JSON.parse(creds); await doSignIn(e, p); }
    }
  }

  async function doSignIn(e: string, p: string) {
    setLoading(true);
    try {
      await signIn(e, p);
      if (biometricAvail) {
        await SecureStore.setItemAsync("ss_bio_email", e);
        await SecureStore.setItemAsync("ss_creds", JSON.stringify({ e, p }));
      }
    } catch (err: any) {
      Alert.alert("Sign In Failed", err.message || "Check your email and password.");
    } finally { setLoading(false); }
  }

  async function handleLogin() {
    if (!email || !password) { Alert.alert("Required", "Enter email and password."); return; }
    await doSignIn(email.trim().toLowerCase(), password);
  }

  async function handleRegister() {
    if (!email || !password) { Alert.alert("Required", "Fill all fields."); return; }
    if (password.length < 8) { Alert.alert("Weak Password", "Use at least 8 characters."); return; }
    setLoading(true);
    try {
      await signUp(email.trim().toLowerCase(), password, name);
      Alert.alert("Check your email", "Click the confirmation link to activate your account.");
      setMode("login");
    } catch (err: any) { Alert.alert("Sign Up Failed", err.message); }
    finally { setLoading(false); }
  }

  async function handleReset() {
    if (!email) { Alert.alert("Required", "Enter your email."); return; }
    setLoading(true);
    try { await resetPassword(email.trim().toLowerCase()); Alert.alert("Email Sent", "Check your inbox for a reset link."); setMode("login"); }
    catch (err: any) { Alert.alert("Error", err.message); }
    finally { setLoading(false); }
  }

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.logoWrap}>
          <View style={s.logoIcon}><Text style={{ fontSize: 32 }}>⚡</Text></View>
          <Text style={s.logoText}>SECURESCAN</Text>
          <Text style={s.logoSub}>WEBSITE SECURITY SCANNER</Text>
        </View>
        <View style={s.card}>
          <Text style={s.cardTitle}>{mode === "login" ? "Welcome back" : mode === "register" ? "Create account" : "Reset password"}</Text>
          <Text style={s.cardSub}>{mode === "login" ? "Sign in to continue" : mode === "register" ? "Start securing your sites" : "We'll email you a link"}</Text>
          {mode === "register" && (
            <View style={s.inputWrap}>
              <Text style={s.label}>FULL NAME</Text>
              <TextInput style={s.input} placeholder="Your name" placeholderTextColor={COLORS.text3} value={name} onChangeText={setName} autoCapitalize="words" />
            </View>
          )}
          <View style={s.inputWrap}>
            <Text style={s.label}>EMAIL</Text>
            <TextInput style={s.input} placeholder="you@example.com" placeholderTextColor={COLORS.text3} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
          </View>
          {mode !== "reset" && (
            <View style={s.inputWrap}>
              <Text style={s.label}>PASSWORD</Text>
              <TextInput style={s.input} placeholder={mode === "register" ? "Min 8 characters" : "••••••••"} placeholderTextColor={COLORS.text3} value={password} onChangeText={setPassword} secureTextEntry />
            </View>
          )}
          <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={mode === "login" ? handleLogin : mode === "register" ? handleRegister : handleReset} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>{mode === "login" ? "Sign In →" : mode === "register" ? "Create Account →" : "Send Reset Link →"}</Text>}
          </TouchableOpacity>
          {mode === "login" && biometricAvail && (
            <TouchableOpacity style={s.bioBtn} onPress={tryBiometric}>
              <Text style={s.bioText}>🔐  Sign in with Face ID / Fingerprint</Text>
            </TouchableOpacity>
          )}
          <View style={s.switchRow}>
            {mode === "login" ? (
              <>
                <TouchableOpacity onPress={() => setMode("reset")}><Text style={s.link}>Forgot password?</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setMode("register")}><Text style={s.link}>Create account</Text></TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity onPress={() => setMode("login")}><Text style={s.link}>← Back to sign in</Text></TouchableOpacity>
            )}
          </View>
        </View>
        <Text style={s.terms}>By signing in you agree to our Terms of Service and Privacy Policy.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },
  logoWrap: { alignItems: "center", marginBottom: 32 },
  logoIcon: { width: 64, height: 64, borderRadius: 16, backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center", marginBottom: 12, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6 },
  logoText: { fontFamily: "Courier New", fontWeight: "800", fontSize: 22, color: COLORS.text, letterSpacing: 2 },
  logoSub: { fontFamily: "Courier New", fontSize: 10, color: COLORS.primary, letterSpacing: 1, marginTop: 2 },
  card: { backgroundColor: COLORS.bg2, borderRadius: 20, padding: 28, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  cardTitle: { fontSize: 22, fontWeight: "800", color: COLORS.text, marginBottom: 4 },
  cardSub: { fontSize: 14, color: COLORS.text3, marginBottom: 24 },
  inputWrap: { marginBottom: 16 },
  label: { fontFamily: "Courier New", fontSize: 10, color: COLORS.text3, letterSpacing: 1.5, marginBottom: 6 },
  input: { backgroundColor: COLORS.bg3, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, padding: 14, fontSize: 15, color: COLORS.text },
  btn: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 16, fontFamily: "Courier New" },
  bioBtn: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, padding: 14, alignItems: "center", marginTop: 10 },
  bioText: { color: COLORS.primary, fontWeight: "700", fontSize: 14 },
  switchRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  link: { color: COLORS.primary, fontWeight: "700", fontSize: 13 },
  terms: { textAlign: "center", color: COLORS.text3, fontSize: 11, marginTop: 24, lineHeight: 16 },
});
