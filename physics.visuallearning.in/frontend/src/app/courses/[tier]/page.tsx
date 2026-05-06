"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BookOpen,
  Play,
  FileText,
  HelpCircle,
  ChevronRight,
  ArrowLeft,
  Lock,
  Atom,
  Zap,
  Lightbulb,
  Magnet,
  Waves,
  FlaskConical,
  Orbit,
  Rocket,
  Flame,
  Radio,
  Gauge,
  Microscope,
  Sun,
  Triangle,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { getChapterAnimation } from "@/components/chapter-animations";

interface Course {
  id: string;
  name: string;
  description: string | null;
  tier: string;
  chapters: Chapter[];
}

interface Chapter {
  id: string;
  name: string;
  animationKey?: string | null;
  displayOrder: number;
  _count: { videos: number; notes: number; questions: number };
}

const tierConfig: Record<string, { label: string; gradient: string; tagColor: string }> = {
  free: { label: "Free Course", gradient: "from-emerald-500 to-teal-600", tagColor: "bg-emerald-500/10 text-emerald-400" },
  basic: { label: "Basic Course", gradient: "from-accent to-blue-600", tagColor: "bg-accent/10 text-accent" },
  advance: { label: "Advance Course", gradient: "from-secondary to-purple-600", tagColor: "bg-secondary/10 text-secondary-light" },
  bridge: { label: "Bridge Course", gradient: "from-orange-500 to-amber-600", tagColor: "bg-orange-500/10 text-orange-400" },
};

// Map chapter names to icons
const iconMap: Record<string, any> = {
  mechanics: Orbit,
  optics: Lightbulb,
  electricity: Zap,
  magnetism: Magnet,
  waves: Waves,
  thermodynamics: Flame,
  kinematics: Rocket,
  "modern physics": Atom,
  quantum: Atom,
  nuclear: Radio,
  gravitation: Orbit,
  "fluid mechanics": FlaskConical,
  oscillation: Waves,
  "ray optics": Sun,
  "wave optics": Waves,
  semiconductor: Microscope,
  motion: Gauge,
  force: Triangle,
};

function getChapterIcon(name: string) {
  const lower = name.toLowerCase();
  for (const [key, Icon] of Object.entries(iconMap)) {
    if (lower.includes(key)) return Icon;
  }
  return BookOpen;
}

export default function TierCoursePage() {
  const params = useParams();
  const router = useRouter();
  const tier = (params.tier as string) || "free";
  const config = tierConfig[tier] || tierConfig.free;
  const { isAuthenticated, hydrate } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { hydrate(); }, [hydrate]);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await api.get("/courses");
        // Filter courses by tier
        const tierUpper = tier.toUpperCase();
        const filtered = res.data.filter((c: any) => c.tier === tierUpper);

        // Fetch chapters for each course
        const coursesWithChapters = await Promise.all(
          filtered.map(async (course: any) => {
            try {
              const chRes = await api.get(`/courses/${course.id}`);
              return chRes.data;
            } catch (error: any) {
              if (error.response?.status === 403) return null;
              return { ...course, chapters: [] };
            }
          })
        );

        setCourses(coursesWithChapters.filter(Boolean));
      } catch {
        console.error("Failed to fetch courses");
      }
      setLoading(false);
    }
    fetchCourses();
  }, [tier]);

  const allChapters = courses.flatMap((c) =>
    (c.chapters || []).map((ch) => ({ ...ch, courseName: c.name, courseId: c.id }))
  );

  return (
    <main className="min-h-screen bg-primary">
      <Navbar />
      <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back + Header */}
        <Link href="/courses" className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Courses</span>
        </Link>

        <div className="mb-12">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-4 ${config.tagColor}`}>
            {config.label}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-bright mb-3">
            {tier === "bridge" ? (
              <>Physics <span className="gradient-text">Bridge Course</span></>
            ) : (
              <>{config.label} <span className="gradient-text">Chapters</span></>
            )}
          </h1>
          <p className="text-text-muted max-w-xl">
            {tier === "free"
              ? "Start exploring physics with these free chapters. No subscription needed."
              : tier === "basic"
              ? "Complete animated video lectures, notes, and quizzes for every chapter."
              : "Advanced content including expert lectures, virtual labs, and board papers."}
          </p>
        </div>

        {/* Chapters Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 rounded-full border-[3px] border-accent/20 border-t-accent animate-spin mb-4" />
            <p className="text-text-muted text-sm">Loading chapters...</p>
          </div>
        ) : allChapters.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-16 text-center">
            <Atom className="w-12 h-12 text-accent mx-auto mb-4 animate-pulse" />
            <h2 className="text-xl font-bold text-text-bright mb-2">Coming Soon</h2>
            <p className="text-text-muted max-w-md mx-auto mb-6">
              Chapters for this course are being prepared. Check back soon for amazing physics content!
            </p>
            <Link href="/courses">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Browse Other Courses
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {courses.map((course) => (
              <div key={course.id} className="mb-10">
                {courses.length > 1 && (
                  <h2 className="text-lg font-semibold text-text-bright mb-4">{course.name}</h2>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {(course.chapters || []).map((chapter, idx) => {
                    const ChapterIcon = getChapterIcon(chapter.name);
                    const AnimationComponent = getChapterAnimation(chapter.name, chapter.animationKey);

                    return (
                      <Link
                        key={chapter.id}
                        href={`/courses/${tier}/${chapter.id}`}
                        className="group relative rounded-2xl border border-border bg-card p-6 text-center hover:border-accent/30 transition-all duration-500 hover:-translate-y-1 cursor-pointer"
                      >
                        {/* Chapter number badge */}
                        <div className="absolute top-3 left-3 w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center z-10">
                          <span className="text-xs font-bold text-accent">{chapter.displayOrder || idx + 1}</span>
                        </div>

                        {/* Animated Visual */}
                        <div className="w-full h-28 mx-auto rounded-xl bg-gradient-to-br from-surface-light/60 to-card-hover/60 border border-border/50 mb-4 overflow-hidden relative">
                          {AnimationComponent ? (
                            <AnimationComponent />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ChapterIcon className="w-10 h-10 text-accent/60" />
                            </div>
                          )}
                        </div>

                        {/* Name */}
                        <h3 className="text-sm font-semibold text-text-bright mb-2 line-clamp-2">
                          {chapter.name}
                        </h3>

                        {/* Content counts */}
                        <div className="flex items-center justify-center gap-3 text-xs text-text-muted">
                          {chapter._count.videos > 0 && (
                            <span className="flex items-center gap-1">
                              <Play className="w-3 h-3" />
                              {chapter._count.videos}
                            </span>
                          )}
                          {chapter._count.notes > 0 && (
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {chapter._count.notes}
                            </span>
                          )}
                          {chapter._count.questions > 0 && (
                            <span className="flex items-center gap-1">
                              <HelpCircle className="w-3 h-3" />
                              {chapter._count.questions}
                            </span>
                          )}
                        </div>

                        {/* Hover arrow */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight className="w-4 h-4 text-accent" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}
