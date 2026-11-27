"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Clock, IndianRupee, BookMarked, Search, AlertTriangle } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { usersApi, circulationApi } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/lib/AuthContext";

function StudentDashboardContent() {
  const { profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [activeIssues, setActiveIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, issuesData] = await Promise.all([
          usersApi.studentDashboard(),
          circulationApi.listIssues({ status: "issued", limit: 5 }),
        ]);
        setStats(statsData);
        setActiveIssues(issuesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const isOverdue = (dueDateStr) => new Date(dueDateStr) < new Date();

  return (
    <DashboardShell
      role="student"
      title={`Welcome, ${profile?.full_name?.split(" ")[0] || "Student"}!`}
      subtitle="VVITU Central Library — Student Dashboard"
    >
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error} — Make sure the FastAPI backend is running on port 8000.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Currently Borrowed" value={loading ? "..." : stats?.currently_borrowed ?? 0} subtitle="Active issued books" icon={BookMarked} accent="navy" />
        <StatCard title="Due Soon" value={loading ? "..." : stats?.due_soon ?? 0} subtitle="Within next 3 days" icon={Clock} accent="gold" />
        <StatCard title="Pending Fine" value={loading ? "..." : `₹${stats?.pending_fine ?? 0}`} subtitle="₹5/day after due date" icon={IndianRupee} accent="red" />
        <StatCard title="Total Returned" value={loading ? "..." : stats?.total_returned ?? 0} subtitle="Completed borrowing history" icon={BookOpen} accent="emerald" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Borrowed Books</CardTitle>
              <CardDescription>Issue dates, due dates, and fine status</CardDescription>
            </div>
            <Link href="/student/borrowed"><Button variant="outline" size="sm">View All</Button></Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />
                ))}
              </div>
            ) : activeIssues.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-vvitu-cream/50 p-8 text-center">
                <p className="text-sm font-medium text-vvitu-navy">No books currently borrowed</p>
                <Link href="/student/catalog" className="mt-3 inline-block">
                  <Button variant="gold" size="sm"><Search className="h-3.5 w-3.5" />Browse Library Catalog</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activeIssues.map((issue) => {
                  const overdue = isOverdue(issue.due_date);
                  const book = issue.book_copies?.books;
                  return (
                    <div key={issue.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-vvitu-cream/40 p-3">
                      <div>
                        <p className="text-sm font-semibold text-vvitu-navy">{book?.title || "Unknown Book"}</p>
                        <p className="text-xs text-slate-500">{book?.author} · Copy: {issue.book_copies?.copy_code}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={overdue ? "danger" : "success"}>
                          {overdue ? "OVERDUE" : "Active"}
                        </Badge>
                        <p className="mt-1 text-xs text-slate-500">Due: {formatDate(issue.due_date)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Borrowing Guidelines</CardTitle>
            <CardDescription>VVITU Central Library Rules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-600">
            <div className="rounded-lg bg-vvitu-cream p-3">
              <p className="font-semibold text-vvitu-navy">14-Day Loan Period</p>
              <p className="mt-0.5">Books must be returned on or before the 14th day from issue.</p>
            </div>
            <div className="rounded-lg bg-vvitu-cream p-3">
              <p className="font-semibold text-vvitu-navy">₹5 / Day Overdue Fine</p>
              <p className="mt-0.5">Zero fine when returned on time. Accrues ₹5 per late day.</p>
            </div>
            <div className="rounded-lg bg-vvitu-cream p-3">
              <p className="font-semibold text-vvitu-navy">Max {stats?.max_books || 3} Books at a Time</p>
              <p className="mt-0.5">University borrowing limit per student.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

export default function StudentDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <StudentDashboardContent />
    </ProtectedRoute>
  );
}
