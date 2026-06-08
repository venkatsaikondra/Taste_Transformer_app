import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { fetchPosts, Post } from "@/services/community.api";
import Menu from "@/components/Menu/Menu";
import PostCard from "@/components/community/PostCard";
import NewPostModal from "@/components/community/NewPostModal";
import ActivityTicker from "@/components/community/ActivityTicker";
import { getToken, decodeUserFromToken } from "@/services/authService";

export default function CommunityScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");

  const load = useCallback(async () => {
    try {
      setError(null);
      const [data, token] = await Promise.all([fetchPosts(), getToken()]);
      setPosts(data);
      if (token) {
        const user = decodeUserFromToken(token);
        setCurrentUserId(user?.email ?? user?.username ?? "");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load posts");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const updatePost = useCallback((updated: Post) => {
    setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
  }, []);

  const onPostCreated = useCallback((p: Post) => {
    setPosts((prev) => [p, ...prev]);
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <Menu />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#c5fb45" />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Community Feed</Text>
            <Text style={styles.subtitle}>RECIPES FROM THE NETWORK</Text>
          </View>
          <TouchableOpacity style={styles.newBtn} onPress={() => setNewPostOpen(true)} activeOpacity={0.85}>
            <Ionicons name="add" size={18} color="#000" />
            <Text style={styles.newBtnText}>POST</Text>
          </TouchableOpacity>
        </View>

        <ActivityTicker />

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color="#c5fb45" size="large" />
            <Text style={styles.loadingText}>Loading feed…</Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={load}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptyDesc}>Be the first to share a recipe!</Text>
          </View>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} currentUserId={currentUserId} onUpdate={updatePost} />
          ))
        )}
      </ScrollView>

      <NewPostModal visible={newPostOpen} onClose={() => setNewPostOpen(false)} onCreated={onPostCreated} />
    </SafeAreaView>
  );
}

const ACCENT = "#c5fb45";
const MONO = Platform.OS === "ios" ? "Courier New" : "monospace";

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0a0a0f" },
  content: { paddingTop: Platform.OS === "ios" ? 110 : 90, paddingHorizontal: 14, paddingBottom: 40, gap: 14 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 },
  title: { color: "#e2e8f0", fontSize: 22, fontWeight: "800" },
  subtitle: { color: "#64748b", fontSize: 10, letterSpacing: 2, fontFamily: MONO, marginTop: 2 },
  newBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: ACCENT, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  newBtnText: { color: "#000", fontSize: 12, fontWeight: "800", fontFamily: MONO },
  centered: { paddingVertical: 60, alignItems: "center", gap: 12 },
  loadingText: { color: "#64748b", fontSize: 14, marginTop: 8 },
  errorText: { color: "#fca5a5", fontSize: 14, textAlign: "center" },
  retryBtn: { backgroundColor: ACCENT, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  retryText: { color: "#000", fontWeight: "700", fontSize: 14 },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { color: "#e2e8f0", fontSize: 18, fontWeight: "700" },
  emptyDesc: { color: "#64748b", fontSize: 13, textAlign: "center", lineHeight: 20 },
});
