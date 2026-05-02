"use client";

import { useEffect, useState, use } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Check, Play, Monitor, Download, Trophy, FileText, Star, Globe, Calendar, Award, PlayCircle, Atom, Lightbulb, Zap, Flame, Waves, Cpu, GraduationCap, Crown, Beaker, Microscope, ArrowRight } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading";

// Map string names to Lucide icons
const iconMap: Record<string, any> = {
  Atom, Lightbulb, Zap, Flame, Waves, Cpu, GraduationCap, Crown, Beaker, Microscope
};

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
    learningOutcomes: [
      "Understand the core concepts of Mechanics and Kinematics",
      "Simulate and visualize complex physics problems",
      "Master the mathematical tools required for competitive exams",
      "Apply theories to real-world physical phenomena",
      "Solve advanced numerical problems with ease",
      "Learn how to use virtual labs for practical experiments"
    ],
  };
};

export default function CourseDetailsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const router = useRouter();
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
          const sub = subRes.data.data;
          const active = sub?.status === "ACTIVE" && new Date(sub.expiryDate) > new Date();
          setIsSubscribed(active || user?.role === "ADMIN");
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
  if (!course) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Course not found</h2>
        <Link href="/courses" className="text-primary hover:underline">Back to all courses</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      
      {/* ── HERO SECTION (Dark Theme) ── */}
      <div className="relative text-white pt-12 pb-16 lg:pb-20 overflow-hidden" style={{ background: `linear-gradient(135deg, ${theme.bgColor} 0%, ${theme.bgColor}dd 50%, ${theme.bgColor} 100%)` }}>
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
          <div className="lg:col-span-1 pt-4">
            <h1 className="text-4xl md:text-5xl lg:text-5xl font-extrabold mb-2 leading-tight tracking-tight">
              {course.name.split(':').map((part: string, index: number) => (
                <span key={index} className={index === 0 ? "text-white block" : "block"} style={{ color: index === 0 ? undefined : theme.accentColor }}>
                  {index === 0 ? part + (course.name.includes(':') ? ':' : '') : part}
                </span>
              ))}
            </h1>
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
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="max-w-7xl mx-auto px-4 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Main Info) */}
          <div className={`${isSubscribed ? "lg:col-span-3" : "lg:col-span-2"} pt-8 space-y-12 order-2 lg:order-1`}>
            
            {/* What you'll learn */}
            <div className="bg-white rounded-xl border shadow-sm p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What you&apos;ll learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {theme.learningOutcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm leading-relaxed">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Content Sections */}
            <div className="space-y-12">
              <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Course Content</h2>
              
              {course.subjects.map((subject: any, sIdx: number) => {
                const SubjectIcon = iconMap[subject.icon] || Atom;
                return (
                  <div key={sIdx} className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${subject.color} flex items-center justify-center shadow-lg`}>
                        <SubjectIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">{subject.name}</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {subject.chapters.map((chapter: any) => {
                        const Icon = iconMap[chapter.icon] || Atom;
                        return (
                          <div key={chapter.id} className="group cursor-pointer bg-white rounded-2xl border p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center">
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${chapter.gradient} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                              <Icon className="w-7 h-7 text-white" />
                            </div>
                            <h4 className="font-bold text-gray-900 mb-1">{chapter.title}</h4>
                            <p className="text-xs text-gray-500">{chapter.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Column (Floating Card) */}
          {!isSubscribed && (
            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className="lg:sticky lg:top-24 bg-white/80 backdrop-blur-2xl rounded-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden lg:-mt-[18rem] z-30">
                
                {/* Video Preview Placeholder */}
                <div className="relative aspect-video bg-gray-900 flex items-center justify-center group cursor-pointer overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 to-purple-900/40 mix-blend-overlay"></div>
                  {/* Simulated course thumbnail graphics */}
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>
                  <ThemeIcon className="absolute -left-10 top-1/2 w-40 h-40 text-blue-500/10 animate-spin-slow" />
                  <div className="z-10 flex flex-col items-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-10 h-10 text-gray-900 ml-1" />
                    </div>
                    <span className="text-white font-bold mt-4 tracking-wide shadow-black text-shadow-sm">Preview this course</span>
                  </div>
                </div>
  
                {/* Pricing & CTA */}
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-2xl font-black text-gray-900 flex items-end gap-2">
                      {theme.price}
                      {theme.originalPrice && (
                        <span className="text-sm text-gray-500 line-through font-medium mb-1">
                          {theme.originalPrice}
                        </span>
                      )}
                      <span className="text-sm font-medium text-gray-600 mb-1">{theme.period}</span>
                    </h3>
                  </div>
  
                  <Link href="/subscription" className="block w-full py-4 bg-[#7e22ce] hover:bg-[#6b21a8] text-white font-bold text-center rounded-lg transition-colors shadow-lg shadow-purple-500/30 mb-4">
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
