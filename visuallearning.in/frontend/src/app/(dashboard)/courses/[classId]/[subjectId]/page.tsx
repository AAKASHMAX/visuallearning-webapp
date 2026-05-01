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
  Atom as Molecule
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getChapterAnimation } from "@/components/chapter-animations";
import { Chapter, BoardPaper } from "@/types";


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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [chapterRes] = await Promise.all([
          api.get(`/courses/subjects/${subjectId}/chapters`)
        ]);
        
        const data = chapterRes.data.data;
        setSubjectName(data.subject.name);
        setClassName(data.subject.class?.name || "");
        setChapters(data.chapters || []);
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
          <h1 className="text-3xl font-bold text-heading">
            {subjectName} <span className="text-primary">Chapters</span>
          </h1>
        </div>
        <p className="text-text-muted max-w-2xl">
          Explore comprehensive 3D animated videos, detailed study notes, and interactive quizzes for every chapter.
        </p>
      </div>

      {chapters.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-card-border card-shadow">
          <BookOpen className="w-12 h-12 text-primary-light/50 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-heading">No chapters found</h2>
          <p className="text-text-muted">Chapters for this subject will be available soon.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {chapters.map((chapter, idx) => {
            const ChapterIcon = getChapterIcon(chapter.name);

            return (
              <Link key={chapter.id} href={`/courses/${classId}/${subjectId}/${chapter.id}`} className="block">
                <div className="group flex items-center gap-4 rounded-xl border border-[#05BFDB]/30 p-4 transition-all duration-300 hover:border-[#05BFDB]/60 hover:-translate-y-0.5 cursor-pointer" style={{ background: 'linear-gradient(135deg, rgba(5,191,219,0.08) 0%, rgba(5,191,219,0.18) 50%, rgba(5,191,219,0.08) 100%)', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(5,191,219,0.1), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #05BFDB, #088395)' }}>
                    <ChapterIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-heading truncate">
                      {chapter.order || idx + 1}. {chapter.name}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-xs text-text-muted font-medium">
                      <span className="flex items-center gap-1">
                        <Play className="w-3 h-3 text-[#05BFDB]" />
                        {chapter._count?.videos || 0} Videos
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3 text-success" />
                        {chapter._count?.notes || 0} Notes
                      </span>
                      <span className="flex items-center gap-1">
                        <Brain className="w-3 h-3 text-[#05BFDB]" />
                        {chapter._count?.questions || 0} Quiz
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#05BFDB]/50 group-hover:text-[#05BFDB] shrink-0 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

    </div>
  );
}
