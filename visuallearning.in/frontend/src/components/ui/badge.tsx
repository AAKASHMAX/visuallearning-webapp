import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
}
export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return <span className={cn(
    "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold leading-tight",
    {
      "bg-surface-light text-text-muted": variant === "default",
      "bg-emerald-500/15 text-emerald-300": variant === "success",
      "bg-amber-500/15 text-amber-300": variant === "warning",
      "bg-red-500/15 text-red-300": variant === "danger",
      "bg-accent/10 text-accent": variant === "info",
    }, className
  )} {...props} />;
}
