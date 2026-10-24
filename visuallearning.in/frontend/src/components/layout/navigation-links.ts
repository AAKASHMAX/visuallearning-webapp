import { BarChart3, Bell, BookOpen, CreditCard, FolderOpen, Gift, Globe, LayoutDashboard, Library, MapPin, Megaphone, MessageSquare, MessageSquareText, Phone, Send, Ticket, User, Users } from "lucide-react";

export const publicLinks = [
  { href: "/courses", label: "Courses" },
  { href: "/demo", label: "Explore demos" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#about", label: "About us" },
];
export const learningLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/courses", label: "My learning", icon: BookOpen },
  { href: "/pricing", label: "Subscription", icon: CreditCard },
  { href: "/affiliate", label: "Refer & earn", icon: Gift },
  { href: "/contact", label: "Contact us", icon: Phone },
  { href: "/feedback", label: "Share feedback", icon: MessageSquare },
  { href: "/profile", label: "My profile", icon: User },
];
export const adminLinks = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/courses", label: "Courses", icon: Library },
  { href: "/admin/content", label: "Content library", icon: FolderOpen },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/telegram", label: "Telegram", icon: Send },
  { href: "/admin/feedback", label: "Feedback", icon: MessageSquareText },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/affiliates", label: "Affiliates", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];
export const settingsLinks = [
  { href: "/admin/settings/languages", label: "Languages", icon: Globe },
  { href: "/admin/settings/subscription", label: "Subscription plans", icon: CreditCard },
  { href: "/admin/settings/coupons", label: "Coupon codes", icon: Ticket },
  { href: "/admin/settings/contact", label: "Contact details", icon: MapPin },
  { href: "/admin/settings/announcement", label: "Announcement", icon: Megaphone },
  { href: "/admin/settings/trial", label: "Free trial", icon: Gift },
  { href: "/admin/settings/leads", label: "Calling leads", icon: Phone },
];
export function isNavigationActive(pathname: string, href: string) {
  return pathname === href || (!href.includes("#") && pathname.startsWith(`${href}/`));
}
