"use client";

import { useEffect, useState, use } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles, Check, Play, Monitor, Download, Trophy, FileText, Star, Globe, Calendar, Award, PlayCircle,
  Atom, Lightbulb, Zap, Flame, Waves, Cpu, GraduationCap, Crown, Beaker, Microscope, ArrowRight, ChevronRight,
  Eye, Magnet, Orbit, FlaskConical, Thermometer, Wind, Gauge, Activity, Radiation, CircuitBoard,
  Battery, Unplug, Radio, Telescope, Rocket, Dna, Heart, Brain, Leaf, Bug, Flower2, Trees, Droplets,
  Shell, Egg, Bone, Ribbon, Sprout, Apple, Footprints, TestTube, FlaskRound, Gem, Pipette, Hexagon,
  Snowflake, SunDim, Moon, Mountain, Cloudy, BookOpen, Mail, CheckCircle, type LucideIcon
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading";

// Map string names to Lucide icons
const iconMap: Record<string, any> = {
  Atom, Lightbulb, Zap, Flame, Waves, Cpu, GraduationCap, Crown, Beaker, Microscope,
  FlaskConical, Thermometer, Wind, Gauge, Activity, Radiation, CircuitBoard,
  Battery, Radio, Telescope, Rocket, Globe, Orbit, Eye, Magnet,
  Dna, Heart, Brain, Leaf, Bug, Flower2, Trees, Droplets,
  Shell, Egg, Bone, Ribbon, Sprout, Apple, Footprints,
  TestTube, FlaskRound, Gem, Pipette, Hexagon, Snowflake,
  SunDim, Moon, Mountain, Cloudy, Monitor, Unplug,
  BookOpen, Mail, CheckCircle, PlayCircle, FileText
};

function getChapterIcon(title: string, fallbackIcon?: string): LucideIcon {
  if (fallbackIcon && iconMap[fallbackIcon]) return iconMap[fallbackIcon];
  const t = title.toLowerCase();
  if (t.includes("mechanic") || t.includes("motion") || t.includes("kinematic")) return Gauge;
  if (t.includes("force") || t.includes("newton") || t.includes("friction")) return Activity;
  if (t.includes("gravit")) return Globe;
  if (t.includes("optic") || t.includes("light") || t.includes("mirror") || t.includes("lens") || t.includes("refraction") || t.includes("reflection")) return Eye;
  if (t.includes("electric") || t.includes("current") || t.includes("circuit") || t.includes("ohm")) return Zap;
  if (t.includes("magnet") || t.includes("electromagnetic")) return Magnet;
  if (t.includes("wave") || t.includes("sound") || t.includes("oscillat")) return Waves;
  if (t.includes("therm") || t.includes("heat") || t.includes("temperature") || t.includes("calori")) return Thermometer;
  if (t.includes("nuclear") || t.includes("radioact") || t.includes("atom")) return Radiation;
  if (t.includes("energy") || t.includes("work") || t.includes("power")) return Flame;
  if (t.includes("pressure") || t.includes("fluid") || t.includes("buoyan")) return Wind;
  if (t.includes("semiconductor") || t.includes("diode") || t.includes("transistor")) return CircuitBoard;
  if (t.includes("battery") || t.includes("cell") || t.includes("emf")) return Battery;
  if (t.includes("organic") || t.includes("carbon") || t.includes("hydrocarbon")) return Hexagon;
  if (t.includes("acid") || t.includes("base") || t.includes("salt") || t.includes("ph")) return FlaskConical;
  if (t.includes("metal") || t.includes("alloy")) return Gem;
  if (t.includes("periodic") || t.includes("element")) return TestTube;
  if (t.includes("bond") || t.includes("ionic") || t.includes("covalent")) return Unplug;
  if (t.includes("reaction") || t.includes("equation") || t.includes("redox")) return FlaskRound;
  if (t.includes("solution") || t.includes("solut")) return Pipette;
  if (t.includes("polymer")) return Ribbon;
  if (t.includes("crystal") || t.includes("solid state")) return Snowflake;
  if (t.includes("dna") || t.includes("gene") || t.includes("hered") || t.includes("chromosom")) return Dna;
  if (t.includes("heart") || t.includes("circulat") || t.includes("blood")) return Heart;
  if (t.includes("brain") || t.includes("nerv") || t.includes("neuro")) return Brain;
  if (t.includes("plant") || t.includes("photosynth")) return Leaf;
  if (t.includes("cell") || t.includes("cytol")) return Microscope;
  if (t.includes("ecology") || t.includes("ecosystem") || t.includes("environment")) return Trees;
  if (t.includes("evolution") || t.includes("fossil")) return Shell;
  if (t.includes("nutrition") || t.includes("digest") || t.includes("food")) return Apple;
  if (t.includes("reproduct")) return Flower2;
  if (t.includes("respir") || t.includes("lung")) return Wind;
  return Atom;
}

