"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { HeroSlideshow } from "@/components/home/hero-slideshow";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Play, FileText, Brain, Star } from "lucide-react";

const Footer = dynamic(() => import("@/components/layout/footer").then((m) => m.Footer), { ssr: false });

const features = [
  { icon: Play, title: "Animated Videos", desc: "Crystal-clear animated explanations for every concept" },
  { icon: BookOpen, title: "Complete Syllabus", desc: "Class 9 to 12 - Physics, Chemistry, Biology, Maths" },
  { icon: FileText, title: "Notes & PDFs", desc: "Downloadable chapter notes for revision" },
  { icon: Brain, title: "Practice Questions", desc: "MCQs with solutions for every chapter" },
];

const classes = [
  { name: "Class 9", subjects: 4, chapters: "20+", color: "from-blue-500 to-blue-700" },
  { name: "Class 10", subjects: 4, chapters: "20+", color: "from-green-500 to-green-700" },
  { name: "Class 11", subjects: 4, chapters: "20+", color: "from-purple-500 to-purple-700" },
  { name: "Class 12", subjects: 4, chapters: "20+", color: "from-orange-500 to-orange-700" },
];

const testimonials = [
  { name: "Priya S.", class: "Class 12", text: "The animated videos made complex Physics concepts so easy to understand. Scored 95% in boards!" },
  { name: "Rahul M.", class: "Class 11", text: "Chemistry was my weakest subject. VisualLearning changed that completely. Best platform for visual learners." },
  { name: "Ananya K.", class: "Class 10", text: "I love how every chapter has videos, notes, and practice questions. Everything in one place!" },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Slideshow */}
        <HeroSlideshow />

        {/* Features */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-primary">Why Students Love Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((f, i) => (
                <Card key={i} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <f.icon className="w-7 h-7 text-accent" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                    <p className="text-gray-500 text-sm">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Classes */}
        <section className="py-16 bg-surface">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-primary">Choose Your Class</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {classes.map((c) => (
                <Link key={c.name} href="/courses">
                  <div className={`bg-gradient-to-br ${c.color} text-white rounded-xl p-6 hover:scale-105 transition-transform cursor-pointer shadow-lg`}>
                    <h3 className="text-2xl font-bold mb-2">{c.name}</h3>
                    <p className="text-white/80">{c.subjects} Subjects</p>
                    <p className="text-white/80">{c.chapters} Chapters</p>
                    <div className="mt-4 text-sm font-medium">Start Learning &rarr;</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-surface">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-primary">What Students Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-3">{[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-accent text-accent" />)}</div>
                    <p className="text-gray-600 mb-4">&quot;{t.text}&quot;</p>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-sm text-gray-400">{t.class} Student</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
