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

export default function CoursesPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"smart" | "custom">("smart");
  const [classesData, setClassesData] = useState<any[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [activeClassId, setActiveClassId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .get("/courses/pricing/subjects")
      .then(({ data }) => {
        const list = data.data || [];
        setClassesData(list);
        setActiveClassId((prev) =>
          prev && list.some((c: { id: string }) => c.id === prev) ? prev : list[0]?.id ?? null
        );
      })
      .catch(() => setClassesData([]))
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
              Customized Learning
            </button>
          </div>

          <h2 className="text-3xl font-black text-heading mb-2 tracking-tight text-center">
            {activeTab === "smart" ? (
              <>Level Up Your <span className="gradient-text">Learning</span></>
            ) : (
              <>Design Your Own <span className="gradient-text">Curriculum</span></>
            )}
          </h2>
          <p className="text-text-muted max-w-lg mx-auto text-sm text-center">
            {activeTab === "smart"
              ? "Choose the perfect plan to unlock premium visual content and accelerate your science journey."
              : "Pick exactly what you need — any combination of classes and subjects."}
          </p>
        </div>

        {activeTab === "smart" ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <PlanCard
              bgColor="#1C4D8D"
              accentColor="#60A5FA"
              planName="Foundation Pass"
              price="FREE"
              originalPrice="₹3999"
              period="/yr"
              showCountdown
              animation="atom"
              included={[
                "Selected chapters (9–12 PCB)",
                "Animated concept videos",
                "Beginner-friendly path",
                "Progress tracking",
                "Mobile & desktop access",
              ]}
              excluded={["Full class content", "Virtual Labs", "Priority support"]}
              ctaLink="/course-details/foundation-pass"
            />

            <PlanCard
              bgColor="#162855"
              accentColor="#38BDF8"
              planName="Academic Plus"
              price="₹8,999"
              period="/yr"
              animation="magnet"
              included={[
                "Full Class 9–10 (PCB)",
                "Selected 11–12 P & C",
                "Chapter notes (PDF)",
                "MCQ quizzes + solutions",
                "Performance analytics",
                "Email support (24hr)",
              ]}
              excluded={["Virtual Labs & 3D", "WhatsApp support"]}
              ctaLink="/course-details/academic-plus"
            />

            <PlanCard
              bgColor="#2d1654"
              accentColor="#D8B4FE"
              planName="Elite Learning"
              price="₹15,999"
              period="/yr"
              badge="Most Popular"
              animation="circuit"
              included={[
                "Full 9–12 P + C + B",
                "Virtual Labs (64+) 🧪",
                "3D Visual Learning 🔬",
                "Board exam practice",
                "Notes + formula sheets",
                "Priority WhatsApp support",
                "Deep concept tools",
              ]}
              excluded={[]}
              ctaLink="/course-details/elite-learning"
            />
          </div>
        ) : (
          /* Customized Learning Section */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* FlexiLearn intro card with book animation */}
            <div className="relative overflow-hidden rounded-[1.75rem] border border-[#2d1f8a]/60">
              {/* Dark header */}
              <div className="relative overflow-hidden" style={{ backgroundColor: "#170C79" }}>
                <div className="absolute inset-0 bg-grid-dark pointer-events-none opacity-60" />
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[70px] opacity-25" style={{ backgroundColor: "#818CF8" }} />

                <div className="relative z-10 flex items-center gap-6 px-6 pt-5 pb-0">
                  {/* Book animation */}
                  <div className="shrink-0 flex h-[90px] items-end justify-center overflow-hidden">
                    <div className="scale-[0.56] origin-bottom">
                      <BookAnimation accent="#818CF8" />
                    </div>
                  </div>

                  {/* Text */}
                  <div className="flex-1 pb-4">
                    <span className="inline-block px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest text-white mb-2 shadow-lg"
                      style={{ background: "linear-gradient(135deg, #818CF8, #170C79)", boxShadow: "0 0 18px rgba(129,140,248,0.55)" }}>
                      ✦ FlexiLearn Plan
                    </span>
                    <h3 className="text-xl font-black text-white leading-tight">
                      Build Your Own <span className="text-[#818CF8]">Science Path</span>
                    </h3>
                    <p className="text-xs text-white/50 mt-1 max-w-sm">
                      Pick a class below, then tap subjects to add them to your bundle. Total updates live as you select.
                    </p>
                  </div>
                </div>

                {/* Wave */}
                <svg className="relative z-10 w-full -mb-px block" viewBox="0 0 500 20" preserveAspectRatio="none" style={{ height: "16px" }}>
                  <path d="M0,8 C125,24 375,0 500,8 L500,20 L0,20 Z" fill="white" />
                </svg>
              </div>

              {/* White body */}
              <div className="bg-white px-6 py-3 flex items-center gap-3 flex-wrap">
                {[
                  "Choose any class",
                  "Pick any subject",
                  "Pay only for what you need",
                ].map((step, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-[11.5px] font-semibold text-heading">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black text-white" style={{ background: "linear-gradient(135deg, #818CF8, #170C79)" }}>
                      {i + 1}
                    </span>
                    {step}
                    {i < 2 && <span className="text-text-muted mx-1">→</span>}
                  </span>
                ))}
              </div>
            </div>

            {/* Class selector */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-heading/40 mb-1">
                    Step 1 · Choose class
                  </p>
                  <h4 className="text-lg font-black text-heading tracking-tight">
                    Which grade are you in?
                  </h4>
                </div>
                <p className="text-xs text-text-muted">
                  Your picks from every class are combined in one plan.
                </p>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-thin">
                {classesData.map((cls) => {
                  const selectedHere = cls.subjects.filter((s: { id: string }) =>
                    selectedSubjects.includes(s.id)
                  ).length;
                  const isActive = cls.id === activeClassId;
                  return (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => setActiveClassId(cls.id)}
                      className={`snap-start shrink-0 flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-left transition-all duration-300 min-w-[160px] ${
                        isActive
                          ? "border-primary bg-primary/10 shadow-md shadow-primary/15 ring-1 ring-primary/25"
                          : "border-gray-200 bg-white hover:border-primary/30 hover:shadow-sm"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white ${
                          isActive
                            ? "bg-gradient-to-br from-primary to-[#04A9C4]"
                            : "bg-gradient-to-br from-slate-500 to-slate-700"
                        }`}
                      >
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-sm font-black text-heading truncate">{cls.name}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wide text-text-muted">
                          {cls.subjects?.length ?? 0} subjects
                          {selectedHere > 0 && (
                            <span className="text-primary"> · {selectedHere} picked</span>
                          )}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject cards */}
            {activeClass && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-heading/40 mb-1">
                      Step 2 · Add subjects
                    </p>
                    <h4 className="text-lg font-black text-heading tracking-tight flex items-center gap-2">
                      <Sparkle className="w-4 h-4 text-primary" />
                      Subjects for {activeClass.name}
                    </h4>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[10px] font-bold text-heading">
                    <Zap className="h-3 w-3 text-primary" />
                    Tap a card to select it
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {activeClass.subjects.map((sub: any) => {
                    const selected = selectedSubjects.includes(sub.id);
                    const { Icon, bg, border, iconGrad, ring, shadow, priceColor, subtitleColor } = subjectVisual(sub.name, sub.icon);
                    const enabled = sub.enabled !== false;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        disabled={!enabled}
                        onClick={() => enabled && toggleSubject(sub.id)}
                        className={`group relative overflow-hidden rounded-2xl text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 bg-gradient-to-br ${bg} border ${border} ${
                          !enabled
                            ? "cursor-not-allowed opacity-40 grayscale"
                            : "cursor-pointer hover:-translate-y-1 hover:shadow-xl"
                        } ${
                          selected ? `ring-2 ${ring}` : "shadow-sm hover:shadow-md"
                        }`}
                        style={selected ? { boxShadow: `0 8px 28px -6px ${shadow}` } : undefined}
                      >
                        {/* Selected top bar */}
                        {selected && (
                          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${iconGrad}`} />
                        )}

                        <div className="p-4">
                          {/* Icon + check */}
                          <div className="flex items-start justify-between mb-3 gap-2">
                            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${iconGrad} shadow-md`}>
                              <Icon className="h-5 w-5 text-white drop-shadow" />
                            </div>
                            <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                              selected
                                ? "border-emerald-400 bg-emerald-400"
                                : "border-gray-400 bg-white group-hover:border-gray-600"
                            }`}>
                              {selected
                                ? <CheckCircle2 className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                                : <span className="text-sm font-black text-gray-600 leading-none">+</span>
                              }
                            </div>
                          </div>

                          {/* Name */}
                          <h5 className="text-[13.5px] font-black text-heading leading-snug mb-0.5">
                            {sub.name}
                          </h5>
                          <p className={`text-[9px] font-bold uppercase tracking-wide mb-3 ${subtitleColor}`}>
                            Videos · Notes · Quizzes
                          </p>

                          {/* Price + status */}
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-black ${priceColor}`}>₹{sub.price}</span>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${
                              !enabled ? "text-gray-400" : selected ? "text-emerald-500" : "text-gray-400"
                            }`}>
                              {!enabled ? "Coming soon" : selected ? "Added ✓" : "Tap to add"}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Floating checkout bar */}
            <div className="sticky bottom-5 z-50 max-w-xl mx-auto">
              <div className="glass-morphism rounded-2xl px-5 py-4 border border-primary/25 shadow-[0_16px_40px_rgba(0,0,0,0.45)] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/25 shrink-0">
                    <Zap className="w-5 h-5 text-primary animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-white font-black text-sm">Custom Selection</h4>
                    <p className="text-white/45 text-[10px] font-semibold">
                      {selectedCount} {selectedCount === 1 ? "Subject" : "Subjects"} selected
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right shrink-0">
                    <span className="block text-[9px] text-white/35 font-black uppercase tracking-widest">
                      Total
                    </span>
                    <span className="text-xl font-black text-white">₹{totalPrice}</span>
                  </div>
                  <Link href={`/courses/custom-plan?subjects=${selectedSubjects.join(",")}`}>
                    <Button
                      disabled={selectedCount === 0}
                      className="px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 bg-primary hover:bg-[#04A9C4] text-white"
                    >
                      Explore <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
              {selectedCount === 0 && (
                <div className="mt-2.5 flex items-center justify-center gap-1.5 text-white/35 animate-pulse">
                  <AlertCircle className="w-3 h-3" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">
                    Select at least one subject to proceed
                  </span>
                </div>
              )}
            </div>
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
      <div className="relative z-10 text-center mb-8">
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
