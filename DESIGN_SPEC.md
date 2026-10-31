# DESIGN SPEC — DrainWatch Web Dashboard

Versi 1.0. Tujuan visual: **dashboard monitoring IoT yang tenang, padat informasi, dan profesional** seperti alat operasional, bukan halaman pemasaran.

## 1. Prinsip

1. Status dibaca dalam satu detik pertama: level dan status paling menonjol.
2. Warna hanya untuk makna (status). Selebihnya netral.
3. Padat tapi lega: sedikit komponen, jarak konsisten.
4. Angka memakai font tabular agar tidak "bergoyang" saat berubah.

## 2. Yang Dilarang

- Gradient mencolok, glassmorphism, blur, neon, bayangan tebal.
- Card besar berlebihan dan banyak card dengan padding raksasa.
- Animasi dekoratif. Satu-satunya gerak yang diizinkan: transisi warna status 150 ms dan titik "live" yang berdenyut pelan saat online (dimatikan bila `prefers-reduced-motion`).
- Emoji sebagai ikon. Pakai SVG inline sederhana.
- Library UI siap pakai.

## 3. Token (`styles/tokens.css`)

Dukung tema terang dan gelap lewat `prefers-color-scheme`. Semua warna lewat CSS variables.

```css
:root {
  --bg: #f6f7f9;
  --surface: #ffffff;
  --surface-2: #f0f2f5;
  --border: #dde1e7;
  --text: #14181f;
  --text-muted: #5b6573;

  --accent: #2563eb;

  --status-normal: #15803d;
  --status-normal-bg: #e7f5ec;
  --status-waspada: #a16207;
  --status-waspada-bg: #fbf1d9;
  --status-bahaya: #b91c1c;
  --status-bahaya-bg: #fbe6e6;
  --status-fault: #6b21a8;
  --status-fault-bg: #f1e8f8;
  --status-offline: #5b6573;
  --status-offline-bg: #e9ecf0;

  --radius: 6px;
  --space-1: 4px; --space-2: 8px; --space-3: 12px;
  --space-4: 16px; --space-5: 24px; --space-6: 32px;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0f1318;
    --surface: #171c23;
    --surface-2: #1e252e;
    --border: #2a323d;
    --text: #e8ecf1;
    --text-muted: #9aa5b3;
    --accent: #60a5fa;
    --status-normal: #4ade80;   --status-normal-bg: #12301f;
    --status-waspada: #facc15;  --status-waspada-bg: #33290a;
    --status-bahaya: #f87171;   --status-bahaya-bg: #3a1616;
    --status-fault: #c084fc;    --status-fault-bg: #2a1a3a;
    --status-offline: #9aa5b3;  --status-offline-bg: #222a34;
  }
}
```

Kontras teks terhadap latar harus memenuhi WCAG AA. Periksa pasangan status dan latarnya; sesuaikan nilai bila gagal.

## 4. Tipografi

- Font: sistem (`system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`). Tanpa font eksternal.
- Angka metrik: `font-variant-numeric: tabular-nums`.
- Skala: 12 / 14 / 16 / 20 / 32 px. Angka utama level: 32 px, semibold. Label: 12 px, muted, huruf kapital kecil dengan letter-spacing 0.04em.

## 5. Tata Letak

Lebar konten maksimum 1200 px, di tengah. Padding halaman 16 px (HP) / 24 px (desktop).

```
┌──────────────────────────────────────────────────────────────┐
│ DrainWatch · DrainWatch Prototipe      ● Online · 5 detik lalu │  Header
├──────────────────────────────────────────────────────────────┤
│ [!] Waspada: laju kenaikan 0,8 cm/menit … (hanya bila perlu)  │  AlertBanner
├───────────────┬───────────────┬───────────────┬──────────────┤
│ KETINGGIAN    │ LAJU KENAIKAN │ STATUS        │ ESTIMASI     │  4 MetricCard
│ 5,8 cm        │ +0,4 cm/mnt   │ ✓ NORMAL      │ BAHAYA ±11 m │
├───────────────┴───────────────┴───────────────┴──────────────┤
│ Rentang: [15 mnt] [1 jam] [6 jam] [24 jam]                     │
├──────────────────────────────┬───────────────────────────────┤
│ Grafik ketinggian            │ Grafik laju kenaikan          │  2 kolom di desktop
├──────────────────────────────┴───────────────────────────────┤
│ Info perangkat (nama, RSSI, firmware, ambang)                 │
├──────────────────────────────────────────────────────────────┤
│ Riwayat pengukuran  [Filter status ▾]                         │
│ Waktu | Ketinggian | Laju | Status        ‹ 1 2 3 ›           │
└──────────────────────────────────────────────────────────────┘
```

Breakpoint:

| Lebar | Perilaku |
|---|---|
| ≤ 640 px | Satu kolom. MetricCard 2×2. Grafik bertumpuk. Tabel riwayat boleh scroll horizontal di dalam wadahnya sendiri |
| 641–1024 px | MetricCard 4 kolom, grafik bertumpuk |
| ≥ 1025 px | Grafik 2 kolom berdampingan |

