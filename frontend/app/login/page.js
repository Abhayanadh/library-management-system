"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Library,
  GraduationCap,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowLeft,
  LogIn,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/FormControls";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("student"); // "student" | "staff"
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    try {
      const res = await signIn(email, password);
      if (res?.user) {
        // Fetch role to route to appropriate dedicated dashboard
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", res.user.id)
          .single();

        const role = profile?.role || "student";

        if (activeTab === "staff" && role === "student") {
          setErrorMsg(
            "Access restricted: This account has Student privileges. Please use the Student Portal tab or contact the Chief Librarian."
          );
          setSubmitting(false);
          return;
        }

        if (role === "admin") {
          router.push("/admin");
        } else if (role === "librarian") {
          router.push("/librarian");
        } else {
          router.push("/student");
        }
      }
    } catch (err) {
      setErrorMsg(
        err.message || "Failed to sign in. Please verify your credentials."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-vvitu-navy via-vvitu-navy-light to-vvitu-navy-dark px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-vvitu-gold-light hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to VVITU Library Home
        </Link>

        {/* Role Portal Switcher Tabs */}
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-white/10 p-1.5 backdrop-blur-md">
          <button
            type="button"
            onClick={() => {
              setActiveTab("student");
              setErrorMsg("");
            }}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition ${
              activeTab === "student"
                ? "bg-vvitu-gold text-vvitu-navy shadow-md"
                : "text-white/80 hover:text-white hover:bg-white/5"
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            Student Login
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("staff");
              setErrorMsg("");
            }}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition ${
              activeTab === "staff"
                ? "bg-vvitu-gold text-vvitu-navy shadow-md"
                : "text-white/80 hover:text-white hover:bg-white/5"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Librarian &amp; Admin
          </button>
        </div>

        <Card className="border-none shadow-2xl">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  activeTab === "staff"
                    ? "bg-vvitu-gold text-vvitu-navy"
                    : "bg-vvitu-navy text-vvitu-gold-light"
                }`}
              >
                {activeTab === "staff" ? (
                  <ShieldCheck className="h-6 w-6" />
                ) : (
                  <GraduationCap className="h-6 w-6" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-vvitu-navy">
                  {activeTab === "staff"
                    ? "Staff & Admin Portal"
                    : "Student Library Portal"}
                </h1>
                <p className="text-xs text-slate-500">
                  {activeTab === "staff"
                    ? "Manage books, modify prices, and circulation"
                    : "Search catalog, check availability & borrowed books"}
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="email">
                  {activeTab === "staff"
                    ? "Staff / Admin Email"
                    : "Student College Email"}
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder={
                    activeTab === "staff"
                      ? "librarian@vvit.net or admin@vvit.net"
                      : "22bq1a0501@vvit.net"
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="mb-1.5 text-xs font-medium text-vvitu-gold-dark hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label="Toggle password visibility"
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant={activeTab === "staff" ? "primary" : "gold"}
                className="w-full font-bold shadow-md"
                disabled={submitting}
              >
                <LogIn className="h-4 w-4" />
                {submitting
                  ? "Authenticating..."
                  : activeTab === "staff"
                  ? "Sign In to Admin/Staff Console"
                  : "Sign In as Student"}
              </Button>
            </form>

            {activeTab === "student" ? (
              <p className="mt-6 text-center text-xs text-slate-600">
                New VVITU student?{" "}
                <Link
                  href="/register"
                  className="font-bold text-vvitu-navy hover:text-vvitu-gold-dark"
                >
                  Create student account
                </Link>
              </p>
            ) : (
              <p className="mt-6 text-center text-xs text-slate-500">
                Staff accounts are provisioned exclusively by University IT.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
