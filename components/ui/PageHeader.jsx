// Judul halaman + deskripsi + tombol aksi di kanan
export default function PageHeader({ judul, deskripsi, aksi }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{judul}</h1>
        {deskripsi && <p className="mt-1 text-sm text-slate-600">{deskripsi}</p>}
      </div>
      {aksi && <div className="flex flex-wrap gap-2">{aksi}</div>}
    </div>
  );
}
