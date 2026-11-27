import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

/**
 * Reusable KPI summary card for dashboards.
 */
export function StatCard({ title, value, subtitle, icon: Icon, accent = "navy" }) {
  const accentStyles = {
    navy: "bg-vvitu-navy text-vvitu-gold-light",
    gold: "bg-vvitu-gold/20 text-vvitu-gold-dark",
    emerald: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <p className="mt-2 text-2xl font-extrabold text-vvitu-navy">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              accentStyles[accent] || accentStyles.navy
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
