"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import { BookOpen, GraduationCap } from "lucide-react";

interface ClassItem {
  id: string;
  name: string;
  order?: number;
  _count?: { subjects: number };
}

function classGradient(name: string, index: number) {
  const n = name.toLowerCase();
  if (n.includes("12")) return "from-violet-500 to-purple-700";
  if (n.includes("11")) return "from-amber-500 to-orange-600";
  if (n.includes("10")) return "from-orange-500 to-orange-600";
  if (n.includes("9")) return "from-blue-500 to-blue-700";
  const fallbacks = ["from-blue-500 to-blue-700", "from-orange-500 to-orange-600", "from-amber-500 to-orange-600", "from-violet-500 to-purple-700"];
  return fallbacks[index % fallbacks.length];
}

export default function CoursesClassGridPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/courses/classes").then(({ data }) => {
      setClasses(Array.isArray(data.data) ? data.data : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header banner */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-[#2a4a8a] p-6 mb-6 shadow-lg flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Start Learning</h1>
          <p className="text-white/80 text-sm mt-1">Choose your class to begin</p>
        </div>
        <Link href="/pricing" className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/25 transition-colors shrink-0">
          View Plans
        </Link>
      </div>

      <h2 className="text-base font-semibold text-gray-500 mb-3">Classes</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {classes.map((cls, i) => {
          const grad = classGradient(cls.name, i);
          return (
            <Link key={cls.id} href={`/courses/${cls.id}`}>
              <div className={`relative h-36 overflow-hidden rounded-2xl bg-gradient-to-br ${grad} p-5 shadow-lg transition-transform hover:scale-[1.02] cursor-pointer`}>
                <GraduationCap className="absolute -bottom-3 -right-3 w-24 h-24 text-white/10" />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg leading-tight">{cls.name}</h3>
                    <p className="text-white/80 text-xs mt-1">{cls._count?.subjects ?? 0} Subjects</p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {classes.length === 0 && (
        <div className="rounded-2xl bg-white p-10 text-center text-gray-400 shadow-sm">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Classes will be available soon.</p>
        </div>
      )}
    </div>
  );
}
