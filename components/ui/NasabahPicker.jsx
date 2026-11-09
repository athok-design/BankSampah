"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, UserRound, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatRupiah } from "@/lib/format";
import { kelasInput } from "./Field";

// Dropdown + pencarian nasabah aktif. Menampilkan saldo terkini.
// refreshKey: ubah nilainya untuk memuat ulang daftar (mis. setelah transaksi tersimpan)
export default function NasabahPicker({ value, onChange, error, refreshKey = 0 }) {
  const supabase = createClient();
  const [daftar, setDaftar] = useState([]);
  const [buka, setBuka] = useState(false);
  const [cari, setCari] = useState("");
  const [memuat, setMemuat] = useState(true);
  const wadah = useRef(null);

  useEffect(() => {
    let batal = false;
    (async () => {
      setMemuat(true);
      const { data } = await supabase
        .from("nasabah")
        .select("id, kode_nasabah, nama, no_hp, saldo")
        .eq("aktif", true)
        .order("nama");
      if (!batal) {
        setDaftar(data ?? []);
        setMemuat(false);
        // perbarui saldo nasabah yang sedang dipilih
        if (value) {
          const baru = (data ?? []).find((n) => n.id === value.id);
          if (baru && Number(baru.saldo) !== Number(value.saldo)) onChange(baru);
        }
      }
    })();
    return () => {
      batal = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  useEffect(() => {
    const klikLuar = (e) => wadah.current && !wadah.current.contains(e.target) && setBuka(false);
    document.addEventListener("mousedown", klikLuar);
    return () => document.removeEventListener("mousedown", klikLuar);
  }, []);

  const hasil = useMemo(() => {
    const q = cari.trim().toLowerCase();
    if (!q) return daftar;
    return daftar.filter(
      (n) => n.nama.toLowerCase().includes(q) || (n.kode_nasabah ?? "").toLowerCase().includes(q) || (n.no_hp ?? "").includes(q)
    );
  }, [cari, daftar]);

  return (
    <div className="relative" ref={wadah}>
      <button
        type="button"
        onClick={() => setBuka((b) => !b)}
        className={`${kelasInput} flex items-center justify-between text-left ${error ? "border-rose-400" : ""}`}
      >
        {value ? (
          <span className="flex min-w-0 items-center gap-2">
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700">{value.kode_nasabah}</span>
            <span className="truncate">{value.nama}</span>
          </span>
        ) : (
          <span className="text-slate-400">{memuat ? "Memuat nasabah..." : "Pilih atau cari nasabah"}</span>
        )}
        <span className="flex items-center gap-1">
          {value && (
            <X
              className="h-4 w-4 text-slate-400 hover:text-slate-600"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
            />
          )}
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </span>
      </button>

      {buka && (
        <div className="anim-muncul absolute z-30 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="relative border-b border-slate-100 p-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari nama, kode, atau no. HP"
              className="h-9 w-full rounded-md border border-slate-200 pl-8 pr-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">
            {hasil.length === 0 && <li className="px-3 py-4 text-center text-sm text-slate-400">Nasabah tidak ditemukan</li>}
            {hasil.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(n);
                    setBuka(false);
                    setCari("");
                  }}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-emerald-50 ${
                    value?.id === n.id ? "bg-emerald-50" : ""
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <UserRound className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="truncate">
                      <span className="font-medium text-slate-800">{n.nama}</span>{" "}
                      <span className="text-xs text-slate-400">{n.kode_nasabah}</span>
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-medium text-emerald-700">{formatRupiah(n.saldo)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
