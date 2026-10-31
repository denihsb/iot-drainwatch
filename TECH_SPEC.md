# TECH SPEC — DrainWatch Web Dashboard

Versi 1.0 · Pasangan dari `PRD.md`. Jika ada konflik, PRD menentukan perilaku produk dan dokumen ini menentukan implementasi.

## 1. Stack (tetap, jangan ganti tanpa persetujuan)

| Area | Pilihan |
|---|---|
| Bahasa | TypeScript (`strict: true`) |
| Framework | React 18 + Vite |
| Data | `@supabase/supabase-js` v2 (query + Realtime) |
| Grafik | `recharts` |
| Styling | CSS biasa dengan CSS variables (tanpa Tailwind, tanpa UI library) |
| Test | Vitest + React Testing Library |
| Lint | ESLint (bawaan template Vite) |
| Deploy | Vercel (SPA) |

Dependency baru di luar daftar ini **tidak boleh** ditambahkan tanpa alasan tertulis di PR.

## 2. Struktur Proyek

```
drainwatch-web/
  src/
    lib/
      supabase.ts          # createClient dari env
      status.ts            # fungsi murni: classify, estimateMinutesToThreshold
      stats.ts             # fungsi murni: linearSlope, downsample
      format.ts            # format waktu/angka id-ID, zona Asia/Jakarta
      constants.ts         # OFFLINE_AFTER_SEC, MAX_CHART_POINTS, PAGE_SIZE, RANGES
    types/index.ts         # Status, Reading, Device, DeviceConfig
    data/
      mock.ts              # generator skenario simulasi
      useDashboardData.ts  # hook utama, memilih mock atau supabase
      useSupabaseData.ts   # implementasi real
      useMockData.ts       # implementasi simulasi
    components/
      Header.tsx
      AlertBanner.tsx
      StatusBadge.tsx
      MetricCard.tsx       # dipakai untuk level, laju, estimasi
      DeviceInfo.tsx
      LevelChart.tsx
      RateChart.tsx
      RangeSelector.tsx
      HistoryTable.tsx
      ScenarioSwitcher.tsx # hanya render saat VITE_USE_MOCK=true
      States.tsx           # Loading, Empty, ErrorState
    App.tsx
    main.tsx
    styles/
      tokens.css           # CSS variables (lihat DESIGN_SPEC)
      base.css
  supabase/schema.sql
  docs/
  .env.example
  vercel.json
```

## 3. Environment

`.env.example` (commit), `.env.local` (jangan di-commit):

```
VITE_USE_MOCK=true
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_DEVICE_ID=drainwatch-01
```

- Semua variabel diakses lewat satu modul (`lib/constants.ts` atau `lib/supabase.ts`), bukan tersebar.
- Bila `VITE_USE_MOCK=false` tetapi URL/key kosong, tampilkan `ErrorState` yang menjelaskan konfigurasi hilang. Jangan crash.
- **Dilarang** memakai atau menyebut service role key di repo ini.

## 4. Tipe Data (kontrak)

```ts
export type Status = 'NORMAL' | 'WASPADA' | 'BAHAYA' | 'SENSOR_FAULT';

export interface Reading {
  id: number;
  device_id: string;
  measured_at: string;        // ISO 8601 dari perangkat (NTP)
  distance_cm: number | null;
  level_cm: number | null;    // null saat SENSOR_FAULT
  rate_cm_min: number | null; // positif = naik
  status: Status;
  sensor_ok: boolean;
  rssi: number | null;
}

export interface Device {
  id: string;
  name: string | null;
  last_seen: string | null;   // ISO, diisi Edge Function setiap ingest
  rssi: number | null;
  firmware_version: string | null;
  status: string | null;
}

export interface DeviceConfig {
  device_id: string;
  sensor_height_cm: number;
  level_waspada_cm: number;
  level_bahaya_cm: number;
  rate_waspada_cm_min: number;
  rate_bahaya_cm_min: number;
  window_sec: number;
  interval_normal_sec: number;
  interval_alert_sec: number;
}

export type Connection = 'online' | 'offline' | 'unknown';
export type RangeKey = '15m' | '1h' | '6h' | '24h';
```

Skema database lengkap ada di `supabase/schema.sql`. Tipe di atas harus tetap sinkron dengan skema itu.

## 5. API Hook (satu-satunya pintu data untuk komponen)

```ts
interface DashboardData {
  device: Device | null;
  config: DeviceConfig | null;
  latest: Reading | null;
  readings: Reading[];        // urut naik berdasarkan measured_at, sesuai range
  history: Reading[];         // urut turun, untuk tabel (maks 200 terbaru)
  connection: Connection;     // turunan dari lastUpdateAt
  lastUpdateAt: Date | null;
  realtime: 'connected' | 'connecting' | 'disconnected';
  loading: boolean;
  error: string | null;
}

function useDashboardData(range: RangeKey): DashboardData;
```

`useDashboardData` memilih `useMockData` atau `useSupabaseData` berdasarkan `VITE_USE_MOCK`. **Komponen tidak boleh tahu sumber datanya.**

## 6. Perilaku Data Real (Supabase)

