"use client";

import { useState, useEffect } from "react";
import { ArrowLeftRight, RotateCcw, AlertTriangle } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/FormControls";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TableContainer, TableHead, TableRow, TableHeaderCell, TableCell } from "@/components/ui/Table";
import { circulationApi, usersApi } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function CirculationContent() {
  const [filter, setFilter] = useState("issued");
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issueForm, setIssueForm] = useState({ student_id: "", copy_id: "", remarks: "" });
  const [returnForm, setReturnForm] = useState({ copy_id: "", remarks: "" });
  const [issueResult, setIssueResult] = useState(null);
  const [returnResult, setReturnResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const data = await circulationApi.listIssues({ status: filter, limit: 50 });
      setIssues(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchIssues(); }, [filter]);

  const handleIssue = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setIssueResult(null);
    try {
      const res = await circulationApi.issue(issueForm);
      setIssueResult(res);
      setIssueForm({ student_id: "", copy_id: "", remarks: "" });
      fetchIssues();
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setReturnResult(null);
    try {
      const res = await circulationApi.returnBook(returnForm);
      setReturnResult(res);
      setReturnForm({ copy_id: "", remarks: "" });
      fetchIssues();
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const isOverdue = (d) => new Date(d) < new Date();

  return (
    <DashboardShell role="librarian" title="Issue & Return Books" subtitle="14-day loan period • ₹5/day overdue fine (₹0 on time)">
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />{error}
          <button className="ml-auto underline" onClick={() => setError("")}>Dismiss</button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Issue Panel */}
        <Card>
          <CardHeader><CardTitle>Issue Book to Student</CardTitle></CardHeader>
          <CardContent>
            {issueResult && (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                ✅ {issueResult.message}
              </div>
            )}
            <form onSubmit={handleIssue} className="space-y-4">
              <div>
                <Label htmlFor="studentId">Student User ID (UUID from profiles)</Label>
                <Input id="studentId" required placeholder="UUID of student from profiles table" value={issueForm.student_id} onChange={(e) => setIssueForm({ ...issueForm, student_id: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="copyId">Physical Book Copy ID (UUID)</Label>
                <Input id="copyId" required placeholder="UUID of book_copies row" value={issueForm.copy_id} onChange={(e) => setIssueForm({ ...issueForm, copy_id: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="iRemarks">Remarks (optional)</Label>
                <Input id="iRemarks" value={issueForm.remarks} onChange={(e) => setIssueForm({ ...issueForm, remarks: e.target.value })} />
              </div>
              <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
                <ArrowLeftRight className="h-4 w-4" />{submitting ? "Processing..." : "Issue Book (14 Days)"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Return Panel */}
        <Card>
          <CardHeader><CardTitle>Accept Book Return</CardTitle></CardHeader>
          <CardContent>
            {returnResult && (
              <div className={`mb-4 rounded-lg border p-3 text-xs ${returnResult.overdue_days > 0 ? "border-amber-200 bg-amber-50 text-amber-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
                ✅ {returnResult.message}<br />
                <strong>{returnResult.fine_note}</strong>
              </div>
            )}
            <form onSubmit={handleReturn} className="space-y-4">
              <div>
                <Label htmlFor="returnCopy">Physical Book Copy ID (UUID)</Label>
                <Input id="returnCopy" required placeholder="UUID of book_copies row" value={returnForm.copy_id} onChange={(e) => setReturnForm({ ...returnForm, copy_id: e.target.value })} />
              </div>
              <div className="rounded-lg bg-vvitu-cream p-3 text-xs text-slate-600">
                Fine is calculated automatically: ₹0 on/before due date, ₹5 per day overdue after the 14-day period.
              </div>
              <div>
                <Label htmlFor="rRemarks">Remarks (optional)</Label>
                <Input id="rRemarks" value={returnForm.remarks} onChange={(e) => setReturnForm({ ...returnForm, remarks: e.target.value })} />
              </div>
              <Button type="submit" variant="gold" className="w-full" disabled={submitting}>
                <RotateCcw className="h-4 w-4" />{submitting ? "Processing..." : "Process Return & Calculate Fine"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Issues Table */}
      <div className="mt-6">
        <div className="mb-3 flex flex-wrap gap-2">
          {["issued", "overdue", "returned", "all"].map((tab) => (
            <Button key={tab} size="sm" variant={filter === tab ? "primary" : "outline"} onClick={() => setFilter(tab)} className="capitalize">{tab}</Button>
          ))}
        </div>
        <TableContainer>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Copy ID</TableHeaderCell>
              <TableHeaderCell>Book Title</TableHeaderCell>
              <TableHeaderCell>Student</TableHeaderCell>
              <TableHeaderCell>Issue Date</TableHeaderCell>
              <TableHeaderCell>Due Date</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHead>
          <tbody>
            {loading ? (
              [...Array(4)].map((_, i) => (
                <TableRow key={i}>{[...Array(6)].map((_, j) => <TableCell key={j}><div className="h-4 animate-pulse rounded bg-slate-100" /></TableCell>)}</TableRow>
              ))
            ) : issues.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="py-10 text-center text-xs text-slate-500">No records for filter: {filter}</TableCell></TableRow>
            ) : issues.map((issue) => {
              const overdue = isOverdue(issue.due_date) && issue.status !== "returned";
              const book = issue.book_copies?.books;
              const student = issue.profiles;
              return (
                <TableRow key={issue.id}>
                  <TableCell className="font-mono text-xs">{issue.book_copies?.copy_code}</TableCell>
                  <TableCell><p className="font-semibold text-vvitu-navy text-xs">{book?.title}</p></TableCell>
                  <TableCell><p className="text-xs">{student?.full_name}</p><p className="text-xs text-slate-400">{student?.roll_number}</p></TableCell>
                  <TableCell className="text-xs">{formatDate(issue.issue_date)}</TableCell>
                  <TableCell className="text-xs">{formatDate(issue.due_date)}</TableCell>
                  <TableCell><Badge variant={issue.status === "returned" ? "success" : overdue ? "danger" : "gold"}>{issue.status}</Badge></TableCell>
                </TableRow>
              );
            })}
          </tbody>
        </TableContainer>
      </div>
    </DashboardShell>
  );
}

export default function LibrarianCirculationPage() {
  return <ProtectedRoute allowedRoles={["librarian", "admin"]}><CirculationContent /></ProtectedRoute>;
}
