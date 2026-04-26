"use client";

/* Animated mini-visuals for each physics chapter topic */

export function MotionAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Track line */}
      <div className="absolute bottom-6 left-3 right-3 h-px bg-border" />
      {/* Moving ball */}
      <div
        className="absolute bottom-4 w-3 h-3 rounded-full bg-accent shadow-[0_0_8px_rgba(0,212,255,0.6)]"
        style={{ animation: "motionBall 2s ease-in-out infinite", left: "10%" }}
      />
      {/* Trail dots */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute bottom-[18px] w-1.5 h-1.5 rounded-full bg-accent/30"
          style={{ left: `${15 + i * 12}%`, animation: `motionTrail 2s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }}
        />
      ))}
      {/* Arrow */}
      <div className="absolute bottom-8 right-4 text-accent/50 text-xs font-mono">→ v</div>
    </div>
  );
}

export function ForceAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Block */}
      <div className="w-8 h-8 rounded bg-surface-light border border-border" style={{ animation: "forceBlock 2.5s ease-in-out infinite" }} />
      {/* Force arrows */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center" style={{ animation: "forceArrow 2.5s ease-in-out infinite" }}>
        <div className="w-6 h-0.5 bg-gradient-to-r from-energy to-energy/0" />
        <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[5px] border-l-energy" />
      </div>
      <div className="absolute bottom-3 text-[8px] font-mono text-energy/60">F = ma</div>
    </div>
  );
}

export function GravitationAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Central body */}
      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-energy to-orange-600 shadow-[0_0_12px_rgba(245,158,11,0.4)]" />
      {/* Orbiting body */}
      <div className="absolute inset-2" style={{ animation: "orbit 4s linear infinite" }}>
        <div className="absolute -top-1 left-1/2 w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_6px_rgba(0,212,255,0.5)]" />
      </div>
      {/* Orbit ring */}
      <div className="absolute inset-4 rounded-full border border-dashed border-accent/20" />
      <div className="absolute bottom-2 text-[7px] font-mono text-accent/50">Gm₁m₂/r²</div>
    </div>
  );
}

export function WorkEnergyAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Pendulum */}
      <div className="absolute top-3 left-1/2 w-px h-12 bg-text-muted/30 origin-top" style={{ animation: "pendulum 2s ease-in-out infinite" }}>
        <div className="absolute -bottom-2 -left-[5px] w-[10px] h-[10px] rounded-full bg-gradient-to-br from-secondary to-purple-600 shadow-[0_0_8px_rgba(124,58,237,0.5)]" />
      </div>
      {/* Energy labels */}
      <div className="absolute bottom-2 left-2 text-[7px] font-mono text-emerald-400/60">KE</div>
      <div className="absolute bottom-2 right-2 text-[7px] font-mono text-energy/60">PE</div>
    </div>
  );
}

export function SoundAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Speaker */}
      <div className="absolute left-4 w-3 h-5 rounded-r bg-text-muted/30" />
      {/* Sound waves */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute rounded-full border border-accent/40"
          style={{
            width: `${20 + i * 16}px`,
            height: `${20 + i * 16}px`,
            left: `${28 + i * 8}%`,
            animation: `soundWave 1.5s ease-out infinite`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
      <div className="absolute bottom-2 text-[7px] font-mono text-accent/50">v = fλ</div>
    </div>
  );
}

export function LightAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Mirror */}
      <div className="absolute right-5 top-3 bottom-5 w-1 bg-gradient-to-b from-text-muted/40 to-text-muted/20 rounded" />
      {/* Incident ray */}
      <div className="absolute left-4 top-4 w-12 h-px bg-gradient-to-r from-energy to-energy/80 origin-left" style={{ transform: "rotate(25deg)" }}>
        <div className="absolute right-0 top-[-2px] w-0 h-0 border-t-[2px] border-t-transparent border-b-[2px] border-b-transparent border-l-[4px] border-l-energy" />
      </div>
      {/* Reflected ray */}
      <div className="absolute right-5 top-5 w-10 h-px bg-gradient-to-r from-energy/80 to-energy/20 origin-left" style={{ transform: "rotate(-25deg)", animation: "lightReflect 2s ease-in-out infinite" }}>
        <div className="absolute right-0 top-[-2px] w-0 h-0 border-t-[2px] border-t-transparent border-b-[2px] border-b-transparent border-l-[4px] border-l-energy/60" />
      </div>
      {/* Glow at reflection point */}
      <div className="absolute right-5 top-5 w-2 h-2 rounded-full bg-energy/40" style={{ animation: "pulse-glow 2s ease-in-out infinite" }} />
    </div>
  );
}

export function HumanEyeAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Eye shape */}
      <div className="w-14 h-8 rounded-[50%] border-2 border-accent/30 flex items-center justify-center" style={{ animation: "eyeBlink 3s ease-in-out infinite" }}>
        {/* Iris */}
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-accent/40 to-secondary/40 flex items-center justify-center">
          {/* Pupil */}
          <div className="w-2.5 h-2.5 rounded-full bg-primary" style={{ animation: "pupilDilate 3s ease-in-out infinite" }} />
        </div>
      </div>
      {/* Light rays entering */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 flex gap-0.5" style={{ animation: "lightEnter 2s linear infinite" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-2 h-px bg-energy/40" />
        ))}
      </div>
    </div>
  );
}

export function ElectricityAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Circuit path */}
      <div className="w-16 h-10 rounded-lg border border-accent/30" />
      {/* Flowing electrons */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-energy shadow-[0_0_4px_rgba(245,158,11,0.6)]"
          style={{ animation: `electronFlow 2s linear infinite`, animationDelay: `${i * 0.66}s`, offsetPath: "path('M -30 0 L 30 0 L 30 -16 L -30 -16 Z')", offsetDistance: "0%" }}
        />
      ))}
      {/* Battery symbol */}
      <div className="absolute -left-1 top-1/2 -translate-y-1/2 flex gap-0.5">
        <div className="w-0.5 h-3 bg-accent/50" />
        <div className="w-0.5 h-5 bg-accent/50" />
      </div>
      {/* Bulb */}
      <div className="absolute -right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-energy/30" style={{ animation: "bulbGlow 1s ease-in-out infinite" }} />
      <div className="absolute bottom-1 text-[7px] font-mono text-energy/50">V = IR</div>
    </div>
  );
}

export function MagnetismAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Magnet */}
      <div className="flex h-5 rounded overflow-hidden">
        <div className="w-6 bg-danger/70 flex items-center justify-center text-[7px] font-bold text-white">N</div>
        <div className="w-6 bg-accent/70 flex items-center justify-center text-[7px] font-bold text-white">S</div>
      </div>
      {/* Field lines */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute rounded-full border border-dashed border-accent/20"
          style={{
            width: `${40 + i * 14}px`,
            height: `${20 + i * 10}px`,
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
      <div className="w-16 h-2 bg-accent/20 rounded-sm relative">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="absolute top-0 w-px bg-accent/50" style={{ left: `${i * 12.5}%`, height: i % 2 === 0 ? "100%" : "50%" }} />
        ))}
      </div>
      {/* Measurement arrow */}
      <div className="absolute top-5 flex items-center gap-1">
        <span className="text-[8px] font-mono text-secondary-light" style={{ animation: "measurePulse 2s ease-in-out infinite" }}>1.5 m/s²</span>
      </div>
      {/* Dimensional formula */}
      <div className="absolute bottom-2 text-[7px] font-mono text-accent/50">[MLT⁻²]</div>
    </div>
  );
}

export function KinematicsAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Projectile path */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 80">
        <path d="M 10 60 Q 50 5 90 60" fill="none" stroke="rgba(0,212,255,0.2)" strokeWidth="1" strokeDasharray="3 2" />
        {/* Moving ball along path */}
        <circle r="3" fill="#00d4ff" filter="url(#glow)">
          <animateMotion dur="2.5s" repeatCount="indefinite" path="M 10 60 Q 50 5 90 60" />
        </circle>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </svg>
      <div className="absolute bottom-1 text-[7px] font-mono text-accent/50">s = ut + ½at²</div>
    </div>
  );
}

export function RotationalAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Spinning wheel */}
      <div className="w-12 h-12 rounded-full border-2 border-secondary/40" style={{ animation: "spin 2s linear infinite" }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-0.5 w-2 h-2 rounded-full bg-secondary shadow-[0_0_6px_rgba(124,58,237,0.5)]" />
        {/* Spokes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-secondary/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-full bg-secondary/20" />
      </div>
      {/* Center */}
      <div className="absolute w-2 h-2 rounded-full bg-secondary/60" />
      <div className="absolute bottom-1 text-[7px] font-mono text-secondary-light/50">τ = Iα</div>
    </div>
  );
}

export function PropertiesOfMatterAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Spring being stretched */}
      <svg className="w-16 h-10" viewBox="0 0 60 30">
        <path d="M 5 15 L 10 5 L 15 25 L 20 5 L 25 25 L 30 5 L 35 25 L 40 5 L 45 25 L 50 15" fill="none" stroke="rgba(0,212,255,0.4)" strokeWidth="1.5">
          <animate attributeName="d" dur="2s" repeatCount="indefinite" values="M 5 15 L 10 5 L 15 25 L 20 5 L 25 25 L 30 5 L 35 25 L 40 5 L 45 25 L 50 15;M 5 15 L 12 5 L 19 25 L 26 5 L 33 25 L 40 5 L 47 25 L 54 5 L 58 15 L 58 15;M 5 15 L 10 5 L 15 25 L 20 5 L 25 25 L 30 5 L 35 25 L 40 5 L 45 25 L 50 15" />
        </path>
      </svg>
      <div className="absolute bottom-1 text-[7px] font-mono text-accent/50">σ = Eε</div>
    </div>
  );
}

export function ThermodynamicsAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Flame */}
      <div className="relative">
        <div className="w-3 h-6 rounded-t-full bg-gradient-to-t from-energy via-orange-500 to-energy/0" style={{ animation: "flame 0.5s ease-in-out infinite alternate" }} />
        <div className="absolute top-1 left-0.5 w-2 h-4 rounded-t-full bg-gradient-to-t from-yellow-300 to-yellow-300/0" style={{ animation: "flameInner 0.3s ease-in-out infinite alternate" }} />
      </div>
      {/* Heat waves rising */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute text-energy/30 text-xs"
          style={{ top: `${10 + i * 5}px`, left: `${40 + i * 8}%`, animation: `heatRise 2s ease-out infinite`, animationDelay: `${i * 0.5}s` }}
        >
          ~
        </div>
      ))}
      <div className="absolute bottom-1 text-[7px] font-mono text-energy/50">ΔU = Q - W</div>
    </div>
  );
}

export function OscillationsAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Spring + mass (SHM) */}
      <div className="absolute top-2 left-1/2 w-8 h-px bg-border -translate-x-1/2" />
      <svg className="absolute top-2 w-4 h-10" viewBox="0 0 10 40" style={{ left: "calc(50% - 8px)" }}>
        <path d="M 5 0 L 2 5 L 8 10 L 2 15 L 8 20 L 2 25 L 8 30 L 5 35" fill="none" stroke="rgba(124,58,237,0.4)" strokeWidth="1">
          <animate attributeName="d" dur="1.5s" repeatCount="indefinite" values="M 5 0 L 2 5 L 8 10 L 2 15 L 8 20 L 2 25 L 8 30 L 5 35;M 5 0 L 2 3 L 8 6 L 2 9 L 8 12 L 2 15 L 8 18 L 5 21;M 5 0 L 2 5 L 8 10 L 2 15 L 8 20 L 2 25 L 8 30 L 5 35" />
        </path>
      </svg>
      <div className="absolute w-4 h-4 rounded bg-secondary/60" style={{ animation: "shmBob 1.5s ease-in-out infinite", top: "36px", left: "calc(50% - 8px)" }} />
      <div className="absolute bottom-1 text-[7px] font-mono text-secondary-light/50">x = A sin(ωt)</div>
    </div>
  );
}

export function WavesAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <svg className="w-full h-12" viewBox="0 0 120 40">
        <path fill="none" stroke="rgba(0,212,255,0.5)" strokeWidth="1.5">
          <animate attributeName="d" dur="2s" repeatCount="indefinite" values="M 0 20 Q 15 5 30 20 Q 45 35 60 20 Q 75 5 90 20 Q 105 35 120 20;M 0 20 Q 15 35 30 20 Q 45 5 60 20 Q 75 35 90 20 Q 105 5 120 20;M 0 20 Q 15 5 30 20 Q 45 35 60 20 Q 75 5 90 20 Q 105 35 120 20" />
        </path>
        <path fill="none" stroke="rgba(124,58,237,0.3)" strokeWidth="1">
          <animate attributeName="d" dur="2s" repeatCount="indefinite" values="M 0 20 Q 15 35 30 20 Q 45 5 60 20 Q 75 35 90 20 Q 105 5 120 20;M 0 20 Q 15 5 30 20 Q 45 35 60 20 Q 75 5 90 20 Q 105 35 120 20;M 0 20 Q 15 35 30 20 Q 45 5 60 20 Q 75 35 90 20 Q 105 5 120 20" />
        </path>
      </svg>
      <div className="absolute bottom-0 text-[7px] font-mono text-accent/50">v = fλ</div>
    </div>
  );
}

export function ElectrostaticsAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Positive charge */}
      <div className="absolute left-4 w-5 h-5 rounded-full bg-danger/30 border border-danger/50 flex items-center justify-center text-[8px] font-bold text-danger" style={{ animation: "chargeRepel 2.5s ease-in-out infinite" }}>+</div>
      {/* Negative charge */}
      <div className="absolute right-4 w-5 h-5 rounded-full bg-accent/30 border border-accent/50 flex items-center justify-center text-[8px] font-bold text-accent" style={{ animation: "chargeRepelR 2.5s ease-in-out infinite" }}>−</div>
      {/* Field lines */}
      <div className="absolute w-8 h-px bg-gradient-to-r from-danger/30 via-text-muted/20 to-accent/30" style={{ animation: "fieldStretch 2.5s ease-in-out infinite" }} />
      <div className="absolute bottom-1 text-[7px] font-mono text-accent/50">F = kq₁q₂/r²</div>
    </div>
  );
}

export function CurrentElectricityAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Wire */}
      <div className="w-20 h-0.5 bg-text-muted/30 rounded" />
      {/* Flowing charges */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-energy shadow-[0_0_4px_rgba(245,158,11,0.5)]"
          style={{ animation: `currentFlow 1.5s linear infinite`, animationDelay: `${i * 0.375}s`, top: "calc(50% - 3px)" }}
        />
      ))}
      {/* Resistor symbol */}
      <div className="absolute top-3 w-6 h-3 border border-accent/30 rounded-sm" />
      <div className="absolute bottom-1 text-[7px] font-mono text-energy/50">I = V/R</div>
    </div>
  );
}

export function SemiconductorAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* PN Junction */}
      <div className="flex">
        <div className="w-8 h-10 bg-danger/15 border border-danger/30 rounded-l flex items-center justify-center">
          <span className="text-[8px] font-bold text-danger/70">P</span>
        </div>
        <div className="w-8 h-10 bg-accent/15 border border-accent/30 rounded-r flex items-center justify-center">
          <span className="text-[8px] font-bold text-accent/70">N</span>
        </div>
      </div>
      {/* Carrier movement */}
      <div className="absolute w-1 h-1 rounded-full bg-danger/60" style={{ animation: "carrierP 2s ease-in-out infinite", left: "35%" }} />
      <div className="absolute w-1 h-1 rounded-full bg-accent/60" style={{ animation: "carrierN 2s ease-in-out infinite", right: "35%" }} />
      <div className="absolute bottom-1 text-[7px] font-mono text-accent/50">Diode</div>
    </div>
  );
}

export function EMIAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Coil */}
      <div className="w-10 h-8 rounded border-2 border-accent/30" />
      {/* Moving magnet */}
      <div className="absolute flex h-3 rounded overflow-hidden" style={{ animation: "magnetMove 2s ease-in-out infinite" }}>
        <div className="w-3 bg-danger/60 text-[5px] flex items-center justify-center text-white font-bold">N</div>
        <div className="w-3 bg-accent/60 text-[5px] flex items-center justify-center text-white font-bold">S</div>
      </div>
      {/* EMF spark */}
      <div className="absolute top-2 right-3 w-1 h-1 rounded-full bg-energy" style={{ animation: "emfSpark 2s ease-in-out infinite" }} />
      <div className="absolute bottom-1 text-[7px] font-mono text-accent/50">ε = -dΦ/dt</div>
    </div>
  );
}

export function ACAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <svg className="w-full h-10" viewBox="0 0 100 30">
        <path fill="none" stroke="rgba(245,158,11,0.5)" strokeWidth="1.5">
          <animate attributeName="d" dur="1.5s" repeatCount="indefinite" values="M 0 15 C 12 0 25 0 37 15 C 50 30 62 30 75 15 C 87 0 100 0 100 15;M 0 15 C 12 30 25 30 37 15 C 50 0 62 0 75 15 C 87 30 100 30 100 15;M 0 15 C 12 0 25 0 37 15 C 50 30 62 30 75 15 C 87 0 100 0 100 15" />
        </path>
        {/* Zero line */}
        <line x1="0" y1="15" x2="100" y2="15" stroke="rgba(148,163,184,0.2)" strokeWidth="0.5" />
      </svg>
      <div className="absolute bottom-0 text-[7px] font-mono text-energy/50">V = V₀sin(ωt)</div>
    </div>
  );
}

export function RayOpticsAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Prism */}
      <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[24px] border-b-secondary/30" />
      {/* Rainbow dispersion */}
      {["#ef4444", "#f59e0b", "#22c55e", "#00d4ff", "#7c3aed"].map((color, i) => (
        <div
          key={i}
          className="absolute w-6 h-px origin-left"
          style={{
            background: color,
            opacity: 0.5,
            right: "8px",
            top: `${35 + i * 5}%`,
            transform: `rotate(${-10 + i * 5}deg)`,
            animation: `rainbowSpread 3s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
      {/* Incident white light */}
      <div className="absolute left-3 top-[42%] w-6 h-px bg-white/40" />
    </div>
  );
}

export function ModernPhysicsAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Nucleus */}
      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-accent to-secondary shadow-[0_0_10px_rgba(0,212,255,0.4)]" />
      {/* Electron orbits */}
      <div className="absolute inset-3 rounded-full border border-accent/20" style={{ animation: "spin 3s linear infinite" }}>
        <div className="absolute -top-1 left-1/2 w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_4px_rgba(0,212,255,0.6)]" />
      </div>
      <div className="absolute inset-1 rounded-full border border-secondary/15" style={{ animation: "spin 5s linear infinite", animationDirection: "reverse" }}>
        <div className="absolute top-1/2 -right-0.5 w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_4px_rgba(124,58,237,0.6)]" />
      </div>
      {/* Photon emission */}
      <div className="absolute right-2 top-3 w-1 h-1 rounded-full bg-energy" style={{ animation: "photonEmit 2s ease-out infinite" }} />
      <div className="absolute bottom-1 text-[7px] font-mono text-accent/50">E = hν</div>
    </div>
  );
}