1. **Muat awal:** ambil `devices` (by id), `device_config` (by device_id), dan `readings` untuk rentang waktu terpilih: `device_id = X AND measured_at >= now - range`, urut `measured_at asc`, batas 5000 baris.
2. **Riwayat tabel:** `readings` urut `measured_at desc`, `limit 200`.
3. **Realtime:** langganan `postgres_changes` event `INSERT` pada `readings` dengan filter `device_id=eq.<VITE_DEVICE_ID>`, dan `UPDATE` pada `devices` dengan filter `id=eq.<VITE_DEVICE_ID>`.
4. **Penggabungan:** baris baru ditambahkan ke akhir `readings`, dibuang bila lebih tua dari jendela rentang; hindari duplikat berdasarkan `id`; urutkan ulang bila `measured_at` tidak berurutan (data hasil kirim ulang saat offline bisa tiba terlambat).
5. **Reconnect:** saat status channel kembali `SUBSCRIBED` setelah terputus, muat ulang data terbaru agar tidak ada celah.
6. **Ganti rentang:** muat ulang `readings` untuk rentang baru; jangan membuat channel baru.
7. **Cleanup:** hapus channel saat unmount.
8. **Downsample:** bila `readings.length > MAX_CHART_POINTS (600)`, rata-ratakan per bucket waktu sebelum diberikan ke grafik (`stats.downsample`). Tabel riwayat tidak di-downsample.

### Status koneksi perangkat

- `lastUpdateAt = max(device.last_seen, latest.measured_at)`.
- `connection = 'offline'` bila `now - lastUpdateAt > OFFLINE_AFTER_SEC (30 detik)`; `'unknown'` bila belum ada data sama sekali; selain itu `'online'`.
- Dievaluasi ulang setiap 1 detik dengan timer (bukan hanya saat data masuk). Timer dibersihkan saat unmount.

## 7. Fungsi Murni (wajib punya unit test)

```ts
// lib/status.ts
classify(
  level: number | null, rate: number | null, sensorOk: boolean, cfg: DeviceConfig
): Status
// sensorOk=false atau level null -> SENSOR_FAULT.
// levelStatus: level >= level_bahaya -> BAHAYA, >= level_waspada -> WASPADA, else NORMAL.
// rateStatus : rate  >= rate_bahaya  -> BAHAYA, >= rate_waspada  -> WASPADA, else NORMAL.
// hasil = yang lebih parah. rate null dianggap 0.

estimateMinutesToThreshold(level: number, rate: number, thresholdCm: number): number | null
// null bila rate <= 0 atau level >= thresholdCm. Selain itu (threshold - level) / rate.

// lib/stats.ts
linearSlope(points: { t: number /* detik */; y: number }[]): number
// kemiringan regresi linear kuadrat terkecil, satuan y per detik. < 2 titik -> 0.

downsample<T extends { t: number; y: number }>(points: T[], maxPoints: number): T[]
// bucket rata-rata; urutan waktu dipertahankan; bila points <= maxPoints kembalikan apa adanya.
```

`classify` dan `linearSlope` **hanya** dipakai oleh simulator. Di mode real, status dan laju berasal dari database.

## 8. Simulator (`data/mock.ts`)

Menghasilkan satu `Reading` setiap 2 detik (konstanta `MOCK_TICK_MS`), disimpan di memori. Saat start, isi riwayat 30 menit terakhir secara instan agar grafik tidak kosong.

Konfigurasi simulasi (`DeviceConfig` palsu): `sensor_height_cm: 20`, `level_waspada_cm: 7`, `level_bahaya_cm: 10`, `rate_waspada_cm_min: 0.5`, `rate_bahaya_cm_min: 1.5`, `window_sec: 90`.

| Skenario | Perilaku level |
|---|---|
| `stabil` | Sekitar 2 cm, noise kecil ±0,2 |
| `naik-perlahan` | Naik ±0,3 cm/menit dari 2 cm hingga ±8 cm |
| `banjir` | Naik ±2 cm/menit dari 3 cm hingga ±11 cm, lalu bertahan |
| `sensor-error` | 10 detik normal lalu `sensor_ok=false`, `level_cm=null`, status `SENSOR_FAULT` |
| `offline` | Berhenti menghasilkan data baru |

Laju dihitung dengan `linearSlope` pada jendela `window_sec` terakhir, dikonversi ke cm/menit. Status dengan `classify`. Pemilih skenario (`ScenarioSwitcher`) hanya ada saat `VITE_USE_MOCK=true`.

## 9. Kontrak Ingest (informasi saja, **bukan tugas web**)

Edge Function `ingest` akan dibuat terpisah. Web hanya perlu mengetahui bahwa ia menulis ke `readings` dan memperbarui `devices.last_seen`.

```
POST {SUPABASE_URL}/functions/v1/ingest
Header: x-device-key: <kunci perangkat>
Body: { "device_id": "drainwatch-01", "measured_at": "2026-11-01T08:30:00Z",
        "distance_cm": 14.2, "level_cm": 5.8, "rate_cm_min": 0.4,
        "status": "NORMAL", "sensor_ok": true, "rssi": -61 }
```

## 10. Keamanan

- Hanya `anon key` di frontend. RLS: `SELECT` untuk `anon`, tanpa policy `INSERT/UPDATE/DELETE`.
- Jangan render HTML dari data (`dangerouslySetInnerHTML` dilarang).
- `.env.local` masuk `.gitignore`. Pastikan tidak ada secret pada riwayat commit.

## 11. Deploy

- Vercel, framework preset Vite, `build: npm run build`, `output: dist`.
- `vercel.json` dengan rewrite SPA ke `/index.html`.
- Variabel `VITE_*` diisi di pengaturan Vercel, bukan di repo.

## 12. Kualitas

- `tsc --noEmit` tanpa error, ESLint tanpa error.
- Unit test untuk: `classify`, `estimateMinutesToThreshold`, `linearSlope`, `downsample`, logika penggabungan data real (fungsi murni `mergeReadings`), dan penentuan `connection`.
- Tidak ada `any` tanpa komentar alasan.
