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

export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState("all");
  const [openCreate, setOpenCreate] = useState(false);

  return (
    <DashboardShell
      role="admin"
      title="User Account Management"
      subtitle="Manage student and librarian accounts (server-enforced roles)"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input placeholder="Search users..." className="pl-9" />
          </div>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-40"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="librarian">Librarians</option>
          </Select>
        </div>

        <Button variant="gold" onClick={() => setOpenCreate(true)}>
          <UserPlus className="h-4 w-4" />
          Add Librarian Account
        </Button>
      </div>

      <TableContainer>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Email</TableHeaderCell>
            <TableHeaderCell>Role</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableRow>
        </TableHead>
        <tbody>
          <TableRow>
            <TableCell colSpan={5} className="py-10 text-center text-xs text-slate-500">
              Admin user management connects to Supabase Auth Admin APIs via
              FastAPI in Phase 4.
            </TableCell>
          </TableRow>
        </tbody>
      </TableContainer>

      <Dialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title="Create Librarian Account"
        description="Only Administrators can provision librarian privileges"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setOpenCreate(false);
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="lName">Full Name</Label>
            <Input id="lName" required placeholder="Librarian name" />
          </div>
          <div>
            <Label htmlFor="lEmail">Staff Email</Label>
            <Input
              id="lEmail"
              type="email"
              required
              placeholder="librarian@vvit.net"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpenCreate(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Librarian
            </Button>
          </div>
        </form>
      </Dialog>
    </DashboardShell>
  );
}
