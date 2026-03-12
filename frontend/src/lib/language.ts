"use client";
import { create } from "zustand";
import type { Language } from "@/types";

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
  hydrate: () => void;
}

export const LANGUAGES: { value: Language; label: string }[] = [
  { value: "ENGLISH", label: "English" },
  { value: "HINDI", label: "Hindi" },
  { value: "MARATHI", label: "Marathi" },
  { value: "TAMIL", label: "Tamil" },
  { value: "TELUGU", label: "Telugu" },
];

export const useLanguage = create<LanguageState>((set) => ({
  language: "ENGLISH",

  setLanguage: (language) => {
    localStorage.setItem("vl_language", language);
    set({ language });
  },

  hydrate: () => {
    const stored = localStorage.getItem("vl_language") as Language | null;
    if (stored && LANGUAGES.some((l) => l.value === stored)) {
      set({ language: stored });
    }
  },
}));
