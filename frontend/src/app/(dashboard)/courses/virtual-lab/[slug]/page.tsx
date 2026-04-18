"use client";
import { useParams, redirect } from "next/navigation";
import { useEffect } from "react";
import { virtualLabGames } from "@/data/virtual-lab-games";

export default function VirtualLabGameRedirect() {
  const { slug } = useParams<{ slug: string }>();
  const game = virtualLabGames.find((g) => g.slug === slug);

  useEffect(() => {
    if (game) {
      window.open(game.gameUrl, "_blank");
      window.history.back();
    }
  }, [game]);

  if (!game) redirect("/courses/virtual-lab");

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p className="text-gray-500">Opening {game.title}...</p>
    </div>
  );
}
