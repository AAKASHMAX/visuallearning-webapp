import { Download } from "lucide-react";

// Floating "Course Catalog" download widget (right side). Downloads the PDF
// catalog served from /public.
export function CatalogButton() {
  return (
    <a
      href="/course-catalog.pdf"
      download="VisualLearning-Course-Catalog.pdf"
      aria-label="Download the course content catalog (PDF)"
      className="group fixed bottom-40 right-5 z-[69] inline-flex items-center gap-2.5 rounded-full bg-primary py-2 pl-4 pr-2 text-white shadow-[0_8px_30px_rgba(26,50,99,0.35)] ring-1 ring-black/5 transition-all hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-[0_12px_36px_rgba(26,50,99,0.45)]"
    >
      <span className="text-sm font-bold">Course Catalog</span>
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
        <Download className="h-[18px] w-[18px]" />
      </span>
    </a>
  );
}
