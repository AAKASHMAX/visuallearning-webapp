"use client";

import { useState } from "react";
import { Linkedin } from "lucide-react";

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
  return <article className="founder-card">
    <div className="founder-photo">{imgOk ? <img src={f.photo} alt={f.name} loading="lazy" width="300" height="300" onError={() => setImgOk(false)} /> : <span className="founder-initials">{initials(f.name)}</span>}</div>
    <div className="founder-info"><span>{f.role}</span><h3>{f.name}</h3><p>{f.credentials}</p><a href={f.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin size={12}/> Say hello on LinkedIn</a></div>
  </article>;
}
export function AboutSection() {
  return <section id="about" className="home-about"><div className="home-wrap home-section">
    <div className="about-intro"><div><p className="home-eyebrow">BUILT BY CURIOUS MINDS</p><h2>It started with<br/><em>a different perspective.</em></h2></div><p>Visual Learning began with a simple idea: difficult concepts become easier when you can see them. From our first YouTube lessons to a complete learning platform, that belief still shapes everything we create. We’re engineers, researchers, and educators helping the next generation see what’s possible.</p></div>
    <div className="about-founders">{FOUNDERS.map(f => <FounderCard key={f.name} f={f}/>)}</div>
  </div></section>;
}
