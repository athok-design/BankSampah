
// Mengambil data lengkap satu transaksi dari database untuk dicetak ulang sebagai nota.
// tipe: "setoran" | "penarikan", id: id transaksi
export async function ambilNota(supabase, tipe, id) {
  const setoran = tipe === "setoran";

  const { data: t, error } = setoran
    ? await supabase
        .from("setoran")
        .select(
          "id, kode_setoran, tanggal, total_berat, total_nilai, nasabah_id, " +
            "nasabah(nama, kode_nasabah, saldo), petugas:profiles(nama), " +
            "detail_setoran(id, berat, harga_per_kg, subtotal, jenis_sampah(nama_sampah))"
        )
        .eq("id", id)
        .single()
    : await supabase
        .from("penarikan")
        .select("id, kode_penarikan, tanggal, jumlah, keterangan, nasabah_id, nasabah(nama, kode_nasabah, saldo), petugas:profiles(nama)")
        .eq("id", id)
        .single();

  if (error) throw error;

  // Saldo setelah transaksi ini = saldo sekarang − setoran sesudahnya + penarikan sesudahnya
  const { data: sesudah, error: err2 } = await supabase
    .from("v_transaksi")
    .select("tipe, nominal")
    .eq("nasabah_id", t.nasabah_id)
    .gt("tanggal", t.tanggal);
  if (err2) throw err2;

  const geser = (sesudah ?? []).reduce(
    (s, x) => s + (x.tipe === "setoran" ? -Number(x.nominal) : Number(x.nominal)),
    0
  );
  const saldoBaru = Number(t.nasabah?.saldo ?? 0) + geser;
  const nilai = setoran ? Number(t.total_nilai) : Number(t.jumlah);
  const saldoLama = setoran ? saldoBaru - nilai : saldoBaru + nilai;

  const umum = {
    jenis: tipe,
    tanggal: t.tanggal,
    nama_nasabah: t.nasabah?.nama ?? "-",
    kode_nasabah: t.nasabah?.kode_nasabah ?? "-",
    saldo_lama: saldoLama,
    saldo_baru: saldoBaru,
    petugas: t.petugas?.nama ?? "-",
  };

  if (setoran) {
    return {
      ...umum,
      kode: t.kode_setoran,
      total_berat: Number(t.total_berat),
      total_nilai: nilai,
      items: [...(t.detail_setoran ?? [])]
        .sort((a, b) => a.id - b.id)
        .map((d) => ({
          nama: d.jenis_sampah?.nama_sampah ?? "-",
          berat: Number(d.berat),
          harga: Number(d.harga_per_kg),
          subtotal: Number(d.subtotal),
        })),
    };
  }
  return { ...umum, kode: t.kode_penarikan, jumlah: nilai, keterangan: t.keterangan };
}

