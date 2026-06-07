"use client";
import React, { useState, useEffect } from "react";
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

export default function SignupScreen() {
  const { signup } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(true);

  useEffect(() => {
    const valid =
      email.includes("@") && password.length >= 6 && username.length > 0;
    setButtonDisabled(!valid);
  }, [email, password, username]);

  const onSignup = async () => {
    if (buttonDisabled) return;
    try {
      setLoading(true);
      await signup({ username, email, password });
      Alert.alert("Success", "Identity Registered Successfully");
      // navigation to /login is handled inside useAuth
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration Failure";
      Alert.alert("Registration Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.gridOverlay} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          <View style={styles.header}>
            <Text style={styles.title}>NEW_ENTITY_REGISTRATION</Text>
            <Text style={styles.subtitle}>SYSTEM INTEGRATION REQUIRED</Text>
          </View>

          {/* Username */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>USERNAME</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="alias_01"
              autoCapitalize="none"
              placeholderTextColor="#3f3f3f"
              selectionColor="#c5fb45"
            />
            <View style={styles.inputUnderline} />
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>EMAIL_ADDRESS</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="user@network.com"
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
              autoComplete="new-password"
              placeholderTextColor="#3f3f3f"
              selectionColor="#c5fb45"
            />
            <View style={styles.inputUnderline} />
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (buttonDisabled || loading) && styles.buttonDisabled,
            ]}
            onPress={onSignup}
            disabled={buttonDisabled || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={buttonDisabled ? "#555" : "#000"} />
            ) : (
              <Text
                style={[
                  styles.buttonText,
                  buttonDisabled && styles.buttonTextDisabled,
                ]}
              >
                INITIALIZE_REGISTRY
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>ALREADY REGISTERED? </Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>RETURN_TO_LOGIN</Text>
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
    marginBottom: 24,
  },
  title: {
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    fontSize: 20,
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
  buttonTextDisabled: {
    color: "#555",
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