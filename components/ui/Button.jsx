import Link from "next/link";
import { Loader2 } from "lucide-react";

const VARIAN = {
  primary: "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500 shadow-sm",
  secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-slate-400",
  danger: "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500 shadow-sm",
  outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-emerald-500",
  ghost: "text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400",
};

const UKURAN = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-sm gap-2",
};

// Tombol kustom: variant primary | secondary | danger | outline | ghost
export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  full = false,
  href,
  className = "",
  children,
  disabled,
  ...props
}) {
  const kelas = `inline-flex items-center justify-center rounded-lg font-medium transition-colors
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${VARIAN[variant]} ${UKURAN[size]} ${full ? "w-full" : ""} ${className}`;

  if (href) {
    return (
      <Link href={href} className={kelas}>
        {children}
      </Link>
    );
  }

  return (
    <button className={kelas} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
