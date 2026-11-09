# BankSampah — Menabung Menjaga Lingkungan

Aplikasi web bank sampah (UTS Pemrograman Web Berbasis Framework)
Next.js 15 · Tailwind CSS 4 · Supabase (PostgreSQL + Auth)

Miftakhul Khoir (251101027) · Muhamad Atho'urrohman Annawas (251101031)
Teknik Informatika — UNUGIRI Bojonegoro

---

## Cara menjalankan

### 1. Siapkan Supabase
1. Buat project di https://supabase.com
2. **SQL Editor → New query** → tempel isi `supabase/schema.sql` → **Run**
3. **Authentication → Sign In / Providers → Email**: pastikan **Confirm email = ON**
4. **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: tambahkan `http://localhost:3000/auth/callback`
5. Buat akun petugas: **Authentication → Users → Add user** (centang *Auto Confirm User*),
   lalu jalankan `supabase/jadikan-petugas.sql` (ganti emailnya dulu).

### 2. Isi kunci API
Salin `.env.local.example` menjadi `.env.local`, lalu isi dari **Project Settings → API**:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
> Jangan pernah menaruh `service_role` key di aplikasi ini.

### 3. Jalankan
```bash
npm install
npm run dev
```
Buka http://localhost:3000

---

## Halaman

| No | Halaman | URL | Role |
|----|---------|-----|------|
| 1 | Login | `/login` | publik |
| 2 | Buat Akun | `/daftar` | publik |
| 3 | Dashboard Petugas | `/dashboard` | petugas |
| 4 | Data Nasabah | `/nasabah` | petugas |
| 5 | Jenis Sampah | `/jenis-sampah` | petugas |
| 6 | Transaksi Setoran | `/setoran/baru` | petugas |
| 7 | Transaksi Penarikan | `/penarikan/baru` | petugas |
| 8 | Laporan | `/laporan` | petugas |
| 9 | Dashboard Nasabah | `/nasabah/dashboard` | nasabah |
| 10 | Riwayat Transaksi | `/nasabah/riwayat` | nasabah |
| + | Edit Profil | `/profil` | semua (klik avatar di kanan atas) |

## Struktur folder
```
app/
  (auth)/login, (auth)/daftar     → Auth Layout (form di tengah)
  (app)/...                        → Dashboard Layout (sidebar + topbar)
  auth/callback/route.js           → verifikasi link email
components/
  layout/  Sidebar, Navbar (menu profil: Edit Profil + Logout), DashboardShell
  ui/      Button, Badge, StatCard, Modal, Field, Card, Table, Toast, NasabahPicker
lib/       supabase client/server, format Rupiah & tanggal
middleware.js                      → cek login & role tiap halaman
supabase/schema.sql                → tabel, trigger, RLS, fungsi transaksi
```

## Catatan perbedaan dengan proposal
- Tabel `nasabah` ditambah kolom **nama** dan **email** (agar nasabah tanpa akun tetap punya nama,
  dan otomatis tertaut saat nanti mendaftar sendiri dengan email yang sama).
- Verifikasi email **aktif** (mengikuti dokumen Panduan & Swimlane). Batasan masalah no. 4 di proposal perlu disesuaikan.
# BankSampah
