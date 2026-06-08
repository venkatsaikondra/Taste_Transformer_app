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
const BORDER = "#222";
const MONO = Platform.OS === "ios" ? "Courier New" : "monospace";

export default function LoginScreen() {
  const { login } = useAuth();
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

  const onLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    try {
      setLoading(true);
      await login({ email: email.trim().toLowerCase(), password });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      Alert.alert("Login Failed", msg);
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
          {/* Logo / brand mark */}
          <View style={styles.brand}>
            <Text style={styles.brandText}>FOODZILLA</Text>
            <View style={styles.brandLine} />
          </View>

          {/* Card */}
          <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ translateY: cardY }] }]}>
            {/* Corner accents */}
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />

            {/* Header */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>USER_AUTHENTICATION</Text>
              <Text style={styles.cardSub}>IDENTITY VERIFICATION REQUIRED</Text>
            </View>

            {/* Email field */}
            <View style={styles.field}>
              <Text style={styles.label}>EMAIL_ADDRESS</Text>
              <TextInput
                style={[styles.input, focusedField === "email" && styles.inputFocused]}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
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

            {/* Password field */}
            <View style={styles.field}>
              <Text style={styles.label}>PASSWORD</Text>
              <TextInput
                style={[styles.input, focusedField === "password" && styles.inputFocused]}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                secureTextEntry
                autoComplete="password"
                placeholderTextColor="#333"
                selectionColor={ACCENT}
                returnKeyType="done"
                onSubmitEditing={onLogin}
              />
              <View style={[styles.fieldLine, focusedField === "password" && styles.fieldLineActive]} />
            </View>

            {/* Submit button */}
            <TouchableOpacity
              style={[styles.btn, loading && styles.btnLoading]}
              onPress={onLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#000" size="small" />
                : <Text style={styles.btnText}>INITIALIZE_LOGIN →</Text>
              }
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Sign up link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>NO RECORDS FOUND? </Text>
              <Link href="/signup" asChild>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.footerLink}>CREATE_ACCOUNT</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </Animated.View>

          {/* Bottom hint */}
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
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  // Brand
  brand: { alignItems: "center", marginBottom: 32 },
  brandText: {
    fontFamily: MONO, fontSize: 18, fontWeight: "900",
    color: ACCENT, letterSpacing: 6,
  },
  brandLine: { width: 40, height: 2, backgroundColor: ACCENT, marginTop: 8 },

  // Card
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: "#1e1e1e",
    borderRadius: 4,
    padding: 28,
    position: "relative",
  },

  // Corner accents
  cornerTL: { position: "absolute", top: -1, left: -1, width: 18, height: 18, borderTopWidth: 2, borderLeftWidth: 2, borderColor: ACCENT },
  cornerTR: { position: "absolute", top: -1, right: -1, width: 18, height: 18, borderTopWidth: 2, borderRightWidth: 2, borderColor: ACCENT },
  cornerBL: { position: "absolute", bottom: -1, left: -1, width: 18, height: 18, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: ACCENT },
  cornerBR: { position: "absolute", bottom: -1, right: -1, width: 18, height: 18, borderBottomWidth: 2, borderRightWidth: 2, borderColor: ACCENT },

  // Card header
  cardHeader: { marginBottom: 28 },
  cardTitle: { fontFamily: MONO, fontSize: 17, fontWeight: "900", color: "#fff", letterSpacing: 0.5 },
  cardSub: { fontFamily: MONO, fontSize: 9, letterSpacing: 3, color: "#444", marginTop: 6, textTransform: "uppercase" },

  // Fields
  field: { marginBottom: 22 },
  label: { fontFamily: MONO, fontSize: 9, letterSpacing: 2.5, color: ACCENT, marginBottom: 8, textTransform: "uppercase" },
  input: {
    fontFamily: MONO, fontSize: 15, color: "#fff",
    paddingVertical: 10, paddingHorizontal: 0,
    backgroundColor: "transparent",
  },
  inputFocused: { color: "#fff" },
  fieldLine: { height: 1, backgroundColor: "#222" },
  fieldLineActive: { backgroundColor: ACCENT },

  // Button
  btn: {
    backgroundColor: ACCENT,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    borderRadius: 2,
  },
  btnLoading: { backgroundColor: "#1a1a1a", borderWidth: 1, borderColor: ACCENT },
  btnText: { fontFamily: MONO, fontSize: 12, fontWeight: "800", letterSpacing: 2, color: "#000" },

  // Divider
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#1e1e1e" },
  dividerText: { fontFamily: MONO, fontSize: 10, color: "#333", letterSpacing: 2 },

  // Footer
  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", flexWrap: "wrap", gap: 4 },
  footerText: { fontFamily: MONO, fontSize: 10, color: "#444", letterSpacing: 1 },
  footerLink: { fontFamily: MONO, fontSize: 10, color: ACCENT, letterSpacing: 1, fontWeight: "700" },

  // Bottom hint
  hint: { marginTop: 24, fontFamily: MONO, fontSize: 9, color: "#2a2a2a", letterSpacing: 3, textAlign: "center" },
});
