"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { akhirHari, awalHari, hariIni, pesanError } from "@/lib/format";
import { useUser } from "@/components/layout/DashboardShell";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Alert from "@/components/ui/Alert";
import FilterTransaksi from "../../FilterTransaksi";
import TabelTransaksi from "../../TabelTransaksi";

// default: 3 bulan terakhir
function tigaBulanLalu() {
  const d = new Date();
  d.setMonth(d.getMonth() - 3);
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

export default function Riwayat() {
  const supabase = createClient();
  const { profile } = useUser();
  const [filter, setFilter] = useState({ dari: tigaBulanLalu(), sampai: hariIni(), tipe: "semua" });
  const [nasabahId, setNasabahId] = useState(null);
  const [data, setData] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState("");

  async function tampilkan(idNasabah = nasabahId) {
    if (filter.dari > filter.sampai) {
      setError("Tanggal awal tidak boleh setelah tanggal akhir.");
      return;
    }
    setError("");
    setMemuat(true);
    if (!idNasabah) {
      setData([]);
      setMemuat(false);
      return;
    }
    let q = supabase
      .from("v_transaksi")
      .select("*")
      .eq("nasabah_id", idNasabah)
      .gte("tanggal", awalHari(filter.dari))
      .lte("tanggal", akhirHari(filter.sampai))
      .order("tanggal", { ascending: false });
    if (filter.tipe !== "semua") q = q.eq("tipe", filter.tipe);
    const { data: hasil, error: err } = await q;
    if (err) setError(pesanError(err));
    setData(hasil ?? []);
    setMemuat(false);
  }

  useEffect(() => {
    (async () => {
      const { data: n } = await supabase.from("nasabah").select("id").eq("profile_id", profile?.id).maybeSingle();
      setNasabahId(n?.id ?? null);
      tampilkan(n?.id ?? null);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader judul="Riwayat Transaksi" deskripsi="Seluruh setoran dan penarikan tabungan sampah Anda." />

      <FilterTransaksi filter={filter} setFilter={setFilter} onTampilkan={() => tampilkan()} memuat={memuat} />
      <Alert tipe="error" className="mt-4">{error}</Alert>

      <Card className="mt-6" padding={false}>
        <TabelTransaksi
          data={data}
          memuat={memuat}
          kolom={["tanggal", "kode", "tipe", "rincian", "nominal"]}
          teksKosong="Belum ada transaksi pada rentang tanggal ini."
        />
      </Card>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
        <Lock className="h-3.5 w-3.5" /> Hanya menampilkan transaksi milik akun Anda.
      </p>
    </div>
  );
}
