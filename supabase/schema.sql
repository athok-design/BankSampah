-- =====================================================================
-- BankSampah - Skema Database Supabase
-- Cara pakai: buka Supabase Dashboard > SQL Editor > New query,
-- tempel SELURUH isi file ini, lalu klik "Run". Aman dijalankan sekali.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. TABEL
-- ---------------------------------------------------------------------

-- profiles: 1 baris per akun Supabase Auth (nama + role)
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  nama        text not null default '',
  role        text not null default 'nasabah' check (role in ('petugas', 'nasabah')),
  created_at  timestamptz not null default now()
);

-- nasabah: data tabungan. profile_id kosong (NULL) jika didaftarkan petugas tanpa akun.
-- Catatan: kolom nama & email DITAMBAHKAN dibanding ERD proposal, supaya nasabah
-- tanpa akun tetap punya nama, dan bisa ditautkan saat nanti daftar sendiri.
create table if not exists public.nasabah (
  id            bigint generated always as identity primary key,
  profile_id    uuid unique references public.profiles (id) on delete set null,
  kode_nasabah  text unique,
  nama          text not null,
  email         text,
  alamat        text,
  no_hp         text,
  saldo         numeric(12,2) not null default 0 check (saldo >= 0),
  aktif         boolean not null default true,
  created_at    timestamptz not null default now()
);

create table if not exists public.jenis_sampah (
  id            bigint generated always as identity primary key,
  nama_sampah   text not null unique,
  harga_per_kg  numeric(10,2) not null check (harga_per_kg > 0),
  aktif         boolean not null default true,
  created_at    timestamptz not null default now()
);

create table if not exists public.setoran (
  id            bigint generated always as identity primary key,
  kode_setoran  text unique,
  nasabah_id    bigint not null references public.nasabah (id),
  petugas_id    uuid references public.profiles (id),
  tanggal       timestamptz not null default now(),
  total_berat   numeric(8,2) not null default 0,
  total_nilai   numeric(12,2) not null default 0
);

create table if not exists public.detail_setoran (
  id               bigint generated always as identity primary key,
  setoran_id       bigint not null references public.setoran (id) on delete cascade,
  jenis_sampah_id  bigint not null references public.jenis_sampah (id),
  berat            numeric(8,2) not null check (berat > 0),
  harga_per_kg     numeric(10,2) not null,   -- snapshot harga saat transaksi
  subtotal         numeric(12,2) not null
);

create table if not exists public.penarikan (
  id              bigint generated always as identity primary key,
  kode_penarikan  text unique,
  nasabah_id      bigint not null references public.nasabah (id),
  petugas_id      uuid references public.profiles (id),
  tanggal         timestamptz not null default now(),
  jumlah          numeric(12,2) not null check (jumlah > 0),
  keterangan      text
);

create index if not exists idx_setoran_tanggal   on public.setoran (tanggal desc);
create index if not exists idx_penarikan_tanggal on public.penarikan (tanggal desc);
create index if not exists idx_setoran_nasabah   on public.setoran (nasabah_id);
create index if not exists idx_penarikan_nasabah on public.penarikan (nasabah_id);
create index if not exists idx_detail_setoran    on public.detail_setoran (setoran_id);
create index if not exists idx_nasabah_email     on public.nasabah (lower(email));

-- ---------------------------------------------------------------------
-- 2. FUNGSI BANTU (role & kepemilikan)
-- ---------------------------------------------------------------------

create or replace function public.is_petugas()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'petugas');
$$;

create or replace function public.my_nasabah_id()
returns bigint
language sql stable security definer set search_path = public
as $$
  select id from nasabah where profile_id = auth.uid();
$$;

-- ---------------------------------------------------------------------
-- 3. KODE OTOMATIS (NSB-001, STR-20261109-0001, PNR-20261109-0001)
-- ---------------------------------------------------------------------

create or replace function public.set_kode_nasabah()
returns trigger language plpgsql as $$
begin
  if new.kode_nasabah is null then
    new.kode_nasabah := 'NSB-' || lpad(new.id::text, 3, '0');
  end if;
  return new;
end $$;

drop trigger if exists trg_kode_nasabah on public.nasabah;
create trigger trg_kode_nasabah before insert on public.nasabah
  for each row execute function public.set_kode_nasabah();

