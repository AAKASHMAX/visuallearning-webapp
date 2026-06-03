"use client";

/* Animated mini-visuals for each physics chapter topic — bright/emissive style */

export function MotionAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Track line */}
      <div className="absolute bottom-8 left-4 right-4 h-[2px] bg-gradient-to-r from-cyan-500/20 via-cyan-400/40 to-cyan-500/20 rounded" />
      {/* Moving ball */}
      <div
        className="absolute bottom-5 w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(0,212,255,0.8),0_0_30px_rgba(0,212,255,0.3)]"
        style={{ animation: "motionBall 2s ease-in-out infinite", left: "10%" }}
      />
      {/* Trail dots */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute bottom-[26px] w-2 h-2 rounded-full bg-cyan-400/50 shadow-[0_0_6px_rgba(0,212,255,0.4)]"
          style={{ left: `${12 + i * 10}%`, animation: `motionTrail 2s ease-in-out infinite`, animationDelay: `${i * 0.12}s` }}
        />
      ))}
      {/* Velocity vector */}
      <div className="absolute top-3 right-3 text-cyan-300 text-[10px] font-mono font-bold">→ v</div>
      {/* Formula */}
      <div className="absolute bottom-2 text-[9px] font-mono text-cyan-300/70 font-semibold">s = vt</div>
    </div>
  );
}

export function ForceAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Block */}
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/30 to-orange-500/20 border border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]" style={{ animation: "forceBlock 2.5s ease-in-out infinite" }} />
      {/* Force arrow */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center" style={{ animation: "forceArrow 2.5s ease-in-out infinite" }}>
        <div className="w-8 h-[3px] bg-gradient-to-r from-amber-400 to-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.6)] rounded" />
        <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-amber-400 drop-shadow-[0_0_4px_rgba(245,158,11,0.6)]" />
      </div>
      <div className="absolute bottom-2 text-[10px] font-mono text-amber-300/80 font-bold">F = ma</div>
    </div>
  );
}

export function GravitationAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Central body (sun-like) */}
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_0_20px_rgba(245,158,11,0.6),0_0_40px_rgba(245,158,11,0.2)]" />
      {/* Orbit ring */}
      <div className="absolute inset-3 rounded-full border border-dashed border-cyan-400/30" />
      {/* Orbiting planet */}
      <div className="absolute inset-3" style={{ animation: "orbit 4s linear infinite" }}>
        <div className="absolute -top-1.5 left-1/2 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-[0_0_10px_rgba(0,212,255,0.7),0_0_20px_rgba(0,212,255,0.3)]" />
      </div>
      {/* Outer orbit */}
      <div className="absolute inset-0 rounded-full border border-cyan-500/10" />
      <div className="absolute bottom-1 text-[9px] font-mono text-cyan-300/70 font-semibold">Gm₁m₂/r²</div>
    </div>
  );
}

export function WorkEnergyAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Pivot */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-violet-500/40 border border-violet-400/50" />
      {/* Pendulum */}
      <div className="absolute top-4 left-1/2 w-[2px] h-14 bg-gradient-to-b from-violet-400/60 to-violet-300/30 origin-top rounded" style={{ animation: "pendulum 2s ease-in-out infinite" }}>
        <div className="absolute -bottom-3 -left-[7px] w-4 h-4 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 shadow-[0_0_14px_rgba(124,58,237,0.7),0_0_28px_rgba(124,58,237,0.3)]" />
      </div>
      {/* Energy labels */}
      <div className="absolute bottom-2 left-3 text-[9px] font-mono text-emerald-400/80 font-bold">KE</div>
      <div className="absolute bottom-2 right-3 text-[9px] font-mono text-amber-400/80 font-bold">PE</div>
    </div>
  );
}

export function SoundAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Speaker */}
      <div className="absolute left-5 w-4 h-7 rounded-r-sm bg-gradient-to-r from-green-500/40 to-green-400/20 border border-green-400/40 shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
      {/* Sound waves */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute rounded-full border-2 border-green-400/50 shadow-[0_0_6px_rgba(34,197,94,0.3)]"
          style={{
            width: `${22 + i * 16}px`,
            height: `${22 + i * 16}px`,
            left: `${30 + i * 6}%`,
            animation: `soundWave 1.5s ease-out infinite`,
            animationDelay: `${i * 0.25}s`,
          }}
        />
      ))}
      <div className="absolute bottom-1 text-[9px] font-mono text-green-300/70 font-semibold">v = fλ</div>
    </div>
  );
}

export function LightAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Mirror */}
      <div className="absolute right-6 top-4 bottom-6 w-[3px] bg-gradient-to-b from-sky-300/60 to-sky-400/30 rounded shadow-[0_0_8px_rgba(56,189,248,0.3)]" />
      {/* Incident ray */}
      <div className="absolute left-4 top-5 w-14 h-[2px] bg-gradient-to-r from-amber-400 to-amber-300 shadow-[0_0_6px_rgba(245,158,11,0.5)] origin-left rounded" style={{ transform: "rotate(20deg)" }}>
        <div className="absolute right-0 top-[-4px] w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-amber-400 drop-shadow-[0_0_3px_rgba(245,158,11,0.6)]" />
      </div>
      {/* Reflected ray */}
      <div className="absolute right-6 top-6 w-12 h-[2px] bg-gradient-to-r from-amber-300 to-amber-200/30 shadow-[0_0_6px_rgba(245,158,11,0.4)] origin-left rounded" style={{ transform: "rotate(-20deg)", animation: "lightReflect 2s ease-in-out infinite" }}>
        <div className="absolute right-0 top-[-4px] w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-amber-300/70" />
      </div>
      {/* Glow at reflection point */}
      <div className="absolute right-5 top-6 w-3 h-3 rounded-full bg-amber-300/50 shadow-[0_0_12px_rgba(245,158,11,0.6)]" style={{ animation: "bulbGlow 1.5s ease-in-out infinite" }} />
    </div>
  );
}

export function HumanEyeAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Eye shape */}
      <div className="w-16 h-10 rounded-[50%] border-2 border-cyan-400/50 shadow-[0_0_10px_rgba(0,212,255,0.2)] flex items-center justify-center" style={{ animation: "eyeBlink 3s ease-in-out infinite" }}>
        {/* Iris */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400/50 to-violet-500/50 shadow-[inset_0_0_8px_rgba(0,212,255,0.3)] flex items-center justify-center">
          {/* Pupil */}
          <div className="w-3.5 h-3.5 rounded-full bg-primary shadow-[0_0_6px_rgba(0,0,0,0.8)]" style={{ animation: "pupilDilate 3s ease-in-out infinite" }} />
        </div>
      </div>
      {/* Light rays entering */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 flex gap-1" style={{ animation: "lightEnter 2s linear infinite" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-3 h-[2px] bg-amber-400/60 shadow-[0_0_4px_rgba(245,158,11,0.4)] rounded" />
        ))}
      </div>
    </div>
  );
}

