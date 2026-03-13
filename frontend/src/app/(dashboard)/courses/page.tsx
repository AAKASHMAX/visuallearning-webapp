"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import type { ClassItem } from "@/types";
import { BookOpen, Radio } from "lucide-react";

const classColors = ["from-blue-500 to-blue-700", "from-green-500 to-green-700", "from-purple-500 to-purple-700", "from-orange-500 to-orange-700"];

export default function CoursesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/courses/classes").then(({ data }) => setClasses(data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Browse Courses</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {classes.map((c, i) => (
          <Link key={c.id} href={`/courses/${c.id}`}>
            <div className={`bg-gradient-to-br ${classColors[i % 4]} text-white rounded-xl p-6 hover:scale-105 transition-transform cursor-pointer shadow-lg h-full`}>
              <BookOpen className="w-10 h-10 mb-4 opacity-80" />
              <h3 className="text-xl font-bold mb-1">{c.name}</h3>
              <p className="text-white/70">{c._count?.subjects || 4} Subjects</p>
              <div className="mt-4 text-sm font-medium">Explore &rarr;</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Live Classes Card */}
      <div className="mt-8">
        <Link href="/courses/live-classes">
          <div className="relative bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-xl p-6 hover:scale-105 transition-transform cursor-pointer shadow-lg max-w-xs overflow-hidden">
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-medium">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Live
            </div>
            <Radio className="w-10 h-10 mb-4 opacity-80" />
            <h3 className="text-xl font-bold mb-1">Live Classes</h3>
            <p className="text-white/70">Doubt-clearing sessions with expert teachers</p>
            <div className="mt-4 text-sm font-medium">Explore &rarr;</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
