# PRD — IoT DrainWatch Web Dashboard

Versi 1.0 · 31 Oktober 2026 · Pemilik: Deni Anugrah Hasibuan

> Dokumen ini adalah sumber kebenaran untuk **apa** yang dibangun. Untuk **bagaimana**, lihat `TECH_SPEC.md`, `DESIGN_SPEC.md`, dan `TASKS.md`.

## 1. Ringkasan

DrainWatch adalah sistem IoT peringatan dini luapan air. Perangkat (ESP32 + sensor ultrasonik HC-SR04) mengukur ketinggian air, menghitung **laju kenaikan** (cm/menit), menentukan status **Normal / Waspada / Bahaya**, lalu mengirim data ke Supabase. Dashboard web ini menampilkan data tersebut secara real-time.

Produk ini adalah **prototipe skala wadah** (miniatur saluran drainase, tinggi air maksimum sekitar 10–15 cm) untuk tugas mata kuliah Internet of Things.

## 2. Masalah

Alarm banjir sederhana hanya memakai satu ambang ketinggian, sehingga terlambat. Air yang naik pelan dan air yang naik cepat sama-sama "belum melewati batas", padahal risikonya berbeda. Pengguna juga tidak punya riwayat data untuk menganalisis pola kenaikan air.

## 3. Tujuan dan Non-Tujuan

**Tujuan**

1. Menampilkan kondisi air terkini secara real-time tanpa refresh manual.
2. Memperlihatkan **tren** (ketinggian dan laju kenaikan), bukan hanya angka sesaat.
3. Menampilkan riwayat pengukuran.
4. Memperlihatkan dengan jelas apakah perangkat online dan apakah datanya masih segar.
5. Dapat didemokan penuh **tanpa perangkat keras** lewat mode simulasi.

**Non-tujuan (versi ini)**

- Login/autentikasi pengguna, manajemen banyak perangkat, dan edit konfigurasi dari web.
- Notifikasi push, Telegram, atau email.
- Firmware ESP32 dan Supabase Edge Function `ingest` (dikerjakan terpisah).
- Menghitung laju kenaikan atau menentukan status di web. **Perangkat yang menghitung; web hanya menampilkan.** (Kecuali di mode simulasi.)

## 4. Pengguna

| Pengguna | Kebutuhan |
|---|---|
| Pemilik proyek (mahasiswa) | Mendemokan sistem ke dosen, memantau saat kalibrasi dan pengujian |
| Dosen/penilai | Memahami kondisi sistem dalam beberapa detik pertama melihat layar |
| Petugas/warga (konteks nyata) | Melihat apakah kondisi aman, dari HP |

## 5. Lingkup

**Dalam lingkup:** SPA React untuk dashboard satu perangkat, mode simulasi, integrasi Supabase (baca + Realtime), deploy ke Vercel.

**Di luar lingkup:** lihat Non-Tujuan.

## 6. Kebutuhan Fungsional

Prioritas: **P0** wajib, **P1** sebaiknya ada, **P2** opsional.

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-01 | Menampilkan ketinggian air (cm), laju kenaikan (cm/menit), dan status terbaru; diperbarui otomatis tanpa refresh | P0 |
| FR-02 | Indikator status Normal / Waspada / Bahaya / Sensor Error. Tidak boleh hanya mengandalkan warna: wajib ada teks dan ikon | P0 |
| FR-03 | Grafik ketinggian terhadap waktu dengan garis ambang Waspada dan Bahaya; pilihan rentang 15 menit, 1 jam, 6 jam, 24 jam | P0 |
| FR-04 | Grafik laju kenaikan terhadap waktu dengan garis nol dan garis ambang laju | P0 |
| FR-05 | Tabel riwayat (waktu, ketinggian, laju, status), terbaru di atas, 20 baris per halaman | P0 |
| FR-06 | Filter riwayat berdasarkan status | P1 |
| FR-07 | Informasi perangkat: nama, status Online/Offline, RSSI, versi firmware | P0 |
| FR-08 | Waktu pembaruan terakhir, ditampilkan relatif ("5 detik lalu") dan terus berjalan; waktu absolut tersedia saat hover/fokus | P0 |
| FR-09 | Perangkat dianggap **Offline** bila data terakhir lebih tua dari 30 detik; tampilan berubah jelas dan data terakhir diberi tanda "tidak terkini" | P0 |
| FR-10 | Estimasi waktu menuju ambang Bahaya = (ambang Bahaya − ketinggian) ÷ laju, hanya bila laju > 0 dan ketinggian < ambang | P1 |
| FR-11 | Banner peringatan non-modal di atas halaman saat status Waspada, Bahaya, Sensor Error, atau perangkat Offline | P1 |
| FR-12 | Menampilkan ambang konfigurasi perangkat (read-only) | P1 |
| FR-13 | Mode simulasi (`VITE_USE_MOCK=true`) dengan skenario: stabil, naik perlahan, naik cepat (banjir), sensor error, offline. Pemilih skenario hanya tampil di mode simulasi | P0 |
| FR-14 | State loading, data kosong, error koneksi, dan reconnect untuk setiap bagian utama | P0 |
| FR-15 | Responsif: HP (≥360 px), tablet, desktop | P0 |
| FR-16 | Ekspor riwayat ke CSV | P2 |

