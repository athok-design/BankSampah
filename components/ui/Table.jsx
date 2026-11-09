// Tabel sederhana bergaya seragam
export function Table({ children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className = "" }) {
  return (
    <th className={`bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap ${className}`}>
      {children}
    </th>
  );
}

export function Td({ children, className = "", ...props }) {
  return (
    <td className={`border-t border-slate-100 px-4 py-3 text-slate-700 ${className}`} {...props}>
      {children}
    </td>
  );
}

export function BarisKosong({ kolom, teks = "Belum ada data." }) {
  return (
    <tr>
      <td colSpan={kolom} className="border-t border-slate-100 px-4 py-10 text-center text-sm text-slate-400">
        {teks}
      </td>
    </tr>
  );
}

export function BarisMemuat({ kolom, baris = 4 }) {
  return Array.from({ length: baris }).map((_, i) => (
    <tr key={i}>
      {Array.from({ length: kolom }).map((__, j) => (
        <td key={j} className="border-t border-slate-100 px-4 py-3.5">
          <div className="h-3 w-full max-w-[120px] animate-pulse rounded bg-slate-100" />
        </td>
      ))}
    </tr>
  ));
}
