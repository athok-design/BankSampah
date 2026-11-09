// Kartu ringkasan angka statistik
export default function StatCard({ label, nilai, ikon: Ikon, warna = "emerald", keterangan, loading }) {
  const warnaIkon = {
    emerald: "bg-emerald-50 text-emerald-600",
    teal: "bg-teal-50 text-teal-600",
    amber: "bg-amber-50 text-amber-600",
    sky: "bg-sky-50 text-sky-600",
  }[warna];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          {loading ? (
            <div className="mt-2 h-7 w-28 animate-pulse rounded bg-slate-100" />
          ) : (
            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 truncate">{nilai}</p>
          )}
          {keterangan && <p className="mt-1 text-xs text-slate-400">{keterangan}</p>}
        </div>
        {Ikon && (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${warnaIkon}`}>
            <Ikon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