export function ElectricityAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Circuit path */}
      <div className="w-20 h-12 rounded-lg border-2 border-yellow-400/40 shadow-[0_0_8px_rgba(250,204,21,0.15)]" />
      {/* Flowing electrons */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-yellow-300 shadow-[0_0_8px_rgba(250,204,21,0.8),0_0_16px_rgba(250,204,21,0.3)]"
          style={{ animation: `electronFlow 2s linear infinite`, animationDelay: `${i * 0.66}s`, offsetPath: "path('M -30 0 L 30 0 L 30 -18 L -30 -18 Z')", offsetDistance: "0%" }}
        />
      ))}
      {/* Battery */}
      <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 flex gap-1">
        <div className="w-[3px] h-4 bg-green-400/70 rounded-sm shadow-[0_0_4px_rgba(34,197,94,0.4)]" />
        <div className="w-[3px] h-6 bg-green-400/70 rounded-sm shadow-[0_0_4px_rgba(34,197,94,0.4)]" />
      </div>
      {/* Bulb */}
      <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full" style={{ animation: "bulbGlow 1s ease-in-out infinite", background: "radial-gradient(circle, rgba(250,204,21,0.7), rgba(250,204,21,0.1))", boxShadow: "0 0 12px rgba(250,204,21,0.5)" }} />
      <div className="absolute bottom-1 text-[9px] font-mono text-yellow-300/80 font-bold">V = IR</div>
    </div>
  );
}

