"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import type { Subject } from "@/types";
import { Atom, FlaskConical, Dna, Calculator } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";

const iconMap: Record<string, any> = { atom: Atom, "flask-conical": FlaskConical, dna: Dna, calculator: Calculator };

const subjectGradients: Record<string, string> = {
  physics: "from-blue-500 to-blue-700",
  chemistry: "from-orange-500 to-orange-700",
  biology: "from-[#f59e0b] to-[#d97706]",
  mathematics: "from-purple-500 to-purple-700",
};

const getGradient = (name: string, index: number) => {
  const key = name.toLowerCase();
  if (subjectGradients[key]) return subjectGradients[key];
  const fallbacks = ["from-blue-500 to-blue-700", "from-orange-500 to-orange-700", "from-[#f59e0b] to-[#d97706]", "from-purple-500 to-purple-700"];
  return fallbacks[index % fallbacks.length];
};

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
    <div className="max-w-6xl mx-auto">
      <Breadcrumb items={[{ label: className }]} />
      <h1 className="text-2xl font-bold mb-2">{className}</h1>
      <p className="text-gray-500 mb-6">Choose a subject to start learning</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {subjects.map((s, i) => {
          const Icon = iconMap[s.icon || ""] || Atom;
          const gradient = getGradient(s.name, i);
          return (
            <Link key={s.id} href={`/courses/${classId}/${s.id}`}>
              <div className={`bg-gradient-to-br ${gradient} text-white rounded-xl p-6 text-center hover:scale-105 transition-transform cursor-pointer shadow-lg h-full`}>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg">{s.name}</h3>
                <p className="text-sm text-white/70 mt-1">{s._count?.chapters || 0} Chapters</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
