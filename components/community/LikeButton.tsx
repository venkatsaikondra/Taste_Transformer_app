import React, { useState } from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { toggleLike, Post } from "@/services/community.api";

interface Props {
  post: Post;
  currentUserId: string;
  onUpdate: (updated: Post) => void;
}

export default function LikeButton({ post, currentUserId, onUpdate }: Props) {
  const [loading, setLoading] = useState(false);
  const liked = post.likes.includes(currentUserId);

  const handlePress = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const updated = await toggleLike(post._id);
      onUpdate(updated);
    } catch {
      // silent fail — optimistic UI not needed for likes
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity style={styles.btn} onPress={handlePress} activeOpacity={0.75}>
      {loading ? (
        <ActivityIndicator size={14} color="#ec4899" />
      ) : (
        <Ionicons name={liked ? "heart" : "heart-outline"} size={16} color={liked ? "#ec4899" : "#64748b"} />
      )}
      <Text style={[styles.count, liked && styles.countLiked]}>{post.likes.length}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { flexDirection: "row", alignItems: "center", gap: 5, padding: 6 },
  count: { color: "#64748b", fontSize: 12, fontWeight: "600" },
  countLiked: { color: "#ec4899" },
});
