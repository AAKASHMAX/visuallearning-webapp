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
  youtubeId: string;
};

// Real lecture videos (Hindi) from Class 12 Physics — Chapter 1:
// Electric Charges and Fields.
const videos: DemoVideo[] = [
  { title: "Electric charges", klass: "Class 12", subject: "Physics", chapter: "Electric Charges and Fields", youtubeId: "Tz7pAZnIbkQ" },
  { title: "Conservation of charge", klass: "Class 12", subject: "Physics", chapter: "Electric Charges and Fields", youtubeId: "eNAwS4QTNm8" },
  { title: "Coulomb's law", klass: "Class 12", subject: "Physics", chapter: "Electric Charges and Fields", youtubeId: "eNAwS4QTNm8" },
  { title: "Coulomb's law in vector form", klass: "Class 12", subject: "Physics", chapter: "Electric Charges and Fields", youtubeId: "7JYzcnugWug" },
  { title: "Superposition principle", klass: "Class 12", subject: "Physics", chapter: "Electric Charges and Fields", youtubeId: "7JYzcnugWug" },
  { title: "Electric field & Electric field lines", klass: "Class 12", subject: "Physics", chapter: "Electric Charges and Fields", youtubeId: "xgfdxMwwlcE" },
  { title: "Electric dipole", klass: "Class 12", subject: "Physics", chapter: "Electric Charges and Fields", youtubeId: "7Tg4_OSftOs" },
  { title: "Torque on a dipole", klass: "Class 12", subject: "Physics", chapter: "Electric Charges and Fields", youtubeId: "GpA0olo-HFc" },
  { title: "Electric flux", klass: "Class 12", subject: "Physics", chapter: "Electric Charges and Fields", youtubeId: "EmmoUy_Uj0A" },
  { title: "Gauss's theorem", klass: "Class 12", subject: "Physics", chapter: "Electric Charges and Fields", youtubeId: "EmmoUy_Uj0A" },
  { title: "Field due to an infinitely long straight wire", klass: "Class 12", subject: "Physics", chapter: "Electric Charges and Fields", youtubeId: "EmmoUy_Uj0A" },
  { title: "Uniformly charged infinite plane sheet", klass: "Class 12", subject: "Physics", chapter: "Electric Charges and Fields", youtubeId: "EmmoUy_Uj0A" },
  { title: "Uniformly charged thin spherical shell", klass: "Class 12", subject: "Physics", chapter: "Electric Charges and Fields", youtubeId: "EmmoUy_Uj0A" },
];

function embedUrl(youtubeId: string, autoplay: boolean) {
  const base = `https://www.youtube.com/embed/${youtubeId}`;
  const params = "rel=0&modestbranding=1&playsinline=1";
  return `${base}?${params}${autoplay ? "&autoplay=1" : ""}`;
}

export default function DemoLectureVideoPage() {
  const [activeIndex, setActiveIndex] = useState(0);
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
        <span className="font-semibold text-heading">Lecture Videos</span>
      </div>

      {/* Hero badge */}
      <div className="mb-6 flex flex-col gap-3">
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-sky-500/10 to-blue-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-sky-600">
          <Sparkles className="h-3.5 w-3.5" />
          Demo Preview
        </div>
        <h1 className="text-3xl font-black tracking-tight text-heading sm:text-4xl">
          Lecture Video Lessons
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
          Clear, exam-focused lectures that break down every concept step by step — taught by expert teachers.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Video Player Area */}
        <div className="flex-1">
          <div className="overflow-hidden rounded-2xl bg-gray-900 shadow-2xl shadow-black/20">
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                key={active.youtubeId}
                src={embedUrl(active.youtubeId, started)}
                title={active.title}
                className="absolute inset-0 h-full w-full"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                allowFullScreen
              />
            </div>
          </div>

          {/* Now playing */}
          <div className="mt-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-sky-600">
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
                Sample Lectures
              </h3>
              <p className="mt-1 text-xs text-text-muted">{videos.length} lecture videos · Hindi</p>
            </div>
            <div className="flex max-h-[60vh] flex-col divide-y divide-gray-50 overflow-y-auto">
              {videos.map((v, i) => {
                const isActive = i === activeIndex;
                return (
                  <button
                    key={`${v.youtubeId}-${i}`}
                    onClick={() => selectVideo(i)}
                    className={`flex items-center gap-3 px-5 py-3.5 text-left transition-all hover:bg-gray-50 ${
                      isActive ? "bg-sky-50/60" : ""
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                        isActive
                          ? "bg-gradient-to-br from-sky-500 to-blue-500 text-white shadow-md"
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
          <div className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-500 p-5 text-white shadow-lg shadow-sky-500/20">
            <h4 className="text-lg font-black">Unlock All Chapters</h4>
            <p className="mt-1.5 text-xs leading-relaxed text-white/70">
              Get full access to lecture videos for every chapter across Class 9-12.
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
