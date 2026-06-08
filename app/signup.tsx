import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
  Animated, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { useAuth } from "@/hooks/useAuth";

const ACCENT = "#c5fb45";
const BG = "#050505";
const CARD_BG = "#0d0d0d";
const MONO = Platform.OS === "ios" ? "Courier New" : "monospace";

export default function SignupScreen() {
  const { signup } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(cardY, { toValue: 0, tension: 70, friction: 14, useNativeDriver: true }),
    ]).start();
  }, []);

  const isValid = email.includes("@") && password.length >= 6 && username.trim().length > 0;

  const onSignup = async () => {
    if (!isValid) return;
    try {
      setLoading(true);
      await signup({ username: username.trim(), email: email.trim().toLowerCase(), password });
      Alert.alert("Account Created", "Please log in with your new credentials.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      Alert.alert("Registration Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      {/* Grid dot background */}
      <View style={styles.grid} pointerEvents="none">
        {Array.from({ length: 12 }).map((_, row) =>
          Array.from({ length: 8 }).map((_, col) => (
            <View key={`${row}-${col}`} style={[styles.dot, { top: row * 110 + 40, left: col * 52 + 20 }]} />
          ))
        )}
      </View>

      <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand */}
          <View style={styles.brand}>
            <Text style={styles.brandText}>FOODZILLA</Text>
            <View style={styles.brandLine} />
          </View>

          {/* Card */}
          <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ translateY: cardY }] }]}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />

            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>NEW_ENTITY_REGISTRATION</Text>
              <Text style={styles.cardSub}>SYSTEM INTEGRATION REQUIRED</Text>
            </View>

            {/* Username */}
            <View style={styles.field}>
              <Text style={styles.label}>USERNAME</Text>
              <TextInput
                style={[styles.input, focusedField === "username" && styles.inputFocused]}
                value={username}
                onChangeText={setUsername}
                onFocus={() => setFocusedField("username")}
                onBlur={() => setFocusedField(null)}
                placeholder="alias_01"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#333"
                selectionColor={ACCENT}
                returnKeyType="next"
              />
              <View style={[styles.fieldLine, focusedField === "username" && styles.fieldLineActive]} />
            </View>

            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.label}>EMAIL_ADDRESS</Text>
              <TextInput
                style={[styles.input, focusedField === "email" && styles.inputFocused]}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                placeholder="user@network.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                placeholderTextColor="#333"
                selectionColor={ACCENT}
                returnKeyType="next"
              />
              <View style={[styles.fieldLine, focusedField === "email" && styles.fieldLineActive]} />
            </View>

            {/* Password */}
            <View style={styles.field}>
              <Text style={styles.label}>PASSWORD</Text>
              <TextInput
                style={[styles.input, focusedField === "password" && styles.inputFocused]}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                secureTextEntry
                autoComplete="new-password"
                placeholderTextColor="#333"
                selectionColor={ACCENT}
                returnKeyType="done"
                onSubmitEditing={onSignup}
              />
              <View style={[styles.fieldLine, focusedField === "password" && styles.fieldLineActive]} />
              {password.length > 0 && password.length < 6 && (
                <Text style={styles.fieldHint}>Minimum 6 characters</Text>
              )}
            </View>

            {/* Strength indicator */}
            {password.length > 0 && (
              <View style={styles.strengthRow}>
                {[1, 2, 3].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.strengthBar,
                      {
                        backgroundColor:
                          password.length >= i * 4
                            ? i === 1 ? "#ef4444" : i === 2 ? "#f97316" : ACCENT
                            : "#1e1e1e",
                      },
                    ]}
                  />
                ))}
                <Text style={styles.strengthText}>
                  {password.length < 4 ? "WEAK" : password.length < 8 ? "FAIR" : "STRONG"}
                </Text>
              </View>
            )}

            {/* Submit */}
            <TouchableOpacity
              style={[styles.btn, (!isValid || loading) && styles.btnDisabled]}
              onPress={onSignup}
              disabled={!isValid || loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color={isValid ? "#000" : "#555"} size="small" />
                : <Text style={[styles.btnText, !isValid && styles.btnTextDisabled]}>
                    INITIALIZE_REGISTRY →
                  </Text>
              }
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>ALREADY REGISTERED? </Text>
              <Link href="/login" asChild>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.footerLink}>RETURN_TO_LOGIN</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </Animated.View>

          <Text style={styles.hint}>SECURE · ENCRYPTED · PRIVATE</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  grid: { ...StyleSheet.absoluteFillObject, overflow: "hidden" },
  dot: { position: "absolute", width: 2, height: 2, borderRadius: 1, backgroundColor: "#1a1a1a" },
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1, justifyContent: "center", alignItems: "center",
    paddingHorizontal: 24, paddingVertical: 32,
  },
  brand: { alignItems: "center", marginBottom: 32 },
  brandText: { fontFamily: MONO, fontSize: 18, fontWeight: "900", color: ACCENT, letterSpacing: 6 },
  brandLine: { width: 40, height: 2, backgroundColor: ACCENT, marginTop: 8 },
  card: {
    width: "100%", maxWidth: 400,
    backgroundColor: CARD_BG, borderWidth: 1,
    borderColor: "#1e1e1e", borderRadius: 4,
    padding: 28, position: "relative",
  },
  cornerTL: { position: "absolute", top: -1, left: -1, width: 18, height: 18, borderTopWidth: 2, borderLeftWidth: 2, borderColor: ACCENT },
  cornerTR: { position: "absolute", top: -1, right: -1, width: 18, height: 18, borderTopWidth: 2, borderRightWidth: 2, borderColor: ACCENT },
  cornerBL: { position: "absolute", bottom: -1, left: -1, width: 18, height: 18, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: ACCENT },
  cornerBR: { position: "absolute", bottom: -1, right: -1, width: 18, height: 18, borderBottomWidth: 2, borderRightWidth: 2, borderColor: ACCENT },
  cardHeader: { marginBottom: 24 },
  cardTitle: { fontFamily: MONO, fontSize: 15, fontWeight: "900", color: "#fff", letterSpacing: 0.5 },
  cardSub: { fontFamily: MONO, fontSize: 9, letterSpacing: 3, color: "#444", marginTop: 6 },
  field: { marginBottom: 20 },
  label: { fontFamily: MONO, fontSize: 9, letterSpacing: 2.5, color: ACCENT, marginBottom: 8 },
  input: { fontFamily: MONO, fontSize: 15, color: "#fff", paddingVertical: 10, backgroundColor: "transparent" },
  inputFocused: { color: "#fff" },
  fieldLine: { height: 1, backgroundColor: "#222" },
  fieldLineActive: { backgroundColor: ACCENT },
  fieldHint: { fontFamily: MONO, fontSize: 9, color: "#ef4444", marginTop: 5, letterSpacing: 1 },
  strengthRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16, marginTop: -8 },
  strengthBar: { flex: 1, height: 3, borderRadius: 2 },
  strengthText: { fontFamily: MONO, fontSize: 9, color: "#444", letterSpacing: 1, minWidth: 50 },
  btn: { backgroundColor: ACCENT, paddingVertical: 16, alignItems: "center", justifyContent: "center", marginTop: 8, borderRadius: 2 },
  btnDisabled: { backgroundColor: "#111", borderWidth: 1, borderColor: "#222" },
  btnText: { fontFamily: MONO, fontSize: 12, fontWeight: "800", letterSpacing: 2, color: "#000" },
  btnTextDisabled: { color: "#333" },
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#1e1e1e" },
  dividerText: { fontFamily: MONO, fontSize: 10, color: "#333", letterSpacing: 2 },
  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", flexWrap: "wrap", gap: 4 },
  footerText: { fontFamily: MONO, fontSize: 10, color: "#444", letterSpacing: 1 },
  footerLink: { fontFamily: MONO, fontSize: 10, color: ACCENT, letterSpacing: 1, fontWeight: "700" },
  hint: { marginTop: 24, fontFamily: MONO, fontSize: 9, color: "#2a2a2a", letterSpacing: 3, textAlign: "center" },
});
