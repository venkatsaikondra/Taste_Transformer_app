import React, { useEffect, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Platform, Animated, Dimensions, ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import Menu from "@/components/Menu/Menu";

const { width, height } = Dimensions.get("window");
const ACCENT = "#c5fb45";
const MONO = Platform.OS === "ios" ? "Courier New" : "monospace";

export default function Main() {
  const router = useRouter();

  // Headline lines slide up from below their container (line-mask effect)
  const line1Y = useRef(new Animated.Value(80)).current;
  const line2Y = useRef(new Animated.Value(80)).current;

  // Tag line fades + slides in from left
  const tagOpacity = useRef(new Animated.Value(0)).current;
  const tagX = useRef(new Animated.Value(-24)).current;

  // Description + CTA fade up
  const bodyOpacity = useRef(new Animated.Value(0)).current;
  const bodyY = useRef(new Animated.Value(16)).current;

  // Lottie scales in
  const lottieScale = useRef(new Animated.Value(0.75)).current;
  const lottieOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Step 1: headline slides up (staggered)
    // Step 2: tag + body fade in
    // Lottie animates in parallel with everything
    Animated.sequence([
      Animated.stagger(120, [
        Animated.spring(line1Y, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
        Animated.spring(line2Y, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(tagOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(tagX, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
        Animated.timing(bodyOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(bodyY, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
      ]),
    ]).start();

    // Lottie fades in concurrently after a short delay
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(lottieOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.spring(lottieScale, { toValue: 1, tension: 45, friction: 10, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      <Menu />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>

          {/* Tag line */}
          <Animated.Text style={[styles.tag, { opacity: tagOpacity, transform: [{ translateX: tagX }] }]}>
            AI RECIPE TRANSFORMER
          </Animated.Text>

          {/* Headline with line-mask slide-up */}
          <View style={styles.headlineWrapper}>
            <View style={styles.lineMask}>
              <Animated.Text style={[styles.headline, { transform: [{ translateY: line1Y }] }]}>
                TASTE
              </Animated.Text>
            </View>
            <View style={styles.lineMask}>
              <Animated.Text style={[styles.headline, { transform: [{ translateY: line1Y }] }]}>
                TRANSFORMER
              </Animated.Text>
            </View>
          </View>

          {/* Description + CTA */}
          <Animated.View style={{ opacity: bodyOpacity, transform: [{ translateY: bodyY }] }}>
            <Text style={styles.description}>
              Input your ingredients. Let the LLM hallucinate your next five-star meal.
            </Text>
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={() => router.push("/(tabs)/fridge" as never)}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaBtnText}>START SCANNING</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Lottie hero */}
          <Animated.View style={[styles.lottieWrap, { opacity: lottieOpacity, transform: [{ scale: lottieScale }] }]}>
            <LottieView
              source={require("@/assets/Animations/main.json")}
              autoPlay
              loop
              style={{ width: 280, height: 280 }}
            />
          </Animated.View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0a0a0a" },
  scroll: { flexGrow: 1 },
  hero: {
    minHeight: height,
    paddingTop: Platform.OS === "ios" ? 130 : 110,
    paddingHorizontal: 24,
    paddingBottom: 60,
    justifyContent: "center",
  },
  tag: {
    color: ACCENT,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 4,
    fontFamily: MONO,
    marginBottom: 20,
  },
  headlineWrapper: { marginBottom: 28 },
  lineMask: { overflow: "hidden" },
  headline: {
    fontSize: width > 500 ? 76 : 50,
    fontWeight: "800",
    color: "#fff",
    lineHeight: width > 400 ? 72 : 56,
    letterSpacing: -2,
  },
  description: {
    color: "#777",
    fontSize: 16,
    lineHeight: 26,
    maxWidth: 300,
    marginBottom: 32,
  },
  ctaBtn: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: ACCENT,
    paddingVertical: 15,
    paddingHorizontal: 32,
  },
  ctaBtnText: {
    color: ACCENT,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    fontFamily: MONO,
  },
  lottieWrap: {
    marginTop: 52,
    alignItems: "center",
  },
});
