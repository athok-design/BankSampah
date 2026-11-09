import { formatBerat, formatRupiah, formatTanggal } from "./format";

// Escape teks agar aman dimasukkan ke HTML nota
const esc = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Membuat HTML nota (lebar ±80mm: cocok untuk printer struk maupun kertas A4/HVS)
function htmlNota(struk, namaPetugas, ulang = false) {
  const setoran = struk.jenis === "setoran";
  const origin = window.location.origin;

  const baris = (label, nilai, tebal = false) =>
    `<tr><td class="l">${esc(label)}</td><td class="r${tebal ? " b" : ""}">${esc(nilai)}</td></tr>`;

  const rincian = setoran
    ? `
      <table class="items">
        <thead><tr><th>Jenis</th><th class="r">Berat</th><th class="r">Subtotal</th></tr></thead>
        <tbody>
          ${struk.items
            .map(
              (it) => `
            <tr>
              <td>${esc(it.nama)}<div class="kecil">@ ${esc(formatRupiah(it.harga))}/kg</div></td>
              <td class="r">${esc(formatBerat(it.berat))}</td>
              <td class="r">${esc(formatRupiah(it.subtotal))}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
      <div class="garis"></div>
      <table>
        ${baris("Total Berat", formatBerat(struk.total_berat), true)}
        ${baris("TOTAL SETORAN", formatRupiah(struk.total_nilai), true)}
      </table>`
    : `
      <table>
        ${baris("Jumlah Penarikan", formatRupiah(struk.jumlah), true)}
        ${struk.keterangan ? baris("Keterangan", struk.keterangan) : ""}
      </table>`;

  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<title>Nota ${esc(struk.kode)}</title>
<style>
  @page { margin: 6mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: "Courier New", ui-monospace, monospace; color: #000; font-size: 11.5px; }
  .nota { width: 76mm; margin: 0 auto; padding: 2mm 0; }
  .kop { text-align: center; }
  .kop img { width: 40px; height: auto; }
  .kop .nama { font-family: Arial, sans-serif; font-size: 17px; font-weight: 700; margin-top: 2px; }
  .kop .tag { font-size: 10px; }
  .judul { text-align: center; font-weight: 700; font-size: 13px; letter-spacing: 1px; margin: 6px 0 2px; }
  .garis { border-top: 1px dashed #000; margin: 6px 0; }
  table { width: 100%; border-collapse: collapse; }
  td, th { padding: 1.5px 0; vertical-align: top; }
  th { text-align: left; font-weight: 700; border-bottom: 1px dashed #000; padding-bottom: 3px; }
  .items td { padding: 3px 0; }
  .l { width: 45%; }
  .r { text-align: right; }
  .b { font-weight: 700; }
  .kecil { font-size: 10px; }
  .ttd { display: flex; justify-content: space-between; margin-top: 10px; text-align: center; font-size: 10.5px; }
  .ttd > div { width: 46%; }
  .ttd .ruang { height: 38px; }
  .ttd .nm { border-top: 1px solid #000; padding-top: 2px; }
  .ulang { text-align: center; font-size: 10px; }
  .kaki { text-align: center; font-size: 10px; margin-top: 10px; }
</style>
</head>
<body>
  <div class="nota">
    <div class="kop">
      <img src="${origin}/logo.png" alt="" />
      <div class="nama">BankSampah</div>
      <div class="tag">Menabung Menjaga Lingkungan</div>
    </div>
    <div class="garis"></div>
    <div class="judul">${setoran ? "NOTA SETORAN SAMPAH" : "NOTA PENARIKAN SALDO"}</div>
    ${ulang ? `<div class="ulang">(SALINAN — dicetak ulang ${esc(formatTanggal(new Date().toISOString(), true))})</div>` : ""}
    <div class="garis"></div>
    <table>
      ${baris("No. Transaksi", struk.kode)}
      ${baris("Tanggal", formatTanggal(struk.tanggal, true))}
      ${baris("Nasabah", struk.nama_nasabah)}
      ${baris("Kode Nasabah", struk.kode_nasabah)}
      ${baris("Petugas", namaPetugas || "-")}
    </table>
    <div class="garis"></div>
    ${rincian}
    <div class="garis"></div>
    <table class="saldo">
      ${baris("Saldo Sebelumnya", formatRupiah(struk.saldo_lama))}
      ${baris(setoran ? "Bertambah" : "Berkurang", (setoran ? "+ " : "- ") + formatRupiah(setoran ? struk.total_nilai : struk.jumlah))}
      ${baris("Saldo Sekarang", formatRupiah(struk.saldo_baru), true)}
    </table>
    <div class="garis"></div>
    <div class="ttd">
      <div>Petugas<div class="ruang"></div><div class="nm">${esc(namaPetugas || "")}&nbsp;</div></div>
      <div>${setoran ? "Penyetor" : "Penerima"}<div class="ruang"></div><div class="nm">${esc(struk.nama_nasabah)}</div></div>
    </div>
    <div class="kaki">
      Simpan nota ini sebagai bukti transaksi yang sah.<br />
      Terima kasih telah menjaga lingkungan!
    </div>
  </div>
</body>
</html>`;
}

// Cetak nota lewat iframe tersembunyi agar halaman aplikasi tidak ikut tercetak
// ulang = true untuk cetak ulang dari halaman Laporan (diberi tanda SALINAN)
export function cetakNota(struk, namaPetugas, ulang = false) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  doc.open();
  doc.write(htmlNota(struk, namaPetugas, ulang));
  doc.close();

  const win = iframe.contentWindow;
  const bersihkan = () => setTimeout(() => iframe.remove(), 500);
  let sudah = false;
  const cetak = () => {
    if (sudah) return;
    sudah = true;
    win.focus();
    win.addEventListener("afterprint", bersihkan);
    win.print();
    setTimeout(bersihkan, 60000); // cadangan jika afterprint tidak terpanggil
  };

  // tunggu logo termuat dulu supaya ikut tercetak
  const img = doc.querySelector("img");
  if (img && !img.complete) {
    img.onload = cetak;
    img.onerror = cetak;
    setTimeout(cetak, 1500);
  } else {
    setTimeout(cetak, 50);
  }
}
