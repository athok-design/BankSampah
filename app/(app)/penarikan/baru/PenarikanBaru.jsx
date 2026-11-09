"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatRupiah, parseAngka, pesanError } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import NasabahPicker from "@/components/ui/NasabahPicker";
import Field, { Label, kelasInput } from "@/components/ui/Field";
import StrukModal from "../../StrukModal";

// ketik "30000" -> tampil "30.000"
const tampilRibuan = (teks) => {
  const angka = teks.replace(/\D/g, "");
  return angka ? Number(angka).toLocaleString("id-ID") : "";
};

export default function PenarikanBaru() {
  const supabase = createClient();
  const router = useRouter();

  const [nasabah, setNasabah] = useState(null);
  const [jumlah, setJumlah] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [errors, setErrors] = useState({});
  const [errorSimpan, setErrorSimpan] = useState("");
  const [menyimpan, setMenyimpan] = useState(false);
  const [struk, setStruk] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const nominal = parseAngka(jumlah.replace(/\./g, ""));
  const saldo = Number(nasabah?.saldo ?? 0);
  const kurang = !!nasabah && nominal > saldo;

  function reset() {
    setNasabah(null);
    setJumlah("");
    setKeterangan("");
    setErrors({});
    setErrorSimpan("");
  }

  async function simpan(e) {
    e.preventDefault();
    setErrorSimpan("");
    const er = {};
    if (!nasabah) er.nasabah = "Nasabah wajib dipilih";
    if (!(nominal > 0)) er.jumlah = "Jumlah penarikan harus lebih dari 0";
    else if (kurang) er.jumlah = "Saldo tidak mencukupi";
    setErrors(er);
    if (Object.keys(er).length) return;

    setMenyimpan(true);
    const { data, error } = await supabase.rpc("simpan_penarikan", {
      p_nasabah_id: nasabah.id,
      p_jumlah: nominal,
      p_keterangan: keterangan.trim() || null,
    });
    setMenyimpan(false);
    if (error) {
      setErrorSimpan(pesanError(error));
      setRefreshKey((k) => k + 1); // ambil saldo terbaru
      return;
    }
    setStruk({ jenis: "penarikan", ...data });
    reset();
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader judul="Transaksi Penarikan" deskripsi="Catat penarikan saldo tunai. Penarikan tidak boleh melebihi saldo nasabah." />

      <Card>
        <form onSubmit={simpan} className="space-y-5" noValidate>
          <div>
            <Label wajib>Nasabah</Label>
            <NasabahPicker
              value={nasabah}
              onChange={(n) => {
                setNasabah(n);
                setErrors({});
              }}
              error={errors.nasabah}
              refreshKey={refreshKey}
            />
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
              <Wallet className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-medium text-emerald-700">Saldo Tersedia</p>
              <p className="text-xl font-bold text-emerald-900">{nasabah ? formatRupiah(saldo) : "Pilih nasabah dulu"}</p>
            </div>
          </div>

          <Field
            label="Jumlah Penarikan (Rp)"
            id="jumlah"
            wajib
            error={errors.jumlah || (kurang ? "Saldo tidak mencukupi" : "")}
            bantuan="Maksimal sebesar saldo tersedia"
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">Rp</span>
              <input
                id="jumlah"
                inputMode="numeric"
                placeholder="0"
                value={jumlah}
                onChange={(e) => setJumlah(tampilRibuan(e.target.value))}
                className={`${kelasInput} pl-9 text-base font-semibold ${kurang || errors.jumlah ? "border-rose-400" : ""}`}
              />
            </div>
          </Field>

          {nasabah && saldo > 0 && (
            <div className="-mt-2 flex flex-wrap gap-2">
              {[10000, 25000, 50000].filter((v) => v <= saldo).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setJumlah(v.toLocaleString("id-ID"))}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-emerald-300 hover:bg-emerald-50"
                >
                  {formatRupiah(v)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setJumlah(Math.floor(saldo).toLocaleString("id-ID"))}
                className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
              >
                Tarik semua
              </button>
            </div>
          )}

          <Field
            label="Keterangan (opsional)"
            id="keterangan"
            placeholder="mis. Penarikan rutin bulanan"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
          />

          <Alert tipe="error">{errorSimpan}</Alert>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => (nasabah || jumlah ? reset() : router.push("/dashboard"))}>
              Batal
            </Button>
            <Button type="submit" size="lg" loading={menyimpan} disabled={kurang || !nasabah || !(nominal > 0)}>
              Simpan Penarikan
            </Button>
          </div>
        </form>
      </Card>

      <StrukModal struk={struk} onTutup={() => setStruk(null)} />
    </div>
  );
}
