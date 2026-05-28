import { apiFetch } from "./client";
import type { MediaType } from "./search";

export type Status = "planning" | "in_progress" | "completed" | "dropped" | "on_hold";

export interface LibraryItem {
  id: string;
  media: {
    id: string;
    title: string;
    cover_url: string;
    type: MediaType;
  };
  status: Status;
  user_rating?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface LibraryPage {
  items: LibraryItem[];
  next_cursor: string;
  has_more: boolean;
}

export const listLibrary = (params?: { type?: MediaType; status?: Status; cursor?: string; limit?: number }) => {
  const q = new URLSearchParams();
  if (params?.type) q.set("type", params.type);
  if (params?.status) q.set("status", params.status);
  if (params?.cursor) q.set("cursor", params.cursor);
  if (params?.limit) q.set("limit", String(params.limit));
  return apiFetch<LibraryPage>(`/api/v1/library?${q.toString()}`);
};

export const addToLibrary = (payload: {
  external_id: string;
  media_type: MediaType;
  title: string;
  cover_url: string;
  source: string;
  status: Status;
}) =>
  apiFetch<LibraryItem>("/api/v1/library", {
    method: "POST",
    body: JSON.stringify({
      media: {
        id: payload.external_id,
        type: payload.media_type,
        title: payload.title,
        cover_url: payload.cover_url,
        source: payload.source,
      },
      status: payload.status,
    }),
  });

export const updateLibraryItem = (id: string, payload: { status?: Status; user_rating?: number; notes?: string }) =>
  apiFetch<LibraryItem>(`/api/v1/library/${id}`, { method: "PUT", body: JSON.stringify(payload) });

export const removeFromLibrary = (id: string) =>
  apiFetch<void>(`/api/v1/library/${id}`, { method: "DELETE" });
