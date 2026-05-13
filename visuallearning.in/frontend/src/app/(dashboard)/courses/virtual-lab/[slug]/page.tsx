"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Maximize2, Beaker } from "lucide-react";
import { virtualLabGames, GAMES_BASE_URL } from "@/data/virtual-lab-games";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { hasActiveSubscription, getSubscriptionList } from "@/lib/subscription-access";

export default function VirtualLabGamePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [checked, setChecked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const game = virtualLabGames.find((g) => g.slug === slug);

  useEffect(() => {
    if (!user) return;
    if (user.role === "ADMIN") {
      setIsSubscribed(true);
      setChecked(true);
      return;
    }

    const cached = sessionStorage.getItem("vl_my_sub");
    if (cached) {
      try {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < 5 * 60 * 1000 && data) {
          setIsSubscribed(hasActiveSubscription(data));
          setChecked(true);
          return;
        }
      } catch {}
    }
    api.get("/subscription/my-subscription").then(({ data }) => {
      const subscriptions = getSubscriptionList(data);
      sessionStorage.setItem("vl_my_sub", JSON.stringify({ data: subscriptions, ts: Date.now() }));
      setIsSubscribed(hasActiveSubscription(subscriptions));
      setChecked(true);
    }).catch(() => setChecked(true));
  }, [user]);

  useEffect(() => {
    if (!game) router.replace("/courses/virtual-lab");
  }, [game, router]);

  useEffect(() => {
    if (checked && !isSubscribed) router.replace("/subscription");
  }, [checked, isSubscribed, router]);

  if (!game || !checked || !isSubscribed) return null;

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
        <button
          onClick={handleFullscreen}
          className="flex items-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg text-sm text-white transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
          Fullscreen
        </button>
      </div>

      {/* Game Embed */}
      <div id="game-container" className="relative bg-gray-900 rounded-xl overflow-hidden shadow-xl" style={{ paddingBottom: "62.5%" }}>
        <iframe
          src={`${GAMES_BASE_URL}/${game.slug}/index.html`}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen *; gamepad; gyroscope; accelerometer; pointer-lock"
        />
      </div>

      <p className="text-center text-gray-400 text-sm mt-4">
        Click inside the simulation to interact. Use Fullscreen for best experience.
      </p>
    </div>
  );
}
