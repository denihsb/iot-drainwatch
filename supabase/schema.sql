-- DrainWatch — skema Supabase
-- Jalankan di Supabase Dashboard > SQL Editor.
-- Frontend hanya membaca (anon). Penulisan dilakukan oleh Edge Function `ingest`
-- memakai service role (dikerjakan terpisah, bukan bagian repo web).

-- ============ TABEL ============

create table if not exists devices (
  id               text primary key,
  name             text,
  last_seen        timestamptz,
  rssi             int,
  firmware_version text,
  status           text
);

create table if not exists device_config (
  device_id            text primary key references devices(id) on delete cascade,
  sensor_height_cm     numeric not null default 20,
  level_waspada_cm     numeric not null default 7,
  level_bahaya_cm      numeric not null default 10,
  rate_waspada_cm_min  numeric not null default 0.5,
  rate_bahaya_cm_min   numeric not null default 1.5,
  window_sec           int     not null default 90,
  interval_normal_sec  int     not null default 10,
  interval_alert_sec   int     not null default 3
);
-- Catatan: nilai default di atas hanya placeholder; ganti setelah kalibrasi.

create table if not exists readings (
  id          bigint generated always as identity primary key,
  device_id   text not null references devices(id) on delete cascade,
  measured_at timestamptz not null,
  distance_cm numeric,
  level_cm    numeric,
  rate_cm_min numeric,
  status      text not null check (status in ('NORMAL','WASPADA','BAHAYA','SENSOR_FAULT')),
  sensor_ok   boolean not null default true,
  rssi        int
);

create index if not exists readings_device_time_idx
  on readings (device_id, measured_at desc);

-- ============ KEAMANAN (RLS) ============
-- Hanya SELECT untuk anon. Tidak ada policy INSERT/UPDATE/DELETE,
-- sehingga frontend tidak dapat menulis. Service role mem-bypass RLS.

alter table devices       enable row level security;
alter table device_config enable row level security;
alter table readings      enable row level security;

drop policy if exists "anon read devices"  on devices;
drop policy if exists "anon read config"   on device_config;
drop policy if exists "anon read readings" on readings;

create policy "anon read devices"  on devices       for select to anon using (true);
create policy "anon read config"   on device_config for select to anon using (true);
create policy "anon read readings" on readings      for select to anon using (true);

-- ============ REALTIME ============
-- Jika perintah ini error karena tabel sudah ada di publication, abaikan.
alter publication supabase_realtime add table readings;
alter publication supabase_realtime add table devices;

-- ============ DATA AWAL ============
insert into devices (id, name)
values ('drainwatch-01', 'DrainWatch Prototipe')
on conflict (id) do nothing;

insert into device_config (device_id)
values ('drainwatch-01')
on conflict (device_id) do nothing;

-- ============ DATA UJI (opsional, untuk menguji mode Supabase tanpa perangkat) ============
-- Sisipkan satu baris; lihat apakah dashboard menampilkannya secara real-time:
--
-- insert into readings (device_id, measured_at, distance_cm, level_cm, rate_cm_min, status, sensor_ok, rssi)
-- values ('drainwatch-01', now(), 14.0, 6.0, 0.4, 'NORMAL', true, -60);
--
-- update devices set last_seen = now(), rssi = -60, firmware_version = 'test' where id = 'drainwatch-01';
--
-- Hapus data uji:
-- delete from readings where device_id = 'drainwatch-01';
