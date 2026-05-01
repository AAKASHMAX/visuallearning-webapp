"use client";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string; // if undefined, it's the current page (no link)
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 text-sm mb-5 flex-wrap">
      <Link href="/courses" className="text-primary hover:underline flex items-center gap-1 shrink-0">
        <Home className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Courses</span>
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          {item.href ? (
            <Link href={item.href} className="text-primary hover:underline truncate max-w-[150px] sm:max-w-none">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-600 font-medium truncate max-w-[150px] sm:max-w-none">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
