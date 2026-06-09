import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth, AuthProvider } from "@/hooks/useAuth";

// Must be rendered inside the navigation tree (Stack)
function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Allowed pages for unauthenticated users (Home page/index, login, signup)
    const isAllowedUnauthenticated =
      segments.length === 0 ||
      segments[0] === "index" ||
      segments[0] === "login" ||
      segments[0] === "signup";

    if (!isAuthenticated) {
      if (!isAllowedUnauthenticated) {
        router.replace("/login");
      }
    } else {
      // If logged in, prevent accessing login and signup screens
      if (segments[0] === "login" || segments[0] === "signup") {
        router.replace("/(tabs)" as never);
      }
    }
  }, [isAuthenticated, isLoading, segments]);

  return null;
}

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
            <Stack.Screen name="post/new" options={{ headerShown: false, presentation: "modal" }} />
            <Stack.Screen name="recipe/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
          </Stack>
          <AuthGuard />
          <StatusBar style="light" />
        </ThemeProvider>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

