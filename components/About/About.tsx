import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Animated,
  useWindowDimensions,
} from "react-native";
import { useScrollViewOffset } from "react-native-reanimated";

const FEATURES = [
  {
    num: "01",
    title: "Zero Waste Vision",
    desc: "We help you use leftover ingredients before they go to waste.",
  },
  {
    num: "02",
    title: "Creative Cooking Ideas",
    desc: "Our AI suggests simple and creative cooking steps using the ingredients you already have.",
  },
  {
    num: "03",
    title: "Instant Recipe Planning",
    desc: 'From "I have nothing to eat" into a complete recipe in just a few seconds.',
  },
];

interface AboutProps {
  scrollY?: Animated.Value; // pass your ScrollView's scrollY for scroll-trigger effect
  sectionOffset?: number;   // approximate Y offset of this section in the ScrollView
}

export default function About({ scrollY, sectionOffset = 600 }: AboutProps) {
  const { width } = useWindowDimensions();
  const isWide = width > 700;

  // Scroll-triggered animation (mirrors GSAP ScrollTrigger y:50→0 opacity:0→1)
  const animY = useRef(new Animated.Value(50)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;
  const triggered = useRef(false);

  // If a scrollY Animated.Value is passed in, trigger on scroll
  if (scrollY) {
    scrollY.addListener(({ value }) => {
      if (!triggered.current && value > sectionOffset - 300) {
        triggered.current = true;
        Animated.parallel([
          Animated.spring(animY, { toValue: 0, useNativeDriver: true, tension: 60, friction: 12 }),
          Animated.timing(animOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        ]).start();
      }
    });
  }

  return (
    <Animated.View
      style={[
        styles.about,
        { opacity: scrollY ? animOpacity : 1, transform: scrollY ? [{ translateY: animY }] : [] },
      ]}
    >
      <View style={[styles.inner, isWide && styles.innerWide]}>

        {/* LEFT: Mission text */}
        <View style={[styles.left, isWide && styles.leftWide]}>
          {/* Lottie placeholder top */}
          <View style={styles.lottieTopPlaceholder}>
            {/* 
              Replace with:
              <LottieView source={require('@/assets/animations/food.json')} autoPlay loop style={{ width: '100%', height: '100%' }} />
            */}
            <Text style={styles.lottieEmoji}>🍳</Text>
          </View>

          <Text style={styles.label}>THE MISSION</Text>
          <Text style={styles.title}>
            Ending "Kitchen Confusion" with LLMs.
          </Text>
          <Text style={styles.description}>
            Foodzilla solves a common kitchen problem — having a fridge full of random ingredients but not knowing what to cook. Using Large Language Models (LLMs), Foodzilla helps turn those unused ingredients into tasty meal ideas instead of letting them go to waste.
          </Text>
        </View>

        {/* RIGHT: Feature points */}
        <View style={[styles.right, isWide && styles.rightWide]}>
          {FEATURES.map((f, i) => (
            <View key={f.num} style={[styles.point, i < FEATURES.length - 1 && styles.pointBorder]}>
              <Text style={styles.pointNumber}>{f.num}</Text>
              <View style={styles.pointContent}>
                <Text style={styles.pointTitle}>{f.title}</Text>
                <Text style={styles.pointDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}

          {/* Bottom Lottie placeholder */}
          <View style={styles.lottieSmallPlaceholder}>
            {/* 
              Replace with:
              <LottieView source={require('@/assets/animations/Food Carousel.json')} autoPlay loop style={{ width: '100%', height: '100%' }} />
            */}
            <Text style={styles.lottieEmoji}>🥩</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  about: {
    backgroundColor: "#0a0a0a",
    paddingVertical: 80,
  },
  inner: {
    width: "90%",
    alignSelf: "center",
    flexDirection: "column",
    gap: 48,
  },
  innerWide: {
    flexDirection: "row",
    gap: 60,
    alignItems: "flex-start",
  },
  left: {
    flex: 1,
  },
  leftWide: {
    flex: 1,
  },
  right: {
    flex: 1,
  },
  rightWide: {
    flex: 1,
  },
  // Lottie placeholders — replace with real LottieView
  lottieTopPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: "rgba(197,251,69,0.05)",
    borderWidth: 1,
    borderColor: "rgba(197,251,69,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  lottieSmallPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(197,251,69,0.04)",
    borderWidth: 1,
    borderColor: "rgba(197,251,69,0.08)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 24,
  },
  lottieEmoji: {
    fontSize: 40,
  },
  label: {
    color: "#c5fb45",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 3,
    marginBottom: 12,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
  title: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
    marginBottom: 20,
  },
  description: {
    color: "#aaa",
    fontSize: 15,
    lineHeight: 26,
  },
  point: {
    flexDirection: "row",
    gap: 16,
    paddingVertical: 28,
  },
  pointBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  pointNumber: {
    color: "#c5fb45",
    fontSize: 18,
    fontWeight: "800",
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    minWidth: 32,
  },
  pointContent: {
    flex: 1,
  },
  pointTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  pointDesc: {
    color: "#888",
    fontSize: 14,
    lineHeight: 22,
  },
});