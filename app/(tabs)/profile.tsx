import React from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Platform, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import Menu from "@/components/Menu/Menu";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.root}>
      <Menu />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.username?.[0]?.toUpperCase() ?? "?"}
            </Text>
          </View>
          <Text style={styles.username}>{user?.username ?? "Unknown"}</Text>
          <Text style={styles.email}>{user?.email ?? ""}</Text>
        </View>

        {/* Corner accents */}
        <View style={styles.card}>
          <View style={styles.cornerTL} />
          <View style={styles.cornerBR} />

          <View style={styles.row}>
            <Ionicons name="person-outline" size={16} color="#c5fb45" />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>USERNAME</Text>
              <Text style={styles.rowValue}>{user?.username ?? "—"}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Ionicons name="mail-outline" size={16} color="#c5fb45" />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>EMAIL</Text>
              <Text style={styles.rowValue}>{user?.email ?? "—"}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={16} color="#ef4444" />
          <Text style={styles.logoutText}>LOGOUT</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const ACCENT = "#c5fb45";
const MONO = Platform.OS === "ios" ? "Courier New" : "monospace";

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#050505" },
  content: {
    paddingTop: Platform.OS === "ios" ? 120 : 100,
    paddingHorizontal: 20, paddingBottom: 40, gap: 20,
    alignItems: "center",
  },
  avatarWrap: { alignItems: "center", gap: 10 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(197,251,69,0.12)",
    borderWidth: 2, borderColor: ACCENT,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: ACCENT, fontSize: 32, fontWeight: "900" },
  username: { color: "#e2e8f0", fontSize: 22, fontWeight: "800", marginTop: 4 },
  email: { color: "#64748b", fontSize: 13, fontFamily: MONO },
  card: {
    width: "100%", backgroundColor: "#0a0a0a",
    borderWidth: 1, borderColor: "#1f1f1f",
    borderRadius: 20, padding: 20, gap: 0,
    position: "relative",
  },
  cornerTL: {
    position: "absolute", top: -1, left: -1,
    width: 14, height: 14,
    borderTopWidth: 2, borderLeftWidth: 2, borderColor: ACCENT,
  },
  cornerBR: {
    position: "absolute", bottom: -1, right: -1,
    width: 14, height: 14,
    borderBottomWidth: 2, borderRightWidth: 2, borderColor: ACCENT,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14 },
  rowLabel: { color: ACCENT, fontSize: 9, letterSpacing: 2, fontFamily: MONO, marginBottom: 3 },
  rowValue: { color: "#e2e8f0", fontSize: 14, fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#1f1f1f" },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1, borderColor: "rgba(239,68,68,0.3)",
    backgroundColor: "rgba(239,68,68,0.08)",
    borderRadius: 12, paddingHorizontal: 28, paddingVertical: 14,
    marginTop: 8,
  },
  logoutText: { color: "#ef4444", fontSize: 12, fontWeight: "800", letterSpacing: 2, fontFamily: MONO },
});
