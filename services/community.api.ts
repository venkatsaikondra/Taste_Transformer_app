import { API_BASE_URL } from "@/constants/auth";
import { authHeaders } from "@/services/authService";

const BASE = API_BASE_URL.replace(/\/$/, "");

export interface CommunityIngredient {
  name: string;
  emoji: string;
  quantity: number;
}

export interface CommunityVideo {
  videoId: string;
  title: string;
  thumbnail: string;
}

export interface Comment {
  _id: string;
  author: { username: string };
  content: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  author: { username: string };
  recipeName: string;
  recipeText: string;
  ingredients: CommunityIngredient[];
  vibe: string;
  totalCalories: number;
  videos?: CommunityVideo[];
  likes: string[];
  comments: Comment[];
  forkedFrom?: string;
  createdAt: string;
}

async function safeFetchJson(url: string, init?: RequestInit): Promise<any> {
  const res = await fetch(url, init);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Server returned HTML/plain text instead of JSON (Status ${res.status}): ${text.slice(0, 100)}`);
  }
  if (!res.ok) {
    throw new Error(data?.error ?? data?.message ?? `Request failed with status ${res.status}`);
  }
  return data;
}

export async function fetchPosts(): Promise<Post[]> {
  const headers = await authHeaders();
  try {
    const data = await safeFetchJson(`${BASE}/api/posts`, { headers });
    const posts = data.posts ?? data;
    return (Array.isArray(posts) ? posts : []) as Post[];
  } catch (err: any) {
    throw new Error(err.message);
  }
}

export async function createPost(payload: {
  recipeName: string;
  recipeText: string;
  ingredients: CommunityIngredient[];
  vibe: string;
  totalCalories: number;
  videos?: CommunityVideo[];
}): Promise<Post> {
  const headers = await authHeaders();
  const data = await safeFetchJson(`${BASE}/api/posts`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  return (data.post ?? data) as Post;
}

export async function toggleLike(postId: string): Promise<Post> {
  const headers = await authHeaders();
  const data = await safeFetchJson(`${BASE}/api/posts/${postId}/like`, {
    method: "POST",
    headers,
  });
  return (data.post ?? data) as Post;
}

export async function addComment(
  postId: string,
  content: string,
): Promise<Post> {
  const headers = await authHeaders();
  const data = await safeFetchJson(`${BASE}/api/posts/${postId}/comments`, {
    method: "POST",
    headers,
    body: JSON.stringify({ content }),
  });
  return (data.post ?? data) as Post;
}

export async function forkPost(postId: string): Promise<Post> {
  const headers = await authHeaders();
  const data = await safeFetchJson(`${BASE}/api/posts/${postId}/fork`, {
    method: "POST",
    headers,
  });
  return (data.post ?? data) as Post;
}
