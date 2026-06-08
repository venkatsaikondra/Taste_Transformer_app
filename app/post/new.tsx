import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Platform, ActivityIndicator, ScrollView, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { createPost } from "@/services/community.api";

const ACCENT = "#c5fb45";
const MONO = Platform.OS === "ios" ? "Courier New" : "monospace";
const VIBES = ["Safe", "Experimental", "Chaos"];

export default function NewPostScreen() {
  const router = useRouter();
  const [recipeName, setRecipeName] = useState("");
  const [recipeText, setRecipeText] = useState("");
  const [vibe, setVibe] = useState("Safe");
  const [loading, setLoading] = useState(false);

  const canSubmit = recipeName.trim().length > 0 && recipeText.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await createPost({ recipeName: recipeName.trim(), recipeText: recipeText.trim(), ingredients: [], vibe, totalCalories: 0 });
      router.back();
    } catch (err: unknown) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#94a3b8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NEW_POST.exe</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.field}>
          <Text style={styles.label}>RECIPE_NAME</Text>
          <TextInput style={styles.input} value={recipeName} onChangeText={setRecipeName} placeholder="My Secret Recipe" placeholderTextColor="#3f3f3f" selectionColor={ACCENT} />
          <View style={styles.underline} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>VIBE</Text>
          <View style={styles.vibeRow}>
            {VIBES.map((v) => (
              <TouchableOpacity key={v} style={[styles.vibePill, vibe === v && styles.vibePillActive]} onPress={() => setVibe(v)}>
                <Text style={[styles.vibeText, vibe === v && styles.vibeTextActive]}>{v}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>RECIPE_TEXT</Text>
          <TextInput style={[styles.input, styles.textArea]} value={recipeText} onChangeText={setRecipeText} placeholder="Describe your recipe..." placeholderTextColor="#3f3f3f" selectionColor={ACCENT} multiline textAlignVertical="top" />
          <View style={styles.underline} />
        </View>

        <TouchableOpacity style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={!canSubmit || loading}>
          {loading ? <ActivityIndicator color="#000" /> : <Text style={[styles.submitText, !canSubmit && styles.submitTextDisabled]}>PUBLISH_POST</Text>}
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#050505" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "rgba(197,251,69,0.15)" },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  headerTitle: { color: ACCENT, fontSize: 13, fontFamily: MONO, fontWeight: "700", letterSpacing: 1 },
  scroll: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  field: { marginBottom: 24 },
  label: { color: ACCENT, fontSize: 10, letterSpacing: 2, fontFamily: MONO, marginBottom: 8 },
  input: { color: "#fff", fontSize: 14, paddingVertical: 8, fontFamily: MONO, backgroundColor: "transparent" },
  textArea: { minHeight: 160, paddingTop: 8 },
  underline: { height: 1, backgroundColor: "#1f1f1f" },
  vibeRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  vibePill: { borderWidth: 1, borderColor: "#1f1f1f", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  vibePillActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  vibeText: { color: "#64748b", fontSize: 12, fontWeight: "600", fontFamily: MONO },
  vibeTextActive: { color: "#000", fontWeight: "800" },
  submitBtn: { backgroundColor: ACCENT, borderRadius: 4, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  submitBtnDisabled: { backgroundColor: "#1f1f1f" },
  submitText: { color: "#000", fontSize: 11, fontWeight: "800", letterSpacing: 3, fontFamily: MONO },
  submitTextDisabled: { color: "#555" },
});
