-- =====================================================================
-- Menjadikan sebuah akun sebagai PETUGAS
-- 1. Buat akun dulu di Supabase Dashboard > Authentication > Users > Add user
--    (centang "Auto Confirm User").
-- 2. Ganti email di bawah, lalu Run di SQL Editor.
-- =====================================================================

update public.profiles
   set role = 'petugas',
       nama = 'Petugas BankSampah'          -- ganti dengan nama petugas
 where id = (select id from auth.users where email = 'petugas@banksampah.com');

-- Trigger buat akun otomatis membuat baris nasabah untuk setiap akun baru.
-- Petugas bukan nasabah, jadi baris itu dihapus (masih kosong, belum ada transaksi).
delete from public.nasabah
 where profile_id = (select id from auth.users where email = 'petugas@banksampah.com');