const GRADIENTS: Record<string, { bg: string; light: string }[]> = {
  physics: [
    { bg: "from-blue-500 to-indigo-600", light: "from-blue-100 to-indigo-100" },
    { bg: "from-sky-500 to-blue-600", light: "from-sky-100 to-blue-100" },
    { bg: "from-indigo-500 to-violet-600", light: "from-indigo-100 to-violet-100" },
    { bg: "from-cyan-500 to-blue-600", light: "from-cyan-100 to-blue-100" },
  ],
  chemistry: [
    { bg: "from-emerald-500 to-teal-600", light: "from-emerald-100 to-teal-100" },
    { bg: "from-green-500 to-emerald-600", light: "from-green-100 to-emerald-100" },
    { bg: "from-teal-500 to-cyan-600", light: "from-teal-100 to-cyan-100" },
    { bg: "from-lime-500 to-green-600", light: "from-lime-100 to-green-100" },
  ],
  biology: [
    { bg: "from-rose-500 to-pink-600", light: "from-rose-100 to-pink-100" },
    { bg: "from-pink-500 to-fuchsia-600", light: "from-pink-100 to-fuchsia-100" },
    { bg: "from-red-500 to-rose-600", light: "from-red-100 to-rose-100" },
    { bg: "from-orange-500 to-rose-600", light: "from-orange-100 to-rose-100" },
  ],
  default: [
    { bg: "from-violet-500 to-purple-600", light: "from-violet-100 to-purple-100" },
    { bg: "from-purple-500 to-fuchsia-600", light: "from-purple-100 to-fuchsia-100" },
  ],
};
function getSubjectGradients(name: string) {
  const n = name.toLowerCase();
  if (n.includes("physics")) return GRADIENTS.physics;
  if (n.includes("chemistry")) return GRADIENTS.chemistry;
  if (n.includes("biology")) return GRADIENTS.biology;
  return GRADIENTS.default;
}

/* ── ANIMATION: Atom Structure ── */
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
      <div className="absolute top-2 left-1 text-[7px] font-mono font-bold animate-float" style={{ color: "#fff", textShadow: `0 0 5px ${accent}, 0 0 10px ${accent}` }}>B = μ₀I/2πr</div>
      <div className="absolute bottom-2 right-1 text-[7px] font-mono font-bold animate-float" style={{ color: "#fff", animationDelay: "1.2s", textShadow: `0 0 5px ${accent}, 0 0 10px ${accent}` }}>F = qvB sinθ</div>
    </div>
  );
}

/* ── ANIMATION: Circuit with Bulb ── */
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
      {[0, 1, 2].map((i) => (
        <div key={`t-${i}`} className="absolute w-1.5 h-1.5 rounded-full z-20" style={{
          backgroundColor: "#fff", boxShadow: `0 0 8px #fff, 0 0 15px ${accent}, 0 0 25px ${accent}`,
          top: "12px", animation: `circuit-top 3s linear infinite`, animationDelay: `${i * 1}s`
        }} />
      ))}
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
      <div className="relative w-28 mb-2 z-10">
        <div className="absolute bottom-0 left-0 w-14 h-16 rounded-tl-lg border-l-2 border-t-2 border-b-2 origin-bottom-right" style={{ borderColor: `${accent}40`, backgroundColor: `${accent}08` }}>
          <div className="p-1.5 space-y-1">
            <div className="h-0.5 rounded-full w-8" style={{ backgroundColor: `${accent}30` }} />
            <div className="h-0.5 rounded-full w-6" style={{ backgroundColor: `${accent}20` }} />
            <div className="h-0.5 rounded-full w-9" style={{ backgroundColor: `${accent}25` }} />
          </div>
        </div>
        <div className="absolute bottom-0 right-0 w-14 h-16 rounded-tr-lg border-r-2 border-t-2 border-b-2 origin-bottom-left" style={{ borderColor: `${accent}40`, backgroundColor: `${accent}08` }}>
          <div className="p-1.5 space-y-1">
            <div className="h-0.5 rounded-full w-7" style={{ backgroundColor: `${accent}25` }} />
            <div className="h-0.5 rounded-full w-9" style={{ backgroundColor: `${accent}30` }} />
            <div className="h-0.5 rounded-full w-5" style={{ backgroundColor: `${accent}15` }} />
          </div>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-16" style={{ backgroundColor: `${accent}50` }} />
      </div>
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
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-20 h-10 rounded-full blur-[20px] opacity-15" style={{ backgroundColor: accent }} />
    </div>
  );
}

