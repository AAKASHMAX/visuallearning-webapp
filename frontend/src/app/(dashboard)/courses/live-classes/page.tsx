"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Radio,
  Users,
  MessageCircle,
  Clock,
  GraduationCap,
  ShieldCheck,
  Star,
  CheckCircle,
  Calendar,
  Headphones,
  Target,
  Zap,
  ArrowRight,
} from "lucide-react";

const BENEFITS = [
  {
    icon: Users,
    title: "Small Batch Size",
    description: "Only 10-15 students per session so every student gets personal attention from the teacher.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: MessageCircle,
    title: "Live Doubt Clearing",
    description: "Ask your doubts in real-time and get instant, clear explanations from expert teachers.",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: GraduationCap,
    title: "Expert Teachers",
    description: "Learn from educators with 5+ years of experience in board exam coaching and preparation.",
    color: "bg-violet-100 text-violet-600",
  },
  {
    icon: Target,
    title: "Exam-Focused Sessions",
    description: "Sessions built around important topics, common mistakes, and high-scoring strategies for boards.",
    color: "bg-orange-100 text-orange-600",
  },
  {
    icon: Calendar,
    title: "Flexible Scheduling",
    description: "Multiple time slots available throughout the week — pick what fits your routine best.",
    color: "bg-pink-100 text-pink-600",
  },
  {
    icon: Headphones,
    title: "Session Recordings",
    description: "Missed a class? Every live session is recorded so you can rewatch it anytime you want.",
    color: "bg-amber-100 text-amber-600",
  },
];

const HOW_IT_WORKS = [
  { step: 1, title: "Subscribe to a plan", description: "Choose a subscription plan that suits your needs" },
  { step: 2, title: "Pick your subjects", description: "Select the subjects you want live help with" },
  { step: 3, title: "Book a time slot", description: "Choose a convenient session time from available slots" },
  { step: 4, title: "Join & Learn", description: "Get the link, join the live class, ask doubts, and learn" },
];

export default function LiveClassesPage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="text-sm text-primary flex items-center gap-1 mb-4 hover:underline">
        <ArrowLeft className="w-3 h-3" /> Back
      </button>

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 p-8 sm:p-10 mb-8">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Radio className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Live Classes</h1>
              <p className="text-red-100">Interactive doubt-clearing sessions with expert teachers</p>
            </div>
          </div>
          <p className="text-white/90 text-base sm:text-lg max-w-xl leading-relaxed mb-6">
            Struggling with tough concepts? Join our small-group live sessions where expert teachers
            break down difficult topics, solve your doubts in real-time, and help you score better in exams.
          </p>
          <Link href="/subscription">
            <Button className="bg-white text-red-600 hover:bg-red-50 font-semibold px-6 py-2.5 rounded-lg text-base shadow-lg">
              Join Live Classes <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
        <div className="absolute top-1/2 -left-8 w-20 h-20 bg-white/5 rounded-full" />
      </div>

      {/* Benefits Grid */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-5">Why Join Live Classes?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <Card key={b.title} className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${b.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{b.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{b.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-5">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                {item.step}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What Makes Us Different */}
      <Card className="border-red-100 mb-10">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-red-500" /> What Makes Us Different
          </h2>
          <div className="space-y-3">
            {[
              "Batch size strictly limited to 10-15 students",
              "Teachers with 5+ years of board exam coaching experience",
              "Subject-wise and chapter-wise doubt sessions",
              "Special revision sessions before exams",
              "All sessions recorded — rewatch anytime",
              "Available in Hindi and English",
            ].map((point) => (
              <div key={point} className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-600">{point}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-red-50 to-rose-50 border-red-100 mb-4">
        <CardContent className="p-8 text-center">
          <Zap className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="font-bold text-xl mb-2">Ready to Boost Your Learning?</h3>
          <p className="text-sm text-gray-500 mb-5 max-w-md mx-auto">
            Subscribe now to get access to live classes, doubt-clearing sessions,
            and all our premium content.
          </p>
          <Link href="/subscription">
            <Button className="bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-3 rounded-lg text-base shadow-md">
              View Subscription Plans <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
