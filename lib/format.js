// Fungsi bantu format angka & tanggal (gaya Indonesia)

export function formatRupiah(angka) {
  const n = Number(angka) || 0;
  return "Rp" + n.toLocaleString("id-ID", { maximumFractionDigits: 0 });
}

export function formatBerat(angka) {
  const n = Number(angka) || 0;
  return n.toLocaleString("id-ID", { maximumFractionDigits: 2 }) + " kg";
}

export function formatTanggal(iso, denganJam = false) {
  if (!iso) return "-";
  const opsi = { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Jakarta" };
  if (denganJam) {
    opsi.hour = "2-digit";
    opsi.minute = "2-digit";
  }
  return new Date(iso).toLocaleString("id-ID", opsi);
}

// "1,5" atau "1.5" -> 1.5
export function parseAngka(teks) {
  if (teks === null || teks === undefined) return 0;
  const bersih = String(teks).replace(/\s/g, "").replace(",", ".");
  const n = parseFloat(bersih);
  return Number.isFinite(n) ? n : 0;
}

// Tanggal hari ini dalam format YYYY-MM-DD (zona Asia/Jakarta) untuk input date
export function hariIni() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

export function awalBulanIni() {
  return hariIni().slice(0, 8) + "01";
}

// Batas rentang tanggal (WIB) -> ISO untuk query
export function awalHari(tgl) {
  return new Date(`${tgl}T00:00:00+07:00`).toISOString();
}
export function akhirHari(tgl) {
  return new Date(`${tgl}T23:59:59.999+07:00`).toISOString();
}

// Ubah pesan error Supabase/Postgres jadi kalimat yang ramah
export function pesanError(error) {
  if (!error) return "";
  const msg = error.message || String(error);
  if (msg.includes("duplicate key") && msg.includes("nama_sampah")) return "Nama jenis sampah sudah ada.";
  if (msg.includes("duplicate key")) return "Data sudah ada.";
  if (msg.includes("Failed to fetch")) return "Gagal terhubung ke server. Periksa koneksi internet.";
  return msg;
}
