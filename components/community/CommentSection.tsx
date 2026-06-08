import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Platform, ActivityIndicator, ScrollView,
} from "react-native";
import { addComment, Post, Comment } from "@/services/community.api";

interface Props {
  post: Post;
  onUpdate: (p: Post) => void;
}

export default function CommentSection({ post, onUpdate }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const updated = await addComment(post._id, text.trim());
      onUpdate(updated);
      setText("");
    } catch {
      // no-op
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>COMMENTS</Text>

      {post.comments.length === 0 ? (
        <Text style={styles.empty}>No comments yet. Be the first!</Text>
      ) : (
        post.comments.map((c: Comment) => (
          <View key={c._id} style={styles.comment}>
            <Text style={styles.author}>@{c.author.username}</Text>
            <Text style={styles.content}>{c.content}</Text>
          </View>
        ))
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Add a comment…"
          placeholderTextColor="#475569"
          value={text}
          onChangeText={setText}
          selectionColor="#c5fb45"
          returnKeyType="send"
          onSubmitEditing={submit}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
          onPress={submit}
          disabled={!text.trim() || loading}
          activeOpacity={0.8}
        >
          {loading
            ? <ActivityIndicator size={14} color="#000" />
            : <Text style={styles.sendText}>POST</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const ACCENT = "#c5fb45";
const MONO = Platform.OS === "ios" ? "Courier New" : "monospace";

const styles = StyleSheet.create({
  root: { gap: 10 },
  title: { color: ACCENT, fontSize: 10, letterSpacing: 2, fontFamily: MONO, fontWeight: "700" },
  empty: { color: "#475569", fontSize: 13, fontStyle: "italic" },
  comment: {
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)", borderRadius: 10, padding: 10, gap: 4,
  },
  author: { color: ACCENT, fontSize: 11, fontFamily: MONO, fontWeight: "700" },
  content: { color: "#e2e8f0", fontSize: 13, lineHeight: 20 },
  inputRow: { flexDirection: "row", gap: 8, alignItems: "center", marginTop: 4 },
  input: {
    flex: 1, color: "#e2e8f0", fontSize: 13, paddingVertical: 10,
    paddingHorizontal: 14, backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderRadius: 12,
  },
  sendBtn: {
    backgroundColor: ACCENT, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  sendBtnDisabled: { backgroundColor: "#1f1f1f" },
  sendText: { color: "#000", fontSize: 11, fontWeight: "800", fontFamily: MONO },
});
