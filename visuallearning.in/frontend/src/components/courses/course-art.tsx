"use client";

import { useId } from "react";

/**
 * Animated illustrations for the course pages, in the homepage's style: one
 * emblem per subject (a prism, a water molecule, DNA) and one picture per
 * content type. Colour comes from the --cx-accent CSS variable.
 */

export type SubjectKind = "physics" | "chemistry" | "biology" | "math" | "other";

export function subjectKind(name: string): SubjectKind {
  const n = name.toLowerCase();
  if (n.includes("phys")) return "physics";
  if (n.includes("chem")) return "chemistry";
  if (n.includes("bio")) return "biology";
  if (n.includes("math")) return "math";
  return "other";
}

/** Formula strings are static, trusted HTML (sub/sup only). */
export const SUBJECT_THEME: Record<SubjectKind, { accent: string; tagline: string; formula: string }> = {
  physics: { accent: "#00d4ff", tagline: "The rules of everything.", formula: "F = m a" },
  chemistry: { accent: "#f59e0b", tagline: "Small things. Big reactions.", formula: "2H<sub>2</sub> + O<sub>2</sub> → 2H<sub>2</sub>O" },
  biology: { accent: "#10b981", tagline: "A world within you.", formula: "6CO<sub>2</sub> + 6H<sub>2</sub>O → C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6O<sub>2</sub>" },
  math: { accent: "#a78bfa", tagline: "The patterns behind everything.", formula: "a<sup>2</sup> + b<sup>2</sup> = c<sup>2</sup>" },
  other: { accent: "#38bdf8", tagline: "Big ideas, made clear.", formula: "" },
};

const RAINBOW = ["#ff453a", "#ff9f0a", "#ffd60a", "#30d158", "#0a84ff", "#5e5ce6", "#bf5af2"];
const BASES = ["#fbbf24", "#22d3ee", "#fb7185", "#a78bfa"];

/** Points on a vertical double helix, for the DNA emblem. */
const HELIX = (() => {
  const strand = (phase: number) => {
    let d = "";
    for (let y = -90; y <= 290; y += 4) d += `${y === -90 ? "M" : "L"}${(120 + 46 * Math.sin((y / 80) * Math.PI * 2 + phase)).toFixed(1)} ${y} `;
    return d;
  };
  const rungs = [];
  for (let y = -85, k = 0; y < 290; y += 10, k++) {
    const x = 46 * Math.sin((y / 80) * Math.PI * 2);
    rungs.push({ y, x1: 120 + x, x2: 120 - x, color: BASES[k % 4], depth: Math.cos((y / 80) * Math.PI * 2) });
  }
  return { a: strand(0), b: strand(Math.PI), rungs };
})();

/* ---------------------------------------------------------------- subjects */

