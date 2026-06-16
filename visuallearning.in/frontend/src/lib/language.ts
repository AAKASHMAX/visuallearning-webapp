"use client";
import { create } from "zustand";
import api from "@/lib/api";

export interface LangOption {
  value: string;
  label: string;
}

interface LanguageState {
  language: string;
  enabledLanguages: LangOption[];
  loaded: boolean;
  setLanguage: (language: string) => void;
  hydrate: () => void;
  fetchEnabledLanguages: () => Promise<void>;
}

// Fallback defaults
const DEFAULT_LANGUAGES: LangOption[] = [
  { value: "ENGLISH", label: "English" },
  { value: "HINDI", label: "Hinglish" },
  { value: "MARATHI", label: "Marathi" },
  { value: "TAMIL", label: "Tamil" },
  { value: "TELUGU", label: "Telugu" },
];

// Kept for backwards compatibility with imports
export const LANGUAGES = DEFAULT_LANGUAGES;

export const useLanguage = create<LanguageState>((set, get) => ({
  language: "HINDI",
  enabledLanguages: DEFAULT_LANGUAGES,
  loaded: false,

  setLanguage: (language) => {
    localStorage.setItem("vl_language", language);
    set({ language });
  },

  hydrate: () => {
    const stored = localStorage.getItem("vl_language");
    if (stored) {
      set({ language: stored });
    } else {
      // First visit: set Hindi as default
      localStorage.setItem("vl_language", "HINDI");
      set({ language: "HINDI" });
    }
    if (!get().loaded) {
      // Try localStorage cache first (avoids API call on every page)
      const cached = localStorage.getItem("vl_enabled_languages");
      if (cached) {
        try {
          const { langs, ts } = JSON.parse(cached);
          // Use cache if less than 10 minutes old
          if (Date.now() - ts < 10 * 60 * 1000 && langs.length > 0) {
            set({ enabledLanguages: langs, loaded: true });
            return;
          }
        } catch { /* ignore bad cache */ }
      }
      get().fetchEnabledLanguages();
    }
  },

  fetchEnabledLanguages: async () => {
    try {
      const { data } = await api.get("/admin/public-settings");
      const rawLangs: any[] = data.data.languages || [];
      const langs: LangOption[] = rawLangs.map((l: any) => {
        const value = typeof l === "string" ? l : l.key;
        const rawLabel = typeof l === "string" ? l.charAt(0) + l.slice(1).toLowerCase() : l.label;
        // Display HINDI as "Hinglish" everywhere the language is shown.
        return { value, label: value === "HINDI" ? "Hinglish" : rawLabel };
      });
      const finalLangs = langs.length > 0 ? langs : DEFAULT_LANGUAGES;
      set({ enabledLanguages: finalLangs, loaded: true });

      // Cache in localStorage to avoid API call on next page load
      localStorage.setItem("vl_enabled_languages", JSON.stringify({ langs: finalLangs, ts: Date.now() }));

      // If current language is no longer enabled, reset to HINDI
      const current = get().language;
      if (!langs.some((l) => l.value === current)) {
        localStorage.setItem("vl_language", "HINDI");
        set({ language: "HINDI" });
      }
    } catch {
      set({ loaded: true });
    }
  },
}));
