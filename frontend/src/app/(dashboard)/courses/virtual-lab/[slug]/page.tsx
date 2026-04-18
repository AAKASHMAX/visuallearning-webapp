"use client";
import { useParams, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Maximize2, Beaker } from "lucide-react";
import { virtualLabGames } from "@/data/virtual-lab-games";

export default function VirtualLabGamePage() {
  const { slug } = useParams<{ slug: string }>();

  const game = virtualLabGames.find((g) => g.slug === slug);
  if (!game) redirect("/courses/virtual-lab");

  // Games with local files use /virtual-lab/SLUG/index.html
  // Games without local files are not yet available
  const embedSrc = game.hasLocalFiles ? `/virtual-lab/${game.slug}/index.html` : null;

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
        {embedSrc && (
          <button
            onClick={handleFullscreen}
            className="flex items-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg text-sm text-white transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
            Fullscreen
          </button>
        )}
      </div>

      {/* Game Embed */}
      {embedSrc ? (
        <div id="game-container" className="relative bg-gray-900 rounded-xl overflow-hidden shadow-xl" style={{ paddingBottom: "62.5%" }}>
          <iframe
            src={embedSrc}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen *; gamepad; gyroscope; accelerometer; pointer-lock"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Beaker className="w-16 h-16 mb-4 opacity-40" />
          <p className="font-semibold text-lg text-gray-600">Coming Soon</p>
          <p className="text-sm mt-1">This experiment is being set up</p>
        </div>
      )}

      <p className="text-center text-gray-400 text-sm mt-4">
        Click inside the simulation to interact. Use Fullscreen for best experience.
      </p>
    </div>
  );
}