export function MagnetismAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Magnet */}
      <div className="flex h-6 rounded-lg overflow-hidden shadow-[0_0_12px_rgba(239,68,68,0.2)]">
        <div className="w-8 bg-gradient-to-r from-red-500 to-red-400 flex items-center justify-center text-[9px] font-bold text-white shadow-[inset_0_0_8px_rgba(0,0,0,0.2)]">N</div>
        <div className="w-8 bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center text-[9px] font-bold text-white shadow-[inset_0_0_8px_rgba(0,0,0,0.2)]">S</div>
      </div>
      {/* Field lines */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute rounded-full border-[1.5px] border-dashed"
          style={{
            width: `${48 + i * 18}px`,
            height: `${24 + i * 12}px`,
            borderColor: `rgba(56,189,248,${0.4 - i * 0.1})`,
            boxShadow: `0 0 6px rgba(56,189,248,${0.2 - i * 0.05})`,
            animation: `fieldLine 3s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}
    </div>
  );
}

export function UnitsAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Ruler */}
      <div className="w-20 h-3 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 rounded relative border border-cyan-400/30">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div key={i} className="absolute top-0 bg-cyan-400/60" style={{ left: `${i * 10}%`, width: "1px", height: i % 2 === 0 ? "100%" : "50%" }} />
        ))}
      </div>
      {/* Measurement value */}
      <div className="absolute top-4 flex items-center gap-1">
        <span className="text-[11px] font-mono text-violet-300 font-bold" style={{ animation: "measurePulse 2s ease-in-out infinite" }}>1.5 m/s²</span>
      </div>
      {/* Dimensional formula */}
      <div className="absolute bottom-2 text-[9px] font-mono text-cyan-300/70 font-bold">[MLT⁻²]</div>
    </div>
  );
}

export function KinematicsAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Projectile path */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 80">
        <path d="M 8 65 Q 50 0 92 65" fill="none" stroke="rgba(0,212,255,0.25)" strokeWidth="1.5" strokeDasharray="4 3" />
        {/* Glowing moving ball */}
        <circle r="4" fill="#22d3ee">
          <animateMotion dur="2.5s" repeatCount="indefinite" path="M 8 65 Q 50 0 92 65" />
        </circle>
        <circle r="7" fill="none" stroke="#22d3ee" strokeWidth="0.5" opacity="0.4">
          <animateMotion dur="2.5s" repeatCount="indefinite" path="M 8 65 Q 50 0 92 65" />
        </circle>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </svg>
      <div className="absolute bottom-1 text-[9px] font-mono text-cyan-300/70 font-semibold">s = ut + ½at²</div>
    </div>
  );
}

export function RotationalAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Spinning wheel */}
      <div className="w-16 h-16 rounded-full border-[2.5px] border-violet-400/50 shadow-[0_0_12px_rgba(124,58,237,0.2)]" style={{ animation: "spin 2s linear infinite" }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-3 h-3 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(124,58,237,0.7),0_0_20px_rgba(124,58,237,0.3)]" />
        {/* Spokes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[2px] bg-violet-400/30 rounded" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-full bg-violet-400/30 rounded" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[2px] bg-violet-400/20 rounded" style={{ transform: "rotate(45deg)" }} />
      </div>
      {/* Center hub */}
      <div className="absolute w-3 h-3 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(124,58,237,0.5)]" />
      <div className="absolute bottom-0 text-[9px] font-mono text-violet-300/70 font-bold">τ = Iα</div>
    </div>
  );
}

export function PropertiesOfMatterAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Spring being stretched */}
      <svg className="w-20 h-14" viewBox="0 0 70 40">
        <path fill="none" stroke="#22d3ee" strokeWidth="2" opacity="0.7" filter="url(#springGlow)">
          <animate attributeName="d" dur="2s" repeatCount="indefinite" values="M 5 20 L 12 8 L 19 32 L 26 8 L 33 32 L 40 8 L 47 32 L 54 8 L 61 20;M 5 20 L 14 8 L 23 32 L 32 8 L 41 32 L 50 8 L 59 32 L 65 20 L 65 20;M 5 20 L 12 8 L 19 32 L 26 8 L 33 32 L 40 8 L 47 32 L 54 8 L 61 20" />
        </path>
        <defs>
          <filter id="springGlow">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </svg>
      {/* Weight at end */}
      <div className="absolute right-3 w-3.5 h-3.5 rounded bg-cyan-400/60 shadow-[0_0_8px_rgba(0,212,255,0.4)]" style={{ animation: "forceBlock 2s ease-in-out infinite" }} />
      <div className="absolute bottom-1 text-[9px] font-mono text-cyan-300/70 font-bold">σ = Eε</div>
    </div>
  );
}

export function ThermodynamicsAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Flame - larger and brighter */}
      <div className="relative">
        <div className="w-5 h-10 rounded-t-full bg-gradient-to-t from-orange-500 via-amber-400 to-amber-300/0 shadow-[0_0_20px_rgba(245,158,11,0.5),0_-4px_16px_rgba(251,191,36,0.3)]" style={{ animation: "flame 0.5s ease-in-out infinite alternate" }} />
        <div className="absolute top-2 left-1 w-3 h-6 rounded-t-full bg-gradient-to-t from-yellow-300 via-yellow-200 to-yellow-100/0" style={{ animation: "flameInner 0.3s ease-in-out infinite alternate" }} />
      </div>
      {/* Heat waves rising */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute text-amber-400/50 text-sm font-bold"
          style={{ top: `${5 + i * 5}px`, left: `${38 + i * 7}%`, animation: `heatRise 2s ease-out infinite`, animationDelay: `${i * 0.4}s` }}
        >
          ~
        </div>
      ))}
      {/* Base */}
      <div className="absolute bottom-6 w-8 h-[3px] bg-gradient-to-r from-orange-500/30 via-orange-400/50 to-orange-500/30 rounded" />
      <div className="absolute bottom-1 text-[9px] font-mono text-amber-300/80 font-bold">ΔU = Q - W</div>
    </div>
  );
}

export function OscillationsAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Wall mount */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-gradient-to-r from-violet-400/30 via-violet-400/60 to-violet-400/30 rounded" />
      {/* Spring */}
      <svg className="absolute top-3 w-5 h-12" viewBox="0 0 12 48" style={{ left: "calc(50% - 10px)" }}>
        <path fill="none" stroke="#a78bfa" strokeWidth="1.5" opacity="0.8">
          <animate attributeName="d" dur="1.5s" repeatCount="indefinite" values="M 6 0 L 2 6 L 10 12 L 2 18 L 10 24 L 2 30 L 10 36 L 6 42;M 6 0 L 2 4 L 10 8 L 2 12 L 10 16 L 2 20 L 10 24 L 6 28;M 6 0 L 2 6 L 10 12 L 2 18 L 10 24 L 2 30 L 10 36 L 6 42" />
        </path>
      </svg>
      {/* Mass */}
      <div className="absolute w-5 h-5 rounded-md bg-gradient-to-br from-violet-400 to-purple-600 shadow-[0_0_14px_rgba(124,58,237,0.7),0_0_28px_rgba(124,58,237,0.3)]" style={{ animation: "shmBob 1.5s ease-in-out infinite", top: "42px", left: "calc(50% - 10px)" }} />
      <div className="absolute bottom-1 text-[9px] font-mono text-violet-300/70 font-bold">x = A sin(ωt)</div>
    </div>
  );
}

export function WavesAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <svg className="w-full h-16" viewBox="0 0 120 50">
        {/* Primary wave - bright cyan */}
        <path fill="none" stroke="#22d3ee" strokeWidth="2.5" opacity="0.8" filter="url(#waveGlow)">
          <animate attributeName="d" dur="2s" repeatCount="indefinite" values="M 0 25 Q 15 5 30 25 Q 45 45 60 25 Q 75 5 90 25 Q 105 45 120 25;M 0 25 Q 15 45 30 25 Q 45 5 60 25 Q 75 45 90 25 Q 105 5 120 25;M 0 25 Q 15 5 30 25 Q 45 45 60 25 Q 75 5 90 25 Q 105 45 120 25" />
        </path>
        {/* Secondary wave - violet */}
        <path fill="none" stroke="#a78bfa" strokeWidth="1.5" opacity="0.5">
          <animate attributeName="d" dur="2s" repeatCount="indefinite" values="M 0 25 Q 15 45 30 25 Q 45 5 60 25 Q 75 45 90 25 Q 105 5 120 25;M 0 25 Q 15 5 30 25 Q 45 45 60 25 Q 75 5 90 25 Q 105 45 120 25;M 0 25 Q 15 45 30 25 Q 45 5 60 25 Q 75 45 90 25 Q 105 5 120 25" />
        </path>
        <defs>
          <filter id="waveGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </svg>
      <div className="absolute bottom-0 text-[9px] font-mono text-cyan-300/70 font-bold">v = fλ</div>
    </div>
  );
}

export function ElectrostaticsAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Positive charge */}
      <div className="absolute left-5 w-7 h-7 rounded-full bg-red-500/30 border-2 border-red-400/60 flex items-center justify-center text-[11px] font-bold text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.4)]" style={{ animation: "chargeRepel 2.5s ease-in-out infinite" }}>+</div>
      {/* Negative charge */}
      <div className="absolute right-5 w-7 h-7 rounded-full bg-cyan-500/30 border-2 border-cyan-400/60 flex items-center justify-center text-[11px] font-bold text-cyan-400 shadow-[0_0_12px_rgba(0,212,255,0.4)]" style={{ animation: "chargeRepelR 2.5s ease-in-out infinite" }}>−</div>
      {/* Electric field lines */}
      {[-1, 0, 1].map((i) => (
        <div key={i} className="absolute h-[2px] bg-gradient-to-r from-red-400/50 via-purple-400/30 to-cyan-400/50 rounded shadow-[0_0_4px_rgba(168,85,247,0.3)]" style={{ width: "36px", top: `${44 + i * 10}%`, animation: "fieldStretch 2.5s ease-in-out infinite" }} />
      ))}
      <div className="absolute bottom-1 text-[9px] font-mono text-cyan-300/70 font-bold">F = kq₁q₂/r²</div>
    </div>
  );
}

export function CurrentElectricityAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Wire */}
      <div className="w-24 h-[3px] bg-gradient-to-r from-yellow-500/30 via-yellow-400/50 to-yellow-500/30 rounded shadow-[0_0_6px_rgba(250,204,21,0.2)]" />
      {/* Flowing charges */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="absolute w-2.5 h-2.5 rounded-full bg-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.8),0_0_20px_rgba(250,204,21,0.3)]"
          style={{ animation: `currentFlow 1.5s linear infinite`, animationDelay: `${i * 0.3}s`, top: "calc(50% - 5px)" }}
        />
      ))}
      {/* Resistor */}
      <div className="absolute top-3 w-8 h-4 border-2 border-cyan-400/40 rounded shadow-[0_0_6px_rgba(0,212,255,0.2)]" />
      <div className="absolute bottom-1 text-[9px] font-mono text-yellow-300/80 font-bold">I = V/R</div>
    </div>
  );
}

export function SemiconductorAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* PN Junction */}
      <div className="flex shadow-[0_0_12px_rgba(0,0,0,0.3)]">
        <div className="w-10 h-12 bg-gradient-to-r from-red-500/25 to-red-500/15 border-2 border-red-400/40 rounded-l-lg flex items-center justify-center shadow-[inset_0_0_12px_rgba(239,68,68,0.15)]">
          <span className="text-[11px] font-bold text-red-400">P</span>
        </div>
        <div className="w-10 h-12 bg-gradient-to-r from-cyan-500/15 to-cyan-500/25 border-2 border-cyan-400/40 rounded-r-lg flex items-center justify-center shadow-[inset_0_0_12px_rgba(0,212,255,0.15)]">
          <span className="text-[11px] font-bold text-cyan-400">N</span>
        </div>
      </div>
      {/* Carriers */}
      <div className="absolute w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.6)]" style={{ animation: "carrierP 2s ease-in-out infinite", left: "33%" }} />
      <div className="absolute w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,212,255,0.6)]" style={{ animation: "carrierN 2s ease-in-out infinite", right: "33%" }} />
      <div className="absolute bottom-1 text-[9px] font-mono text-cyan-300/70 font-bold">Diode</div>
    </div>
  );
}

export function EMIAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Coil */}
      <div className="w-14 h-10 rounded-lg border-[2.5px] border-cyan-400/40 shadow-[0_0_10px_rgba(0,212,255,0.15)]" />
      {/* Moving magnet */}
      <div className="absolute flex h-4 rounded-md overflow-hidden shadow-[0_0_10px_rgba(0,0,0,0.3)]" style={{ animation: "magnetMove 2s ease-in-out infinite" }}>
        <div className="w-5 bg-gradient-to-r from-red-500 to-red-400 text-[7px] flex items-center justify-center text-white font-bold">N</div>
        <div className="w-5 bg-gradient-to-r from-blue-400 to-blue-500 text-[7px] flex items-center justify-center text-white font-bold">S</div>
      </div>
      {/* EMF sparks */}
      <div className="absolute top-2 right-3 w-2 h-2 rounded-full bg-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.8)]" style={{ animation: "emfSpark 2s ease-in-out infinite" }} />
      <div className="absolute top-4 right-5 w-1.5 h-1.5 rounded-full bg-yellow-300 shadow-[0_0_8px_rgba(250,204,21,0.6)]" style={{ animation: "emfSpark 2s ease-in-out infinite", animationDelay: "0.3s" }} />
      <div className="absolute bottom-1 text-[9px] font-mono text-cyan-300/70 font-bold">ε = -dΦ/dt</div>
    </div>
  );
}

export function ACAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <svg className="w-full h-14" viewBox="0 0 100 40">
        {/* Bright AC wave */}
        <path fill="none" stroke="#fbbf24" strokeWidth="2.5" filter="url(#acGlow)">
          <animate attributeName="d" dur="1.5s" repeatCount="indefinite" values="M 0 20 C 12 2 25 2 37 20 C 50 38 62 38 75 20 C 87 2 100 2 100 20;M 0 20 C 12 38 25 38 37 20 C 50 2 62 2 75 20 C 87 38 100 38 100 20;M 0 20 C 12 2 25 2 37 20 C 50 38 62 38 75 20 C 87 2 100 2 100 20" />
        </path>
        {/* Zero line */}
        <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(148,163,184,0.3)" strokeWidth="0.5" strokeDasharray="2 2" />
        <defs>
          <filter id="acGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </svg>
      <div className="absolute bottom-0 text-[9px] font-mono text-amber-300/80 font-bold">V = V₀sin(ωt)</div>
    </div>
  );
}

export function RayOpticsAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Prism */}
      <div className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-b-[30px] border-b-violet-500/40" style={{ filter: "drop-shadow(0 0 8px rgba(124,58,237,0.3))" }} />
      {/* Rainbow dispersion - bright neon colors */}
      {[
        { color: "#ff4444", shadow: "rgba(255,68,68,0.5)" },
        { color: "#ff8800", shadow: "rgba(255,136,0,0.5)" },
        { color: "#ffdd00", shadow: "rgba(255,221,0,0.5)" },
        { color: "#00ff88", shadow: "rgba(0,255,136,0.5)" },
        { color: "#00ccff", shadow: "rgba(0,204,255,0.5)" },
        { color: "#8844ff", shadow: "rgba(136,68,255,0.5)" },
      ].map((c, i) => (
        <div
          key={i}
          className="absolute h-[2px] origin-left rounded"
          style={{
            background: c.color,
            boxShadow: `0 0 6px ${c.shadow}`,
            width: "24px",
            right: "6px",
            top: `${30 + i * 6}%`,
            transform: `rotate(${-12 + i * 5}deg)`,
            animation: `rainbowSpread 3s ease-in-out infinite`,
            animationDelay: `${i * 0.08}s`,
          }}
        />
      ))}
      {/* Incident white light */}
      <div className="absolute left-3 top-[40%] w-8 h-[2px] bg-white/60 shadow-[0_0_8px_rgba(255,255,255,0.4)] rounded" />
    </div>
  );
}

export function ModernPhysicsAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Nucleus */}
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 shadow-[0_0_16px_rgba(0,212,255,0.5),0_0_32px_rgba(124,58,237,0.3)]" />
      {/* Electron orbit 1 */}
      <div className="absolute inset-2 rounded-full border-[1.5px] border-cyan-400/30 shadow-[0_0_6px_rgba(0,212,255,0.15)]" style={{ animation: "spin 3s linear infinite" }}>
        <div className="absolute -top-1.5 left-1/2 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(0,212,255,0.8),0_0_20px_rgba(0,212,255,0.3)]" />
      </div>
      {/* Electron orbit 2 */}
      <div className="absolute inset-0 rounded-full border-[1.5px] border-violet-400/20 shadow-[0_0_4px_rgba(124,58,237,0.1)]" style={{ animation: "spin 5s linear infinite", animationDirection: "reverse" }}>
        <div className="absolute top-1/2 -right-1 w-2.5 h-2.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(124,58,237,0.8),0_0_20px_rgba(124,58,237,0.3)]" />
      </div>
      {/* Photon emission */}
      <div className="absolute right-1 top-2 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]" style={{ animation: "photonEmit 2s ease-out infinite" }} />
      <div className="absolute bottom-0 text-[9px] font-mono text-cyan-300/70 font-bold">E = hν</div>
    </div>
  );
}

export function SemiconductorAdvancedAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Transistor */}
      <div className="w-14 h-14 border-2 border-cyan-400/40 rounded-lg flex flex-col items-center justify-center gap-1 shadow-[0_0_10px_rgba(0,212,255,0.15)]">
        <span className="text-[8px] text-cyan-400 font-bold">C</span>
        <div className="w-6 h-[2px] bg-cyan-400/40 rounded" />
        <span className="text-[8px] text-violet-400 font-bold">B</span>
        <div className="w-6 h-[2px] bg-violet-400/40 rounded" />
        <span className="text-[8px] text-amber-400 font-bold">E</span>
      </div>
      {/* Signal pulses */}
      <div className="absolute left-2 w-2.5 h-2.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(124,58,237,0.7)]" style={{ animation: "signalFlow 1.5s ease-in-out infinite" }} />
      <div className="absolute right-2 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(0,212,255,0.7)]" style={{ animation: "signalFlow 1.5s ease-in-out infinite", animationDelay: "0.5s" }} />
      <div className="absolute bottom-0 text-[9px] font-mono text-cyan-300/70 font-bold">BJT</div>
    </div>
  );
}

type SheetVisualMode =
  | "orbit"
  | "rays"
  | "field"
  | "circuit"
  | "wave"
  | "matter"
  | "thermal"
  | "atomic"
  | "magnet"
  | "coil"
  | "semiconductor";

type SheetVisualConfig = {
  label: string;
  mode: SheetVisualMode;
  accent: string;
  secondary: string;
  symbol: string;
  formula: string;
  tilt: number;
  rings: number;
};

function SheetChapterAnimation({ configKey, config }: { configKey: string; config: SheetVisualConfig }) {
  const filterId = `sheet-glow-${configKey}`;
  const ringItems = Array.from({ length: config.rings });

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 120 86" aria-hidden="true">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {config.mode === "orbit" && (
          <g filter={`url(#${filterId})`}>
            <circle cx="60" cy="43" r="10" fill={config.accent} opacity="0.85" />
            {ringItems.map((_, i) => (
              <ellipse
                key={i}
                cx="60"
                cy="43"
                rx={28 + i * 8}
                ry={12 + i * 5}
                fill="none"
                stroke={i % 2 ? config.secondary : config.accent}
                strokeWidth="1.4"
                opacity={0.45 - i * 0.06}
                transform={`rotate(${config.tilt + i * 32} 60 43)`}
              />
            ))}
            <circle cx="88" cy="31" r="4" fill={config.secondary}>
              <animate attributeName="opacity" values="0.4;1;0.4" dur="1.8s" repeatCount="indefinite" />
            </circle>
          </g>
        )}

        {config.mode === "rays" && (
          <g filter={`url(#${filterId})`}>
            <polygon points="60,20 78,60 42,60" fill={config.secondary} opacity="0.28" stroke={config.secondary} strokeWidth="1.4" />
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1="12"
                y1={32 + i * 4}
                x2="55"
                y2={38 + i}
                stroke={config.accent}
                strokeWidth="2"
                opacity={0.55 - i * 0.05}
              />
            ))}
            {[0, 1, 2, 3].map((i) => (
              <line
                key={i}
                x1="72"
                y1="42"
                x2={102}
                y2={24 + i * 12}
                stroke={i % 2 ? config.secondary : config.accent}
                strokeWidth="2"
                opacity="0.72"
              >
                <animate attributeName="x2" values="98;108;98" dur="2.4s" begin={`${i * 0.15}s`} repeatCount="indefinite" />
              </line>
            ))}
          </g>
        )}

        {config.mode === "field" && (
          <g filter={`url(#${filterId})`}>
            <circle cx="36" cy="43" r="12" fill={config.accent} opacity="0.25" stroke={config.accent} strokeWidth="2" />
            <circle cx="84" cy="43" r="12" fill={config.secondary} opacity="0.25" stroke={config.secondary} strokeWidth="2" />
            <text x="36" y="48" textAnchor="middle" fill={config.accent} fontSize="16" fontWeight="700">+</text>
            <text x="84" y="48" textAnchor="middle" fill={config.secondary} fontSize="18" fontWeight="700">-</text>
            {[-16, -8, 0, 8, 16].map((offset, i) => (
              <path
                key={i}
                d={`M 48 ${43 + offset} C 58 ${30 + offset / 2}, 68 ${56 - offset / 2}, 76 ${43 - offset}`}
                fill="none"
                stroke={i % 2 ? config.secondary : config.accent}
                strokeWidth="1.5"
                opacity="0.55"
              >
                <animate attributeName="opacity" values="0.25;0.72;0.25" dur="2.2s" begin={`${i * 0.18}s`} repeatCount="indefinite" />
              </path>
            ))}
          </g>
        )}

        {config.mode === "circuit" && (
          <g filter={`url(#${filterId})`}>
            <rect x="26" y="24" width="68" height="38" rx="8" fill="none" stroke={config.accent} strokeWidth="2" opacity="0.55" />
            <line x1="18" y1="37" x2="18" y2="51" stroke={config.secondary} strokeWidth="3" />
            <line x1="22" y1="32" x2="22" y2="56" stroke={config.secondary} strokeWidth="3" />
            <rect x="52" y="18" width="18" height="12" rx="2" fill={config.secondary} opacity="0.3" stroke={config.secondary} />
            {[0, 1, 2].map((i) => (
              <circle key={i} r="4" fill={config.accent}>
                <animateMotion dur="2s" begin={`${i * 0.45}s`} repeatCount="indefinite" path="M 28 24 H 94 V 62 H 26 V 24" />
              </circle>
            ))}
          </g>
        )}

        {config.mode === "wave" && (
          <g filter={`url(#${filterId})`}>
            {[0, 1, 2].map((i) => (
              <path
                key={i}
                d={`M 8 ${36 + i * 8} Q 22 ${16 + i * 4} 36 ${36 + i * 8} T 64 ${36 + i * 8} T 92 ${36 + i * 8} T 120 ${36 + i * 8}`}
                fill="none"
                stroke={i % 2 ? config.secondary : config.accent}
                strokeWidth={i === 1 ? 2.4 : 1.5}
                opacity={0.65 - i * 0.12}
              >
                <animate attributeName="d" dur="2s" begin={`${i * 0.15}s`} repeatCount="indefinite"
                  values={`M 8 ${36 + i * 8} Q 22 ${16 + i * 4} 36 ${36 + i * 8} T 64 ${36 + i * 8} T 92 ${36 + i * 8} T 120 ${36 + i * 8};M 8 ${36 + i * 8} Q 22 ${56 - i * 4} 36 ${36 + i * 8} T 64 ${36 + i * 8} T 92 ${36 + i * 8} T 120 ${36 + i * 8};M 8 ${36 + i * 8} Q 22 ${16 + i * 4} 36 ${36 + i * 8} T 64 ${36 + i * 8} T 92 ${36 + i * 8} T 120 ${36 + i * 8}`} />
              </path>
            ))}
          </g>
        )}

        {config.mode === "matter" && (
          <g filter={`url(#${filterId})`}>
            {[0, 1, 2, 3].map((row) =>
              [0, 1, 2, 3, 4].map((col) => (
                <circle key={`${row}-${col}`} cx={28 + col * 16 + (row % 2) * 7} cy={24 + row * 11} r="3.5" fill={col % 2 ? config.secondary : config.accent} opacity="0.72">
                  <animate attributeName="cy" values={`${24 + row * 11};${21 + row * 11};${24 + row * 11}`} dur="1.8s" begin={`${(row + col) * 0.08}s`} repeatCount="indefinite" />
                </circle>
              ))
            )}
            <path d="M 24 66 C 36 52, 48 78, 60 64 S 84 50, 96 66" fill="none" stroke={config.accent} strokeWidth="2" opacity="0.55" />
          </g>
        )}

        {config.mode === "thermal" && (
          <g filter={`url(#${filterId})`}>
            <path d="M 58 66 C 40 48, 55 38, 51 22 C 72 38, 73 52, 62 66 Z" fill={config.accent} opacity="0.75">
              <animate attributeName="d" dur="0.8s" repeatCount="indefinite" values="M 58 66 C 40 48, 55 38, 51 22 C 72 38, 73 52, 62 66 Z;M 58 66 C 44 48, 50 35, 58 20 C 76 40, 68 54, 62 66 Z;M 58 66 C 40 48, 55 38, 51 22 C 72 38, 73 52, 62 66 Z" />
            </path>
            {[0, 1, 2, 3].map((i) => (
              <text key={i} x={32 + i * 16} y={30 - i * 2} fill={i % 2 ? config.secondary : config.accent} fontSize="14" opacity="0.55">~</text>
            ))}
          </g>
        )}

        {config.mode === "atomic" && (
          <g filter={`url(#${filterId})`}>
            <circle cx="60" cy="43" r="8" fill={config.secondary} opacity="0.85" />
            {ringItems.map((_, i) => (
              <g key={i} transform={`rotate(${config.tilt + i * 58} 60 43)`}>
                <ellipse cx="60" cy="43" rx={30 + i * 5} ry="11" fill="none" stroke={i % 2 ? config.secondary : config.accent} strokeWidth="1.4" opacity="0.42" />
                <circle cx={90 + i * 5} cy="43" r="3.5" fill={config.accent}>
                  <animateTransform attributeName="transform" type="rotate" from={`0 60 43`} to={`360 60 43`} dur={`${3 + i}s`} repeatCount="indefinite" />
                </circle>
              </g>
            ))}
          </g>
        )}

        {config.mode === "magnet" && (
          <g filter={`url(#${filterId})`}>
            <rect x="36" y="34" width="24" height="18" rx="4" fill={config.accent} />
            <rect x="60" y="34" width="24" height="18" rx="4" fill={config.secondary} />
            <text x="48" y="47" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">N</text>
            <text x="72" y="47" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">S</text>
            {[0, 1, 2].map((i) => (
              <ellipse key={i} cx="60" cy="43" rx={34 + i * 8} ry={17 + i * 5} fill="none" stroke={i % 2 ? config.secondary : config.accent} strokeDasharray="4 3" opacity={0.5 - i * 0.09}>
                <animate attributeName="opacity" values="0.25;0.62;0.25" dur="2.5s" begin={`${i * 0.25}s`} repeatCount="indefinite" />
              </ellipse>
            ))}
          </g>
        )}

        {config.mode === "coil" && (
          <g filter={`url(#${filterId})`}>
            {[0, 1, 2, 3, 4].map((i) => (
              <ellipse key={i} cx={42 + i * 8} cy="43" rx="7" ry="18" fill="none" stroke={config.accent} strokeWidth="2" opacity="0.55" />
            ))}
            <rect x="16" y="36" width="22" height="14" rx="4" fill={config.secondary} opacity="0.8">
              <animate attributeName="x" values="14;30;14" dur="2s" repeatCount="indefinite" />
            </rect>
            <circle cx="94" cy="28" r="4" fill="#facc15">
              <animate attributeName="r" values="2;5;2" dur="1.2s" repeatCount="indefinite" />
            </circle>
          </g>
        )}

        {config.mode === "semiconductor" && (
          <g filter={`url(#${filterId})`}>
            <rect x="34" y="24" width="26" height="38" rx="5" fill={config.accent} opacity="0.28" stroke={config.accent} />
            <rect x="60" y="24" width="26" height="38" rx="5" fill={config.secondary} opacity="0.28" stroke={config.secondary} />
            <text x="47" y="47" textAnchor="middle" fill={config.accent} fontSize="14" fontWeight="700">P</text>
            <text x="73" y="47" textAnchor="middle" fill={config.secondary} fontSize="14" fontWeight="700">N</text>
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={44 + i * 12} cy={28 + i * 10} r="3" fill={i % 2 ? config.secondary : config.accent}>
                <animate attributeName="cx" values={`${44 + i * 12};${54 + i * 12};${44 + i * 12}`} dur="1.7s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
              </circle>
            ))}
          </g>
        )}
      </svg>

      <div
        className="absolute right-3 top-2 rounded-full border px-2 py-0.5 text-[10px] font-bold"
        style={{ color: config.accent, borderColor: `${config.accent}66`, background: `${config.accent}12` }}
      >
        {config.symbol}
      </div>
      <div className="absolute bottom-1 text-[9px] font-mono font-bold" style={{ color: config.secondary }}>
        {config.formula}
      </div>
    </div>
  );
}

