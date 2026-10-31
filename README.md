# DrainWatch

Dashboard web React untuk memantau ketinggian air, laju kenaikan, status
perangkat, grafik, dan riwayat pembacaan DrainWatch.

## Prasyarat

- Node.js 18 atau lebih baru
- npm
- Untuk mode Supabase: project Supabase yang sudah menjalankan
  [`supabase/schema.sql`](./supabase/schema.sql)

## Menjalankan secara lokal

Instal dependency:

```powershell
npm install
```

Jalankan mode simulasi:

```powershell
npm run dev
```

Buka URL yang ditampilkan Vite. Mode simulasi aktif ketika
`VITE_USE_MOCK=true` atau ketika variabel tersebut tidak diisi. Mode ini tidak
membutuhkan perangkat atau koneksi Supabase.

## Environment

Salin [`.env.example`](./.env.example) menjadi `.env.local`, lalu sesuaikan:

| Variabel | Keterangan |
|---|---|
| `VITE_USE_MOCK` | `true` untuk simulator, `false` untuk Supabase |
| `VITE_SUPABASE_URL` | URL project Supabase |
| `VITE_SUPABASE_ANON_KEY` | Kunci publik Supabase untuk akses baca |
| `VITE_DEVICE_ID` | ID perangkat, default `drainwatch-01` |

`.env.local` hanya untuk komputer lokal dan tidak boleh dimasukkan ke Git.

## Mode simulasi

Simulator menyediakan skenario:

- Stabil
- Naik perlahan
- Banjir
- Sensor error
- Offline

Riwayat awal 30 menit dibuat otomatis. Data baru dibuat secara berkala selama
skenario tidak sedang offline.

## Menyiapkan Supabase

1. Buat project Supabase.
2. Buka **SQL Editor**.
3. Jalankan isi [`supabase/schema.sql`](./supabase/schema.sql).
4. Pastikan project mengaktifkan Realtime untuk tabel `readings` dan `devices`.
5. Isi `.env.local` dengan URL, anon key, dan ID perangkat.
6. Set `VITE_USE_MOCK=false`.
7. Jalankan `npm run dev`.

Dashboard hanya membaca data dari tabel Supabase. Data perangkat dapat
dimasukkan oleh sistem ingest perangkat atau melalui SQL Editor untuk
pengujian.

## Data uji

Contoh pembacaan dapat dijalankan di SQL Editor:

```sql
insert into readings (
  device_id, measured_at, distance_cm, level_cm, rate_cm_min,
  status, sensor_ok, rssi
)
values (
  'drainwatch-01', now(), 14.0, 6.0, 0.4,
  'NORMAL', true, -60
);

update devices
set last_seen = now(), rssi = -60, firmware_version = 'test'
where id = 'drainwatch-01';
```

Untuk menghapus data uji:

```sql
delete from readings where device_id = 'drainwatch-01';
```

Sesuaikan `device_id` dengan nilai `VITE_DEVICE_ID` jika menggunakan ID lain.

## Pengujian dan build produksi

Jalankan validasi:

```powershell
npm run lint
npm test
npm run build
```

Pratinjau hasil build produksi:

```powershell
npm run build
npm run preview
```

## Deploy ke Vercel

1. Push repository ke GitHub.
2. Import repository tersebut di Vercel.
3. Pilih preset **Vite**.
4. Pastikan build command adalah `npm run build` dan output directory adalah
   `dist`.
5. Tambahkan environment variables berikut di pengaturan project Vercel:
   `VITE_USE_MOCK`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, dan
   `VITE_DEVICE_ID`.
6. Deploy ulang setelah environment variables disimpan.

[`vercel.json`](./vercel.json) menyediakan rewrite SPA agar route aplikasi tetap
berfungsi ketika halaman dibuka langsung.

## Catatan Supabase gratis

Project Supabase pada paket gratis dapat dijeda ketika tidak aktif. Jika
dashboard tidak dapat terhubung setelah lama tidak digunakan, buka dashboard
Supabase dan aktifkan kembali project sebelum menguji aplikasi.