create or replace function public.set_kode_setoran()
returns trigger language plpgsql as $$
begin
  if new.kode_setoran is null then
    new.kode_setoran := 'STR-' || to_char(new.tanggal at time zone 'Asia/Jakarta', 'YYYYMMDD')
                        || '-' || lpad(new.id::text, 4, '0');
  end if;
  return new;
end $$;

drop trigger if exists trg_kode_setoran on public.setoran;
create trigger trg_kode_setoran before insert on public.setoran
  for each row execute function public.set_kode_setoran();

create or replace function public.set_kode_penarikan()
returns trigger language plpgsql as $$
begin
  if new.kode_penarikan is null then
    new.kode_penarikan := 'PNR-' || to_char(new.tanggal at time zone 'Asia/Jakarta', 'YYYYMMDD')
                          || '-' || lpad(new.id::text, 4, '0');
  end if;
  return new;
end $$;

drop trigger if exists trg_kode_penarikan on public.penarikan;
create trigger trg_kode_penarikan before insert on public.penarikan
  for each row execute function public.set_kode_penarikan();

-- ---------------------------------------------------------------------
-- 4. TRIGGER BUAT AKUN
-- Saat akun baru dibuat di Supabase Auth:
--   - buat baris profiles (role nasabah)
--   - jika petugas sudah pernah mendaftarkan nasabah dengan email yang sama
--     dan belum punya akun -> TAUTKAN (saldo & riwayat lama tetap)
--   - jika tidak -> buat baris nasabah baru (kode otomatis, saldo 0)
-- ---------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_nama   text := coalesce(nullif(new.raw_user_meta_data ->> 'nama', ''), split_part(new.email, '@', 1));
  v_hp     text := nullif(new.raw_user_meta_data ->> 'no_hp', '');
  v_alamat text := nullif(new.raw_user_meta_data ->> 'alamat', '');
  v_id     bigint;
begin
  insert into profiles (id, nama, role) values (new.id, v_nama, 'nasabah')
  on conflict (id) do nothing;

  select id into v_id
  from nasabah
  where profile_id is null and email is not null and lower(email) = lower(new.email)
  order by id limit 1;

  if v_id is not null then
    update nasabah
       set profile_id = new.id,
           no_hp  = coalesce(no_hp, v_hp),
           alamat = coalesce(alamat, v_alamat)
     where id = v_id;
  else
    insert into nasabah (profile_id, nama, email, no_hp, alamat)
    values (new.id, v_nama, new.email, v_hp, v_alamat);
  end if;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 5. VIEW GABUNGAN TRANSAKSI (dipakai dashboard, laporan, riwayat)
-- security_invoker = true -> RLS tabel asli tetap berlaku
-- ---------------------------------------------------------------------

create or replace view public.v_transaksi
with (security_invoker = true) as
select
  'setoran'::text           as tipe,
  s.id,
  s.kode_setoran            as kode,
  s.tanggal,
  s.nasabah_id,
  n.kode_nasabah,
  n.nama                    as nama_nasabah,
  s.total_berat,
  s.total_nilai             as nominal,
  (select string_agg(js.nama_sampah || ' ' || replace(trim_scale(d.berat)::text, '.', ',') || ' kg', ', ' order by d.id)
     from detail_setoran d join jenis_sampah js on js.id = d.jenis_sampah_id
    where d.setoran_id = s.id) as rincian
from setoran s
join nasabah n on n.id = s.nasabah_id
union all
select
  'penarikan'::text,
  p.id,
  p.kode_penarikan,
  p.tanggal,
  p.nasabah_id,
  n.kode_nasabah,
  n.nama,
  0::numeric,
  p.jumlah,
  coalesce(nullif(p.keterangan, ''), 'Penarikan tunai')
from penarikan p
join nasabah n on n.id = p.nasabah_id;

-- ---------------------------------------------------------------------
-- 6. FUNGSI TRANSAKSI ATOMIK (dipanggil via supabase.rpc)
-- ---------------------------------------------------------------------

-- p_items contoh: [{"jenis_sampah_id": 1, "berat": 5}, {"jenis_sampah_id": 2, "berat": 1.5}]
create or replace function public.simpan_setoran(p_nasabah_id bigint, p_items jsonb)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_nasabah  nasabah%rowtype;
  v_setoran  setoran%rowtype;
  v_item     jsonb;
  v_jenis    jenis_sampah%rowtype;
  v_berat    numeric;
  v_sub      numeric;
  v_tberat   numeric := 0;
  v_tnilai   numeric := 0;
