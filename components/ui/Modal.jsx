"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

// Pop-up dialog: konfirmasi nonaktif, struk transaksi, dll.
export default function Modal({ buka, onTutup, judul, children, footer, lebar = "max-w-md" }) {
  useEffect(() => {
    if (!buka) return;
    const esc = (e) => e.key === "Escape" && onTutup?.();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [buka, onTutup]);

  if (!buka) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]" onClick={onTutup} />
      <div role="dialog" aria-modal="true" className={`anim-muncul relative w-full ${lebar} rounded-xl bg-white shadow-xl`}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{judul}</h2>
          <button onClick={onTutup} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Tutup">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}
