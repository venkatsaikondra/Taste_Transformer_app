import * as SecureStore from "expo-secure-store";
import { API_BASE_URL, TOKEN_KEY } from "@/constants/auth";

export interface AuthUser {
  username: string;
  email: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
}

// ─── Login ────────────────────────────────────────────────────────────────────
export async function loginUser(
  payload: LoginPayload
): Promise<{ user: AuthUser }> {
  const res = await fetch(`${API_BASE_URL}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "Authentication Failed");
  }

  // Your Next.js API returns the JWT in a Set-Cookie header (httpOnly).
  // React Native fetch doesn't honour httpOnly cookies, so we extract
  // the token from the Set-Cookie response header and store it ourselves.
  const setCookie = res.headers.get("set-cookie") ?? "";
  const match = setCookie.match(/token=([^;]+)/);
  if (match?.[1]) {
    await SecureStore.setItemAsync(TOKEN_KEY, match[1]);
  }

  return { user: data.user };
}

// ─── Signup ───────────────────────────────────────────────────────────────────
export async function signupUser(payload: SignupPayload): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/users/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "Registration Failure");
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logoutUser(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// ─── Get stored token ────────────────────────────────────────────────────────
export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

// ─── Attach token to any authenticated request ───────────────────────────────
// Usage: fetch(url, withAuth({ method: "GET" }))
export async function withAuth(
  options: RequestInit = {}
): Promise<RequestInit> {
  const token = await getToken();
  return {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "application/json",
    },
  };
}