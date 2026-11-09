import { AlertCircle, CheckCircle2, Info } from "lucide-react";

// Kotak pesan: error (merah), sukses (hijau), info (hijau lembut)
export default function Alert({ tipe = "error", children, className = "" }) {
  const gaya = {
    error: "border-rose-200 bg-rose-50 text-rose-800",
    sukses: "border-emerald-200 bg-emerald-50 text-emerald-800",
    info: "border-sky-200 bg-sky-50 text-sky-800",
    peringatan: "border-amber-200 bg-amber-50 text-amber-800",
  }[tipe];
  const Ikon = tipe === "error" ? AlertCircle : tipe === "sukses" ? CheckCircle2 : Info;

  if (!children) return null;
  return (
    <div className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm ${gaya} ${className}`}>
      <Ikon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
