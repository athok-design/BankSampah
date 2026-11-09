import {
  LayoutDashboard,
  Users,
  Recycle,
  ArrowDownLeft,
  ArrowUpRight,
  FileBarChart,
  History,
  UserCog,
} from "lucide-react";

// Menu sidebar sesuai role
export const MENU = {
  petugas: [
    { href: "/dashboard", label: "Dashboard", ikon: LayoutDashboard },
    { href: "/nasabah", label: "Data Nasabah", ikon: Users },
    { href: "/jenis-sampah", label: "Jenis Sampah", ikon: Recycle },
    { href: "/setoran/baru", label: "Setoran", ikon: ArrowDownLeft },
    { href: "/penarikan/baru", label: "Penarikan", ikon: ArrowUpRight },
    { href: "/laporan", label: "Laporan", ikon: FileBarChart },
  ],
  nasabah: [
    { href: "/nasabah/dashboard", label: "Dashboard", ikon: LayoutDashboard },
    { href: "/nasabah/riwayat", label: "Riwayat Transaksi", ikon: History },
  ],
};

// Judul halaman untuk topbar
export const JUDUL = {
  "/dashboard": "Dashboard",
  "/nasabah": "Data Nasabah",
  "/jenis-sampah": "Jenis Sampah",
  "/setoran/baru": "Transaksi Setoran",
  "/penarikan/baru": "Transaksi Penarikan",
  "/laporan": "Laporan Transaksi",
  "/nasabah/dashboard": "Dashboard",
  "/nasabah/riwayat": "Riwayat Transaksi",
  "/profil": "Edit Profil",
};

export const IKON_PROFIL = UserCog;
