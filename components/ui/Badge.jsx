const WARNA = {
  setoran: "bg-emerald-100 text-emerald-800",
  aktif: "bg-emerald-100 text-emerald-800",
  sukses: "bg-emerald-100 text-emerald-800",
  penarikan: "bg-amber-100 text-amber-800",
  peringatan: "bg-amber-100 text-amber-800",
  nonaktif: "bg-rose-100 text-rose-800",
  bahaya: "bg-rose-100 text-rose-800",
  petugas: "bg-emerald-600 text-white",
  nasabah: "bg-teal-100 text-teal-800",
  netral: "bg-slate-100 text-slate-600",
};

const LABEL = {
  setoran: "Setoran",
  penarikan: "Penarikan",
  aktif: "Aktif",
  nonaktif: "Nonaktif",
  petugas: "Petugas",
  nasabah: "Nasabah",
};

// Penanda status berwarna. Contoh: <Badge tipe="setoran" />
export default function Badge({ tipe = "netral", children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${WARNA[tipe] ?? WARNA.netral} ${className}`}
    >
      {children ?? LABEL[tipe] ?? tipe}
    </span>
  );
}
