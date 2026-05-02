"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { 
  Sparkles, Zap, GraduationCap, 
  Crown, CheckCircle2, XCircle, ArrowRight, 
  Orbit, Flame, Lightbulb, Microscope, Beaker, Dna, Waves, Atom,
  Layout, AlertCircle
} from "lucide-react";

const planMapping: Record<string, string> = {
  "Foundation Pass": "foundation-pass",
  "Academic Plus": "academic-plus",
  "Elite Learning": "elite-learning",
  "FlexiLearn": "flexilearn"
};

export default function CoursesPage() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    async function loadSubscription() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get("/subscription/my-subscription");
        const sub = data.data;
        if (sub?.status === "ACTIVE" && new Date(sub.expiryDate) > new Date()) {
          setSubscription(sub);
        }
      } catch (err) {
        console.error("Failed to load subscription", err);
      } finally {
        setLoading(false);
      }
    }
    loadSubscription();
  }, [isAuthenticated]);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* ── USER DASHBOARD STATUS ── */}
      {isAuthenticated && (
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass mb-6">
            <Layout className="w-4 h-4 text-primary" />
            <span className="text-[11px] text-text-muted font-black uppercase tracking-widest">My Dashboard</span>
          </div>
          
          {subscription ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <div className="md:col-span-1">
                 <h2 className="text-2xl font-black text-heading mb-6 tracking-tight">Active <span className="gradient-text">Curriculum</span></h2>
                 <PlanCard 
                   bgColor={subscription.plan === "Foundation Pass" ? "#1C4D8D" : subscription.plan === "Academic Plus" ? "#162855" : subscription.plan === "Elite Learning" ? "#2d1654" : "#202940"} 
                   accentColor={subscription.plan === "Foundation Pass" ? "#60A5FA" : subscription.plan === "Academic Plus" ? "#38BDF8" : subscription.plan === "Elite Learning" ? "#D8B4FE" : "#818CF8"} 
                   planName={subscription.plan} 
                   price="ACTIVE" 
                   period={`Exp: ${new Date(subscription.expiryDate).toLocaleDateString()}`}
                   animation={subscription.plan === "Foundation Pass" ? "atom" : subscription.plan === "Academic Plus" ? "magnet" : subscription.plan === "Elite Learning" ? "circuit" : "book"}
                   included={getPlanFeatures(subscription.plan)}
                   excluded={[]} 
                   ctaLink={`/courses/view-course/${planMapping[subscription.plan] || 'foundation-pass'}`}
                   ctaText="Go To Course"
                   isSubscribed={true}
                 />
               </div>
               <div className="hidden lg:flex md:col-span-2 items-center justify-center p-8 bg-blue-50/50 rounded-[2.5rem] border border-dashed border-blue-200">
                  <div className="text-center space-y-4 max-w-sm">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl mx-auto">
                      <Zap className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900">Welcome Back!</h3>
                    <p className="text-sm text-gray-500 font-medium">Continue your visual learning journey where you left off. Your premium access is active and ready.</p>
                  </div>
               </div>
            </div>
          ) : (
            <CardPlaceholder />
          )}
        </div>
      )}

      {!subscription && <ConceptCarousel />}

      {/* ── ALL PRICING PLANS ── */}
      <div className="mt-20 mb-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass mb-4">
            <Sparkles className="w-4 h-4 text-[#05BFDB]" />
            <span className="text-[11px] text-text-muted font-black uppercase tracking-widest">Available Plans</span>
          </div>
          <h2 className="text-3xl font-black text-heading mb-3 tracking-tight">Level Up Your <span className="gradient-text">Learning</span></h2>
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

function CardPlaceholder() {
  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-dashed border-gray-300 p-10 text-center space-y-6">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
        <AlertCircle className="w-8 h-8 text-gray-400" />
      </div>
      <div>
        <h3 className="text-xl font-black text-gray-900">No course active</h3>
        <p className="text-sm text-gray-500 font-medium mt-1">Subscribe to a plan below to start your visual learning adventure!</p>
      </div>
      <Button variant="outline" className="rounded-xl font-bold" onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}>
        View All Plans
      </Button>
    </div>
  );
}

function getPlanFeatures(plan: string) {
  if (plan === "Foundation Pass") return ["Selected chapters (9–12 PCB)","Animated concept videos","Beginner-friendly path","Progress tracking"];
  if (plan === "Academic Plus") return ["Full Class 9–10 (PCB)","Selected 11–12 P & C","Chapter notes (PDF)","MCQ quizzes + solutions"];
  if (plan === "Elite Learning") return ["Full 9–12 P + C + B","Virtual Labs (64+) 🧪","3D Visual Learning 🔬","Board exam practice"];
  return ["Choose class (9–12)","Select up to 3 subjects","Flexible pricing"];
}