function createSheetAnimation(configKey: string, config: SheetVisualConfig) {
  return function GeneratedSheetChapterAnimation() {
    return <SheetChapterAnimation configKey={configKey} config={config} />;
  };
}

const sheetChapterVisuals: Record<string, SheetVisualConfig> = {
  "sheet-09-motion": { label: "Class 9 Motion", mode: "orbit", accent: "#22d3ee", secondary: "#60a5fa", symbol: "v", formula: "s = vt", tilt: 8, rings: 2 },
  "sheet-09-force": { label: "Class 9 Force", mode: "field", accent: "#f59e0b", secondary: "#fb7185", symbol: "F", formula: "F = ma", tilt: 18, rings: 3 },
  "sheet-09-gravitation": { label: "Class 9 Gravitation", mode: "orbit", accent: "#fbbf24", secondary: "#38bdf8", symbol: "g", formula: "F = GmM/r2", tilt: 34, rings: 3 },
  "sheet-09-work-energy": { label: "Class 9 Work and Energy", mode: "thermal", accent: "#a78bfa", secondary: "#34d399", symbol: "W", formula: "W = Fs", tilt: -12, rings: 2 },
  "sheet-09-sound": { label: "Class 9 Sound", mode: "wave", accent: "#4ade80", secondary: "#22d3ee", symbol: "f", formula: "v = fL", tilt: 0, rings: 3 },
  "sheet-10-light": { label: "Class 10 Light", mode: "rays", accent: "#facc15", secondary: "#a78bfa", symbol: "n", formula: "sin i/sin r", tilt: -18, rings: 3 },
  "sheet-10-human-eye": { label: "Class 10 Human Eye", mode: "rays", accent: "#38bdf8", secondary: "#f472b6", symbol: "eye", formula: "P = 1/f", tilt: 22, rings: 2 },
  "sheet-10-electricity": { label: "Class 10 Electricity", mode: "circuit", accent: "#fde047", secondary: "#22c55e", symbol: "I", formula: "V = IR", tilt: 0, rings: 2 },
  "sheet-10-magnetism": { label: "Class 10 Magnetic Effects", mode: "magnet", accent: "#ef4444", secondary: "#3b82f6", symbol: "B", formula: "B = mu I", tilt: 12, rings: 3 },
  "sheet-11-straight-line": { label: "Class 11 Straight Line", mode: "orbit", accent: "#06b6d4", secondary: "#818cf8", symbol: "a", formula: "v = u + at", tilt: -28, rings: 2 },
  "sheet-11-plane": { label: "Class 11 Motion in Plane", mode: "orbit", accent: "#2dd4bf", secondary: "#f59e0b", symbol: "R", formula: "R = u2 sin2q/g", tilt: 48, rings: 3 },
  "sheet-11-laws": { label: "Class 11 Laws of Motion", mode: "field", accent: "#fb923c", secondary: "#f43f5e", symbol: "p", formula: "dp/dt", tilt: 14, rings: 2 },
  "sheet-11-work-power": { label: "Class 11 Work Energy Power", mode: "thermal", accent: "#8b5cf6", secondary: "#fbbf24", symbol: "P", formula: "P = W/t", tilt: -8, rings: 3 },
  "sheet-11-rotational": { label: "Class 11 Rotational Motion", mode: "orbit", accent: "#c084fc", secondary: "#22d3ee", symbol: "tau", formula: "tau = I alpha", tilt: 64, rings: 4 },
  "sheet-11-gravitation": { label: "Class 11 Gravitation", mode: "orbit", accent: "#f97316", secondary: "#38bdf8", symbol: "G", formula: "U = -GMm/r", tilt: -42, rings: 4 },
  "sheet-11-solids": { label: "Class 11 Solids", mode: "matter", accent: "#22d3ee", secondary: "#a78bfa", symbol: "Y", formula: "stress/strain", tilt: 0, rings: 2 },
  "sheet-11-fluids": { label: "Class 11 Fluids", mode: "wave", accent: "#38bdf8", secondary: "#14b8a6", symbol: "P", formula: "P = rho gh", tilt: 0, rings: 4 },
  "sheet-11-thermal": { label: "Class 11 Thermal Matter", mode: "thermal", accent: "#fb923c", secondary: "#facc15", symbol: "Q", formula: "Q = mcDT", tilt: 10, rings: 2 },
  "sheet-11-thermodynamics": { label: "Class 11 Thermodynamics", mode: "thermal", accent: "#f97316", secondary: "#60a5fa", symbol: "dU", formula: "dU = Q - W", tilt: -24, rings: 3 },
  "sheet-12-charges": { label: "Class 12 Charges and Fields", mode: "field", accent: "#f43f5e", secondary: "#22d3ee", symbol: "q", formula: "E = F/q", tilt: 0, rings: 3 },
  "sheet-12-potential": { label: "Class 12 Potential", mode: "field", accent: "#a78bfa", secondary: "#facc15", symbol: "V", formula: "V = kq/r", tilt: 18, rings: 4 },
  "sheet-12-current": { label: "Class 12 Current", mode: "circuit", accent: "#fde047", secondary: "#38bdf8", symbol: "R", formula: "I = nqAvd", tilt: 0, rings: 3 },
  "sheet-12-moving-charges": { label: "Class 12 Moving Charges", mode: "magnet", accent: "#ef4444", secondary: "#22d3ee", symbol: "F", formula: "qvB", tilt: -16, rings: 4 },
  "sheet-12-magnetism-matter": { label: "Class 12 Magnetism Matter", mode: "magnet", accent: "#f43f5e", secondary: "#2563eb", symbol: "M", formula: "m = IA", tilt: 30, rings: 2 },
  "sheet-12-emi": { label: "Class 12 EMI", mode: "coil", accent: "#22d3ee", secondary: "#facc15", symbol: "emf", formula: "-dPhi/dt", tilt: 0, rings: 3 },
  "sheet-12-ac": { label: "Class 12 Alternating Current", mode: "wave", accent: "#fbbf24", secondary: "#c084fc", symbol: "AC", formula: "V0 sin wt", tilt: 0, rings: 2 },
  "sheet-12-em-waves": { label: "Class 12 EM Waves", mode: "wave", accent: "#60a5fa", secondary: "#f472b6", symbol: "c", formula: "c = fL", tilt: 0, rings: 4 },
  "sheet-12-ray-optics": { label: "Class 12 Ray Optics", mode: "rays", accent: "#facc15", secondary: "#38bdf8", symbol: "f", formula: "1/f = 1/v + 1/u", tilt: 36, rings: 3 },
  "sheet-12-wave-optics": { label: "Class 12 Wave Optics", mode: "wave", accent: "#22d3ee", secondary: "#a78bfa", symbol: "lambda", formula: "beta = D L/d", tilt: 0, rings: 5 },
  "sheet-12-dual-nature": { label: "Class 12 Dual Nature", mode: "atomic", accent: "#fbbf24", secondary: "#60a5fa", symbol: "h", formula: "E = h nu", tilt: 20, rings: 3 },
  "sheet-12-atoms": { label: "Class 12 Atoms", mode: "atomic", accent: "#22d3ee", secondary: "#8b5cf6", symbol: "n", formula: "En = -13.6/n2", tilt: -28, rings: 4 },
  "sheet-12-nuclei": { label: "Class 12 Nuclei", mode: "atomic", accent: "#f43f5e", secondary: "#facc15", symbol: "A", formula: "E = mc2", tilt: 54, rings: 2 },
  "sheet-12-semiconductor": { label: "Class 12 Semiconductor", mode: "semiconductor", accent: "#fb7185", secondary: "#22d3ee", symbol: "PN", formula: "diode", tilt: 0, rings: 3 },
};

