import Link from "next/link";
import {
  BookOpen,
  ShieldCheck,
  GraduationCap,
  UserCog,
  Clock,
  IndianRupee,
  ArrowRight,
  Library,
  LogIn,
  UserPlus,
} from "lucide-react";
import BackendHealthBadge from "@/components/BackendHealthBadge";

const roles = [
  {
    title: "Student Portal",
    href: "/student",
    description:
      "Search the catalog, check real-time copy availability, request book issues, and track due dates & fines.",
    icon: GraduationCap,
    highlights: ["14-day borrowing period", "Live availability & history"],
  },
  {
    title: "Librarian Desk",
    href: "/librarian",
    description:
      "Manage catalog books & physical copies, register students, process issues/returns, and monitor overdue items.",
    icon: BookOpen,
    highlights: ["Copy-level tracking", "Automated fine calculation"],
  },
  {
    title: "Administrator",
    href: "/admin",
    description:
      "Oversee student and librarian accounts, configure library policies, and review institutional analytics.",
    icon: UserCog,
    highlights: ["Role-based access control", "Full transaction reports"],
  },
];

const rules = [
  {
    icon: Clock,
    label: "Borrowing Period",
    value: "14 Days",
    note: "Standard loan window per issued copy",
  },
  {
    icon: IndianRupee,
    label: "Overdue Fine",
    value: "₹5 / Day",
    note: "Zero fine if returned on or before due date",
  },
  {
    icon: ShieldCheck,
    label: "Copy Integrity",
    value: "1 Student / Copy",
    note: "Prevents duplicate active issues on the same copy",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-30 border-b border-vvitu-navy/10 bg-vvitu-navy text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vvitu-gold text-vvitu-navy shadow-sm">
              <Library className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-wide text-white sm:text-base">
                VVITU Central Library
              </p>
              <p className="text-[11px] text-vvitu-gold-light sm:text-xs">
                Smart Library Management System
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4">
            <a
              href="#portals"
              className="hidden text-sm font-medium text-white/85 transition hover:text-vvitu-gold-light md:inline"
            >
              Portals
            </a>
            <a
              href="#rules"
              className="hidden text-sm font-medium text-white/85 transition hover:text-vvitu-gold-light md:inline"
            >
              Policies
            </a>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 sm:text-sm"
            >
              <LogIn className="h-3.5 w-3.5" />
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-lg bg-vvitu-gold px-3 py-1.5 text-xs font-semibold text-vvitu-navy transition hover:bg-vvitu-gold-light sm:text-sm"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Register
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden bg-vvitu-navy py-16 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-vvitu-gold/40 bg-vvitu-gold/15 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-vvitu-gold-light">
                Vasireddy Venkatadri International Technological University
              </span>
              <BackendHealthBadge />
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Smart Library Management for{" "}
              <span className="text-vvitu-gold-light">VVITU</span>
            </h1>

            <p className="mt-5 text-base leading-relaxed text-slate-200 sm:text-lg">
              A unified, secure academic library platform powered by Next.js,
              Python FastAPI, and Supabase PostgreSQL — built for students,
              librarians, and university administrators across desktop and
              mobile devices.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-vvitu-gold px-5 py-3 text-sm font-semibold text-vvitu-navy shadow-sm transition hover:bg-vvitu-gold-light"
              >
                Sign In to Portal
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Student Registration
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="portals" className="bg-vvitu-cream py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-vvitu-navy sm:text-3xl">
              Dedicated Role Portals
            </h2>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Preview each dashboard layout below. Role-based authentication and
              Row Level Security will enforce access in Phase 3.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Link
                  key={role.title}
                  href={role.href}
                  className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-vvitu-gold hover:shadow-md"
                >
                  <div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-vvitu-navy text-vvitu-gold-light">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 flex items-center justify-between text-lg font-bold text-vvitu-navy">
                      {role.title}
                      <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-vvitu-gold-dark" />
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {role.description}
                    </p>
                  </div>

                  <ul className="mt-5 space-y-1.5 border-t border-slate-100 pt-4 text-xs font-medium text-vvitu-navy">
                    {role.highlights.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-vvitu-gold" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section id="rules" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-vvitu-navy sm:text-3xl">
              University Library Policies
            </h2>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Enforced automatically by the Python FastAPI service layer and
              PostgreSQL constraints.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {rules.map((rule) => {
              const Icon = rule.icon;
              return (
                <div
                  key={rule.label}
                  className="rounded-xl border border-vvitu-navy/10 bg-vvitu-cream p-6"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-vvitu-gold-dark" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {rule.label}
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-extrabold text-vvitu-navy">
                    {rule.value}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{rule.note}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-slate-200 bg-vvitu-navy py-8 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 text-xs text-slate-300 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} Vasireddy Venkatadri International
            Technological University (VVITU) — Smart Library Management System.
          </p>
          <p className="text-vvitu-gold-light">
            Built with Next.js, FastAPI &amp; Supabase
          </p>
        </div>
      </footer>
    </div>
  );
}
