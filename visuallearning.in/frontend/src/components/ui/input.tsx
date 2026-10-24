"use client";
import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, "aria-describedby": describedBy, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    return <div className="w-full">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-heading mb-2">{label}</label>}
      <input ref={ref} id={inputId} className={cn(
        "w-full px-4 py-3 rounded-xl border bg-surface text-heading text-sm transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent",
        "placeholder:text-text-muted disabled:bg-primary-light disabled:cursor-not-allowed",
        error ? "border-red-400" : "border-border", className
      )} aria-invalid={error ? true : props["aria-invalid"]} aria-describedby={[describedBy, error ? errorId : ""].filter(Boolean).join(" ") || undefined} {...props} />
      {error && <p id={errorId} role="alert" className="mt-2 text-xs text-red-600">{error}</p>}
    </div>;
  }
);
Input.displayName = "Input";
export { Input };