begin
  if not is_petugas() then
    raise exception 'Hanya petugas yang dapat mencatat setoran';
  end if;

  select * into v_nasabah from nasabah where id = p_nasabah_id for update;
  if not found then raise exception 'Nasabah tidak ditemukan'; end if;
  if not v_nasabah.aktif then raise exception 'Nasabah sudah nonaktif'; end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Setoran minimal berisi satu item sampah';
  end if;

  insert into setoran (nasabah_id, petugas_id) values (p_nasabah_id, auth.uid())
  returning * into v_setoran;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_berat := (v_item ->> 'berat')::numeric;
    if v_berat is null or v_berat <= 0 then
      raise exception 'Berat sampah harus lebih dari 0';
    end if;

    select * into v_jenis from jenis_sampah where id = (v_item ->> 'jenis_sampah_id')::bigint;
    if not found then raise exception 'Jenis sampah tidak ditemukan'; end if;
    if not v_jenis.aktif then raise exception 'Jenis sampah % sudah nonaktif', v_jenis.nama_sampah; end if;

    v_sub := round(v_berat * v_jenis.harga_per_kg, 2);   -- harga diambil dari DB, bukan dari klien
    insert into detail_setoran (setoran_id, jenis_sampah_id, berat, harga_per_kg, subtotal)
    values (v_setoran.id, v_jenis.id, v_berat, v_jenis.harga_per_kg, v_sub);

    v_tberat := v_tberat + v_berat;
    v_tnilai := v_tnilai + v_sub;
  end loop;

  update setoran set total_berat = v_tberat, total_nilai = v_tnilai where id = v_setoran.id;
  update nasabah set saldo = saldo + v_tnilai where id = p_nasabah_id;

  return jsonb_build_object(
    'id', v_setoran.id,
    'kode', v_setoran.kode_setoran,
    'tanggal', v_setoran.tanggal,
    'nama_nasabah', v_nasabah.nama,
    'kode_nasabah', v_nasabah.kode_nasabah,
    'total_berat', v_tberat,
    'total_nilai', v_tnilai,
    'saldo_lama', v_nasabah.saldo,
    'saldo_baru', v_nasabah.saldo + v_tnilai
  );
end $$;

create or replace function public.simpan_penarikan(p_nasabah_id bigint, p_jumlah numeric, p_keterangan text default null)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_nasabah    nasabah%rowtype;
  v_penarikan  penarikan%rowtype;
begin
  if not is_petugas() then
    raise exception 'Hanya petugas yang dapat mencatat penarikan';
  end if;

  select * into v_nasabah from nasabah where id = p_nasabah_id for update;
  if not found then raise exception 'Nasabah tidak ditemukan'; end if;
  if not v_nasabah.aktif then raise exception 'Nasabah sudah nonaktif'; end if;

  if p_jumlah is null or p_jumlah <= 0 then
    raise exception 'Jumlah penarikan harus lebih dari 0';
  end if;
  if p_jumlah > v_nasabah.saldo then
    raise exception 'Saldo tidak mencukupi';
  end if;

  insert into penarikan (nasabah_id, petugas_id, jumlah, keterangan)
  values (p_nasabah_id, auth.uid(), p_jumlah, nullif(trim(p_keterangan), ''))
  returning * into v_penarikan;

  update nasabah set saldo = saldo - p_jumlah where id = p_nasabah_id;

  return jsonb_build_object(
    'id', v_penarikan.id,
    'kode', v_penarikan.kode_penarikan,
    'tanggal', v_penarikan.tanggal,
    'nama_nasabah', v_nasabah.nama,
    'kode_nasabah', v_nasabah.kode_nasabah,
    'jumlah', p_jumlah,
    'keterangan', v_penarikan.keterangan,
    'saldo_lama', v_nasabah.saldo,
    'saldo_baru', v_nasabah.saldo - p_jumlah
  );
end $$;

-- Statistik dashboard petugas
create or replace function public.statistik_dashboard()
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
begin
  if not is_petugas() then raise exception 'Akses ditolak'; end if;
  return jsonb_build_object(
    'total_nasabah', (select count(*) from nasabah where aktif),
    'total_berat',   (select coalesce(sum(total_berat), 0) from setoran),
    'total_setoran', (select coalesce(sum(total_nilai), 0) from setoran),
    'total_saldo',   (select coalesce(sum(saldo), 0) from nasabah)
  );
