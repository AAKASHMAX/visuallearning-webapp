"use client";
import { useEffect, useState } from "react";
import { Smartphone, X } from "lucide-react";
import { APP_PUBLISHED, PLAY_STORE_URL } from "@/lib/app-links";

// One-time popup inviting visitors to install the Android app.
export function GetAppModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!APP_PUBLISHED) return; // hidden until the app is live on Play
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem("vl_get_app_seen")) return;
    } catch {
      return;
    }
    const t = setTimeout(() => setShow(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem("vl_get_app_seen", "1");
    } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={dismiss}>
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={dismiss} aria-label="Close" className="absolute right-3 top-3 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Smartphone className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-black text-heading">Get the Visual Learning App</h3>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-text-muted">
          Study on the go — 3D videos, notes, NCERT &amp; PYQ with offline downloads. Install our Android app for the best experience.
        </p>
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={dismiss}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-black text-white transition-colors hover:bg-primary-dark"
        >
          <Smartphone className="h-4 w-4" /> Download on Google Play
        </a>
        <button onClick={dismiss} className="mt-3 text-xs font-bold text-gray-400 hover:text-gray-600">
          Maybe later
        </button>
      </div>
    </div>
  );
}
