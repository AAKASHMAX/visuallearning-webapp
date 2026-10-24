import { useId } from "react";

export function ScienceArt({ kind = "atom", className = "" }: { kind?: "atom" | "molecule" | "dna"; className?: string }) {
  const id = useId().replace(/:/g, "");
  return <svg viewBox="0 0 360 250" className={className} aria-hidden="true" fill="none">
    <defs>
      <radialGradient id={`${id}-sphere`} cx=".3" cy=".25" r=".8"><stop stopColor="#cffafe"/><stop offset=".4" stopColor="#22d3ee"/><stop offset="1" stopColor="#0e7490"/></radialGradient>
      <radialGradient id={`${id}-pink`} cx=".3" cy=".2"><stop stopColor="#ede9fe"/><stop offset=".45" stopColor="#a78bfa"/><stop offset="1" stopColor="#6d28d9"/></radialGradient>
      <linearGradient id={`${id}-line`}><stop stopColor="#22d3ee" stopOpacity=".25"/><stop offset=".5" stopColor="#38bdf8"/><stop offset="1" stopColor="#22d3ee" stopOpacity=".25"/></linearGradient>
    </defs>
    <g opacity=".25" stroke="#3b4280" strokeWidth=".5"><path d="M20 210H340M20 170H340M20 130H340M20 90H340M20 50H340M60 25V225M120 25V225M180 25V225M240 25V225M300 25V225"/></g>
    {kind === "atom" ? <g transform="translate(180 125)">
      {[0, 60, 120].map(a => <ellipse key={a} rx="117" ry="43" transform={`rotate(${a})`} stroke={`url(#${id}-line)`} strokeWidth="1.6"/>)}
      <circle r="32" fill={`url(#${id}-sphere)`}/><circle cx="-10" cy="-11" r="10" fill="#ecfeff" opacity=".4"/>
      <circle cx="103" cy="20" r="10" fill={`url(#${id}-pink)`}/><circle cx="-46" cy="-92" r="9" fill={`url(#${id}-sphere)`}/><circle cx="-65" cy="77" r="8" fill={`url(#${id}-pink)`}/>
    </g> : kind === "molecule" ? <g strokeLinecap="round">
      <g stroke="#0e7490" strokeWidth="9"><path d="m92 163 87-54 87 45M179 109l6-60M92 163l-29-52M266 154l31-52M92 163l22 49"/></g>
      <g stroke="#67e8f9" strokeWidth="3"><path d="m92 159 87-54 87 45M179 109l6-60M92 163l-29-52M266 154l31-52"/></g>
      {[{x:92,y:163,r:31},{x:179,y:109,r:40},{x:266,y:154,r:32},{x:185,y:49,r:19},{x:63,y:111,r:18},{x:297,y:102,r:16},{x:114,y:212,r:14}].map((n,i)=><circle key={i} cx={n.x} cy={n.y} r={n.r} fill={`url(#${id}-${i%2?'pink':'sphere'})`}/>)}
    </g> : <g transform="translate(40 10)">
      <path d="M80 5c220 45-120 155 95 220M175 5C-40 60 295 160 80 225" stroke="#0891b2" strokeWidth="9" strokeLinecap="round"/>
      {Array.from({length:12},(_,i)=>{const y=12+i*18;const o=Math.cos(i/11*Math.PI*2)*49;return <g key={i}><path d={`M${128-o} ${y}H${128+o}`} stroke={i%2?"#a78bfa":"#22d3ee"} strokeWidth="5"/><circle cx={128-o} cy={y} r="6" fill={`url(#${id}-sphere)`}/><circle cx={128+o} cy={y} r="6" fill={`url(#${id}-pink)`}/></g>;})}
    </g>}
  </svg>;
}