end $$;

-- Edit profil oleh pengguna sendiri (role & saldo TIDAK bisa diubah lewat sini)
create or replace function public.update_profil_saya(p_nama text, p_no_hp text default null, p_alamat text default null)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Belum login'; end if;
  if p_nama is null or trim(p_nama) = '' then raise exception 'Nama wajib diisi'; end if;

  update profiles set nama = trim(p_nama) where id = auth.uid();
  update nasabah
     set nama = trim(p_nama),
         no_hp = nullif(trim(p_no_hp), ''),
         alamat = nullif(trim(p_alamat), '')
   where profile_id = auth.uid();
end $$;

-- ---------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------

alter table public.profiles       enable row level security;
alter table public.nasabah        enable row level security;
alter table public.jenis_sampah   enable row level security;
alter table public.setoran        enable row level security;
alter table public.detail_setoran enable row level security;
alter table public.penarikan      enable row level security;

-- profiles: lihat milik sendiri, petugas lihat semua. Ubah hanya lewat update_profil_saya().
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_petugas());

-- nasabah
drop policy if exists nasabah_select on public.nasabah;
create policy nasabah_select on public.nasabah for select to authenticated
  using (public.is_petugas() or profile_id = auth.uid());

drop policy if exists nasabah_insert on public.nasabah;
create policy nasabah_insert on public.nasabah for insert to authenticated
  with check (public.is_petugas());

drop policy if exists nasabah_update on public.nasabah;
create policy nasabah_update on public.nasabah for update to authenticated
  using (public.is_petugas()) with check (public.is_petugas());

-- saldo, kode & profile_id tidak boleh diubah langsung dari aplikasi
revoke insert, update on public.nasabah from authenticated, anon;
grant insert (nama, email, alamat, no_hp) on public.nasabah to authenticated;
grant update (nama, email, alamat, no_hp, aktif) on public.nasabah to authenticated;

-- jenis_sampah
drop policy if exists jenis_select on public.jenis_sampah;
create policy jenis_select on public.jenis_sampah for select to authenticated using (true);

drop policy if exists jenis_insert on public.jenis_sampah;
create policy jenis_insert on public.jenis_sampah for insert to authenticated
  with check (public.is_petugas());

drop policy if exists jenis_update on public.jenis_sampah;
create policy jenis_update on public.jenis_sampah for update to authenticated
  using (public.is_petugas()) with check (public.is_petugas());

-- transaksi: hanya bisa DIBACA. Menulis hanya lewat simpan_setoran / simpan_penarikan.
drop policy if exists setoran_select on public.setoran;
create policy setoran_select on public.setoran for select to authenticated
  using (public.is_petugas() or nasabah_id = public.my_nasabah_id());

drop policy if exists detail_select on public.detail_setoran;
create policy detail_select on public.detail_setoran for select to authenticated
  using (public.is_petugas() or exists (
    select 1 from public.setoran s where s.id = setoran_id and s.nasabah_id = public.my_nasabah_id()));

drop policy if exists penarikan_select on public.penarikan;
create policy penarikan_select on public.penarikan for select to authenticated
  using (public.is_petugas() or nasabah_id = public.my_nasabah_id());

revoke insert, update, delete on public.setoran, public.detail_setoran, public.penarikan from authenticated, anon;
revoke delete on public.nasabah, public.jenis_sampah, public.profiles from authenticated, anon;

grant select on public.v_transaksi to authenticated;
grant execute on function public.simpan_setoran(bigint, jsonb) to authenticated;
grant execute on function public.simpan_penarikan(bigint, numeric, text) to authenticated;
grant execute on function public.statistik_dashboard() to authenticated;
grant execute on function public.update_profil_saya(text, text, text) to authenticated;

-- ---------------------------------------------------------------------
-- 8. DATA AWAL JENIS SAMPAH (sesuai contoh di proposal)
-- ---------------------------------------------------------------------

insert into public.jenis_sampah (nama_sampah, harga_per_kg) values
  ('Plastik', 3000),
  ('Kardus', 2000),
  ('Besi', 4000),
  ('Kertas', 1500)
on conflict (nama_sampah) do nothing;
