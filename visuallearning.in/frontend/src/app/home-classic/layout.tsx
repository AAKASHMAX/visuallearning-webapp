import type { Metadata } from "next";

// The previous homepage, kept intact while the spark journey is the homepage.
// Not linked anywhere and kept out of search results.
export const metadata: Metadata = {
  title: "VisualLearning (previous homepage)",
  robots: { index: false, follow: false },
};

export default function ClassicHomeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
