"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Fullscreen,
  Layers,
  MonitorPlay,
  Pause,
  Play,
  RotateCcw,
  Settings,
  SkipForward,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useState } from "react";

const chapters = [
  { id: 1, title: "Cell Structure & Organisation", duration: "12:45", active: true },
  { id: 2, title: "Cell Division - Mitosis", duration: "10:30", active: false },
  { id: 3, title: "Photosynthesis Process", duration: "14:20", active: false },
  { id: 4, title: "Human Digestive System", duration: "11:55", active: false },
  { id: 5, title: "Periodic Table Trends", duration: "09:40", active: false },
];

const highlights = [
  { time: "0:45", label: "Cell membrane intro" },
  { time: "3:12", label: "3D nucleus walkthrough" },
  { time: "6:30", label: "Mitochondria animation" },
  { time: "9:15", label: "Endoplasmic reticulum" },
];

export default function DemoVideoPage() {
  const [playing, setPlaying] = useState(false);

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
          <div className="relative overflow-hidden rounded-2xl bg-gray-900 shadow-2xl shadow-black/20">
            {/* Fake video screen */}
            <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-gray-900 via-indigo-950 to-violet-950">
              {/* 3D scene placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Decorative floating elements */}
                <div className="absolute left-[15%] top-[20%] h-20 w-20 animate-pulse rounded-full border border-cyan-400/30 bg-cyan-400/10" />
                <div className="absolute right-[20%] top-[30%] h-14 w-14 animate-pulse rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10" style={{ animationDelay: "0.5s" }} />
                <div className="absolute bottom-[25%] left-[30%] h-10 w-10 animate-pulse rounded-full border border-emerald-400/30 bg-emerald-400/10" style={{ animationDelay: "1s" }} />

                {/* Central cell illustration */}
                <div className="relative flex flex-col items-center gap-4">
                  <div className="relative h-36 w-36 rounded-full border-2 border-cyan-400/50 bg-cyan-400/5 shadow-[0_0_60px_rgba(34,211,238,0.15)] sm:h-48 sm:w-48">
                    <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/60 bg-violet-500/20 shadow-[0_0_30px_rgba(139,92,246,0.2)] sm:h-20 sm:w-20">
                      <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400/60" />
                    </div>
                    {/* Organelles */}
                    <div className="absolute left-3 top-1/2 h-6 w-10 -translate-y-1/2 rounded-full border border-emerald-400/50 bg-emerald-400/15 sm:h-8 sm:w-14" />
                    <div className="absolute bottom-6 right-4 h-5 w-8 rounded-full border border-amber-400/50 bg-amber-400/15 sm:h-6 sm:w-10" />
                    <div className="absolute right-6 top-6 h-4 w-6 rounded-full border border-pink-400/50 bg-pink-400/15 sm:h-5 sm:w-8" />
                  </div>
                  <span className="text-sm font-bold tracking-wide text-white/60">Cell Structure — 3D View</span>
                </div>
              </div>

              {/* Play button overlay */}
              <button
                onClick={() => setPlaying(!playing)}
                className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 transition-all hover:bg-black/30"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-transform hover:scale-110 sm:h-20 sm:w-20">
                  {playing ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                </div>
              </button>

              {/* Chapter label */}
              <div className="absolute left-4 top-4 z-10 rounded-lg bg-black/50 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                Chapter 1: Cell Structure & Organisation
              </div>
            </div>

            {/* Video controls bar */}
            <div className="flex flex-col gap-2 bg-gray-900 px-4 py-3">
              {/* Progress bar */}
              <div className="group relative h-1.5 w-full cursor-pointer rounded-full bg-white/10">
                <div className="h-full w-[35%] rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                <div className="absolute left-[35%] top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-violet-500 opacity-0 shadow-lg transition-opacity group-hover:opacity-100" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setPlaying(!playing)} className="text-white/80 hover:text-white">
                    {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </button>
                  <SkipForward className="h-4.5 w-4.5 cursor-pointer text-white/60 hover:text-white" />
                  <RotateCcw className="h-4 w-4 cursor-pointer text-white/60 hover:text-white" />
                  <Volume2 className="h-4.5 w-4.5 cursor-pointer text-white/60 hover:text-white" />
                  <span className="ml-1 text-xs text-white/50">4:28 / 12:45</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/60">HD</span>
                  <Settings className="h-4 w-4 cursor-pointer text-white/60 hover:text-white" />
                  <Fullscreen className="h-4 w-4 cursor-pointer text-white/60 hover:text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Key moments */}
          <div className="mt-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-heading">
              <Layers className="h-4 w-4 text-violet-500" />
              Key Moments
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {highlights.map((h) => (
                <button
                  key={h.time}
                  className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-left transition-all hover:border-violet-200 hover:bg-violet-50"
                >
                  <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-black text-violet-600">
                    {h.time}
                  </span>
                  <span className="text-xs font-medium text-text-muted">{h.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chapter sidebar */}
        <div className="w-full lg:w-80">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="flex items-center gap-2 text-sm font-black text-heading">
                <BookOpen className="h-4 w-4 text-primary" />
                Chapter Playlist
              </h3>
              <p className="mt-1 text-xs text-text-muted">Class 9 — Biology</p>
            </div>
            <div className="flex flex-col divide-y divide-gray-50">
              {chapters.map((ch, i) => (
                <button
                  key={ch.id}
                  className={`flex items-center gap-3 px-5 py-3.5 text-left transition-all hover:bg-gray-50 ${
                    ch.active ? "bg-violet-50/60" : ""
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                      ch.active
                        ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {ch.active ? <MonitorPlay className="h-4 w-4" /> : i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm ${ch.active ? "font-bold text-heading" : "font-medium text-text-muted"}`}>
                      {ch.title}
                    </p>
                    <p className="text-[11px] text-text-muted">{ch.duration}</p>
                  </div>
                </button>
              ))}
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
