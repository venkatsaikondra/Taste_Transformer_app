import React, { useState } from "react";
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet,
  Platform, ActivityIndicator, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { createPost, Post } from "@/services/community.api";

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreated: (p: Post) => void;
}

const VIBES = ["Safe", "Experimental", "Chaos"];

export default function NewPostModal({ visible, onClose, onCreated }: Props) {
  const [recipeName, setRecipeName] = useState("");
  const [recipeText, setRecipeText] = useState("");
  const [vibe, setVibe] = useState("Safe");
  const [loading, setLoading] = useState(false);

  const canSubmit = recipeName.trim().length > 0 && recipeText.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const post = await createPost({
        recipeName: recipeName.trim(),
        recipeText: recipeText.trim(),
        ingredients: [],
        vibe,
        totalCalories: 0,
      });
      onCreated(post);
      setRecipeName("");
      setRecipeText("");
      setVibe("Safe");
      onClose();
    } catch {
      // no-op
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.title}>NEW_POST.exe</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.field}>
            <Text style={styles.label}>RECIPE_NAME</Text>
            <TextInput
              style={styles.input}
              value={recipeName}
              onChangeText={setRecipeName}
              placeholder="My Secret Recipe"
              placeholderTextColor="#3f3f3f"
              selectionColor="#c5fb45"
            />
            <View style={styles.underline} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>VIBE</Text>
            <View style={styles.vibeRow}>
              {VIBES.map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[styles.vibePill, vibe === v && styles.vibePillActive]}
                  onPress={() => setVibe(v)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.vibeText, vibe === v && styles.vibeTextActive]}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>RECIPE_TEXT</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={recipeText}
              onChangeText={setRecipeText}
              placeholder="Describe your recipe steps..."
              placeholderTextColor="#3f3f3f"
              selectionColor="#c5fb45"
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
            <View style={styles.underline} />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit || loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#000" />
              : <Text style={[styles.submitText, !canSubmit && styles.submitTextDisabled]}>
                  PUBLISH_POST
                </Text>
            }
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const ACCENT = "#c5fb45";
const MONO = Platform.OS === "ios" ? "Courier New" : "monospace";

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#050505" },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: "rgba(197,251,69,0.15)",
  },
  title: { color: ACCENT, fontSize: 13, fontFamily: MONO, fontWeight: "700", letterSpacing: 1 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  scroll: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  field: { marginBottom: 24 },
  label: { color: ACCENT, fontSize: 10, letterSpacing: 2, fontFamily: MONO, marginBottom: 8 },
  input: { color: "#fff", fontSize: 14, paddingVertical: 8, fontFamily: MONO, backgroundColor: "transparent" },
  textArea: { minHeight: 140, paddingTop: 8 },
  underline: { height: 1, backgroundColor: "#1f1f1f" },
  vibeRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  vibePill: {
    borderWidth: 1, borderColor: "#1f1f1f",
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
  },
  vibePillActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  vibeText: { color: "#64748b", fontSize: 12, fontWeight: "600", fontFamily: MONO },
  vibeTextActive: { color: "#000", fontWeight: "800" },
  submitBtn: {
    backgroundColor: ACCENT, borderRadius: 4,
    paddingVertical: 16, alignItems: "center", marginTop: 8,
  },
  submitBtnDisabled: { backgroundColor: "#1f1f1f" },
  submitText: { color: "#000", fontSize: 11, fontWeight: "800", letterSpacing: 3, fontFamily: MONO },
  submitTextDisabled: { color: "#555" },
});
