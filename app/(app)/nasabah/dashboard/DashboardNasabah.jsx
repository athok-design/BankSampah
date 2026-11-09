"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Leaf, Recycle, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatBerat, formatRupiah } from "@/lib/format";
import { useUser } from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import Alert from "@/components/ui/Alert";
import TabelTransaksi from "../../TabelTransaksi";

export default function DashboardNasabah() {
  const supabase = createClient();
  const { profile } = useUser();
  const [nasabah, setNasabah] = useState(null);
  const [totalBerat, setTotalBerat] = useState(0);
  const [transaksi, setTransaksi] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      // RLS memastikan hanya data milik nasabah yang login yang terbaca
      const { data: n, error: e1 } = await supabase
        .from("nasabah")
        .select("id, kode_nasabah, nama, saldo, aktif")
        .eq("profile_id", profile?.id)
        .maybeSingle();
      if (e1) setError(e1.message);
      setNasabah(n);
      if (n) {
        const [b, t] = await Promise.all([
          supabase.from("setoran").select("total_berat").eq("nasabah_id", n.id),
          supabase.from("v_transaksi").select("*").eq("nasabah_id", n.id).order("tanggal", { ascending: false }).limit(5),
        ]);
        setTotalBerat((b.data ?? []).reduce((s, r) => s + Number(r.total_berat), 0));
        setTransaksi(t.data ?? []);
      }
      setMemuat(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const namaDepan = (nasabah?.nama || profile?.nama || "").split(" ")[0];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Halo, {namaDepan || "Nasabah"}! 👋</h1>
        <p className="mt-1 text-sm text-slate-600">Terima kasih sudah ikut menjaga lingkungan dengan menabung sampah.</p>
      </div>

      <Alert tipe="error" className="mb-4">{error}</Alert>
      {!memuat && !nasabah && (
        <Alert tipe="peringatan" className="mb-4">
          Data nasabah untuk akun ini belum tersedia. Hubungi petugas bank sampah.
        </Alert>
      )}
      {nasabah && !nasabah.aktif && (
        <Alert tipe="peringatan" className="mb-4">
          Akun nasabah Anda sedang nonaktif. Hubungi petugas untuk mengaktifkan kembali.
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-[1.6fr_1fr]">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white shadow-md">
          <Leaf className="absolute -right-6 -top-6 h-40 w-40 rotate-12 text-white/10" />
          <div className="relative">
            <div className="flex items-center gap-2 text-sm text-emerald-50">
              <Wallet className="h-4 w-4" /> Saldo Anda
            </div>
            {memuat ? (
              <div className="mt-3 h-10 w-48 animate-pulse rounded bg-white/20" />
            ) : (
              <p className="mt-2 text-4xl font-bold tracking-tight">{formatRupiah(nasabah?.saldo)}</p>
            )}
            <p className="mt-4 text-xs text-emerald-100">
              Kode nasabah: <span className="font-mono font-semibold text-white">{nasabah?.kode_nasabah ?? "-"}</span>
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50">
              <Recycle className="h-5 w-5 text-teal-600" />
            </span>
            Total Sampah Disetor
          </div>
          {memuat ? (
            <div className="mt-3 h-9 w-32 animate-pulse rounded bg-slate-100" />
          ) : (
            <p className="mt-3 text-3xl font-bold text-slate-900">{formatBerat(totalBerat)}</p>
          )}
          <p className="mt-1 text-xs text-slate-400">Akumulasi seluruh setoran Anda</p>
        </div>
      </div>

      <Card
        judul="Transaksi Terbaru"
        className="mt-6"
        padding={false}
        aksi={
          <Link href="/nasabah/riwayat" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
            Lihat semua →
          </Link>
        }
      >
        <TabelTransaksi data={transaksi} memuat={memuat} kolom={["tanggal", "tipe", "rincian", "nominal"]} />
      </Card>
    </div>
  );
}
