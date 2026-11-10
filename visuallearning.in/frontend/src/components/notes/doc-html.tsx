"use client";

import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

const KATEX = "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist";

// Same scoping as the course viewer: keep :root variables global, nest the rest under the viewer.
export function scopeCSS(css: string) {
  const rootMatch = css.match(/:root\s*\{([^}]+)\}/);
  const rootVars = rootMatch ? `:root{${rootMatch[1]}}` : "";
  const rest = rootMatch ? css.replace(/:root\s*\{[^}]+\}/, "") : css;
  return `${rootVars}\n.notes-html-viewer{${rest}}`;
}

// Pages fit the screen; an equation wider than a phone scrolls on its own instead of the whole page.
export const PAGE_FIT = `.notes-html-viewer .page { width: min(calc(100% - 8px), 220.5mm) !important; max-width: 220.5mm !important; margin-left: auto !important; margin-right: auto !important; }
.notes-html-viewer .katex-display { max-width: 100%; overflow-x: auto; overflow-y: hidden; }`;

export function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`failed: ${src}`));
    document.head.appendChild(s);
  });
}

/**
 * A Notes / NCERT / PYQ document, drawn the way the public document pages draw it: the document's
 * own CSS scoped to it, maths typeset where it still carries raw LaTeX, and rows too wide for a
 * phone shrunk until they fit (never below 50%). Text can't be selected or copied.
 * `lazyImages` holds back pictures until they are scrolled to, for a preview that shows only the
 * top of a long document.
 */
export function DocHtml({ html, css, lazyImages = false, className }: { html: string; css: string | null; lazyImages?: boolean; className?: string }) {
  const inner = useRef<HTMLDivElement>(null);
  const content = useMemo(() => (lazyImages ? html.replace(/<img\b(?![^>]*\bloading=)/gi, '<img loading="lazy" decoding="async"') : html), [html, lazyImages]);

  useEffect(() => {
    const el = inner.current;
    const box = el?.parentElement;
    if (!el || !box) return;
    let frame = 0;
    let cancelled = false;
    const overflow = () => box.scrollWidth - box.clientWidth;
    const fit = () => {
      el.style.removeProperty("zoom");
      if (overflow() <= 2) return;
      let zoom = 1;
      // Content reflows at each zoom, so tighten a couple of times.
      for (let i = 0; i < 3 && overflow() > 2 && zoom > 0.5; i += 1) {
        zoom = Math.max(0.5, Math.floor(zoom * (box.clientWidth / box.scrollWidth) * 100) / 100);
        el.style.setProperty("zoom", String(zoom));
      }
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };
    schedule();
    // Math and handwriting fonts arrive after the first paint and widen some rows.
    document.fonts?.ready.then(schedule).catch(() => {});
    document.fonts?.addEventListener?.("loadingdone", schedule);
    const timer = window.setTimeout(schedule, 1500);
    window.addEventListener("resize", schedule);

    // KaTeX for documents that still carry raw LaTeX ($...$, \(...\), \[...\]).
    if (content.includes("$") || content.includes("\\(") || content.includes("\\[")) {
      (async () => {
        try {
          const w = window as any;
          if (!w.katex) await loadScript(`${KATEX}/katex.min.js`);
          if (!w.renderMathInElement) await loadScript(`${KATEX}/contrib/auto-render.min.js`);
          if (cancelled) return;
          w.renderMathInElement(el, {
            delimiters: [
              { left: "$$", right: "$$", display: true },
              { left: "$", right: "$", display: false },
              { left: "\\(", right: "\\)", display: false },
              { left: "\\[", right: "\\]", display: true },
            ],
            throwOnError: false,
          });
          schedule();
        } catch {}
      })();
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      document.fonts?.removeEventListener?.("loadingdone", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [content]);

  return (
    <div
      // relative: keeps KaTeX's hidden, absolutely positioned MathML inside this box.
      className={cn("relative overflow-x-auto", className)}
      style={{ userSelect: "none", WebkitUserSelect: "none" } as React.CSSProperties}
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
    >
      <link rel="stylesheet" href={`${KATEX}/katex.min.css`} />
      {css && <style dangerouslySetInnerHTML={{ __html: scopeCSS(css) }} />}
      <style dangerouslySetInnerHTML={{ __html: PAGE_FIT }} />
      <div ref={inner} className="notes-html-viewer" style={{ color: "#1f2937" }} dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}
