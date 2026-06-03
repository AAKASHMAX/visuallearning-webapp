"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ArrowRight, Sparkles } from "lucide-react";
import { DEMOS } from "./_components/demo-list";

export default function DemoIndexPage() {
  return (
    <main className="min-h-screen bg-primary">
      <Navbar />
      <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm text-text-muted">No login required</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-bright mb-3">
            Explore Interactive <span className="gradient-text">Demos</span>
          </h1>
          <p className="text-text-muted max-w-2xl mx-auto">
            Experience every feature with real Class 12 physics content — videos, notes, NCERT solutions, PYQs, and quizzes.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DEMOS.map((demo) => {
            const Icon = demo.icon;
            return (
              <Link
                key={demo.href}
                href={demo.href}
                className="group relative flex flex-col rounded-2xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/40"
              >
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${demo.gradient} transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-text-bright">{demo.title}</h3>
                <p className="mt-1.5 text-sm text-text-muted">{demo.description}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-all group-hover:gap-2.5">
                  Watch Demo
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      <Footer />
    </main>
  );
}
