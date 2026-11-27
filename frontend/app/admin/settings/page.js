"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/FormControls";
import { Button } from "@/components/ui/Button";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <DashboardShell
      role="admin"
      title="Library Settings"
      subtitle="Configure VVITU borrowing period and overdue fine rules"
    >
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Circulation Policy Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          {saved && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
              Settings form validated. Persistence to `library_settings` table
              will be connected in Phase 4.
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSaved(true);
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="loanDays">Borrowing Period (Days)</Label>
              <Input id="loanDays" type="number" min={1} defaultValue={14} />
            </div>
            <div>
              <Label htmlFor="finePerDay">Overdue Fine (₹ per day)</Label>
              <Input id="finePerDay" type="number" min={0} defaultValue={5} />
            </div>
            <div>
              <Label htmlFor="maxBooks">Max Active Books per Student</Label>
              <Input id="maxBooks" type="number" min={1} defaultValue={3} />
            </div>
            <Button type="submit" variant="primary">
              <Save className="h-4 w-4" />
              Save Library Settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
