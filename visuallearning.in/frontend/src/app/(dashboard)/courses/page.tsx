"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import type { LucideIcon } from "lucide-react";
import {
  Sparkles, Zap, GraduationCap,
  CheckCircle2, XCircle, ArrowRight,
  Orbit, Flame, Lightbulb, Microscope, Beaker, Dna, Waves, Atom,
  AlertCircle, Calculator, FlaskConical, Sparkle
} from "lucide-react";

const iconByKey: Record<string, LucideIcon> = {
  atom: Atom,
  flask: FlaskConical,
  "flask-conical": FlaskConical,
  dna: Dna,
  calculator: Calculator,
  microscope: Microscope,
  beaker: Beaker,
  waves: Waves,
  lightbulb: Lightbulb,
};

function subjectVisual(name: string, iconKey?: string | null) {
  const n = name.toLowerCase();
  let Icon: LucideIcon = Sparkles;
  let bg = "from-slate-50 to-indigo-50";
  let border = "border-indigo-100";
  let iconGrad = "from-cyan-400 to-teal-500";
  let ring = "ring-cyan-400/40";
  let shadow = "rgba(6,182,212,0.3)";
  let priceColor = "text-cyan-600";
  let subtitleColor = "text-indigo-400";

  if (iconKey && iconByKey[iconKey]) Icon = iconByKey[iconKey];

  if (n.includes("physics")) {
    Icon = Atom;
    bg = "from-sky-50 to-blue-50";
    border = "border-sky-100";
    iconGrad = "from-sky-400 to-blue-600";
    ring = "ring-sky-400/45";
    shadow = "rgba(56,189,248,0.35)";
    priceColor = "text-sky-600";
    subtitleColor = "text-sky-400";
  } else if (n.includes("chemistry")) {
    Icon = FlaskConical;
    bg = "from-emerald-50 to-teal-50";
    border = "border-emerald-100";
    iconGrad = "from-emerald-400 to-teal-500";
    ring = "ring-emerald-400/45";
    shadow = "rgba(52,211,153,0.35)";
    priceColor = "text-emerald-600";
    subtitleColor = "text-emerald-400";
  } else if (n.includes("biology")) {
    Icon = Dna;
    bg = "from-rose-50 to-pink-50";
    border = "border-rose-100";
    iconGrad = "from-rose-400 to-fuchsia-500";
    ring = "ring-rose-400/45";
    shadow = "rgba(251,113,133,0.35)";
    priceColor = "text-rose-500";
    subtitleColor = "text-rose-400";
  } else if (n.includes("math")) {
    Icon = Calculator;
    bg = "from-violet-50 to-purple-50";
    border = "border-violet-100";
    iconGrad = "from-violet-400 to-purple-600";
    ring = "ring-violet-400/45";
    shadow = "rgba(167,139,250,0.35)";
    priceColor = "text-violet-600";
    subtitleColor = "text-violet-400";
  }

  return { Icon, bg, border, iconGrad, ring, shadow, priceColor, subtitleColor };
}

// Course theme config based on planKey
const COURSE_THEME: Record<string, { bgColor: string; accentColor: string; animation: string; excluded: string[] }> = {
  FOUNDATION_PASS: { bgColor: "#1C4D8D", accentColor: "#60A5FA", animation: "atom", excluded: ["Full class content", "Virtual Labs", "Priority support"] },
  ACADEMIC_PLUS: { bgColor: "#162855", accentColor: "#38BDF8", animation: "magnet", excluded: ["Virtual Labs & 3D", "WhatsApp support"] },
  ELITE_LEARNING: { bgColor: "#2d1654", accentColor: "#D8B4FE", animation: "circuit", excluded: [] },
  CLASS_9: { bgColor: "#1e3a8a", accentColor: "#3b82f6", animation: "atom", excluded: [] },
  CLASS_10: { bgColor: "#1e3a8a", accentColor: "#3b82f6", animation: "magnet", excluded: [] },
  CLASS_11: { bgColor: "#312e81", accentColor: "#818cf8", animation: "circuit", excluded: [] },
  CLASS_12: { bgColor: "#312e81", accentColor: "#818cf8", animation: "book", excluded: [] },
};

