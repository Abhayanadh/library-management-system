"use client";

import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TableContainer, TableHead, TableRow, TableHeaderCell, TableCell } from "@/components/ui/Table";
import { circulationApi } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function BorrowedContent() {
  const [tab, setTab] = useState("current");
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    const statusParam = tab === "current" ? "issued" : "returned";
    circulationApi.listIssues({ status: statusParam, limit: 100 })
      .then(setIssues)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [tab]);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const isOverdue = (d) => new Date(d) < new Date();

  return (
    <DashboardShell role="student" title="Borrowed Books & History" subtitle="Track issue dates, due dates, and overdue fines">
      <div className="mb-4 flex gap-2">
        <Button variant={tab === "current" ? "primary" : "outline"} size="sm" onClick={() => setTab("current")}>Currently Borrowed</Button>
        <Button variant={tab === "history" ? "primary" : "outline"} size="sm" onClick={() => setTab("history")}>Borrowing History</Button>
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</div>}

      <TableContainer>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Copy ID</TableHeaderCell>
            <TableHeaderCell>Book Title</TableHeaderCell>
            <TableHeaderCell>Issue Date</TableHeaderCell>
            <TableHeaderCell>Due Date</TableHeaderCell>
            <TableHeaderCell>{tab === "current" ? "Status" : "Return Date"}</TableHeaderCell>
            <TableHeaderCell>Fine (₹)</TableHeaderCell>
          </TableRow>
        </TableHead>
        <tbody>
          {loading ? (
            [...Array(4)].map((_, i) => (
              <TableRow key={i}>
                {[...Array(6)].map((_, j) => <TableCell key={j}><div className="h-4 animate-pulse rounded bg-slate-100" /></TableCell>)}
              </TableRow>
            ))
          ) : issues.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-xs text-slate-500">
                {tab === "current" ? "You have no books currently borrowed." : "No borrowing history found."}
              </TableCell>
            </TableRow>
          ) : (
            issues.map((issue) => {
              const book = issue.book_copies?.books;
              const overdue = tab === "current" && isOverdue(issue.due_date);
              return (
                <TableRow key={issue.id}>
                  <TableCell className="font-mono text-xs">{issue.book_copies?.copy_code}</TableCell>
                  <TableCell>
                    <p className="font-semibold text-vvitu-navy">{book?.title}</p>
                    <p className="text-xs text-slate-500">{book?.author}</p>
                  </TableCell>
                  <TableCell>{formatDate(issue.issue_date)}</TableCell>
                  <TableCell>{formatDate(issue.due_date)}</TableCell>
                  <TableCell>
                    {tab === "current" ? (
                      <Badge variant={overdue ? "danger" : "success"}>{overdue ? "Overdue" : "Active"}</Badge>
                    ) : (
                      formatDate(issue.updated_at)
                    )}
                  </TableCell>
                  <TableCell>
                    {overdue ? (
                      <span className="font-semibold text-red-600">
                        ₹{Math.max(0, Math.floor((new Date() - new Date(issue.due_date)) / 86400000)) * 5}
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-semibold">₹0</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </tbody>
      </TableContainer>
    </DashboardShell>
  );
}

export default function StudentBorrowedPage() {
  return <ProtectedRoute allowedRoles={["student"]}><BorrowedContent /></ProtectedRoute>;
}
