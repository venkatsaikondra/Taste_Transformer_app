import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Platform, ActivityIndicator, Alert, Modal,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Menu from "@/components/Menu/Menu";
import KitchenMode from "@/components/KitchenMode/KitchenMode";
import {
  fetchRecipes, deleteRecipe, toggleFavorite,
  formatRecipeText, getVibeColor, formatDate,
  Recipe,
} from "@/services/recipeService";

export default function DashboardScreen() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [kitchenModeOpen, setKitchenModeOpen] = useState(false);

  const loadRecipes = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchRecipes();
      setRecipes(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load recipes";
      if (msg.includes("401") || msg.toLowerCase().includes("unauthorized")) {
        router.replace("/login" as never);
        return;
      }
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => { loadRecipes(); }, [loadRecipes]);

  const onRefresh = () => { setRefreshing(true); loadRecipes(); };

  const handleDelete = async (id: string) => {
    Alert.alert("Delete Recipe", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await deleteRecipe(id);
            setRecipes((prev) => prev.filter((r) => r._id !== id));
            if (selectedRecipe?._id === id) { setDetailOpen(false); setSelectedRecipe(null); }
          } catch (err: unknown) {
            Alert.alert("Error", err instanceof Error ? err.message : "Failed to delete");
          }
        },
      },
    ]);
  };

  const handleToggleFav = async (recipe: Recipe) => {
    try {
      const updated = await toggleFavorite(recipe._id, !recipe.isFavorite);
      setRecipes((prev) => prev.map((r) => r._id === recipe._id ? updated : r));
      if (selectedRecipe?._id === recipe._id) setSelectedRecipe(updated);
    } catch (err: unknown) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to update");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <Menu />
        <View style={styles.centered}>
          <Text style={styles.loadingEmoji}>👨‍🍳</Text>
          <ActivityIndicator color="#c5fb45" size="large" style={{ marginTop: 12 }} />
          <Text style={styles.loadingText}>Loading your recipes…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.root}>
        <Menu />
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadRecipes}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <Menu />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#c5fb45" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerEmoji}>👨‍🍳</Text>
            <View>
              <Text style={styles.title}>Recipe Dashboard</Text>
              <Text style={styles.subtitle}>YOUR CULINARY CREATIONS</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{recipes.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{recipes.filter((r) => r.isFavorite).length}</Text>
              <Text style={styles.statLabel}>Faves</Text>
            </View>
          </View>
        </View>

        {/* Empty state */}
        {recipes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={styles.emptyTitle}>No Recipes Yet</Text>
            <Text style={styles.emptyDesc}>Head to the Fridge and generate your first recipe!</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push("/fridge" as never)}>
              <Text style={styles.emptyBtnText}>Open Fridge</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.grid}>
            {recipes.map((recipe) => {
              const vibeColor = getVibeColor(recipe.vibe);
              return (
                <TouchableOpacity
                  key={recipe._id}
                  style={[styles.recipeCard, selectedRecipe?._id === recipe._id && styles.recipeCardSelected]}
                  onPress={() => { setSelectedRecipe(recipe); setDetailOpen(true); }}
                  activeOpacity={0.85}
                >
                  {/* Card header */}
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{recipe.recipeName || "Untitled Recipe"}</Text>
                    <TouchableOpacity
                      onPress={() => handleToggleFav(recipe)}
                      style={styles.favBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name={recipe.isFavorite ? "heart" : "heart-outline"}
                        size={18}
                        color={recipe.isFavorite ? "#ec4899" : "#64748b"}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Ingredient badges */}
                  <View style={styles.badgeRow}>
                    {recipe.ingredients.slice(0, 4).map((ing, idx) => (
                      <View key={idx} style={styles.badge}>
                        <Text style={styles.badgeText}>{ing.emoji} {ing.name}</Text>
                      </View>
                    ))}
                    {recipe.ingredients.length > 4 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>+{recipe.ingredients.length - 4}</Text>
                      </View>
                    )}
                  </View>

                  {/* Footer */}
                  <View style={styles.cardFooter}>
                    <View style={styles.vibePill}>
                      <Ionicons name="flame" size={12} color={vibeColor} />
                      <Text style={[styles.vibeText, { color: vibeColor }]}>{recipe.vibe}</Text>
                    </View>
                    {recipe.totalCalories > 0 && (
                      <Text style={styles.calText}>{recipe.totalCalories} cal</Text>
                    )}
                    <View style={styles.cardActions}>
                      <Text style={styles.dateText}>{formatDate(recipe.createdAt)}</Text>
                      <TouchableOpacity
                        onPress={() => handleDelete(recipe._id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="trash-outline" size={15} color="#64748b" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ── Detail Modal ── */}
      <Modal visible={detailOpen} animationType="slide" presentationStyle="pageSheet">
        {selectedRecipe && (
          <SafeAreaView style={styles.modalRoot}>
            {/* Modal header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={2}>{selectedRecipe.recipeName}</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setDetailOpen(false)}>
                <Ionicons name="close" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Meta row */}
              <View style={styles.metaRow}>
                <View style={styles.vibePill}>
                  <Ionicons name="flame" size={13} color={getVibeColor(selectedRecipe.vibe)} />
                  <Text style={[styles.vibeText, { color: getVibeColor(selectedRecipe.vibe) }]}>
                    {selectedRecipe.vibe} Mode
                  </Text>
                </View>
                {selectedRecipe.totalCalories > 0 && (
                  <Text style={styles.calText}>{selectedRecipe.totalCalories} cal</Text>
                )}
                <TouchableOpacity onPress={() => handleToggleFav(selectedRecipe)}>
                  <Ionicons
                    name={selectedRecipe.isFavorite ? "heart" : "heart-outline"}
                    size={20}
                    color={selectedRecipe.isFavorite ? "#ec4899" : "#64748b"}
                  />
                </TouchableOpacity>
              </View>

              {/* Ingredients */}
              {selectedRecipe.ingredients.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>INGREDIENTS</Text>
                  {selectedRecipe.ingredients.map((ing, idx) => (
                    <View key={idx} style={styles.ingRow}>
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
                <View style={styles.recipeContent}>
                  {formatRecipeText(selectedRecipe.recipeText).map((item, idx) => {
                    if (item.type === "header")
                      return <Text key={idx} style={styles.recipeHeader}>{item.content}</Text>;
                    if (item.type === "list")
                      return (
                        <View key={idx} style={styles.recipeListItem}>
                          <Text style={styles.recipeBullet}>•</Text>
                          <Text style={styles.recipeListText}>{item.content}</Text>
                        </View>
                      );
                    return <Text key={idx} style={styles.recipePara}>{item.content}</Text>;
                  })}
                </View>
              </View>

              {/* Videos */}
              {selectedRecipe.videos && selectedRecipe.videos.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>VIDEO TUTORIALS</Text>
                  {selectedRecipe.videos.map((vid) => (
                    <View key={vid.videoId} style={styles.videoCard}>
                      <Text style={styles.videoTitle} numberOfLines={2}>{vid.title}</Text>
                      <Text style={styles.videoLink}>▶ youtube.com/watch?v={vid.videoId}</Text>
                    </View>
                  ))}
                </View>
              )}
              <View style={{ height: 32 }} />
            </ScrollView>

            {/* Modal Footer with Actions */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalDeleteBtn}
                onPress={() => handleDelete(selectedRecipe._id)}
                activeOpacity={0.8}
              >
                <Ionicons name="trash-outline" size={16} color="#ef4444" />
                <Text style={styles.modalDeleteBtnText}>DELETE</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalKitchenBtn}
                onPress={() => {
                  setDetailOpen(false);
                  setKitchenModeOpen(true);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.modalKitchenBtnText}>👩‍🍳 KITCHEN MODE</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        )}
      </Modal>

      {/* ── Kitchen Mode ── */}
      {kitchenModeOpen && selectedRecipe && (
        <KitchenMode
          steps={
            selectedRecipe.recipeText
              .split("\n")
              .map((l: string) => l.trim())
              .filter((l: string) => l.length > 0)
              .filter(
                (l: string) =>
                  !/^(recipe name|ingredients?|tips?|notes?|steps?|instructions?|directions?)/i.test(
                    l,
                  ),
              )
              .map((l: string) => l.replace(/^\d+[.)]\s*|^[-•*]\s*/, ""))
          }
          onClose={() => setKitchenModeOpen(false)}
          onBackToRecipe={() => {
            setKitchenModeOpen(false);
            setDetailOpen(true);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const BG = "#0a0a0f";
const CARD = "rgba(255,255,255,0.04)";
const BORDER = "rgba(255,255,255,0.08)";
const ACCENT = "#c5fb45";
const MONO = Platform.OS === "ios" ? "Courier New" : "monospace";

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  scrollContent: {
    paddingTop: Platform.OS === "ios" ? 110 : 90,
    paddingHorizontal: 14, paddingBottom: 40, gap: 14,
  },

  // ── Header ───────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", flexWrap: "wrap", gap: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerEmoji: { fontSize: 36 },
  title: { color: "#e2e8f0", fontSize: 22, fontWeight: "800" },
  subtitle: { color: "#64748b", fontSize: 10, letterSpacing: 2, fontFamily: MONO },
  statsRow: { flexDirection: "row", gap: 8 },
  statCard: {
    backgroundColor: CARD, borderWidth: 1, borderColor: "rgba(197,251,69,0.2)",
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10, alignItems: "center",
  },
  statValue: { color: ACCENT, fontSize: 22, fontWeight: "800" },
  statLabel: { color: "#94a3b8", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 },

  // ── Loading / Error ───────────────────────────────────────────────────────
  loadingEmoji: { fontSize: 48 },
  loadingText: { color: "#64748b", fontSize: 14, marginTop: 8 },
  errorText: { color: "#fca5a5", fontSize: 14, textAlign: "center" },
  retryBtn: {
    backgroundColor: ACCENT, borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  retryBtnText: { color: "#000", fontWeight: "700", fontSize: 14 },

  // ── Empty ─────────────────────────────────────────────────────────────────
  emptyState: {
    alignItems: "center", padding: 40, gap: 12,
    backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, borderRadius: 20,
  },
  emptyEmoji: { fontSize: 60 },
  emptyTitle: { color: "#e2e8f0", fontSize: 20, fontWeight: "700" },
  emptyDesc: { color: "#94a3b8", fontSize: 14, textAlign: "center", lineHeight: 22 },
  emptyBtn: {
    backgroundColor: ACCENT, borderRadius: 12,
    paddingHorizontal: 28, paddingVertical: 14, marginTop: 8,
  },
  emptyBtnText: { color: "#000", fontWeight: "700", fontSize: 14 },

  // ── Grid ──────────────────────────────────────────────────────────────────
  grid: { gap: 12 },

  // ── Recipe Card ───────────────────────────────────────────────────────────
  recipeCard: {
    backgroundColor: CARD, borderWidth: 1, borderColor: BORDER,
    borderRadius: 18, padding: 16, gap: 10,
  },
  recipeCardSelected: { borderColor: ACCENT, backgroundColor: "rgba(197,251,69,0.06)" },
  cardHeader: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  cardTitle: { flex: 1, color: "#e2e8f0", fontSize: 16, fontWeight: "700", lineHeight: 22 },
  favBtn: { padding: 4 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  badge: {
    backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)", borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  badgeText: { color: "#cbd5e1", fontSize: 11 },
  cardFooter: {
    flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8,
    paddingTop: 8, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)",
  },
  vibePill: { flexDirection: "row", alignItems: "center", gap: 4 },
  vibeText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  calText: { color: "#94a3b8", fontSize: 11 },
  cardActions: { flexDirection: "row", alignItems: "center", gap: 10, marginLeft: "auto" },
  dateText: { color: "#64748b", fontSize: 11 },

  // ── Detail Modal ──────────────────────────────────────────────────────────
  modalRoot: { flex: 1, backgroundColor: "#0a0a0f" },
  modalHeader: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)",
  },
  modalTitle: { flex: 1, color: "#e2e8f0", fontSize: 20, fontWeight: "800", lineHeight: 26 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  modalScroll: { flex: 1, paddingHorizontal: 20 },
  metaRow: {
    flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 12,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.07)",
  },

  // ── Sections ─────────────────────────────────────────────────────────────
  section: { paddingVertical: 16, gap: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  sectionTitle: {
    color: ACCENT, fontSize: 11, fontWeight: "700",
    letterSpacing: 2, fontFamily: MONO, marginBottom: 4,
  },
  ingRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)", borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  ingEmoji: { fontSize: 22 },
  ingName: { flex: 1, color: "#e2e8f0", fontSize: 14, fontWeight: "500" },
  ingQty: { color: "#94a3b8", fontSize: 13, fontWeight: "600" },
  recipeContent: {
    backgroundColor: "rgba(0,0,0,0.3)", borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)", borderRadius: 14, padding: 14, gap: 4,
  },
  recipeHeader: {
    color: ACCENT, fontSize: 13, fontWeight: "700",
    textTransform: "capitalize", letterSpacing: 0.5, marginTop: 12, marginBottom: 4,
  },
  recipeListItem: { flexDirection: "row", gap: 8, marginVertical: 3, paddingLeft: 4 },
  recipeBullet: { color: ACCENT, fontWeight: "700", fontSize: 16 },
  recipeListText: { flex: 1, color: "#e2e8f0", fontSize: 14, lineHeight: 22 },
  recipePara: { color: "#cbd5e1", fontSize: 14, lineHeight: 22, marginVertical: 3 },
  videoCard: {
    backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)", borderRadius: 12,
    padding: 12, gap: 4,
  },
  videoTitle: { color: "#e2e8f0", fontSize: 13, fontWeight: "600" },
  videoLink: { color: ACCENT, fontSize: 11, fontFamily: MONO },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#0a0a0f",
  },
  modalDeleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
    borderRadius: 12,
    height: 48,
  },
  modalDeleteBtnText: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "700",
    fontFamily: MONO,
  },
  modalKitchenBtn: {
    flex: 1,
    backgroundColor: ACCENT,
    borderRadius: 12,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  modalKitchenBtnText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "700",
    fontFamily: MONO,
  },
});