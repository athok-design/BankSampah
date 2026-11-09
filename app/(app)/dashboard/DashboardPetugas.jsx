"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Plus, Recycle, Users, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatBerat, formatRupiah } from "@/lib/format";
import { useUser } from "@/components/layout/DashboardShell";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Alert from "@/components/ui/Alert";
import TabelTransaksi from "../TabelTransaksi";

export default function DashboardPetugas() {
  const supabase = createClient();
  const { profile } = useUser();
  const [stat, setStat] = useState(null);
  const [transaksi, setTransaksi] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const [s, t] = await Promise.all([
        supabase.rpc("statistik_dashboard"),
        supabase.from("v_transaksi").select("*").order("tanggal", { ascending: false }).limit(5),
      ]);
      if (s.error || t.error) setError((s.error || t.error).message);
      setStat(s.data ?? {});
      setTransaksi(t.data ?? []);
      setMemuat(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        judul="Dashboard"
        deskripsi={`Selamat datang, ${profile?.nama ?? "Petugas"}. Berikut ringkasan bank sampah hari ini.`}
        aksi={
          <Button href="/setoran/baru" size="lg">
            <Plus className="h-4 w-4" /> Setoran Baru
          </Button>
        }
      />

      <Alert tipe="error" className="mb-4">{error}</Alert>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Nasabah Aktif" nilai={stat?.total_nasabah ?? 0} ikon={Users} warna="sky" loading={memuat} />
        <StatCard label="Total Sampah Terkumpul" nilai={formatBerat(stat?.total_berat)} ikon={Recycle} warna="teal" loading={memuat} />
        <StatCard label="Total Nilai Setoran" nilai={formatRupiah(stat?.total_setoran)} ikon={ArrowDownLeft} warna="emerald" loading={memuat} />
        <StatCard label="Total Saldo Nasabah" nilai={formatRupiah(stat?.total_saldo)} ikon={Wallet} warna="amber" loading={memuat} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/setoran/baru"
          className="group flex items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 transition-colors hover:bg-emerald-50"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <ArrowDownLeft className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-emerald-900">Catat Setoran Sampah</span>
            <span className="block text-xs text-emerald-700/80">Timbang, pilih jenis, saldo otomatis bertambah</span>
          </span>
        </Link>
        <Link
          href="/penarikan/baru"
          className="group flex items-center gap-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4 transition-colors hover:bg-amber-50"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500 text-white">
            <ArrowUpRight className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-amber-900">Catat Penarikan Saldo</span>
            <span className="block text-xs text-amber-700/80">Serahkan tunai, saldo otomatis berkurang</span>
          </span>
        </Link>
      </div>

      <Card
        judul="Transaksi Terbaru"
        className="mt-6"
        padding={false}
        aksi={
          <Link href="/laporan" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
            Lihat semua →
          </Link>
        }
      >
        <TabelTransaksi data={transaksi} memuat={memuat} />
      </Card>
    </div>
  );
}
