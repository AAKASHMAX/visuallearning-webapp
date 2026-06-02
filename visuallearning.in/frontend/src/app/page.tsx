"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Atom, Zap, Play, BookOpen, FlaskConical, GraduationCap, Star,
  Check, ArrowRight, Sparkles, Monitor, Trophy, Users, ChevronRight,
  Waves, Orbit, Lightbulb, Target, Rocket, Flame, Brain, PenTool,
  Beaker, Microscope, Dna, Presentation, BookMarked, FileCheck,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-surface overflow-hidden">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <DemoShowcase />
      <FeaturesSection />
      <TopicsShowcase />

      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
}

/* ── HERO ── */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20" style={{ background: 'linear-gradient(135deg, #122348 0%, #1A3263 50%, #122348 100%)' }}>
      {/* Grid texture overlay */}
      <div className="absolute inset-0 bg-grid-dark" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#05BFDB]/10 rounded-full blur-[100px]" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-[#05BFDB]/40 rounded-full"
            style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%`, animation: `particle-float ${8 + i * 2}s linear infinite`, animationDelay: `${i * 1.5}s` }} />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark mb-6">
              <Sparkles className="w-4 h-4 text-[#05BFDB]" />
              <span className="text-sm text-white/70">India&apos;s #1 Visual Learning Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              <span className="text-white">See Science.</span><br />
              <span className="text-[#05BFDB]">Feel Science.</span><br />
              <span className="text-white">Master Science.</span>
            </h1>

            <p className="text-lg text-white/60 leading-relaxed max-w-lg mb-8">
              Transform how you learn with breathtaking 3D animations,
              interactive virtual experiments, and crystal-clear video lectures.
              From Class 9 to 12 &mdash; every concept visualized.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Link href="/auth/signup">
                <Button size="lg" className="group bg-[#05BFDB] hover:bg-[#05BFDB]/90 text-white">
                  Start Learning Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                  <Play className="w-5 h-5 mr-2" /> Explore Courses
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-6 text-sm text-white/50">
              {["Free tier available", "3D Animations", "CBSE Aligned"].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#05BFDB]" /><span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Atom visual */}
          <div className="hidden lg:flex justify-center items-center animate-fade-in delay-300">
            <div className="relative w-80 h-80">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-[#05BFDB] to-primary animate-pulse-glow flex items-center justify-center z-10">
                <Atom className="w-8 h-8 text-white" />
              </div>
              <div className="absolute inset-4 border border-[#05BFDB]/20 rounded-full animate-spin" style={{ animationDuration: "12s" }}>
                <div className="absolute -top-1.5 left-1/2 w-3 h-3 rounded-full bg-[#05BFDB] shadow-[0_0_10px_rgba(5,191,219,0.6)]" />
              </div>
              <div className="absolute inset-12 border border-primary-light/30 rounded-full animate-spin" style={{ animationDuration: "8s", animationDirection: "reverse" }}>
                <div className="absolute top-1/2 -right-1.5 w-3 h-3 rounded-full bg-primary-light shadow-[0_0_10px_rgba(9,99,126,0.6)]" />
              </div>
              <div className="absolute inset-0 border border-cta/10 rounded-full animate-spin" style={{ animationDuration: "16s" }}>
                <div className="absolute bottom-2 left-8 w-2 h-2 rounded-full bg-cta shadow-[0_0_10px_rgba(255,159,67,0.6)]" />
              </div>
              <div className="absolute -top-4 -right-4 glass-dark rounded-xl px-4 py-2 animate-float">
                <span className="text-[#05BFDB] font-mono text-sm">E = mc²</span>
              </div>
              <div className="absolute -bottom-4 -left-4 glass-dark rounded-xl px-4 py-2 animate-float delay-200">
                <span className="text-cta font-mono text-sm">F = ma</span>
              </div>
              <div className="absolute top-8 -left-12 glass-dark rounded-xl px-4 py-2 animate-float delay-400">
                <span className="text-success font-mono text-sm">V = IR</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── STATS BAR ── */
function StatsBar() {
  const stats = [
    { value: "500+", label: "3D Animated Videos", icon: Play },
    { value: "100+", label: "Chapter Wise Notes", icon: Monitor },
    { value: "10K+", label: "Students", icon: Users },
    { value: "1000+", label: "MCQ", icon: Target },
  ];
  return (
    <section className="relative -mt-1 z-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="glass rounded-2xl p-8 glow-primary">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <s.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-2xl sm:text-3xl font-bold text-heading mb-1">{s.value}</div>
                <div className="text-sm text-text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── DEMO SHOWCASE (Visualize Every Concept) ── */
function DemoShowcase() {
  const demos = [
    { title: "3D Animated Videos", description: "Watch complex concepts come alive with immersive 3D animations and walkthroughs.", href: "/demo/video", icon: Monitor, gradient: "from-violet-600 via-purple-500 to-fuchsia-500", glow: "shadow-violet-500/20" },
    { title: "Visual Notes", description: "Beautifully structured notes with highlights, diagrams, and key takeaways for revision.", href: "/demo/visual-notes", icon: BookOpen, gradient: "from-sky-600 via-cyan-500 to-blue-500", glow: "shadow-sky-500/20" },
    { title: "Presentations (PPTs)", description: "Ready-to-use teaching slides with clear visuals and structured chapter flow.", href: "/demo/ppt", icon: Presentation, gradient: "from-indigo-600 via-blue-500 to-cyan-500", glow: "shadow-indigo-500/20" },
    { title: "NCERT Solutions", description: "Step-by-step NCERT answers with exam tips and key insights for every question.", href: "/demo/ncert-solution", icon: BookMarked, gradient: "from-emerald-600 via-teal-500 to-cyan-500", glow: "shadow-emerald-500/20" },
    { title: "PYQ Solutions", description: "Year-wise solved board exam questions with marking schemes and answer strategies.", href: "/demo/pyq", icon: FileCheck, gradient: "from-rose-600 via-orange-500 to-amber-500", glow: "shadow-rose-500/20" },
    { title: "Interactive Quiz", description: "MCQ quizzes with instant feedback, score tracking, and detailed result analysis.", href: "/demo/quiz", icon: Target, gradient: "from-amber-500 via-orange-500 to-rose-500", glow: "shadow-amber-500/20" },
  ];

  // Duplicate for seamless infinite scroll
  const items = [...demos, ...demos];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-card-border to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#05BFDB]/5 rounded-full blur-[150px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <Sparkles className="w-4 h-4 text-cta" />
            <span className="text-sm text-text-muted">Explore Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-heading mb-4">
            Visualize Every <span className="gradient-text">Concept</span>
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            Experience every feature with interactive demos &mdash; no login required.
          </p>
        </div>
      </div>

      {/* Infinite scrolling marquee */}
      <div className="relative">
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-surface to-transparent sm:w-32" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-surface to-transparent sm:w-32" />

        <div className="flex animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused] gap-5 w-max px-4">
          {items.map((d, i) => (
            <div key={i} className="w-[280px] shrink-0 group">
              <div className="h-full rounded-2xl border border-card-border bg-white p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#05BFDB]/30 card-shadow">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${d.gradient} flex items-center justify-center mb-4 shadow-lg ${d.glow} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <d.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-base font-bold text-heading mb-2">{d.title}</h3>
                <p className="text-xs text-text-muted leading-relaxed mb-5 flex-1">{d.description}</p>
                <Link
                  href={d.href}
                  className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-white hover:gap-3"
                >
                  Watch Demo
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mt-10">
          <Link href="/demo">
            <Button size="lg" className="group bg-primary hover:bg-primary-dark text-white">
              Explore All Demos <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── FEATURES ── */
function FeaturesSection() {
  const features = [
    { icon: Monitor, title: "3D Animated Videos", description: "Watch complex concepts come alive with stunning 3D animations. Visualize molecular structures, electromagnetic waves, and more.", gradient: "from-[#05BFDB] to-blue-600" },
    { icon: FlaskConical, title: "Virtual Lab Experiments", description: "Conduct virtual experiments in your browser. From optics to electricity — safe, interactive, and always available.", gradient: "from-purple-500 to-purple-700" },
    { icon: BookOpen, title: "Detailed Chapter Notes", description: "Download comprehensive PDF notes for every chapter. Revise formulas, derivations, and key concepts anytime.", gradient: "from-emerald-500 to-teal-600" },
    { icon: Target, title: "MCQ Practice Quizzes", description: "Test your understanding with chapter-wise quizzes. Get instant feedback and track your progress.", gradient: "from-rose-500 to-pink-600" },
  ];

  return (
    <section className="py-24 relative bg-white">
      <div className="absolute inset-0 bg-dots opacity-30" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <Zap className="w-4 h-4 text-cta" />
            <span className="text-sm text-text-muted">Why Visual Learning?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-heading mb-4">
            Everything You Need to <span className="gradient-text">Excel</span>
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            A complete learning ecosystem designed to make every concept crystal clear and every formula stick.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="group rounded-2xl border border-card-border bg-white p-7 hover:border-[#05BFDB]/30 transition-all duration-500 hover:-translate-y-1 card-shadow hover:shadow-lg">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-heading mb-2">{f.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── TOPICS ── */
function TopicsShowcase() {
  const topics = [
    { name: "Mechanics", icon: Orbit, description: "Motion, Forces, Gravitation" },
    { name: "Optics", icon: Lightbulb, description: "Light, Lenses, Mirrors" },
    { name: "Electricity", icon: Zap, description: "Current, Circuits, EMF" },
    { name: "Organic Chemistry", icon: Beaker, description: "Reactions, Hydrocarbons" },
    { name: "Cell Biology", icon: Microscope, description: "Cell Structure, Division" },
    { name: "Genetics", icon: Dna, description: "Heredity, DNA, Evolution" },
    { name: "Thermodynamics", icon: FlaskConical, description: "Heat, Energy, Entropy" },
    { name: "Waves", icon: Waves, description: "Sound, EM Waves, Interference" },
  ];

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <Atom className="w-4 h-4 text-primary" />
            <span className="text-sm text-text-muted">What You&apos;ll Learn</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-heading mb-4">
            Complete Science <span className="gradient-text">Curriculum</span>
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            Covering every major topic from Class 9 to 12, aligned with CBSE and state board syllabi.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {topics.map((t, i) => (
            <div key={i} className="group rounded-2xl border border-card-border bg-white p-6 text-center hover:border-[#05BFDB]/30 transition-all duration-500 hover:-translate-y-1 card-shadow cursor-default">
              <div className="w-12 h-12 mx-auto rounded-xl bg-primary-light flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <t.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-heading mb-1">{t.name}</h3>
              <p className="text-xs text-text-muted">{t.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}



/* ── TESTIMONIALS ── */
function TestimonialsSection() {
  const testimonials = [
    { name: "Priya Sharma", cls: "Class 12, CBSE", text: "The 3D animations made optics so easy to understand! I scored 95 in physics board exam after using VisualLearning.", rating: 5 },
    { name: "Rahul Verma", cls: "Class 11, State Board", text: "Virtual lab experiments are amazing. I can actually see how circuits work instead of just reading about them.", rating: 5 },
    { name: "Ananya Patel", cls: "Class 10, ICSE", text: "Best learning platform! The animations make complex concepts so simple. My grades improved from B to A+.", rating: 5 },
  ];

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm text-text-muted">Student Stories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-heading mb-4">
            Loved by <span className="gradient-text">Students</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="rounded-2xl border border-card-border bg-white p-8 hover:border-[#05BFDB]/20 transition-all duration-500 card-shadow">
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 text-cta fill-cta" />)}
              </div>
              <p className="text-text-muted text-sm leading-relaxed mb-6 italic">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#05BFDB] to-primary flex items-center justify-center text-white font-bold text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-heading">{t.name}</p>
                  <p className="text-xs text-text-muted">{t.cls}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA ── */
function CTASection() {
  return (
    <section className="py-24 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#05BFDB]/20 via-primary/10 to-surface" />
          <div className="absolute inset-0 bg-grid opacity-10" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#05BFDB]/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-[60px]" />

          <div className="relative z-10 text-center py-16 px-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#05BFDB] to-primary flex items-center justify-center mb-6 animate-pulse-glow">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-heading mb-4">Ready to Master Science?</h2>
            <p className="text-text-muted max-w-lg mx-auto mb-8">
              Join thousands of students who are already visualizing their way to mastery. Start with our free course today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/auth/signup">
                <Button size="lg" className="group bg-primary hover:bg-primary-dark text-white">
                  Start Learning Now <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <p className="text-text-muted text-sm mt-4">No credit card required &bull; Free tier available</p>
          </div>
        </div>
      </div>
    </section>
  );
}
