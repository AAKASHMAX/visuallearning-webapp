"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronRight, Play, Clock3 } from "lucide-react";
import { getChapterAnimation } from "@/components/chapter-animations";

interface AnimatedChapterCardProps {
  name: string;
  href: string;
  order: number;
  animationKey?: string | null;
  description?: string;
  resourceLabel?: string;
  disabled?: boolean;
  preview?: boolean;
}

export function AnimatedChapterCard({ name, href, order, animationKey, description, resourceLabel, disabled = false, preview = false }: AnimatedChapterCardProps) {
  const Animation = getChapterAnimation(name, animationKey);
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => visualRef.current?.querySelectorAll("svg").forEach(svg => {
      if (media.matches) svg.pauseAnimations?.();
      else svg.unpauseAnimations?.();
    });
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [name, animationKey]);

  const contents = <>
    <span className="physics-chapter-number">{order}</span>
    <div ref={visualRef} className="physics-chapter-visual" aria-hidden="true">{Animation ? <Animation /> : <div className="physics-chapter-orbits"><span /><span /><span /><i /></div>}</div>
    <h3>{name}</h3>
    {description && <p className="physics-chapter-description">{description}</p>}
    <span className="physics-chapter-count">{disabled ? <Clock3 size={12} /> : <Play size={12} />}{disabled ? "Coming soon" : resourceLabel || "Explore chapter"}</span>
    {preview && !disabled && <span className="physics-chapter-preview">Free preview</span>}
    {!disabled && <ChevronRight className="physics-chapter-arrow" size={17} />}
  </>;
  return disabled ? <div className="physics-chapter-card is-unavailable" aria-disabled="true">{contents}</div> : <Link href={href} className="physics-chapter-card">{contents}</Link>;
}
