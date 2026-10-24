import Link from "next/link";
import { ArrowUpRight, Play } from "lucide-react";
import { ContentArt } from "@/components/courses/course-art";
import { sparkDisplay, sparkMono } from "@/lib/spark-fonts";
import "@/components/courses/course-cards.css";

// Each format keeps its own colour; the artwork matches the course pages.
const demos = [
  { slug: "animation", title: "3D animated videos", description: "A closer look at the ideas you can’t see. Explore science through vivid, three-dimensional animations.", href: "/demo/video", label: "Watch & wonder", accent: "#a78bfa" },
  { slug: "notes", title: "Visual notes", description: "Less searching, more understanding. Revisit key ideas through organised notes and helpful diagrams.", href: "/demo/visual-notes", label: "Read & remember", accent: "#34d399" },
  { slug: "ppt", title: "Presentations", description: "Bring concepts into the classroom with visual slides that make every explanation easier to follow.", href: "/demo/ppt", label: "Teach with clarity", accent: "#fb923c" },
  { slug: "ncert", title: "NCERT solutions", description: "Work through textbook questions with clear solutions, one thoughtful step at a time.", href: "/demo/ncert-solution", label: "Connect the steps", accent: "#22d3ee" },
  { slug: "pyq", title: "Previous year questions", description: "Turn past papers into new confidence. Explore solved questions and understand the approach.", href: "/demo/pyq", label: "Build exam confidence", accent: "#fb7185" },
  { slug: "quiz", title: "Interactive quizzes", description: "Give your understanding a little check-in. Try questions, see your score, and learn from the answers.", href: "/demo/quiz", label: "Put it into practice", accent: "#f59e0b" },
];

export default function DemoIndexPage() {
  return <div className={`learning-page learn-demo-page ${sparkDisplay.variable} ${sparkMono.variable}`}>
    <header className="learn-page-header"><div><span className="learn-eyebrow"><span /> THE DISCOVERY ROOM</span><h1>See it differently.<br /><em>Understand it deeply.</em></h1><p>One concept can open a whole new world. Take a look inside Visual Learning with these free samples.</p></div><div className="learn-header-note"><Play size={21} /><strong>A little preview.<br />A lot to discover.</strong><span>NO SIGN-IN NEEDED</span></div></header>
    <div className="learn-section-heading"><div><span className="learn-step">PICK SOMETHING THAT SPARKS YOUR CURIOSITY</span><h2>Six ways to make it click.</h2></div><span className="learn-pill">All demos are free <ArrowUpRight size={15} /></span></div>
    <div className={`cx-grid${demos.length === 6 ? " cx-grid-6" : ""}`}>
      {demos.map((demo, i) => (
        <Link key={demo.href} href={demo.href} className={`cx-card${i === 0 ? " cx-card-feature" : ""}`} style={{ ["--cx-accent" as string]: demo.accent }}>
          <div className="cx-card-art"><ContentArt slug={demo.slug} /></div>
          <div className="cx-card-body">
            <span className="cx-chip">0{i + 1} · {demo.label}</span>
            <h3>{demo.title}</h3>
            <p>{demo.description}</p>
          </div>
          <span className="cx-go" aria-hidden="true"><ArrowUpRight size={18} /></span>
        </Link>
      ))}
    </div>
    <div className="learn-discovery-banner"><div><span className="learn-step">KEEP YOUR CURIOSITY GOING</span><h2>Your next “aha” moment awaits.</h2><p>Find your class and explore a new way to learn.</p></div><Link href="/courses" className="learn-button learn-button-light">Explore the library <ArrowUpRight size={18} /></Link></div>
  </div>;
}
