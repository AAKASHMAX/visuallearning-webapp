"use client";
import { useParams, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Maximize2, Beaker, ExternalLink } from "lucide-react";
import { virtualLabGames } from "@/data/virtual-lab-games";

export default function VirtualLabGamePage() {
  const { slug } = useParams<{ slug: string }>();

  const game = virtualLabGames.find((g) => g.slug === slug);
  if (!game) redirect("/courses/virtual-lab");

  const handleFullscreen = () => {
    const container = document.getElementById("game-container");
    container?.requestFullscreen?.();
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
        <div className="flex items-center gap-2">
          <a
            href={game.gameUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-600 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open in itch.io
          </a>
          <button
            onClick={handleFullscreen}
            className="flex items-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg text-sm text-white transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
            Fullscreen
          </button>
        </div>
      </div>

      {/* Game Embed */}
      <div id="game-container" className="relative bg-gray-900 rounded-xl overflow-hidden shadow-xl" style={{ paddingBottom: "62.5%" }}>
        <iframe
          src={`https://html-classic.itch.zone/html/${game.uploadId}/index.html`}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen *; gamepad; gyroscope; accelerometer; pointer-lock"
          loading="lazy"
        />
      </div>

      <p className="text-center text-gray-400 text-sm mt-4">
        Click inside the simulation to interact. Use Fullscreen for best experience.
      </p>
    </div>
  );
}