const getCourseTheme = (courseId: string) => {
  const isFoundation = courseId === "foundation-pass";
  const isAcademic = courseId === "academic-plus";
  const isElite = courseId === "elite-learning";
  
  return {
    subtitle: "Understand core concepts, simulate real-world phenomena with Virtual Labs, and master problem-solving - Your Next Step in Visual Learning.",
    badge: "Bestseller",
    rating: "4.8",
    ratingsCount: "2,451",
    students: "15,200",
    author: "Visual Learning Faculty",
    lastUpdated: "11/2025",
    language: "English",
    price: isFoundation ? "FREE" : isAcademic ? "₹8,999" : "₹15,999",
    originalPrice: isFoundation ? "₹3,999" : isAcademic ? "₹12,000" : "₹20,000",
    period: "/year",
    bgColor: isFoundation ? "#1C4D8D" : isAcademic ? "#162855" : isElite ? "#2d1654" : "#202940",
    accentColor: isFoundation ? "#60A5FA" : isAcademic ? "#38BDF8" : isElite ? "#D8B4FE" : "#818CF8",
    animationType: isFoundation ? "atom" : isAcademic ? "magnet" : isElite ? "circuit" : "book",
    themeIcon: isFoundation ? "Zap" : isAcademic ? "GraduationCap" : isElite ? "Crown" : "Atom",
    learningOutcomes: isFoundation ? [
      { text: "Grasp core concepts of Motion, Force & Energy", icon: "Gauge" },
      { text: "Understand basic Chemical Reactions & Bonding", icon: "FlaskConical" },
      { text: "Explore Cell Biology & Life Processes", icon: "Microscope" },
      { text: "Watch 3D animated concept videos", icon: "PlayCircle" },
      { text: "Track your progress across chapters", icon: "Activity" },
      { text: "Learn at your own pace on any device", icon: "Monitor" },
    ] : isAcademic ? [
      { text: "Master complete Class 9-10 Physics, Chemistry & Biology", icon: "GraduationCap" },
      { text: "Selected Class 11-12 Physics & Chemistry chapters", icon: "Atom" },
      { text: "Download chapter notes & formula sheets (PDF)", icon: "FileText" },
      { text: "Solve MCQ quizzes with detailed solutions", icon: "CheckCircle" },
      { text: "Track performance with analytics dashboard", icon: "Activity" },
      { text: "Get email support within 24 hours", icon: "Mail" },
    ] : [
      { text: "Complete Physics, Chemistry & Biology for Class 9-12", icon: "Crown" },
      { text: "Access 64+ Virtual Labs with 3D simulations", icon: "Beaker" },
      { text: "Interactive 3D Visual Learning tools", icon: "Eye" },
      { text: "Board exam practice with past papers", icon: "FileText" },
      { text: "Notes, formula sheets & revision material", icon: "BookOpen" },
      { text: "Priority WhatsApp support from faculty", icon: "Zap" },
      { text: "Deep concept exploration tools", icon: "Brain" },
      { text: "Performance analytics & progress tracking", icon: "Activity" },
    ],
  };
};