/* ── COUNTDOWN TIMER ── */
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
    <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-dark py-16 mb-12">
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

/* ── ANIMATIONS ── */
function AtomAnimation({ accent }: { accent: string }) {
  return (
    <div className="relative w-40 h-40 mx-auto">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full blur-[30px] opacity-20" style={{ backgroundColor: accent }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center z-10" style={{ background: accent, boxShadow: `0 0 10px ${accent}, 0 0 30px ${accent}80` }}>
        <span className="text-[8px] font-black text-white">N</span>
      </div>
      <div className="absolute inset-0 rounded-full animate-spin border" style={{ animationDuration: "4s", borderColor: `${accent}40`, boxShadow: `inset 0 0 20px ${accent}20` }}>
        <div className="absolute -top-1 left-1/2 w-3 h-3 rounded-full" style={{ backgroundColor: "#fff", boxShadow: `0 0 10px #fff, 0 0 20px ${accent}, 0 0 40px ${accent}` }} />
      </div>
      <div className="absolute inset-4 rounded-full animate-spin border" style={{ animationDuration: "3s", animationDirection: "reverse", borderColor: `${accent}30` }}>
        <div className="absolute top-1/2 -right-1 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#fff", boxShadow: `0 0 8px #fff, 0 0 15px ${accent}, 0 0 30px ${accent}` }} />
      </div>
      <div className="absolute inset-8 rounded-full animate-spin border" style={{ animationDuration: "6s", borderColor: `${accent}20` }}>
        <div className="absolute bottom-0 left-1/4 w-2 h-2 rounded-full" style={{ backgroundColor: "#fff", boxShadow: `0 0 5px #fff, 0 0 10px ${accent}, 0 0 20px ${accent}` }} />
      </div>
    </div>
  );
}

function MagnetAnimation({ accent }: { accent: string }) {
  return (
    <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
      <div className="absolute w-20 h-20 rounded-full blur-[25px] opacity-20" style={{ backgroundColor: accent }} />
      <div className="absolute z-0 flex items-center justify-center" style={{ animation: "magnetic-lines 3s ease-in-out infinite" }}>
        <div className="w-16 h-16 border-t-2 border-b-2 rounded-full absolute" style={{ borderColor: accent, filter: `drop-shadow(0 0 8px ${accent}) drop-shadow(0 0 15px ${accent})`, opacity: 0.8 }} />
        <div className="w-10 h-10 border-t-2 border-b-2 rounded-full absolute" style={{ borderColor: accent, filter: `drop-shadow(0 0 5px ${accent})`, opacity: 0.6 }} />
        <div className="w-1 h-8 rounded-full absolute" style={{ backgroundColor: accent, boxShadow: `0 0 10px ${accent}, 0 0 20px ${accent}`, opacity: 0.9 }} />
      </div>
      <div className="absolute z-10 w-7 h-12 rounded-md border-2 flex items-center justify-center"
        style={{ borderColor: `${accent}80`, backgroundColor: `${accent}20`, boxShadow: `0 0 15px ${accent}40, inset 0 0 15px ${accent}30`, animation: "magnet-left 3s ease-in-out infinite" }}>
        <span className="text-[10px] font-black" style={{ color: "#fff", textShadow: `0 0 5px ${accent}, 0 0 10px ${accent}` }}>N</span>
      </div>
      <div className="absolute z-10 w-7 h-12 rounded-md border-2 flex items-center justify-center"
        style={{ borderColor: `${accent}80`, backgroundColor: `${accent}20`, boxShadow: `0 0 15px ${accent}40, inset 0 0 15px ${accent}30`, animation: "magnet-right 3s ease-in-out infinite" }}>
        <span className="text-[10px] font-black" style={{ color: "#fff", textShadow: `0 0 5px ${accent}, 0 0 10px ${accent}` }}>S</span>
      </div>
    </div>
  );
}

function CircuitAnimation({ accent }: { accent: string }) {
  return (
    <div className="relative w-40 h-40 mx-auto">
      <div className="absolute inset-3 rounded-2xl border-2" style={{ borderColor: `${accent}60`, boxShadow: `0 0 15px ${accent}30, inset 0 0 15px ${accent}30` }} />
      <div className="absolute left-1 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 z-10">
        <div className="w-3 h-6 rounded-sm border" style={{ borderColor: accent, backgroundColor: `${accent}50`, boxShadow: `0 0 10px ${accent}80` }} />
        <span className="text-[6px] font-black" style={{ color: "#fff", textShadow: `0 0 5px ${accent}, 0 0 10px ${accent}` }}>+−</span>
      </div>
      <div className="absolute right-1 top-1/2 -translate-y-1/2 z-10">
        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accent}20`, border: `2px solid ${accent}`, boxShadow: `0 0 15px #fff, 0 0 30px ${accent}, inset 0 0 20px ${accent}`, animation: "pulse-glow-brand 2s ease-in-out infinite" }}>
          <Lightbulb className="w-3.5 h-3.5" style={{ color: "#fff", filter: `drop-shadow(0 0 5px #fff) drop-shadow(0 0 10px ${accent})` }} />
        </div>
      </div>
    </div>
  );
}

