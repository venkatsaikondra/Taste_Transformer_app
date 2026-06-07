"use client";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Link } from "expo-router";
import { useAuth } from "@/hooks/useAuth";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    try {
      setLoading(true);
      await login({ email, password });
      // navigation is handled inside useAuth → router.replace("/")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication Failed";
      Alert.alert("Login Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Grid background dots */}
      <View style={styles.gridOverlay} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* Corner accents */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>USER_AUTHENTICATION</Text>
            <Text style={styles.subtitle}>IDENTITY VERIFICATION REQUIRED</Text>
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>EMAIL_ADDRESS</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholderTextColor="#3f3f3f"
              selectionColor="#c5fb45"
            />
            <View style={styles.inputUnderline} />
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              placeholderTextColor="#3f3f3f"
              selectionColor="#c5fb45"
            />
            <View style={styles.inputUnderline} />
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={onLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>INITIALIZE_LOGIN</Text>
            )}
          </TouchableOpacity>

          {/* Link to signup */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>NO RECORDS FOUND? </Text>
            <Link href="/signup" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>SIGN_UP</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const ACCENT = "#c5fb45";
const BG = "#050505";
const CARD_BG = "#0a0a0a";
const BORDER = "#1f1f1f";

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    // Simulated grid via repeating border — React Native can't do CSS background-image.
    // For a true grid use react-native-svg or an image asset.
    opacity: 0.06,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 28,
    padding: 28,
    overflow: "hidden",
    position: "relative",
  },
  // Corner accent squares
  corner: {
    position: "absolute",
    width: 16,
    height: 16,
  },
  cornerTL: {
    top: -1,
    left: -1,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: ACCENT,
  },
  cornerBR: {
    bottom: -1,
    right: -1,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: ACCENT,
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    fontSize: 22,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    fontSize: 10,
    letterSpacing: 3,
    color: "#555",
    marginTop: 4,
    textTransform: "uppercase",
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    fontSize: 10,
    letterSpacing: 2,
    color: ACCENT,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  input: {
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    fontSize: 14,
    color: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 0,
    backgroundColor: "transparent",
  },
  inputUnderline: {
    height: 1,
    backgroundColor: BORDER,
  },
  button: {
    backgroundColor: ACCENT,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    borderRadius: 2,
  },
  buttonDisabled: {
    backgroundColor: "#1f1f1f",
  },
  buttonText: {
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 3,
    color: "#000",
    textTransform: "uppercase",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    fontSize: 10,
    letterSpacing: 2,
    color: "#444",
    textTransform: "uppercase",
  },
  footerLink: {
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    fontSize: 10,
    letterSpacing: 2,
    color: "#fff",
    textTransform: "uppercase",
  },
});