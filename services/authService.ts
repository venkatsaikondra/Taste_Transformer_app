import { API_BASE_URL, TOKEN_KEY } from "@/constants/auth";
import * as SecureStore from "expo-secure-store";

const BASE = API_BASE_URL.replace(/\/$/, "");

export interface AuthUser {
  id?: string;
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

// ─── Decode JWT payload (Hermes-safe, no atob) ────────────────────────────────
export function decodeUserFromToken(token: string): AuthUser | null {
  try {
    const part = token.split(".")[1];
    // Pad base64 string
    const padded = part.replace(/-/g, "+").replace(/_/g, "/");
    const rem = padded.length % 4;
    const b64 = rem ? padded + "=".repeat(4 - rem) : padded;
    // Decode using Buffer (available in RN/Hermes via the polyfill)
    const json = Buffer.from(b64, "base64").toString("utf8");
    const p = JSON.parse(json);
    return {
      id: p.id ?? p._id ?? p.sub ?? "",
      username: p.username ?? p.name ?? p.sub ?? "",
      email: p.email ?? "",
    };
  } catch {
    return null;
  }
}

// ─── XHR-based POST — exposes set-cookie in React Native ─────────────────────
function xhrPost(
  url: string,
  body: object,
): Promise<{
  status: number;
  data: any;
  cookieHeader: string;
}> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.withCredentials = true;
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) return;
      const responseText = xhr.responseText || "{}";
      try {
        const data = JSON.parse(responseText);
        const cookieHeader = xhr.getResponseHeader("set-cookie") ?? "";
        resolve({ status: xhr.status, data, cookieHeader });
      } catch {
        // Handle non-JSON or empty responses gracefully
        resolve({
          status: xhr.status,
          data: { message: responseText },
          cookieHeader: xhr.getResponseHeader("set-cookie") ?? "",
        });
      }
    };
    xhr.onerror = () => reject(new Error("Network request failed"));
    xhr.ontimeout = () => reject(new Error("Request timed out"));
    xhr.timeout = 15000;
    xhr.send(JSON.stringify(body));
  });
}

// ─── Login ────────────────────────────────────────────────────────────────────
export async function loginUser(
  payload: LoginPayload,
): Promise<{ user: AuthUser }> {
  const { status, data, cookieHeader } = await xhrPost(
    `${BASE}/api/users/login`,
    payload,
  );

  if (status < 200 || status >= 300) {
    throw new Error(data?.error ?? data?.message ?? "Authentication Failed");
  }

  // Extract token from set-cookie header
  // Header format: token=<JWT>; Path=/; ...
  let token: string | null = null;

  // Try Cookie header first
  const match = cookieHeader.match(/(?:^|,\s*)token=([^;,]+)/i);
  if (match?.[1]) {
    token = match[1].trim();
  }

  // Fallback: Check if token is in the response body
  if (!token && data?.token) {
    token = data.token;
  }

  if (!token) {
    throw new Error("No token received from server. Please try again.");
  }

  await SecureStore.setItemAsync(TOKEN_KEY, token);

  // Decode user from JWT (has id, username, email)
  const decoded = decodeUserFromToken(token);
  const user: AuthUser = decoded ?? {
    username: data?.user?.username ?? payload.email.split("@")[0],
    email: payload.email,
  };

  return { user };
}

// ─── Signup ───────────────────────────────────────────────────────────────────
export async function signupUser(
  payload: SignupPayload,
): Promise<{ user: AuthUser }> {
  const { status, data, cookieHeader } = await xhrPost(
    `${BASE}/api/users/signup`,
    payload,
  );

  if (status < 200 || status >= 300) {
    throw new Error(data?.error ?? data?.message ?? "Registration Failed");
  }

  // Extract token from set-cookie header, similar to loginUser
  let token: string | null = null;
  const match = cookieHeader.match(/(?:^|,\s*)token=([^;,]+)/i);
  if (match?.[1]) {
    token = match[1].trim();
  } else if (data?.token) {
    token = data.token;
  }

  if (token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }

  // Decode user from JWT or construct from payload
  const decoded = token ? decodeUserFromToken(token) : null;
  const user: AuthUser = decoded ?? {
    username: data?.user?.username ?? payload.username,
    email: payload.email,
  };
  return { user };
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logoutUser(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// ─── Get stored token ─────────────────────────────────────────────────────────
export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

// ─── Auth headers for API calls ───────────────────────────────────────────────
export async function authHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
