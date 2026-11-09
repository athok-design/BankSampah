"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowDownLeft, ArrowUpRight, Printer, Scale } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ambilNota } from "@/lib/ambilNota";
import { cetakNota } from "@/lib/cetakNota";
import { akhirHari, awalBulanIni, awalHari, formatBerat, formatRupiah, formatTanggal, hariIni, pesanError } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import FilterTransaksi from "../FilterTransaksi";
import TabelTransaksi from "../TabelTransaksi";

export default function Laporan() {
  const supabase = createClient();
  const [filter, setFilter] = useState({ dari: awalBulanIni(), sampai: hariIni(), tipe: "semua", cari: "" });
  const [dipakai, setDipakai] = useState(filter);
  const [data, setData] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState("");
  const [sedangCetak, setSedangCetak] = useState(null);

  // Cetak ulang nota satu transaksi sebagai bukti fisik
  async function cetak(t) {
    setSedangCetak(`${t.tipe}-${t.id}`);
    setError("");
    try {
      const nota = await ambilNota(supabase, t.tipe, t.id);
      cetakNota(nota, nota.petugas, true);
    } catch (e) {
      setError("Gagal menyiapkan nota: " + pesanError(e));
    }
    setSedangCetak(null);
  }

  async function tampilkan() {
    if (filter.dari > filter.sampai) {
      setError("Tanggal awal tidak boleh setelah tanggal akhir.");
      return;
    }
    setError("");
    setMemuat(true);
    let q = supabase
      .from("v_transaksi")
      .select("*")
      .gte("tanggal", awalHari(filter.dari))
      .lte("tanggal", akhirHari(filter.sampai))
      .order("tanggal", { ascending: false })
      .limit(2000);
    if (filter.tipe !== "semua") q = q.eq("tipe", filter.tipe);
    const cari = filter.cari.trim().replace(/[,()]/g, "");
    if (cari) q = q.or(`nama_nasabah.ilike.%${cari}%,kode_nasabah.ilike.%${cari}%`);
    const { data: hasil, error: err } = await q;
    if (err) setError(pesanError(err));
    setData(hasil ?? []);
    setDipakai(filter);
    setMemuat(false);
  }

  useEffect(() => {
    tampilkan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setoran = data.filter((t) => t.tipe === "setoran");
  const penarikan = data.filter((t) => t.tipe === "penarikan");
  const totalBerat = setoran.reduce((s, t) => s + Number(t.total_berat), 0);
  const totalSetoran = setoran.reduce((s, t) => s + Number(t.nominal), 0);
  const totalPenarikan = penarikan.reduce((s, t) => s + Number(t.nominal), 0);
  const labelTipe = { semua: "Semua transaksi", setoran: "Setoran", penarikan: "Penarikan" }[dipakai.tipe];

  return (
    <div className="mx-auto max-w-7xl">
      <div className="no-print">
        <PageHeader judul="Laporan Transaksi" deskripsi="Rekap setoran dan penarikan berdasarkan rentang tanggal." />
      </div>

      {/* Kop laporan khusus saat dicetak */}
      <div className="only-print mb-6 border-b-2 border-emerald-700 pb-4">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="" width={44} height={48} />
          <div>
            <p className="text-xl font-bold text-emerald-800">BankSampah</p>
            <p className="text-xs text-slate-600">Menabung Menjaga Lingkungan</p>
          </div>
        </div>
        <h1 className="mt-4 text-lg font-bold">Laporan Transaksi</h1>
        <p className="text-sm text-slate-600">
          Periode {formatTanggal(awalHari(dipakai.dari))} – {formatTanggal(akhirHari(dipakai.sampai))} · {labelTipe}
          {dipakai.cari && ` · Nasabah: "${dipakai.cari}"`}
        </p>
      </div>

      <FilterTransaksi
        filter={filter}
        setFilter={setFilter}
        onTampilkan={tampilkan}
        memuat={memuat}
        denganCari
        aksiTambahan={
          <Button type="button" variant="outline" onClick={() => window.print()} disabled={memuat}>
            <Printer className="h-4 w-4" /> Cetak Laporan / PDF
          </Button>
        }
      />

      <Alert tipe="error" className="mt-4">{error}</Alert>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Sampah" nilai={formatBerat(totalBerat)} ikon={Scale} warna="teal" loading={memuat} keterangan={`${setoran.length} setoran`} />
        <StatCard label="Total Setoran" nilai={formatRupiah(totalSetoran)} ikon={ArrowDownLeft} warna="emerald" loading={memuat} />
        <StatCard label="Total Penarikan" nilai={formatRupiah(totalPenarikan)} ikon={ArrowUpRight} warna="amber" loading={memuat} keterangan={`${penarikan.length} penarikan`} />
      </div>

      <Card
        judul={`Daftar Transaksi (${data.length})`}
        className="mt-6"
        padding={false}
        aksi={<span className="no-print text-xs text-slate-400">Klik “Cetak” untuk mencetak nota tiap transaksi</span>}
      >
        <TabelTransaksi
          data={data}
          memuat={memuat}
          kolom={["tanggal", "kode", "nasabah", "tipe", "rincian", "nominal"]}
          teksKosong="Tidak ada transaksi pada rentang tanggal ini."
          onCetak={cetak}
          sedangCetak={sedangCetak}
        />
      </Card>

      <p className="only-print mt-6 text-right text-xs text-slate-500">
        Dicetak pada {formatTanggal(new Date().toISOString(), true)}
      </p>
    </div>
  );
}
