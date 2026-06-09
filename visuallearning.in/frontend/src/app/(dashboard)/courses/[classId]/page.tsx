"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageLoader } from "@/components/ui/loading";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import api from "@/lib/api";
import type { Subject } from "@/types";
import { Atom, FlaskConical, Dna, Calculator, Lock, GraduationCap, BookOpen } from "lucide-react";

const iconMap: Record<string, any> = { atom: Atom, "flask-conical": FlaskConical, dna: Dna, calculator: Calculator };

function subjectIcon(s: Subject) {
  if (s.icon && iconMap[s.icon]) return iconMap[s.icon];
  const n = s.name.toLowerCase();
  if (n.includes("phys")) return Atom;
  if (n.includes("chem")) return FlaskConical;
  if (n.includes("bio")) return Dna;
  if (n.includes("math")) return Calculator;
  return BookOpen;
}

// Mobile-app subject palette.
const subjectGradients: Record<string, string> = {
  physics: "from-blue-500 to-blue-700",
  chemistry: "from-orange-500 to-orange-600",
  biology: "from-emerald-500 to-teal-600",
  mathematics: "from-violet-500 to-purple-700",
  math: "from-violet-500 to-purple-700",
};
const fallbackGradients = [
  "from-blue-500 to-blue-700",
  "from-orange-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-700",
];
const getGradient = (name: string, index: number) =>
  subjectGradients[name.toLowerCase()] || fallbackGradients[index % fallbackGradients.length];

export default function ClassSubjectsPage() {
  const { classId } = useParams();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/courses/classes/${classId}/subjects`).then(({ data }) => {
      setSubjects(data.data.subjects);
      setClassName(data.data.class.name);
    }).finally(() => setLoading(false));
  }, [classId]);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Breadcrumb items={[{ label: className }]} />

      {/* Header banner */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-[#2a4a8a] p-6 mb-6 flex items-center justify-between shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white">{className}</h1>
          <p className="text-white/80 text-sm mt-1">Choose a subject to start learning</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
      </div>

      <h2 className="text-base font-semibold text-gray-500 mb-3">Subjects</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {subjects.map((s, i) => {
          const Icon = subjectIcon(s);
          const gradient = getGradient(s.name, i);
          const isDisabled = s.enabled === false;

          if (isDisabled) {
            return (
              <div key={s.id} className="relative h-40 overflow-hidden rounded-2xl bg-gradient-to-br from-gray-400 to-gray-500 p-5 shadow-lg opacity-80 pointer-events-none select-none">
                <Icon className="absolute -bottom-4 -right-4 w-28 h-28 text-white/10" />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white/70" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg leading-tight">{s.name}</h3>
                    <span className="mt-1 inline-flex items-center gap-1 text-white/80 text-xs"><Lock className="w-3 h-3" /> Coming Soon</span>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <Link key={s.id} href={`/courses/${classId}/${s.id}`}>
              <div className={`relative h-40 overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5 shadow-lg transition-transform hover:scale-[1.02] cursor-pointer`}>
                <Icon className="absolute -bottom-4 -right-4 w-28 h-28 text-white/10" />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg leading-tight">{s.name}</h3>
                    <p className="text-white/80 text-xs mt-1">{s._count?.chapters || 0} Chapters</p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
