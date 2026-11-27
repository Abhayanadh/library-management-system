"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Library,
  Menu,
  X,
  Bell,
  LogOut,
  LayoutDashboard,
  BookOpen,
  BookMarked,
  User,
  Users,
  ArrowLeftRight,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

const roleNavConfig = {
  student: {
    label: "Student Portal",
    badge: "Student",
    items: [
      { href: "/student", label: "Dashboard", icon: LayoutDashboard },
      { href: "/student/catalog", label: "Browse Books", icon: BookOpen },
      { href: "/student/borrowed", label: "Borrowed & History", icon: BookMarked },
      { href: "/student/profile", label: "My Profile", icon: User },
    ],
  },
  librarian: {
    label: "Librarian Desk",
    badge: "Librarian",
    items: [
      { href: "/librarian", label: "Dashboard", icon: LayoutDashboard },
      { href: "/librarian/books", label: "Manage Books", icon: BookOpen },
      { href: "/librarian/circulation", label: "Issue & Return", icon: ArrowLeftRight },
      { href: "/librarian/students", label: "Students", icon: Users },
    ],
  },
  admin: {
    label: "Admin Console",
    badge: "Administrator",
    items: [
      { href: "/admin", label: "Overview & Stats", icon: BarChart3 },
      { href: "/admin/users", label: "User Accounts", icon: Users },
      { href: "/admin/transactions", label: "Transactions", icon: ArrowLeftRight },
      { href: "/admin/settings", label: "Library Settings", icon: Settings },
    ],
  },
};

/**
 * Shared responsive dashboard shell with desktop sidebar and mobile slide-over drawer.
 */
export function DashboardShell({ role = "student", title, subtitle, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const pathname = usePathname();
  const config = roleNavConfig[role] || roleNavConfig.student;

  const NavLinks = ({ onNavigate }) => (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {config.items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-vvitu-gold text-vvitu-navy font-semibold shadow-sm"
                : "text-slate-200 hover:bg-vvitu-navy-light hover:text-white"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-vvitu-cream">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-vvitu-navy text-white lg:flex">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vvitu-gold text-vvitu-navy">
            <Library className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-wide">VVITU Library</p>
            <p className="text-[11px] text-vvitu-gold-light">{config.label}</p>
          </div>
        </div>

        <NavLinks />

        <div className="border-t border-white/10 p-4">
          <Link
            href="/login"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-vvitu-navy-dark/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 flex w-72 max-w-[85vw] flex-col bg-vvitu-navy text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vvitu-gold text-vvitu-navy">
                  <Library className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold">VVITU Library</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="rounded-lg p-1 text-slate-300 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks onNavigate={() => setMobileOpen(false)} />
            <div className="border-t border-white/10 p-4">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="rounded-lg border border-slate-200 p-2 text-vvitu-navy hover:bg-slate-50 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-vvitu-navy sm:text-lg">
                {title}
              </h1>
              {subtitle && (
                <p className="hidden text-xs text-slate-500 sm:block">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="relative flex items-center gap-3">
            <Badge variant="gold">{config.badge}</Badge>
            <button
              type="button"
              onClick={() => setShowNotif((prev) => !prev)}
              aria-label="Notifications"
              className="relative rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-vvitu-gold" />
            </button>

            {showNotif && (
              <div className="absolute right-0 top-12 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                <p className="text-xs font-bold uppercase tracking-wider text-vvitu-navy">
                  Notifications
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Live due-date and issue alerts will appear here once Supabase
                  Auth &amp; APIs are connected in Phase 3–5.
                </p>
              </div>
            )}
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
