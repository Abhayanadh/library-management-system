import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-vvitu-navy text-white hover:bg-vvitu-navy-light focus-visible:ring-vvitu-navy",
  gold: "bg-vvitu-gold text-vvitu-navy font-semibold hover:bg-vvitu-gold-light focus-visible:ring-vvitu-gold",
  outline:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-vvitu-navy",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-vvitu-navy",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
};

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-base",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
