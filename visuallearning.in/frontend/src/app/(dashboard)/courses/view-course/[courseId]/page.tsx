"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Atom, Beaker, Microscope, Lightbulb, Zap, Flame,
  Waves, Cpu, PlayCircle, ChevronRight, Eye, Magnet,
  Monitor, FileText, Layout, BookOpen, Orbit, FlaskConical,
  Thermometer, Wind, Gauge, Activity, Radiation, CircuitBoard,
  Battery, Unplug, Radio, Telescope, Rocket, Globe,
  Dna, Heart, Brain, Leaf, Bug, Flower2, Trees, Droplets,
  Shell, Egg, Bone, Ribbon, Sprout, Apple, Footprints,
  TestTube, FlaskRound, Gem, Pipette, Hexagon, Snowflake,
  SunDim, Moon, Mountain, Cloudy, type LucideIcon
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";

// Extended icon map for DB-stored icon names
const iconMap: Record<string, LucideIcon> = {
  Atom, Lightbulb, Zap, Flame, Waves, Cpu, Beaker, Microscope, BookOpen,
  FlaskConical, Thermometer, Wind, Gauge, Activity, Radiation, CircuitBoard,
  Battery, Radio, Telescope, Rocket, Globe, Orbit, Eye, Magnet,
  Dna, Heart, Brain, Leaf, Bug, Flower2, Trees, Droplets,
  Shell, Egg, Bone, Ribbon, Sprout, Apple, Footprints,
  TestTube, FlaskRound, Gem, Pipette, Hexagon, Snowflake,
  SunDim, Moon, Mountain, Cloudy, Monitor, Unplug
};

// Smart icon picker based on chapter title keywords
function getChapterIcon(title: string, fallbackIcon?: string): LucideIcon {
  if (fallbackIcon && iconMap[fallbackIcon]) return iconMap[fallbackIcon];
  const t = title.toLowerCase();

  // Physics topics
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
  if (t.includes("communi") || t.includes("signal")) return Radio;
  if (t.includes("space") || t.includes("satellite") || t.includes("universe")) return Telescope;
  if (t.includes("rocket") || t.includes("projecti")) return Rocket;
  if (t.includes("ray") || t.includes("spectrum")) return SunDim;
  if (t.includes("planet") || t.includes("solar") || t.includes("earth")) return Orbit;

  // Chemistry topics
  if (t.includes("organic") || t.includes("carbon") || t.includes("hydrocarbon") || t.includes("alkane") || t.includes("alkene")) return Hexagon;
  if (t.includes("acid") || t.includes("base") || t.includes("salt") || t.includes("ph")) return FlaskConical;
  if (t.includes("metal") || t.includes("alloy")) return Gem;
  if (t.includes("periodic") || t.includes("element")) return TestTube;
  if (t.includes("bond") || t.includes("ionic") || t.includes("covalent")) return Unplug;
  if (t.includes("reaction") || t.includes("equation") || t.includes("redox")) return FlaskRound;
  if (t.includes("solution") || t.includes("solut") || t.includes("concentr")) return Pipette;
  if (t.includes("gas") || t.includes("ideal gas")) return Cloudy;
  if (t.includes("polymer")) return Ribbon;
  if (t.includes("crystal") || t.includes("solid state")) return Snowflake;
  if (t.includes("electro") && t.includes("chem")) return Battery;
  if (t.includes("chemical kinet") || t.includes("rate")) return Activity;
  if (t.includes("equilib")) return Activity;

  // Biology topics
  if (t.includes("cell") || t.includes("cytol")) return Microscope;
  if (t.includes("dna") || t.includes("gene") || t.includes("hered") || t.includes("chromosom")) return Dna;
  if (t.includes("heart") || t.includes("circulat") || t.includes("blood")) return Heart;
  if (t.includes("brain") || t.includes("nerv") || t.includes("neuro")) return Brain;
  if (t.includes("plant") || t.includes("photosynth") || t.includes("botan")) return Leaf;
  if (t.includes("insect") || t.includes("arthropod")) return Bug;
  if (t.includes("flower") || t.includes("pollinat") || t.includes("reproduct") && t.includes("plant")) return Flower2;
  if (t.includes("ecology") || t.includes("ecosystem") || t.includes("forest") || t.includes("environment")) return Trees;
  if (t.includes("water") || t.includes("osmo")) return Droplets;
  if (t.includes("evolution") || t.includes("fossil")) return Shell;
  if (t.includes("embryo") || t.includes("develop")) return Egg;
  if (t.includes("skeleton") || t.includes("bone") || t.includes("locomot") || t.includes("muscl")) return Bone;
  if (t.includes("seed") || t.includes("germinat") || t.includes("growth")) return Sprout;
  if (t.includes("nutrition") || t.includes("digest") || t.includes("food") || t.includes("vitamin")) return Apple;
  if (t.includes("excret") || t.includes("kidney")) return Footprints;
  if (t.includes("respir") || t.includes("lung") || t.includes("breath")) return Wind;
  if (t.includes("reproduct")) return Flower2;
  if (t.includes("microb") || t.includes("bacteria") || t.includes("virus") || t.includes("immun")) return Beaker;

  return Atom;
}

