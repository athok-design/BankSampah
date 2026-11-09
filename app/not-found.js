import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 p-6 text-center">
      <Logo />
      <h1 className="text-2xl font-bold">Halaman tidak ditemukan</h1>
      <p className="text-sm text-slate-600">Alamat yang kamu buka tidak tersedia.</p>
      <Link href="/" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
        Kembali ke beranda
      </Link>
    </div>
  );
}
