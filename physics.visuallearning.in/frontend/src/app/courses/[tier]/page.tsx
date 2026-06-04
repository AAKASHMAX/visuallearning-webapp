"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  FileText,
  BookMarked,
  FileCheck,
  HelpCircle,
  GraduationCap,
} from "lucide-react";

const classLabel: Record<string, string> = {
  "11": "Class 11 Physics",
  "12": "Class 12 Physics",
};

function contentCards(tier: string) {
  return [
    { slug: "videos", title: "3D Animated Videos", subtitle: "Animated, chapter-wise video lessons.", icon: Play, gradient: "from-accent to-blue-600", border: "border-accent/30" },
    { slug: "notes", title: "Notes", subtitle: "Beautifully structured chapter notes.", icon: FileText, gradient: "from-emerald-500 to-teal-600", border: "border-emerald-500/30" },
    { slug: "ncert", title: "NCERT Solutions", subtitle: "Step-by-step NCERT textbook answers.", icon: BookMarked, gradient: "from-sky-500 to-cyan-600", border: "border-sky-500/30" },
    {
      slug: "pyq",
      title: tier === "11" ? "Important Questions" : "PYQ Solutions",
      subtitle: tier === "11" ? "Most-important exam questions." : "Solved previous-year board questions.",
      icon: FileCheck,
      gradient: "from-orange-500 to-red-600",
      border: "border-orange-500/30",
    },
    { slug: "quiz", title: "Quiz", subtitle: "Practice MCQs with instant feedback.", icon: HelpCircle, gradient: "from-secondary to-purple-600", border: "border-secondary/30" },
  ];
}

export default function TierContentPage() {
  const params = useParams();
  const tier = (params.tier as string) || "12";
  const title = classLabel[tier] || "Physics";
  const cards = contentCards(tier);

  return (
    <main className="min-h-screen bg-primary">
      <Navbar />
      <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/courses" className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Courses</span>
        </Link>

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 bg-accent/10 text-accent">
            <GraduationCap className="w-3.5 h-3.5" />
            {title}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-bright mb-3">
            Choose a <span className="gradient-text">Section</span>
          </h1>
          <p className="text-text-muted max-w-xl">
            Pick what you want to study — videos, notes, NCERT solutions, questions, or a quiz.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.slug}
                href={`/courses/${tier}/${card.slug}`}
                className={`group relative flex flex-col rounded-2xl border ${card.border} bg-card p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/40`}
              >
                <div className={`mb-3.5 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-text-bright">{card.title}</h3>
                <p className="mt-1 text-xs text-text-muted">{card.subtitle}</p>
                <span className="mt-3.5 inline-flex items-center gap-1.5 text-xs font-semibold text-accent transition-all group-hover:gap-2.5">
                  Open
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      <Footer />
    </main>
  );
}
