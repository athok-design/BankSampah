// Input form dengan label, teks bantuan & pesan error
export const kelasInput =
  "block w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 " +
  "focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50 disabled:text-slate-500";

export function Label({ htmlFor, children, wajib }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-slate-600">
      {children}
      {wajib && <span className="text-rose-500"> *</span>}
    </label>
  );
}

export default function Field({ label, id, wajib, bantuan, error, className = "", children, ...props }) {
  return (
    <div className={className}>
      {label && (
        <Label htmlFor={id} wajib={wajib}>
          {label}
        </Label>
      )}
      {children ?? (
        <input
          id={id}
          className={`${kelasInput} ${error ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20" : ""}`}
          {...props}
        />
      )}
      {error ? (
        <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>
      ) : (
        bantuan && <p className="mt-1 text-xs text-slate-400">{bantuan}</p>
      )}
    </div>
  );
}
