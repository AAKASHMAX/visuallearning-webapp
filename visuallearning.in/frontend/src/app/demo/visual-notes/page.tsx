"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Highlighter,
  Search,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useState } from "react";

const notesSections = [
  { id: 1, title: "Introduction to Cells", pages: "1-4", color: "bg-sky-500" },
  { id: 2, title: "Cell Organelles", pages: "5-10", color: "bg-emerald-500" },
  { id: 3, title: "Cell Division", pages: "11-16", color: "bg-violet-500" },
  { id: 4, title: "Summary & Key Points", pages: "17-18", color: "bg-amber-500" },
];

const noteContent = [
  {
    heading: "Cell — The Basic Unit of Life",
    bullets: [
      "All living organisms are made up of cells.",
      "Cells were first observed by Robert Hooke in 1665.",
      "The cell theory states that all living things are composed of cells.",
    ],
  },
  {
    heading: "Types of Cells",
    bullets: [
      "Prokaryotic cells — no nuclear membrane (e.g., bacteria).",
      "Eukaryotic cells — well-defined nucleus (e.g., plant & animal cells).",
      "Unicellular organisms have a single cell; multicellular have many.",
    ],
  },
  {
    heading: "Cell Organelles",
    bullets: [
      "Nucleus — controls cell activities, contains DNA.",
      "Mitochondria — powerhouse of the cell, produces ATP.",
      "Endoplasmic Reticulum — smooth (lipid synthesis) and rough (protein synthesis).",
      "Golgi Apparatus — packaging and transport of proteins.",
    ],
  },
];

export default function DemoVisualNotesPage() {
  const [zoom, setZoom] = useState(100);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-text-muted">
        <Link href="/demo" className="hover:text-primary">Demo</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-heading">Visual Notes</span>
      </div>

      <div className="mb-6 flex flex-col gap-3">
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-sky-500/10 to-cyan-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-sky-600">
          <Sparkles className="h-3.5 w-3.5" />
          Demo Preview
        </div>
        <h1 className="text-3xl font-black tracking-tight text-heading sm:text-4xl">Visual Notes</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
          Beautifully structured notes with highlights, diagrams, and key takeaways for quick revision.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Notes viewer */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="mb-3 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-sky-500" />
              <span className="text-sm font-bold text-heading">Cell — The Basic Unit of Life</span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-text-muted">
                Class 9 Biology
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-xs font-bold text-text-muted">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(150, zoom + 10))}
                className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <div className="mx-1 h-5 w-px bg-gray-200" />
              <button className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50">
                <Highlighter className="h-4 w-4" />
              </button>
              <button className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50">
                <Search className="h-4 w-4" />
              </button>
              <button className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50">
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notes content area */}
          <div
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            style={{ fontSize: `${zoom}%` }}
          >
            {/* Header badge */}
            <div className="mb-6 rounded-xl bg-gradient-to-r from-sky-50 to-cyan-50 p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-md">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-heading">Chapter 1: The Fundamental Unit of Life</h2>
                  <p className="text-xs text-text-muted">Class 9 — Biology — NCERT Based</p>
                </div>
              </div>
            </div>

            {noteContent.map((section, si) => (
              <div key={si} className="mb-8 last:mb-0">
                <h3 className="mb-3 flex items-center gap-2 border-l-4 border-sky-400 pl-3 text-base font-black text-heading">
                  {section.heading}
                </h3>
                <div className="flex flex-col gap-2 pl-4">
                  {section.bullets.map((bullet, bi) => (
                    <div key={bi} className="flex items-start gap-2.5">
                      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky-400" />
                      <p className="text-sm leading-relaxed text-gray-700">{bullet}</p>
                    </div>
                  ))}
                </div>
                {si === 1 && (
                  <div className="mt-4 flex items-center justify-center rounded-xl border-2 border-dashed border-sky-200 bg-sky-50/50 py-10">
                    <div className="flex flex-col items-center gap-2 text-sky-400">
                      <Eye className="h-8 w-8" />
                      <span className="text-xs font-bold">Diagram: Animal Cell Structure</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Key takeaway box */}
            <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h4 className="mb-2 text-sm font-black text-amber-700">Key Takeaways</h4>
              <ul className="flex flex-col gap-1.5 text-sm text-amber-900/80">
                <li>- Cell is the structural and functional unit of life.</li>
                <li>- Prokaryotic cells lack a nucleus; eukaryotic cells have one.</li>
                <li>- Mitochondria is the powerhouse of the cell.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-72">
          {/* Sections */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="text-sm font-black text-heading">Sections</h3>
              <p className="mt-0.5 text-xs text-text-muted">18 pages total</p>
            </div>
            <div className="flex flex-col divide-y divide-gray-50">
              {notesSections.map((sec, i) => (
                <button
                  key={sec.id}
                  className={`flex items-center gap-3 px-5 py-3 text-left transition-all hover:bg-gray-50 ${
                    i === 0 ? "bg-sky-50/50" : ""
                  }`}
                >
                  <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${sec.color}`} />
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm ${i === 0 ? "font-bold text-heading" : "font-medium text-text-muted"}`}>
                      {sec.title}
                    </p>
                    <p className="text-[11px] text-text-muted">Pages {sec.pages}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-600 via-cyan-600 to-blue-500 p-5 text-white shadow-lg shadow-sky-500/20">
            <h4 className="text-lg font-black">Access All Notes</h4>
            <p className="mt-1.5 text-xs leading-relaxed text-white/70">
              Unlock complete visual notes for every chapter with downloadable PDFs.
            </p>
            <Link
              href="/courses"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-sky-600 shadow-md transition-all hover:gap-3 hover:shadow-lg"
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
