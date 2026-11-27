import { cn } from "@/lib/utils";

export function Label({ children, htmlFor, className }) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600",
        className
      )}
    >
      {children}
    </label>
  );
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-vvitu-navy focus:outline-none focus:ring-2 focus:ring-vvitu-navy/20 disabled:bg-slate-50",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-vvitu-navy focus:outline-none focus:ring-2 focus:ring-vvitu-navy/20 disabled:bg-slate-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-vvitu-navy focus:outline-none focus:ring-2 focus:ring-vvitu-navy/20",
        className
      )}
      {...props}
    />
  );
}
