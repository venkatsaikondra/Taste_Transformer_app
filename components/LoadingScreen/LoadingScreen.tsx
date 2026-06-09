import React, { useEffect, useRef } from "react";
import {
    Animated,
    Modal,
    Platform,
    StyleSheet,
    Text,
    View,
} from "react-native";
import LottieView from "lottie-react-native";

interface LoadingScreenProps {
  isVisible: boolean;
  message?: string;
}

export default function LoadingScreen({
  isVisible,
  message = "OPENING FRIDGE...",
}: LoadingScreenProps) {
  // Sliding progress bar — mirrors the CSS @keyframes progressMove
  const progressAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    if (!isVisible) return;

    progressAnim.setValue(-1);
    const loop = Animated.loop(
      Animated.timing(progressAnim, {
        toValue: 2.5,
        duration: 1500,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [isVisible, progressAnim]);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.animationPlaceholder}>
            <LottieView
              source={require("@/assets/Animations/Food Carousel.json")}
              autoPlay
              loop
              style={styles.animation}
            />
          </View>

          {/* Status text */}
          <View style={styles.statusContainer}>
            <Text style={styles.loadingText}>{message}</Text>

            {/* Progress bar track */}
            <View style={styles.progressBar}>
              {/* Sliding fill — translateX from -100% to +250% of bar width */}
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    transform: [
                      {
                        translateX: progressAnim.interpolate({
                          inputRange: [-1, 2.5],
                          outputRange: [-120, 360],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const BG = "#0a0a0f";
const ACCENT = "#c5fb45";
const MONO = Platform.OS === "ios" ? "Courier New" : "monospace";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    alignItems: "center",
    gap: 32,
    width: "80%",
    maxWidth: 360,
  },

  // ── Animation area ────────────────────────────────────────────────────────
  animationPlaceholder: {
    width: 220,
    height: 220,
    borderRadius: 20,
    backgroundColor: "rgba(197,251,69,0.05)",
    borderWidth: 1,
    borderColor: "rgba(197,251,69,0.15)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
    // Glow matching the web drop-shadow
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  animationEmoji: {
    fontSize: 44,
  },
  animation: {
    width: 220,
    height: 220,
    borderRadius: 20,
  },

  // ── Status ────────────────────────────────────────────────────────────────
  statusContainer: {
    width: "100%",
    alignItems: "center",
    gap: 14,
  },
  loadingText: {
    color: ACCENT,
    fontFamily: MONO,
    fontSize: 13,
    letterSpacing: 3,
    textShadowColor: "rgba(197,251,69,0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    textAlign: "center",
  },

  // ── Progress bar ──────────────────────────────────────────────────────────
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "40%", // 40% of bar width, same as the CSS width: 40%
    height: "100%",
    backgroundColor: ACCENT,
    borderRadius: 999,
  },
});
