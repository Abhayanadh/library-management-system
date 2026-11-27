"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Library, ArrowLeft, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input, Label, Select } from "@/components/ui/FormControls";
import { useAuth } from "@/lib/AuthContext";

const departments = [
  "CSE",
  "CSM (AI & ML)",
  "CSD (Data Science)",
  "ECE",
  "EEE",
  "IT",
  "MECH",
  "CIVIL",
];

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    rollNumber: "",
    department: "CSE",
    phone: "",
    email: "",
    password: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setSubmitting(true);

    try {
      await signUp({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        rollNumber: form.rollNumber,
        department: form.department,
        phone: form.phone,
      });

      setSuccessMsg(
        "Account created successfully! If email confirmation is required, check your inbox; otherwise, you can now sign in."
      );
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to register account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-vvitu-navy px-4 py-10">
      <div className="w-full max-w-lg">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-vvitu-gold-light hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to VVITU Library Home
        </Link>

        <Card className="border-none shadow-2xl">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-vvitu-gold text-vvitu-navy">
                <Library className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-vvitu-navy">
                  Student Registration
                </h1>
                <p className="text-xs text-slate-500">
                  Vasireddy Venkatadri International Technological University
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    required
                    placeholder="e.g. Ananya Sharma"
                    value={form.fullName}
                    onChange={(e) =>
                      setForm({ ...form, fullName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="rollNumber">Roll Number</Label>
                  <Input
                    id="rollNumber"
                    required
                    placeholder="e.g. 22BQ1A0501"
                    value={form.rollNumber}
                    onChange={(e) =>
                      setForm({ ...form, rollNumber: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select
                    id="department"
                    value={form.department}
                    onChange={(e) =>
                      setForm({ ...form, department: e.target.value })
                    }
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">College Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="22bq1a0501@vvit.net"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>

              <Button
                type="submit"
                variant="gold"
                className="w-full"
                disabled={submitting}
              >
                <UserPlus className="h-4 w-4" />
                {submitting ? "Registering..." : "Register Student Account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-600">
              Already registered?{" "}
              <Link
                href="/login"
                className="font-semibold text-vvitu-navy hover:text-vvitu-gold-dark"
              >
                Sign in here
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
