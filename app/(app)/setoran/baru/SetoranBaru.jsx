"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Scale, Trash2, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatBerat, formatRupiah, parseAngka, pesanError } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import NasabahPicker from "@/components/ui/NasabahPicker";
import { Label, kelasInput } from "@/components/ui/Field";
import StrukModal from "../../StrukModal";

let nomor = 0;
const itemBaru = () => ({ key: ++nomor, jenis_sampah_id: "", berat: "" });

export default function SetoranBaru() {
  const supabase = createClient();
  const router = useRouter();

  const [jenis, setJenis] = useState([]);
  const [nasabah, setNasabah] = useState(null);
  const [items, setItems] = useState([itemBaru()]);
  const [errors, setErrors] = useState({});
  const [errorSimpan, setErrorSimpan] = useState("");
  const [menyimpan, setMenyimpan] = useState(false);
  const [struk, setStruk] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    supabase
      .from("jenis_sampah")
      .select("id, nama_sampah, harga_per_kg")
      .eq("aktif", true)
      .order("nama_sampah")
      .then(({ data }) => setJenis(data ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hitung subtotal & total otomatis
  const rincian = useMemo(
    () =>
      items.map((it) => {
        const j = jenis.find((x) => String(x.id) === String(it.jenis_sampah_id));
        const berat = parseAngka(it.berat);
        const harga = j ? Number(j.harga_per_kg) : 0;
        return { ...it, nama: j?.nama_sampah, harga, beratAngka: berat, subtotal: Math.round(berat * harga * 100) / 100 };
      }),
    [items, jenis]
  );
  const totalBerat = rincian.reduce((s, r) => s + r.beratAngka, 0);
  const totalNilai = rincian.reduce((s, r) => s + r.subtotal, 0);

  const ubahItem = (key, field, nilai) => setItems((arr) => arr.map((it) => (it.key === key ? { ...it, [field]: nilai } : it)));
  const hapusItem = (key) => setItems((arr) => (arr.length === 1 ? arr : arr.filter((it) => it.key !== key)));

  function reset() {
    setNasabah(null);
    setItems([itemBaru()]);
    setErrors({});
    setErrorSimpan("");
  }

  async function simpan() {
    setErrorSimpan("");
    const er = {};
    if (!nasabah) er.nasabah = "Nasabah wajib dipilih";
    const terisi = rincian.filter((r) => r.jenis_sampah_id || r.berat);
    if (terisi.length === 0) er.items = "Setoran minimal berisi satu item sampah";
    rincian.forEach((r) => {
      if (!r.jenis_sampah_id && !r.berat && rincian.length > 1) return; // baris kosong diabaikan
      if (!r.jenis_sampah_id) er[`jenis-${r.key}`] = "Pilih jenis";
      if (!(r.beratAngka > 0)) er[`berat-${r.key}`] = "Berat > 0";
    });
    setErrors(er);
    if (Object.keys(er).length) return;

    const kirim = terisi.map((r) => ({ jenis_sampah_id: Number(r.jenis_sampah_id), berat: r.beratAngka }));
    setMenyimpan(true);
    const { data, error } = await supabase.rpc("simpan_setoran", { p_nasabah_id: nasabah.id, p_items: kirim });
    setMenyimpan(false);

    if (error) {
      setErrorSimpan(pesanError(error));
      return;
    }
    setStruk({
      jenis: "setoran",
      ...data,
      items: terisi.map((r) => ({ nama: r.nama, berat: r.beratAngka, harga: r.harga, subtotal: r.subtotal })),
    });
    reset();
    setRefreshKey((k) => k + 1);
  }

  const dipakai = (key) => items.filter((it) => it.key !== key).map((it) => String(it.jenis_sampah_id));

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader judul="Transaksi Setoran" deskripsi="Catat sampah yang disetor nasabah. Nilai dihitung otomatis dari berat × harga per kg." />

      <Card>
        {/* Pilih nasabah */}
        <div className="grid gap-4 md:grid-cols-[1fr_260px] md:items-end">
          <div>
            <Label wajib>Nasabah</Label>
            <NasabahPicker value={nasabah} onChange={setNasabah} error={errors.nasabah} refreshKey={refreshKey} />
          </div>
          <div className="flex h-10 items-center gap-2 rounded-lg bg-emerald-50 px-3 text-sm">
            <Wallet className="h-4 w-4 text-emerald-600" />
            <span className="text-emerald-800">Saldo terkini:</span>
            <span className="ml-auto font-semibold text-emerald-900">{nasabah ? formatRupiah(nasabah.saldo) : "-"}</span>
          </div>
        </div>

        {/* Item sampah */}
        <div className="mt-6">
          <p className="mb-2 text-sm font-semibold text-slate-800">Item Sampah</p>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2.5">Jenis Sampah</th>
                  <th className="w-36 px-3 py-2.5">Berat (kg)</th>
                  <th className="w-32 px-3 py-2.5 text-right">Harga/kg</th>
                  <th className="w-36 px-3 py-2.5 text-right">Subtotal</th>
                  <th className="w-12 px-3 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {rincian.map((r) => (
                  <tr key={r.key} className="border-t border-slate-100 align-top">
                    <td className="px-3 py-2.5">
                      <select
                        value={r.jenis_sampah_id}
                        onChange={(e) => ubahItem(r.key, "jenis_sampah_id", e.target.value)}
                        className={`${kelasInput} ${errors[`jenis-${r.key}`] ? "border-rose-400" : ""}`}
                      >
                        <option value="">Pilih jenis sampah</option>
                        {jenis.map((j) => (
                          <option key={j.id} value={j.id} disabled={dipakai(r.key).includes(String(j.id))}>
                            {j.nama_sampah}
                          </option>
                        ))}
                      </select>
                      {errors[`jenis-${r.key}`] && <p className="mt-1 text-xs text-rose-600">{errors[`jenis-${r.key}`]}</p>}
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        inputMode="decimal"
                        placeholder="0"
                        value={r.berat}
                        onChange={(e) => ubahItem(r.key, "berat", e.target.value.replace(/[^0-9.,]/g, ""))}
                        className={`${kelasInput} ${errors[`berat-${r.key}`] ? "border-rose-400" : ""}`}
                      />
                      {errors[`berat-${r.key}`] && <p className="mt-1 text-xs text-rose-600">{errors[`berat-${r.key}`]}</p>}
                    </td>
                    <td className="px-3 py-2.5 pt-5 text-right text-slate-600">{r.harga ? formatRupiah(r.harga) : "-"}</td>
                    <td className="px-3 py-2.5 pt-5 text-right font-semibold text-slate-900">{formatRupiah(r.subtotal)}</td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => hapusItem(r.key)}
                        disabled={items.length === 1}
                        className="mt-1 rounded-md p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 disabled:hover:bg-transparent"
                        aria-label="Hapus item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {errors.items && <p className="mt-2 text-xs font-medium text-rose-600">{errors.items}</p>}
          <button
            type="button"
            onClick={() => setItems((arr) => [...arr, itemBaru()])}
            disabled={items.length >= jenis.length}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" /> Tambah Item Sampah
          </button>
        </div>

        {/* Card total */}
        <div className="mt-6 grid gap-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/15">
              <Scale className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-emerald-100">Total Berat</p>
              <p className="text-2xl font-bold">{formatBerat(totalBerat)}</p>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-xs text-emerald-100">Total Nilai Setoran</p>
            <p className="text-3xl font-bold tracking-tight">{formatRupiah(totalNilai)}</p>
            {nasabah && (
              <p className="text-xs text-emerald-100">Saldo setelah setoran: {formatRupiah(Number(nasabah.saldo) + totalNilai)}</p>
            )}
          </div>
        </div>

        <Alert tipe="error" className="mt-4">{errorSimpan}</Alert>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => (nasabah || totalBerat ? reset() : router.push("/dashboard"))}>
            Batal
          </Button>
          <Button onClick={simpan} loading={menyimpan} size="lg">
            Simpan Setoran
          </Button>
        </div>
      </Card>

      <StrukModal struk={struk} onTutup={() => setStruk(null)} />
    </div>
  );
}
