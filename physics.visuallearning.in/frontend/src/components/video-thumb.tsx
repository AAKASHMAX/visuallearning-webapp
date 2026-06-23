"use client";
import { useEffect, useState } from "react";

// Live video thumbnails. For Vimeo, vumbnail.com caches ~30 days so updated
// thumbnails don't sync — we use Vimeo oEmbed which returns the CURRENT
// (content-hashed) thumbnail URL. YouTube thumbnails are stable so we use them
// directly. Cached per id for the session; vumbnail is only a fallback.
const cache = new Map<string, string>();

function parse(url?: string | null): { kind: "vimeo" | "youtube" | null; id: string } {
  if (!url) return { kind: null, id: "" };
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { kind: "vimeo", id: vm[1] };
  let id = "";
  if (url.includes("youtu.be/")) id = url.split("youtu.be/")[1]?.split("?")[0] || "";
  else if (url.includes("v=")) id = url.split("v=")[1]?.split("&")[0] || "";
  else if (url.includes("/embed/")) id = url.split("/embed/")[1]?.split("?")[0] || "";
  else if (url.includes("/shorts/")) id = url.split("/shorts/")[1]?.split("?")[0] || "";
  return id ? { kind: "youtube", id } : { kind: null, id: "" };
}

export function VideoThumb({ url, alt, className }: { url?: string | null; alt?: string; className?: string }) {
  const { kind, id } = parse(url);
  const ytSrc = kind === "youtube" ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  const [src, setSrc] = useState<string | null>(() => (kind === "vimeo" ? (cache.get(id) ?? null) : ytSrc));

  useEffect(() => {
    if (kind !== "vimeo") { setSrc(ytSrc); return; }
    const cached = cache.get(id);
    if (cached) { setSrc(cached); return; }
    let active = true;
    const fallback = `https://vumbnail.com/${id}.jpg`;
    fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}&width=640`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const u = d?.thumbnail_url as string | undefined;
        if (u) { cache.set(id, u); if (active) setSrc(u); }
        else if (active) setSrc(fallback);
      })
      .catch(() => { if (active) setSrc(fallback); });
    return () => { active = false; };
  }, [kind, id, ytSrc]);

  if (!src) return null;
  return <img src={src} alt={alt} loading="lazy" className={className} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />;
}
