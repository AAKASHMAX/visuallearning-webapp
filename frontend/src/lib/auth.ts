"use client";
import { create } from "zustand";

interface User {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "ADMIN";
  emailVerified?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  hydrate: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (user, token) => {
    localStorage.setItem("vl_token", token);
    localStorage.setItem("vl_user", JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("vl_token");
    localStorage.removeItem("vl_user");
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user) => {
    localStorage.setItem("vl_user", JSON.stringify(user));
    set({ user });
  },

  hydrate: () => {
    const token = localStorage.getItem("vl_token");
    const userStr = localStorage.getItem("vl_user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true });
      } catch {
        localStorage.removeItem("vl_token");
        localStorage.removeItem("vl_user");
      }
    }
  },
}));
