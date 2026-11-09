"use client";

import { CheckCircle2, Printer } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useUser } from "@/components/layout/DashboardShell";
import { formatBerat, formatRupiah, formatTanggal } from "@/lib/format";
import { cetakNota } from "@/lib/cetakNota";

// Struk / bukti transaksi setelah setoran atau penarikan tersimpan
export default function StrukModal({ struk, onTutup }) {
  const { profile } = useUser();
  if (!struk) return null;
  const setoran = struk.jenis === "setoran";

  const Baris = ({ label, nilai, tebal }) => (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`text-right ${tebal ? "font-semibold text-slate-900" : "text-slate-800"}`}>{nilai}</span>
    </div>
  );

  return (
    <Modal
      buka
      onTutup={onTutup}
      judul={setoran ? "Setoran Berhasil" : "Penarikan Berhasil"}
      footer={
        <>
          <Button variant="outline" onClick={onTutup}>
            Transaksi Baru
          </Button>
          <Button onClick={() => cetakNota(struk, profile?.nama)}>
            <Printer className="h-4 w-4" /> Cetak Nota
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center pb-4 text-center">
        <span className={`flex h-12 w-12 items-center justify-center rounded-full ${setoran ? "bg-emerald-50" : "bg-amber-50"}`}>
          <CheckCircle2 className={`h-7 w-7 ${setoran ? "text-emerald-600" : "text-amber-600"}`} />
        </span>
        <p className="mt-2 text-xs text-slate-500">{setoran ? "Total nilai setoran" : "Uang tunai diserahkan"}</p>
        <p className={`text-3xl font-bold ${setoran ? "text-emerald-700" : "text-amber-700"}`}>
          {formatRupiah(setoran ? struk.total_nilai : struk.jumlah)}
        </p>
      </div>

      <div className="divide-y divide-dashed divide-slate-200 rounded-lg border border-dashed border-slate-300 px-4 py-2">
        <div>
          <Baris label="Kode transaksi" nilai={<span className="font-mono text-xs">{struk.kode}</span>} />
          <Baris label="Tanggal" nilai={formatTanggal(struk.tanggal, true)} />
          <Baris label="Nasabah" nilai={`${struk.nama_nasabah} (${struk.kode_nasabah})`} />
          <Baris label="Petugas" nilai={profile?.nama || "-"} />
        </div>

        {setoran && (
          <div className="py-1">
            {struk.items.map((it, i) => (
              <div key={i} className="flex justify-between gap-4 py-1 text-sm">
                <span className="text-slate-700">
                  {it.nama} <span className="text-slate-400">· {formatBerat(it.berat)} × {formatRupiah(it.harga)}</span>
                </span>
                <span className="text-slate-800">{formatRupiah(it.subtotal)}</span>
              </div>
            ))}
            <Baris label="Total berat" nilai={formatBerat(struk.total_berat)} tebal />
          </div>
        )}
        {!setoran && struk.keterangan && (
          <div>
            <Baris label="Keterangan" nilai={struk.keterangan} />
          </div>
        )}

        <div>
          <Baris label="Saldo sebelumnya" nilai={formatRupiah(struk.saldo_lama)} />
          <Baris label="Saldo sekarang" nilai={formatRupiah(struk.saldo_baru)} tebal />
        </div>
      </div>
    </Modal>
  );
}
