"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { kelasInput } from "@/components/ui/Field";

// Input password dengan tombol mata (show/hide)
export default function PasswordInput({ id, value, onChange, placeholder = "••••••••", autoComplete, error }) {
  const [lihat, setLihat] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={lihat ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`${kelasInput} pr-10 ${error ? "border-rose-400" : ""}`}
      />
      <button
        type="button"
        onClick={() => setLihat((l) => !l)}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-400 hover:text-slate-600"
        aria-label={lihat ? "Sembunyikan password" : "Tampilkan password"}
      >
        {lihat ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
