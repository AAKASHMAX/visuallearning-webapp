"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Atom, Beaker, Dna, Leaf, Search, Lock, Monitor, X } from "lucide-react";
import { type VirtualLabGame, categories, previewVideos } from "@/data/virtual-lab-games";
import { useLabAccess } from "./use-lab-access";

const categoryIcons = { biology: Dna, chemistry: Beaker, physics: Atom, environment: Leaf };
function GameCard({ game, isSubscribed, subscriptionChecked }: { game: VirtualLabGame; isSubscribed: boolean; subscriptionChecked: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const previewUrl = previewVideos[game.slug];
  const isLocked = subscriptionChecked && !isSubscribed;
  const thumbnailUrl = previewUrl?.replace("/video/upload/f_mp4,q_auto/", "/video/upload/so_0,w_400,h_200,c_fill,q_auto,f_jpg/").replace(/\.\w+$/, ".jpg");
  const Icon = categoryIcons[game.category];
  const startPreview = () => { if (videoRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) { videoRef.current.currentTime = 0; void videoRef.current.play().catch(() => {}); } };
  const stopPreview = () => { if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; } };
  return <Link href={isLocked ? "/pricing" : `/courses/virtual-lab/${game.slug}`} className="learn-lab-card" onMouseEnter={startPreview} onMouseLeave={stopPreview} onFocus={startPreview} onBlur={stopPreview}>
    <div className={`learn-lab-thumbnail learn-lab-${game.category}`}><Icon size={52} strokeWidth={1.2} aria-hidden="true" />{previewUrl && <>{!imageFailed && <img src={thumbnailUrl} alt="" loading="lazy" onError={() => setImageFailed(true)} />}<video ref={videoRef} src={previewUrl} muted loop playsInline preload="none" aria-hidden="true" /></>}{isLocked && <span className="learn-lab-lock"><Lock size={11} /> Premium</span>}</div>
    <div className="learn-lab-card-content"><span className="learn-step">{game.category}</span><h2>{game.title}</h2><div><span>{isLocked ? "Explore plans" : game.labType === "viewer" ? "Explore model" : "Open experiment"}</span><ArrowUpRight size={17} /></div></div>
  </Link>;
}

export default function GameList({ games, title, icon }: { games: VirtualLabGame[]; title: string; icon: React.ReactNode }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const { status, retry } = useLabAccess();
  const isSubscribed = status === "allowed";
  const subscriptionChecked = status === "allowed" || status === "denied" || status === "anonymous";
  const availableCategories = categories.filter(cat => cat.key === "all" || games.some(game => game.category === cat.key));
  const filtered = games.filter(game => (activeCategory === "all" || game.category === activeCategory) && (!search.trim() || game.title.toLowerCase().includes(search.trim().toLowerCase())));
  const clearFilters = () => { setSearch(""); setActiveCategory("all"); };
  return <div className="learning-page learn-lab-page">
    <Link href="/courses/virtual-lab" className="learn-text-link learn-path-back"><ArrowLeft size={16} /> Back to the virtual lab</Link>
    <header className="learn-page-header"><div><span className="learn-eyebrow"><span /> FOLLOW YOUR CURIOSITY</span><h1>{title}</h1><p>A new perspective is one click away. Find a topic and make your own connections.</p></div><span className="learn-lab-heading-icon">{icon}</span></header>
    <div className="learn-lab-filter-bar"><div className="learn-lab-filters" aria-label="Filter by subject">{availableCategories.map(cat => <button key={cat.key} type="button" aria-pressed={activeCategory === cat.key} onClick={() => setActiveCategory(cat.key)} className={activeCategory === cat.key ? "is-active" : ""}>{cat.label}</button>)}</div><div className="learn-lab-search"><Search size={17} /><label htmlFor="lab-search" className="sr-only">Search virtual labs</label><input id="lab-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Find something to explore…" />{search && <button type="button" aria-label="Clear search" onClick={() => setSearch("")}><X size={15} /></button>}</div></div>
    <div className="learn-lab-results"><span aria-live="polite">{filtered.length} {filtered.length === 1 ? "discovery" : "discoveries"} to explore</span>{subscriptionChecked && <span>{isSubscribed ? "Included with your access" : "A subscription opens every lab"}</span>}</div>
    {status === "error" && <p className="learn-lab-fullscreen-note" role="status">We couldn’t check your access. <button className="learn-text-link" onClick={retry}>Try again</button></p>}
    {filtered.length ? <div className="learn-lab-grid">{filtered.map(game => <GameCard key={game.slug} game={game} isSubscribed={isSubscribed} subscriptionChecked={subscriptionChecked} />)}</div> : <div className="learn-empty"><Search /><h3>No discoveries here just yet.</h3><p>Try a different search or subject to find your next experiment.</p><button className="learn-button learn-button-outline" onClick={clearFilters}>Clear filters</button></div>}
    <div className="learn-device-note"><Monitor size={19} /><p>Best explored on a laptop or desktop. Some 3D simulations may run slowly on mobile devices.</p></div>
  </div>;
}
