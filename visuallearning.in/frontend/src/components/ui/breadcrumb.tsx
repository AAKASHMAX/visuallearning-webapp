"use client";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
interface BreadcrumbProps { items: BreadcrumbItem[]; }
export function Breadcrumb({ items }: BreadcrumbProps) {
  return <nav aria-label="Breadcrumb" className="vl-breadcrumb">
    <ol>
      <li><Link href="/courses" aria-label="Courses"><Home size={14} aria-hidden="true" /><span>Courses</span></Link></li>
      {items.map((item, index) => <li key={`${item.label}-${index}`}><ChevronRight size={12} aria-hidden="true" />{item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</li>)}
    </ol>
  </nav>;
}
