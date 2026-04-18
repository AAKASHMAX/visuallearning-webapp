"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Beaker, ExternalLink, Search } from "lucide-react";
import { virtualLabGames, categories } from "@/data/virtual-lab-games";

const categoryColors: Record<string, string> = {
  biology: "bg-green-100 text-green-700",
  chemistry: "bg-purple-100 text-purple-700",
  physics: "bg-blue-100 text-blue-700",
  environment: "bg-amber-100 text-amber-700",
};

const categoryBgColors: Record<string, string> = {
  biology: "from-green-500 to-emerald-600",
  chemistry: "from-purple-500 to-violet-600",
  physics: "from-blue-500 to-indigo-600",
  environment: "from-amber-500 to-orange-600",
};

const categoryEmojis: Record<string, string> = {
  biology: "🧬",
  chemistry: "⚗️",
  physics: "⚡",
  environment: "🌍",
};

export default function VirtualLabPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = virtualLabGames.filter((g) => {
    const matchCategory = activeCategory === "all" || g.category === activeCategory;
    const matchSearch = !search || g.title.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/courses" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Beaker className="w-6 h-6 text-teal-600" />
            Virtual Lab
          </h1>
          <p className="text-gray-500 text-sm">Interactive 3D simulations &amp; experiments</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search experiments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === cat.key
                  ? "bg-teal-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-sm text-gray-400 mb-4">{filtered.length} experiments</p>

      {/* Game Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((game) => (
          <a key={game.slug} href={game.gameUrl} target="_blank" rel="noopener noreferrer">
            <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-teal-300 transition-all cursor-pointer h-full">
              {/* Preview area */}
              <div className={`h-36 bg-gradient-to-br ${categoryBgColors[game.category]} flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full p-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-5xl relative z-10 group-hover:scale-110 transition-transform">
                  {categoryEmojis[game.category]}
                </span>
              </div>
              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-teal-700 transition-colors">
                  {game.title}
                </h3>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[game.category]}`}>
                  {game.category.charAt(0).toUpperCase() + game.category.slice(1)}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Beaker className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No experiments found</p>
          <p className="text-sm">Try a different search or category</p>
        </div>
      )}
    </div>
  );
}
