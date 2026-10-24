import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Eye, FlaskConical, Monitor, Move3D } from "lucide-react";
import { virtualLabGames } from "@/data/virtual-lab-games";

const viewerCount = virtualLabGames.filter(game => game.labType === "viewer").length;
const experimentCount = virtualLabGames.filter(game => game.labType === "experiment").length;

export default function VirtualLabPage() {
  return <div className="learning-page learn-lab-page">
    <Link className="learn-text-link learn-path-back" href="/courses"><ArrowLeft size={16} /> Back to the library</Link>
    <header className="learn-page-header"><div><span className="learn-eyebrow"><span /> THE VIRTUAL LAB</span><h1>Go beyond the page.<br /><em>Get closer to the idea.</em></h1><p>Rotate a model, explore a system, try an experiment. Make a little room for hands-on discovery.</p></div><div className="learn-header-note"><Move3D size={24} /><strong>A new angle.<br />A deeper understanding.</strong><span>SCIENCE YOU CAN EXPLORE</span></div></header>
    <div className="learn-lab-categories"><Link href="/courses/virtual-lab/viewers" className="learn-lab-category"><div className="learn-lab-category-art"><span className="learn-lab-ring" /><span className="learn-lab-ring alternate" /><Eye size={76} strokeWidth={1.1} /><span className="learn-lab-count">{viewerCount} MODELS</span></div><div className="learn-lab-category-content"><span className="learn-step">LOOK A LITTLE CLOSER</span><h2>Explore in three dimensions.</h2><p>See how it all fits together. Rotate, zoom, and examine science models from every angle.</p><span className="learn-resource-action">Open 3D viewers <ArrowUpRight size={18} /></span></div></Link><Link href="/courses/virtual-lab/experiments" className="learn-lab-category"><div className="learn-lab-category-art learn-lab-experiment-art"><span className="learn-lab-ring" /><span className="learn-lab-ring alternate" /><FlaskConical size={76} strokeWidth={1.1} /><span className="learn-lab-count">{experimentCount} EXPERIMENTS</span></div><div className="learn-lab-category-content"><span className="learn-step">LEARN BY DOING</span><h2>Turn “what if” into discovery.</h2><p>Experiment with biology, chemistry, and physics in an interactive virtual space.</p><span className="learn-resource-action">Try an experiment <ArrowUpRight size={18} /></span></div></Link></div>
    <div className="learn-device-note"><Monitor size={19} /><p>A little more room helps. For the smoothest experience, explore the labs on a laptop or desktop. Some simulations may run slowly on mobile.</p></div>
  </div>;
}
