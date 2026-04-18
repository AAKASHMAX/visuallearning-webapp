"use client";
import { FlaskConical } from "lucide-react";
import { virtualLabGames } from "@/data/virtual-lab-games";
import GameList from "../_components/game-list";

const experimentGames = virtualLabGames.filter((g) => g.labType === "experiment");

export default function ExperimentsPage() {
  return (
    <GameList
      games={experimentGames}
      title="3D Virtual Experiments"
      icon={<FlaskConical className="w-6 h-6 text-teal-600" />}
    />
  );
}