// Gradient palette — cycles through for variety within each subject
const GRADIENTS = {
  physics: [
    { bg: "from-blue-500 to-indigo-600", light: "from-blue-100 to-indigo-100", text: "text-blue-600" },
    { bg: "from-sky-500 to-blue-600", light: "from-sky-100 to-blue-100", text: "text-sky-600" },
    { bg: "from-indigo-500 to-violet-600", light: "from-indigo-100 to-violet-100", text: "text-indigo-600" },
    { bg: "from-cyan-500 to-blue-600", light: "from-cyan-100 to-blue-100", text: "text-cyan-600" },
  ],
  chemistry: [
    { bg: "from-emerald-500 to-teal-600", light: "from-emerald-100 to-teal-100", text: "text-emerald-600" },
    { bg: "from-green-500 to-emerald-600", light: "from-green-100 to-emerald-100", text: "text-green-600" },
    { bg: "from-teal-500 to-cyan-600", light: "from-teal-100 to-cyan-100", text: "text-teal-600" },
    { bg: "from-lime-500 to-green-600", light: "from-lime-100 to-green-100", text: "text-lime-600" },
  ],
  biology: [
    { bg: "from-rose-500 to-pink-600", light: "from-rose-100 to-pink-100", text: "text-rose-600" },
    { bg: "from-pink-500 to-fuchsia-600", light: "from-pink-100 to-fuchsia-100", text: "text-pink-600" },
    { bg: "from-red-500 to-rose-600", light: "from-red-100 to-rose-100", text: "text-red-600" },
    { bg: "from-orange-500 to-rose-600", light: "from-orange-100 to-rose-100", text: "text-orange-600" },
  ],
  default: [
    { bg: "from-violet-500 to-purple-600", light: "from-violet-100 to-purple-100", text: "text-violet-600" },
    { bg: "from-purple-500 to-fuchsia-600", light: "from-purple-100 to-fuchsia-100", text: "text-purple-600" },
  ],
};

function getSubjectGradients(subjectName: string) {
  const n = subjectName.toLowerCase();
  if (n.includes("physics")) return GRADIENTS.physics;
  if (n.includes("chemistry")) return GRADIENTS.chemistry;
  if (n.includes("biology")) return GRADIENTS.biology;
  return GRADIENTS.default;
}

function getSubjectHeaderStyle(name: string) {
  const n = name.toLowerCase();
  if (n.includes("physics"))   return { gradient: "from-blue-500 to-indigo-600", accent: "#3b82f6" };
  if (n.includes("chemistry")) return { gradient: "from-emerald-500 to-teal-600", accent: "#10b981" };
  if (n.includes("biology"))   return { gradient: "from-rose-500 to-pink-600", accent: "#f43f5e" };
  return { gradient: "from-violet-500 to-purple-600", accent: "#8b5cf6" };
}

export default function CourseContentPage({ params }: { params: { courseId: string } }) {
  const { courseId } = params;
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourse() {
      setLoading(true);
      try {
        const { data } = await api.get(`/courses/course-content/${courseId}`);
        setCourse(data.data);
      } catch (err) {
        console.error("Failed to fetch course content", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [courseId]);

  if (loading) return <PageLoader />;
  if (!course) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Course not found</h2>
        <Link href="/courses" className="text-primary hover:underline">Back to all courses</Link>
      </div>
    </div>
  );

  const accentColor = course.accentColor || "#3b82f6";

  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-20">
      {/* ── HEADER ── */}
      <div className="border-b sticky top-0 z-30 backdrop-blur-xl bg-white/80">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Breadcrumb items={[{ label: "Courses", href: "/courses" }, { label: course.name }]} />
              <h1 className="text-xl md:text-2xl font-black text-gray-900 mt-1 tracking-tight">
                {course.name}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border" style={{ color: accentColor, borderColor: `${accentColor}30`, backgroundColor: `${accentColor}08` }}>
                Premium Access
              </span>
              <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-12">
          {course.subjects.map((subject: any, sIdx: number) => {
            const SubjectIcon = iconMap[subject.icon] || Atom;
            const headerStyle = getSubjectHeaderStyle(subject.name);
            const gradients = getSubjectGradients(subject.name);
            return (
              <div key={sIdx}>
                {/* Subject Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${headerStyle.gradient} flex items-center justify-center shadow-lg`}>
                    <SubjectIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">{subject.name}</h2>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{subject.chapters.length} chapters</p>
                  </div>
                </div>

                {/* Chapters Grid — screenshot-style centered cards with gradients */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {subject.chapters.map((chapter: any, cIdx: number) => {
                    const ChapterIcon = getChapterIcon(chapter.title, chapter.icon);
                    const grad = gradients[cIdx % gradients.length];
                    const classId = chapter.classId;
                    const subjectId = chapter.subjectId;

                    return (
                      <Link
                        key={chapter.id}
                        href={`/courses/${classId}/${subjectId}/${chapter.id}?fromCourse=${courseId}`}
                        className={`group relative bg-gradient-to-br ${grad.light} rounded-2xl border border-white/80 p-5 hover:shadow-xl hover:shadow-black/5 transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center`}
                      >
                        {/* Gradient icon container */}
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${grad.bg} flex items-center justify-center shadow-md mb-3 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                          <ChapterIcon className="w-6 h-6 text-white" />
                        </div>

                        {/* Title */}
                        <h3 className="text-[13px] font-bold text-gray-800 leading-snug mb-1.5 line-clamp-2 group-hover:text-gray-900 transition-colors">
                          {chapter.title}
                        </h3>

                        {/* Content counts */}
                        <div className="flex items-center gap-2 text-[10px] font-medium text-gray-400">
                          {chapter.contentCount.videos > 0 && (
                            <span className="flex items-center gap-0.5">
                              <PlayCircle className="w-3 h-3" />
                              {chapter.contentCount.videos}
                            </span>
                          )}
                          {chapter.contentCount.notes > 0 && (
                            <span className="flex items-center gap-0.5">
                              <FileText className="w-3 h-3" />
                              {chapter.contentCount.notes}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {course.subjects.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
               <Layout className="w-12 h-12 text-gray-300 mx-auto mb-4" />
               <p className="text-gray-500 font-bold">This course content is being prepared. Stay tuned!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