export function SemiconductorAdvancedAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Transistor symbol */}
      <div className="w-10 h-12 border border-accent/30 rounded flex flex-col items-center justify-center gap-0.5">
        <span className="text-[6px] text-accent/60">C</span>
        <div className="w-4 h-px bg-accent/30" />
        <span className="text-[6px] text-secondary-light/60">B</span>
        <div className="w-4 h-px bg-accent/30" />
        <span className="text-[6px] text-energy/60">E</span>
      </div>
      {/* Signal flow */}
      <div className="absolute left-1 w-2 h-2 rounded-full bg-secondary/40" style={{ animation: "signalFlow 1.5s ease-in-out infinite" }} />
      <div className="absolute bottom-1 text-[7px] font-mono text-accent/50">BJT</div>
    </div>
  );
}

/* Map chapter names to animation components */
const animationMap: Record<string, () => JSX.Element> = {
  motion: MotionAnimation,
  "force and laws of motion": ForceAnimation,
  gravitation: GravitationAnimation,
  "gravitation (advanced)": GravitationAnimation,
  "work and energy": WorkEnergyAnimation,
  "work, energy & power": WorkEnergyAnimation,
  sound: SoundAnimation,
  "light (reflection & refraction)": LightAnimation,
  "human eye & defects": HumanEyeAnimation,
  electricity: ElectricityAnimation,
  magnetism: MagnetismAnimation,
  "units & measurements": UnitsAnimation,
  kinematics: KinematicsAnimation,
  "kinematics (basic)": KinematicsAnimation,
  "laws of motion": ForceAnimation,
  "laws of motion (basic)": ForceAnimation,
  "rotational motion": RotationalAnimation,
  "properties of matter": PropertiesOfMatterAnimation,
  thermodynamics: ThermodynamicsAnimation,
  "oscillations (shm)": OscillationsAnimation,
  waves: WavesAnimation,
  electrostatics: ElectrostaticsAnimation,
  "electrostatics (basic)": ElectrostaticsAnimation,
  "current electricity": CurrentElectricityAnimation,
  "current electricity (basic)": CurrentElectricityAnimation,
  semiconductors: SemiconductorAnimation,
  "semiconductors (intro)": SemiconductorAnimation,
  "semiconductors (advanced)": SemiconductorAdvancedAnimation,
  "magnetism & emi": EMIAnimation,
  "alternating current": ACAnimation,
  "ray optics & wave optics": RayOpticsAnimation,
  "modern physics": ModernPhysicsAnimation,
};

export function getChapterAnimation(chapterName: string): (() => JSX.Element) | null {
  const lower = chapterName.toLowerCase();
  if (animationMap[lower]) return animationMap[lower];
  // Partial match
  for (const [key, anim] of Object.entries(animationMap)) {
    if (lower.includes(key) || key.includes(lower)) return anim;
  }
  return null;
}
