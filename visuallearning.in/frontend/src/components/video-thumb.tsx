"use client";
import { useEffect, useState } from "react";

// Live Vimeo thumbnails. vumbnail.com caches for ~30 days, so updated thumbnails
// don't sync. Vimeo oEmbed returns the CURRENT thumbnail URL (content-hashed),
// so it always reflects the latest thumbnail. Cached per id for the session;
// vumbnail.com is only a fallback if oEmbed is unavailable.
const cache = new Map<string, string>();

export function VimeoThumb({ vimeoId, alt, className }: { vimeoId: string; alt?: string; className?: string }) {
  const [src, setSrc] = useState<string | null>(() => cache.get(vimeoId) ?? null);

  useEffect(() => {
    if (!vimeoId) return;
    const cached = cache.get(vimeoId);
    if (cached) { setSrc(cached); return; }
    let active = true;
    const fallback = `https://vumbnail.com/${vimeoId}.jpg`;
    fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${vimeoId}&width=640`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const url = d?.thumbnail_url as string | undefined;
        if (url) { cache.set(vimeoId, url); if (active) setSrc(url); }
        else if (active) setSrc(fallback);
      })
      .catch(() => { if (active) setSrc(fallback); });
    return () => { active = false; };
  }, [vimeoId]);

  if (!src) return null;
  return <img src={src} alt={alt} loading="lazy" className={className} />;
}
