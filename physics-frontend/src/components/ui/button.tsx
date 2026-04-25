"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-accent text-primary hover:bg-accent-light hover:shadow-[0_0_30px_rgba(0,212,255,0.3)] active:scale-95":
              variant === "primary",
            "bg-secondary text-white hover:bg-secondary-light hover:shadow-[0_0_30px_rgba(124,58,237,0.3)] active:scale-95":
              variant === "secondary",
            "bg-energy text-primary-dark hover:bg-energy-light active:scale-95":
              variant === "accent",
            "bg-transparent text-text hover:bg-surface-light hover:text-text-bright":
              variant === "ghost",
            "border-2 border-accent text-accent hover:bg-accent/10 hover:shadow-[0_0_20px_rgba(0,212,255,0.15)]":
              variant === "outline",
          },
          {
            "px-4 py-2 text-sm": size === "sm",
            "px-6 py-3 text-base": size === "md",
            "px-8 py-4 text-lg": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
