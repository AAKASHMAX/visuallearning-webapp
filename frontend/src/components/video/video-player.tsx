"use client";
import { useEffect, useRef, useCallback } from "react";
import api from "@/lib/api";

interface VideoPlayerProps {
  youtubeVideoId: string;
  videoId: string;
  title: string;
}

export function VideoPlayer({ youtubeVideoId, videoId, title }: VideoPlayerProps) {
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

  return (
    <div ref={containerRef} className="video-container w-full">
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`}
          title={title}
          className="absolute inset-0 w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
