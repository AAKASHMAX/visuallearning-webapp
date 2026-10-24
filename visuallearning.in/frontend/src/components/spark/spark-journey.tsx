"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpRight, Play, Smartphone } from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { useAuth } from "@/lib/auth";
import { APP_PUBLISHED, PLAY_STORE_URL } from "@/lib/app-links";
import { BEATS, SUBJECTS, SUBJECT_START, type SubjectKey } from "./content";
import { classHref, lessonHref } from "./lesson-link";
import { scramble } from "./scramble";
import { ExploreDock } from "./explore-dock";
import type { SparkEngine, Tier } from "./engine/engine";
import "./spark.css";

/** Scroll distance per scene, in viewport heights. */
const BEAT_VH = 1.15;
const LAST = BEATS.length - 1;
const RAIL: SubjectKey[] = ["physics", "chemistry", "biology"];

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Phones and modest machines get fewer particles and no glow pass; ?quality= overrides. */
function detectTier(): Tier {
  const forced = new URLSearchParams(window.location.search).get("quality");
  if (forced === "high" || forced === "low") return forced;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  return coarse || small || cores <= 4 || memory <= 4 ? "low" : "high";
}

export function SparkJourney({ fonts }: { fonts: { display: string; mono: string } }) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beatRefs = useRef<(HTMLElement | null)[]>([]);
  const headRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const reducedRef = useRef(false);
  const [active, setActive] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">("loading");
  const [opening, setOpening] = useState<string | null>(null);
  // The homepage greets signed-in students with their dashboard instead of sign-up.
  const { user, isAuthenticated, hydrate } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);
  const signedIn = mounted && isAuthenticated;
  const dashboardHref = user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard";

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    reducedRef.current = reduced;
    let engine: SparkEngine | null = null;
    let disposed = false;
    let raf = 0;
    let beatPx = window.innerHeight * BEAT_VH;

    const layout = () => {
      beatPx = window.innerHeight * BEAT_VH;
      if (spacerRef.current) spacerRef.current.style.height = `${LAST * beatPx + window.innerHeight}px`;
      engine?.resize(window.innerWidth, window.innerHeight);
    };
    layout();

    const tier = detectTier();
    (async () => {
      try {
        // Canvas text (labels, the periodic table) needs the fonts loaded first.
        await Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 1500))]);
        const { SparkEngine: Engine } = await import("./engine/engine");
        if (disposed || !canvasRef.current) return;
        const created = new Engine(canvasRef.current, {
          tier,
          fonts: { display: fonts.display, mono: fonts.mono, body: "Inter, system-ui, sans-serif" },
          reducedMotion: reduced,
        });
        await created.warmUp();
        if (disposed) {
          created.dispose();
          return;
        }
        engine = created;
        layout();
        setStatus("ready");
      } catch (err) {
        console.warn("Spark journey: 3D is not available here", err);
        if (!disposed) setStatus("fallback");
      }
    })();

    const clampP = (p: number) => Math.min(LAST, Math.max(0, p));
    let shown = clampP(window.scrollY / beatPx);
    let last = performance.now();

    const paint = (sp: number) => {
      beatRefs.current.forEach((el, i) => {
        if (!el) return;
        const d = sp - i;
        const o = 1 - smoothstep(0.26, 0.5, Math.abs(d));
        el.style.opacity = String(o);
        el.style.transform = `translate3d(0, ${(-d * 46).toFixed(1)}px, 0)`;
        el.style.visibility = o < 0.01 ? "hidden" : "visible";
        el.inert = o < 0.5;
      });
      const now = Math.round(sp);
      if (now !== activeRef.current) {
        activeRef.current = now;
        setActive(now);
      }
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${(sp / LAST).toFixed(4)})`;
      if (hintRef.current) hintRef.current.style.opacity = String(1 - smoothstep(0.04, 0.22, sp));
      // Past the last scene the page carries on (about, FAQ, footer): the rail and the dock step aside.
      const past = (window.scrollY - LAST * beatPx) / window.innerHeight;
      const away = smoothstep(0.05, 0.4, past);
      if (railRef.current) railRef.current.style.opacity = String(1 - away);
      if (dockRef.current) {
        dockRef.current.style.opacity = String(1 - away);
        dockRef.current.style.pointerEvents = away > 0.5 ? "none" : "";
        dockRef.current.style.visibility = away > 0.99 ? "hidden" : "visible";
      }
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      const target = clampP(window.scrollY / beatPx);
      shown += (target - shown) * (1 - Math.exp(-dt * (reduced ? 40 : 6.5)));
      if (Math.abs(target - shown) < 0.0004) shown = target;
      paint(shown);
      // Once the sections after the journey cover the screen, stop drawing the 3D.
      if (window.scrollY - LAST * beatPx < window.innerHeight * 1.05) engine?.frame(shown, dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      engine?.setPointer((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    };
    window.addEventListener("resize", layout);
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", layout);
      window.removeEventListener("pointermove", onPointer);
      engine?.dispose();
    };
  }, [fonts.display, fonts.mono]);

  // Each headline decodes itself as its scene arrives.
  useEffect(() => {
    if (reducedRef.current) return;
    const el = headRefs.current[active];
    if (!el) return;
    return scramble(el, BEATS[active].headline);
  }, [active]);

  const goTo = (beat: number) => {
    window.scrollTo({ top: beat * window.innerHeight * BEAT_VH, behavior: reducedRef.current ? "auto" : "smooth" });
  };

  const openLesson = async (key: string, resolve: () => Promise<string>) => {
    setOpening(key);
    const href = await resolve();
    router.push(href);
  };

  const subject = BEATS[active].subject;
  const railSubject = subject === "intro" ? null : subject === "finale" ? null : subject;

  return (
    <div className={`sj-root is-${status}`} data-subject={subject} style={{ ["--sj-accent" as string]: SUBJECTS[subject].color }}>
      <div className="sj-stage" aria-hidden="true">
        <div className="sj-fallback">
          <span className="sj-fallback-spark" />
        </div>
        <canvas ref={canvasRef} className="sj-canvas" />
      </div>

      <header className="sj-header">
        <Brand />
        <nav className="sj-nav" aria-label="Main">
          <Link href="/courses">Courses</Link>
          <Link href="/courses/virtual-lab">Virtual lab</Link>
          <Link href="/pricing">Plans</Link>
          <Link href="/#about">About</Link>
        </nav>
        <div className="sj-header-actions">
          {signedIn ? (
            <Link href={dashboardHref} className="sj-button sj-button-small">
              Dashboard <ArrowUpRight size={15} />
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="sj-login">Log in</Link>
              <Link href="/auth/signup" className="sj-button sj-button-small">Start free</Link>
            </>
          )}
        </div>
      </header>

      <nav ref={railRef} className="sj-rail" aria-label="Jump to a subject">
        {RAIL.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => goTo(SUBJECT_START[key] ?? 0)}
            className={railSubject === key ? "is-current" : ""}
            style={{ ["--sj-dot" as string]: SUBJECTS[key].color }}
            aria-current={railSubject === key ? "step" : undefined}
          >
            <span className="sj-rail-name">{SUBJECTS[key].name}</span>
            <span className="sj-rail-dot" />
          </button>
        ))}
        <p className="sj-rail-scene">
          <span>{BEATS[active].label}</span>
          <strong>{String(active).padStart(2, "0")} / {String(LAST).padStart(2, "0")}</strong>
        </p>
      </nav>

      <main className="sj-overlay">
        {BEATS.map((beat, i) => {
          const Heading = i === 0 ? "h1" : "h2";
          const lessonKey = `lesson-${i}`;
          return (
            <section
              key={i}
              ref={(el) => {
                beatRefs.current[i] = el;
              }}
              className={`sj-beat${i === 0 ? " is-hero" : ""}${i === LAST ? " is-final" : ""}${i === active ? " is-active" : ""}`}
              style={{ ["--sj-accent" as string]: SUBJECTS[beat.subject].color, opacity: i === 0 ? 1 : 0 }}
              aria-labelledby={`sj-h-${i}`}
            >
              <div className="sj-copy">
                <p className="sj-eyebrow">
                  <span className="sj-eyebrow-dot" />
                  {beat.eyebrow}
                </p>
                <Heading id={`sj-h-${i}`} className="sj-headline">
                  <span className="sj-sr">{beat.headline}</span>
                  <span
                    aria-hidden="true"
                    ref={(el) => {
                      headRefs.current[i] = el;
                    }}
                    dangerouslySetInnerHTML={{ __html: escapeHtml(beat.headline) }}
                  />
                </Heading>
                <p className="sj-body">{beat.body}</p>
                {beat.formula && (
                  <p className="sj-formula">
                    <span dangerouslySetInnerHTML={{ __html: beat.formula }} />
                  </p>
                )}
                {beat.lesson && (
                  <a
                    href="/courses"
                    className="sj-lesson"
                    onClick={(e) => {
                      e.preventDefault();
                      const lesson = beat.lesson!;
                      void openLesson(lessonKey, () => lessonHref(lesson));
                    }}
                  >
                    <span className="sj-lesson-play">
                      <Play size={13} fill="currentColor" />
                    </span>
                    <span className="sj-lesson-text">
                      <small>
                        Class {beat.lesson.cls} · {beat.lesson.subject}
                      </small>
                      <strong>{beat.lesson.chapter}</strong>
                    </span>
                    <span className="sj-lesson-go">
                      {opening === lessonKey ? "Opening…" : "Watch the 3D lesson"} <ArrowUpRight size={15} />
                    </span>
                  </a>
                )}
                {i === 0 && (
                  <div className="sj-hero-actions">
                    <Link href={signedIn ? dashboardHref : "/auth/signup"} className="sj-button">
                      {signedIn ? "Continue learning" : "Start exploring free"} <ArrowUpRight size={17} />
                    </Link>
                    <button type="button" className="sj-ghost" onClick={() => goTo(1)}>
                      Follow the spark <ArrowDown size={15} />
                    </button>
                  </div>
                )}
                {i === LAST && (
                  <div className="sj-final">
                    <div className="sj-final-actions">
                      <Link href={signedIn ? dashboardHref : "/auth/signup"} className="sj-button">
                        {signedIn ? "Continue learning" : "Start exploring free"} <ArrowUpRight size={17} />
                      </Link>
                      <Link href="/demo/video" className="sj-ghost">
                        <Play size={14} fill="currentColor" /> Watch a 3D lesson
                      </Link>
                    </div>
                    <div className="sj-classes" role="group" aria-label="Choose your class">
                      <span>Pick your class</span>
                      {[9, 10, 11, 12].map((n) => (
                        <a
                          key={n}
                          href="/courses"
                          onClick={(e) => {
                            e.preventDefault();
                            void openLesson(`class-${n}`, () => classHref(n));
                          }}
                        >
                          {opening === `class-${n}` ? "…" : n}
                        </a>
                      ))}
                    </div>
                    <div className="sj-final-links">
                      {APP_PUBLISHED && (
                        <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
                          <Smartphone size={15} /> Get the Android app
                        </a>
                      )}
                      <button type="button" onClick={() => goTo(0)}>
                        <ArrowUp size={15} /> Replay the journey
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </main>

      <div ref={dockRef} className="sj-dock-wrap">
        <ExploreDock beat={active} />
      </div>

      <div ref={hintRef} className="sj-hint" aria-hidden="true">
        <span>Scroll to follow the spark</span>
        <i />
      </div>
      <div className="sj-progress" aria-hidden="true">
        <div ref={progressRef} />
      </div>
      <div ref={spacerRef} className="sj-spacer" style={{ height: `${LAST * BEAT_VH * 100 + 100}vh` }} />
    </div>
  );
}
