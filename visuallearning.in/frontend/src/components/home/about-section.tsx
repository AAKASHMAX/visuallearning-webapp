"use client";

import { useState } from "react";
import { Linkedin, Sparkles } from "lucide-react";

// ── Founders ──────────────────────────────────────────────────────────────────
// Partners in Visual Learning AI Pvt. Ltd. Drop each photo at the given path
// under /public to show it; until then a clean initials avatar is used.
type Founder = {
  name: string;
  role: string;
  credentials: string;
  photo: string;
  linkedin: string;
};

const FOUNDERS: Founder[] = [
  {
    name: "Aakash Chauhan",
    role: "Founder",
    credentials: "Automation Engineer · B.Tech, MDU",
    photo: "/images/founder-aakash.jpg",
    linkedin: "https://www.linkedin.com/in/aakash-chauhan-4544b978/",
  },
  {
    name: "Dr. Raj Dandekar",
    role: "Co-founder",
    credentials: "PhD, MIT · B.Tech, IIT Madras",
    photo: "/images/founder-raj.png",
    linkedin: "https://www.linkedin.com/in/raj-abhijit-dandekar-67a33118a/",
  },
  {
    name: "Dr. Rajat Dandekar",
    role: "Co-founder",
    credentials: "PhD, Purdue · B.Tech, IIT Madras",
    photo: "/images/founder-rajat.png",
    linkedin: "https://www.linkedin.com/in/rajat-dandekar-901324b1/",
  },
  {
    name: "Dr. Sreedath Panat",
    role: "Co-founder",
    credentials: "PhD, MIT · B.Tech, IIT Madras",
    photo: "/images/founder-sreedath.png",
    linkedin: "https://www.linkedin.com/in/sreedath-panat/",
  },
];
// ──────────────────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.replace(/^Dr\.\s*/, "").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function FounderCard({ f }: { f: Founder }) {
  const [imgOk, setImgOk] = useState(true);
  return (
    <div className="rounded-2xl bg-white border border-gray-100 card-shadow p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      {/* Photo with gradient ring */}
      <div className="mx-auto w-24 h-24 rounded-full p-[3px] bg-gradient-to-br from-[#05BFDB] to-primary">
        <div className="w-full h-full rounded-full overflow-hidden bg-surface flex items-center justify-center">
          {imgOk ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={f.photo} alt={f.name} className="w-full h-full object-cover" onError={() => setImgOk(false)} />
          ) : (
            <span className="text-2xl font-extrabold gradient-text">{initials(f.name)}</span>
          )}
        </div>
      </div>

      <h3 className="mt-4 text-lg font-extrabold text-heading">{f.name}</h3>
      <p className="mt-0.5 text-sm font-semibold text-cta">{f.role}</p>
      <p className="mt-1 text-xs text-text-muted leading-relaxed">{f.credentials}</p>

      <a
        href={f.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-heading transition-all hover:border-[#0A66C2] hover:text-[#0A66C2]"
      >
        <Linkedin className="h-4 w-4" /> LinkedIn
      </a>
    </div>
  );
}

export function AboutSection() {
  return (
    <section id="about" className="py-16 sm:py-20 bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-5">
            <Sparkles className="w-4 h-4 text-cta" />
            <span className="text-sm text-text-muted">About Us</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-heading mb-4">
            Learning you can actually <span className="gradient-text">see</span>
          </h2>
          <p className="text-base sm:text-lg text-text-muted leading-relaxed">
            Visual Learning began as a YouTube channel with one idea &mdash; make tough concepts
            simple by letting students <em>see</em> them in 3D. That grew into a community of
            <span className="font-semibold text-heading"> 3,00,000+ learners</span>. Today, as
            <span className="font-semibold text-heading"> Visual Learning AI Pvt. Ltd.</span>, we
            bring that same visual teaching into full courses for Class 9&ndash;12 boards, JEE &amp;
            NEET &mdash; animated videos, visual notes, NCERT &amp; PYQ solutions and exam-focused
            practice, all in one place.
          </p>
        </div>

        {/* Founders */}
        <div className="mt-12">
          <h3 className="text-center text-sm font-semibold uppercase tracking-wide text-text-muted mb-6">
            Meet the founders
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {FOUNDERS.map((f) => (
              <FounderCard key={f.name} f={f} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
