"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Lightbulb,
  BookOpen,
  Rocket,
  Check,
  ChevronRight,
  Lock,
  Sparkles,
  GraduationCap,
  Target,
} from "lucide-react";

const courses = [
  {
    tier: "FREE",
    title: "Free Course",
    subtitle: "Get Started",
    description:
      "Explore the world of physics with free animated videos, basic notes, and introductory quizzes. Perfect for curious minds.",
    features: [
      "First chapter of every topic free",
      "Selected 3D animations",
      "Basic chapter notes",
      "Introductory MCQ quizzes",
      "No signup required for preview",
    ],
    icon: Lightbulb,
    gradient: "from-emerald-500 to-teal-600",
    borderColor: "border-emerald-500/30",
    glowColor: "hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]",
    tag: "Free Forever",
    tagColor: "bg-emerald-500/10 text-emerald-400",
    price: "0",
    period: "forever",
    locked: false,
  },
  {
    tier: "BASIC",
    title: "Basic Course",
    subtitle: "Build Foundation",
    description:
      "Complete chapter-wise video lectures with notes and quizzes. Ideal for building strong physics fundamentals.",
    features: [
      "All animated video lectures",
      "Complete chapter notes (PDF)",
      "Chapter-wise MCQ quizzes",
      "Progress tracking dashboard",
      "Video playback controls",
      "Bookmark & resume learning",
    ],
    icon: BookOpen,
    gradient: "from-accent to-blue-600",
    borderColor: "border-accent/30",
    glowColor: "hover:shadow-[0_0_40px_rgba(0,212,255,0.15)]",
    tag: "Most Popular",
    tagColor: "bg-accent/10 text-accent",
    price: "299",
    period: "/month",
    locked: true,
  },
  {
    tier: "ADVANCE",
    title: "Advance Course",
    subtitle: "Go Beyond",
    description:
      "Everything in Basic plus expert lecture videos, virtual lab experiments, board paper practice, and priority support.",
    features: [
      "Everything in Basic",
      "Expert lecture videos",
      "3D Virtual Lab experiments",
      "Previous year board papers",
      "Detailed video solutions",
      "Priority doubt support",
    ],
    icon: Rocket,
    gradient: "from-secondary to-purple-600",
    borderColor: "border-secondary/30",
    glowColor: "hover:shadow-[0_0_40px_rgba(124,58,237,0.15)]",
    tag: "Best Value",
    tagColor: "bg-secondary/10 text-secondary-light",
    price: "499",
    period: "/month",
    locked: true,
  },
  {
    tier: "BRIDGE",
    title: "Physics Bridge Course",
    subtitle: "Master the Basics",
    description:
      "A comprehensive bridge course focusing on fundamental physics concepts to prepare you for advanced topics.",
    features: [
      "Core physics concepts",
      "Interactive foundational modules",
      "Basic mathematics for physics",
      "Conceptual doubt clearing",
      "Foundation strengthening tests",
    ],
    icon: Target,
    gradient: "from-orange-500 to-red-600",
    borderColor: "border-orange-500/30",
    glowColor: "hover:shadow-[0_0_40px_rgba(249,115,22,0.15)]",
    tag: "Premium",
    tagColor: "bg-orange-500/10 text-orange-400",
    price: "999",
    period: "/month",
    locked: true,
  },
];

export default function CoursesPage() {
  return (
    <main className="min-h-screen bg-primary">
      <Navbar />
      <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <GraduationCap className="w-4 h-4 text-accent" />
            <span className="text-sm text-text-muted">Choose Your Path</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-bright mb-4">
            Physics <span className="gradient-text">Courses</span>
          </h1>
          <p className="text-text-muted max-w-2xl mx-auto">
            Whether you&apos;re just starting or preparing for board exams, pick the
            course that fits your learning goals.
          </p>
        </div>

        {/* Course Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {courses.map((course, i) => (
            <div
              key={i}
              className={`relative rounded-2xl border ${course.borderColor} bg-card p-8 transition-all duration-500 ${course.glowColor} hover:-translate-y-2 group flex flex-col`}
            >
              {/* Tag */}
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-6 w-fit ${course.tagColor}`}>
                {course.tag}
              </div>

              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${course.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <course.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-xl font-bold text-text-bright mb-1">
                {course.title}
              </h3>
              <p className="text-sm text-accent mb-2">{course.subtitle}</p>

              {/* Price */}
              <div className="mb-4">
                <span className="text-text-muted text-lg">&#8377;</span>
                <span className="text-3xl font-extrabold text-text-bright">{course.price}</span>
                <span className="text-text-muted text-sm ml-1">{course.period}</span>
              </div>

              <p className="text-text-muted text-sm leading-relaxed mb-6">
                {course.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {course.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    <span className="text-text-muted">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href={`/courses/${course.tier.toLowerCase()}`}>
                <Button
                  variant={i === 1 ? "primary" : i === 2 ? "secondary" : "outline"}
                  className="w-full"
                >
                  {course.locked && <Lock className="w-4 h-4 mr-2" />}
                  Start Learning
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 glass rounded-full px-6 py-3">
            <Sparkles className="w-4 h-4 text-energy" />
            <span className="text-sm text-text-muted">
              All plans include access to our community and learning resources
            </span>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