function BookAnimation({ accent }: { accent: string }) {
  const formulas = ["E=mc²", "F=ma", "PV=nRT"];
  return (
    <div className="relative w-40 h-40 mx-auto flex items-end justify-center">
      <div className="relative w-28 mb-2 z-10">
        <div className="absolute bottom-0 left-0 w-14 h-16 rounded-tl-lg border-l-2 border-t-2 border-b-2 origin-bottom-right" style={{ borderColor: `${accent}40`, backgroundColor: `${accent}08` }}></div>
        <div className="absolute bottom-0 right-0 w-14 h-16 rounded-tr-lg border-r-2 border-t-2 border-b-2 origin-bottom-left" style={{ borderColor: `${accent}40`, backgroundColor: `${accent}08` }}></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-16" style={{ backgroundColor: `${accent}50` }} />
      </div>
      {formulas.map((f, i) => (
        <div key={i} className="absolute font-mono font-bold rounded-md px-1.5 py-0.5 border z-20"
          style={{ fontSize: "8px", color: "#fff", backgroundColor: `${accent}30`, borderColor: `${accent}60`, left: `${20 + i * 25}%`, animation: `formula-rise ${3 + i * 0.4}s ease-in-out infinite` }}>
          {f}
        </div>
      ))}
    </div>
  );
}

/* ── PLAN CARD ── */
function PlanCard({ 
  bgColor, accentColor, planName, price, originalPrice, period = "", badge, 
  animation, included, excluded, ctaLink, ctaText = "Explore Course", showCountdown, isSubscribed = false 
}: any) {
  return (
    <div className={`relative flex flex-col rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-card-border bg-white h-full group ${isSubscribed ? "ring-4 ring-blue-500/20" : ""}`}>
      
      {/* ── DARK HEADER ── */}
      <div className="relative overflow-hidden" style={{ backgroundColor: bgColor }}>
        <div className="absolute inset-0 bg-grid-dark pointer-events-none" />
        <div className="relative z-10 flex justify-center pt-5 mb-3">
          <h3 className="px-5 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest backdrop-blur-md"
            style={{ backgroundColor: `${accentColor}30`, border: `1px solid ${accentColor}50`, textShadow: `0 0 10px ${accentColor}60` }}>
            {planName}
          </h3>
        </div>
        <div className="relative z-10 px-6 mb-2">
           <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white" style={{ textShadow: `0 0 20px ${accentColor}50` }}>{price}</span>
                <span className="text-[10px] font-bold text-white/40">{period}</span>
              </div>
              {badge && (
                <span className="px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest text-white" style={{ backgroundColor: `${accentColor}35`, border: `1px solid ${accentColor}50` }}>{badge}</span>
              )}
              {showCountdown && <CountdownTimer accent={accentColor} />}
           </div>
        </div>
        <div className="relative z-10 py-2">
          {animation === "atom" && <AtomAnimation accent={accentColor} />}
          {animation === "magnet" && <MagnetAnimation accent={accentColor} />}
          {animation === "circuit" && <CircuitAnimation accent={accentColor} />}
          {animation === "book" && <BookAnimation accent={accentColor} />}
        </div>
        <svg className="relative z-10 w-full -mb-px" viewBox="0 0 500 30" preserveAspectRatio="none" style={{ height: "30px" }}>
          <path d="M0,12 C125,35 375,0 500,12 L500,30 L0,30 Z" fill="white" />
        </svg>
      </div>

      {/* ── WHITE BODY ── */}
      <div className="flex-1 px-6 pt-2 pb-6 flex flex-col bg-white">
        <ul className="space-y-3 flex-1 mb-6">
          {included.map((f: string, i: number) => (
            <li key={`i-${i}`} className="flex items-start gap-2 text-[12px]">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-heading font-bold leading-tight">{f}</span>
            </li>
          ))}
        </ul>
        <Link href={ctaLink} className="block">
          <Button className="w-full font-black py-6 text-sm rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] text-white"
            style={{ background: `linear-gradient(135deg, ${accentColor}, ${bgColor})` }}>
            {ctaText} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
