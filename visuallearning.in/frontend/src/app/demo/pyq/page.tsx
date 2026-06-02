"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import { DemoResourceViewer } from "../_components/demo-resource-viewer";

export default function DemoPyqPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-2 text-sm text-text-muted">
        <Link href="/demo" className="hover:text-primary">Demo</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-heading">PYQ Solutions</span>
      </div>

      <div className="mb-6 flex flex-col gap-3">
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-rose-500/10 to-orange-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-rose-600">
          <Sparkles className="h-3.5 w-3.5" />
          Demo Preview
        </div>
        <h1 className="text-3xl font-black tracking-tight text-heading sm:text-4xl">PYQ Solutions</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
          Year-wise solved board exam questions with marking schemes and answer strategies.
        </p>
        <span className="text-xs font-bold text-rose-600">Sample: Class 12 Physics · Electric Charges and Fields</span>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="min-w-0 flex-1">
          <DemoResourceViewer kind="pyq" />
        </div>
        <div className="w-full lg:w-72">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-rose-600 via-orange-500 to-amber-500 p-5 text-white shadow-lg shadow-rose-500/20 lg:sticky lg:top-24">
            <h4 className="text-lg font-black">All PYQ Solutions</h4>
            <p className="mt-1.5 text-xs leading-relaxed text-white/70">
              Unlock year-wise solved previous year questions for every chapter.
            </p>
            <Link
              href="/courses"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-rose-600 shadow-md transition-all hover:gap-3 hover:shadow-lg"
            >
              View Plans
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
