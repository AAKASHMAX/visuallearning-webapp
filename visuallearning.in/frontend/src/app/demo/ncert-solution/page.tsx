"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

const questions = [
  {
    id: 1,
    question: "Who discovered cells, and how?",
    answer:
      "Robert Hooke discovered cells in 1665. He observed a thin slice of cork under a self-designed microscope and noticed small compartments which he called 'cells'. The cells Hooke observed were actually dead cells — what he saw were the cell walls.",
    tip: "This is a frequently asked 1-mark question in board exams.",
  },
  {
    id: 2,
    question: "Why is the cell called the structural and functional unit of life?",
    answer:
      "The cell is called the structural and functional unit of life because all living organisms are made up of cells. Cells provide structure to the body and carry out all life processes such as respiration, nutrition, excretion, etc. Even the smallest organism (like Amoeba) is made up of a single cell that performs all life functions.",
    tip: "Important 3-mark question. Include examples of unicellular and multicellular organisms.",
  },
  {
    id: 3,
    question: "How do substances like CO\u2082 and water move in and out of the cell?",
    answer:
      "CO\u2082 moves in and out of the cell by the process of diffusion — from a region of high concentration to low concentration. Water moves across the cell membrane by osmosis — the movement of water from a region of high water concentration (dilute solution) through a selectively permeable membrane to a region of low water concentration (concentrated solution).",
    tip: "Differentiate between diffusion and osmosis for full marks.",
  },
  {
    id: 4,
    question: "Why is the plasma membrane called a selectively permeable membrane?",
    answer:
      "The plasma membrane is called a selectively permeable membrane because it allows only certain substances to pass through it while preventing others. It permits the entry and exit of some materials in and out of the cell. It also prevents movement of some other materials, thus maintaining the cell's internal environment.",
  },
  {
    id: 5,
    question: "Can you name the two organelles we have studied that contain their own genetic material?",
    answer:
      "The two organelles that contain their own genetic material (DNA) are:\n1. Mitochondria\n2. Plastids (Chloroplasts)\n\nBoth of these organelles have their own DNA and ribosomes, which allows them to make some of their own proteins.",
    tip: "This is why these organelles are considered semi-autonomous.",
  },
];

function QuestionCard({ q, index }: { q: (typeof questions)[number]; index: number }) {
  const [open, setOpen] = useState(index === 0);

  return (
    <div
      className={`overflow-hidden rounded-xl border transition-all ${
        open ? "border-emerald-200 bg-white shadow-md shadow-emerald-500/5" : "border-gray-200 bg-white shadow-sm"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-start gap-4 p-5 text-left"
      >
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
            open
              ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          Q{index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-sm leading-relaxed ${open ? "font-bold text-heading" : "font-medium text-text-muted"}`}>
            {q.question}
          </p>
        </div>
        {open ? (
          <ChevronUp className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
        ) : (
          <ChevronDown className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
        )}
      </button>

      {open && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-600">
              <Check className="h-3 w-3" />
              Answer
            </div>
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{q.answer}</p>
          {q.tip && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-xs leading-relaxed text-amber-800">{q.tip}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DemoNCERTSolutionPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-text-muted">
        <Link href="/demo" className="hover:text-primary">Demo</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-heading">NCERT Solutions</span>
      </div>

      <div className="mb-6 flex flex-col gap-3">
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-600">
          <Sparkles className="h-3.5 w-3.5" />
          Demo Preview
        </div>
        <h1 className="text-3xl font-black tracking-tight text-heading sm:text-4xl">NCERT Solutions</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
          Detailed, step-by-step NCERT solutions with exam tips and key insights for every question.
        </p>
      </div>

      {/* Chapter info card */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="flex items-center gap-4 p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20">
            <BookMarked className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-lg font-black text-heading">The Fundamental Unit of Life</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 shadow-sm">
                Class 9
              </span>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 shadow-sm">
                Biology
              </span>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 shadow-sm">
                Chapter 5
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                {questions.length} Questions
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="flex flex-col gap-3">
        {questions.map((q, i) => (
          <QuestionCard key={q.id} q={q} index={i} />
        ))}
      </div>

      {/* CTA */}
      <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 p-8 text-center text-white shadow-lg shadow-emerald-500/20">
        <BookMarked className="h-8 w-8 opacity-70" />
        <h3 className="text-2xl font-black">Unlock All NCERT Solutions</h3>
        <p className="max-w-lg text-sm text-white/70">
          Get detailed solutions with exam tips for every chapter, Class 9 to 12 — all subjects.
        </p>
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-emerald-600 shadow-md transition-all hover:gap-3 hover:shadow-lg"
        >
          View Plans
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
