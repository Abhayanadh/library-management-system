"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input, Label, Select } from "@/components/ui/FormControls";
import { Button } from "@/components/ui/Button";

export default function StudentProfilePage() {
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
  };

  return (
    <DashboardShell
      role="student"
      title="My Profile"
      subtitle="Manage your VVITU student contact details"
    >
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
        </CardHeader>
        <CardContent>
          {saved && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
              Profile form validated. Updates will persist to Supabase in Phase
              4.
            </div>
          )}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="pName">Full Name</Label>
                <Input id="pName" placeholder="Student Name" />
              </div>
              <div>
                <Label htmlFor="pRoll">Roll Number</Label>
                <Input id="pRoll" placeholder="22BQ1A0501" disabled />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="pDept">Department</Label>
                <Select id="pDept" defaultValue="CSE">
                  <option value="CSE">CSE</option>
                  <option value="CSM">CSM (AI &amp; ML)</option>
                  <option value="ECE">ECE</option>
                  <option value="IT">IT</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="pPhone">Phone Number</Label>
                <Input id="pPhone" type="tel" placeholder="10-digit mobile" />
              </div>
            </div>
            <Button type="submit" variant="primary">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
