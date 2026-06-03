import { Play, FileText, BookMarked, FileCheck, HelpCircle } from "lucide-react";

export const DEMOS = [
  { href: "/demo/video", title: "3D Animated Videos", description: "Immersive 3D animations that make every concept clear.", icon: Play, gradient: "from-accent to-blue-600" },
  { href: "/demo/notes", title: "Notes", description: "Structured chapter notes with diagrams and key points.", icon: FileText, gradient: "from-emerald-500 to-teal-600" },
  { href: "/demo/ncert", title: "NCERT Solutions", description: "Step-by-step NCERT textbook solutions.", icon: BookMarked, gradient: "from-sky-500 to-cyan-600" },
  { href: "/demo/pyq", title: "PYQ Solutions", description: "Solved previous-year board questions.", icon: FileCheck, gradient: "from-orange-500 to-red-600" },
  { href: "/demo/quiz", title: "Interactive Quiz", description: "MCQ quizzes with instant feedback and scoring.", icon: HelpCircle, gradient: "from-secondary to-purple-600" },
];
