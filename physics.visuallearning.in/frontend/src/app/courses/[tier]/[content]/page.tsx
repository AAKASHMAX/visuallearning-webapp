"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  FileText,
  BookMarked,
  FileCheck,
  HelpCircle,
  ChevronRight,
  Atom,
  Loader2,
} from "lucide-react";
import api from "@/lib/api";
import { getChapterAnimation } from "@/components/chapter-animations";

interface Chapter {
  id: string;
  name: string;
  animationKey?: string | null;
  displayOrder: number;
  _count: { videos: number; notes: number; questions: number };
}

const CONTENT: Record<
  string,
  { label: (tier: string) => string; countKey: "videos" | "notes" | "questions"; icon: any; gradient: string }
> = {
  videos: { label: () => "3D Animated Videos", countKey: "videos", icon: Play, gradient: "from-accent to-blue-600" },
  notes: { label: () => "Notes", countKey: "notes", icon: FileText, gradient: "from-emerald-500 to-teal-600" },
  ncert: { label: () => "NCERT Solutions", countKey: "notes", icon: BookMarked, gradient: "from-sky-500 to-cyan-600" },
  pyq: { label: (t) => (t === "11" ? "Important Questions" : "PYQ Solutions"), countKey: "notes", icon: FileCheck, gradient: "from-orange-500 to-red-600" },
  quiz: { label: () => "Quiz", countKey: "questions", icon: HelpCircle, gradient: "from-secondary to-purple-600" },
};

export default function ChapterListPage() {
  const params = useParams();
  const tier = params.tier as string;
  const content = (params.content as string) || "videos";
  const cfg = CONTENT[content] || CONTENT.videos;

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/courses/tier/${tier}`);
        const courses = Array.isArray(res.data) ? res.data : [];
        const chs = courses.flatMap((c: any) => c.chapters || []);
        setChapters(chs);
      } catch {
        setChapters([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tier]);

  const isVideos = content === "videos";
  const Icon = cfg.icon;

  return (
    <main className="min-h-screen bg-primary">
      <Navbar />
      <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href={`/courses/${tier}`} className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Sections</span>
        </Link>

        <div className="mb-8 flex items-center gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${cfg.gradient}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-bright">{cfg.label(tier)}</h1>
            <p className="text-sm text-text-muted">Class {tier} Physics · choose a chapter</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-accent animate-spin mb-3" />
            <p className="text-text-muted text-sm">Loading chapters...</p>
          </div>
        ) : chapters.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-16 text-center">
            <Atom className="w-12 h-12 text-accent mx-auto mb-4 animate-pulse" />
            <h2 className="text-xl font-bold text-text-bright mb-2">Coming Soon</h2>
            <p className="text-text-muted max-w-md mx-auto">Chapters are being prepared.</p>
          </div>
        ) : isVideos ? (
          /* Animated chapter cards (videos) */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {chapters.map((chapter, idx) => {
              const AnimationComponent = getChapterAnimation(chapter.name, chapter.animationKey);
              return (
                <Link
                  key={chapter.id}
                  href={`/courses/${tier}/${content}/${chapter.id}`}
                  className="group relative rounded-2xl border border-border bg-card p-6 text-center hover:border-accent/30 transition-all duration-500 hover:-translate-y-1 cursor-pointer"
                >
                  <div className="absolute top-3 left-3 w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center z-10">
                    <span className="text-xs font-bold text-accent">{chapter.displayOrder || idx + 1}</span>
                  </div>
                  <div className="w-full h-28 mx-auto rounded-xl bg-gradient-to-br from-surface-light/60 to-card-hover/60 border border-border/50 mb-4 overflow-hidden relative">
                    {AnimationComponent ? (
                      <AnimationComponent />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-10 h-10 text-accent/60" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-text-bright mb-2 line-clamp-2">{chapter.name}</h3>
                  <div className="flex items-center justify-center gap-1 text-xs text-text-muted">
                    <Play className="w-3 h-3" />
                    {chapter._count.videos} videos
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-4 h-4 text-accent" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* List chapter cards (notes / ncert / pyq / quiz) */
          <div className="space-y-3">
            {chapters.map((chapter, idx) => {
              const count = chapter._count[cfg.countKey] || 0;
              return (
                <Link
                  key={chapter.id}
                  href={`/courses/${tier}/${content}/${chapter.id}`}
                  className="group flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5 transition-all duration-300 hover:border-accent/40 hover:bg-card-hover"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${cfg.gradient}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-text-bright truncate">{idx + 1}. {chapter.name}</h3>
                    <p className="text-[11px] text-text-muted">
                      {count > 0 ? `${count} ${cfg.countKey === "questions" ? "questions" : "items"}` : "Coming soon"}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-text-muted shrink-0 transition-colors group-hover:text-accent" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