## 7. Kebutuhan Non-Fungsional

- **Performa:** render awal terasa cepat di jaringan seluler; hanya dependency yang tercantum di `TECH_SPEC.md`. Grafik maksimum 600 titik (downsample bila lebih).
- **Keandalan tampilan:** koneksi Realtime putus tidak boleh membuat halaman rusak; tampilkan status koneksi dan sambung ulang otomatis.
- **Aksesibilitas:** kontras teks minimal WCAG AA, dapat dioperasikan dengan keyboard, perubahan status diumumkan lewat `aria-live="polite"`, informasi tidak hanya lewat warna.
- **Lokalisasi:** seluruh teks UI dalam Bahasa Indonesia; zona waktu `Asia/Jakarta`; angka dan tanggal berformat `id-ID`.
- **Keamanan:** hanya `anon key` di frontend; tidak ada service role key; file `.env*` tidak masuk git; semua akses data bersifat baca saja (RLS).
- **Kemudahan dikembangkan:** TypeScript strict, fungsi logika murni terpisah dari komponen dan diuji.

## 8. Glosarium dan Aturan

| Istilah | Arti |
|---|---|
| `level_cm` | Ketinggian air dari dasar wadah, dihitung perangkat |
| `rate_cm_min` | Laju perubahan ketinggian; positif = naik |
| `status` | `NORMAL`, `WASPADA`, `BAHAYA`, atau `SENSOR_FAULT` (ditentukan perangkat) |
| Ambang | Nilai konfigurasi di tabel `device_config` (Waspada dan Bahaya untuk level dan laju) |
| Offline | Tidak ada data baru lebih dari 30 detik |

Aturan status (dipakai perangkat, ditiru oleh simulator): status adalah yang **lebih parah** dari status berdasarkan level dan status berdasarkan laju. `sensor_ok = false` menghasilkan `SENSOR_FAULT`.

## 9. Kriteria Penerimaan Global

1. Dengan `VITE_USE_MOCK=true`, seluruh fitur P0 berjalan tanpa Supabase dan tanpa perangkat.
2. Dengan `VITE_USE_MOCK=false` dan Supabase terisi, baris baru di tabel `readings` muncul di dashboard dalam hitungan detik tanpa refresh.
3. Mengganti skenario simulasi ke "banjir" mengubah status menjadi Bahaya, memunculkan banner, dan memperbarui kedua grafik.
4. Menghentikan data selama lebih dari 30 detik mengubah perangkat menjadi Offline.
5. Tidak ada secret di repositori atau bundle selain `anon key`.
6. `npm run build`, `npm run lint`, dan `npm test` lulus.
7. Tampilan benar pada lebar 360 px tanpa scroll horizontal pada halaman.

## 10. Asumsi dan Risiko

| Risiko | Penanganan |
|---|---|
| Jam perangkat tidak akurat | Perangkat memakai NTP; web menampilkan `measured_at` apa adanya dan memakai `devices.last_seen` untuk status online |
| Data terlalu banyak untuk grafik | Batasi query berdasarkan rentang waktu, downsample di klien |
| Supabase gratis menghentikan project yang tidak aktif | Dicatat di README; aktifkan kembali dari dashboard Supabase |
| Realtime terputus | Reconnect otomatis dan muat ulang data terbaru setelah tersambung |

## 11. Pertanyaan Terbuka

- Nilai ambang final menunggu hasil kalibrasi wadah (Tahap 5); web membaca dari database sehingga tidak perlu diubah.
- Apakah perlu halaman publik tanpa login? Untuk versi ini: ya, read-only.
