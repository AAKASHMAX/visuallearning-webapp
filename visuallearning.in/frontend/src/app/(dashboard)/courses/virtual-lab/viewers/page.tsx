"use client";
import { Eye } from "lucide-react";
import { virtualLabGames } from "@/data/virtual-lab-games";
import GameList from "../_components/game-list";

const viewerGames = virtualLabGames.filter((g) => g.labType === "viewer");

export default function ViewersPage() {
  return (
    <GameList
      games={viewerGames}
      title="3D Viewer"
      icon={<Eye className="w-6 h-6 text-cyan-600" />}
    />
  );
}
