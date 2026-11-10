import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

// Course landing pages (/class-12): opened from YouTube descriptions without login.
export default function ClassLandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-surface">{children}</main>
      <Footer />
    </div>
  );
}
