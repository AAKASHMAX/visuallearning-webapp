import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookMarked, Brain, FileCheck2, FileText, GraduationCap, MonitorPlay, Presentation, Play } from "lucide-react";

const demos = [
  { title: "3D animated videos", description: "A closer look at the ideas you can’t see. Explore science through vivid, three-dimensional animations.", href: "/demo/video", icon: MonitorPlay, label: "WATCH & WONDER" },
  { title: "Video lessons", description: "A teacher by your side. Follow clear explanations that connect every step to the bigger picture.", href: "/demo/lecture", icon: GraduationCap, label: "FOLLOW THE EXPLANATION" },
  { title: "Visual notes", description: "Less searching, more understanding. Revisit key ideas through organised notes and helpful diagrams.", href: "/demo/visual-notes", icon: FileText, label: "READ & REMEMBER" },
  { title: "Presentations", description: "Bring concepts into the classroom with visual slides that make every explanation easier to follow.", href: "/demo/ppt", icon: Presentation, label: "TEACH WITH CLARITY" },
  { title: "NCERT solutions", description: "Work through textbook questions with clear solutions, one thoughtful step at a time.", href: "/demo/ncert-solution", icon: BookMarked, label: "CONNECT THE STEPS" },
  { title: "Previous year questions", description: "Turn past papers into new confidence. Explore solved questions and understand the approach.", href: "/demo/pyq", icon: FileCheck2, label: "BUILD EXAM CONFIDENCE" },
  { title: "Interactive quizzes", description: "Give your understanding a little check-in. Try questions, see your score, and learn from the answers.", href: "/demo/quiz", icon: Brain, label: "PUT IT INTO PRACTICE" },
];

export default function DemoIndexPage() {
  return <div className="learning-page learn-demo-page">
    <header className="learn-page-header"><div><span className="learn-eyebrow"><span /> THE DISCOVERY ROOM</span><h1>See it differently.<br /><em>Understand it deeply.</em></h1><p>One concept can open a whole new world. Take a look inside Visual Learning with these free samples.</p></div><div className="learn-header-note"><Play size={21} /><strong>A little preview.<br />A lot to discover.</strong><span>NO SIGN-IN NEEDED</span></div></header>
    <div className="learn-section-heading"><div><span className="learn-step">PICK SOMETHING THAT SPARKS YOUR CURIOSITY</span><h2>Seven ways to make it click.</h2></div><span className="learn-pill">All demos are free <ArrowUpRight size={15} /></span></div>
    <div className="learn-demo-grid">{demos.map((demo, i) => <Link key={demo.href} href={demo.href} className={`learn-demo-card ${i === 0 ? "learn-demo-featured" : ""}`}>
      <div className="learn-demo-card-top"><span className="learn-demo-index">0{i + 1}</span><span className="learn-arrow-circle"><ArrowUpRight size={19} /></span></div>
      <div className="learn-demo-art" aria-hidden="true"><demo.icon size={i === 0 ? 76 : 42} strokeWidth={1.1} />{i === 0 && <><span className="learn-demo-orbit" /><span className="learn-demo-orbit alternate" /></>}</div>
      <span className="learn-step">{demo.label}</span><h2>{demo.title}</h2><p>{demo.description}</p><span className="learn-resource-action">Explore the demo <ArrowRight size={16} /></span>
    </Link>)}</div>
    <div className="learn-discovery-banner"><div><span className="learn-step">KEEP YOUR CURIOSITY GOING</span><h2>Your next “aha” moment awaits.</h2><p>Find your class and explore a new way to learn.</p></div><Link href="/courses" className="learn-button learn-button-light">Explore the library <ArrowUpRight size={18} /></Link></div>
  </div>;
}
