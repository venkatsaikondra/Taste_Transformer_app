import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Platform, ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fetchRecipes, deleteRecipe, toggleFavorite, formatRecipeText, getVibeColor, formatDate, Recipe } from "@/services/recipeService";

const ACCENT = "#c5fb45";
const MONO = Platform.OS === "ios" ? "Courier New" : "monospace";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const all = await fetchRecipes();
        const found = all.find((r) => r._id === id) ?? null;
        setRecipe(found);
      } catch {
        setRecipe(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = () => {
    if (!recipe) return;
    Alert.alert("Delete Recipe", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          try {
            await deleteRecipe(recipe._id);
            router.back();
          } catch (err: unknown) {
            Alert.alert("Error", err instanceof Error ? err.message : "Failed to delete");
          }
        },
      },
    ]);
  };

  const handleToggleFav = async () => {
    if (!recipe) return;
    try {
      const updated = await toggleFavorite(recipe._id, !recipe.isFavorite);
      setRecipe(updated);
    } catch { /* no-op */ }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.centered}>
          <ActivityIndicator color={ACCENT} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Recipe not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const vibeColor = getVibeColor(recipe.vibe);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#94a3b8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{recipe.recipeName}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={handleToggleFav}>
          <Ionicons name={recipe.isFavorite ? "heart" : "heart-outline"} size={20} color={recipe.isFavorite ? "#ec4899" : "#64748b"} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Meta */}
        <View style={styles.metaRow}>
          <View style={[styles.vibePill, { borderColor: vibeColor + "40" }]}>
            <Ionicons name="flame" size={12} color={vibeColor} />
            <Text style={[styles.vibeText, { color: vibeColor }]}>{recipe.vibe}</Text>
          </View>
          {recipe.totalCalories > 0 && <Text style={styles.calText}>{recipe.totalCalories} cal</Text>}
          <Text style={styles.dateText}>{formatDate(recipe.createdAt)}</Text>
        </View>

        {/* Ingredients */}
        {recipe.ingredients.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INGREDIENTS</Text>
            {recipe.ingredients.map((ing, i) => (
              <View key={i} style={styles.ingRow}>
                <Text style={styles.ingEmoji}>{ing.emoji}</Text>
                <Text style={styles.ingName}>{ing.name}</Text>
                {ing.quantity > 0 && <Text style={styles.ingQty}>× {ing.quantity}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Recipe text */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECIPE</Text>
          <View style={styles.recipeBox}>
            {formatRecipeText(recipe.recipeText).map((item, i) => {
              if (item.type === "header") return <Text key={i} style={styles.recipeHeader}>{item.content}</Text>;
              if (item.type === "list") return (
                <View key={i} style={styles.listRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>{item.content}</Text>
                </View>
              );
              return <Text key={i} style={styles.para}>{item.content}</Text>;
            })}
          </View>
        </View>

        {/* Delete */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={16} color="#ef4444" />
          <Text style={styles.deleteBtnText}>Delete Recipe</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0a0a0f" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: "#fca5a5", fontSize: 14 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)" },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, color: "#e2e8f0", fontSize: 16, fontWeight: "700", marginHorizontal: 12 },
  scroll: { flex: 1, paddingHorizontal: 20 },
  metaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 12, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.07)" },
  vibePill: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  vibeText: { fontSize: 11, fontWeight: "700", fontFamily: MONO },
  calText: { color: "#94a3b8", fontSize: 12 },
  dateText: { color: "#64748b", fontSize: 12 },
  section: { paddingVertical: 16, gap: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  sectionTitle: { color: ACCENT, fontSize: 11, fontWeight: "700", letterSpacing: 2, fontFamily: MONO },
  ingRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  ingEmoji: { fontSize: 20 },
  ingName: { flex: 1, color: "#e2e8f0", fontSize: 14 },
  ingQty: { color: "#94a3b8", fontSize: 13 },
  recipeBox: { backgroundColor: "rgba(0,0,0,0.3)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", borderRadius: 14, padding: 14, gap: 4 },
  recipeHeader: { color: ACCENT, fontSize: 13, fontWeight: "700", marginTop: 10, marginBottom: 4, textTransform: "capitalize" },
  listRow: { flexDirection: "row", gap: 8, marginVertical: 3 },
  bullet: { color: ACCENT, fontWeight: "700", fontSize: 15 },
  listText: { flex: 1, color: "#e2e8f0", fontSize: 14, lineHeight: 22 },
  para: { color: "#cbd5e1", fontSize: 14, lineHeight: 22, marginVertical: 3 },
  deleteBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 24, paddingVertical: 14, backgroundColor: "rgba(239,68,68,0.1)", borderWidth: 1, borderColor: "rgba(239,68,68,0.3)", borderRadius: 14 },
  deleteBtnText: { color: "#ef4444", fontSize: 14, fontWeight: "600" },
});
