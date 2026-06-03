"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ArrowRight, Sparkles } from "lucide-react";
import { DemoResourceViewer, DemoKind } from "./demo-resource-viewer";

export function DemoPage({ kind, title, subtitle }: { kind: DemoKind; title: string; subtitle: string }) {
  return (
    <main className="min-h-screen bg-primary">
      <Navbar />
      <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-2 text-sm text-text-muted">
          <Link href="/demo" className="hover:text-accent">Demo</Link>
          <span>/</span>
          <span className="text-text-bright font-semibold">{title}</span>
        </div>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-4 text-xs font-semibold text-accent">
            <Sparkles className="w-3.5 h-3.5" />
            Demo Preview
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-bright mb-2">{title}</h1>
          <p className="text-text-muted max-w-2xl">{subtitle}</p>
          <span className="mt-3 inline-block text-xs font-semibold text-accent">Sample: Class 12 Physics · Electric Charges and Fields</span>
        </div>

        <DemoResourceViewer kind={kind} />

        <div className="mt-10 flex justify-center">
          <Link href="/courses" className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-primary transition-all hover:gap-3 hover:bg-accent/90">
            View Plans
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
