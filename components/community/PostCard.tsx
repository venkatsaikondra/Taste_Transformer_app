import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Post } from "@/services/community.api";
import { getVibeColor, formatDate } from "@/services/recipeService";
import ReactionBar from "./ReactionBar";
import CommentSection from "./CommentSection";
import ForkModal from "./ForkModal";

interface Props {
  post: Post;
  currentUserId: string;
  onUpdate: (p: Post) => void;
}

export default function PostCard({ post, currentUserId, onUpdate }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [forkVisible, setForkVisible] = useState(false);
  const vibeColor = getVibeColor(post.vibe);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{post.author.username[0].toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.author}>@{post.author.username}</Text>
          <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
        </View>
        <View style={[styles.vibePill, { borderColor: vibeColor + "40" }]}>
          <Text style={[styles.vibeText, { color: vibeColor }]}>{post.vibe}</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>{post.recipeName}</Text>

      {/* Forked badge */}
      {post.forkedFrom && (
        <View style={styles.forkBadge}>
          <Ionicons name="git-branch-outline" size={11} color="#64748b" />
          <Text style={styles.forkText}>forked</Text>
        </View>
      )}

      {/* Ingredient badges */}
      {post.ingredients.length > 0 && (
        <View style={styles.ingredients}>
          {post.ingredients.slice(0, 5).map((ing, i) => (
            <View key={i} style={styles.badge}>
              <Text style={styles.badgeText}>{ing.emoji} {ing.name}</Text>
            </View>
          ))}
          {post.ingredients.length > 5 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>+{post.ingredients.length - 5}</Text>
            </View>
          )}
        </View>
      )}

      {/* Recipe preview */}
      <TouchableOpacity onPress={() => setExpanded((e) => !e)} activeOpacity={0.85}>
        <Text style={styles.preview} numberOfLines={expanded ? undefined : 3}>
          {post.recipeText}
        </Text>
        <Text style={styles.toggle}>{expanded ? "Show less ↑" : "Read more ↓"}</Text>
      </TouchableOpacity>

      {/* Reactions */}
      <View style={styles.footer}>
        <ReactionBar
          post={post}
          currentUserId={currentUserId}
          onUpdate={onUpdate}
          onCommentPress={() => setShowComments((v) => !v)}
          onForkPress={() => setForkVisible(true)}
        />
      </View>

      {/* Comments */}
      {showComments && (
        <View style={styles.commentsSection}>
          <CommentSection post={post} onUpdate={onUpdate} />
        </View>
      )}

      <ForkModal
        visible={forkVisible}
        post={post}
        onClose={() => setForkVisible(false)}
        onForked={onUpdate}
      />
    </View>
  );
}

const MONO = Platform.OS === "ios" ? "Courier New" : "monospace";

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 18, padding: 16, gap: 10,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(197,251,69,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: "#c5fb45", fontWeight: "800", fontSize: 15 },
  author: { color: "#e2e8f0", fontSize: 13, fontWeight: "700" },
  date: { color: "#475569", fontSize: 11, marginTop: 1 },
  vibePill: {
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  vibeText: { fontSize: 10, fontWeight: "700", fontFamily: MONO, letterSpacing: 0.5 },
  title: { color: "#f1f5f9", fontSize: 16, fontWeight: "800", lineHeight: 22 },
  forkBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
  },
  forkText: { color: "#64748b", fontSize: 10, fontFamily: MONO },
  ingredients: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  badge: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
  },
  badgeText: { color: "#94a3b8", fontSize: 11 },
  preview: { color: "#94a3b8", fontSize: 13, lineHeight: 20 },
  toggle: { color: "#c5fb45", fontSize: 11, fontFamily: MONO, marginTop: 4 },
  footer: {
    flexDirection: "row", borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)", paddingTop: 8,
  },
  commentsSection: {
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)", paddingTop: 12,
  },
});
