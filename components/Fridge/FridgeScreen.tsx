import React, { useState, useMemo, useCallback } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  FlatList, StyleSheet, Platform, Alert, ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { CATEGORIES, IngredientItem } from "@/constants/ingredients";
import { generateRecipe, saveRecipe, formatRecipeText } from "@/services/recipeService";
import Menu from "@/components/Menu/Menu";

type CartItem = IngredientItem & { qty: number };

const NUM_COLS = 3;

export default function FridgeScreen() {
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  // Recipe generation
  const [recipeText, setRecipeText] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);

  const activeCategory = useMemo(
    () => CATEGORIES.find((c) => c.id === activeCatId) ?? null,
    [activeCatId]
  );

  // Items shown in grid
  const displayedItems = useMemo(() => {
    if (!activeCategory) return [];
    if (!searchQuery.trim()) return activeCategory.items;
    const q = searchQuery.toLowerCase();
    return activeCategory.items.filter((i) => i.name.toLowerCase().includes(q));
  }, [activeCategory, searchQuery]);

  // Global search across all categories
  const globalResults = useMemo(() => {
    if (!searchQuery.trim() || activeCatId) return [];
    const q = searchQuery.toLowerCase();
    const out: (IngredientItem & { catColor: string; catLabel: string })[] = [];
    for (const cat of CATEGORIES) {
      for (const item of cat.items) {
        if (item.name.toLowerCase().includes(q))
          out.push({ ...item, catColor: cat.color, catLabel: cat.label });
      }
    }
    return out;
  }, [searchQuery, activeCatId]);

  const totalCal = cart.reduce((s, c) => s + c.cal * c.qty, 0);
  const totalItems = cart.reduce((s, c) => s + c.qty, 0);

  const addItem = useCallback((item: IngredientItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) return prev.map((c) => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setCart((prev) => {
      const item = prev.find((c) => c.id === id);
      if (!item) return prev;
      if (item.qty > 1) return prev.map((c) => c.id === id ? { ...c, qty: c.qty - 1 } : c);
      return prev.filter((c) => c.id !== id);
    });
  }, []);

  const increaseItem = useCallback((id: string) => {
    setCart((prev) => prev.map((c) => c.id === id ? { ...c, qty: c.qty + 1 } : c));
  }, []);

  const handleGenerate = async () => {
    if (cart.length === 0) {
      Alert.alert("Empty Pot", "Add some ingredients before generating a recipe.");
      return;
    }
    setGenError(null);
    setGenerating(true);
    try {
      const recipe = await generateRecipe(cart.map((c) => c.name));
      setRecipeText(recipe);
      setRecipeModalOpen(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate recipe";
      if (msg.includes("limit")) {
        setGenError("Free generation limit reached.");
      } else {
        setGenError(msg);
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!recipeText) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const lines = recipeText.split("\n").filter((l) => l.trim());
      const recipeName = lines[0]?.replace(/^(recipe:|name:)/i, "").trim() || "Untitled Recipe";
      await saveRecipe({
        recipeName,
        ingredients: cart.map((c) => ({ name: c.name, emoji: c.emoji, quantity: c.qty })),
        steps: recipeText,
        vibe: "Safe",
        totalCalories: totalCal,
        recipeText,
        videos: [],
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: unknown) {
      Alert.alert("Save Failed", err instanceof Error ? err.message : "Could not save recipe");
    } finally {
      setSaving(false);
    }
  };

  // ─── Ingredient Card ─────────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item, catColor }: { item: IngredientItem; catColor: string }) => {
      const inCart = cart.find((c) => c.id === item.id);
      return (
        <TouchableOpacity
          style={[styles.itemCard, inCart && { borderColor: catColor }]}
          onPress={() => addItem(item)}
          activeOpacity={0.75}
        >
          {inCart && (
            <View style={[styles.itemBadge, { backgroundColor: catColor }]}>
              <Text style={styles.itemBadgeText}>{inCart.qty}</Text>
            </View>
          )}
          <Text style={styles.itemEmoji}>{item.emoji}</Text>
          <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.itemCal}>{item.cal} kcal</Text>
        </TouchableOpacity>
      );
    },
    [cart, addItem]
  );

  const showGlobal = !activeCatId && searchQuery.trim().length > 0;

  return (
    <SafeAreaView style={styles.root}>
      <Menu />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Fridge Panel ── */}
        <View style={styles.fridgePanel}>
          {/* Header */}
          <View style={styles.panelHeader}>
            <Text style={styles.panelIcon}>❄️</Text>
            <View>
              <Text style={styles.panelTitle}>Ingredient Box</Text>
              <Text style={styles.panelSub}>PICK YOUR INGREDIENTS</Text>
            </View>
          </View>

          {/* Search */}
          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={16} color="#475569" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={activeCatId ? `Search in ${activeCategory?.label}…` : "Search all ingredients…"}
              placeholderTextColor="#475569"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.searchClear}>
                <Ionicons name="close" size={14} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Category tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabContent}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.tab, activeCatId === cat.id && { borderColor: cat.color, backgroundColor: "rgba(255,255,255,0.06)" }]}
                onPress={() => {
                  setSearchQuery("");
                  setActiveCatId((prev) => (prev === cat.id ? null : cat.id));
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.tabEmoji}>{cat.emoji}</Text>
                <Text style={[styles.tabLabel, activeCatId === cat.id && { color: cat.color }]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Category banner */}
          {(activeCategory || showGlobal) && (
            <View style={[styles.catBanner, { borderLeftColor: activeCategory?.color ?? "#94a3b8" }]}>
              <Text style={[styles.catBannerText, { color: activeCategory?.color ?? "#94a3b8" }]}>
                {showGlobal ? "🔎  SEARCH RESULTS" : `${activeCategory!.emoji}  ${activeCategory!.label.toUpperCase()}`}
              </Text>
              <Text style={styles.catBannerCount}>
                {showGlobal ? `${globalResults.length} found` : `${displayedItems.length} items`}
              </Text>
            </View>
          )}

          {/* Items grid */}
          {showGlobal ? (
            <View style={styles.grid}>
              {globalResults.map((item) => (
                <View key={item.id} style={styles.gridCell}>
                  {renderItem({ item, catColor: item.catColor })}
                </View>
              ))}
            </View>
          ) : activeCategory ? (
            <View style={styles.grid}>
              {displayedItems.map((item) => (
                <View key={item.id} style={styles.gridCell}>
                  {renderItem({ item, catColor: activeCategory.color })}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>👆</Text>
              <Text style={styles.emptyText}>Select a category or search to browse</Text>
            </View>
          )}
        </View>

        {/* ── Cooking Pot ── */}
        <View style={styles.potPanel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelIcon}>🫕</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.panelTitle}>Cooking Pot</Text>
              <Text style={styles.panelSub}>
                {cart.length === 0
                  ? "Empty — add ingredients!"
                  : `${totalItems} item${totalItems !== 1 ? "s" : ""} · ${totalCal} kcal`}
              </Text>
            </View>
          </View>

          {/* Cart items */}
          {cart.length === 0 ? (
            <View style={styles.cartEmpty}>
              <Text style={styles.cartEmptyPot}>🫕</Text>
              <Text style={styles.emptyText}>Click ingredients to toss them in!</Text>
            </View>
          ) : (
            cart.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <Text style={styles.cartEmoji}>{item.emoji}</Text>
                <View style={styles.cartInfo}>
                  <Text style={styles.cartName}>{item.name}</Text>
                  <Text style={styles.cartCal}>{item.cal * item.qty} kcal</Text>
                </View>
                <View style={styles.cartControls}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => removeItem(item.id)}>
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qty}>{item.qty}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => increaseItem(item.id)}>
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          {cart.length > 0 && (
            <View style={styles.cartFooter}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Calories</Text>
                <Text style={styles.totalVal}>{totalCal} kcal</Text>
              </View>

              {genError && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>⚠️ {genError}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.generateBtn, generating && styles.generateBtnDisabled]}
                onPress={handleGenerate}
                disabled={generating}
                activeOpacity={0.85}
              >
                {generating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.generateBtnText}>✨  Generate Recipe</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => { setCart([]); setRecipeText(null); setGenError(null); }}
                activeOpacity={0.8}
              >
                <Text style={styles.clearBtnText}>Clear Pot</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Recipe Modal ── */}
      <Modal visible={recipeModalOpen} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalRoot}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>GENERATED_RECIPE.exe</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.saveBtn, saveSuccess && styles.saveBtnSuccess]}
                onPress={handleSave}
                disabled={saving || saveSuccess}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#c5fb45" />
                ) : (
                  <Text style={styles.saveBtnText}>{saveSuccess ? "✓ Saved" : "💾 Save"}</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeModalBtn} onPress={() => setRecipeModalOpen(false)}>
                <Ionicons name="close" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {recipeText &&
              formatRecipeText(recipeText).map((item, idx) => {
                if (item.type === "header") {
                  return (
                    <Text key={idx} style={styles.recipeHeader}>{item.content}</Text>
                  );
                } else if (item.type === "list") {
                  return (
                    <View key={idx} style={styles.recipeListItem}>
                      <Text style={styles.recipeBullet}>•</Text>
                      <Text style={styles.recipeListText}>{item.content}</Text>
                    </View>
                  );
                } else {
                  return <Text key={idx} style={styles.recipeParagraph}>{item.content}</Text>;
                }
              })}
            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const BG = "#0a0a0f";
