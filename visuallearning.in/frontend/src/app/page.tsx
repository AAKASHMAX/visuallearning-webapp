"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { HeroSlideshow } from "@/components/home/hero-slideshow";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen, Play, FileText, Brain, Star, Radio, MonitorPlay,
  Sparkles, GraduationCap, Atom, PenTool, ClipboardList, Beaker,
} from "lucide-react";

const Footer = dynamic(() => import("@/components/layout/footer").then((m) => m.Footer), { ssr: false });

/* ── Intersection Observer hook for scroll-triggered animations ── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ── Content section data ── */
const contentSections = [
  {
    id: "3d-animations",
    icon: Atom,
    title: "3D Animations",
    description: "Watch complex science concepts come alive with stunning 3D animated explanations",
    gradient: "from-violet-500 via-purple-500 to-indigo-600",
    bgLight: "bg-violet-50",
    iconColor: "text-violet-600",
    taglines: [
      { text: "Visualize molecular structures in 3D", color: "bg-violet-100 text-violet-700" },
      { text: "Interactive physics simulations", color: "bg-purple-100 text-purple-700" },
      { text: "Understand organic reactions visually", color: "bg-indigo-100 text-indigo-700" },
      { text: "Biology diagrams that move & explain", color: "bg-fuchsia-100 text-fuchsia-700" },
    ],
    image: "🧬",
  },
  {
    id: "virtual-lab",
    icon: Beaker,
    title: "Virtual Lab",
    description: "Explore 64+ interactive 3D simulations — dissect organs, run experiments & visualize science like never before",
    gradient: "from-teal-500 via-cyan-500 to-emerald-500",
    bgLight: "bg-teal-50",
    iconColor: "text-teal-600",
    taglines: [
      { text: "64+ interactive 3D experiments", color: "bg-teal-100 text-teal-700" },
      { text: "Biology, Chemistry & Physics labs", color: "bg-cyan-100 text-cyan-700" },
      { text: "Explore human anatomy in 3D", color: "bg-emerald-100 text-emerald-700" },
      { text: "Learn by doing, not just watching", color: "bg-green-100 text-green-700" },
    ],
    image: "🔬",
  },
  {
    id: "notes",
    icon: PenTool,
    title: "Study Notes",
    description: "Downloadable chapter-wise notes crafted for quick revision and deep understanding",
    gradient: "from-emerald-500 via-green-500 to-lime-500",
    bgLight: "bg-emerald-50",
    iconColor: "text-emerald-600",
    taglines: [
      { text: "Concise & exam-focused notes", color: "bg-emerald-100 text-emerald-700" },
      { text: "Key formulas & diagrams included", color: "bg-green-100 text-green-700" },
      { text: "Download PDFs for offline study", color: "bg-lime-100 text-lime-700" },
      { text: "Perfect for last-minute revision", color: "bg-teal-100 text-teal-700" },
    ],
    image: "📝",
  },
  {
    id: "question-papers",
    icon: ClipboardList,
    title: "Question Papers",
    description: "Practice with MCQs, previous year papers & chapter-wise tests to ace your exams",
    gradient: "from-amber-500 via-orange-500 to-yellow-500",
    bgLight: "bg-amber-50",
    iconColor: "text-amber-600",
    taglines: [
      { text: "1000+ MCQs with solutions", color: "bg-amber-100 text-amber-700" },
      { text: "Previous year board papers", color: "bg-orange-100 text-orange-700" },
      { text: "Chapter-wise practice tests", color: "bg-yellow-100 text-yellow-700" },
      { text: "Track your progress & improve", color: "bg-red-100 text-red-700" },
    ],
    image: "📋",
  },
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

/* ── Content Section Component ── */
function ContentSection({ section, index }: { section: typeof contentSections[0]; index: number }) {
  const { ref, inView } = useInView(0.1);
  const isEven = index % 2 === 0;

  return (
    <section ref={ref} className={`py-16 md:py-20 ${index % 2 === 0 ? "bg-white" : "bg-surface"} overflow-hidden`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className={`flex flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-10 lg:gap-16`}>
          {/* Visual Side */}
          <div className="w-full lg:w-5/12 flex-shrink-0">
            <div className={`relative bg-gradient-to-br ${section.gradient} rounded-3xl p-8 md:p-12 text-center overflow-hidden`}>
              <div className="absolute inset-0 bg-white/5 rounded-3xl" />
              <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
              <div className="absolute bottom-4 left-4 w-32 h-32 bg-white/10 rounded-full blur-xl" />
              <div className={`relative text-8xl md:text-9xl ${inView ? "animate-float" : ""} select-none`}>
                {section.image}
              </div>
              <div className="relative mt-4">
                <section.icon className="w-8 h-8 text-white/60 mx-auto" />
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div className="w-full lg:w-7/12">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${section.bgLight} mb-4 ${inView ? (isEven ? "animate-slide-right" : "animate-slide-left") : "opacity-0"}`}>
              <section.icon className={`w-4 h-4 ${section.iconColor}`} />
              <span className={`text-sm font-semibold ${section.iconColor}`}>{section.title}</span>
            </div>

            <h2 className={`text-3xl md:text-4xl font-bold text-gray-900 mb-4 ${inView ? "animate-fade-in" : "opacity-0"}`}>
              {section.title}
            </h2>

            <p className={`text-lg text-gray-500 mb-8 leading-relaxed ${inView ? "animate-fade-in delay-100" : "opacity-0"}`}>
              {section.description}
            </p>

            {/* Sliding taglines */}
            <div className="space-y-3">
              {section.taglines.map((tag, i) => (
                <div
                  key={i}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${tag.color} mr-2 ${
                    inView ? (i % 2 === 0 ? "animate-slide-right" : "animate-slide-left") : "opacity-0"
                  }`}
                  style={{ animationDelay: `${(i + 1) * 0.15}s` }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {tag.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Stats Bar ── */
function StatsBar() {
  const { ref, inView } = useInView(0.2);
  const stats = [
    { value: "10,000+", label: "Students Learning" },
    { value: "500+", label: "3D Animated Videos" },
    { value: "1,000+", label: "Practice MCQs" },
    { value: "4", label: "Classes Covered" },
  ];

  return (
    <section ref={ref} className="bg-gradient-to-r from-primary via-primary-light to-primary py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className={`text-center ${inView ? "animate-fade-in" : "opacity-0"}`} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">{s.value}</div>
              <div className="text-white/60 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSlideshow />

        {/* Stats Bar */}
        <StatsBar />

        {/* Content Sections with sliding taglines */}
        {contentSections.map((section, index) => (
          <ContentSection key={section.id} section={section} index={index} />
        ))}

        {/* Classes */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 mb-4">
                <GraduationCap className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">All Classes</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Choose Your Class</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {classes.map((c) => (
                <Link key={c.name} href="/courses">
                  <div className={`bg-gradient-to-br ${c.color} text-white rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl`}>
                    <h3 className="text-2xl font-bold mb-2">{c.name}</h3>
                    <p className="text-white/80">{c.subjects} Subjects</p>
                    <p className="text-white/80">{c.chapters} Chapters</p>
                    <div className="mt-4 text-sm font-medium flex items-center gap-1">
                      Start Learning <span className="text-lg">&rarr;</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-surface">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 mb-4">
                <Star className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-accent-dark">Student Reviews</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">What Students Say</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <Card key={i} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-3">{[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-accent text-accent" />)}</div>
                    <p className="text-gray-600 mb-4 leading-relaxed">&quot;{t.text}&quot;</p>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-sm text-gray-400">{t.class} Student</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-primary via-primary-light to-primary-dark text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Learning?</h2>
            <p className="text-white/70 text-lg mb-8">Join thousands of students who are scoring better with visual learning</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button variant="accent" size="lg">Get Started Free</Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                  Explore Courses
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
