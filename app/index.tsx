import React, { useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import Main from "@/components/Main/Main";
import About from "@/components/About/About";

// This is your app/(tabs)/index.tsx or app/index.tsx
export default function HomeScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <Animated.ScrollView
      style={styles.root}
      showsVerticalScrollIndicator={false}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
    >
      {/* Hero */}
      <Main />

      {/* About / Mission */}
      <About scrollY={scrollY} sectionOffset={700} />
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
});