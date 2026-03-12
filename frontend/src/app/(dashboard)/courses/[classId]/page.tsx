"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import type { Subject } from "@/types";
import { Atom, FlaskConical, Dna, Calculator, ArrowLeft } from "lucide-react";

const iconMap: Record<string, any> = { atom: Atom, "flask-conical": FlaskConical, dna: Dna, calculator: Calculator };

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
      <Link href="/courses" className="text-sm text-primary flex items-center gap-1 mb-4 hover:underline">
        <ArrowLeft className="w-3 h-3" /> Back to classes
      </Link>
      <h1 className="text-2xl font-bold mb-2">{className}</h1>
      <p className="text-gray-500 mb-6">Choose a subject to start learning</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {subjects.map((s) => {
          const Icon = iconMap[s.icon || ""] || Atom;
          return (
            <Link key={s.id} href={`/courses/${classId}/${s.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{s.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{s._count?.chapters || 0} Chapters</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