Halaman tidak boleh scroll horizontal pada lebar 360 px.

## 6. Komponen

**Header.** Nama produk + nama perangkat di kiri. Di kanan: titik status koneksi + teks "Online" / "Offline" + waktu relatif pembaruan terakhir. Tooltip/`title` memuat waktu absolut. Bila Realtime terputus, tampilkan teks kecil "Menyambung ulang…".

**AlertBanner.** Strip penuh lebar, tinggi satu atau dua baris, ikon + teks, latar `--status-*-bg`, teks `--status-*`, border kiri 3 px berwarna status. Muncul untuk Waspada, Bahaya, Sensor Error, dan Offline. Tidak modal, tidak bisa menutupi konten. Memakai `role="status"` (Bahaya: `role="alert"`).

**MetricCard.** Kotak datar: border 1 px `--border`, latar `--surface`, radius `--radius`, padding 12–16 px. Label kecil di atas, nilai besar, satuan kecil di sebelah nilai. Tanpa bayangan. Kartu status memakai latar dan warna status.

**StatusBadge.** Ikon SVG + teks huruf kapital: `NORMAL`, `WASPADA`, `BAHAYA`, `SENSOR ERROR`, `OFFLINE`. Ikon berbeda per status (centang, segitiga peringatan, silang di lingkaran, tanda tanya/sensor putus, garis putus).

**Grafik (Recharts).**
- Garis tunggal 2 px, warna `--accent`, tanpa titik, tanpa animasi masuk (`isAnimationActive={false}`).
- Garis ambang horizontal putus-putus: Waspada (`--status-waspada`) dan Bahaya (`--status-bahaya`) dengan label kecil di ujung kanan.
- Grafik laju: garis nol tegas; ambang laju sebagai garis putus-putus; area di atas nol tidak diisi warna.
- Sumbu X: jam `HH:mm` (atau `HH:mm:ss` untuk rentang 15 menit). Sumbu Y: satuan jelas (cm, cm/menit).
- Tooltip: waktu lengkap, nilai, status. Grid tipis `--border`.
- Tinggi 240 px (HP) / 280 px (desktop). Wajib punya teks alternatif ringkas (`aria-label`) yang menyebut nilai terbaru.
- Data hilang (`null`) memutus garis, tidak diinterpolasi.

**RangeSelector.** Segmented control 4 opsi, satu aktif. Dapat dioperasikan dengan keyboard (`role="radiogroup"`).

**DeviceInfo.** Daftar definisi dua kolom: Perangkat, Koneksi, RSSI (dBm), Firmware, Ambang (Waspada/Bahaya untuk level dan laju). Nilai kosong ditulis "–".

**HistoryTable.** Header lengket, baris 36 px, zebra sangat halus atau garis pemisah tipis. Kolom waktu `dd MMM HH:mm:ss`. Status memakai StatusBadge kecil. Paginasi 20 baris dengan tombol sebelumnya/berikutnya dan nomor halaman. Filter status berupa `<select>`.

**ScenarioSwitcher.** Hanya saat mode simulasi: bar kecil di bawah header bertuliskan "Mode simulasi" dengan `<select>` skenario. Tampilan netral (latar `--surface-2`).

## 7. State

| Bagian | Loading | Kosong | Error |
|---|---|---|---|
| MetricCard | Skeleton datar (blok abu-abu tanpa shimmer) | "–" | Teks "Tidak dapat memuat" |
| Grafik | Skeleton setinggi grafik | "Belum ada data pada rentang ini" | Pesan error + tombol "Coba lagi" |
| Tabel | 5 baris skeleton | "Belum ada riwayat pengukuran" | Pesan error + tombol "Coba lagi" |

Saat **Offline**: nilai terakhir tetap tampil tetapi diberi gaya redup dan label "Data terakhir, tidak terkini"; MetricCard status berubah menjadi OFFLINE.
Saat **Sensor Error**: nilai level dan laju tampil "–"; kartu status ungu sesuai token.

## 8. Teks UI (Bahasa Indonesia)

| Konteks | Teks |
|---|---|
| Label | Ketinggian air, Laju kenaikan, Status, Estimasi menuju Bahaya |
| Koneksi | Online, Offline, Menyambung ulang… |
| Waktu | "5 detik lalu", "2 menit lalu" |
| Estimasi | "±4 menit", "Tidak naik", "–" |
| Banner Waspada | "Waspada: ketinggian air atau laju kenaikan melewati ambang Waspada." |
| Banner Bahaya | "Bahaya: air berpotensi meluap. Periksa saluran segera." |
| Banner Sensor | "Sensor tidak terbaca. Data ketinggian tidak tersedia." |
| Banner Offline | "Perangkat offline. Data terakhir diterima {waktu}." |

## 9. Aksesibilitas

- Fokus terlihat jelas (outline 2 px `--accent`).
- Target sentuh minimal 40 px.
- Perubahan status diumumkan lewat region `aria-live="polite"` (Bahaya: `assertive`).
- Tabel memakai `<table>` semantik dengan `<th scope>`.
- `prefers-reduced-motion` dihormati.
