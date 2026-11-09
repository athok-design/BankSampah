"use client";

import { Search } from "lucide-react";
import Button from "@/components/ui/Button";
import { Label, kelasInput } from "@/components/ui/Field";

// Bar filter: rentang tanggal + jenis transaksi (+ cari nasabah untuk petugas)
export default function FilterTransaksi({ filter, setFilter, onTampilkan, memuat, denganCari = false, aksiTambahan }) {
  const ubah = (k) => (e) => setFilter((f) => ({ ...f, [k]: e.target.value }));
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onTampilkan();
      }}
      className="no-print flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="w-full sm:w-40">
        <Label htmlFor="dari">Dari tanggal</Label>
        <input id="dari" type="date" value={filter.dari} max={filter.sampai} onChange={ubah("dari")} className={kelasInput} />
      </div>
      <div className="w-full sm:w-40">
        <Label htmlFor="sampai">Sampai tanggal</Label>
        <input id="sampai" type="date" value={filter.sampai} min={filter.dari} onChange={ubah("sampai")} className={kelasInput} />
      </div>
      <div className="w-full sm:w-40">
        <Label htmlFor="tipe">Jenis transaksi</Label>
        <select id="tipe" value={filter.tipe} onChange={ubah("tipe")} className={kelasInput}>
          <option value="semua">Semua</option>
          <option value="setoran">Setoran</option>
          <option value="penarikan">Penarikan</option>
        </select>
      </div>
      {denganCari && (
        <div className="min-w-[180px] flex-1">
          <Label htmlFor="cari">Nasabah</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input id="cari" value={filter.cari} onChange={ubah("cari")} placeholder="Nama / kode nasabah" className={`${kelasInput} pl-9`} />
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <Button type="submit" loading={memuat}>
          Tampilkan
        </Button>
        {aksiTambahan}
      </div>
    </form>
  );
}
