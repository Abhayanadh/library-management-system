import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  ArrowLeftRight,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatCard } from "@/components/ui/StatCard";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function LibrarianDashboardPage() {
  return (
    <DashboardShell
      role="librarian"
      title="Librarian Dashboard"
      subtitle="Manage VVITU book inventory, circulation, and student records"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Books"
          value="0"
          subtitle="Catalog titles & copies"
          icon={BookOpen}
          accent="navy"
        />
        <StatCard
          title="Available Copies"
          value="0"
          subtitle="Ready for issue"
          icon={CheckCircle2}
          accent="emerald"
        />
        <StatCard
          title="Currently Issued"
          value="0"
          subtitle="Active student loans"
          icon={ArrowLeftRight}
          accent="gold"
        />
        <StatCard
          title="Overdue Books"
          value="0"
          subtitle="Past 14-day due date"
          icon={AlertTriangle}
          accent="red"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Desk Actions</CardTitle>
            <CardDescription>Common librarian workflows</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link href="/librarian/circulation">
              <Button variant="primary" size="sm">
                <ArrowLeftRight className="h-4 w-4" />
                Issue / Return Book
              </Button>
            </Link>
            <Link href="/librarian/books">
              <Button variant="gold" size="sm">
                <Plus className="h-4 w-4" />
                Add New Book
              </Button>
            </Link>
            <Link href="/librarian/students">
              <Button variant="outline" size="sm">
                Register Student
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overdue Alerts</CardTitle>
            <CardDescription>
              Books exceeding the 14-day borrowing window
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="rounded-lg border border-dashed border-slate-300 bg-vvitu-cream/50 p-6 text-center text-xs text-slate-500">
              Live overdue records and ₹5/day fine totals will populate here
              once connected to FastAPI in Phase 5–6.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
