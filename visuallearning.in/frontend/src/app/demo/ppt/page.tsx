"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Download,
  Fullscreen,
  Layers,
  Presentation,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

const slides = [
  {
    id: 1,
    title: "Photosynthesis",
    subtitle: "The Process of Life",
    content: "Chapter 6 — Class 10 Biology",
    bg: "from-emerald-600 via-teal-600 to-cyan-600",
    type: "title" as const,
  },
  {
    id: 2,
    title: "What is Photosynthesis?",
    bullets: [
      "Process by which plants convert light energy into chemical energy",
      "Takes place primarily in the leaves (chloroplasts)",
      "Produces glucose and oxygen as byproducts",
    ],
    bg: "from-white to-emerald-50/50",
    type: "content" as const,
  },
  {
    id: 3,
    title: "The Chemical Equation",
    equation: "6CO\u2082 + 6H\u2082O \u2192 C\u2086H\u2081\u2082O\u2086 + 6O\u2082",
    note: "Carbon dioxide + Water \u2192 Glucose + Oxygen",
    bg: "from-white to-sky-50/50",
    type: "equation" as const,
  },
  {
    id: 4,
    title: "Factors Affecting Photosynthesis",
    bullets: [
      "Light intensity — higher light = faster rate (up to a point)",
      "CO\u2082 concentration — more CO\u2082 increases rate",
      "Temperature — optimal range 25-35\u00b0C",
      "Water availability — essential raw material",
    ],
    bg: "from-white to-amber-50/50",
    type: "content" as const,
  },
  {
    id: 5,
    title: "Summary",
    bullets: [
      "Photosynthesis converts light energy to chemical energy",
      "Occurs in chloroplasts using chlorophyll",
      "Raw materials: CO\u2082 and H\u2082O",
      "Products: Glucose and O\u2082",
    ],
    bg: "from-emerald-600 via-teal-600 to-cyan-600",
    type: "summary" as const,
  },
];

export default function DemoPPTPage() {
  const [current, setCurrent] = useState(0);
  const slide = slides[current];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-text-muted">
        <Link href="/demo" className="hover:text-primary">Demo</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-heading">PPTs</span>
      </div>

      <div className="mb-6 flex flex-col gap-3">
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-blue-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-indigo-600">
          <Sparkles className="h-3.5 w-3.5" />
          Demo Preview
        </div>
        <h1 className="text-3xl font-black tracking-tight text-heading sm:text-4xl">
          Presentation Slides (PPTs)
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
          Ready-to-use teaching presentations with clear visuals, key points, and structured flow.
        </p>
      </div>

      {/* Slide viewer */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-xl">
        {/* Slide display */}
        <div className={`relative min-h-[400px] bg-gradient-to-br ${slide.bg} p-8 sm:min-h-[480px] sm:p-12`}>
          {slide.type === "title" && (
            <div className="flex h-full min-h-[340px] flex-col items-center justify-center text-center text-white">
              <Presentation className="mb-4 h-12 w-12 opacity-60" />
              <h2 className="text-4xl font-black sm:text-5xl">{slide.title}</h2>
              <p className="mt-2 text-xl font-medium text-white/70">{slide.subtitle}</p>
              <p className="mt-6 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold backdrop-blur-sm">
                {slide.content}
              </p>
            </div>
          )}

          {slide.type === "content" && (
            <div className="flex h-full min-h-[340px] flex-col">
              <h2 className="mb-6 border-b-2 border-emerald-400/30 pb-3 text-2xl font-black text-heading sm:text-3xl">
                {slide.title}
              </h2>
              <div className="flex flex-1 flex-col justify-center gap-4">
                {slide.bullets?.map((b, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-xs font-black text-white shadow-sm">
                      {i + 1}
                    </div>
                    <p className="text-base leading-relaxed text-gray-700 sm:text-lg">{b}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {slide.type === "equation" && (
            <div className="flex h-full min-h-[340px] flex-col items-center justify-center text-center">
              <h2 className="mb-8 text-2xl font-black text-heading sm:text-3xl">{slide.title}</h2>
              <div className="rounded-2xl border border-sky-200 bg-white/80 px-8 py-6 shadow-lg backdrop-blur-sm">
                <p className="text-2xl font-black tracking-wide text-sky-700 sm:text-3xl">{slide.equation}</p>
                <p className="mt-3 text-sm text-gray-500">{slide.note}</p>
              </div>
            </div>
          )}

          {slide.type === "summary" && (
            <div className="flex h-full min-h-[340px] flex-col items-center justify-center text-center text-white">
              <h2 className="mb-6 text-3xl font-black sm:text-4xl">{slide.title}</h2>
              <div className="flex flex-col gap-3">
                {slide.bullets?.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-left">
                    <div className="h-2 w-2 shrink-0 rounded-full bg-white/60" />
                    <p className="text-base text-white/80">{b}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-5 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrent(Math.max(0, current - 1))}
              disabled={current === 0}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-all hover:bg-gray-50 disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrent(Math.min(slides.length - 1, current + 1))}
              disabled={current === slides.length - 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-all hover:bg-gray-50 disabled:opacity-30"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
            <span className="ml-2 text-sm font-bold text-text-muted">
              Slide {current + 1} of {slides.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">
              <Download className="h-4 w-4" />
            </button>
            <button className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">
              <Fullscreen className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide thumbnails */}
      <div className="mt-5 grid grid-cols-5 gap-3">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setCurrent(i)}
            className={`overflow-hidden rounded-xl border-2 transition-all ${
              i === current ? "border-indigo-400 shadow-lg shadow-indigo-500/20" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className={`flex aspect-[16/10] items-center justify-center bg-gradient-to-br ${s.bg} p-2`}>
              <span className={`text-center text-[10px] font-bold leading-tight ${
                s.type === "title" || s.type === "summary" ? "text-white" : "text-heading"
              }`}>
                {s.title}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 p-8 text-center text-white shadow-lg shadow-indigo-500/20">
        <Layers className="h-8 w-8 opacity-70" />
        <h3 className="text-2xl font-black">Access All Presentations</h3>
        <p className="max-w-lg text-sm text-white/70">
          Unlock downloadable PPTs for every chapter — perfect for classroom teaching and self-revision.
        </p>
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-indigo-600 shadow-md transition-all hover:gap-3 hover:shadow-lg"
        >
          View Plans
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
