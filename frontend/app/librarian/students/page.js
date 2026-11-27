"use client";

import { useState } from "react";
import { UserPlus, Search } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Input, Label, Select } from "@/components/ui/FormControls";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import {
  TableContainer,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "@/components/ui/Table";

export default function LibrarianStudentsPage() {
  const [query, setQuery] = useState("");
  const [openRegister, setOpenRegister] = useState(false);

  return (
    <DashboardShell
      role="librarian"
      title="Registered Students"
      subtitle="Register new students and inspect borrowing details"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search student by name or roll number..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="gold" onClick={() => setOpenRegister(true)}>
          <UserPlus className="h-4 w-4" />
          Register Student
        </Button>
      </div>

      <TableContainer>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Roll Number</TableHeaderCell>
            <TableHeaderCell>Full Name</TableHeaderCell>
            <TableHeaderCell>Department</TableHeaderCell>
            <TableHeaderCell>Active Issues</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
          </TableRow>
        </TableHead>
        <tbody>
          <TableRow>
            <TableCell colSpan={5} className="py-10 text-center text-xs text-slate-500">
              Student directory connects to Supabase `profiles` via FastAPI in
              Phase 4.
            </TableCell>
          </TableRow>
        </tbody>
      </TableContainer>

      <Dialog
        open={openRegister}
        onClose={() => setOpenRegister(false)}
        title="Register New Student"
        description="Create a student library profile"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setOpenRegister(false);
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="sName">Full Name</Label>
            <Input id="sName" required placeholder="Student full name" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="sRoll">Roll Number</Label>
              <Input id="sRoll" required placeholder="22BQ1A0501" />
            </div>
            <div>
              <Label htmlFor="sDept">Department</Label>
              <Select id="sDept" defaultValue="CSE">
                <option>CSE</option>
                <option>CSM (AI &amp; ML)</option>
                <option>ECE</option>
                <option>IT</option>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="sEmail">Email</Label>
            <Input id="sEmail" type="email" required placeholder="student@vvit.net" />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpenRegister(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Register Student
            </Button>
          </div>
        </form>
      </Dialog>
    </DashboardShell>
  );
}
