import { apiFetch } from "./client";

export interface AuthResponse {
  token: string;
  user: { id: string; email: string; username: string };
}

export const register = (email: string, username: string, password: string) =>
  apiFetch<AuthResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, username, password }),
  });

export const login = (email: string, password: string) =>
  apiFetch<AuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const me = () =>
  apiFetch<AuthResponse["user"]>("/api/v1/auth/me");
