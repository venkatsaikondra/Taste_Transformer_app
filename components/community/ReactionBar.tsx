import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LikeButton from "./LikeButton";
import { Post } from "@/services/community.api";

interface Props {
  post: Post;
  currentUserId: string;
  onUpdate: (p: Post) => void;
  onCommentPress: () => void;
  onForkPress: () => void;
}

export default function ReactionBar({ post, currentUserId, onUpdate, onCommentPress, onForkPress }: Props) {
  return (
    <View style={styles.row}>
      <LikeButton post={post} currentUserId={currentUserId} onUpdate={onUpdate} />

      <TouchableOpacity style={styles.btn} onPress={onCommentPress} activeOpacity={0.75}>
        <Ionicons name="chatbubble-outline" size={15} color="#64748b" />
        <Text style={styles.count}>{post.comments.length}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={onForkPress} activeOpacity={0.75}>
        <Ionicons name="git-branch-outline" size={15} color="#64748b" />
        <Text style={styles.count}>Fork</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 4 },
  btn: { flexDirection: "row", alignItems: "center", gap: 5, padding: 6 },
  count: { color: "#64748b", fontSize: 12, fontWeight: "600" },
});
