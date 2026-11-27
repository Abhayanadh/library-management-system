"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Input, Select } from "@/components/ui/FormControls";
import { Button } from "@/components/ui/Button";
import {
  TableContainer,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "@/components/ui/Table";

export default function AdminTransactionsPage() {
  const [status, setStatus] = useState("all");

  return (
    <DashboardShell
      role="admin"
      title="All Transactions & Reports"
      subtitle="Complete audit trail of book issues, returns, and fines"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Input placeholder="Filter by student or copy ID..." className="w-64" />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-40"
          >
            <option value="all">All Statuses</option>
            <option value="issued">Issued</option>
            <option value="returned">Returned</option>
            <option value="overdue">Overdue</option>
          </Select>
        </div>

        <Button variant="outline" size="sm" disabled>
          <Download className="h-4 w-4" />
          Export CSV (Phase 6)
        </Button>
      </div>

      <TableContainer>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Transaction ID</TableHeaderCell>
            <TableHeaderCell>Student</TableHeaderCell>
            <TableHeaderCell>Book / Copy</TableHeaderCell>
            <TableHeaderCell>Issue Date</TableHeaderCell>
            <TableHeaderCell>Due / Return Date</TableHeaderCell>
            <TableHeaderCell>Fine (₹)</TableHeaderCell>
          </TableRow>
        </TableHead>
        <tbody>
          <TableRow>
            <TableCell colSpan={6} className="py-10 text-center text-xs text-slate-500">
              Full transaction history and fine audit logs connect in Phase 6.
            </TableCell>
          </TableRow>
        </tbody>
      </TableContainer>
    </DashboardShell>
  );
}