const sheetAnimationRegistry = Object.fromEntries(
  Object.entries(sheetChapterVisuals).map(([key, config]) => [key, createSheetAnimation(key, config)])
) as Record<string, () => JSX.Element>;

const sheetAnimationMap = Object.fromEntries(
  Object.entries(sheetChapterVisuals).map(([key, config]) => [config.label.toLowerCase(), createSheetAnimation(key, config)])
) as Record<string, () => JSX.Element>;

export const chapterAnimationOptions = [
  ...Object.entries(sheetChapterVisuals).map(([key, config]) => ({ key, label: config.label })),
  { key: "motion", label: "Motion" },
  { key: "force", label: "Force & Laws" },
  { key: "gravitation", label: "Gravitation" },
  { key: "work-energy", label: "Work & Energy" },
  { key: "sound", label: "Sound" },
  { key: "light", label: "Light Reflection" },
  { key: "human-eye", label: "Human Eye" },
  { key: "electricity", label: "Electricity" },
  { key: "magnetism", label: "Magnetism" },
  { key: "units", label: "Units & Measurements" },
  { key: "kinematics", label: "Kinematics" },
  { key: "rotational", label: "Rotational Motion" },
  { key: "properties-of-matter", label: "Properties of Matter" },
  { key: "thermodynamics", label: "Thermodynamics" },
  { key: "oscillations", label: "Oscillations" },
  { key: "waves", label: "Waves" },
  { key: "electrostatics", label: "Electrostatics" },
  { key: "current-electricity", label: "Current Electricity" },
  { key: "semiconductor", label: "Semiconductor" },
  { key: "emi", label: "Magnetism & EMI" },
  { key: "ac", label: "Alternating Current" },
  { key: "ray-optics", label: "Ray Optics" },
  { key: "modern-physics", label: "Modern Physics" },
  { key: "semiconductor-advanced", label: "Advanced Semiconductor" },
];

