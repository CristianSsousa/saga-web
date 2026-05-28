import { create } from "zustand";

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthStore {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: localStorage.getItem("saga_token"),
  user: null,
  setAuth: (token, user) => {
    localStorage.setItem("saga_token", token);
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem("saga_token");
    set({ token: null, user: null });
  },
}));
