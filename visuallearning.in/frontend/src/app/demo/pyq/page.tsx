"use client";

import Link from "next/link";
import {
  ArrowRight,
  Award,
  ChevronRight,
  Clock,
  FileCheck2,
  Sparkles,
  Tag,
} from "lucide-react";
import { useState } from "react";

const pyqs = [
  {
    id: 1,
    year: "2024",
    question: "Differentiate between prokaryotic and eukaryotic cells.",
    marks: 3,
    type: "Short Answer",
    answer:
      "Prokaryotic cells:\n- No well-defined nucleus (nucleoid region)\n- No membrane-bound organelles\n- Smaller in size (1-10 \u00b5m)\n- Example: Bacteria\n\nEukaryotic cells:\n- Well-defined nucleus with nuclear membrane\n- Membrane-bound organelles present\n- Larger in size (10-100 \u00b5m)\n- Example: Plant and Animal cells",
  },
  {
    id: 2,
    year: "2023",
    question: "Draw a neat diagram of an animal cell and label any four organelles.",
    marks: 5,
    type: "Long Answer",
    answer:
      "A labelled diagram of an animal cell should include:\n1. Cell membrane — outer boundary\n2. Nucleus — contains genetic material\n3. Mitochondria — energy production (ATP)\n4. Endoplasmic Reticulum — protein & lipid synthesis\n5. Golgi Apparatus — packaging and secretion\n6. Lysosomes — digestive enzymes\n7. Ribosomes — protein synthesis\n8. Cytoplasm — gel-like substance filling the cell",
  },
  {
    id: 3,
    year: "2023",
    question: "What would happen if the plasma membrane ruptures or breaks down?",
    marks: 2,
    type: "Short Answer",
    answer:
      "If the plasma membrane ruptures or breaks down, the cell will not be able to exchange material from its surroundings by diffusion or osmosis. The protoplasmic material will disappear and the cell will die. The cell would not be able to maintain homeostasis.",
  },
  {
    id: 4,
    year: "2022",
    question: "Name the cell organelle which is known as the \u2018powerhouse of the cell\u2019. Why is it called so?",
    marks: 2,
    type: "Short Answer",
    answer:
      "Mitochondria is known as the powerhouse of the cell. It is called so because it releases energy in the form of ATP (Adenosine Triphosphate) molecules during cellular respiration. ATP is the energy currency of the cell which is used for various metabolic activities.",
  },
  {
    id: 5,
    year: "2022",
    question: "Explain the structure and function of the Golgi apparatus.",
    marks: 3,
    type: "Short Answer",
    answer:
      "Structure: The Golgi apparatus consists of a system of membrane-bound, fluid-filled vesicles arranged approximately parallel to each other in stacks (cisternae) along with some large and spherical vacuoles.\n\nFunctions:\n1. Packaging of materials for storage or secretion\n2. Formation of lysosomes\n3. Modification of proteins synthesised by ribosomes\n4. Synthesis of simple sugars from certain compounds",
  },
];

const yearFilters = ["All", "2024", "2023", "2022"];

function MarksTag({ marks }: { marks: number }) {
  const color =
    marks >= 5
      ? "bg-violet-50 text-violet-600 border-violet-200"
      : marks >= 3
        ? "bg-amber-50 text-amber-600 border-amber-200"
        : "bg-sky-50 text-sky-600 border-sky-200";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black ${color}`}>
      <Award className="h-3 w-3" />
      {marks} Marks
    </span>
  );
}

export default function DemoPYQPage() {
  const [activeYear, setActiveYear] = useState("All");
  const [openId, setOpenId] = useState<number | null>(1);

  const filtered = activeYear === "All" ? pyqs : pyqs.filter((q) => q.year === activeYear);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-text-muted">
        <Link href="/demo" className="hover:text-primary">Demo</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-heading">PYQ Solutions</span>
      </div>

      <div className="mb-6 flex flex-col gap-3">
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-rose-500/10 to-orange-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-rose-600">
          <Sparkles className="h-3.5 w-3.5" />
          Demo Preview
        </div>
        <h1 className="text-3xl font-black tracking-tight text-heading sm:text-4xl">
          Previous Year Questions (PYQs)
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
          Solved board exam questions with detailed answers — organized by year, marks, and type.
        </p>
      </div>

      {/* Chapter info */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-orange-50">
        <div className="flex items-center gap-4 p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/20">
            <FileCheck2 className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-lg font-black text-heading">The Fundamental Unit of Life — PYQs</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-rose-600 shadow-sm">
                Class 9 Biology
              </span>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-rose-600 shadow-sm">
                CBSE Board
              </span>
              <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-700">
                {pyqs.length} Questions
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Year filters */}
      <div className="mb-5 flex items-center gap-2">
        <Clock className="h-4 w-4 text-text-muted" />
        {yearFilters.map((yr) => (
          <button
            key={yr}
            onClick={() => setActiveYear(yr)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeYear === yr
                ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                : "bg-gray-100 text-text-muted hover:bg-gray-200"
            }`}
          >
            {yr}
          </button>
        ))}
      </div>

      {/* Questions list */}
      <div className="flex flex-col gap-3">
        {filtered.map((q, i) => (
          <div
            key={q.id}
            className={`overflow-hidden rounded-xl border transition-all ${
              openId === q.id
                ? "border-rose-200 bg-white shadow-md shadow-rose-500/5"
                : "border-gray-200 bg-white shadow-sm"
            }`}
          >
            <button
              onClick={() => setOpenId(openId === q.id ? null : q.id)}
              className="flex w-full items-start gap-4 p-5 text-left"
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                  openId === q.id
                    ? "bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                Q{i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm leading-relaxed ${openId === q.id ? "font-bold text-heading" : "font-medium text-text-muted"}`}>
                  {q.question}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <MarksTag marks={q.marks} />
                  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                    <Tag className="h-3 w-3" />
                    {q.type}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                    {q.year}
                  </span>
                </div>
              </div>
            </button>

            {openId === q.id && (
              <div className="border-t border-gray-100 px-5 pb-5 pt-4">
                <div className="mb-2 flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-600 w-fit">
                  <FileCheck2 className="h-3 w-3" />
                  Solution
                </div>
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{q.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-r from-rose-600 via-orange-600 to-amber-500 p-8 text-center text-white shadow-lg shadow-rose-500/20">
        <FileCheck2 className="h-8 w-8 opacity-70" />
        <h3 className="text-2xl font-black">Unlock All PYQ Solutions</h3>
        <p className="max-w-lg text-sm text-white/70">
          Access year-wise solved papers for every chapter with marking schemes and exam tips.
        </p>
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-rose-600 shadow-md transition-all hover:gap-3 hover:shadow-lg"
        >
          View Plans
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
