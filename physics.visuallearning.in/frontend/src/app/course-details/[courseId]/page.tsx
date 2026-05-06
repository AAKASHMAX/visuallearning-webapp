"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  FileText,
  HelpCircle,
  Lock,
  Play,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { getChapterAnimation } from "@/components/chapter-animations";

type BillingCycle = "monthly" | "yearly";

type PlanVariant = {
  code: string;
  billingCycle: BillingCycle;
  price: number;
  durationDays: number;
};

type Chapter = {
  id: string;
  name: string;
  animationKey?: string | null;
  displayOrder: number;
  _count: { videos: number; notes: number; questions: number };
};

type Course = {
  id: string;
  name: string;
  description?: string | null;
  tier: string;
  chapters: Chapter[];
};

type PlanDetails = {
  code: string;
  name: string;
  description?: string | null;
  features: string[];
  previewVideoUrl?: string | null;
  variants: PlanVariant[];
  courses: Course[];
};

const themeByPlan: Record<string, { label: string; gradient: string; accent: string; glow: string; icon: typeof Zap }> = {
  FREE: { label: "Free Preview", gradient: "from-emerald-500 to-teal-600", accent: "text-emerald-400", glow: "shadow-emerald-500/10", icon: Sparkles },
  BASIC: { label: "Foundation Track", gradient: "from-accent to-blue-600", accent: "text-accent", glow: "shadow-accent/10", icon: BookOpen },
  ADVANCE: { label: "Advanced Track", gradient: "from-secondary to-purple-600", accent: "text-secondary-light", glow: "shadow-secondary/10", icon: Zap },
  BRIDGE: { label: "Bridge Track", gradient: "from-orange-500 to-red-600", accent: "text-orange-400", glow: "shadow-orange-500/10", icon: Target },
};

function normalizeBase(value: string) {
  return value.toUpperCase().replace(/-/g, "_").replace(/_YEARLY$/, "");
}

function formatPrice(price: number) {
  if (price <= 0) return "FREE";
  return `₹${price.toLocaleString("en-IN")}`;
}

function planPeriod(billing: BillingCycle, price: number) {
  if (price <= 0) return "free access";
  return billing === "monthly" ? "per month" : "per year";
}