const animationRegistry: Record<string, () => JSX.Element> = {
  motion: MotionAnimation,
  force: ForceAnimation,
  gravitation: GravitationAnimation,
  "work-energy": WorkEnergyAnimation,
  sound: SoundAnimation,
  light: LightAnimation,
  "human-eye": HumanEyeAnimation,
  electricity: ElectricityAnimation,
  magnetism: MagnetismAnimation,
  units: UnitsAnimation,
  kinematics: KinematicsAnimation,
  rotational: RotationalAnimation,
  "properties-of-matter": PropertiesOfMatterAnimation,
  thermodynamics: ThermodynamicsAnimation,
  oscillations: OscillationsAnimation,
  waves: WavesAnimation,
  electrostatics: ElectrostaticsAnimation,
  "current-electricity": CurrentElectricityAnimation,
  semiconductor: SemiconductorAnimation,
  emi: EMIAnimation,
  ac: ACAnimation,
  "ray-optics": RayOpticsAnimation,
  "modern-physics": ModernPhysicsAnimation,
  "semiconductor-advanced": SemiconductorAdvancedAnimation,
  ...sheetAnimationRegistry,
};

/* Map chapter names to animation components */
const animationMap: Record<string, () => JSX.Element> = {
  ...sheetAnimationMap,
  // Existing mappings
  motion: animationRegistry.motion,
  "force and laws of motion": animationRegistry.force,
  gravitation: animationRegistry.gravitation,
  "gravitation (advanced)": GravitationAnimation,
  "work and energy": animationRegistry["work-energy"],
  "work, energy & power": animationRegistry["work-energy"],
  sound: animationRegistry.sound,
  "light (reflection & refraction)": animationRegistry.light,
  "human eye & defects": animationRegistry["human-eye"],
  electricity: animationRegistry.electricity,
  magnetism: animationRegistry.magnetism,
  "units & measurements": animationRegistry.units,
  kinematics: animationRegistry.kinematics,
  "kinematics (basic)": animationRegistry.kinematics,
  "laws of motion": animationRegistry.force,
  "laws of motion (basic)": animationRegistry.force,
  "rotational motion": animationRegistry.rotational,
  "properties of matter": animationRegistry["properties-of-matter"],
  thermodynamics: animationRegistry.thermodynamics,
  "oscillations (shm)": animationRegistry.oscillations,
  waves: animationRegistry.waves,
  electrostatics: animationRegistry.electrostatics,
  "electrostatics (basic)": animationRegistry.electrostatics,
  "current electricity": animationRegistry["current-electricity"],
  "current electricity (basic)": animationRegistry["current-electricity"],
  semiconductors: animationRegistry.semiconductor,
  "semiconductors (intro)": animationRegistry.semiconductor,
  "semiconductors (advanced)": animationRegistry["semiconductor-advanced"],
  "magnetism & emi": animationRegistry.emi,
  "alternating current": animationRegistry.ac,
  "ray optics & wave optics": animationRegistry["ray-optics"],
  "modern physics": animationRegistry["modern-physics"],

  // Bridge Course mappings
  "language of physics": animationRegistry.units,
  "motion & change": animationRegistry.motion,
  "forces & laws": animationRegistry.force,
  "energy thinking": animationRegistry["work-energy"],
  "momentum & collisions": animationRegistry.kinematics,
  "rotational basics": animationRegistry.rotational,
  "fluids & pressure": animationRegistry["properties-of-matter"],
  "waves & oscillations": animationRegistry.oscillations,
  "heat & thermodynamics": animationRegistry.thermodynamics,
  "electricity foundations": animationRegistry.electricity,

  // Class 11 & 12 NCERT chapter names (exact) so every chapter card has a fitting animation
  "physical world and measurement": animationRegistry.units,
  "units and measurements": animationRegistry.units,
  "motion in a straight line": animationRegistry.kinematics,
  "motion in a plane": animationRegistry.kinematics,
  "work, energy and power": animationRegistry["work-energy"],
  "system of particles and rotational motion": animationRegistry.rotational,
  "mechanical properties of solids": animationRegistry["properties-of-matter"],
  "mechanical properties of fluids": animationRegistry["sheet-11-fluids"],
  "thermal properties of matter": animationRegistry.thermodynamics,
  "kinetic theory": animationRegistry.thermodynamics,
  oscillations: animationRegistry.oscillations,
  "electric charges and fields": animationRegistry.electrostatics,
  "electrostatic potential and capacitance": animationRegistry["sheet-12-potential"],
  "moving charges and magnetism": animationRegistry["sheet-12-moving-charges"],
  "magnetism and matter": animationRegistry.magnetism,
  "electromagnetic induction": animationRegistry.emi,
  "electromagnetic waves": animationRegistry["sheet-12-em-waves"],
  "ray optics and optical instruments": animationRegistry["ray-optics"],
  "wave optics": animationRegistry["sheet-12-wave-optics"],
  "dual nature of radiation and matter": animationRegistry["modern-physics"],
  atoms: animationRegistry["sheet-12-atoms"],
  nuclei: animationRegistry["sheet-12-nuclei"],
  "semiconductor electronics": animationRegistry.semiconductor,
};

export function getChapterAnimation(chapterName: string, animationKey?: string | null): (() => JSX.Element) | null {
  if (animationKey && animationRegistry[animationKey]) return animationRegistry[animationKey];
  const lower = chapterName.toLowerCase();
  if (animationMap[lower]) return animationMap[lower];
  // Partial match
  for (const [key, anim] of Object.entries(animationMap)) {
    if (lower.includes(key) || key.includes(lower)) return anim;
  }
  return null;
}