export function SubjectEmblem({ kind, className = "" }: { kind: SubjectKind; className?: string }) {
  const id = useId().replace(/:/g, "");
  if (kind === "physics") {
    return (
      <svg viewBox="0 0 240 200" className={`cx-emblem cx-emblem-physics ${className}`} aria-hidden="true">
        <defs>
          <linearGradient id={`${id}glass`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.03" />
          </linearGradient>
          <radialGradient id={`${id}spark`}>
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <line x1="6" y1="122" x2="92" y2="104" className="cx-beam" />
        <polygon points="120,44 68,150 172,150" fill={`url(#${id}glass)`} className="cx-prism" />
        <line x1="92" y1="104" x2="150" y2="108" className="cx-beam-inner" />
        {RAINBOW.map((c, k) => (
          <line key={c} x1="150" y1="108" x2="238" y2={112 + k * 9} stroke={c} className="cx-ray" style={{ animationDelay: `${k * 0.12}s` }} />
        ))}
        <circle cx="92" cy="104" r="12" fill={`url(#${id}spark)`} className="cx-pulse" />
      </svg>
    );
  }
  if (kind === "chemistry") {
    return (
      <svg viewBox="0 0 240 200" className={`cx-emblem cx-emblem-chemistry ${className}`} aria-hidden="true">
        <defs>
          <radialGradient id={`${id}o`} cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#ffb39e" />
            <stop offset="0.45" stopColor="#e5553a" />
            <stop offset="1" stopColor="#7c2213" />
          </radialGradient>
          <radialGradient id={`${id}h`} cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.6" stopColor="#e7e0d4" />
            <stop offset="1" stopColor="#a1978a" />
          </radialGradient>
          <radialGradient id={`${id}cloud`}>
            <stop offset="0" style={{ stopColor: "var(--cx-accent)" }} stopOpacity="0.35" />
            <stop offset="1" style={{ stopColor: "var(--cx-accent)" }} stopOpacity="0" />
          </radialGradient>
        </defs>
        <g className="cx-bob">
          <circle cx="120" cy="96" r="78" fill={`url(#${id}cloud)`} />
          <path d="M98 108 A30 30 0 0 0 142 108" className="cx-angle" />
          <line x1="120" y1="88" x2="72" y2="144" className="cx-bond" />
          <line x1="120" y1="88" x2="168" y2="144" className="cx-bond" />
          <circle r="3.2" className="cx-electron">
            <animateMotion dur="2.4s" repeatCount="indefinite" path="M110 100 L84 130 L110 100" />
          </circle>
          <circle r="3.2" className="cx-electron">
            <animateMotion dur="2.4s" begin="-1.2s" repeatCount="indefinite" path="M130 100 L156 130 L130 100" />
          </circle>
          <circle cx="120" cy="84" r="34" fill={`url(#${id}o)`} />
          <circle cx="72" cy="146" r="20" fill={`url(#${id}h)`} />
          <circle cx="168" cy="146" r="20" fill={`url(#${id}h)`} />
          <ellipse cx="108" cy="70" rx="9" ry="5" fill="#fff" opacity="0.55" transform="rotate(-30 108 70)" />
        </g>
      </svg>
    );
  }
  if (kind === "biology") {
    return (
      <svg viewBox="0 0 240 200" className={`cx-emblem cx-emblem-biology ${className}`} aria-hidden="true">
        <g className="cx-helix">
          {HELIX.rungs.map((r) => (
            <line key={r.y} x1={r.x1} x2={r.x2} y1={r.y} y2={r.y} stroke={r.color} strokeOpacity={0.45 + 0.4 * Math.abs(r.depth)} className="cx-rung" />
          ))}
          <path d={HELIX.a} className="cx-strand cx-strand-a" />
          <path d={HELIX.b} className="cx-strand cx-strand-b" />
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 240 200" className={`cx-emblem cx-emblem-orbit ${className}`} aria-hidden="true">
      {[0, 60, 120].map((deg, k) => (
        <g key={deg} transform={`rotate(${deg} 120 100)`}>
          <ellipse cx="120" cy="100" rx="96" ry="30" className="cx-orbit" />
          <circle r="4" className="cx-electron">
            <animateMotion dur={`${3 + k}s`} repeatCount="indefinite" path="M216 100 A96 30 0 1 1 24 100 A96 30 0 1 1 216 100" />
          </circle>
        </g>
      ))}
      <circle cx="120" cy="100" r="12" className="cx-core" />
    </svg>
  );
}

/** For a class: three orbits, one electron per science. */
export function ClassEmblem() {
  const id = useId().replace(/:/g, "");
  const colors = ["#00d4ff", "#f59e0b", "#10b981"];
  return (
    <svg viewBox="0 0 240 200" className="cx-emblem cx-emblem-class" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}core`}>
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.4" stopColor="#a78bfa" stopOpacity="0.7" />
          <stop offset="1" stopColor="#a78bfa" stopOpacity="0" />
        </radialGradient>
      </defs>
      {colors.map((color, k) => (
        <g key={color} transform={`rotate(${k * 60} 120 100)`}>
          <ellipse cx="120" cy="100" rx="100" ry="30" className="cx-orbit" style={{ stroke: `${color}66` }} />
          <circle r="5" fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
            <animateMotion dur={`${3.4 + k * 0.9}s`} begin={`${-k}s`} repeatCount="indefinite" path="M220 100 A100 30 0 1 1 20 100 A100 30 0 1 1 220 100" />
          </circle>
        </g>
      ))}
      <circle cx="120" cy="100" r="30" fill={`url(#${id}core)`} className="cx-pulse" />
    </svg>
  );
}

/* ------------------------------------------------------------ content types */

const STARS: [number, number, number][] = [
  [24, 30, 1.4], [60, 160, 1.1], [92, 22, 1], [140, 178, 1.3], [210, 30, 1.2], [262, 166, 1], [300, 48, 1.4], [284, 120, 1],
  [40, 104, 1], [180, 14, 1], [232, 186, 1.2], [16, 180, 1], [120, 60, 0.8], [204, 140, 0.9],
];

function ArtAnimation() {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 320 200" className="cx-art cx-art-animation" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}core`}>
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.35" style={{ stopColor: "var(--cx-accent)" }} stopOpacity="0.55" />
          <stop offset="1" style={{ stopColor: "var(--cx-accent)" }} stopOpacity="0" />
        </radialGradient>
      </defs>
      {STARS.map(([x, y, r], k) => (
        <circle key={k} cx={x} cy={y} r={r} className="cx-star" style={{ animationDelay: `${(k % 5) * 0.6}s` }} />
      ))}
      {[-14, 22].map((deg, k) => (
        <g key={deg} transform={`rotate(${deg} 160 100)`}>
          <ellipse cx="160" cy="100" rx={k ? 92 : 126} ry={k ? 54 : 34} className="cx-orbit" />
          <circle r="4" className="cx-electron">
            <animateMotion dur={k ? "4.2s" : "5.6s"} repeatCount="indefinite" path={k ? "M252 100 A92 54 0 1 1 68 100 A92 54 0 1 1 252 100" : "M286 100 A126 34 0 1 1 34 100 A126 34 0 1 1 286 100"} />
          </circle>
        </g>
      ))}
      <circle cx="160" cy="100" r="58" fill={`url(#${id}core)`} className="cx-pulse" />
      <path d="M150 80 L180 100 L150 120 Z" className="cx-play" />
    </svg>
  );
}

function ArtNotes() {
  const lines: [number, number][] = [[80, 150], [80, 166], [80, 140], [80, 158], [80, 124]];
  return (
    <svg viewBox="0 0 240 140" className="cx-art cx-art-notes" aria-hidden="true">
      <rect x="76" y="20" width="108" height="106" rx="10" className="cx-sheet cx-sheet-back" transform="rotate(-8 130 73)" />
      <rect x="64" y="16" width="112" height="110" rx="10" className="cx-sheet" />
      <rect x="76" y="66" width="70" height="10" rx="3" className="cx-highlight" />
      {lines.map(([x1, x2], k) => (
        <line key={k} x1={x1} x2={x2} y1={36 + k * 17} y2={36 + k * 17} className="cx-write" style={{ animationDelay: `${k * 0.35}s` }} />
      ))}
      <path d="M150 104 q8 -14 16 0 t16 0" className="cx-doodle" />
    </svg>
  );
}

function ArtNcert() {
  return (
    <svg viewBox="0 0 240 140" className="cx-art cx-art-ncert" aria-hidden="true">
      <path d="M120 30 C100 22 74 22 52 28 L52 116 C74 110 100 110 120 118 Z" className="cx-page" />
      <path d="M120 30 C140 22 166 22 188 28 L188 116 C166 110 140 110 120 118 Z" className="cx-page" />
      <line x1="120" y1="30" x2="120" y2="118" className="cx-spine" />
      {[46, 62, 78, 94].map((y) => (
        <line key={y} x1="64" x2="108" y1={y} y2={y - 2} className="cx-faint" />
      ))}
      {[48, 72, 96].map((y, k) => (
        <g key={y}>
          <circle cx="138" cy={y} r="7" className="cx-check-ring" />
          <path d={`M134.5 ${y} l2.5 2.6 l5 -5.2`} className="cx-check" style={{ animationDelay: `${k * 0.55}s` }} />
          <line x1="152" x2="178" y1={y} y2={y} className="cx-faint" />
        </g>
      ))}
    </svg>
  );
}

function ArtImportant() {
  return (
    <svg viewBox="0 0 240 140" className="cx-art cx-art-important" aria-hidden="true">
      <rect x="84" y="26" width="92" height="100" rx="12" className="cx-sheet cx-sheet-back" transform="rotate(9 130 76)" />
      <rect x="70" y="20" width="96" height="104" rx="12" className="cx-sheet" />
      <path d="M104 56 q0 -16 16 -16 q16 0 16 14 q0 9 -10 14 q-6 3 -6 11" className="cx-question" />
      <circle cx="120" cy="96" r="3.6" className="cx-question-dot" />
      <path d="M164 20 l5 10 l11 1.6 l-8 7.8 l1.9 11 l-9.9 -5.2 l-9.9 5.2 l1.9 -11 l-8 -7.8 l11 -1.6 Z" className="cx-star-badge" />
    </svg>
  );
}

function ArtPyq() {
  const years = ["2023", "2024", "2025"]; // drawn back to front: the newest paper is on top
  return (
    <svg viewBox="0 0 240 140" className="cx-art cx-art-pyq" aria-hidden="true">
      {years.map((year, k) => (
        <g key={year} transform={`translate(${52 + k * 16} ${8 + k * 22})`} className="cx-paper" style={{ animationDelay: `${(2 - k) * 0.6}s` }}>
          <rect width="104" height="78" rx="10" className="cx-sheet" />
          <rect x="10" y="10" width="44" height="16" rx="8" className="cx-year-tab" />
          <text x="32" y="22" textAnchor="middle" className="cx-year">{year}</text>
          <line x1="12" x2="88" y1="40" y2="40" className="cx-faint" />
          <line x1="12" x2="76" y1="54" y2="54" className="cx-faint" />
        </g>
      ))}
    </svg>
  );
}

function ArtQuiz() {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 240 140" className="cx-art cx-art-quiz" aria-hidden="true">
      <circle cx="88" cy="70" r={r} className="cx-ring-track" />
      <circle cx="88" cy="70" r={r} className="cx-ring" style={{ strokeDasharray: `${c} ${c}`, ["--cx-ring" as string]: `${c}` }} transform="rotate(-90 88 70)" />
      <path d="M78 70 l7 7 l13 -14" className="cx-check cx-ring-check" />
      {["A", "B", "C", "D"].map((letter, k) => (
        <g key={letter} transform={`translate(150 ${26 + k * 24})`} className={k === 1 ? "cx-option is-right" : "cx-option"}>
          <circle cx="0" cy="0" r="8.5" />
          <text x="0" y="3.4" textAnchor="middle">{letter}</text>
          <line x1="16" x2={52 - k * 6} y1="0" y2="0" className="cx-faint" />
        </g>
      ))}
    </svg>
  );
}

