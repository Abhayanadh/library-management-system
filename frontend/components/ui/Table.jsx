import { cn } from "@/lib/utils";

export function TableContainer({ children, className }) {
  return (
    <div
      className={cn(
        "w-full overflow-x-auto rounded-xl border border-slate-200 bg-white",
        className
      )}
    >
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }) {
  return (
    <thead className="border-b border-slate-200 bg-vvitu-cream text-xs font-semibold uppercase tracking-wider text-slate-600">
      {children}
    </thead>
  );
}

export function TableRow({ children, className }) {
  return (
    <tr
      className={cn(
        "border-b border-slate-100 transition last:border-none hover:bg-slate-50/70",
        className
      )}
    >
      {children}
    </tr>
  );
}

export function TableHeaderCell({ children, className }) {
  return <th className={cn("px-4 py-3", className)}>{children}</th>;
}

export function TableCell({ children, className }) {
  return (
    <td className={cn("px-4 py-3 text-slate-700", className)}>{children}</td>
  );
}
