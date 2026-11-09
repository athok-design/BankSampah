"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Field, { kelasInput } from "@/components/ui/Field";
import PasswordInput from "../PasswordInput";

const SITE = process.env.NEXT_PUBLIC_SITE_URL;
const POLA_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function DaftarForm() {
  const supabase = createClient();
  const [form, setForm] = useState({ nama: "", email: "", password: "", no_hp: "", alamat: "" });
  const [errors, setErrors] = useState({});
  const [errorUmum, setErrorUmum] = useState("");
  const [memuat, setMemuat] = useState(false);
  const [sukses, setSukses] = useState(false);

  const ubah = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function validasi() {
    const er = {};
    if (!form.nama.trim()) er.nama = "Nama lengkap wajib diisi";
    if (!form.email.trim()) er.email = "Email wajib diisi";
    else if (!POLA_EMAIL.test(form.email.trim())) er.email = "Format email tidak valid";
    if (!form.password) er.password = "Password wajib diisi";
    else if (form.password.length < 8) er.password = "Password minimal 8 karakter";
    if (!form.no_hp.trim()) er.no_hp = "No. HP wajib diisi";
    else if (!/^[0-9+\-\s]{8,16}$/.test(form.no_hp.trim())) er.no_hp = "No. HP tidak valid";
    if (!form.alamat.trim()) er.alamat = "Alamat wajib diisi";
    return er;
  }

  async function daftar(e) {
    e.preventDefault();
    setErrorUmum("");
    const er = validasi();
    setErrors(er);
    if (Object.keys(er).length) return;

    setMemuat(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        emailRedirectTo: `${SITE ?? window.location.origin}/auth/callback`,
        data: { nama: form.nama.trim(), no_hp: form.no_hp.trim(), alamat: form.alamat.trim() },
      },
    });
    setMemuat(false);

    // Supabase: email yang sudah terdaftar mengembalikan user tanpa identities
    const sudahAda =
      (error && /already registered|already exists/i.test(error.message)) ||
      (!error && data?.user && data.user.identities?.length === 0);

    if (sudahAda) {
      setErrorUmum("Email sudah terdaftar! Silakan gunakan email lain atau login.");
      return;
    }
    if (error) {
      setErrorUmum(
        /rate limit/i.test(error.message)
          ? "Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi."
          : error.message
      );
      return;
    }
    setSukses(true);
  }

  if (sukses) {
    return (
      <div className="rounded-xl border border-slate-100 bg-white p-8 text-center shadow-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
          <MailCheck className="h-7 w-7 text-emerald-600" />
        </div>
        <h1 className="mt-4 text-lg font-semibold text-slate-900">Pendaftaran berhasil!</h1>
        <p className="mt-2 text-sm text-slate-600">
          Silakan periksa inbox email <span className="font-medium text-slate-800">{form.email}</span> untuk
          verifikasi akun sebelum login.
        </p>
        <p className="mt-2 text-xs text-slate-400">Tidak ada di inbox? Coba cek folder Spam/Promosi.</p>
        <Button href="/login" full className="mt-6">
          Ke Halaman Login
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-8 shadow-md">
      <div className="mb-6 flex flex-col items-center">
        <Logo ukuran="lg" />
        <h1 className="mt-5 text-lg font-semibold text-slate-900">Daftar sebagai Nasabah</h1>
        <p className="text-xs text-slate-500">Tabung sampahmu, pantau saldomu kapan saja.</p>
      </div>

      <form onSubmit={daftar} className="space-y-4" noValidate>
        <Field label="Nama Lengkap" id="nama" wajib placeholder="Nama sesuai KTP" value={form.nama} onChange={ubah("nama")} error={errors.nama} />
        <Field label="Email" id="email" type="email" wajib autoComplete="email" placeholder="contoh@email.com" value={form.email} onChange={ubah("email")} error={errors.email} />
        <Field label="Password (min. 8 karakter)" id="password" wajib error={errors.password}>
          <PasswordInput id="password" autoComplete="new-password" value={form.password} onChange={ubah("password")} error={errors.password} />
        </Field>
        <Field label="No. HP" id="no_hp" type="tel" wajib placeholder="08xxxxxxxxxx" value={form.no_hp} onChange={ubah("no_hp")} error={errors.no_hp} />
        <Field label="Alamat Lengkap" id="alamat" wajib error={errors.alamat}>
          <textarea
            id="alamat"
            rows={2}
            placeholder="Jalan, RT/RW, desa/kelurahan"
            value={form.alamat}
            onChange={ubah("alamat")}
            className={`${kelasInput} h-auto py-2 ${errors.alamat ? "border-rose-400" : ""}`}
          />
        </Field>

        <Alert tipe="error">{errorUmum}</Alert>

        <Button type="submit" full size="lg" loading={memuat}>
          Buat Akun
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
          Masuk
        </Link>
      </p>
    </div>
  );
}
