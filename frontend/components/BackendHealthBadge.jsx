"use client";

import { useEffect, useState } from "react";
import { Activity, CheckCircle2, AlertCircle } from "lucide-react";

/**
 * Displays live connectivity status with the Python FastAPI health-check endpoint.
 */
export default function BackendHealthBadge() {
  const [state, setState] = useState({ status: "checking", detail: "" });

  useEffect(() => {
    const apiBase =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://library-management-system-d39s.onrender.com";

    let active = true;
    fetch(`${apiBase}/api/v1/health`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (active && data?.status === "ok") {
          setState({
            status: "online",
            detail: `${data.service} v${data.version}`,
          });
        }
      })
      .catch(() => {
        if (active) {
          setState({
            status: "offline",
            detail: "Start FastAPI server on port 8000",
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (state.status === "checking") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/90">
        <Activity className="h-3.5 w-3.5 animate-pulse text-vvitu-gold-light" />
        Checking Python API...
      </span>
    );
  }

  if (state.status === "online") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3.5 py-1.5 text-xs font-medium text-emerald-200">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
        API Online ({state.detail})
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/15 px-3.5 py-1.5 text-xs font-medium text-amber-200">
      <AlertCircle className="h-3.5 w-3.5 text-amber-300" />
      API Offline — {state.detail}
    </span>
  );
}