export default function CourseDetailsPage({ params }: { params: { courseId: string } }) {
  const { courseId } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const billingCycle = searchParams.get("billing") || "yearly";
  const { user, isAuthenticated } = useAuth();
  
  const [course, setCourse] = useState<any>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  const theme = getCourseTheme(courseId);
  const ThemeIcon = iconMap[theme.themeIcon] || Atom;

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [courseRes, subRes] = await Promise.all([
          api.get(`/courses/course-content/${courseId}`),
          isAuthenticated ? api.get("/subscription/my-subscription") : Promise.resolve({ data: { data: null } })
        ]);

        setCourse(courseRes.data.data);
        
        if (isAuthenticated) {
          const hasCourseAccess = courseRes.data.data.userHasAccess;
          setIsSubscribed(hasCourseAccess || user?.role === "ADMIN");
        }
      } catch (err) {
        console.error("Failed to load course details", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [courseId, isAuthenticated, user]);

  if (loading) return <PageLoader />;

  // Plan name fallback when course record doesn't exist in DB yet
  const planDisplayName =
    courseId === "foundation-pass" ? "Foundation Pass" :
    courseId === "academic-plus"   ? "Academic Plus"   :
    courseId === "elite-learning"  ? "Elite Learning"  :
    courseId;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      
      {/* ── HERO SECTION (Dark Theme) ── */}
      <div className="relative text-white pt-16 pb-24 lg:pb-32 overflow-hidden" style={{ background: `linear-gradient(135deg, ${theme.bgColor} 0%, ${theme.bgColor}dd 50%, ${theme.bgColor} 100%)` }}>
        {/* Grid texture overlay */}
        <div className="absolute inset-0 bg-grid-dark opacity-20 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px]" style={{ backgroundColor: `${theme.accentColor}15` }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[100px]" style={{ backgroundColor: `${theme.accentColor}15` }} />
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute w-1 h-1 rounded-full"
              style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%`, animation: `particle-float ${8 + i * 2}s linear infinite`, animationDelay: `${i * 1.5}s`, backgroundColor: `${theme.accentColor}66` }} />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Content (Top Left) */}
          <div className="lg:col-span-1 pt-4 md:pt-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 shadow-xl shadow-black/5">
              <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/90 shadow-sm">Premium Course</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black mb-6 leading-[1.1] tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/70 drop-shadow-sm" style={{ textShadow: `0 0 40px ${theme.accentColor}40` }}>
                {course?.name ?? planDisplayName}
              </span>
            </h1>
            <p className="text-white/80 text-base font-medium leading-relaxed max-w-xl opacity-90">
              {theme.subtitle}
            </p>
          </div>

          {/* Dynamic Animation visual (Middle) */}
          <div className="hidden lg:flex justify-center items-center animate-fade-in delay-300 relative pt-4 scale-150">
            {theme.animationType === "atom" && <AtomAnimation accent={theme.accentColor} />}
            {theme.animationType === "magnet" && <MagnetAnimation accent={theme.accentColor} />}
            {theme.animationType === "circuit" && <CircuitAnimation accent={theme.accentColor} />}
            {theme.animationType === "book" && <BookAnimation accent={theme.accentColor} />}
          </div>

          {/* Right Content (Go To Course - Subscribed Only) */}
          <div className="lg:col-span-1 flex justify-end pt-12">
            {isSubscribed && (
              <Link href={`/courses/view-course/${courseId}`}>
                <Button className="group bg-white text-gray-900 hover:bg-gray-100 font-black px-8 py-7 rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 text-lg">
                  Go To Course
                  <ArrowRight className="ml-2 w-6 h-6 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            )}
          </div>

        </div>

        {/* Curve Separator */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0] transform translate-y-[1px]">
          <svg className="relative block w-full h-[40px] md:h-[80px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C52.71,76.5,158.15,74.75,321.39,56.44Z" fill="#f9fafb" />
          </svg>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="max-w-7xl mx-auto px-4 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Main Info) */}
          <div className={`${isSubscribed ? "lg:col-span-3" : "lg:col-span-2"} pt-8 space-y-12 order-2 lg:order-1`}>
            
            {/* What you'll learn */}
            <div className="rounded-2xl overflow-hidden border" style={{ borderColor: `${theme.accentColor}20` }}>
              <div className="px-6 md:px-8 py-5 flex items-center gap-3" style={{ background: `linear-gradient(135deg, ${theme.bgColor}, ${theme.bgColor}dd)` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${theme.accentColor}25` }}>
                  <Sparkles className="w-5 h-5" style={{ color: theme.accentColor }} />
                </div>
                <h2 className="text-xl font-black text-white tracking-tight">What you&apos;ll learn</h2>
              </div>
              <div className="bg-white p-5 md:p-7">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {theme.learningOutcomes.map((outcome: { text: string; icon: string }, idx: number) => {
                    const OutcomeIcon = iconMap[outcome.icon] || Check;
                    return (
                      <div key={idx} className="flex items-center gap-3.5 rounded-xl p-3 transition-colors hover:bg-gray-50/80 group">
                        <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${theme.accentColor}12` }}>
                          <OutcomeIcon className="w-5 h-5" style={{ color: theme.accentColor }} />
                        </div>
                        <span className="text-[13px] font-semibold text-gray-700 leading-snug">{outcome.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Course Content Sections */}
            {course && course.subjects?.length > 0 ? (
              <div className="space-y-12">
                <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Course Content</h2>
                {course.subjects.map((subject: any, sIdx: number) => {
                  const SubjectIcon = iconMap[subject.icon] || Atom;
                  const gradients = getSubjectGradients(subject.name);
                  return (
                    <div key={sIdx} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${subject.color} flex items-center justify-center shadow-lg`}>
                          <SubjectIcon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">{subject.name}</h3>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {subject.chapters.map((chapter: any, cIdx: number) => {
                          const Icon = getChapterIcon(chapter.title, chapter.icon);
                          const grad = gradients[cIdx % gradients.length];
                          return (
                            <Link
                              key={chapter.id}
                              href={`/courses/${chapter.classId}/${chapter.subjectId}/${chapter.id}?fromDetails=${courseId}`}
                              className={`group bg-gradient-to-br ${grad.light} rounded-2xl border border-white/80 p-4 hover:shadow-lg hover:shadow-black/5 transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center`}
                            >
                              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${grad.bg} flex items-center justify-center shadow-md mb-2.5 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <h4 className="text-[13px] font-bold text-gray-800 leading-snug line-clamp-2 group-hover:text-gray-900 transition-colors">{chapter.title}</h4>
                              {chapter.desc && <p className="text-[10px] text-gray-400 line-clamp-1 mt-1">{chapter.desc}</p>}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl border shadow-sm p-8 text-center">
                <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-700 mb-1">Detailed chapter listing coming soon</h3>
                <p className="text-sm text-gray-500">Subscribe now to get full access to all chapters, videos, and notes included in this plan.</p>
              </div>
            )}

          </div>

          {/* Right Column (Floating Card) */}
          {!isSubscribed && (
            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className="lg:sticky lg:top-24 bg-white/80 backdrop-blur-2xl rounded-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden lg:-mt-[18rem] z-30">
                
                {/* Video Preview Section */}
                <div className="relative aspect-video bg-gray-900 overflow-hidden group">
                  {course?.vimeoVideoId ? (
                    (() => {
                      const [videoId, hash] = course.vimeoVideoId.split('/');
                      const vimeoSrc = `https://player.vimeo.com/video/${videoId}${hash ? `?h=${hash}` : ''}${hash ? '&' : '?'}badge=0&autopause=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0&dnt=1`;
                      return (
                        <iframe
                          src={vimeoSrc}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                          allowFullScreen
                        />
                      );
                    })()
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                        <Play className="w-8 h-8 text-white fill-current" />
                      </div>
                      <p className="text-white font-bold text-sm">Course Preview</p>
                      <p className="text-gray-400 text-[10px] mt-1">Watch our 3D animated learning in action</p>
                    </div>
                  )}
                </div>
  
                {/* Pricing & CTA */}
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-2xl font-black text-gray-900 flex items-end gap-2">
                      {course?.planConfig?.monthlyPrice === 0 ? "FREE" : (course?.planConfig ? `₹${(billingCycle === "monthly" ? course.planConfig.monthlyPrice : course.planConfig.yearlyPrice).toLocaleString("en-IN")}` : theme.price)}
                      {((course?.planConfig?.price === 0) || (!course)) && theme.originalPrice && (
                        <span className="text-sm text-gray-500 line-through font-medium mb-1">
                          {theme.originalPrice}
                        </span>
                      )}
                      <span className="text-sm font-medium text-gray-600 mb-1">
                        {billingCycle === "monthly" ? "/mo" : "/year"}
                      </span>
                    </h3>
                  </div>
  
                  <Link href={`/subscription?plan=${courseId}&billing=${billingCycle}`} className="block w-full py-4 bg-[#7e22ce] hover:bg-[#6b21a8] text-white font-bold text-center rounded-lg transition-colors shadow-lg shadow-purple-500/30 mb-4">
                    Start subscription
                  </Link>
  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Award className="w-4 h-4 shrink-0" />
                      <span>Access to premium learning content</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Monitor className="w-4 h-4 shrink-0" />
                      <span>Cancel anytime guarantee</span>
                    </div>
                  </div>
  
                  <div className="text-center">
                    <Link href="/subscription" className="text-sm font-bold text-blue-600 hover:text-blue-800 underline">
                      Learn more about plans
                    </Link>
                  </div>
  
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>

    </div>
  );
}
