"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import type { ClassItem } from "@/types";
import { 
  BookOpen, Beaker, Sparkles, Zap, GraduationCap, 
  Crown, Target, CheckCircle2, XCircle, ArrowRight, 
  Orbit, Flame, Lightbulb, Microscope, Dna, Waves, Atom
} from "lucide-react";

const classColors = ["from-blue-500 to-blue-700", "from-orange-500 to-orange-700", "from-[#f59e0b] to-[#d97706]", "from-purple-500 to-purple-700"];

export default function CoursesPage() {
  const [loading, setLoading] = useState(false);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ConceptCarousel />


      {/* ── PRICING PLANS ── */}
      <div className="mb-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass mb-4">
            <Sparkles className="w-4 h-4 text-[#05BFDB]" />
            <span className="text-[11px] text-text-muted font-black uppercase tracking-widest">Premium Plans</span>
          </div>
          <h2 className="text-3xl font-black text-heading mb-3 tracking-tight">Our Pricing & <span className="gradient-text">Plans</span></h2>
          <p className="text-text-muted max-w-xl mx-auto text-sm">Choose the perfect plan to unlock premium visual content and accelerate your science learning journey.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <PlanCard bgColor="#1C4D8D" accentColor="#60A5FA" planName="Foundation Pass" price="FREE" originalPrice="₹3999" period="/yr" showCountdown
            animation="atom"
            included={["Selected chapters (9–12 PCB)","Animated concept videos","Beginner-friendly path","Progress tracking","Mobile & desktop access"]}
            excluded={["Full class content","Virtual Labs","Priority support"]} ctaLink="/course-details/foundation-pass" />

          <PlanCard bgColor="#162855" accentColor="#38BDF8" planName="Academic Plus" price="₹8999" period="/yr"
            animation="magnet"
            included={["Full Class 9–10 (PCB)","Selected 11–12 P & C","Chapter notes (PDF)","MCQ quizzes + solutions","Performance analytics","Email support (24hr)"]}
            excluded={["Virtual Labs & 3D","WhatsApp support"]} ctaLink="/course-details/academic-plus" />

          <PlanCard bgColor="#2d1654" accentColor="#D8B4FE" planName="Elite Learning" price="₹15999" period="/yr" badge="Most Popular"
            animation="circuit"
            included={["Full 9–12 P + C + B","Virtual Labs (64+) 🧪","3D Visual Learning 🔬","Board exam practice","Notes + formula sheets","Priority WhatsApp support","Deep concept tools"]}
            excluded={[]} ctaLink="/course-details/elite-learning" />

          <PlanCard bgColor="#202940" accentColor="#818CF8" planName="FlexiLearn" price="Custom"
            animation="book"
            included={["Choose class (9–12)","Select up to 3 subjects","Flexible pricing","Personalized dashboard","Switch subjects anytime"]}
            excluded={["Full platform access","Virtual Labs (Elite only)"]} ctaLink="/course-details/flexilearn" />
        </div>
      </div>
    </div>
  );
}

