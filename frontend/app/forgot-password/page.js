"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/FormControls";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-vvitu-navy px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-vvitu-gold-light hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Login
        </Link>

        <Card className="border-none shadow-2xl">
          <CardContent className="p-6 sm:p-8">
            <h1 className="text-xl font-bold text-vvitu-navy">
              Reset Your Password
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Enter your registered VVITU email to receive a Supabase password
              reset link.
            </p>

            {sent && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                <MailCheck className="h-4 w-4 shrink-0" />
                Password reset flow ready (connected to Supabase Auth in Phase
                3).
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="resetEmail">Registered Email</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  required
                  placeholder="rollnumber@vvit.net"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" variant="primary" className="w-full">
                Send Reset Link
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
