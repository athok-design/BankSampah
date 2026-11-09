"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Mail, Save, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { pesanError } from "@/lib/format";
import { useUser } from "@/components/layout/DashboardShell";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Alert from "@/components/ui/Alert";
import Field, { kelasInput } from "@/components/ui/Field";
import PasswordInput from "../../(auth)/PasswordInput";

export default function EditProfil() {
  const supabase = createClient();
  const router = useRouter();
  const { profile, email } = useUser();
  const nasabahRole = profile?.role === "nasabah";

  const [form, setForm] = useState({ nama: profile?.nama ?? "", no_hp: "", alamat: "" });
  const [kode, setKode] = useState("");
  const [errors, setErrors] = useState({});
  const [pesan, setPesan] = useState(null);
  const [menyimpan, setMenyimpan] = useState(false);

  const [pw, setPw] = useState({ baru: "", ulang: "" });
  const [errPw, setErrPw] = useState({});
  const [pesanPw, setPesanPw] = useState(null);
  const [menyimpanPw, setMenyimpanPw] = useState(false);

  useEffect(() => {
    if (!nasabahRole) return;
    supabase
      .from("nasabah")
      .select("kode_nasabah, nama, no_hp, alamat")
      .eq("profile_id", profile.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setKode(data.kode_nasabah);
        setForm({ nama: data.nama ?? profile.nama ?? "", no_hp: data.no_hp ?? "", alamat: data.alamat ?? "" });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ubah = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function simpanProfil(e) {
    e.preventDefault();
    setPesan(null);
    const er = {};
    if (!form.nama.trim()) er.nama = "Nama wajib diisi";
    if (nasabahRole) {
      if (!form.no_hp.trim()) er.no_hp = "No. HP wajib diisi";
      else if (!/^[0-9+\-\s]{8,16}$/.test(form.no_hp.trim())) er.no_hp = "No. HP tidak valid";
    }
    setErrors(er);
    if (Object.keys(er).length) return;

    setMenyimpan(true);
    const { error } = await supabase.rpc("update_profil_saya", {
      p_nama: form.nama.trim(),
      p_no_hp: nasabahRole ? form.no_hp.trim() : null,
      p_alamat: nasabahRole ? form.alamat.trim() : null,
    });
    setMenyimpan(false);
    if (error) {
      setPesan({ tipe: "error", teks: pesanError(error) });
      return;
    }
    setPesan({ tipe: "sukses", teks: "Profil berhasil diperbarui." });
    router.refresh(); // perbarui nama di topbar
  }

  async function gantiPassword(e) {
    e.preventDefault();
    setPesanPw(null);
    const er = {};
    if (pw.baru.length < 8) er.baru = "Password minimal 8 karakter";
    if (pw.ulang !== pw.baru) er.ulang = "Konfirmasi password tidak sama";
    setErrPw(er);
    if (Object.keys(er).length) return;

    setMenyimpanPw(true);
    const { error } = await supabase.auth.updateUser({ password: pw.baru });
    setMenyimpanPw(false);
    if (error) {
      setPesanPw({
        tipe: "error",
        teks: /different from the old/i.test(error.message) ? "Password baru harus berbeda dari password lama." : error.message,
      });
      return;
    }
    setPw({ baru: "", ulang: "" });
    setPesanPw({ tipe: "sukses", teks: "Password berhasil diganti." });
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader judul="Edit Profil" deskripsi="Perbarui data diri dan password akun Anda." />

      <div className="grid items-start gap-6 md:grid-cols-[260px_1fr]">
        <Card>
          <div className="flex flex-col items-center text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-2xl font-bold text-white">
              {(form.nama || email || "?").trim().split(/\s+/).slice(0, 2).map((k) => k[0]?.toUpperCase()).join("")}
            </span>
            <p className="mt-3 font-semibold text-slate-900">{form.nama || "-"}</p>
            <Badge tipe={profile?.role ?? "nasabah"} className="mt-1.5" />
            <div className="mt-4 w-full space-y-2 border-t border-slate-100 pt-4 text-left text-xs">
              <p className="flex items-center gap-2 text-slate-600">
                <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{email}</span>
              </p>
              {kode && (
                <p className="flex items-center gap-2 text-slate-600">
                  <UserRound className="h-3.5 w-3.5 text-slate-400" />
                  Kode nasabah <span className="font-mono font-semibold">{kode}</span>
                </p>
              )}
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card judul="Data Diri">
            <form onSubmit={simpanProfil} className="space-y-4" noValidate>
              <Field label="Nama Lengkap" id="nama" wajib value={form.nama} onChange={ubah("nama")} error={errors.nama} />
              <Field label="Email" id="email" value={email ?? ""} disabled bantuan="Email dipakai untuk login dan tidak dapat diubah." />
              {nasabahRole && (
                <>
                  <Field label="No. HP" id="no_hp" type="tel" wajib value={form.no_hp} onChange={ubah("no_hp")} error={errors.no_hp} />
                  <Field label="Alamat Lengkap" id="alamat">
                    <textarea id="alamat" rows={3} value={form.alamat} onChange={ubah("alamat")} className={`${kelasInput} h-auto py-2`} />
                  </Field>
                </>
              )}
              {pesan && <Alert tipe={pesan.tipe}>{pesan.teks}</Alert>}
              <div className="flex justify-end">
                <Button type="submit" loading={menyimpan}>
                  <Save className="h-4 w-4" /> Simpan Profil
                </Button>
              </div>
            </form>
          </Card>

          <Card judul="Ganti Password">
            <form onSubmit={gantiPassword} className="space-y-4" noValidate>
              <Field label="Password Baru (min. 8 karakter)" id="pw-baru" error={errPw.baru}>
                <PasswordInput id="pw-baru" autoComplete="new-password" value={pw.baru} onChange={(e) => setPw((p) => ({ ...p, baru: e.target.value }))} error={errPw.baru} />
              </Field>
              <Field label="Ulangi Password Baru" id="pw-ulang" error={errPw.ulang}>
                <PasswordInput id="pw-ulang" autoComplete="new-password" value={pw.ulang} onChange={(e) => setPw((p) => ({ ...p, ulang: e.target.value }))} error={errPw.ulang} />
              </Field>
              {pesanPw && <Alert tipe={pesanPw.tipe}>{pesanPw.teks}</Alert>}
              <div className="flex justify-end">
                <Button type="submit" variant="outline" loading={menyimpanPw}>
                  <KeyRound className="h-4 w-4" /> Ganti Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
