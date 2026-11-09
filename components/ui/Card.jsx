// Kartu putih pembungkus konten
export default function Card({ judul, aksi, children, className = "", padding = true }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {(judul || aksi) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3.5">
          {judul && <h2 className="text-base font-semibold text-slate-900">{judul}</h2>}
          {aksi}
        </div>
      )}
      <div className={padding ? "p-5" : ""}>{children}</div>
    </section>
  );
}
