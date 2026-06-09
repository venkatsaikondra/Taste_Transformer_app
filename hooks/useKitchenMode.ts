import { useCallback, useEffect, useRef, useState } from "react";

let Speech: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Speech = require("expo-speech");
} catch {
  // Optional dependency: expo-speech not installed
}

// Voice recognition: install with `npx expo install expo-speech @react-native-voice/voice`
// For voice commands we use @react-native-voice/voice
// If not installed, voice control will silently degrade (isListening stays false)
let Voice: {
  onSpeechResults?: (e: { value?: string[] }) => void;
  onSpeechError?: (e: unknown) => void;
  start: (lang: string) => Promise<void>;
  stop: () => Promise<void>;
  destroy: () => Promise<void>;
  isAvailable: () => Promise<boolean>;
} | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Voice = require("@react-native-voice/voice").default;
} catch {
  // Voice package not installed — voice control will be unavailable
}

export function useKitchenMode(steps: string[]) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const stepsRef = useRef(steps);
  const currentStepRef = useRef(currentStep);

  // Keep refs in sync so voice callbacks always have fresh values
  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);
  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  // ── TTS: read a step aloud ────────────────────────────────────────────────
  const readStep = useCallback((index: number) => {
    if (!Speech) return;
    Speech.stop();
    const text = stepsRef.current[index];
    if (!text) return;
    Speech.speak(`Step ${index + 1}. ${text}`, {
      language: "en-US",
      pitch: 1.1,
      rate: 0.9,
    });
  }, []);

  // ── Navigation ────────────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    setCurrentStep((prev) => {
      const next = Math.min(prev + 1, stepsRef.current.length - 1);
      if (next !== prev) readStep(next);
      return next;
    });
  }, [readStep]);

  const handlePrev = useCallback(() => {
    setCurrentStep((prev) => {
      const next = Math.max(prev - 1, 0);
      if (next !== prev) readStep(next);
      return next;
    });
  }, [readStep]);

  // ── Auto-read on mount ────────────────────────────────────────────────────
  useEffect(() => {
    if (steps.length > 0) {
      const timer = setTimeout(() => readStep(0), 600);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => {
      if (Speech) Speech.stop();
    };
  }, []);

  // ── Voice recognition setup ───────────────────────────────────────────────
  useEffect(() => {
    if (!Voice) return;

    Voice.isAvailable()
      .then((available: boolean) => {
        setVoiceAvailable(!!available);
      })
      .catch(() => {});

    Voice.onSpeechResults = (e: { value?: string[] }) => {
      const heard = (e.value?.[0] ?? "").toLowerCase();
      if (heard.includes("next")) handleNext();
      else if (heard.includes("back") || heard.includes("previous"))
        handlePrev();
      else if (heard.includes("repeat") || heard.includes("again"))
        readStep(currentStepRef.current);
    };

    Voice.onSpeechError = () => {
      setIsListening(false);
    };

    return () => {
      if (Voice) {
        Voice.destroy().catch(() => {});
        Voice.onSpeechResults = undefined;
        Voice.onSpeechError = undefined;
      }
    };
  }, [handleNext, handlePrev, readStep]);

  // ── Toggle listening ──────────────────────────────────────────────────────
  const toggleListening = useCallback(async () => {
    if (!Voice || !voiceAvailable) return;
    if (isListening) {
      await Voice.stop().catch(() => {});
      setIsListening(false);
    } else {
      try {
        await Voice.start("en-US");
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  }, [isListening, voiceAvailable]);

  return {
    currentStep,
    handleNext,
    handlePrev,
    isListening,
    setIsListening: toggleListening,
    readStep,
    voiceAvailable,
    speechAvailable: !!Speech,
  };
}
