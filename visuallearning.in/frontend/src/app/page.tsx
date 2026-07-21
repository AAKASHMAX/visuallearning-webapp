"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { TrialCard } from "@/components/subscription/trial-card";
import { YouTubeTrustCard } from "@/components/home/youtube-trust-card";
import { AboutSection } from "@/components/home/about-section";
import Link from "next/link";
import {
  Atom, Zap, Play, BookOpen, FlaskConical, GraduationCap, Star,
  ArrowRight, Sparkles, Monitor, Trophy, Users, ChevronRight,
  Waves, Orbit, Lightbulb, Target, Rocket, Flame, Brain, PenTool,
  Beaker, Microscope, Dna, Presentation, BookMarked, FileCheck,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-surface overflow-hidden">
      <Navbar />
      {/* YouTube social proof — first thing visitors see, builds trust up front */}
      <section className="pt-24 sm:pt-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <YouTubeTrustCard />
        </div>
      </section>
      <HeroSection />
      <StatsBar />
      {/* Limited-time offer — 3-day free trial, right after the hero */}
      <section className="pt-12 sm:pt-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <TrialCard />
        </div>
      </section>
      <AboutSection />
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
  const examTracks = [
    { title: "State Board Exam", subtitle: "Class 9–12", icon: GraduationCap, gradient: "from-emerald-500 to-teal-600" },
    { title: "CBSE Board Exam", subtitle: "Class 9–12", icon: BookMarked, gradient: "from-violet-500 to-purple-600" },
    { title: "JEE", subtitle: "Engineering", icon: Rocket, gradient: "from-sky-500 to-blue-600" },
    { title: "NEET", subtitle: "Medical", icon: Microscope, gradient: "from-rose-500 to-orange-500" },
    { title: "Competitive Exams", subtitle: "Preparation", icon: Trophy, gradient: "from-amber-500 to-yellow-600" },
  ];
  return (
    <section className="relative min-h-screen flex items-center pt-20 bg-surface">
      {/* Subtle light decoration */}
      <div className="absolute inset-0 bg-dots opacity-40" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#05BFDB]/10 rounded-full blur-[100px]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Sparkles className="w-4 h-4 text-cta" />
            <span className="text-sm text-text-muted">CBSE &amp; State Boards &middot; JEE &middot; NEET &middot; Class 9&ndash;12</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold leading-tight mb-5">
            <span className="text-heading">Build Strong Concepts.</span>{" "}
            <span className="gradient-text">Visualize Learning.</span>{" "}
            <span className="text-heading">Crack Every Exam.</span>
          </h1>

          <p className="text-base sm:text-lg text-text-muted leading-relaxed max-w-2xl mx-auto mb-10">
            One visual learning platform for school boards and competitive exams &mdash; from
            Class 9&ndash;12 concepts to JEE, NEET &amp; more, powered by 3D animated videos,
            visual notes, NCERT &amp; PYQ solutions and exam-focused practice.
          </p>

          {/* Exam-track cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-10">
            {examTracks.map((t) => (
              <Link
                key={t.title}
                href="/courses"
                className="group rounded-2xl bg-white border border-gray-100 card-shadow p-4 sm:p-5 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:border-[#05BFDB]/40 hover:shadow-md"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <t.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-heading leading-tight">{t.title}</h3>
                <p className="text-[10px] sm:text-[11px] text-text-muted mt-1">{t.subtitle}</p>
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/demo">
              <Button size="lg" className="group bg-[#05BFDB] hover:bg-[#05BFDB]/90 text-white">
                Watch Demo
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant="outline" size="lg" className="border-gray-300 text-heading hover:bg-gray-50">
                <Play className="w-5 h-5 mr-2" /> Explore Courses
              </Button>
            </Link>
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
    { title: "Lecture Videos", description: "Watch a recorded teacher lecture — Class 12 Physics, Chapter 1.", href: "/demo/lecture", icon: GraduationCap, gradient: "from-sky-500 via-blue-500 to-indigo-600", glow: "shadow-blue-500/20" },
    { title: "Visual Notes", description: "Beautifully structured notes with highlights, diagrams, and key takeaways for revision.", href: "/demo/visual-notes", icon: BookOpen, gradient: "from-sky-600 via-cyan-500 to-blue-500", glow: "shadow-sky-500/20" },
    { title: "Presentations (PPTs)", description: "Ready-to-use teaching slides with clear visuals and structured chapter flow.", href: "/demo/ppt", icon: Presentation, gradient: "from-indigo-600 via-blue-500 to-cyan-500", glow: "shadow-indigo-500/20" },
    { title: "NCERT Solutions", description: "Step-by-step NCERT answers with exam tips and key insights for every question.", href: "/demo/ncert-solution", icon: BookMarked, gradient: "from-emerald-600 via-teal-500 to-cyan-500", glow: "shadow-emerald-500/20" },
    { title: "PYQ Solutions", description: "Year-wise solved board exam questions with marking schemes and answer strategies.", href: "/demo/pyq", icon: FileCheck, gradient: "from-rose-600 via-orange-500 to-amber-500", glow: "shadow-rose-500/20" },
    { title: "Interactive Quiz", description: "MCQ quizzes with instant feedback, score tracking, and detailed result analysis.", href: "/demo/quiz", icon: Target, gradient: "from-amber-500 via-orange-500 to-rose-500", glow: "shadow-amber-500/20" },
  ];

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

      {/* Static grid of content cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {demos.map((d, i) => (
            <div key={i} className="group">
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
    { icon: Monitor, title: "3D Animated Videos", description: "Watch complex concepts come alive with stunning 3D animations across Physics, Chemistry, and Biology.", gradient: "from-violet-600 to-fuchsia-500" },
    { icon: BookOpen, title: "Visual Notes", description: "Beautifully structured chapter notes with diagrams, highlights, and key takeaways for fast revision.", gradient: "from-sky-500 to-blue-600" },
    { icon: BookMarked, title: "NCERT Solutions", description: "Step-by-step NCERT answers with exam tips and key insights for every textbook question.", gradient: "from-emerald-500 to-teal-600" },
    { icon: FileCheck, title: "PYQ Solutions", description: "Year-wise solved previous-year board questions with marking schemes and answer strategies.", gradient: "from-rose-500 to-orange-500" },
    { icon: Presentation, title: "Presentations (PPTs)", description: "Ready-to-teach slide decks with clear visuals and a structured chapter flow.", gradient: "from-indigo-500 to-blue-500" },
    { icon: Target, title: "MCQ Practice Quizzes", description: "Chapter-wise quizzes with instant feedback and score tracking to test your understanding.", gradient: "from-amber-500 to-pink-600" },
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
