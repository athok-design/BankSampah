"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BadgeCheck, Pencil, Power, Search, UserPlus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatRupiah, pesanError } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Field, { kelasInput } from "@/components/ui/Field";
import Alert from "@/components/ui/Alert";
import Modal from "@/components/ui/Modal";
import Toast from "@/components/ui/Toast";
import { Table, Th, Td, BarisKosong, BarisMemuat } from "@/components/ui/Table";

const FORM_KOSONG = { nama: "", email: "", no_hp: "", alamat: "" };
const POLA_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function DataNasabah() {
  const supabase = createClient();
  const [daftar, setDaftar] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [cari, setCari] = useState("");
  const [filter, setFilter] = useState("semua");

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
      .from("nasabah")
      .select("id, kode_nasabah, nama, email, no_hp, alamat, saldo, aktif, profile_id")
      .order("id", { ascending: true });
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
    return daftar.filter((n) => {
      if (filter === "aktif" && !n.aktif) return false;
      if (filter === "nonaktif" && n.aktif) return false;
      if (!q) return true;
      return [n.nama, n.kode_nasabah, n.no_hp, n.email].some((v) => (v ?? "").toLowerCase().includes(q));
    });
  }, [daftar, cari, filter]);

  const sedangEdit = daftar.find((n) => n.id === editId);
  const ubah = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function mulaiEdit(n) {
    setEditId(n.id);
    setForm({ nama: n.nama ?? "", email: n.email ?? "", no_hp: n.no_hp ?? "", alamat: n.alamat ?? "" });
    setErrors({});
    setErrorSimpan("");
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    const er = {};
    if (!form.nama.trim()) er.nama = "Nama wajib diisi";
    if (!form.no_hp.trim()) er.no_hp = "No. HP wajib diisi";
    else if (!/^[0-9+\-\s]{8,16}$/.test(form.no_hp.trim())) er.no_hp = "No. HP tidak valid";
    const email = form.email.trim().toLowerCase();
    if (email && !POLA_EMAIL.test(email)) er.email = "Format email tidak valid";
    else if (email && daftar.some((n) => n.id !== editId && (n.email ?? "").toLowerCase() === email))
      er.email = "Email ini sudah dipakai nasabah lain";
    setErrors(er);
    if (Object.keys(er).length) return;

    setMenyimpan(true);
    const isi = {
      nama: form.nama.trim(),
      no_hp: form.no_hp.trim(),
      alamat: form.alamat.trim() || null,
    };
    // email nasabah yang sudah punya akun login tidak diubah dari sini
    if (!sedangEdit?.profile_id) isi.email = email || null;

    const { error } = editId
      ? await supabase.from("nasabah").update(isi).eq("id", editId)
      : await supabase.from("nasabah").insert(isi);
    setMenyimpan(false);

    if (error) {
      setErrorSimpan(pesanError(error));
      return;
    }
    setToast({ tipe: "sukses", teks: editId ? "Data nasabah diperbarui" : "Nasabah baru berhasil ditambahkan" });
    batalEdit();
    muat();
  }

  async function ubahStatus() {
    if (!konfirmasi) return;
    setMengubahStatus(true);
    const { error } = await supabase.from("nasabah").update({ aktif: !konfirmasi.aktif }).eq("id", konfirmasi.id);
    setMengubahStatus(false);
    if (error) setToast({ tipe: "error", teks: pesanError(error) });
    else setToast({ tipe: "sukses", teks: konfirmasi.aktif ? "Nasabah dinonaktifkan" : "Nasabah diaktifkan kembali" });
    if (editId === konfirmasi.id) batalEdit();
    setKonfirmasi(null);
    muat();
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader judul="Data Nasabah" deskripsi="Kelola data nasabah. Nasabah nonaktif tetap menyimpan riwayat transaksinya." />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        {/* Kolom kiri: tabel */}
        <Card padding={false}>
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={cari}
                onChange={(e) => setCari(e.target.value)}
                placeholder="Cari nama, kode, no. HP, atau email"
                className={`${kelasInput} pl-9`}
              />
            </div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className={`${kelasInput} w-auto`}>
              <option value="semua">Semua status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>

          <Table>
            <thead>
              <tr>
                <Th>Kode</Th>
                <Th>Nama</Th>
                <Th>No. HP</Th>
                <Th className="text-right">Saldo</Th>
                <Th>Status</Th>
                <Th className="text-right">Aksi</Th>
              </tr>
            </thead>
            <tbody>
              {memuat ? (
                <BarisMemuat kolom={6} />
              ) : hasil.length === 0 ? (
                <BarisKosong kolom={6} teks={cari ? "Nasabah tidak ditemukan." : "Belum ada nasabah."} />
              ) : (
                hasil.map((n) => (
                  <tr key={n.id} className={`hover:bg-slate-50/60 ${editId === n.id ? "bg-emerald-50/50" : ""}`}>
                    <Td className="whitespace-nowrap font-mono text-xs font-medium text-slate-500">{n.kode_nasabah}</Td>
                    <Td>
                      <p className="flex items-center gap-1 font-medium text-slate-800">
                        {n.nama}
                        {n.profile_id && <BadgeCheck className="h-4 w-4 text-emerald-500" aria-label="Punya akun login" />}
                      </p>
                      <p className="text-xs text-slate-400">{n.email || "Tanpa akun login"}</p>
                    </Td>
                    <Td className="whitespace-nowrap">{n.no_hp || "-"}</Td>
                    <Td className="whitespace-nowrap text-right font-medium text-slate-800">{formatRupiah(n.saldo)}</Td>
                    <Td>
                      <Badge tipe={n.aktif ? "aktif" : "nonaktif"} />
                    </Td>
                    <Td className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="outline" size="sm" onClick={() => mulaiEdit(n)}>
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button
                          variant={n.aktif ? "ghost" : "outline"}
                          size="sm"
                          onClick={() => setKonfirmasi(n)}
                          className={n.aktif ? "text-rose-600 hover:bg-rose-50" : "text-emerald-700"}
                        >
                          <Power className="h-3.5 w-3.5" /> {n.aktif ? "Nonaktifkan" : "Aktifkan"}
                        </Button>
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
          <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-400">
            <BadgeCheck className="mr-1 inline h-3.5 w-3.5 text-emerald-500" />
            = nasabah sudah punya akun login · Menampilkan {hasil.length} dari {daftar.length} nasabah
          </p>
        </Card>

        {/* Kolom kanan: form */}
        <Card
          judul={editId ? `Edit Nasabah ${sedangEdit?.kode_nasabah ?? ""}` : "Tambah Nasabah"}
          className="lg:sticky lg:top-20"
          aksi={
            editId && (
              <button onClick={batalEdit} className="rounded p-1 text-slate-400 hover:bg-slate-100" aria-label="Batal edit">
                <X className="h-4 w-4" />
              </button>
            )
          }
        >
          {!editId && (
            <p className="mb-4 text-xs text-slate-500">
              Untuk warga yang tidak bisa mendaftar sendiri. Jika email diisi, warga bisa membuat akun di halaman Buat
              Akun memakai email yang sama dan datanya akan tertaut otomatis.
            </p>
          )}
          <form onSubmit={simpan} className="space-y-4" noValidate>
            <Field label="Nama" id="nama" wajib value={form.nama} onChange={ubah("nama")} error={errors.nama} placeholder="Nama lengkap" />
            <Field
              label="Email (opsional, untuk login)"
              id="email"
              type="email"
              value={form.email}
              onChange={ubah("email")}
              error={errors.email}
              placeholder="contoh@email.com"
              disabled={!!sedangEdit?.profile_id}
              bantuan={sedangEdit?.profile_id ? "Email akun login tidak bisa diubah dari sini." : undefined}
            />
            <Field label="No. HP" id="no_hp" type="tel" wajib value={form.no_hp} onChange={ubah("no_hp")} error={errors.no_hp} placeholder="08xxxxxxxxxx" />
            <Field label="Alamat" id="alamat">
              <textarea
                id="alamat"
                rows={3}
                value={form.alamat}
                onChange={ubah("alamat")}
                placeholder="Alamat lengkap"
                className={`${kelasInput} h-auto py-2`}
              />
            </Field>
            <Alert tipe="error">{errorSimpan}</Alert>
            <div className="flex gap-2">
              {editId && (
                <Button type="button" variant="outline" onClick={batalEdit} className="flex-1">
                  Batal
                </Button>
              )}
              <Button type="submit" loading={menyimpan} className="flex-1">
                {!editId && <UserPlus className="h-4 w-4" />}
                Simpan Data
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <Modal
        buka={!!konfirmasi}
        onTutup={() => setKonfirmasi(null)}
        judul={konfirmasi?.aktif ? "Nonaktifkan Nasabah?" : "Aktifkan Nasabah?"}
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
        {konfirmasi?.aktif ? (
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-800">{konfirmasi?.nama}</span> ({konfirmasi?.kode_nasabah}) tidak akan
            muncul di pilihan transaksi baru. Saldo <b>{formatRupiah(konfirmasi?.saldo)}</b> dan seluruh riwayat
            transaksinya <b>tetap tersimpan</b>.
          </p>
        ) : (
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-800">{konfirmasi?.nama}</span> akan bisa dipilih lagi untuk transaksi.
          </p>
        )}
      </Modal>

      <Toast pesan={toast} onTutup={tutupToast} />
    </div>
  );
}
