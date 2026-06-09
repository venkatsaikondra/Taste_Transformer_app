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

export async function fetchPosts(): Promise<Post[]> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/api/community/posts`, { headers });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error ?? data.message ?? "Failed to fetch posts");

  // Robustly handle different response shapes
  const posts = data.posts ?? data;
  return (Array.isArray(posts) ? posts : []) as Post[];
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
  const res = await fetch(`${BASE}/api/community/posts`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error ?? data.message ?? "Failed to create post");
  return (data.post ?? data) as Post;
}

export async function toggleLike(postId: string): Promise<Post> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/api/community/posts/${postId}/like`, {
    method: "POST",
    headers,
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error ?? data.message ?? "Failed to toggle like");
  return (data.post ?? data) as Post;
}

export async function addComment(
  postId: string,
  content: string,
): Promise<Post> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/api/community/posts/${postId}/comments`, {
    method: "POST",
    headers,
    body: JSON.stringify({ content }),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error ?? data.message ?? "Failed to add comment");
  return (data.post ?? data) as Post;
}

export async function forkPost(postId: string): Promise<Post> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/api/community/posts/${postId}/fork`, {
    method: "POST",
    headers,
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error ?? data.message ?? "Failed to fork post");
  return (data.post ?? data) as Post;
}
