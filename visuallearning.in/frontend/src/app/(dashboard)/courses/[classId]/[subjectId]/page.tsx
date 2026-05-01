"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import { 
  Play, 
  FileText, 
  Brain, 
  ChevronRight, 
  ArrowLeft, 
  BookOpen,
  Orbit,
  Lightbulb,
  Zap,
  Magnet,
  Waves,
  Flame,
  Rocket,
  Atom,
  Radio,
  FlaskConical,
  Sun,
  Microscope,
  Gauge,
  Triangle,
  ClipboardList,
  Download,
  Atom as Molecule
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getChapterAnimation } from "@/components/chapter-animations";
import { Chapter, BoardPaper } from "@/types";

// Board exam classes show "Board Papers", others show "Important Questions"
const BOARD_CLASSES = ["10", "12", "class 10", "class 12"];

// Map chapter names to icons (adapted for more subjects)
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
  atoms: Molecule,
  molecules: Molecule,
  chemical: FlaskConical,
  acid: FlaskConical,
  base: FlaskConical,
  salt: FlaskConical,
  metal: Triangle,
  life: Microscope,
  cell: Microscope,
  tissue: Microscope,
  reproduction: Microscope,
  heredity: Molecule,
  environment: Sun,
};

function getChapterIcon(name: string) {
  const lower = name.toLowerCase();
  for (const [key, Icon] of Object.entries(iconMap)) {
    if (lower.includes(key)) return Icon;
  }
  return BookOpen;
}

export default function SubjectChaptersPage() {
  const params = useParams();
  const classId = Array.isArray(params.classId) ? params.classId[0] : (params.classId as string);
  const subjectId = Array.isArray(params.subjectId) ? params.subjectId[0] : (params.subjectId as string);
  
  const [subjectName, setSubjectName] = useState("");
  const [className, setClassName] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [boardPapers, setBoardPapers] = useState<BoardPaper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [chapterRes, paperRes] = await Promise.all([
          api.get(`/courses/subjects/${subjectId}/chapters`),
          api.get(`/courses/subjects/${subjectId}/board-papers`)
        ]);
        
        const data = chapterRes.data.data;
        setSubjectName(data.subject.name);
        setClassName(data.subject.class?.name || "");
        setChapters(data.chapters || []);
        
        // Flatten board papers if they come in year-grouped object
        const papers = paperRes.data.data.papers || paperRes.data.data;
        if (typeof papers === 'object' && !Array.isArray(papers)) {
          setBoardPapers(Object.values(papers).flat() as BoardPaper[]);
        } else {
          setBoardPapers(papers || []);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [subjectId]);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[
        { label: className, href: `/courses/${classId}` },
        { label: subjectName },
      ]} />

      <div className="mt-8 mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Link href={`/courses/${classId}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {subjectName} <span className="text-accent">Chapters</span>
          </h1>
        </div>
        <p className="text-gray-500 max-w-2xl">
          Explore comprehensive 3D animated videos, detailed study notes, and interactive quizzes for every chapter.
        </p>
      </div>

      {chapters.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600">No chapters found</h2>
          <p className="text-gray-400">Chapters for this subject will be available soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {chapters.map((chapter, idx) => {
            const ChapterIcon = getChapterIcon(chapter.name);
            const AnimationComponent = getChapterAnimation(chapter.name);

            return (
              <Link key={chapter.id} href={`/courses/${classId}/${subjectId}/${chapter.id}`}>
                <Card className="group relative overflow-hidden border border-gray-200 bg-white hover:border-accent/30 transition-all duration-500 hover:-translate-y-1 cursor-pointer h-full">
                  <CardContent className="p-6 text-center">
                    {/* Chapter Number */}
                    <div className="absolute top-3 left-3 w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center z-10">
                      <span className="text-xs font-bold text-accent">{chapter.order || idx + 1}</span>
                    </div>

                    {/* Animated Visual */}
                    <div className="w-full h-32 mx-auto rounded-xl bg-gray-50 border border-gray-100 mb-4 overflow-hidden relative flex items-center justify-center group-hover:bg-accent/5 transition-colors">
                      {AnimationComponent ? (
                        <AnimationComponent />
                      ) : (
                        <ChapterIcon className="w-12 h-12 text-gray-300 group-hover:text-accent/40 transition-colors" />
                      )}
                    </div>

                    {/* Name */}
                    <h3 className="text-base font-bold text-gray-800 mb-3 line-clamp-2 min-h-[2.5rem]">
                      {chapter.name}
                    </h3>

                    {/* Content counts */}
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Play className="w-3.5 h-3.5 text-accent" />
                        {chapter._count?.videos || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-emerald-500" />
                        {chapter._count?.notes || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Brain className="w-3.5 h-3.5 text-purple-500" />
                        {chapter._count?.questions || 0}
                      </span>
                    </div>

                    {/* Hover indicator */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-5 h-5 text-accent" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Board Papers Section */}
      {boardPapers.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-rose-500" />
            {BOARD_CLASSES.some((b) => className.toLowerCase().includes(b)) ? "Board Papers" : "Important Questions"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boardPapers.map((paper) => (
              <div key={paper.id} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 hover:border-rose-500/40 hover:shadow-sm transition-all">
                <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-800 truncate">{paper.title}</h3>
                  <p className="text-[10px] text-gray-500 uppercase font-medium">{paper.year} Exam Paper</p>
                </div>
                <a 
                  href={paper.pdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-rose-50 rounded-lg text-rose-600 transition-colors"
                >
                  <Download className="w-5 h-5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
