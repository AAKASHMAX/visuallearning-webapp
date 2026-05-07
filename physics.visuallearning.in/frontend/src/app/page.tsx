"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { FreeOfferCountdown, FreePriceHighlight } from "@/components/subscription/free-offer";
import api from "@/lib/api";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Atom,
  Zap,
  Play,
  BookOpen,
  FlaskConical,
  GraduationCap,
  Star,
  Check,
  ArrowRight,
  Sparkles,
  Monitor,
  Trophy,
  Users,
  Clock,
  ChevronRight,
  Waves,
  Magnet,
  Orbit,
  Lightbulb,
  Target,
  Rocket,
  Flame,
  Sun,
  Radio,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  LANDING PAGE                                                       */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  return (
    <main className="min-h-screen bg-primary overflow-hidden">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <PhysicsCarousel />
      <FeaturesSection />
      <TopicsShowcase />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  HERO                                                               */
/* ------------------------------------------------------------------ */

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 bg-grid">
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/8 rounded-full blur-[100px]" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-accent/40 rounded-full"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animation: `particle-float ${8 + i * 2}s linear infinite`,
              animationDelay: `${i * 1.5}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <Sparkles className="w-4 h-4 text-energy" />
              <span className="text-sm text-text-muted">
                India&apos;s #1 Visual Physics Platform
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              <span className="text-text-bright">See Physics.</span>
              <br />
              <span className="gradient-text">Feel Physics.</span>
              <br />
              <span className="text-text-bright">Master Physics.</span>
            </h1>

            <p className="text-lg text-text-muted leading-relaxed max-w-lg mb-8">
              Transform how you learn physics with breathtaking 3D animations,
              interactive virtual experiments, and crystal-clear video lectures.
              From class 9 to 12 &mdash; every concept visualized.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Link href="/auth/signup">
                <Button size="lg" className="group">
                  Start Learning Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline" size="lg">
                  <Play className="w-5 h-5 mr-2" />
                  Explore Courses
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 text-sm text-text-muted">
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-success" />
                <span>Free tier available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-success" />
                <span>3D Animations</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-success" />
                <span>CBSE Aligned</span>
              </div>
            </div>
          </div>

          {/* Right: Atom visual */}
          <div className="hidden lg:flex justify-center items-center animate-fade-in delay-300">
            <div className="relative w-80 h-80">
              {/* Central nucleus */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-accent to-secondary animate-pulse-glow flex items-center justify-center z-10">
                <Atom className="w-8 h-8 text-white" />
              </div>

              {/* Orbit rings */}
              <div className="absolute inset-4 border border-accent/20 rounded-full animate-spin" style={{ animationDuration: "12s" }}>
                <div className="absolute -top-1.5 left-1/2 w-3 h-3 rounded-full bg-accent shadow-[0_0_10px_rgba(0,212,255,0.6)]" />
              </div>
              <div className="absolute inset-12 border border-secondary/20 rounded-full animate-spin" style={{ animationDuration: "8s", animationDirection: "reverse" }}>
                <div className="absolute top-1/2 -right-1.5 w-3 h-3 rounded-full bg-secondary shadow-[0_0_10px_rgba(124,58,237,0.6)]" />
              </div>
              <div className="absolute inset-0 border border-energy/10 rounded-full animate-spin" style={{ animationDuration: "16s" }}>
                <div className="absolute bottom-2 left-8 w-2 h-2 rounded-full bg-energy shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
              </div>

              {/* Floating formula cards */}
              <div className="absolute -top-4 -right-4 glass rounded-xl px-4 py-2 animate-float">
                <span className="text-accent font-mono text-sm">E = mc&sup2;</span>
              </div>
              <div className="absolute -bottom-4 -left-4 glass rounded-xl px-4 py-2 animate-float delay-200">
                <span className="text-secondary-light font-mono text-sm">F = ma</span>
              </div>
              <div className="absolute top-8 -left-12 glass rounded-xl px-4 py-2 animate-float delay-400">
                <span className="text-energy font-mono text-sm">V = IR</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  STATS BAR                                                          */
/* ------------------------------------------------------------------ */

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
        <div className="glass rounded-2xl p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className="w-6 h-6 text-accent mx-auto mb-2" />
                <div className="text-2xl sm:text-3xl font-bold text-text-bright mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  3D PHYSICS CONCEPTS CAROUSEL                                       */
/* ------------------------------------------------------------------ */

function PhysicsCarousel() {
  const concepts = [
    {
      name: "Atomic Structure",
      description: "Electrons, protons, and the quantum world",
      icon: Atom,
      gradient: "from-accent to-blue-600",
      formula: "E = -13.6/n\u00B2 eV",
    },
    {
      name: "Gravitation",
      description: "Universal attraction and orbital mechanics",
      icon: Orbit,
      gradient: "from-secondary to-purple-600",
      formula: "F = Gm\u2081m\u2082/r\u00B2",
    },
    {
      name: "Thermodynamics",
      description: "Heat, energy, and the laws of entropy",
      icon: Flame,
      gradient: "from-energy to-orange-600",
      formula: "\u0394U = Q - W",
    },
    {
      name: "Electromagnetism",
      description: "Electric fields, magnetic forces, and EM waves",
      icon: Zap,
      gradient: "from-yellow-400 to-amber-600",
      formula: "F = qE + qv\u00D7B",
    },
    {
      name: "Wave Optics",
      description: "Light interference, diffraction, and polarization",
      icon: Sun,
      gradient: "from-cyan-400 to-teal-600",
      formula: "\u03BB = h/p",
    },
    {
      name: "Nuclear Physics",
      description: "Fission, fusion, and radioactive decay",
      icon: Radio,
      gradient: "from-rose-500 to-pink-600",
      formula: "E = mc\u00B2",
    },
    {
      name: "Wave Motion",
      description: "Sound waves, resonance, and harmonics",
      icon: Waves,
      gradient: "from-emerald-400 to-green-600",
      formula: "v = f\u03BB",
    },
    {
      name: "Magnetism",
      description: "Magnetic fields, induction, and motors",
      icon: Magnet,
      gradient: "from-indigo-400 to-violet-600",
      formula: "F = BIL sin\u03B8",
    },
  ];

  const totalCards = concepts.length;
  const angleStep = 360 / totalCards;
  // Radius so cards don't overlap (card ~180px wide + gap)
  const radius = 340;

  return (
    <section id="courses" className="py-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px]" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <Sparkles className="w-4 h-4 text-energy" />
            <span className="text-sm text-text-muted">Explore Physics</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-bright mb-4">
            Visualize Every <span className="gradient-text">Concept</span>
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            From atomic structure to astrophysics &mdash; experience physics in
            stunning 3D animations and interactive simulations.
          </p>
        </div>

        {/* 3D Carousel */}
        <div className="carousel-scene mx-auto" style={{ height: 380 }}>
          <div
            className="carousel-ring relative mx-auto"
            style={{
              width: 200,
              height: 260,
              marginTop: 40,
              transformStyle: "preserve-3d",
            }}
          >
            {concepts.map((concept, i) => {
              const angle = i * angleStep;
              return (
                <div
                  key={i}
                  className="carousel-card absolute inset-0 w-[200px]"
                  style={{
                    transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                  }}
                >
                  <div className="rounded-2xl border border-border bg-card/90 backdrop-blur-sm p-6 text-center h-full flex flex-col items-center justify-center gap-3 hover:border-accent/40 transition-colors">
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${concept.gradient} flex items-center justify-center shrink-0`}
                    >
                      <concept.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-text-bright leading-tight">
                      {concept.name}
                    </h3>
                    <p className="text-xs text-text-muted leading-relaxed">
                      {concept.description}
                    </p>
                    <span className="text-xs font-mono text-accent/80 mt-1">
                      {concept.formula}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Explore button */}
        <div className="text-center mt-8">
          <Link href="/courses">
            <Button size="lg" className="group">
              Explore All Courses
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FEATURES                                                           */
/* ------------------------------------------------------------------ */

