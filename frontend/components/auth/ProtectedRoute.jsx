"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

/**
 * Higher-order guard component that restricts access to allowed roles.
 */
export function ProtectedRoute({ allowedRoles = [], children }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (profile && allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
        // Redirect unauthorized user to their designated dashboard
        if (profile.role === "student") router.push("/student");
        else if (profile.role === "librarian") router.push("/librarian");
        else if (profile.role === "admin") router.push("/admin");
      }
    }
  }, [user, profile, loading, allowedRoles, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-vvitu-cream">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-vvitu-navy border-t-vvitu-gold" />
          <p className="text-xs font-semibold text-vvitu-navy">Verifying VVITU Library Session...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (profile && allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
    return null;
  }

  return children;
}
