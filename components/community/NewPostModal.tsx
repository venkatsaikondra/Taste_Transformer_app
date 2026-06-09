import React, { useState, useEffect } from "react";
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet,
  Platform, ActivityIndicator, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { createPost, Post } from "@/services/community.api";
import { fetchRecipes, Recipe } from "@/services/recipeService";

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreated: (p: Post) => void;
}

const VIBES = ["Safe", "Experimental", "Chaos"];

export default function NewPostModal({ visible, onClose, onCreated }: Props) {
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const [recipeName, setRecipeName] = useState("");
  const [recipeText, setRecipeText] = useState("");
  const [vibe, setVibe] = useState("Safe");
  const [loading, setLoading] = useState(false);

  const canSubmit = recipeName.trim().length > 0 && recipeText.trim().length > 0;

  useEffect(() => {
    if (visible) {
      (async () => {
        try {
          const data = await fetchRecipes();
          setSavedRecipes(data);
        } catch {
          // ignore
        }
      })();
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const post = await createPost({
        recipeName: recipeName.trim(),
        recipeText: recipeText.trim(),
        ingredients: selectedRecipe ? selectedRecipe.ingredients : [],
        vibe,
        totalCalories: selectedRecipe ? selectedRecipe.totalCalories : 0,
        videos: selectedRecipe ? selectedRecipe.videos : [],
      });
      onCreated(post);
      setRecipeName("");
      setRecipeText("");
      setVibe("Safe");
      setSelectedRecipe(null);
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
          {/* Saved Recipes Selection */}
          <View style={styles.field}>
            <Text style={styles.label}>SHARE_A_SAVED_RECIPE</Text>
            {savedRecipes.length === 0 ? (
              <Text style={styles.noRecipes}>No saved recipes found</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recipeList}>
                {savedRecipes.map((r) => {
                  const isSel = selectedRecipe?._id === r._id;
                  return (
                    <TouchableOpacity
                      key={r._id}
                      style={[styles.recipePill, isSel && styles.recipePillActive]}
                      onPress={() => {
                        if (isSel) {
                          setSelectedRecipe(null);
                          setRecipeName("");
                          setRecipeText("");
                          setVibe("Safe");
                        } else {
                          setSelectedRecipe(r);
                          setRecipeName(r.recipeName);
                          setRecipeText(r.recipeText || r.steps);
                          setVibe(r.vibe);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.recipePillText, isSel && styles.recipePillTextActive]}>
                        🍳 {r.recipeName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>RECIPE_NAME</Text>
            <TextInput
              style={styles.input}
              value={recipeName}
              onChangeText={(t) => {
                setRecipeName(t);
                setSelectedRecipe(null); // break connection if edited manually
              }}
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
              onChangeText={(t) => {
                setRecipeText(t);
                setSelectedRecipe(null); // break connection if edited manually
              }}
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
  noRecipes: { color: "#475569", fontSize: 12, fontFamily: MONO, marginTop: 4 },
  recipeList: { paddingVertical: 4 },
  recipePill: {
    borderWidth: 1, borderColor: "#1f1f1f",
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8,
    marginRight: 8, backgroundColor: "rgba(255,255,255,0.03)",
  },
  recipePillActive: { borderColor: ACCENT, backgroundColor: "rgba(197,251,69,0.1)" },
  recipePillText: { color: "#94a3b8", fontSize: 12, fontFamily: MONO },
  recipePillTextActive: { color: ACCENT, fontWeight: "700" },
});
