"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, BookOpen, ArrowLeftRight, IndianRupee, BarChart3, TrendingUp, AlertTriangle } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { usersApi, circulationApi } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function AdminDashboardContent() {
  const [stats, setStats] = useState(null);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([usersApi.librarianDashboard(), circulationApi.listOverdue()])
      .then(([s, o]) => { setStats(s); setOverdue(o.slice(0, 5)); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <DashboardShell role="admin" title="Administrator Console" subtitle="VVITU Central Library analytics, accounts, and system policies">
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={loading ? "..." : (stats?.total_students ?? 0) + (stats?.total_librarians ?? 0)} subtitle={`${stats?.total_students ?? 0} students · ${stats?.total_librarians ?? 0} librarians`} icon={Users} accent="navy" />
        <StatCard title="Catalog Books" value={loading ? "..." : stats?.total_books ?? 0} subtitle={`${stats?.total_copies ?? 0} physical copies`} icon={BookOpen} accent="gold" />
        <StatCard title="Total Issued" value={loading ? "..." : stats?.issued_copies ?? 0} subtitle={`${stats?.overdue_issues ?? 0} overdue`} icon={ArrowLeftRight} accent="emerald" />
        <StatCard title="Fines Collected" value={loading ? "..." : `₹${stats?.total_fines_collected ?? 0}`} subtitle={`₹${stats?.pending_fines ?? 0} pending`} icon={IndianRupee} accent="red" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500" />Overdue Books</CardTitle>
              <CardDescription>Students exceeding the 14-day loan window</CardDescription>
            </div>
            <Link href="/admin/transactions"><Button variant="outline" size="sm">View All</Button></Link>
          </CardHeader>
          <CardContent>
            {overdue.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-6">✅ No overdue books — excellent!</p>
            ) : (
              <div className="space-y-2">
                {overdue.map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/60 p-3 text-xs">
                    <div>
                      <p className="font-semibold text-vvitu-navy">{issue.book_copies?.books?.title}</p>
                      <p className="text-slate-500">{issue.profiles?.full_name} · {issue.profiles?.roll_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">₹{issue.current_fine}</p>
                      <p className="text-slate-400">{issue.overdue_days} day(s) late</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-vvitu-gold-dark" />Library Statistics</CardTitle>
            <CardDescription>Real-time inventory & circulation summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Available Copies", value: stats?.available_copies ?? 0, total: stats?.total_copies ?? 1, color: "bg-emerald-500" },
              { label: "Currently Issued", value: stats?.issued_copies ?? 0, total: stats?.total_copies ?? 1, color: "bg-vvitu-gold" },
              { label: "Overdue Issues", value: stats?.overdue_issues ?? 0, total: stats?.issued_copies ?? 1, color: "bg-red-500" },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="font-bold text-vvitu-navy">{loading ? "..." : item.value}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                    style={{ width: loading ? "0%" : `${Math.min(100, Math.round((item.value / Math.max(1, item.total)) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

export default function AdminDashboardPage() {
  return <ProtectedRoute allowedRoles={["admin"]}><AdminDashboardContent /></ProtectedRoute>;
}