export default function CoursesPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"smart" | "custom">("smart");
  const [classesData, setClassesData] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get("/courses/pricing/subjects").then(({ data }) => data.data || []),
      api.get("/courses/list").then(({ data }) => data.data || []),
    ])
      .then(([subjectsData, coursesData]) => {
        setClassesData(subjectsData);
        setCourses(coursesData);
        setActiveClassId((prev) =>
          prev && subjectsData.some((c: { id: string }) => c.id === prev) ? prev : subjectsData[0]?.id ?? null
        );
      })
      .catch(() => { setClassesData([]); setCourses([]); })
      .finally(() => setLoading(false));
  }, []);

  const totalPrice = useMemo(() => {
    if (!classesData.length) return 0;
    const idToPrice = new Map<string, number>();
    classesData.forEach((cls) =>
      cls.subjects.forEach((s: { id: string; price: number }) => idToPrice.set(s.id, s.price))
    );
    return selectedSubjects.reduce((sum, id) => sum + (idToPrice.get(id) ?? 0), 0);
  }, [selectedSubjects, classesData]);

  const toggleSubject = (subId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subId) ? prev.filter((id) => id !== subId) : [...prev, subId]
    );
  };

  const selectedCount = selectedSubjects.length;
  const activeClass = classesData.find((c) => c.id === activeClassId) ?? classesData[0];

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Page Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#f97316] via-[#a855f7] to-[#0ea5e9] drop-shadow-sm py-1">
          VisualLearning Courses
        </h1>
        <p className="text-lg text-text-muted max-w-2xl mx-auto font-medium">
          Unlock your potential with our immersive 3D science curriculum. Choose a plan that fits your learning style.
        </p>
      </div>

      <ConceptCarousel />

      {/* ALL PRICING PLANS */}
      <div className="mt-12 mb-16">
        {/* Tab selector */}
        <div className="flex flex-col items-center mb-10">
          <div className="inline-flex p-1 rounded-2xl bg-white border border-gray-200 shadow-sm mb-6">
            <button
              onClick={() => setActiveTab("smart")}
              className={`px-7 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 ${
                activeTab === "smart"
                  ? "bg-primary text-white shadow-md"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Smart Learning
            </button>
            <button
              onClick={() => setActiveTab("custom")}
              className={`px-7 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 ${
                activeTab === "custom"
                  ? "bg-primary text-white shadow-md"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Grade-wise Plans
            </button>
          </div>

          <h2 className="text-3xl font-black text-heading mb-2 tracking-tight text-center">
            {activeTab === "smart" ? (
              <>Premium Learning <span className="gradient-text">Packages</span></>
            ) : (
              <>Structured <span className="gradient-text">Grade-wise</span> Plans</>
            )}
          </h2>
          <p className="text-text-muted max-w-lg mx-auto text-sm text-center mb-8">
            {activeTab === "smart"
              ? "Choose the perfect plan to unlock premium visual content and accelerate your science journey."
              : "Complete curricula tailored for your specific grade level with full access to all features."}
          </p>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center p-1 bg-white border border-gray-200 rounded-xl shadow-sm mb-2">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                billingCycle === "monthly" ? "bg-primary text-white shadow-md" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                billingCycle === "yearly" ? "bg-primary text-white shadow-md" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Yearly
              <span className="ml-2 inline-flex items-center justify-center bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Save 20%</span>
            </button>
          </div>
        </div>

        {activeTab === "smart" ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {courses
              .filter(c => ["FOUNDATION_PASS", "ACADEMIC_PLUS", "ELITE_LEARNING"].includes(c.planKey))
              .sort((a, b) => {
                const order = ["FOUNDATION_PASS", "ACADEMIC_PLUS", "ELITE_LEARNING"];
                return order.indexOf(a.planKey) - order.indexOf(b.planKey);
              })
              .map((course) => {
              const theme = COURSE_THEME[course.planKey] || COURSE_THEME.FOUNDATION_PASS;
              const currentPrice = billingCycle === "monthly" ? course.monthlyPrice : course.yearlyPrice;
              const isFree = currentPrice === 0 && course.planKey !== "FLEXI_PLAN" && course.planKey !== "ACADEMIC_PLUS" && course.planKey !== "ELITE_LEARNING"; // Only free if genuinely 0, handle fallbacks gracefully
              const priceStr = isFree ? "FREE" : `₹${(currentPrice || 0).toLocaleString("en-IN")}`;
              const isElite = course.planKey === "ELITE_LEARNING";
              return (
                <PlanCard
                  key={course.id}
                  bgColor={theme.bgColor}
                  accentColor={theme.accentColor}
                  planName={course.name}
                  price={priceStr}
                  originalPrice={isFree ? "₹3999" : undefined}
                  period={`/${billingCycle === "monthly" ? "mo" : "yr"}`}
                  showCountdown={isFree}
                  animation={theme.animation}
                  badge={isElite ? "Most Popular" : undefined}
                  included={course.features}
                  excluded={theme.excluded}
                  ctaLink={`/course-details/${course.slug}?billing=${billingCycle}`}
                />
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {courses.filter(c => ["CLASS_9", "CLASS_10", "CLASS_11", "CLASS_12"].includes(c.planKey)).map((course) => {
              const theme = COURSE_THEME[course.planKey] || COURSE_THEME.CLASS_9;
              const currentPrice = billingCycle === "monthly" ? course.monthlyPrice : course.yearlyPrice;
              const priceStr = `₹${(currentPrice || 0).toLocaleString("en-IN")}`;
              return (
                <PlanCard
                  key={course.id}
                  bgColor={theme.bgColor}
                  accentColor={theme.accentColor}
                  planName={course.name}
                  price={priceStr}
                  period={`/${billingCycle === "monthly" ? "mo" : "yr"}`}
                  animation={theme.animation}
                  included={course.features}
                  excluded={theme.excluded}
                  ctaLink={`/course-details/${course.slug}?billing=${billingCycle}`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* COUNTDOWN TIMER */
function CountdownTimer({ accent }: { accent: string }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">Ends in</span>
      <div className="flex items-center gap-0.5">
        {[pad(timeLeft.h), pad(timeLeft.m), pad(timeLeft.s)].map((v, i) => (
          <span key={i} className="flex items-center gap-0.5">
            <span
              className="inline-block w-7 text-center py-0.5 rounded text-[11px] font-black text-white"
              style={{ backgroundColor: `${accent}30`, border: `1px solid ${accent}40` }}
            >
              {v}
            </span>
            {i < 2 && <span className="text-[11px] font-black text-white/30">:</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

/* 3D CONCEPT CAROUSEL */
function ConceptCarousel() {
  const concepts = [
    { name: "Laws of Motion", icon: Orbit, gradient: "from-blue-400 to-blue-600", formula: "F = ma" },
    { name: "Atomic Structure", icon: Atom, gradient: "from-purple-400 to-purple-600", formula: "E = -13.6/n²" },
    { name: "Cell Biology", icon: Microscope, gradient: "from-green-400 to-green-600", formula: "DNA → RNA" },
    { name: "Optics & Light", icon: Lightbulb, gradient: "from-yellow-400 to-orange-500", formula: "n₁sinθ₁=n₂sinθ₂" },
    { name: "Thermodynamics", icon: Flame, gradient: "from-orange-500 to-red-600", formula: "ΔU = Q − W" },
    { name: "Organic Chem", icon: Beaker, gradient: "from-emerald-400 to-teal-600", formula: "CH₄ + 2O₂" },
    { name: "Genetics", icon: Dna, gradient: "from-pink-400 to-rose-600", formula: "Aa × Aa" },
    { name: "EM Waves", icon: Waves, gradient: "from-cyan-400 to-blue-600", formula: "c = λf" },
  ];
  const radius = 320;
  const angleStep = 360 / concepts.length;
  return (
    <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-dark py-14 mb-10">
      <div className="absolute inset-0 bg-grid-dark opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#05BFDB]/10 rounded-full blur-[150px]" />
      <div className="relative z-10 text-center mb-16">
        <h2 className="text-2xl font-black text-white tracking-tight mb-1.5">
          Explore Science in <span className="text-[#05BFDB]">3D</span>
        </h2>
        <p className="text-white/45 text-sm font-semibold">Rotating through topics you&apos;ll master</p>
      </div>
      <div className="carousel-scene mx-auto relative z-10" style={{ height: 280 }}>
        <div
          className="carousel-ring relative mx-auto w-[160px] h-[200px]"
          style={{ transformStyle: "preserve-3d", marginTop: 20 }}
        >
          {concepts.map((c, i) => (
            <div
              key={i}
              className="carousel-card absolute inset-0 w-[160px] h-[200px]"
              style={{ transform: `rotateY(${i * angleStep}deg) translateZ(${radius}px)` }}
            >
              <div className="w-full h-full rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-4 flex flex-col items-center justify-center text-center gap-2.5 shadow-lg">
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center shadow-lg`}
                >
                  <c.icon className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xs font-black text-white leading-tight uppercase tracking-tight">{c.name}</h4>
                <span className="text-[10px] font-mono text-[#05BFDB]/80">{c.formula}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ANIMATIONS */
function AtomAnimation({ accent }: { accent: string }) {
  return (
    <div className="relative w-40 h-40 mx-auto">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full blur-[30px] opacity-20"
        style={{ backgroundColor: accent }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center z-10"
        style={{ background: accent, boxShadow: `0 0 10px ${accent}, 0 0 30px ${accent}80` }}
      >
        <span className="text-[8px] font-black text-white">N</span>
      </div>
      <div
        className="absolute inset-0 rounded-full animate-spin border"
        style={{ animationDuration: "4s", borderColor: `${accent}40` }}
      >
        <div
          className="absolute -top-1 left-1/2 w-3 h-3 rounded-full"
          style={{ backgroundColor: "#fff", boxShadow: `0 0 10px #fff, 0 0 20px ${accent}` }}
        />
      </div>
      <div
        className="absolute inset-4 rounded-full animate-spin border"
        style={{ animationDuration: "3s", animationDirection: "reverse", borderColor: `${accent}30` }}
      >
        <div
          className="absolute top-1/2 -right-1 w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: "#fff", boxShadow: `0 0 8px #fff, 0 0 15px ${accent}` }}
        />
      </div>
      <div
        className="absolute inset-8 rounded-full animate-spin border"
        style={{ animationDuration: "6s", borderColor: `${accent}20` }}
      >
        <div
          className="absolute bottom-0 left-1/4 w-2 h-2 rounded-full"
          style={{ backgroundColor: "#fff", boxShadow: `0 0 5px #fff, 0 0 10px ${accent}` }}
        />
      </div>
    </div>
  );
}

function MagnetAnimation({ accent }: { accent: string }) {
  return (
    <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
      <div className="absolute w-20 h-20 rounded-full blur-[25px] opacity-20" style={{ backgroundColor: accent }} />
      <div
        className="absolute z-0 flex items-center justify-center"
        style={{ animation: "magnetic-lines 3s ease-in-out infinite" }}
      >
        <div
          className="w-16 h-16 border-t-2 border-b-2 rounded-full absolute"
          style={{ borderColor: accent, opacity: 0.8 }}
        />
        <div
          className="w-10 h-10 border-t-2 border-b-2 rounded-full absolute"
          style={{ borderColor: accent, opacity: 0.6 }}
        />
        <div className="w-1 h-8 rounded-full absolute" style={{ backgroundColor: accent, opacity: 0.9 }} />
      </div>
      <div
        className="absolute z-10 w-7 h-12 rounded-md border-2 flex items-center justify-center"
        style={{
          borderColor: `${accent}80`,
          backgroundColor: `${accent}20`,
          animation: "magnet-left 3s ease-in-out infinite",
        }}
      >
        <span className="text-[10px] font-black text-white">N</span>
      </div>
      <div
        className="absolute z-10 w-7 h-12 rounded-md border-2 flex items-center justify-center"
        style={{
          borderColor: `${accent}80`,
          backgroundColor: `${accent}20`,
          animation: "magnet-right 3s ease-in-out infinite",
        }}
      >
        <span className="text-[10px] font-black text-white">S</span>
      </div>
    </div>
  );
}

function CircuitAnimation({ accent }: { accent: string }) {
  return (
    <div className="relative w-40 h-40 mx-auto">
      <div
        className="absolute inset-3 rounded-2xl border-2"
        style={{
          borderColor: `${accent}60`,
          boxShadow: `0 0 15px ${accent}30, inset 0 0 15px ${accent}30`,
        }}
      />
      <div className="absolute left-1 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 z-10">
        <div
          className="w-3 h-6 rounded-sm border"
          style={{ borderColor: accent, backgroundColor: `${accent}50` }}
        />
        <span className="text-[6px] font-black text-white">+−</span>
      </div>
      <div className="absolute right-1 top-1/2 -translate-y-1/2 z-10">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: `${accent}20`,
            border: `2px solid ${accent}`,
            animation: "pulse-glow-brand 2s ease-in-out infinite",
          }}
        >
          <Lightbulb className="w-3.5 h-3.5 text-white" />
        </div>
      </div>
    </div>
  );
}

function BookAnimation({ accent }: { accent: string }) {
  const formulas = ["E=mc²", "F=ma", "PV=nRT", "λf=c"];
  return (
    <div className="relative w-40 h-40 mx-auto flex items-end justify-center">
      {/* Glow under book */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-6 rounded-full blur-[18px] opacity-40" style={{ backgroundColor: accent }} />
      {/* Open book */}
      <div className="relative w-32 mb-2 z-10">
        {/* Left page */}
        <div
          className="absolute bottom-0 left-0 w-16 h-20 rounded-tl-xl border-l-2 border-t-2 border-b-2"
          style={{ borderColor: `${accent}60`, backgroundColor: `${accent}12` }}
        >
          {/* Lines on left page */}
          {[0,1,2].map(j => (
            <div key={j} className="mx-2 mt-3 rounded-full h-0.5" style={{ marginTop: j === 0 ? 10 : 6, backgroundColor: `${accent}30` }} />
          ))}
        </div>
        {/* Right page */}
        <div
          className="absolute bottom-0 right-0 w-16 h-20 rounded-tr-xl border-r-2 border-t-2 border-b-2"
          style={{ borderColor: `${accent}60`, backgroundColor: `${accent}12` }}
        >
          {[0,1,2].map(j => (
            <div key={j} className="mx-2 rounded-full h-0.5" style={{ marginTop: j === 0 ? 10 : 6, backgroundColor: `${accent}30` }} />
          ))}
        </div>
        {/* Spine */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-20 rounded-full" style={{ backgroundColor: `${accent}70` }} />
      </div>
      {/* Rising formulas */}
      {formulas.map((f, i) => (
        <div
          key={i}
          className="absolute font-mono font-black rounded-lg px-2 py-0.5 border z-20 text-white"
          style={{
            fontSize: "9px",
            backgroundColor: `${accent}35`,
            borderColor: `${accent}65`,
            left: `${10 + i * 22}%`,
            bottom: 0,
            animation: `formula-rise ${2.8 + i * 0.45}s ease-in-out infinite`,
            animationDelay: `${i * 0.6}s`,
          }}
        >
          {f}
        </div>
      ))}
    </div>
  );
}

/* PLAN CARD */
function PlanCard({
  bgColor,
  accentColor,
  planName,
  price,
  originalPrice,
  period = "",
  badge,
  animation,
  included,
  excluded,
  ctaLink,
  ctaText = "Explore Course",
  showCountdown,
  onCtaClick,
}: any) {
  const isPopular = !!badge;
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-[1.75rem] border bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
        isPopular
          ? "border-purple-300/60 ring-1 ring-purple-200/50 shadow-purple-100/60"
          : "border-card-border"
      }`}
    >
      {/* Popular ribbon */}
      {isPopular && (
        <div className="absolute top-3.5 right-0 z-20">
          <span className="block bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1 rounded-l-full shadow-lg">
            {badge}
          </span>
        </div>
      )}

      {/* DARK HEADER */}
      <div className="relative overflow-hidden" style={{ backgroundColor: bgColor }}>
        <div className="absolute inset-0 bg-grid-dark pointer-events-none opacity-60" />
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-20"
          style={{ backgroundColor: accentColor }}
        />

        {/* Plan name pill */}
        <div className="relative z-10 flex justify-center pt-4 mb-2">
          <h3
            className="px-5 py-1.5 rounded-full text-sm font-black text-white uppercase tracking-widest"
            style={{ backgroundColor: `${accentColor}25`, border: `1px solid ${accentColor}45` }}
          >
            {planName}
          </h3>
        </div>

        {/* Price + badge */}
        <div className="relative z-10 px-5 mb-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-3xl font-black text-white leading-none"
                style={{ textShadow: `0 0 25px ${accentColor}60` }}
              >
                {price}
              </span>
              {originalPrice && (
                <span className="text-[13px] font-bold text-white/65 line-through">{originalPrice}</span>
              )}
              <span className="text-[10px] font-bold text-white/40">{period}</span>
            </div>
            {showCountdown && <CountdownTimer accent={accentColor} />}
          </div>
        </div>

        {/* Animation */}
        <div className="relative z-10 flex h-[72px] items-center justify-center overflow-hidden">
          <div className="scale-[0.43] origin-center">
            {animation === "atom" && <AtomAnimation accent={accentColor} />}
            {animation === "magnet" && <MagnetAnimation accent={accentColor} />}
            {animation === "circuit" && <CircuitAnimation accent={accentColor} />}
          </div>
        </div>

        {/* Wave */}
        <svg
          className="relative z-10 w-full -mb-px block"
          viewBox="0 0 500 20"
          preserveAspectRatio="none"
          style={{ height: "16px" }}
        >
          <path d="M0,8 C125,24 375,0 500,8 L500,20 L0,20 Z" fill="white" />
        </svg>
      </div>

      {/* WHITE BODY */}
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <div className="flex-1 space-y-2.5 mb-3">

          {/* Included list */}
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-primary/80">
              <Sparkles className="h-2.5 w-2.5 text-[#00b4d8]" />
              What&apos;s included
            </p>
            <ul className="space-y-1">
              {included.map((f: string, i: number) => (
                <li
                  key={`i-${i}`}
                  className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/80 py-1.5 px-2.5"
                >
                  <div
                    className="shrink-0 flex h-5 w-5 items-center justify-center rounded-md"
                    style={{ backgroundColor: `${accentColor}18`, border: `1px solid ${accentColor}35` }}
                  >
                    <CheckCircle2 className="h-3 w-3" style={{ color: accentColor }} strokeWidth={2.5} />
                  </div>
                  <span className="text-[13.5px] font-semibold leading-tight text-heading">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Excluded list */}
          {excluded && excluded.length > 0 && (
            <div className="rounded-xl border border-dashed border-rose-200/80 bg-rose-50/60 px-3 py-2.5">
              <p className="mb-1.5 flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.16em] text-rose-600/70">
                <XCircle className="h-2.5 w-2.5 text-rose-400" strokeWidth={2.5} />
                Not in this plan
              </p>
              <ul className="space-y-1">
                {excluded.map((f: string, i: number) => (
                  <li key={`e-${i}`} className="flex items-center gap-1.5 px-1">
                    <XCircle className="h-3 w-3 shrink-0 text-rose-300" strokeWidth={2} />
                    <span className="text-[13px] font-medium leading-tight text-text-muted line-through decoration-rose-300/80">
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* CTA */}
        {onCtaClick ? (
          <Button
            onClick={onCtaClick}
            className="w-full rounded-xl py-3 text-xs font-black shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] text-white"
            style={{ background: `linear-gradient(135deg, ${accentColor}, ${bgColor})` }}
          >
            {ctaText} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        ) : (
          <Link href={ctaLink || "#"} className="block">
            <Button
              className="w-full rounded-xl py-3 text-xs font-black shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] text-white"
              style={{ background: `linear-gradient(135deg, ${accentColor}, ${bgColor})` }}
            >
              {ctaText} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
