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
  { value: "HINDI", label: "Hindi" },
  { value: "MARATHI", label: "Marathi" },
  { value: "TAMIL", label: "Tamil" },
  { value: "TELUGU", label: "Telugu" },
];

// Kept for backwards compatibility with imports
export const LANGUAGES = DEFAULT_LANGUAGES;

export const useLanguage = create<LanguageState>((set, get) => ({
  language: "ENGLISH",
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
    }
    if (!get().loaded) {
      get().fetchEnabledLanguages();
    }
  },

  fetchEnabledLanguages: async () => {
    try {
      const { data } = await api.get("/admin/public-settings");
      const rawLangs: any[] = data.data.languages || [];
      // API returns {key, label} objects
      const langs: LangOption[] = rawLangs.map((l: any) => ({
        value: typeof l === "string" ? l : l.key,
        label: typeof l === "string" ? l.charAt(0) + l.slice(1).toLowerCase() : l.label,
      }));
      set({ enabledLanguages: langs.length > 0 ? langs : DEFAULT_LANGUAGES, loaded: true });

      // If current language is no longer enabled, reset to ENGLISH
      const current = get().language;
      if (!langs.some((l) => l.value === current)) {
        localStorage.setItem("vl_language", "ENGLISH");
        set({ language: "ENGLISH" });
      }
    } catch {
      set({ loaded: true });
    }
  },
}));
