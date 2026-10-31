# TASKS — DrainWatch Web Dashboard

Setiap tugas dirancang sebagai **satu GitHub Issue / satu PR kecil** untuk agent Copilot. Kerjakan **berurutan**; jangan mulai tugas berikutnya sebelum PR sebelumnya di-merge.

Rujukan wajib untuk semua tugas: `docs/PRD.md`, `docs/TECH_SPEC.md`, `docs/DESIGN_SPEC.md`, `.github/copilot-instructions.md`.

**Definition of Done (berlaku untuk semua tugas):** `npm run build`, `npm run lint`, dan `npm test` lulus; tidak ada `any` tanpa alasan; tidak ada secret; teks UI Bahasa Indonesia; PR menjelaskan apa yang berubah dan cara mengujinya.

---

## T01 — Scaffold proyek

**Tujuan:** proyek Vite + React + TypeScript siap dikembangkan.

**Kerjakan:**
- Buat proyek dengan template `react-ts`, aktifkan `strict`.
- Pasang dependency: `@supabase/supabase-js`, `recharts`; dev: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`.
- Buat struktur folder sesuai `TECH_SPEC.md` §2 (file kosong/placeholder boleh).
- Tambahkan `.env.example`, `.gitignore` (termasuk `.env*.local`), `vercel.json` (rewrite SPA), skrip `test`, `lint`, `build`.
- Tambahkan `lib/constants.ts` (`OFFLINE_AFTER_SEC=30`, `MAX_CHART_POINTS=600`, `PAGE_SIZE=20`, `MOCK_TICK_MS=2000`, daftar `RANGES`).
- Salin `supabase/schema.sql` dan `docs/` ke repo bila belum ada.

**Kriteria:** `npm run dev` menampilkan halaman kosong tanpa error; `npm test` berjalan (boleh dengan satu tes contoh).

## T02 — Tipe dan fungsi murni

**Tujuan:** logika inti teruji.

**Kerjakan:**
- `types/index.ts` sesuai `TECH_SPEC.md` §4.
- `lib/status.ts`: `classify`, `estimateMinutesToThreshold`.
- `lib/stats.ts`: `linearSlope`, `downsample`.
- `lib/format.ts`: format angka (`1 desimal`, koma desimal), waktu absolut `id-ID` zona `Asia/Jakarta`, waktu relatif ("5 detik lalu").
- `lib/connection.ts`: `getConnection(lastUpdateAt, now)`.
- `lib/merge.ts`: `mergeReadings(existing, incoming, windowStart)` (dedupe by `id`, urut `measured_at`, buang yang di luar jendela).

**Kriteria:** unit test mencakup kasus normal, batas (nilai tepat di ambang), `null`, daftar kosong, dan duplikat. Semua lulus.

## T03 — Simulator dan hook data

**Tujuan:** dashboard punya sumber data tanpa Supabase.

**Kerjakan:**
- `data/mock.ts` dengan lima skenario sesuai `TECH_SPEC.md` §8.
- `data/useMockData.ts` dan `data/useDashboardData.ts` (pemilih mock/supabase; implementasi supabase boleh berupa stub yang mengembalikan `error` "belum diimplementasikan" sampai T09).
- Riwayat awal 30 menit terisi saat start.

**Kriteria:** hook mengembalikan `DashboardData` sesuai kontrak; mengganti skenario mengubah arah data; tes untuk generator (status `BAHAYA` tercapai pada skenario `banjir`, `SENSOR_FAULT` pada `sensor-error`).

## T04 — Tema dan tata letak dasar

**Tujuan:** kerangka visual sesuai `DESIGN_SPEC.md`.

**Kerjakan:**
- `styles/tokens.css` dan `styles/base.css` (terang dan gelap).
- `App.tsx` dengan grid sesuai §5 dan breakpoint 640/1024.
- `Header`, `ScenarioSwitcher` (hanya mode simulasi), `RangeSelector`.
- Komponen `States` (Loading skeleton, Empty, ErrorState).

**Kriteria:** tampilan benar di lebar 360, 768, 1280 px; tanpa scroll horizontal halaman; tema gelap mengikuti OS; fokus keyboard terlihat.

## T05 — Kartu metrik, status, dan info perangkat

**Kerjakan:**
- `StatusBadge` (ikon SVG + teks, 5 varian termasuk OFFLINE).
- `MetricCard` untuk Ketinggian, Laju, Status, Estimasi (FR-01, FR-02, FR-08, FR-10).
- `DeviceInfo` (FR-07, FR-12).
- `AlertBanner` (FR-11) dengan `role` sesuai tingkat.
- Waktu pembaruan relatif yang berdetak tiap detik (FR-08); evaluasi `connection` tiap detik (FR-09).
- Region `aria-live` untuk perubahan status.

**Kriteria:** berpindah skenario simulasi memunculkan/menghilangkan banner dengan benar; skenario `offline` mengubah koneksi menjadi Offline setelah 30 detik; skenario `sensor-error` menampilkan "–" pada level dan laju. Tes komponen untuk `StatusBadge` dan `AlertBanner`.

## T06 — Grafik

**Kerjakan:**
- `LevelChart` dan `RateChart` sesuai `DESIGN_SPEC.md` §6: garis ambang putus-putus, garis nol pada grafik laju, tooltip, tanpa animasi, data `null` memutus garis.
- Terapkan `downsample` bila titik > `MAX_CHART_POINTS`.
- `aria-label` ringkas berisi nilai terbaru.

**Kriteria:** grafik hidup mengikuti data simulasi; mengganti rentang waktu mengubah jendela data; state loading/kosong/error tampil sesuai §7.

## T07 — Tabel riwayat

**Kerjakan:**
- `HistoryTable` (FR-05): terbaru di atas, 20 baris/halaman, paginasi, header lengket.
- Filter status (FR-06).
- Scroll horizontal hanya di dalam wadah tabel pada layar sempit.

**Kriteria:** paginasi dan filter benar (tes), data baru masuk di baris teratas, halaman aktif tidak melompat secara mengejutkan saat data baru tiba bila pengguna berada di halaman > 1.

## T08 — Klien Supabase dan data awal

**Kerjakan:**
- `lib/supabase.ts` membuat client dari env; bila env kosong kembalikan `null` dan tampilkan `ErrorState` konfigurasi.
- `data/useSupabaseData.ts`: muat `devices`, `device_config`, `readings` (rentang dan riwayat) sesuai `TECH_SPEC.md` §6 butir 1–2 dan 6.
- Tangani loading dan error (tanpa crash).

**Kriteria:** dengan `VITE_USE_MOCK=false` dan Supabase terisi data uji (isi manual lewat SQL Editor), dashboard menampilkan data nyata. Dokumentasikan cara menyisipkan data uji di README.

## T09 — Realtime dan reconnect

**Kerjakan:**
- Langganan `INSERT` pada `readings` dan `UPDATE` pada `devices` (§6 butir 3).
- Gabungkan data baru dengan `mergeReadings`; buang yang keluar jendela.
- Indikator `realtime` (connected/connecting/disconnected) di Header.
- Muat ulang data saat channel kembali tersambung (§6 butir 5); cleanup saat unmount dan saat env berubah.

**Kriteria:** menambah baris lewat SQL Editor memunculkan data di dashboard tanpa refresh; memutus jaringan lalu menyambung kembali memulihkan data tanpa duplikat; tidak ada channel ganda saat berganti rentang.

## T10 — Polesan, aksesibilitas, dan penanganan kasus tepi

**Kerjakan:**
- Periksa kontras WCAG AA seluruh pasangan warna status (terang dan gelap); sesuaikan token bila perlu.
- Navigasi keyboard menyeluruh; `prefers-reduced-motion`.
- Kasus tepi: `last_seen` null, `device_config` tidak ada (pakai default aman dan tampilkan peringatan kecil), data dengan `measured_at` di masa depan, `level_cm` negatif (tampilkan apa adanya).
- Periksa tampilan di lebar 360 px.

**Kriteria:** tidak ada error/warning di konsol pada semua skenario simulasi; audit Lighthouse aksesibilitas ≥ 95 (catat hasilnya di PR).

## T11 — Deploy dan dokumentasi

**Kerjakan:**
- `README.md`: deskripsi, cara menjalankan (mode simulasi dan mode Supabase), variabel env, cara menyiapkan Supabase (`supabase/schema.sql`), cara menyisipkan data uji, cara deploy ke Vercel, catatan project Supabase gratis yang bisa dijeda.
- Verifikasi build produksi dan pratinjau (`npm run build && npm run preview`).
- Pastikan tidak ada secret di repo.

**Kriteria:** orang baru dapat menjalankan proyek dari README tanpa bantuan; deploy Vercel berhasil dengan env yang diisi di panel Vercel.

---

## Template Issue (salin untuk tiap tugas)

```
Judul: [T0X] <nama tugas>

Konteks: baca docs/PRD.md, docs/TECH_SPEC.md, docs/DESIGN_SPEC.md, .github/copilot-instructions.md.
Tugas: <salin bagian "Kerjakan" dari docs/TASKS.md>
Kriteria penerimaan: <salin bagian "Kriteria">
Di luar lingkup: <hal yang tidak boleh disentuh>
```
