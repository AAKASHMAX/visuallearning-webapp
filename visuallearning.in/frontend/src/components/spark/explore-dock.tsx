"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight, Lightbulb } from "lucide-react";
import "./explore-dock.css";

/**
 * The floating "Explore courses" button. It dresses up as each scene: an
 * orbit, a prism, a lens, a metal plate, a magnet, an atom, a water molecule,
 * a flame, an element tile, a leaf, a cell, DNA, an eye, a lightbulb and
 * finally the Visual Learning colours. Each one also arrives its own way.
 */
type Variant =
  | "orbit" | "spectrum" | "focus" | "photon" | "magnet" | "atom" | "molecule" | "flame"
  | "element" | "leaf" | "cell" | "helix" | "signal" | "bulb" | "brand";

const VARIANTS: Variant[] = [
  "orbit", "spectrum", "focus", "photon", "magnet", "atom", "molecule", "flame",
  "element", "leaf", "cell", "helix", "signal", "bulb", "brand",
];

const vars = (v: Record<string, string | number>) => v as CSSProperties;

/** Two strands of a double helix and their base pairs, drawn twice for a seamless scroll. */
const HELIX = (() => {
  const width = 480;
  const wave = (phase: number) => {
    let d = "";
    for (let x = 0; x <= width; x += 4) d += `${x === 0 ? "M" : "L"}${x} ${(20 + 12 * Math.sin((x / 60) * Math.PI * 2 + phase)).toFixed(1)} `;
    return d;
  };
  const colors = ["#fbbf24", "#22d3ee", "#fb7185", "#a78bfa"];
  const rungs = [];
  for (let x = 7.5, k = 0; x < width; x += 15, k++) {
    const a = 20 + 12 * Math.sin((x / 60) * Math.PI * 2);
    rungs.push({ x, y1: a, y2: 40 - a, color: colors[k % 4] });
  }
  return { a: wave(0), b: wave(Math.PI), rungs };
})();

function Decor({ v }: { v: Variant }) {
  switch (v) {
    case "orbit":
      return <span className="xd-stars" />;
    case "spectrum":
      return (
        <>
          <i className="xd-beam" />
          <i className="xd-fan" />
        </>
      );
    case "focus":
      return (
        <svg className="xd-lens" viewBox="0 0 46 28" aria-hidden="true">
          <polyline points="0,6 16,6 38,14" />
          <polyline points="0,14 38,14" />
          <polyline points="0,22 16,22 38,14" />
          <ellipse cx="16" cy="14" rx="3.2" ry="11" />
          <circle cx="38" cy="14" r="2.4">
            <animate attributeName="r" values="2;3.6;2" dur="1.6s" repeatCount="indefinite" />
          </circle>
        </svg>
      );
    case "photon":
      return (
        <>
          {[0, 1, 2].map((i) => <i key={`p${i}`} className="xd-photon" style={vars({ "--i": i })} />)}
          {[0, 1, 2].map((i) => <i key={`e${i}`} className="xd-electron" style={vars({ "--i": i })} />)}
        </>
      );
    case "magnet":
      return (
        <>
          <b className="xd-pole xd-s">S</b>
          <b className="xd-pole xd-n">N</b>
          <svg className="xd-field" viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true">
            {["M192 38 C170 -4 30 -4 8 38", "M196 42 C176 -22 24 -22 4 42", "M192 62 C170 104 30 104 8 62", "M196 58 C176 122 24 122 4 58"].map((d) => (
              <path key={d} d={d} vectorEffect="non-scaling-stroke" />
            ))}
          </svg>
        </>
      );
    case "atom":
      return (
        <svg className="xd-orbits" viewBox="-130 -40 260 80" aria-hidden="true">
          {[0, 9, -9].map((deg, k) => (
            <g key={deg} transform={`rotate(${deg})`}>
              <ellipse rx="122" ry="21" />
              <circle r="3.2">
                <animateMotion dur={`${2.2 + k * 0.5}s`} begin={`${-k * 0.7}s`} repeatCount="indefinite" path="M122 0 A122 21 0 1 1 -122 0 A122 21 0 1 1 122 0" />
              </circle>
            </g>
          ))}
        </svg>
      );
    case "molecule":
      return (
        <>
          <i className="xd-h xd-h1">H</i>
          <i className="xd-h xd-h2">H</i>
        </>
      );
    case "flame":
      return (
        <>
          {[0, 1, 2, 3, 4].map((i) => <i key={i} className="xd-ember" style={vars({ "--i": i })} />)}
          <i className="xd-burner" />
        </>
      );
    case "element":
      return (
        <span className="xd-tile">
          <small>119</small>
          <b>Ex</b>
        </span>
      );
    case "leaf":
      return (
        <>
          <i className="xd-rib" />
          <i className="xd-glint" />
        </>
      );
    case "cell":
      return (
        <>
          <i className="xd-nuc" />
          <i className="xd-mito" />
          <i className="xd-chl xd-chl1" />
          <i className="xd-chl xd-chl2" />
        </>
      );
    case "helix":
      return (
        <span className="xd-helix">
          <svg viewBox="0 0 480 40" preserveAspectRatio="none" aria-hidden="true">
            {HELIX.rungs.map((r) => <line key={r.x} x1={r.x} x2={r.x} y1={r.y1} y2={r.y2} stroke={r.color} />)}
            <path d={HELIX.a} className="xd-strand-a" />
            <path d={HELIX.b} className="xd-strand-b" />
          </svg>
        </span>
      );
    case "signal":
      return (
        <>
          <span className="xd-iris">
            <i />
          </span>
          <i className="xd-impulse" />
        </>
      );
    case "bulb":
      return <Lightbulb className="xd-bulb" size={17} aria-hidden="true" />;
    case "brand":
      // eslint-disable-next-line @next/next/no-img-element
      return <img className="xd-logo" src="/images/logo2.png" alt="" width={22} height={22} />;
  }
}

function Face({ v }: { v: Variant }) {
  return (
    <>
      <Decor v={v} />
      <span className="sj-x-label">
        Explore courses
        {v === "element" && <small>№ 119 · your next element</small>}
      </span>
      <ArrowUpRight className="sj-x-arrow" size={16} aria-hidden="true" />
    </>
  );
}

export function ExploreDock({ beat }: { beat: number }) {
  const variant = VARIANTS[beat] ?? "orbit";
  const [shown, setShown] = useState<Variant>(variant);
  const [leaving, setLeaving] = useState<Variant | null>(null);
  const previous = useRef<Variant>(variant);

  useEffect(() => {
    if (variant === previous.current) return;
    setLeaving(previous.current);
    setShown(variant);
    previous.current = variant;
    const t = window.setTimeout(() => setLeaving(null), 420);
    return () => window.clearTimeout(t);
  }, [variant]);

  return (
    <div className="sj-dock">
      {leaving && leaving !== shown && (
        <span className={`sj-x sj-x-${leaving} is-leaving`} aria-hidden="true">
          <Face v={leaving} />
        </span>
      )}
      <Link key={shown} href="/courses" className={`sj-x sj-x-${shown} is-entering`} aria-label="Explore courses">
        <Face v={shown} />
      </Link>
    </div>
  );
}
