import { useKitchenMode } from "@/hooks/useKitchenMode";
import React, { useEffect } from "react";
import {
    Animated,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";

interface KitchenModeProps {
  steps: string[];
  onClose: () => void;
}

export default function KitchenMode({ steps, onClose }: KitchenModeProps) {
  const { width } = useWindowDimensions();
  const {
    currentStep,
    handleNext,
    handlePrev,
    isListening,
    setIsListening,
    readStep,
    voiceAvailable,
    speechAvailable,
  } = useKitchenMode(steps);

  // Pulse animation for active voice button
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isListening) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, pulseAnim]);

  if (!steps || steps.length === 0) {
    return (
      <Modal visible animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.exitBtn} onPress={onClose}>
              <Text style={styles.exitBtnText}>EXIT KITCHEN</Text>
            </TouchableOpacity>
            <Text style={styles.progressTracker}>No steps available</Text>
            <View style={{ width: 90 }} />
          </View>
          <View style={styles.content}>
            <View style={styles.stepCard}>
              <Text style={styles.stepText}>No instructions found.</Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.overlay}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.exitBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.exitBtnText}>EXIT KITCHEN</Text>
          </TouchableOpacity>

          <View style={styles.progressWrapper}>
            <Text style={styles.progressTracker}>
              STEP <Text style={styles.progressCurrent}>{currentStep + 1}</Text>{" "}
              OF {steps.length}
            </Text>
            <Text style={styles.voiceHint}>
              {speechAvailable
                ? "Clean, sweet voice 🔊"
                : "Voice feedback unavailable"}
            </Text>
          </View>

          {speechAvailable && (
            <TouchableOpacity
              style={styles.repeatBtn}
              onPress={() => readStep(currentStep)}
              activeOpacity={0.8}
            >
              <Text style={styles.repeatBtnText}>🔊 REPEAT</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Step Content ── */}
        <View style={styles.content}>
          <View
            style={[styles.stepCard, { maxWidth: Math.min(width - 32, 820) }]}
          >
            <Text style={styles.stepNumber}>STEP {currentStep + 1}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.stepText}>{steps[currentStep]}</Text>
            </ScrollView>
          </View>

          {/* Dot indicators */}
          <View style={styles.dots}>
            {steps.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i < currentStep && styles.dotDone,
                  i === currentStep && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* ── Controls ── */}
        <View style={styles.controls}>
          {/* Previous */}
          <TouchableOpacity
            style={[styles.navBtn, currentStep === 0 && styles.navBtnDisabled]}
            onPress={handlePrev}
            disabled={currentStep === 0}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.navBtnText,
                currentStep === 0 && styles.navBtnTextDisabled,
              ]}
            >
              ← PREV
            </Text>
          </TouchableOpacity>

          {/* Voice Control */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[styles.voiceBtn, isListening && styles.voiceBtnActive]}
              onPress={() => setIsListening(!isListening)}
              disabled={!voiceAvailable}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.voiceBtnText,
                  isListening && styles.voiceBtnTextActive,
                ]}
              >
                {!voiceAvailable
                  ? "🎤 UNAVAILABLE"
                  : isListening
                    ? "🎙️ LISTENING..."
                    : "🎤 VOICE CONTROL"}
              </Text>
              {voiceAvailable && (
                <Text style={styles.voiceBtnHint}>
                  {isListening
                    ? 'Say "next" / "back" / "repeat"'
                    : "Tap to activate"}
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Next */}
          <TouchableOpacity
            style={[
              styles.navBtn,
              styles.navBtnNext,
              currentStep === steps.length - 1 && styles.navBtnDisabled,
            ]}
            onPress={handleNext}
            disabled={currentStep === steps.length - 1}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.navBtnText,
                styles.navBtnNextText,
                currentStep === steps.length - 1 && styles.navBtnTextDisabled,
              ]}
            >
              NEXT →
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const ACCENT = "#c5fb45";
const BG = "#0a0a0f";
const MONO = Platform.OS === "ios" ? "Courier New" : "monospace";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: BG,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(197,251,69,0.2)",
    gap: 8,
  },
  exitBtn: {
    borderWidth: 1,
    borderColor: "#ff4d4d",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  exitBtnText: {
    color: "#ff4d4d",
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  progressWrapper: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  progressTracker: {
    fontFamily: MONO,
    fontSize: 13,
    letterSpacing: 2,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
  },
  progressCurrent: {
    color: ACCENT,
    fontSize: 16,
    fontWeight: "700",
  },
  voiceHint: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 10,
    fontFamily: MONO,
  },
  repeatBtn: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  repeatBtnText: {
    color: "rgba(255,255,255,0.5)",
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // ── Content ───────────────────────────────────────────────────────────────
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    gap: 24,
  },
  stepCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderLeftWidth: 4,
    borderLeftColor: ACCENT,
    borderRadius: 12,
    padding: 28,
    maxHeight: 340,
    // Subtle inner glow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
  stepNumber: {
    fontFamily: MONO,
    fontSize: 11,
    letterSpacing: 2,
    color: ACCENT,
    marginBottom: 14,
    opacity: 0.8,
  },
  stepText: {
    fontFamily: MONO,
    fontSize: Platform.OS === "ios" ? 22 : 18,
    lineHeight: Platform.OS === "ios" ? 34 : 28,
    color: "#fff",
  },

  // ── Dots ──────────────────────────────────────────────────────────────────
  dots: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  dotDone: {
    backgroundColor: "rgba(197,251,69,0.35)",
  },
  dotActive: {
    backgroundColor: ACCENT,
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // ── Controls ──────────────────────────────────────────────────────────────
  controls: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderTopWidth: 1,
    borderTopColor: "rgba(197,251,69,0.1)",
    alignItems: "center",
  },
  navBtn: {
    flex: 1,
    height: 72,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  navBtnNext: {
    borderColor: "rgba(197,251,69,0.3)",
  },
  navBtnDisabled: {
    opacity: 0.25,
  },
  navBtnText: {
    color: "#fff",
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  navBtnNextText: {
    color: ACCENT,
  },
  navBtnTextDisabled: {
    color: "#fff",
  },

  // Voice button — center, 2× width
  voiceBtn: {
    flex: 2,
    height: 72,
    backgroundColor: ACCENT,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  voiceBtnActive: {
    backgroundColor: "#ff4d4d",
  },
  voiceBtnText: {
    color: BG,
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  voiceBtnTextActive: {
    color: "#fff",
  },
  voiceBtnHint: {
    color: "rgba(0,0,0,0.5)",
    fontSize: 9,
    fontFamily: MONO,
    letterSpacing: 0.5,
  },
});
