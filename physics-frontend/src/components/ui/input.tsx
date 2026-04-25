"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full px-4 py-3 rounded-xl bg-surface border border-border text-text placeholder-text-muted",
          "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50",
          "transition-all duration-300",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
export { Input };