/* ── COUNTDOWN TIMER (resets at midnight) ── */
function CountdownTimer({ accent }: { accent: string }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-[10px] font-black text-white uppercase tracking-widest">Offer ends in</span>
      <div className="flex items-center gap-1">
        {[pad(timeLeft.h), pad(timeLeft.m), pad(timeLeft.s)].map((v, i) => (
          <span key={i} className="flex items-center gap-1">
            <span className="inline-block w-8 text-center py-1 rounded text-[13px] font-black text-white"
              style={{ backgroundColor: `${accent}35`, border: `1px solid ${accent}40` }}>
              {v}
            </span>
            {i < 2 && <span className="text-[13px] font-black text-white/40">:</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── 3D CONCEPT CAROUSEL ── */
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
  const radius = 320; const angleStep = 360 / concepts.length;
  return (
    <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-dark py-16">
      <div className="absolute inset-0 bg-grid-dark opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#05BFDB]/10 rounded-full blur-[150px]" />
      <div className="relative z-10 text-center mb-10">
        <h2 className="text-3xl font-black text-white tracking-tight mb-2">Explore Science in <span className="text-[#05BFDB]">3D</span></h2>
        <p className="text-white/50 text-sm font-semibold">Rotating through topics you&apos;ll master</p>
      </div>
      <div className="carousel-scene mx-auto relative z-10" style={{ height: 300 }}>
        <div className="carousel-ring relative mx-auto w-[160px] h-[210px]" style={{ transformStyle: "preserve-3d", marginTop: 20 }}>
          {concepts.map((c, i) => (
            <div key={i} className="carousel-card absolute inset-0 w-[160px] h-[210px]" style={{ transform: `rotateY(${i * angleStep}deg) translateZ(${radius}px)` }}>
              <div className="w-full h-full rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-5 flex flex-col items-center justify-center text-center gap-3 shadow-lg">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center shadow-lg`}><c.icon className="w-6 h-6 text-white" /></div>
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

/* ── ANIMATION: Atom Structure ── */
function AtomAnimation({ accent }: { accent: string }) {
  return (
    <div className="relative w-40 h-40 mx-auto">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full blur-[30px] opacity-20" style={{ backgroundColor: accent }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center z-10" style={{ background: accent, boxShadow: `0 0 10px ${accent}, 0 0 30px ${accent}80` }}>
        <span className="text-[8px] font-black text-white">N</span>
      </div>
      {/* 3 electron orbits */}
      <div className="absolute inset-0 rounded-full animate-spin border" style={{ animationDuration: "4s", borderColor: `${accent}40`, boxShadow: `inset 0 0 20px ${accent}20` }}>
        <div className="absolute -top-1 left-1/2 w-3 h-3 rounded-full" style={{ backgroundColor: "#fff", boxShadow: `0 0 10px #fff, 0 0 20px ${accent}, 0 0 40px ${accent}` }} />
      </div>
      <div className="absolute inset-4 rounded-full animate-spin border" style={{ animationDuration: "3s", animationDirection: "reverse", borderColor: `${accent}30` }}>
        <div className="absolute top-1/2 -right-1 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#fff", boxShadow: `0 0 8px #fff, 0 0 15px ${accent}, 0 0 30px ${accent}` }} />
      </div>
      <div className="absolute inset-8 rounded-full animate-spin border" style={{ animationDuration: "6s", borderColor: `${accent}20` }}>
        <div className="absolute bottom-0 left-1/4 w-2 h-2 rounded-full" style={{ backgroundColor: "#fff", boxShadow: `0 0 5px #fff, 0 0 10px ${accent}, 0 0 20px ${accent}` }} />
      </div>
      <div className="absolute top-0 right-0 text-[8px] font-mono font-bold animate-float" style={{ color: accent }}>e⁻</div>
      <div className="absolute bottom-0 left-0 text-[8px] font-mono font-bold animate-float" style={{ color: accent, animationDelay: "1s" }}>p⁺</div>
    </div>
  );
}

/* ── ANIMATION: Magnets ── */
function MagnetAnimation({ accent }: { accent: string }) {
  return (
    <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
      <div className="absolute w-20 h-20 rounded-full blur-[25px] opacity-20" style={{ backgroundColor: accent }} />
      
      {/* Magnetic Lines (Center curves) */}
      <div className="absolute z-0 flex items-center justify-center" style={{ animation: "magnetic-lines 3s ease-in-out infinite" }}>
        <div className="w-16 h-16 border-t-2 border-b-2 rounded-full absolute" style={{ borderColor: accent, filter: `drop-shadow(0 0 8px ${accent}) drop-shadow(0 0 15px ${accent})`, opacity: 0.8 }} />
        <div className="w-10 h-10 border-t-2 border-b-2 rounded-full absolute" style={{ borderColor: accent, filter: `drop-shadow(0 0 5px ${accent})`, opacity: 0.6 }} />
        <div className="w-1 h-8 rounded-full absolute" style={{ backgroundColor: accent, boxShadow: `0 0 10px ${accent}, 0 0 20px ${accent}`, opacity: 0.9 }} />
      </div>

      {/* North Magnet (Left) */}
      <div className="absolute z-10 w-7 h-12 rounded-md border-2 flex items-center justify-center"
        style={{ borderColor: `${accent}80`, backgroundColor: `${accent}20`, boxShadow: `0 0 15px ${accent}40, inset 0 0 15px ${accent}30`, animation: "magnet-left 3s ease-in-out infinite" }}>
        <span className="text-[10px] font-black" style={{ color: "#fff", textShadow: `0 0 5px ${accent}, 0 0 10px ${accent}` }}>N</span>
      </div>

      {/* South Magnet (Right) */}
      <div className="absolute z-10 w-7 h-12 rounded-md border-2 flex items-center justify-center"
        style={{ borderColor: `${accent}80`, backgroundColor: `${accent}20`, boxShadow: `0 0 15px ${accent}40, inset 0 0 15px ${accent}30`, animation: "magnet-right 3s ease-in-out infinite" }}>
        <span className="text-[10px] font-black" style={{ color: "#fff", textShadow: `0 0 5px ${accent}, 0 0 10px ${accent}` }}>S</span>
      </div>
      
      {/* Formulas */}
      <div className="absolute top-2 left-1 text-[7px] font-mono font-bold animate-float" style={{ color: "#fff", textShadow: `0 0 5px ${accent}, 0 0 10px ${accent}` }}>B = μ₀I/2πr</div>
      <div className="absolute bottom-2 right-1 text-[7px] font-mono font-bold animate-float" style={{ color: "#fff", animationDelay: "1.2s", textShadow: `0 0 5px ${accent}, 0 0 10px ${accent}` }}>F = qvB sinθ</div>
    </div>
  );
}

/* ── ANIMATION: Circuit with Bulb ── */
function CircuitAnimation({ accent }: { accent: string }) {
  return (
    <div className="relative w-40 h-40 mx-auto">
      {/* Circuit path (rounded rectangle) */}
      <div className="absolute inset-3 rounded-2xl border-2" style={{ borderColor: `${accent}60`, boxShadow: `0 0 15px ${accent}30, inset 0 0 15px ${accent}30` }} />
      {/* Battery (left) */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 z-10">
        <div className="w-3 h-6 rounded-sm border" style={{ borderColor: accent, backgroundColor: `${accent}50`, boxShadow: `0 0 10px ${accent}80` }} />
        <span className="text-[6px] font-black" style={{ color: "#fff", textShadow: `0 0 5px ${accent}, 0 0 10px ${accent}` }}>+−</span>
      </div>
      {/* Bulb (right) */}
      <div className="absolute right-1 top-1/2 -translate-y-1/2 z-10">
        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accent}20`, border: `2px solid ${accent}`, boxShadow: `0 0 15px #fff, 0 0 30px ${accent}, inset 0 0 20px ${accent}`, animation: "pulse-glow-brand 2s ease-in-out infinite" }}>
          <Lightbulb className="w-3.5 h-3.5" style={{ color: "#fff", filter: `drop-shadow(0 0 5px #fff) drop-shadow(0 0 10px ${accent})` }} />
        </div>
      </div>
      {/* Electrons moving along top path */}
      {[0, 1, 2].map((i) => (
        <div key={`t-${i}`} className="absolute w-1.5 h-1.5 rounded-full z-20" style={{
          backgroundColor: "#fff", boxShadow: `0 0 8px #fff, 0 0 15px ${accent}, 0 0 25px ${accent}`,
          top: "12px", animation: `circuit-top 3s linear infinite`, animationDelay: `${i * 1}s`
        }} />
      ))}
      {/* Electrons moving along bottom path */}
      {[0, 1, 2].map((i) => (
        <div key={`b-${i}`} className="absolute w-1.5 h-1.5 rounded-full z-20" style={{
          backgroundColor: "#fff", boxShadow: `0 0 8px #fff, 0 0 15px ${accent}, 0 0 25px ${accent}`, opacity: 0.8,
          bottom: "12px", animation: `circuit-bottom 3s linear infinite`, animationDelay: `${i * 1}s`
        }} />
      ))}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[7px] font-mono font-bold animate-float" style={{ color: accent }}>V = IR</div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[7px] font-mono font-bold animate-float" style={{ color: accent, animationDelay: "1s" }}>P = IV</div>
    </div>
  );
}

/* ── ANIMATION: Open Book with Formulas ── */
function BookAnimation({ accent }: { accent: string }) {
  const formulas = ["E=mc²", "F=ma", "PV=nRT", "λ=h/p", "ΔG=ΔH−TΔS"];
  return (
    <div className="relative w-40 h-40 mx-auto flex items-end justify-center">
      {/* Book base */}
      <div className="relative w-28 mb-2 z-10">
        {/* Left page */}
        <div className="absolute bottom-0 left-0 w-14 h-16 rounded-tl-lg border-l-2 border-t-2 border-b-2 origin-bottom-right" style={{ borderColor: `${accent}40`, backgroundColor: `${accent}08` }}>
          <div className="p-1.5 space-y-1">
            <div className="h-0.5 rounded-full w-8" style={{ backgroundColor: `${accent}30` }} />
            <div className="h-0.5 rounded-full w-6" style={{ backgroundColor: `${accent}20` }} />
            <div className="h-0.5 rounded-full w-9" style={{ backgroundColor: `${accent}25` }} />
            <div className="h-0.5 rounded-full w-5" style={{ backgroundColor: `${accent}15` }} />
          </div>
        </div>
        {/* Right page */}
        <div className="absolute bottom-0 right-0 w-14 h-16 rounded-tr-lg border-r-2 border-t-2 border-b-2 origin-bottom-left" style={{ borderColor: `${accent}40`, backgroundColor: `${accent}08` }}>
          <div className="p-1.5 space-y-1">
            <div className="h-0.5 rounded-full w-7" style={{ backgroundColor: `${accent}25` }} />
            <div className="h-0.5 rounded-full w-9" style={{ backgroundColor: `${accent}30` }} />
            <div className="h-0.5 rounded-full w-5" style={{ backgroundColor: `${accent}15` }} />
            <div className="h-0.5 rounded-full w-8" style={{ backgroundColor: `${accent}20` }} />
          </div>
        </div>
        {/* Spine */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-16" style={{ backgroundColor: `${accent}50` }} />
      </div>

      {/* Floating formulas rising from book */}
      {formulas.map((f, i) => (
        <div key={i} className="absolute font-mono font-bold rounded-md px-1.5 py-0.5 border z-20"
          style={{
            fontSize: "8px",
            color: "#fff",
            backgroundColor: `${accent}30`,
            borderColor: `${accent}60`,
            boxShadow: `0 0 10px ${accent}, 0 0 20px ${accent}80`,
            textShadow: `0 0 5px #fff`,
            left: `${15 + (i % 3) * 28}%`,
            animation: `formula-rise ${3 + i * 0.4}s ease-in-out infinite`,
            animationDelay: `${i * 0.6}s`,
          }}>
          {f}
        </div>
      ))}

      {/* Glow */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-20 h-10 rounded-full blur-[20px] opacity-15" style={{ backgroundColor: accent }} />
    </div>
  );
}

/* ── PLAN CARD ── */
function PlanCard({ 
  bgColor, accentColor, planName, price, originalPrice, period = "", badge, 
  animation, included, excluded, ctaLink, showCountdown 
}: any) {
  return (
    <div className="relative flex flex-col rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-card-border bg-white h-full group">
      
      {/* ── DARK HEADER ── */}
      <div className="relative overflow-hidden" style={{ backgroundColor: bgColor }}>
        <div className="absolute inset-0 bg-grid-dark pointer-events-none" />

        {/* Plan name — accent pill strip, centered top */}
        <div className="relative z-10 flex justify-center pt-5 mb-3">
          <h3 className="px-5 py-1.5 rounded-full text-sm font-black text-white uppercase tracking-widest backdrop-blur-md"
            style={{ backgroundColor: `${accentColor}30`, border: `1px solid ${accentColor}50`, textShadow: `0 0 10px ${accentColor}60` }}>
            {planName}
          </h3>
        </div>

        {/* Price + Timer row */}
        <div className="relative z-10 px-5 mb-2">
          {price === "FREE" ? (
            /* Foundation layout: price left, timer right */
            <div className="flex items-start justify-between">
              <div>
                {originalPrice && (
                  <span className="text-2xl font-black text-white line-through block"
                    style={{ textDecorationColor: `${accentColor}80`, textDecorationThickness: "2px" }}>
                    {originalPrice}{period && <span className="text-xs">{period}</span>}
                  </span>
                )}
                <span className="text-3xl font-black text-white block mt-0.5 px-3 py-0.5 rounded-lg w-fit"
                  style={{ backgroundColor: `${accentColor}30`, textShadow: `0 0 20px ${accentColor}50` }}>
                  FREE
                </span>
              </div>
              {showCountdown && (
                <div className="text-right">
                  <CountdownTimer accent={accentColor} />
                </div>
              )}
            </div>
          ) : (
            /* Other plans: normal price layout */
            <div className="flex items-baseline gap-2 mt-0.5">
              {originalPrice && (
                <span className="text-2xl font-black text-white line-through"
                  style={{ textDecorationColor: `${accentColor}80`, textDecorationThickness: "2px" }}>
                  {originalPrice}{period && <span className="text-xs">{period}</span>}
                </span>
              )}
              <span className="text-2xl font-black text-white"
                style={{ textShadow: `0 0 20px ${accentColor}50` }}>
                {price}
              </span>
              {period && <span className="text-[10px] font-bold text-white/40">{period}</span>}
              {badge && (
                <span className="px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest text-white"
                  style={{ backgroundColor: `${accentColor}35`, border: `1px solid ${accentColor}50` }}>
                  {badge}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Unique Animation */}
        <div className="relative z-10 py-2">
          {animation === "atom" && <AtomAnimation accent={accentColor} />}
          {animation === "magnet" && <MagnetAnimation accent={accentColor} />}
          {animation === "circuit" && <CircuitAnimation accent={accentColor} />}
          {animation === "book" && <BookAnimation accent={accentColor} />}
        </div>

        {/* Wave to white */}
        <svg className="relative z-10 w-full -mb-px" viewBox="0 0 500 30" preserveAspectRatio="none" style={{ height: "30px" }}>
          <path d="M0,12 C125,35 375,0 500,12 L500,30 L0,30 Z" fill="white" />
        </svg>
      </div>

      {/* ── WHITE BODY ── */}
      <div className="flex-1 px-5 pt-1 pb-5 flex flex-col bg-white">
        <ul className="space-y-2 flex-1">
          {included.map((f: string, i: number) => (
            <li key={`i-${i}`} className="flex items-start gap-2 text-[12px]">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-heading font-medium leading-tight">{f}</span>
            </li>
          ))}
          {excluded.map((f: string, i: number) => (
            <li key={`e-${i}`} className="flex items-start gap-2 text-[12px] opacity-40">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="text-text-muted font-medium leading-tight line-through">{f}</span>
            </li>
          ))}
        </ul>
        <Link href={ctaLink} className="mt-5 block">
          <Button className="w-full font-bold py-5 text-xs rounded-xl shadow-md transition-all hover:opacity-90 text-white"
            style={{ background: `linear-gradient(135deg, ${accentColor}, ${bgColor})` }}>
            Explore Course <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
