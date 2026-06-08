import React, { useState } from "react";
import {
  Modal, View, Text, TouchableOpacity,
  StyleSheet, Platform, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { forkPost, Post } from "@/services/community.api";

interface Props {
  visible: boolean;
  post: Post | null;
  onClose: () => void;
  onForked: (p: Post) => void;
}

export default function ForkModal({ visible, post, onClose, onForked }: Props) {
  const [loading, setLoading] = useState(false);

  const handleFork = async () => {
    if (!post) return;
    setLoading(true);
    try {
      const forked = await forkPost(post._id);
      onForked(forked);
      onClose();
    } catch {
      // no-op
    } finally {
      setLoading(false);
    }
  };

  if (!post) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.corner} />
          <Text style={styles.title}>FORK_RECIPE</Text>
          <Text style={styles.desc}>
            This will save a copy of "{post.recipeName}" to your dashboard for you to remix.
          </Text>
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.cancelText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.forkBtn} onPress={handleFork} disabled={loading} activeOpacity={0.85}>
              {loading
                ? <ActivityIndicator color="#000" size={14} />
                : <Text style={styles.forkText}>CONFIRM_FORK</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const ACCENT = "#c5fb45";
const MONO = Platform.OS === "ios" ? "Courier New" : "monospace";

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center", justifyContent: "center", padding: 24,
  },
  sheet: {
    width: "100%", maxWidth: 400,
    backgroundColor: "#0a0a0a", borderWidth: 1,
    borderColor: "#1f1f1f", borderRadius: 20, padding: 24, gap: 16,
    position: "relative",
  },
  corner: {
    position: "absolute", top: -1, left: -1,
    width: 14, height: 14,
    borderTopWidth: 2, borderLeftWidth: 2, borderColor: ACCENT,
  },
  title: { color: "#fff", fontSize: 16, fontWeight: "900", fontFamily: MONO },
  desc: { color: "#94a3b8", fontSize: 13, lineHeight: 20 },
  btnRow: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1, borderWidth: 1, borderColor: "#1f1f1f",
    borderRadius: 10, paddingVertical: 13, alignItems: "center",
  },
  cancelText: { color: "#64748b", fontSize: 11, fontWeight: "700", fontFamily: MONO },
  forkBtn: {
    flex: 1, backgroundColor: ACCENT,
    borderRadius: 10, paddingVertical: 13, alignItems: "center",
  },
  forkText: { color: "#000", fontSize: 11, fontWeight: "800", fontFamily: MONO },
});
