"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Field from "@/components/ui/Field";
import PasswordInput from "../PasswordInput";

const SITE = process.env.NEXT_PUBLIC_SITE_URL;

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [belumVerifikasi, setBelumVerifikasi] = useState(false);
  const [memuat, setMemuat] = useState(false);
  const [infoKirimUlang, setInfoKirimUlang] = useState("");
  const [mengirim, setMengirim] = useState(false);

  const verified = params.get("verified");

  async function masuk(e) {
    e.preventDefault();
    setError("");
    setBelumVerifikasi(false);
    setInfoKirimUlang("");

    if (!email.trim() || !password) {
      setError("Email & Password wajib diisi!");
      return;
    }

    setMemuat(true);
    const { data, error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });

    if (err) {
      setMemuat(false);
      if (err.code === "email_not_confirmed" || /not confirmed/i.test(err.message)) {
        setBelumVerifikasi(true);
        setError("Email Anda belum diverifikasi. Silakan cek inbox email Anda!");
      } else if (/fetch/i.test(err.message)) {
        setError("Gagal terhubung ke server. Periksa koneksi internet.");
      } else {
        setError("Email atau password salah!");
      }
      return;
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
    router.replace(profile?.role === "petugas" ? "/dashboard" : "/nasabah/dashboard");
    router.refresh();
  }

  async function kirimUlang() {
    setMengirim(true);
    const { error: err } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: `${SITE ?? window.location.origin}/auth/callback` },
    });
    setMengirim(false);
    setInfoKirimUlang(
      err ? "Gagal mengirim ulang. Tunggu sebentar lalu coba lagi." : "Link verifikasi baru sudah dikirim ke email Anda."
    );
  }

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-8 shadow-md">
      <div className="mb-6 flex flex-col items-center">
        <Logo ukuran="lg" tagline />
        <h1 className="mt-5 text-lg font-semibold text-slate-900">Masuk ke Akun Anda</h1>
      </div>

      {verified === "true" && (
        <Alert tipe="sukses" className="mb-4">
          Email berhasil diverifikasi! Silakan login.
        </Alert>
      )}
      {verified === "gagal" && (
        <Alert tipe="peringatan" className="mb-4">
          Link verifikasi tidak valid atau sudah kedaluwarsa. Coba login untuk mengirim ulang link.
        </Alert>
      )}

      <form onSubmit={masuk} className="space-y-4" noValidate>
        <Field
          label="Email"
          id="email"
          type="email"
          autoComplete="email"
          placeholder="contoh@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field label="Password" id="password">
          <PasswordInput
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        {error && (
          <Alert tipe="error">
            <p>{error}</p>
            {belumVerifikasi && (
              <button
                type="button"
                onClick={kirimUlang}
                disabled={mengirim}
                className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-rose-700 underline underline-offset-2 hover:text-rose-900 disabled:opacity-60"
              >
                <MailCheck className="h-3.5 w-3.5" />
                {mengirim ? "Mengirim..." : "Kirim ulang link verifikasi"}
              </button>
            )}
          </Alert>
        )}
        {infoKirimUlang && <Alert tipe="info">{infoKirimUlang}</Alert>}

        <Button type="submit" full size="lg" loading={memuat}>
          Masuk
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Belum punya akun?{" "}
        <Link href="/daftar" className="font-semibold text-emerald-600 hover:text-emerald-700">
          Buat akun
        </Link>
      </p>
    </div>
  );
}
