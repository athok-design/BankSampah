"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Info, Pencil, Plus, Power, Recycle, Search, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatRupiah, parseAngka, pesanError } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Field, { kelasInput } from "@/components/ui/Field";
import Alert from "@/components/ui/Alert";
import Modal from "@/components/ui/Modal";
import Toast from "@/components/ui/Toast";
import { Table, Th, Td, BarisKosong, BarisMemuat } from "@/components/ui/Table";

const FORM_KOSONG = { nama_sampah: "", harga_per_kg: "" };

export default function JenisSampah() {
  const supabase = createClient();
  const [daftar, setDaftar] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [cari, setCari] = useState("");

  const [form, setForm] = useState(FORM_KOSONG);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [errorSimpan, setErrorSimpan] = useState("");
  const [menyimpan, setMenyimpan] = useState(false);

  const [konfirmasi, setKonfirmasi] = useState(null);
  const [mengubahStatus, setMengubahStatus] = useState(false);
  const [toast, setToast] = useState(null);
  const tutupToast = useCallback(() => setToast(null), []);

  async function muat() {
    const { data, error } = await supabase
      .from("jenis_sampah")
      .select("id, nama_sampah, harga_per_kg, aktif")
      .order("aktif", { ascending: false })
      .order("nama_sampah");
    if (error) setToast({ tipe: "error", teks: pesanError(error) });
    setDaftar(data ?? []);
    setMemuat(false);
  }

  useEffect(() => {
    muat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasil = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return q ? daftar.filter((j) => j.nama_sampah.toLowerCase().includes(q)) : daftar;
  }, [daftar, cari]);

  function mulaiEdit(j) {
    setEditId(j.id);
    setForm({ nama_sampah: j.nama_sampah, harga_per_kg: String(Number(j.harga_per_kg)) });
    setErrors({});
    setErrorSimpan("");
  }

  function batalEdit() {
    setEditId(null);
    setForm(FORM_KOSONG);
    setErrors({});
    setErrorSimpan("");
  }

  async function simpan(e) {
    e.preventDefault();
    setErrorSimpan("");
    const harga = parseAngka(form.harga_per_kg);
    const nama = form.nama_sampah.trim();
    const er = {};
    if (!nama) er.nama_sampah = "Nama sampah wajib diisi";
    else if (daftar.some((j) => j.id !== editId && j.nama_sampah.toLowerCase() === nama.toLowerCase()))
      er.nama_sampah = "Nama jenis sampah sudah ada";
    if (!(harga > 0)) er.harga_per_kg = "Harga harus lebih dari 0";
    setErrors(er);
    if (Object.keys(er).length) return;

    setMenyimpan(true);
    const isi = { nama_sampah: nama, harga_per_kg: harga };
    const { error } = editId
      ? await supabase.from("jenis_sampah").update(isi).eq("id", editId)
      : await supabase.from("jenis_sampah").insert(isi);
    setMenyimpan(false);

    if (error) {
      setErrorSimpan(pesanError(error));
      return;
    }
    setToast({ tipe: "sukses", teks: editId ? "Jenis sampah diperbarui" : "Jenis sampah ditambahkan" });
    batalEdit();
    muat();
  }

  async function ubahStatus() {
    if (!konfirmasi) return;
    setMengubahStatus(true);
    const { error } = await supabase.from("jenis_sampah").update({ aktif: !konfirmasi.aktif }).eq("id", konfirmasi.id);
    setMengubahStatus(false);
    if (error) setToast({ tipe: "error", teks: pesanError(error) });
    else setToast({ tipe: "sukses", teks: konfirmasi.aktif ? "Jenis sampah dinonaktifkan" : "Jenis sampah diaktifkan" });
    setKonfirmasi(null);
    muat();
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader judul="Jenis Sampah" deskripsi="Kategori sampah dan harga per kilogram yang dipakai saat menghitung setoran." />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <Card padding={false}>
          <div className="border-b border-slate-100 p-4">
            <div className="relative max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari jenis sampah" className={`${kelasInput} pl-9`} />
            </div>
          </div>
          <Table>
            <thead>
              <tr>
                <Th>Nama Sampah</Th>
                <Th className="text-right">Harga / kg</Th>
                <Th>Status</Th>
                <Th className="text-right">Aksi</Th>
              </tr>
            </thead>
            <tbody>
              {memuat ? (
                <BarisMemuat kolom={4} />
              ) : hasil.length === 0 ? (
                <BarisKosong kolom={4} teks="Belum ada jenis sampah." />
              ) : (
                hasil.map((j) => (
                  <tr key={j.id} className={`hover:bg-slate-50/60 ${editId === j.id ? "bg-emerald-50/50" : ""}`}>
                    <Td>
                      <span className="flex items-center gap-2 font-medium text-slate-800">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                          <Recycle className="h-4 w-4 text-emerald-600" />
                        </span>
                        {j.nama_sampah}
                      </span>
                    </Td>
                    <Td className="whitespace-nowrap text-right font-semibold text-slate-800">{formatRupiah(j.harga_per_kg)}</Td>
                    <Td>
                      <Badge tipe={j.aktif ? "aktif" : "nonaktif"} />
                    </Td>
                    <Td className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="outline" size="sm" onClick={() => mulaiEdit(j)}>
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button
                          variant={j.aktif ? "ghost" : "outline"}
                          size="sm"
                          onClick={() => setKonfirmasi(j)}
                          className={j.aktif ? "text-rose-600 hover:bg-rose-50" : "text-emerald-700"}
                        >
                          <Power className="h-3.5 w-3.5" /> {j.aktif ? "Nonaktifkan" : "Aktifkan"}
                        </Button>
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card>

        <Card
          judul={editId ? "Edit Jenis Sampah" : "Tambah Jenis Sampah"}
          className="lg:sticky lg:top-20"
          aksi={
            editId && (
              <button onClick={batalEdit} className="rounded p-1 text-slate-400 hover:bg-slate-100" aria-label="Batal edit">
                <X className="h-4 w-4" />
              </button>
            )
          }
        >
          <form onSubmit={simpan} className="space-y-4" noValidate>
            <Field
              label="Nama Sampah"
              id="nama_sampah"
              wajib
              placeholder="mis. Botol Kaca"
              value={form.nama_sampah}
              onChange={(e) => setForm((f) => ({ ...f, nama_sampah: e.target.value }))}
              error={errors.nama_sampah}
            />
            <Field label="Harga per kg (Rp)" id="harga" wajib error={errors.harga_per_kg}>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">Rp</span>
                <input
                  id="harga"
                  inputMode="numeric"
                  placeholder="3000"
                  value={form.harga_per_kg}
                  onChange={(e) => setForm((f) => ({ ...f, harga_per_kg: e.target.value.replace(/[^0-9.,]/g, "") }))}
                  className={`${kelasInput} pl-9 ${errors.harga_per_kg ? "border-rose-400" : ""}`}
                />
              </div>
            </Field>
            {editId && (
              <div className="flex gap-2 rounded-lg bg-sky-50 p-3 text-xs text-sky-800">
                <Info className="h-4 w-4 shrink-0" />
                Harga baru hanya berlaku untuk setoran berikutnya. Harga pada transaksi lama tidak berubah.
              </div>
            )}
            <Alert tipe="error">{errorSimpan}</Alert>
            <div className="flex gap-2">
              {editId && (
                <Button type="button" variant="outline" onClick={batalEdit} className="flex-1">
                  Batal
                </Button>
              )}
              <Button type="submit" loading={menyimpan} className="flex-1">
                {!editId && <Plus className="h-4 w-4" />}
                Simpan Jenis Sampah
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <Modal
        buka={!!konfirmasi}
        onTutup={() => setKonfirmasi(null)}
        judul={konfirmasi?.aktif ? "Nonaktifkan Jenis Sampah?" : "Aktifkan Jenis Sampah?"}
        footer={
          <>
            <Button variant="outline" onClick={() => setKonfirmasi(null)}>
              Batal
            </Button>
            <Button variant={konfirmasi?.aktif ? "danger" : "primary"} loading={mengubahStatus} onClick={ubahStatus}>
              {konfirmasi?.aktif ? "Ya, Nonaktifkan" : "Ya, Aktifkan"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          {konfirmasi?.aktif
            ? `"${konfirmasi?.nama_sampah}" tidak bisa dipilih lagi pada setoran baru. Riwayat setoran lama tetap aman.`
            : `"${konfirmasi?.nama_sampah}" akan bisa dipilih lagi pada setoran baru.`}
        </p>
      </Modal>

      <Toast pesan={toast} onTutup={tutupToast} />
    </div>
  );
}
