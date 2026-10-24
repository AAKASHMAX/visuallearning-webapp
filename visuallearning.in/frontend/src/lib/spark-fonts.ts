import localFont from "next/font/local";

// The homepage's display and label fonts, shared so the course pages can use them too.
// Defined once here: next/font creates one font per call site.
// Self-hosted (src/fonts: the SIL OFL variable fonts, trimmed to the Latin, Greek and
// symbols the pages use) so a build never depends on Google Fonts. Vercel builds broke
// when Google answered next/font with a font link it could not read.
export const sparkDisplay = localFont({
  src: "../fonts/Unbounded-Variable.woff2",
  weight: "200 900",
  variable: "--sj-display",
  display: "swap",
});
export const sparkMono = localFont({
  src: "../fonts/JetBrainsMono-Variable.woff2",
  weight: "100 800",
  variable: "--sj-mono",
  display: "swap",
});
