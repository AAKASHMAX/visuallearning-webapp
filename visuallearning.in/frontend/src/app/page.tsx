import { JetBrains_Mono, Unbounded } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import { AboutSection } from "@/components/home/about-section";
import { HomeFaq } from "@/components/home/home-faq";
import { SparkJourney } from "@/components/spark/spark-journey";

// The previous homepage is kept at /home-classic.

const display = Unbounded({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--sj-display", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin", "greek"], weight: ["400", "500", "700"], variable: "--sj-mono", display: "swap" });

export default function HomePage() {
  return (
    <div className={`sj-page ${display.variable} ${mono.variable}`}>
      <SparkJourney fonts={{ display: display.style.fontFamily, mono: mono.style.fontFamily }} />
      {/* After the journey: who we are (the site's "About us" links point here) and the FAQ. */}
      <div className="sj-after">
        <AboutSection />
        <HomeFaq />
      </div>
      <Footer />
    </div>
  );
}
