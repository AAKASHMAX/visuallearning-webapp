import { JetBrains_Mono, Unbounded } from "next/font/google";

// The homepage's display and label fonts, shared so the course pages can use them too.
// Defined once here: next/font creates one font per call site.
export const sparkDisplay = Unbounded({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--sj-display", display: "swap" });
export const sparkMono = JetBrains_Mono({ subsets: ["latin", "greek"], weight: ["400", "500", "700"], variable: "--sj-mono", display: "swap" });
