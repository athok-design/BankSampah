"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, X } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { MENU } from "./menu";
import { useLogout } from "./useLogout";

// Sidebar kiri hijau tua (mengikuti gambar referensi), menu sesuai role
export default function Sidebar({ role, terbuka, onTutup }) {
  const pathname = usePathname();
  const { logout, keluar } = useLogout();
  const menu = MENU[role] ?? [];

  const aktif = (href) => pathname === href || (href !== "/nasabah" && pathname.startsWith(href + "/"));

  return (
    <>
      {/* latar gelap saat sidebar dibuka di HP */}
      <div
        className={`no-print fixed inset-0 z-30 bg-slate-900/40 lg:hidden ${terbuka ? "block" : "hidden"}`}
        onClick={onTutup}
      />
      <aside
        className={`no-print fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-hutan-800 text-emerald-50 transition-transform duration-200
          lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${terbuka ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link href={menu[0]?.href ?? "/"} onClick={onTutup}>
            <Logo variant="gelap" />
          </Link>
          <button onClick={onTutup} className="rounded p-1 text-emerald-100 hover:bg-white/10 lg:hidden" aria-label="Tutup menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto py-4 pl-3">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-emerald-300/70">Menu</p>
          {menu.map(({ href, label, ikon: Ikon }) => {
            const on = aktif(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onTutup}
                className={`flex items-center gap-3 rounded-l-lg px-3 py-2.5 text-sm transition-colors ${
                  on
                    ? "border-r-4 border-emerald-300 bg-hutan-700 font-semibold text-white"
                    : "text-emerald-100/85 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Ikon className={`h-[18px] w-[18px] ${on ? "text-emerald-300" : ""}`} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            onClick={logout}
            disabled={keluar}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-emerald-100/85 transition-colors hover:bg-rose-500/15 hover:text-rose-200 disabled:opacity-60"
          >
            <LogOut className="h-[18px] w-[18px]" />
            {keluar ? "Keluar..." : "Logout"}
          </button>
        </div>
      </aside>
    </>
  );
}
