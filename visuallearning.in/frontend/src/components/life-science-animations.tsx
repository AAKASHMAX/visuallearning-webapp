"use client";

import { useEffect, useRef, type ReactNode } from "react";

const cyan = "#00d4ff", purple = "#a78bfa", amber = "#fbbf24";

function Scene({ children }: { children: ReactNode }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => motion.matches || document.hidden ? svg.pauseAnimations?.() : svg.unpauseAnimations?.();
    sync();
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => { motion.removeEventListener("change", sync); document.removeEventListener("visibilitychange", sync); };
  }, []);
  return <svg ref={ref} viewBox="0 0 200 112" width="100%" height="100%" fill="none" aria-hidden="true">
    <ellipse cx="100" cy="56" rx="78" ry="44" stroke={cyan} strokeOpacity=".07" />{children}
  </svg>;
}

export function CellAnimation() {
  return <Scene><g>
    <animateTransform attributeName="transform" type="rotate" values="-4 100 56;4 100 56;-4 100 56" dur="7s" repeatCount="indefinite" />
    <ellipse cx="100" cy="56" rx="53" ry="35" fill={cyan} fillOpacity=".08" stroke={cyan} strokeWidth="1.5" />
    <ellipse cx="100" cy="56" rx="48" ry="30" stroke={cyan} strokeOpacity=".28" />
    <circle cx="92" cy="53" r="15" fill={purple} fillOpacity=".35" stroke={purple} />
    <circle cx="94" cy="53" r="6" fill={purple}><animate attributeName="opacity" values=".6;1;.6" dur="3s" repeatCount="indefinite" /></circle>
    <path d="M114 39q10-10 20-2t-5 12-15-10ZM69 68q11-7 17 2t-10 9-7-11Z" fill={amber} fillOpacity=".23" stroke={amber} />
    <path d="m119 38 3 6 4-7 3 6M73 70l4 5 3-6" stroke={amber} strokeWidth="1.4" />
    <path d="M74 37q-12 9-3 15t-5 12M69 33q-15 11-6 20t-4 12" stroke={purple} strokeOpacity=".7" strokeWidth="2" />
    {[0, 1, 2, 3].map(i => <circle key={i} cx={111 + i * 7} cy={64 + i % 2 * 8} r="2" fill={cyan}><animate attributeName="opacity" values=".3;.9;.3" dur="3s" begin={`${i * .4}s`} repeatCount="indefinite" /></circle>)}
  </g></Scene>;
}

export function DnaAnimation() {
  return <Scene><g strokeLinecap="round">
    <animateTransform attributeName="transform" type="translate" values="0 -2;0 2;0 -2" dur="5s" repeatCount="indefinite" />
    {[30, 44, 58, 72, 86, 100, 114, 128, 142, 156, 170].map((x, i) => {
      const wave = Math.sin(i * Math.PI / 5) * 24;
      return <line key={x} x1={x} y1={56 - wave} x2={x} y2={56 + wave} stroke={i % 2 ? amber : purple} strokeWidth="2" strokeOpacity=".65" />;
    })}
    <path d="M30 56C53 23 77 23 100 56S147 89 170 56" stroke={cyan} strokeWidth="4" />
    <path d="M30 56C53 89 77 89 100 56S147 23 170 56" stroke={purple} strokeWidth="4" />
    <circle r="3" fill="#e2e8f0"><animateMotion path="M30 56C53 23 77 23 100 56S147 89 170 56" dur="4s" repeatCount="indefinite" /></circle>
  </g></Scene>;
}

export function PlantAnimation() {
  return <Scene>
    <path d="M47 91h107M98 88l-13 13m15-14 2 15m-2-14 15 11" stroke={amber} strokeOpacity=".45" strokeLinecap="round" />
    <g><animateTransform attributeName="transform" type="rotate" values="-3 100 88;3 100 88;-3 100 88" dur="5s" repeatCount="indefinite" />
      <path d="M100 88V39" stroke={cyan} strokeWidth="3" strokeLinecap="round" />
      <path d="M99 67C77 68 64 56 66 40c19 0 34 11 33 27Z" fill={cyan} fillOpacity=".18" stroke={cyan} strokeWidth="1.5" />
      <path d="M101 53c0-20 16-28 33-28-1 18-13 30-33 28Z" fill={purple} fillOpacity=".23" stroke={purple} strokeWidth="1.5" />
      <path d="m100 67-25-19m26 5 23-21" stroke={cyan} strokeOpacity=".6" />
    </g>
    <circle cx="52" cy="25" r="7" fill={amber} fillOpacity=".8" />
    <circle cx="52" cy="25" r="12" stroke={amber} strokeOpacity=".35"><animate attributeName="r" values="10;14;10" dur="4s" repeatCount="indefinite" /><animate attributeName="opacity" values=".7;.2;.7" dur="4s" repeatCount="indefinite" /></circle>
    <circle r="2" fill={cyan}><animateMotion path="M145 86Q163 62 141 47" dur="4s" repeatCount="indefinite" /><animate attributeName="opacity" values="0;1;0" dur="4s" repeatCount="indefinite" /></circle>
  </Scene>;
}

