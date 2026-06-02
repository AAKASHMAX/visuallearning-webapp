"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  GraduationCap,
  MonitorPlay,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

type DemoVideo = {
  title: string;
  klass: string;
  subject: string;
  chapter: string;
  vimeoId: string;
};

// Curated sample of real 3D animated lessons (Hindi) from the video library.
const videos: DemoVideo[] = [
  { title: "Gauss's Theorem", klass: "Class 12", subject: "Physics", chapter: "Electric Charges and Fields", vimeoId: "1182958272" },
  { title: "Electric Potential", klass: "Class 12", subject: "Physics", chapter: "Electrostatic Potential and Capacitance", vimeoId: "1183254112" },
  { title: "Kirchhoff's Rules", klass: "Class 12", subject: "Physics", chapter: "Current Electricity", vimeoId: "1183254625" },
  { title: "Photoelectric Effect", klass: "Class 12", subject: "Physics", chapter: "Dual Nature of Radiation and Matter", vimeoId: "1183623574" },
  { title: "Bernoulli's Theorem", klass: "Class 11", subject: "Physics", chapter: "Mechanical Properties of Fluids", vimeoId: "1186852505" },
  { title: "Rutherford's Model of Atom", klass: "Class 12", subject: "Physics", chapter: "Atoms", vimeoId: "1183623647" },
  { title: "Wave Front & Huygens' Principle", klass: "Class 12", subject: "Physics", chapter: "Wave Optics", vimeoId: "1183623397" },
  { title: "Young's Double Slit Experiment & Fringe Width", klass: "Class 12", subject: "Physics", chapter: "Wave Optics", vimeoId: "1183623426" },
];

function embedUrl(vimeoId: string, autoplay: boolean) {
  const base = `https://player.vimeo.com/video/${vimeoId}`;
  const params = "badge=0&autopause=0&title=0&byline=0&portrait=0&dnt=1";
  return `${base}?${params}${autoplay ? "&autoplay=1" : ""}`;
}

export default function DemoVideoPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  // Don't autoplay on first paint; only after the user picks a lesson.
  const [started, setStarted] = useState(false);
  const active = videos[activeIndex];

  const selectVideo = (index: number) => {
    setActiveIndex(index);
    setStarted(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-text-muted">
        <Link href="/demo" className="hover:text-primary">Demo</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-heading">3D Animated Videos</span>
      </div>

      {/* Hero badge */}
      <div className="mb-6 flex flex-col gap-3">
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-violet-600">
          <Sparkles className="h-3.5 w-3.5" />
          Demo Preview
        </div>
        <h1 className="text-3xl font-black tracking-tight text-heading sm:text-4xl">
          3D Animated Video Lessons
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
          Experience science like never before with immersive 3D animations that make complex concepts crystal clear.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Video Player Area */}
        <div className="flex-1">
          <div className="overflow-hidden rounded-2xl bg-gray-900 shadow-2xl shadow-black/20">
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                key={active.vimeoId}
                src={embedUrl(active.vimeoId, started)}
                title={active.title}
                className="absolute inset-0 h-full w-full"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                allowFullScreen
              />
            </div>
          </div>

          {/* Now playing */}
          <div className="mt-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-violet-600">
              <MonitorPlay className="h-3 w-3" />
              Now Playing
            </span>
            <h2 className="mt-2 text-lg font-black text-heading sm:text-xl">
              {activeIndex + 1}. {active.title}
            </h2>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-text-muted">
              <GraduationCap className="h-3.5 w-3.5" />
              {active.klass} · {active.subject} · {active.chapter}
            </p>
          </div>
        </div>

        {/* Playlist sidebar */}
        <div className="w-full lg:w-80">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="flex items-center gap-2 text-sm font-black text-heading">
                <BookOpen className="h-4 w-4 text-primary" />
                Sample Lessons
              </h3>
              <p className="mt-1 text-xs text-text-muted">{videos.length} animated videos · Hindi</p>
            </div>
            <div className="flex max-h-[60vh] flex-col divide-y divide-gray-50 overflow-y-auto">
              {videos.map((v, i) => {
                const isActive = i === activeIndex;
                return (
                  <button
                    key={v.vimeoId}
                    onClick={() => selectVideo(i)}
                    className={`flex items-center gap-3 px-5 py-3.5 text-left transition-all hover:bg-gray-50 ${
                      isActive ? "bg-violet-50/60" : ""
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                        isActive
                          ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {isActive ? <MonitorPlay className="h-4 w-4" /> : i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm ${isActive ? "font-bold text-heading" : "font-medium text-text-muted"}`}>
                        {v.title}
                      </p>
                      <p className="truncate text-[11px] text-text-muted">
                        {v.klass} · {v.subject}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CTA card */}
          <div className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 p-5 text-white shadow-lg shadow-violet-500/20">
            <h4 className="text-lg font-black">Unlock All Chapters</h4>
            <p className="mt-1.5 text-xs leading-relaxed text-white/70">
              Get full access to 3D animated videos for every chapter across Class 9-12.
            </p>
            <Link
              href="/courses"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-violet-600 shadow-md transition-all hover:gap-3 hover:shadow-lg"
            >
              View Plans
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
