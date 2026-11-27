import { cn } from "@/lib/utils";

const badgeVariants = {
  navy: "bg-vvitu-navy/10 text-vvitu-navy border-vvitu-navy/20",
  gold: "bg-vvitu-gold/15 text-vvitu-gold-dark border-vvitu-gold/30",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  neutral: "bg-slate-100 text-slate-700 border-slate-200",
};

export function Badge({ children, variant = "neutral", className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        badgeVariants[variant] || badgeVariants.neutral,
        className
      )}
    >
      {children}
    </span>
  );
}
