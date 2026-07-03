"use client";
import { useEffect, useState } from "react";
import { FileText, Download, X } from "lucide-react";

// One-time popup (10s after a new visit) inviting the visitor to download the
// Course Content Catalog PDF. Remembered via localStorage so it shows once.
export function CatalogModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem("vl_catalog_seen")) return;
    } catch {
      return;
    }
    const t = setTimeout(() => setShow(true), 10000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem("vl_catalog_seen", "1");
    } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 rounded-full bg-white/20 p-1 text-white transition-colors hover:bg-white/30"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-dark px-6 pb-8 pt-9 text-center text-white">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <FileText className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-black">Free Course Content Catalog</h3>
          <p className="mx-auto mt-1 max-w-xs text-sm leading-6 text-blue-100">
            See everything included — class-wise &amp; chapter-wise.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 pt-5">
          <div className="mb-4 flex justify-center gap-2 text-center">
            {[
              ["4", "Classes"],
              ["112", "Chapters"],
              ["600+", "Videos"],
              ["2,650", "Quizzes"],
            ].map(([n, l]) => (
              <div key={l} className="flex-1 rounded-xl bg-slate-50 py-2">
                <div className="text-base font-black text-primary">{n}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{l}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm leading-6 text-text-muted">
            Animated videos, visual notes, NCERT &amp; PYQ solutions and interactive quizzes for Class 9–12 Physics, Chemistry &amp; Biology.
          </p>

          <a
            href="/course-catalog.pdf"
            download="VisualLearning-Course-Catalog.pdf"
            onClick={dismiss}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-black text-white transition-colors hover:bg-primary-dark"
          >
            <Download className="h-4 w-4" /> Download Catalog (PDF)
          </a>
          <button onClick={dismiss} className="mt-3 w-full text-xs font-bold text-gray-400 hover:text-gray-600">
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
