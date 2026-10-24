"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Maximize2, Beaker, MousePointer2 } from "lucide-react";
import { virtualLabGames, GAMES_BASE_URL } from "@/data/virtual-lab-games";
import { useLabAccess } from "../_components/use-lab-access";

export default function VirtualLabGamePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { status, retry } = useLabAccess();
  const [fullscreenError, setFullscreenError] = useState("");
  const game = virtualLabGames.find((g) => g.slug === slug);

  useEffect(() => {
    if (!game) router.replace("/courses/virtual-lab");
  }, [game, router]);

  useEffect(() => {
    if (status === "denied") router.replace("/pricing");
  }, [status, router]);

  if (status === "error") return <div className="learning-page"><div className="learn-empty" role="alert"><Beaker /><h3>We couldn’t check your access.</h3><p>Please check your connection and try again.</p><button className="learn-button" onClick={retry}>Try again</button></div></div>;
  if (!game || status !== "allowed") return <div className="learning-page"><div className="learn-empty" role="status"><Beaker /><h3>Getting your lab ready…</h3><p>One moment while we check your access.</p></div></div>;

  const handleFullscreen = async () => {
    const container = document.getElementById("game-container");
    setFullscreenError("");
    try {
      if (!container?.requestFullscreen) throw new Error("Fullscreen unavailable");
      await container.requestFullscreen();
    } catch { setFullscreenError("Fullscreen isn’t available in this browser. You can keep exploring below."); }
  };

  return (
    <div className="learning-page learn-lab-viewer-page">
      {/* Header */}
      <div className="learn-lab-viewer-header">
        <div className="flex items-center gap-3">
          <Link href="/courses/virtual-lab" aria-label="Back to virtual labs" className="learn-arrow-circle">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="learn-step">YOUR VIRTUAL LAB</span>
            <h1>
              {game.title}
            </h1>
            <p className="learn-lab-viewer-category">{game.category} · {game.labType === "viewer" ? "3D model" : "Interactive experiment"}</p>
          </div>
        </div>
        <button
          onClick={handleFullscreen}
          className="learn-button learn-button-outline"
        >
          <Maximize2 className="w-4 h-4" />
          Fullscreen
        </button>
      </div>

      {/* Game Embed */}
      {fullscreenError && <p className="learn-lab-fullscreen-note" role="status">{fullscreenError}</p>}
      <div id="game-container" className="learn-lab-embed" style={{ paddingBottom: "62.5%" }}>
        <iframe
          title={`${game.title} interactive ${game.labType === "viewer" ? "3D model" : "experiment"}`}
          src={`${GAMES_BASE_URL}/${game.slug}/index.html`}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen *; gamepad; gyroscope; accelerometer; pointer-lock"
        />
      </div>

      <p className="learn-lab-interaction-note"><MousePointer2 size={16} />
        Click inside the simulation to interact. Use Fullscreen for best experience.
      </p>
    </div>
  );
}