function FeaturesSection() {
  const features = [
    {
      icon: Monitor,
      title: "3D Animated Videos",
      description:
        "Watch complex physics concepts come alive with stunning 3D animations. Visualize electromagnetic waves, atomic structures, and more.",
      gradient: "from-accent to-blue-600",
    },
    {
      icon: FlaskConical,
      title: "Virtual Lab Experiments",
      description:
        "Conduct virtual physics experiments right in your browser. From optics to electricity - safe, interactive, and always available.",
      gradient: "from-secondary to-purple-600",
    },
    {
      icon: BookOpen,
      title: "Detailed Chapter Notes",
      description:
        "Download comprehensive PDF notes for every chapter. Revise formulas, derivations, and key concepts anytime.",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      icon: Target,
      title: "MCQ Practice Quizzes",
      description:
        "Test your understanding with chapter-wise multiple choice quizzes. Get instant feedback and track your progress.",
      gradient: "from-rose-500 to-pink-600",
    },
  ];

  return (
    <section id="features" className="py-24 relative bg-surface/50">
      <div className="absolute inset-0 bg-dots opacity-30" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <Zap className="w-4 h-4 text-energy" />
            <span className="text-sm text-text-muted">Why PhysicsLab?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-bright mb-4">
            Everything You Need to{" "}
            <span className="gradient-text">Excel in Physics</span>
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            A complete physics learning ecosystem designed to make every concept
            crystal clear and every formula stick.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-border bg-card p-7 hover:border-accent/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-text-bright mb-2">
                {feature.title}
              </h3>
              <p className="text-text-muted text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  TOPICS SHOWCASE                                                    */
/* ------------------------------------------------------------------ */

function TopicsShowcase() {
  const topics = [
    { name: "Mechanics", icon: Orbit, description: "Motion, Forces, Gravitation" },
    { name: "Optics", icon: Lightbulb, description: "Light, Lenses, Mirrors" },
    { name: "Electricity", icon: Zap, description: "Current, Circuits, EMF" },
    { name: "Magnetism", icon: Magnet, description: "Fields, Induction, Motors" },
    { name: "Waves", icon: Waves, description: "Sound, EM Waves, Interference" },
    { name: "Modern Physics", icon: Atom, description: "Quantum, Nuclear, Atoms" },
    { name: "Thermodynamics", icon: FlaskConical, description: "Heat, Energy, Entropy" },
    { name: "Kinematics", icon: Rocket, description: "Velocity, Acceleration, Projectile" },
  ];

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <Atom className="w-4 h-4 text-secondary-light" />
            <span className="text-sm text-text-muted">What You&apos;ll Learn</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-bright mb-4">
            Complete Physics{" "}
            <span className="gradient-text">Curriculum</span>
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            Covering every major topic from Class 9 to 12, aligned with CBSE and
            state board syllabi.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {topics.map((topic, i) => (
            <div
              key={i}
              className="group relative rounded-2xl border border-border bg-card p-6 text-center hover:border-accent/30 transition-all duration-500 hover:-translate-y-1 cursor-default"
            >
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-surface-light to-card-hover flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <topic.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-sm font-semibold text-text-bright mb-1">
                {topic.name}
              </h3>
              <p className="text-xs text-text-muted">{topic.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  PRICING                                                            */
/* ------------------------------------------------------------------ */

function PricingSection() {
  type PricingPlan = {
    code: string;
    name: string;
    price: string;
    originalPrice?: string;
    isFreeOfferActive?: boolean;
    freeOfferUntil?: string | null;
    period: string;
    description: string;
    features: string[];
    cta: string;
    variant: "primary" | "secondary" | "outline";
    popular: boolean;
  };

  const fallbackPlans: PricingPlan[] = [
    {
      code: "BRIDGE",
      name: "Physics Bridge Course",
      price: "999",
      period: "/month",
      description: "Strengthen core physics concepts before advanced chapters",
      features: [
        "Core concept modules",
        "Animated explanations",
        "Foundation strengthening",
        "Bridge tests",
      ],
      cta: "Get Bridge",
      variant: "outline" as const,
      popular: false,
    },
    {
      code: "BASIC",
      name: "Basic",
      price: "299",
      period: "/month",
      description: "Complete physics learning experience",
      features: [
        "All animated video lectures",
        "Complete chapter notes",
        "Full MCQ quiz access",
        "Progress tracking dashboard",
        "Single class access",
      ],
      cta: "Get Basic",
      variant: "primary" as const,
      popular: true,
    },
    {
      code: "ADVANCE",
      name: "Advance",
      price: "499",
      period: "/month",
      description: "Everything you need to top physics",
      features: [
        "Everything in Basic",
        "Expert lecture videos",
        "Virtual Lab experiments",
        "Board paper practice",
        "All classes (9-12) access",
        "Priority support",
      ],
      cta: "Get Advance",
      variant: "secondary" as const,
      popular: false,
    },
  ];

  const [plans, setPlans] = useState<PricingPlan[]>(fallbackPlans);

  useEffect(() => {
    api.get("/subscription/plans")
      .then((res) => {
        if (!Array.isArray(res.data) || res.data.length === 0) return;

        const monthlyPlans = res.data.filter((plan: { code: string; durationDays: number }) => !plan.code.endsWith("_YEARLY") && plan.durationDays < 365);
        const nextPlans = monthlyPlans.slice(0, 3).map((plan: {
          code: string;
          name: string;
          description?: string | null;
          price: number;
          originalPrice?: number;
          isFreeOfferActive?: boolean;
          freeOfferUntil?: string | null;
          durationDays: number;
          features: string[];
        }) => {
          const baseCode = plan.code.replace(/_YEARLY$/, "");
          const fallback = fallbackPlans.find((item) => item.code === baseCode) || fallbackPlans[0];
          const period = plan.price <= 0 || plan.durationDays <= 0
            ? "forever"
            : plan.durationDays >= 365
              ? "/year"
              : plan.durationDays === 30
                ? "/month"
                : `/${plan.durationDays} days`;

          return {
            ...fallback,
            code: baseCode,
            name: plan.name,
            price: String(plan.price ?? 0),
            originalPrice: plan.originalPrice ? String(plan.originalPrice) : undefined,
            isFreeOfferActive: plan.isFreeOfferActive,
            freeOfferUntil: plan.freeOfferUntil,
            period,
            description: plan.description || fallback.description,
            features: plan.features?.length ? plan.features : fallback.features,
          };
        });

        setPlans(nextPlans);
      })
      .catch(() => setPlans(fallbackPlans));
  }, []);

  return (
    <section id="pricing" className="py-24 relative bg-surface/50">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <Star className="w-4 h-4 text-energy" />
            <span className="text-sm text-text-muted">Simple Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-bright mb-4">
            Invest in Your{" "}
            <span className="gradient-text">Physics Future</span>
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            Affordable plans designed for Indian students, with monthly and yearly access controlled from admin.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl border ${
                plan.popular
                  ? "border-accent/50 bg-card shadow-xl shadow-accent/5"
                  : "border-border bg-card"
              } p-8 transition-all duration-500 hover:-translate-y-2`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-accent to-secondary text-xs font-bold text-white">
                  MOST POPULAR
                </div>
              )}

              <h3 className="text-xl font-bold text-text-bright mb-2">
                {plan.name}
              </h3>
              <p className="text-text-muted text-sm mb-6">{plan.description}</p>

              <div className="mb-6">
                {plan.isFreeOfferActive && plan.originalPrice && plan.originalPrice !== plan.price && (
                  <p className="text-sm font-bold text-text-muted line-through">&#8377;{plan.originalPrice}</p>
                )}
                {plan.price !== "0" && <span className="text-text-muted text-lg">&#8377;</span>}
                {plan.price === "0" ? (
                  <FreePriceHighlight />
                ) : (
                  <span className="text-4xl font-extrabold text-text-bright">{Number(plan.price).toLocaleString("en-IN")}</span>
                )}
                <span className="text-text-muted text-sm ml-1">
                  {plan.period}
                </span>
                {plan.isFreeOfferActive && <FreeOfferCountdown until={plan.freeOfferUntil} />}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    <span className="text-text-muted">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href={`/subscription?plan=${plan.code}`}>
                <Button variant={plan.variant} className="w-full">
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  TESTIMONIALS                                                       */
/* ------------------------------------------------------------------ */

function TestimonialsSection() {
  const testimonials = [
    {
      name: "Priya Sharma",
      class: "Class 12, CBSE",
      text: "The 3D animations made optics so easy to understand! I scored 95 in physics board exam after using PhysicsLab.",
      rating: 5,
    },
    {
      name: "Rahul Verma",
      class: "Class 11, State Board",
      text: "Virtual lab experiments are amazing. I can actually see how circuits work instead of just reading about them.",
      rating: 5,
    },
    {
      name: "Ananya Patel",
      class: "Class 10, ICSE",
      text: "Best physics learning platform! The animations make complex concepts so simple. My grades improved from B to A+.",
      rating: 5,
    },
  ];

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <Users className="w-4 h-4 text-accent" />
            <span className="text-sm text-text-muted">Student Stories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-bright mb-4">
            Loved by <span className="gradient-text">Students</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-8 hover:border-accent/20 transition-all duration-500"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star
                    key={j}
                    className="w-4 h-4 text-energy fill-energy"
                  />
                ))}
              </div>

              <p className="text-text-muted text-sm leading-relaxed mb-6 italic">
                &ldquo;{t.text}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center text-white font-bold text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-bright">
                    {t.name}
                  </p>
                  <p className="text-xs text-text-muted">{t.class}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  CTA                                                                */
/* ------------------------------------------------------------------ */

function CTASection() {
  return (
    <section className="py-24 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-secondary/10 to-primary" />
          <div className="absolute inset-0 bg-grid opacity-10" />

          {/* Glow orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-[60px]" />

          <div className="relative z-10 text-center py-16 px-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-accent to-secondary flex items-center justify-center mb-6 animate-pulse-glow">
              <Rocket className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-text-bright mb-4">
              Ready to Master Physics?
            </h2>
            <p className="text-text-muted max-w-lg mx-auto mb-8">
              Join thousands of students who are already visualizing their way to
              physics mastery. Start with our free course today.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/auth/signup">
                <Button size="lg" className="group">
                  Start Learning Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <p className="text-text-muted text-sm mt-4">
              No credit card required &bull; Free tier available
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
