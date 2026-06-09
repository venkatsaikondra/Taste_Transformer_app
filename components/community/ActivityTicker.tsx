import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Animated, Dimensions, Platform } from "react-native";

const { width } = Dimensions.get("window");

const ACTIVITIES = [
  "🍗 @chef_alex posted Garlic Butter Chicken",
  "❤️ @foodie_jane liked Spicy Ramen",
  "🍝 @pasta_king forked Carbonara Classic",
  "⭐ @veggie_vibes posted Roasted Cauliflower",
  "🔥 @chaos_cook posted Mystery Stew",
  "💬 @noodle_fan commented on Pad Thai",
  "🍱 @bento_queen posted Rainbow Rice Bowl",
  "🧪 @experiment_al posted Weird Fusion Tacos",
];

export default function ActivityTicker() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const tickerText = ACTIVITIES.join("   •   ");

  useEffect(() => {
    const totalWidth = tickerText.length * 7.5;
    const loop = Animated.loop(
      Animated.timing(scrollX, {
        toValue: -totalWidth,
        duration: tickerText.length * 80,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={styles.root}>
      <Text style={styles.badge}>LIVE</Text>
      <View style={styles.track}>
        <Animated.Text
          style={[styles.text, { transform: [{ translateX: scrollX }] }]}
          numberOfLines={1}
        >
          {tickerText}{"   •   "}{tickerText}
        </Animated.Text>
      </View>
    </View>
  );
}

const ACCENT = "#c5fb45";
const MONO = Platform.OS === "ios" ? "Courier New" : "monospace";

const styles = StyleSheet.create({
  root: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(197,251,69,0.05)",
    borderWidth: 1, borderColor: "rgba(197,251,69,0.15)",
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    overflow: "hidden",
  },
  badge: {
    color: "#000", backgroundColor: ACCENT,
    fontSize: 9, fontWeight: "900", fontFamily: MONO,
    letterSpacing: 1, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 4, marginRight: 10, flexShrink: 0,
  },
  track: { flex: 1, overflow: "hidden" },
  text: { color: "#94a3b8", fontSize: 11, fontFamily: MONO } as any,
});
