"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const slides = [
  {
    title: "3D Animated Lessons",
    subtitle: "Complex concepts brought to life with stunning 3D animations",
    gradient: "from-indigo-900 via-purple-800 to-indigo-900",
    emoji: "🎬",
  },
  {
    title: "Visual Topic Explanations",
    subtitle: "Every topic in every subject explained visually for deeper understanding",
    gradient: "from-blue-900 via-teal-800 to-blue-900",
    emoji: "🔬",
  },
  {
    title: "Interactive Science Learning",
    subtitle: "Physics, Chemistry, Biology & Maths — see it, understand it, remember it",
    gradient: "from-emerald-900 via-cyan-800 to-emerald-900",
    emoji: "🧪",
  },
  {
    title: "Board Exam Ready",
    subtitle: "Class 9 to 12 complete syllabus with animated video lectures & notes",
    gradient: "from-primary via-primary-light to-primary-dark",
    emoji: "🎯",
  },
];

export function HeroSlideshow() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[500px] lg:h-[600px] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out bg-gradient-to-br ${slide.gradient} ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[180px] opacity-10 select-none">
              {slide.emoji}
            </div>
          </div>
        </div>
      ))}

      {/* Content overlay */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          {/* Slide text with animation */}
          <div key={current} className="animate-fade-in">
            <p className="text-sm md:text-base uppercase tracking-widest text-white/60 mb-4">
              {slides[current].title}
            </p>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Learn Visually,<br />
            <span className="text-accent">Score Brilliantly</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
            {slides[current].subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button variant="accent" size="lg">Start Learning Free</Button>
            </Link>
            <Link href="/courses">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                Browse Courses
              </Button>
            </Link>
          </div>
          <p className="text-white/60 mt-4 text-sm">Free videos available. No credit card required.</p>

          {/* Slide indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all duration-500 ${
                  i === current ? "w-8 bg-accent" : "w-2 bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
