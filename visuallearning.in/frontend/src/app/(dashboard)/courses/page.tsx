"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, GraduationCap, MonitorPlay, FileText, BookMarked, FileCheck2, Brain, Sparkles } from "lucide-react";
import { DownloadAppBanner } from "@/components/home/download-app-banner";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";

const demos = [
  { title: "3D animations", desc: "See a concept come to life.", href: "/demo/video", icon: MonitorPlay },
  { title: "Video lessons", desc: "Learn with a teacher.", href: "/demo/lecture", icon: GraduationCap },
  { title: "Visual notes", desc: "Make the big ideas stick.", href: "/demo/visual-notes", icon: FileText },
  { title: "NCERT solutions", desc: "Work it out, step by step.", href: "/demo/ncert-solution", icon: BookMarked },
  { title: "Past questions", desc: "Get familiar with exams.", href: "/demo/pyq", icon: FileCheck2 },
  { title: "Quick quizzes", desc: "Put your learning to the test.", href: "/demo/quiz", icon: Brain },
];

interface ClassItem { id: string; name: string; order?: number; _count?: { subjects: number } }

export default function CoursesClassGridPage() {
  const { isAuthenticated } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await api.get("/courses/classes");
      setClasses(Array.isArray(data.data) ? data.data : []);
    } catch { setError(true); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  return (
    <div className="learning-page course-library">
      <header className="learn-page-header">
        <div>
          <span className="learn-eyebrow"><span /> THE LEARNING LIBRARY</span>
          <h1>Big ideas.<br /><em>Made beautifully clear.</em></h1>
          <p>Discover the science behind your everyday world. Choose your class, follow your curiosity, and start connecting the dots.</p>
        </div>
        <div className="learn-header-note"><BookOpen size={20} /><strong>Your next discovery<br />starts here.</strong><span>CLASS 9 — 12</span></div>
      </header>
      <section className="learn-section" aria-labelledby="choose-class">
        <div className="learn-section-heading"><div><span className="learn-step">01 / FIND YOUR STARTING POINT</span><h2 id="choose-class">Which class are you in?</h2></div><Link className="learn-text-link" href="/pricing">Explore plans <ArrowUpRight size={17} /></Link></div>
        {loading ? <div className="learn-class-grid" role="status" aria-label="Loading classes">{[0, 1, 2, 3].map(i => <div key={i} className="learn-class-card learn-skeleton" />)}</div>
          : error ? <div className="learn-empty" role="alert"><BookOpen /><h3>Let’s try that again.</h3><p>We couldn’t load the classes. Please check your connection and try again.</p><button className="learn-button" onClick={() => void load()}>Reload classes <ArrowRight size={16} /></button></div>
          : classes.length === 0 ? <div className="learn-empty"><BookOpen /><h3>A new chapter is on its way.</h3><p>Classes will appear here as they become available. Explore a free demo below.</p></div>
          : <div className="learn-class-grid">{classes.map((cls, i) => {
            const number = cls.name.match(/\d+/)?.[0];
            return <Link key={cls.id} href={`/courses/${cls.id}`} className={`learn-class-card learn-tone-${i % 4}`}>
              <div className="learn-class-art" aria-hidden="true"><span className="learn-orbit learn-orbit-one" /><span className="learn-orbit learn-orbit-two" /><span className="learn-orbit learn-orbit-three" /><span className="learn-orbit-core" /><span className="learn-class-number">{number?.padStart(2, "0") || String(i + 1).padStart(2, "0")}</span></div>
              <div className="learn-class-info"><div><h3>{cls.name}</h3><p>{cls._count?.subjects ?? 0} subjects to explore</p></div><span className="learn-arrow-circle"><ArrowUpRight size={19} /></span></div>
            </Link>;
          })}</div>}
      </section>
      <section className="learn-section" aria-labelledby="sample-resources">
        <div className="learn-section-heading"><div><span className="learn-step">02 / A TASTE OF WHAT’S INSIDE</span><h2 id="sample-resources">A different way to understand.</h2></div><Link className="learn-text-link" href="/demo">All free demos <ArrowUpRight size={17} /></Link></div>
        <div className="learn-resource-grid">{demos.map(d => <Link key={d.href} href={d.href} className="learn-resource-card"><span className="learn-resource-icon"><d.icon size={22} strokeWidth={1.6} /></span><h3>{d.title}</h3><p>{d.desc}</p><span className="learn-resource-action">Try it out <ArrowRight size={15} /></span></Link>)}</div>
      </section>
      <div className="learn-discovery-banner"><span className="learn-banner-icon"><Sparkles size={25} /></span><div><h2>Small steps. Real understanding.</h2><p>{isAuthenticated ? "Find your active classes and keep your learning journey going." : "Create a free account to read notes, practise questions, and discover more."}</p></div><Link href={isAuthenticated ? "/dashboard" : "/auth/signup"} className="learn-button learn-button-light">{isAuthenticated ? "Your learning space" : "Start learning"} <ArrowUpRight size={17} /></Link></div>
      <div className="learn-app-banner"><DownloadAppBanner /></div>
    </div>
  );
}
