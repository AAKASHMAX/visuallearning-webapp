"use client";
import { create } from "zustand";
import type { Language } from "@/types";
import api from "@/lib/api";

interface LanguageState {
  language: Language;
  enabledLanguages: { value: Language; label: string }[];
  loaded: boolean;
  setLanguage: (language: Language) => void;
  hydrate: () => void;
  fetchEnabledLanguages: () => Promise<void>;
}

// Full list for label mapping
const ALL_LANGUAGES: { value: Language; label: string }[] = [
  { value: "ENGLISH", label: "English" },
  { value: "HINDI", label: "Hindi" },
  { value: "MARATHI", label: "Marathi" },
  { value: "TAMIL", label: "Tamil" },
  { value: "TELUGU", label: "Telugu" },
];

// Fallback export for components that just need the full list
export const LANGUAGES = ALL_LANGUAGES;

export const useLanguage = create<LanguageState>((set, get) => ({
  language: "ENGLISH",
  enabledLanguages: ALL_LANGUAGES, // default to all until API responds
  loaded: false,

  setLanguage: (language) => {
    localStorage.setItem("vl_language", language);
    set({ language });
  },

  hydrate: () => {
    const stored = localStorage.getItem("vl_language") as Language | null;
    if (stored && ALL_LANGUAGES.some((l) => l.value === stored)) {
      set({ language: stored });
    }
    // Fetch enabled languages if not loaded yet
    if (!get().loaded) {
      get().fetchEnabledLanguages();
    }
  },

  fetchEnabledLanguages: async () => {
    try {
      const { data } = await api.get("/admin/public-settings");
      const enabled: string[] = data.data.languages || [];
      const filtered = ALL_LANGUAGES.filter((l) => enabled.includes(l.value));
      set({ enabledLanguages: filtered.length > 0 ? filtered : ALL_LANGUAGES, loaded: true });

      // If current language is no longer enabled, reset to ENGLISH
      const current = get().language;
      if (!enabled.includes(current)) {
        localStorage.setItem("vl_language", "ENGLISH");
        set({ language: "ENGLISH" });
      }
    } catch {
      // If API fails, keep all languages available
      set({ loaded: true });
    }
  },
}));