function getPreviewEmbedUrl(url?: string | null) {
  if (!url) return "";
  if (url.includes("player.vimeo.com/video/")) return url;
  const vimeo = url.match(/vimeo\.com\/(\d+)(?:\/([a-zA-Z0-9]+))?/);
  if (vimeo) {
    return `https://player.vimeo.com/video/${vimeo[1]}${vimeo[2] ? `?h=${vimeo[2]}&` : "?"}badge=0&autopause=0&title=0&byline=0&portrait=0&dnt=1`;
  }
  if (url.includes("youtube.com/embed/")) return url;
  const youtube = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?&]+)/);
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}?rel=0`;
  return url;
}

function ChapterVisual({ chapter }: { chapter: Chapter }) {
  const Animation = getChapterAnimation(chapter.name, chapter.animationKey);
  return (
    <div className="relative h-28 rounded-xl border border-border/60 bg-gradient-to-br from-surface-light/70 to-card-hover/70 overflow-hidden">
      {Animation ? (
        <Animation />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <BookOpen className="w-10 h-10 text-accent/60" />
        </div>
      )}
    </div>
  );
}

export default function CourseDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = params.courseId as string;
  const [billing, setBilling] = useState<BillingCycle>((searchParams.get("billing") === "yearly" ? "yearly" : "monthly"));
  const [details, setDetails] = useState<PlanDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDetails() {
      setLoading(true);
      try {
        const { data } = await api.get(`/subscription/plans/${courseId}/details`);
        setDetails(data);
      } catch {
        setDetails(null);
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [courseId]);

  const baseCode = normalizeBase(details?.code || courseId);
  const theme = themeByPlan[baseCode] || themeByPlan.BASIC;
  const ThemeIcon = theme.icon;
  const monthly = details?.variants.find((variant) => variant.billingCycle === "monthly") || details?.variants[0];
  const yearly = details?.variants.find((variant) => variant.billingCycle === "yearly") || monthly;
  const activeVariant = billing === "monthly" ? monthly : yearly;
  const price = activeVariant?.price || 0;
  const totalChapters = useMemo(() => details?.courses.reduce((sum, course) => sum + (course.chapters?.length || 0), 0) || 0, [details]);
  const totalVideos = useMemo(
    () => details?.courses.reduce((sum, course) => sum + course.chapters.reduce((chapterSum, chapter) => chapterSum + (chapter._count?.videos || 0), 0), 0) || 0,
    [details]
  );

  return (
    <main className="min-h-screen bg-primary">
      <Navbar />

      <section className="relative pt-28 pb-20 lg:pb-32 overflow-hidden bg-grid">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-secondary/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Link href="/courses" className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Courses</span>
          </Link>

          {loading ? (
            <div className="h-96 rounded-2xl border border-border bg-card animate-pulse" />
          ) : !details ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <BookOpen className="w-10 h-10 text-accent/50 mx-auto mb-3" />
              <h1 className="text-xl font-bold text-text-bright mb-2">Course not found</h1>
              <p className="text-sm text-text-muted">This course plan is not available right now.</p>
            </div>
          ) : (
            <div className="max-w-3xl">
              <div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${theme.accent} bg-card border border-border mb-5`}>
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">{theme.label}</span>
                </div>

                <h1 className="text-4xl sm:text-5xl font-bold text-text-bright mb-5">
                  {details.name}
                </h1>
                <p className="text-text-muted text-lg leading-relaxed max-w-2xl mb-8">
                  {details.description || "A structured physics learning path with animated concepts, notes, quizzes, and chapter-wise progress."}
                </p>

                <div className="grid sm:grid-cols-3 gap-4 max-w-3xl">
                  {[
                    { label: "Chapters", value: totalChapters, icon: BookOpen },
                    { label: "Videos", value: totalVideos, icon: Play },
                    { label: "Plans", value: details.variants.length, icon: Sparkles },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-border bg-card p-5">
                      <item.icon className={`w-5 h-5 ${theme.accent} mb-3`} />
                      <p className="text-2xl font-black text-text-bright">{item.value}</p>
                      <p className="text-xs text-text-muted">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </section>

      {details && (
        <section className="pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[18rem_1fr] items-start">
              <aside className={`relative z-30 rounded-2xl border border-border bg-card shadow-2xl ${theme.glow} overflow-hidden lg:-mt-24`}>
                <div className="relative aspect-video bg-black overflow-hidden group">
                  {getPreviewEmbedUrl(details.previewVideoUrl) ? (
                    <iframe
                      src={getPreviewEmbedUrl(details.previewVideoUrl)}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-gradient-to-br from-surface via-primary to-black">
                      <div className={`absolute inset-0 opacity-40 bg-gradient-to-br ${theme.gradient}`} />
                      <div className="relative w-12 h-12 rounded-full bg-white/10 border border-white/15 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_24px_rgba(0,212,255,0.18)]">
                        <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                      </div>
                      <p className="relative text-white font-bold text-xs">Course Preview</p>
                      <p className="relative text-white/55 text-[10px] mt-0.5">3D physics preview</p>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center`}>
                      <ThemeIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-accent">{details.code}</p>
                      <h2 className="text-sm font-bold text-text-bright truncate">{details.name}</h2>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="inline-flex rounded-xl border border-border bg-surface p-1">
                      <button
                        onClick={() => setBilling("monthly")}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${billing === "monthly" ? "bg-accent text-primary" : "text-text-muted hover:text-text-bright"}`}
                      >
                        Monthly
                      </button>
                      <button
                        onClick={() => setBilling("yearly")}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${billing === "yearly" ? "bg-accent text-primary" : "text-text-muted hover:text-text-bright"}`}
                      >
                        Yearly
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-3xl font-black text-text-bright">{formatPrice(price)}</p>
                    <p className="text-xs text-text-muted mt-0.5">{planPeriod(billing, price)}</p>
                  </div>

                  <Link href={price > 0 ? `/subscription?plan=${activeVariant?.code || details.code}&billing=${billing}` : `/courses/${baseCode.toLowerCase()}`} className="block">
                    <Button variant={price > 0 ? "primary" : "outline"} className="w-full">
                      {price > 0 && <Lock className="w-4 h-4 mr-2" />}
                      {price > 0 ? "Start Subscription" : "Start Learning"}
                    </Button>
                  </Link>

                  <div className="mt-4 space-y-2">
                    {(details.features || []).slice(0, 3).map((feature) => (
                      <div key={feature} className="flex items-start gap-2 text-xs">
                        <Check className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
                        <span className="text-text-muted">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>

              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-text-bright mb-2">Course Content</h2>
                  <p className="text-sm text-text-muted">Chapter cards keep the physics animated graphics from this webapp.</p>
                </div>

                <div className="space-y-10">
              {details.courses.map((course) => (
                <div key={course.id}>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-text-bright">{course.name}</h3>
                      {course.description && <p className="text-sm text-text-muted mt-1">{course.description}</p>}
                    </div>
                    <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-text-muted">{course.tier}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {(course.chapters || []).map((chapter, index) => (
                      <Link
                        key={chapter.id}
                        href={`/courses/${course.tier.toLowerCase()}/${chapter.id}`}
                        className="group relative rounded-2xl border border-border bg-card p-5 text-center hover:border-accent/30 transition-all duration-500 hover:-translate-y-1"
                      >
                        <div className="absolute top-3 left-3 w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center z-10">
                          <span className="text-xs font-bold text-accent">{chapter.displayOrder || index + 1}</span>
                        </div>

                        <ChapterVisual chapter={chapter} />

                        <h4 className="text-sm font-semibold text-text-bright mt-4 mb-3 line-clamp-2">{chapter.name}</h4>
                        <div className="flex items-center justify-center gap-3 text-xs text-text-muted">
                          {chapter._count?.videos > 0 && <span className="flex items-center gap-1"><Play className="w-3 h-3" />{chapter._count.videos}</span>}
                          {chapter._count?.notes > 0 && <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{chapter._count.notes}</span>}
                          {chapter._count?.questions > 0 && <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3" />{chapter._count.questions}</span>}
                        </div>

                        <ChevronRight className="absolute top-3 right-3 w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
