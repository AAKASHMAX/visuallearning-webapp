"use client";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "accent";
  size?: "sm" | "md" | "lg";
}
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <button ref={ref} className={cn(
      "vl-ui-button inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary disabled:opacity-45 disabled:pointer-events-none",
      {
        "bg-accent text-primary-dark hover:bg-accent-light": variant === "default" || variant === "accent",
        "border border-accent/40 bg-transparent text-accent hover:bg-accent/10": variant === "outline",
        "text-text-muted hover:bg-surface-light hover:text-accent": variant === "ghost",
        "bg-red-600 text-white hover:bg-red-700": variant === "destructive",
      },
      {
        "px-4 py-2 text-xs min-h-9": size === "sm",
        "px-6 py-3 text-sm min-h-11": size === "md",
        "px-7 py-3.5 text-sm min-h-12": size === "lg",
      }, className
    )} {...props} />
  )
);
Button.displayName = "Button";
export { Button };
