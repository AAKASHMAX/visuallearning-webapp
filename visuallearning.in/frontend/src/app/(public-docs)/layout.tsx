import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

// /notes, /ncert and /pyq pages: opened from YouTube descriptions without login.
// Kept out of search results for now.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function PublicDocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-surface">{children}</main>
      <Footer />
    </div>
  );
}