export function MoleculeAnimation() {
  return <Scene><g>
    <animateTransform attributeName="transform" type="rotate" values="-7 100 56;7 100 56;-7 100 56" dur="6s" repeatCount="indefinite" />
    {[[58, 31], [58, 82], [142, 31], [142, 82]].map(([x, y], i) => <g key={i}>
      <path d={`M100 56L${x} ${y}`} stroke={i % 2 ? purple : cyan} strokeWidth="3" strokeOpacity=".5" />
      <circle cx={x} cy={y} r="10" fill={i % 2 ? purple : amber} fillOpacity=".24" stroke={i % 2 ? purple : amber} strokeWidth="1.5" />
      <circle cx={x - 3} cy={y - 3} r="2.5" fill="#e2e8f0" fillOpacity=".65" />
    </g>)}
    <circle cx="100" cy="56" r="15" fill={cyan} fillOpacity=".22" stroke={cyan} strokeWidth="2" />
    <circle cx="100" cy="56" r="20" stroke={cyan} strokeOpacity=".15"><animate attributeName="r" values="18;23;18" dur="3s" repeatCount="indefinite" /></circle>
    <circle cx="95" cy="51" r="4" fill="#a5f3fc" />
  </g></Scene>;
}

export function ReactionAnimation() {
  return <Scene>
    <path d="M42 25v26L26 83q-2 6 5 6h42q7 0 4-6L61 51V25M38 25h27" stroke={cyan} strokeWidth="2" strokeLinejoin="round" />
    <path d="m35 69-6 13q-1 3 3 3h40q4 0 2-3l-6-13Z" fill={cyan} fillOpacity=".28" />
    <path d="M94 57h25m-7-6 7 6-7 6" stroke={amber} strokeWidth="2" strokeLinecap="round"><animate attributeName="opacity" values=".4;1;.4" dur="2s" repeatCount="indefinite" /></path>
    <path d="M145 25v26l-16 32q-2 6 5 6h42q7 0 4-6l-16-32V25m-23 0h27" stroke={purple} strokeWidth="2" strokeLinejoin="round" />
    <path d="m138 66-6 16q-1 3 3 3h40q4 0 2-3l-8-16Z" fill={purple} fillOpacity=".35" />
    {[0, 1, 2].map(i => <circle key={i} cx={148 + i * 7} cy="78" r={2 + i % 2} fill={i % 2 ? amber : purple}><animate attributeName="cy" values="79;40" dur="2.8s" begin={`${i * .7}s`} repeatCount="indefinite" /><animate attributeName="opacity" values="0;.9;0" dur="2.8s" begin={`${i * .7}s`} repeatCount="indefinite" /></circle>)}
  </Scene>;
}

export function getLifeScienceAnimation(name: string): (() => JSX.Element) | null {
  const topic = name.toLowerCase().replace(/[-_]/g, " ");
  if (/heredit|reproduc|genetic|dna|rna|evolution|biotechnology/.test(topic)) return DnaAnimation;
  if (/cell|fundamental unit|tissue|human|animal|breathing|circulation|excret|coordination|neural/.test(topic)) return CellAnimation;
  if (/plant|life process|natural resource|diversity|ecolog|ecosystem|environment|photosynth|nutrition|living world|biological classification|food resource/.test(topic)) return PlantAnimation;
  if (/reaction|acid|base\b|salts?\b|redox|electrochem|chemical kinetic|equilibri|oxidation/.test(topic)) return ReactionAnimation;
  if (/chemistry|chemical|metal|carbon|organic|molecul|atom|matter|solution|mixture|bonding|periodic|element|hydrocarbon|alcohol|phenol|ether|aldehyde|ketone|amine|haloalkane|biomolecul|polymer/.test(topic)) return MoleculeAnimation;
  return null;
}
