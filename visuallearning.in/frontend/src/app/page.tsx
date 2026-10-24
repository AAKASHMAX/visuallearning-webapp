import { Footer } from "@/components/layout/footer";
import { AboutSection } from "@/components/home/about-section";
import { HomeFaq } from "@/components/home/home-faq";
import { SparkJourney } from "@/components/spark/spark-journey";
import { sparkDisplay as display, sparkMono as mono } from "@/lib/spark-fonts";

// The previous homepage is kept at /home-classic.

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
