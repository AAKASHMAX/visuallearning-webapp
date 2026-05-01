"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSlideshow() {
  return (
    <section className="relative h-[500px] lg:h-[600px] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-light to-primary-dark">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[180px] opacity-10 select-none">
            🎯
          </div>
        </div>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <p className="text-sm md:text-base uppercase tracking-widest text-white/60 mb-4">
            Board Exam Ready
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Learn Visually,<br />
            <span className="text-accent">Score Brilliantly</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Class 9 to 12 complete syllabus with animated video lectures & notes
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
        </div>
      </div>
    </section>
  );
}
