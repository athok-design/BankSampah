"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

// Notifikasi kecil di pojok kanan bawah. pesan = { tipe: "sukses" | "error", teks }
export default function Toast({ pesan, onTutup }) {
  useEffect(() => {
    if (!pesan) return;
    const t = setTimeout(onTutup, 3500);
    return () => clearTimeout(t);
  }, [pesan, onTutup]);

  if (!pesan) return null;
  const sukses = pesan.tipe !== "error";
  return (
    <div className="no-print fixed bottom-5 right-5 z-[60] anim-muncul">
      <div
        className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
          sukses ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
        }`}
      >
        {sukses ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
        {pesan.teks}
        <button onClick={onTutup} className="ml-2 opacity-80 hover:opacity-100" aria-label="Tutup">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
