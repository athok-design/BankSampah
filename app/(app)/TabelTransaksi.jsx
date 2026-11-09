import { Loader2, Printer } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { Table, Th, Td, BarisKosong, BarisMemuat } from "@/components/ui/Table";
import { formatRupiah, formatTanggal } from "@/lib/format";

// Tabel transaksi bersama (dashboard petugas, dashboard nasabah, laporan, riwayat)
// kolom: daftar kolom yang ditampilkan
// onCetak(t): jika diisi, muncul tombol "Nota" di tiap baris; sedangCetak = "tipe-id" yang sedang diproses
export default function TabelTransaksi({
  data,
  memuat,
  kolom: kolomDasar = ["tanggal", "kode", "nasabah", "tipe", "nominal"],
  teksKosong = "Belum ada transaksi.",
  onCetak,
  sedangCetak,
}) {
  const kolom = onCetak ? [...kolomDasar, "cetak"] : kolomDasar;
  const judul = {
    tanggal: "Tanggal",
    kode: "Kode Transaksi",
    nasabah: "Nasabah",
    tipe: "Jenis Transaksi",
    rincian: "Rincian",
    nominal: "Nominal",
    cetak: "Nota",
  };

  return (
    <Table>
      <thead>
        <tr>
          {kolom.map((k) => (
            <Th key={k} className={k === "nominal" ? "text-right" : k === "cetak" ? "no-print text-center" : ""}>
              {judul[k]}
            </Th>
          ))}
        </tr>
      </thead>
      <tbody>
        {memuat ? (
          <BarisMemuat kolom={kolom.length} />
        ) : data.length === 0 ? (
          <BarisKosong kolom={kolom.length} teks={teksKosong} />
        ) : (
          data.map((t) => (
            <tr key={`${t.tipe}-${t.id}`} className="hover:bg-slate-50/60">
              {kolom.map((k) => {
                if (k === "tanggal") return <Td key={k} className="whitespace-nowrap">{formatTanggal(t.tanggal, true)}</Td>;
                if (k === "kode") return <Td key={k} className="whitespace-nowrap font-mono text-xs text-slate-500">{t.kode}</Td>;
                if (k === "nasabah")
                  return (
                    <Td key={k}>
                      <p className="font-medium text-slate-800">{t.nama_nasabah}</p>
                      <p className="text-xs text-slate-400">{t.kode_nasabah}</p>
                    </Td>
                  );
                if (k === "tipe") return <Td key={k}><Badge tipe={t.tipe} /></Td>;
                if (k === "rincian") return <Td key={k} className="min-w-[200px] text-slate-600">{t.rincian}</Td>;
                if (k === "nominal")
                  return (
                    <Td
                      key={k}
                      className={`whitespace-nowrap text-right font-semibold ${
                        t.tipe === "setoran" ? "text-emerald-700" : "text-amber-700"
                      }`}
                    >
                      {t.tipe === "setoran" ? "+" : "−"}
                      {formatRupiah(t.nominal)}
                    </Td>
                  );
                if (k === "cetak") {
                  const proses = sedangCetak === `${t.tipe}-${t.id}`;
                  return (
                    <Td key={k} className="no-print text-center">
                      <button
                        type="button"
                        onClick={() => onCetak(t)}
                        disabled={proses}
                        title={`Cetak nota ${t.kode}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-60"
                      >
                        {proses ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Printer className="h-3.5 w-3.5" />}
                        Cetak
                      </button>
                    </Td>
                  );
                }
                return null;
              })}
            </tr>
          ))
        )}
      </tbody>
    </Table>
  );
}
