import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import {
  loginUser,
  signupUser,
  logoutUser,
  getToken,
  decodeUserFromToken,
  AuthUser,
  LoginPayload,
  SignupPayload,
} from "@/services/authService";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Restore session from stored token on mount
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (token) {
          const user = decodeUserFromToken(token);
          setState({ user, isLoading: false, isAuthenticated: true });
        } else {
          setState({ user: null, isLoading: false, isAuthenticated: false });
        }
      } catch {
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
    })();
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const { user } = await loginUser(payload);
      setState({ user, isLoading: false, isAuthenticated: true });
      router.replace("/(tabs)" as never);
    },
    [router]
  );

  const signup = useCallback(
    async (payload: SignupPayload) => {
      await signupUser(payload);
      router.replace("/login");
    },
    [router]
  );

  const logout = useCallback(async () => {
    await logoutUser();
    setState({ user: null, isLoading: false, isAuthenticated: false });
    router.replace("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

