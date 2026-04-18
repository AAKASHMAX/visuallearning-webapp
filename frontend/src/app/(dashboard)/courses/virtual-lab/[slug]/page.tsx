"use client";
import { useParams, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Maximize2, Minimize2, Beaker } from "lucide-react";
import { useState } from "react";
import { virtualLabGames } from "@/data/virtual-lab-games";

export default function VirtualLabGamePage() {
  const { slug } = useParams<{ slug: string }>();
  const [fullscreen, setFullscreen] = useState(false);

  const game = virtualLabGames.find((g) => g.slug === slug);
  if (!game) redirect("/courses/virtual-lab");

  const toggleFullscreen = () => {
    const iframe = document.getElementById("game-iframe") as HTMLIFrameElement | null;
    if (!iframe) return;
    if (!fullscreen) {
      iframe.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setFullscreen(!fullscreen);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href="/courses/virtual-lab" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Beaker className="w-5 h-5 text-teal-600" />
              {game.title}
            </h1>
            <p className="text-gray-400 text-sm capitalize">{game.category}</p>
          </div>
        </div>
        <button
          onClick={toggleFullscreen}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-600 transition-colors"
        >
          {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          {fullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>
      </div>

      {/* Game Embed */}
      <div className="relative bg-black rounded-xl overflow-hidden shadow-xl" style={{ paddingBottom: "56.25%" }}>
        <iframe
          id="game-iframe"
          src={game.itchUrl}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen *; geolocation; microphone; camera; midi; monetization; xr-spatial-tracking; gamepad; gyroscope; accelerometer; xr; cross-origin-isolated"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-pointer-lock"
          loading="lazy"
        />
      </div>

      {/* Tip */}
      <p className="text-center text-gray-400 text-sm mt-4">
        Use fullscreen for the best experience. Click inside the simulation to interact.
      </p>
    </div>
  );
}