function ArtPpt() {
  const bars = [30, 46, 38, 58];
  return (
    <svg viewBox="0 0 240 140" className="cx-art cx-art-ppt" aria-hidden="true">
      <rect x="54" y="12" width="132" height="84" rx="9" className="cx-sheet" />
      <line x1="68" x2="124" y1="28" y2="28" className="cx-title-line" />
      {bars.map((h, k) => (
        <rect key={k} x={72 + k * 16} y={86 - h} width="10" height={h} rx="2" className="cx-bar" style={{ animationDelay: `${k * 0.15}s` }} />
      ))}
      <line x1="140" x2="172" y1="46" y2="46" className="cx-faint" />
      <line x1="140" x2="166" y1="60" y2="60" className="cx-faint" />
      <line x1="140" x2="170" y1="74" y2="74" className="cx-faint" />
      {[0, 1, 2].map((k) => (
        <rect key={k} x={60 + k * 44} y="106" width="34" height="22" rx="4" className="cx-thumb" style={{ animationDelay: `${k * 1}s` }} />
      ))}
    </svg>
  );
}

export function ContentArt({ slug }: { slug: string }) {
  switch (slug) {
    case "animation":
      return <ArtAnimation />;
    case "ppt":
      return <ArtPpt />;
    case "notes":
      return <ArtNotes />;
    case "ncert":
      return <ArtNcert />;
    case "pyq":
      return <ArtPyq />;
    case "important":
      return <ArtImportant />;
    default:
      return <ArtQuiz />;
  }
}
