"use client";
import Link from "next/link";
import { ArrowLeft, Beaker, Monitor, Eye, FlaskConical } from "lucide-react";
import { virtualLabGames } from "@/data/virtual-lab-games";

const viewerCount = virtualLabGames.filter((g) => g.labType === "viewer").length;
const experimentCount = virtualLabGames.filter((g) => g.labType === "experiment").length;

export default function VirtualLabPage() {
  return (
    <div className="max-w-4xl mx-auto">
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

      {/* Device warning */}
      <div className="flex items-center gap-2 px-4 py-3 mb-8 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <Monitor className="w-4 h-4 flex-shrink-0" />
        <p>Virtual Labs run smoothly on <strong>laptops &amp; desktops</strong>. Mobile/Android devices may experience lag.</p>
      </div>

      {/* Two Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* 3D Viewer Card */}
        <Link href="/courses/virtual-lab/viewers">
          <div className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-cyan-300 transition-all cursor-pointer">
            <div className="h-44 bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-black/5" />
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
              <Eye className="w-16 h-16 text-white/90 relative z-10 group-hover:scale-110 transition-transform" />
            </div>
            <div className="p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-cyan-700 transition-colors">
                3D Viewer
              </h2>
              <p className="text-gray-500 text-sm mb-3">
                Explore 3D models — rotate, zoom and examine from every angle
              </p>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-700">
                {viewerCount} Models
              </span>
            </div>
          </div>
        </Link>

        {/* 3D Virtual Experiments Card */}
        <Link href="/courses/virtual-lab/experiments">
          <div className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-teal-300 transition-all cursor-pointer">
            <div className="h-44 bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-black/5" />
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
              <FlaskConical className="w-16 h-16 text-white/90 relative z-10 group-hover:scale-110 transition-transform" />
            </div>
            <div className="p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-teal-700 transition-colors">
                3D Virtual Experiments
              </h2>
              <p className="text-gray-500 text-sm mb-3">
                Perform interactive experiments in Biology, Chemistry &amp; Physics
              </p>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">
                {experimentCount} Experiments
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
