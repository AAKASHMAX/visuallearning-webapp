"use client";
import { useEffect, useRef, useCallback } from "react";
import api from "@/lib/api";

interface VideoPlayerProps {
  youtubeVideoId?: string | null;
  vimeoVideoId?: string | null;
  videoId: string;
  title: string;
}

export function VideoPlayer({ youtubeVideoId, vimeoVideoId, videoId, title }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval>>();

  const updateProgress = useCallback(async (progress: number) => {
    try {
      await api.post("/progress/update", { videoId, progress, completed: progress >= 95 });
    } catch {}
  }, [videoId]);

  useEffect(() => {
    // Track progress every 30 seconds
    let elapsed = 0;
    progressInterval.current = setInterval(() => {
      elapsed += 30;
      const estimatedProgress = Math.min(elapsed / 900 * 100, 100); // Assume 15min avg
      updateProgress(estimatedProgress);
    }, 30000);

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [updateProgress]);

  // Disable right-click on video
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => e.preventDefault();
    el.addEventListener("contextmenu", handler);
    return () => el.removeEventListener("contextmenu", handler);
  }, []);

  // Determine which player to use
  const isVimeo = !!vimeoVideoId;
  const embedSrc = isVimeo
    ? `https://player.vimeo.com/video/${vimeoVideoId}?badge=0&autopause=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0&dnt=1`
    : `https://www.youtube-nocookie.com/embed/${youtubeVideoId}?modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=0&fs=1&controls=1&cc_load_policy=0`;

  return (
    <div ref={containerRef} className="video-container w-full">
      <div className="relative w-full overflow-hidden rounded-lg" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={embedSrc}
          title={title}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
        {/* Cover branding in bottom-right (YouTube only) */}
        {!isVimeo && (
          <>
            <div className="absolute bottom-0 right-0 w-36 h-10 bg-black/90 pointer-events-none z-10" />
            <div className="absolute top-0 right-0 w-28 h-12 bg-transparent pointer-events-auto z-10"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
          </>
        )}
      </div>
    </div>
  );
}
