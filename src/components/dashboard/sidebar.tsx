"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Stethoscope,
  FlaskConical,
  FileText,
  MessageCircle,
  Utensils,
  Activity,
  ClipboardCheck,
  Settings,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/treatment-plans", label: "Treatment Plans", icon: Stethoscope },
  { href: "/clinical-trials", label: "Clinical Trials", icon: FlaskConical },
  { href: "/reports", label: "Reports & Analysis", icon: FileText },
  { href: "/chat", label: "AI Assistant", icon: MessageCircle },
  { href: "/diet-lifestyle", label: "Diet & Lifestyle", icon: Utensils },
  { href: "/side-effects", label: "Side Effects", icon: Activity },
  { href: "/second-opinion", label: "Second Opinion", icon: ClipboardCheck },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  user: { name?: string | null; email?: string | null };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        aria-label="Open sidebar"
        className="fixed left-4 top-4 z-50 rounded-lg bg-gray-900 p-2 text-white md:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-gray-200 bg-white transition-transform md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b px-6 py-5">
          <Link href="/dashboard" className="text-xl font-bold text-gray-900">
            <span className="text-teal-600">Z</span>inara
          </Link>
          <button
            type="button"
            aria-label="Close sidebar"
            className="text-gray-400 md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "bg-teal-50 text-teal-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-teal-600" : "text-gray-400"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t px-4 py-3 pb-14">
          <div>
            <p className="text-sm font-medium text-gray-900">
              {user.name}
            </p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
