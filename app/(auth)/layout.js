// Auth Layout: kartu form di tengah layar
export default function AuthLayout({ children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10">
      {/* hiasan latar lembut */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-teal-100/60 blur-3xl" />
      <div className="relative w-full max-w-md">
        {children}
        <p className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} BankSampah · Teknik Informatika UNUGIRI Bojonegoro
        </p>
      </div>
    </div>
  );
}
