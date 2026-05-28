import { apiFetch } from "./client";

export type MediaType = "movie" | "tv" | "game" | "book" | "manga";

export interface MediaResult {
  id: string;
  title: string;
  cover_url: string;
  type: MediaType;
  source: string;
  metadata?: Record<string, unknown>;
}

export const search = (q: string, type: MediaType) =>
  apiFetch<MediaResult[]>(`/api/v1/search?q=${encodeURIComponent(q)}&type=${type}`);
