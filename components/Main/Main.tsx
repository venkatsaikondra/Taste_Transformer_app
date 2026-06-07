import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import Menu from "@/components/Menu/Menu";

const { width } = Dimensions.get("window");

export default function Main() {
  const router = useRouter();

  // Animation refs — mirrors GSAP timeline from web
  const line1Y = useRef(new Animated.Value(100)).current;
  const line2Y = useRef(new Animated.Value(100)).current;
  const introOpacity = useRef(new Animated.Value(0)).current;
  const introX = useRef(new Animated.Value(-20)).current;
  const lottieScale = useRef(new Animated.Value(0.8)).current;
  const lottieOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Lines stagger in (like GSAP y:100 → 0)
      Animated.stagger(100, [
        Animated.spring(line1Y, { toValue: 0, useNativeDriver: true, tension: 60, friction: 10 }),
        Animated.spring(line2Y, { toValue: 0, useNativeDriver: true, tension: 60, friction: 10 }),
      ]),
      // Intro text fades in
      Animated.parallel([
        Animated.timing(introOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(introX, { toValue: 0, useNativeDriver: true, tension: 80 }),
      ]),
    ]).start();

    // Hero visual fades in simultaneously
    Animated.parallel([
      Animated.spring(lottieScale, { toValue: 1, useNativeDriver: true, tension: 50, friction: 10 }),
      Animated.timing(lottieOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      <Menu />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          {/* Intro tag */}
          <Animated.Text
            style={[
              styles.introText,
              { opacity: introOpacity, transform: [{ translateX: introX }] },
            ]}
          >
            AI RECIPE TRANSFORMER
          </Animated.Text>

          {/* Big headline — line mask stagger */}
          <View style={styles.headlineWrapper}>
            <View style={styles.lineMask}>
              <Animated.Text
                style={[styles.headline, { transform: [{ translateY: line1Y }] }]}
              >
                TASTE
              </Animated.Text>
            </View>
            <View style={styles.lineMask}>
              <Animated.Text
                style={[styles.headline, { transform: [{ translateY: line2Y }] }]}
              >
                TRANSFORMER
              </Animated.Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            Input your ingredients. Let the LLM hallucinate your next five-star meal.
          </Text>

          {/* CTA */}
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => router.push("/fridge" as never)}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaBtnText}>START SCANNING</Text>
          </TouchableOpacity>

          {/* Hero visual placeholder — swap with your Lottie */}
          <Animated.View
            style={[
              styles.heroVisual,
              { opacity: lottieOpacity, transform: [{ scale: lottieScale }] },
            ]}
          >
            {/* 
              Replace this View with:
              import LottieView from 'lottie-react-native';
              <LottieView source={require('@/assets/animations/main.json')} autoPlay loop style={{ width: '100%', height: '100%' }} />
            */}
            <View style={styles.lottiePlaceholder}>
              <Text style={styles.lottieEmoji}>👩‍🍳</Text>
              <Text style={styles.lottieHint}>Lottie animation here</Text>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  scroll: {
    flexGrow: 1,
  },
  hero: {
    minHeight: Dimensions.get("window").height,
    paddingTop: Platform.OS === "ios" ? 130 : 110,
    paddingHorizontal: 24,
    paddingBottom: 48,
    justifyContent: "center",
  },
  introText: {
    color: "#c5fb45",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 4,
    marginBottom: 24,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
  headlineWrapper: {
    marginBottom: 24,
    overflow: "hidden",
  },
  lineMask: {
    overflow: "hidden",
  },
  headline: {
    fontSize: width > 400 ? 72 : 58,
    fontWeight: "900",
    color: "#fff",
    lineHeight: width > 400 ? 68 : 54,
    letterSpacing: -1,
  },
  description: {
    color: "#888",
    fontSize: 16,
    lineHeight: 26,
    maxWidth: 320,
    marginBottom: 32,
  },
  ctaBtn: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#c5fb45",
    paddingVertical: 15,
    paddingHorizontal: 32,
  },
  ctaBtnText: {
    color: "#c5fb45",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 2,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
  heroVisual: {
    marginTop: 48,
    alignItems: "center",
  },
  lottiePlaceholder: {
    width: 220,
    height: 220,
    borderRadius: 16,
    backgroundColor: "rgba(197,251,69,0.05)",
    borderWidth: 1,
    borderColor: "rgba(197,251,69,0.15)",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  lottieEmoji: {
    fontSize: 64,
  },
  lottieHint: {
    color: "#444",
    fontSize: 11,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    letterSpacing: 1,
  },
});