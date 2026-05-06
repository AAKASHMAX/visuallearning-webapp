"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";

type FreeOfferCountdownProps = {
  until?: string | null;
  className?: string;
};

type FreePriceHighlightProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

function getMidnightExpiry(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const expiry = new Date(date);
  expiry.setHours(24, 0, 0, 0);
  return expiry;
}

function formatCountdown(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export function FreeOfferCountdown({ until, className = "" }: FreeOfferCountdownProps) {
  const expiry = useMemo(() => getMidnightExpiry(until), [until]);
  const [countdown, setCountdown] = useState("--:--:--");

  useEffect(() => {
    if (!expiry) return;

    const updateCountdown = () => {
      setCountdown(formatCountdown(expiry.getTime() - Date.now()));
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [expiry]);

  if (!expiry) return null;

  return (
    <div className={`mt-2 inline-flex items-center gap-2 rounded-full border border-success/25 bg-success/10 px-3 py-1.5 text-xs font-bold text-success shadow-[0_0_22px_rgba(16,185,129,0.12)] ${className}`}>
      <Clock className="h-3.5 w-3.5" />
      <span>Ends in</span>
      <span className="font-mono tracking-wide text-text-bright">{countdown}</span>
    </div>
  );
}

export function FreePriceHighlight({ size = "lg", className = "" }: FreePriceHighlightProps) {
  const sizeClass = {
    sm: "text-2xl px-2.5 py-1",
    md: "text-3xl px-3 py-1",
    lg: "text-4xl px-3 py-1.5",
  }[size];

  return (
    <span className={`inline-flex items-center rounded-xl border border-success/30 bg-success/15 font-black tracking-wide text-success shadow-[0_0_28px_rgba(16,185,129,0.18)] ${sizeClass} ${className}`}>
      FREE
    </span>
  );
}
