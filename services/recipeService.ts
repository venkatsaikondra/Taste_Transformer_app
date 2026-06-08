import { getToken } from "./authService";
import { API_BASE_URL } from "@/constants/auth";

const BASE = API_BASE_URL.replace(/\/$/, "");

export type RecipeIngredient = { name: string; emoji: string; quantity: number };

export type Recipe = {
  _id: string;
  recipeName: string;
  ingredients: RecipeIngredient[];
  steps: string;
  vibe: string;
  totalCalories: number;
  recipeText: string;
  videos?: { videoId: string; title: string; thumbnail: string }[];
  isFavorite: boolean;
  createdAt: string;
};

async function authHeaders() {
  const token = await getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Generate Recipe ──────────────────────────────────────────────────────────
export async function generateRecipe(ingredients: string[], vibe = "Safe"): Promise<string> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/api/generate-recipe`, {
    method: "POST",
    headers,
    body: JSON.stringify({ ingredients, vibe }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? data.message ?? "Failed to generate recipe");
  return (data.recipe ?? data.text ?? data.result ?? "") as string;
}

// ─── Fetch all saved recipes ──────────────────────────────────────────────────
export async function fetchRecipes(): Promise<Recipe[]> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/api/recipes`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? data.message ?? "Failed to fetch recipes");
  return (data.recipes ?? data ?? []) as Recipe[];
}

// ─── Save recipe ──────────────────────────────────────────────────────────────
export async function saveRecipe(payload: {
  recipeName: string;
  ingredients: RecipeIngredient[];
  steps: string;
  vibe: string;
  totalCalories: number;
  recipeText: string;
  videos: { videoId: string; title: string; thumbnail: string }[];
}): Promise<Recipe> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/api/recipes/save`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? data.message ?? "Failed to save recipe");
  return (data.recipe ?? data) as Recipe;
}

// ─── Toggle favourite ─────────────────────────────────────────────────────────
export async function toggleFavorite(id: string, isFavorite: boolean): Promise<Recipe> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/api/recipes/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ isFavorite }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? data.message ?? "Failed to update recipe");
  return (data.recipe ?? data) as Recipe;
}

// ─── Delete recipe ────────────────────────────────────────────────────────────
export async function deleteRecipe(id: string): Promise<void> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/api/recipes/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? data.message ?? "Failed to delete recipe");
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function formatRecipeText(text: string) {
  const lines = text.split("\n");
  const result: { type: "header" | "list" | "text"; content: string }[] = [];
  for (const line of lines) {
    let cleaned = line.trim();
    if (!cleaned) continue;
    // Strip markdown bold/italic
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1").replace(/#{1,6}\s/g, "");
    if (/^(recipe name|ingredients?|steps?|instructions?|directions?|tips?|notes?)/i.test(cleaned)) {
      result.push({ type: "header", content: cleaned });
    } else if (/^[-•*]\s/.test(line) || /^\d+[.)]\s/.test(line)) {
      result.push({ type: "list", content: cleaned.replace(/^[-•*\d.)\s]+/, "") });
    } else {
      result.push({ type: "text", content: cleaned });
    }
  }
  return result;
}

export function getVibeColor(vibe: string) {
  switch (vibe) {
    case "Safe": return "#22c55e";
    case "Experimental": return "#f97316";
    case "Chaos": return "#ec4899";
    default: return "#a78bfa";
  }
}

export function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch {
    return dateString;
  }
}
