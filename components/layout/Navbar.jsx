"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Menu, UserCog } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { JUDUL } from "./menu";
import { useLogout } from "./useLogout";

function inisial(nama = "") {
  return (
    nama
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((k) => k[0]?.toUpperCase())
      .join("") || "?"
  );
}

// Topbar: judul halaman, nama pengguna, badge role, dan menu profil (Edit Profil + Logout)
export default function Navbar({ profile, email, onBukaMenu }) {
  const pathname = usePathname();
  const [buka, setBuka] = useState(false);
  const { logout, keluar } = useLogout();
  const wadah = useRef(null);

  useEffect(() => {
    const klikLuar = (e) => wadah.current && !wadah.current.contains(e.target) && setBuka(false);
    const esc = (e) => e.key === "Escape" && setBuka(false);
    document.addEventListener("mousedown", klikLuar);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", klikLuar);
      document.removeEventListener("keydown", esc);
    };
  }, []);

  useEffect(() => setBuka(false), [pathname]);

  const role = profile?.role ?? "nasabah";

  return (
    <header className="no-print sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onBukaMenu} className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Buka menu">
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold text-slate-900 sm:text-lg">{JUDUL[pathname] ?? "BankSampah"}</h1>
      </div>

      <div className="relative" ref={wadah}>
        <button
          onClick={() => setBuka((b) => !b)}
          className="flex items-center gap-2.5 rounded-full py-1 pl-3 pr-1 transition-colors hover:bg-slate-100"
          aria-haspopup="menu"
          aria-expanded={buka}
        >
          <span className="hidden text-right sm:block">
            <span className="block max-w-[180px] truncate text-sm font-medium leading-tight text-slate-800">
              {profile?.nama || email}
            </span>
          </span>
          <Badge tipe={role} className="hidden sm:inline-flex" />
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-semibold text-white">
            {inisial(profile?.nama || email)}
          </span>
          <ChevronDown className={`mr-1 h-4 w-4 text-slate-400 transition-transform ${buka ? "rotate-180" : ""}`} />
        </button>

        {buka && (
          <div role="menu" className="anim-muncul absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="truncate text-sm font-semibold text-slate-900">{profile?.nama || "-"}</p>
              <p className="truncate text-xs text-slate-500">{email}</p>
              <Badge tipe={role} className="mt-2" />
            </div>
            <div className="p-1.5">
              <Link
                href="/profil"
                role="menuitem"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <UserCog className="h-4 w-4" />
                Edit Profil
              </Link>
              <button
                role="menuitem"
                onClick={logout}
                disabled={keluar}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" />
                {keluar ? "Keluar..." : "Logout"}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