const CARD = "rgba(255,255,255,0.03)";
const BORDER = "rgba(255,255,255,0.08)";
const ACCENT = "#c5fb45";
const MONO = Platform.OS === "ios" ? "Courier New" : "monospace";

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: Platform.OS === "ios" ? 110 : 90,
    paddingHorizontal: 14,
    paddingBottom: 40,
    gap: 14,
  },

  // ── Panels ──────────────────────────────────────────────────────────────
  fridgePanel: {
    backgroundColor: CARD, borderWidth: 1, borderColor: BORDER,
    borderRadius: 20, padding: 16, gap: 12,
  },
  potPanel: {
    backgroundColor: CARD, borderWidth: 1, borderColor: BORDER,
    borderRadius: 20, padding: 16, gap: 10,
  },
  panelHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  panelIcon: { fontSize: 28 },
  panelTitle: { color: "#e2e8f0", fontSize: 18, fontWeight: "800" },
  panelSub: { color: "#64748b", fontSize: 10, letterSpacing: 1.5, fontFamily: MONO, marginTop: 2 },

  // ── Search ───────────────────────────────────────────────────────────────
  searchRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: BORDER,
    borderRadius: 12, paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: "#e2e8f0", fontSize: 14, paddingVertical: 11 },
  searchClear: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center", justifyContent: "center",
  },

  // ── Tabs ─────────────────────────────────────────────────────────────────
  tabScroll: { flexGrow: 0 },
  tabContent: { gap: 8, paddingRight: 4 },
  tab: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
    borderRadius: 14,
  },
  tabEmoji: { fontSize: 14 },
  tabLabel: { color: "#94a3b8", fontSize: 12, fontWeight: "600" },

  // ── Category Banner ───────────────────────────────────────────────────────
  catBanner: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderLeftWidth: 3, borderRadius: 8,
  },
  catBannerText: { fontFamily: MONO, fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  catBannerCount: { color: "#64748b", fontSize: 11 },

  // ── Item Grid ─────────────────────────────────────────────────────────────
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  gridCell: { width: "31.5%" },
  itemCard: {
    flex: 1, minWidth: 90,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
    borderRadius: 14, padding: 10,
    alignItems: "center", gap: 4, position: "relative",
  },
  itemEmoji: { fontSize: 28, marginBottom: 2 },
  itemName: { color: "#cbd5e1", fontSize: 11, fontWeight: "600", textAlign: "center" },
  itemCal: { color: "#475569", fontSize: 10 },
  itemBadge: {
    position: "absolute", top: 6, right: 6,
    width: 18, height: 18, borderRadius: 9,
    alignItems: "center", justifyContent: "center",
  },
  itemBadgeText: { color: "#000", fontSize: 10, fontWeight: "800" },

  // ── Empty State ───────────────────────────────────────────────────────────
  emptyState: { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyEmoji: { fontSize: 36 },
  emptyText: { color: "#475569", fontSize: 13, textAlign: "center" },

  // ── Cart ──────────────────────────────────────────────────────────────────
  cartEmpty: { alignItems: "center", paddingVertical: 24, gap: 8 },
  cartEmptyPot: { fontSize: 40, opacity: 0.3 },
  cartItem: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: BORDER,
    borderRadius: 12, padding: 10,
  },
  cartEmoji: { fontSize: 22 },
  cartInfo: { flex: 1 },
  cartName: { color: "#e2e8f0", fontSize: 13, fontWeight: "600" },
  cartCal: { color: "#475569", fontSize: 11, marginTop: 2 },
  cartControls: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center", justifyContent: "center",
  },
  qtyBtnText: { color: "#e2e8f0", fontSize: 16, fontWeight: "700", lineHeight: 20 },
  qty: { color: "#e2e8f0", fontSize: 13, fontWeight: "700", minWidth: 16, textAlign: "center" },

  // ── Cart Footer ───────────────────────────────────────────────────────────
  cartFooter: { gap: 10, paddingTop: 12, borderTopWidth: 1, borderTopColor: BORDER },
  totalRow: { flexDirection: "row", justifyContent: "space-between" },
  totalLabel: { color: "#64748b", fontSize: 13 },
  totalVal: { color: "#e2e8f0", fontSize: 13, fontWeight: "700" },
  errorBanner: {
    backgroundColor: "rgba(239,68,68,0.1)", borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)", borderRadius: 10, padding: 10,
  },
  errorText: { color: "#fca5a5", fontSize: 13 },
  generateBtn: {
    backgroundColor: "#22c55e", borderRadius: 14,
    paddingVertical: 16, alignItems: "center", justifyContent: "center",
  },
  generateBtnDisabled: { opacity: 0.6 },
  generateBtnText: { color: "#fff", fontWeight: "800", fontSize: 15, letterSpacing: 0.5 },
  clearBtn: {
    borderWidth: 1, borderColor: BORDER,
    borderRadius: 10, paddingVertical: 10, alignItems: "center",
  },
  clearBtnText: { color: "#475569", fontSize: 12, fontWeight: "600" },

  // ── Recipe Modal ──────────────────────────────────────────────────────────
  modalRoot: { flex: 1, backgroundColor: "#0a0a0f" },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: "rgba(197,251,69,0.15)",
  },
  modalTitle: {
    color: ACCENT, fontFamily: MONO, fontSize: 13,
    letterSpacing: 1, fontWeight: "700",
  },
  modalActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  saveBtn: {
    backgroundColor: "rgba(197,251,69,0.1)",
    borderWidth: 1, borderColor: "rgba(197,251,69,0.3)",
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7,
    minWidth: 70, alignItems: "center",
  },
  saveBtnSuccess: { backgroundColor: "rgba(34,197,94,0.2)", borderColor: "rgba(34,197,94,0.5)" },
  saveBtnText: { color: ACCENT, fontSize: 12, fontWeight: "700" },
  closeModalBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  modalScroll: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  recipeHeader: {
    color: ACCENT, fontSize: 14, fontWeight: "700",
    textTransform: "capitalize", letterSpacing: 0.5,
    marginTop: 18, marginBottom: 8,
  },
  recipeListItem: { flexDirection: "row", gap: 10, marginVertical: 4, paddingLeft: 4 },
  recipeBullet: { color: ACCENT, fontWeight: "700", fontSize: 16 },
  recipeListText: { color: "#e2e8f0", fontSize: 14, lineHeight: 22, flex: 1 },
  recipeParagraph: { color: "#cbd5e1", fontSize: 14, lineHeight: 22, marginVertical: 4 },
});