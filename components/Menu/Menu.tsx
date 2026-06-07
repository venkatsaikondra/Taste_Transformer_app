import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Modal,
  Pressable,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const NAV_LINKS = [
  { label: "VISION", route: "/predict" },
  { label: "DASHBOARD", route: "/dashboard" },
  { label: "COMMUNITY", route: "/community" },
  { label: "OPEN FRIDGE", route: "/fridge", isCta: true },
  { label: "PROFILE", route: "/profile" },
];

export default function Menu() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const openMenu = () => {
    setMenuOpen(true);
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setMenuOpen(false));
  };

  const navigate = (route: string) => {
    closeMenu();
    setTimeout(() => router.push(route as never), 200);
  };

  const menuTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 0],
  });
  const menuOpacity = slideAnim;

  return (
    <>
      <View style={styles.navbar}>
        {/* Logo */}
        <TouchableOpacity onPress={() => router.push("/")} activeOpacity={0.8}>
          <Text style={styles.logo}>FOODZILLA</Text>
        </TouchableOpacity>

        {/* Right controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.profileIcon}
            onPress={() => router.push("/profile" as never)}
            activeOpacity={0.8}
          >
            <Ionicons name="person-outline" size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuToggle}
            onPress={menuOpen ? closeMenu : openMenu}
            activeOpacity={0.8}
          >
            <Ionicons
              name={menuOpen ? "close" : "menu"}
              size={20}
              color="#c5fb45"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dropdown Mobile Menu */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="none"
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.overlay} onPress={closeMenu}>
          <Animated.View
            style={[
              styles.mobileMenu,
              { opacity: menuOpacity, transform: [{ translateY: menuTranslateY }] },
            ]}
          >
            {NAV_LINKS.map((link) => (
              <TouchableOpacity
                key={link.route}
                style={[
                  styles.mobileLink,
                  pathname === link.route && styles.mobileLinkActive,
                ]}
                onPress={() => navigate(link.route)}
                activeOpacity={0.75}
              >
                <Text style={styles.mobileLinkText}>{link.label}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  navbar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 54 : 40,
    paddingBottom: 14,
    backgroundColor: "rgba(10,10,10,0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.07)",
  },
  logo: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 2,
    color: "#c5fb45",
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  profileIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  menuToggle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 110 : 96,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
  },
  mobileMenu: {
    alignSelf: "flex-end",
    width: 260,
    backgroundColor: "rgba(10,10,10,0.98)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: 12,
    gap: 8,
  },
  mobileLink: {
    backgroundColor: "rgba(197,251,69,0.10)",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  mobileLinkActive: {
    backgroundColor: "rgba(197,251,69,0.22)",
  },
  mobileLinkText: {
    color: "#c5fb45",
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 1.5,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
});