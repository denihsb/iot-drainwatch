# Instruksi untuk Copilot — DrainWatch Web Dashboard

Repositori ini adalah dashboard web untuk sistem IoT peringatan dini luapan air (ESP32 + HC-SR04 → Supabase → website). Baca dokumen berikut sebelum mengerjakan tugas apa pun:

1. `docs/PRD.md` — apa yang dibangun dan kriteria penerimaan
2. `docs/TECH_SPEC.md` — stack, tipe data, perilaku data, fungsi murni
3. `docs/DESIGN_SPEC.md` — tampilan dan komponen
4. `docs/TASKS.md` — pekerjaan dibagi per tugas

Jika dokumen-dokumen itu bertentangan dengan instruksi lain, hentikan dan tanyakan di komentar issue. Jangan menebak.

## Cara Bekerja

- Kerjakan **satu tugas (T01–T11) per PR**, sesuai issue yang ditugaskan. Jangan mengerjakan tugas lain "sekalian".
- Jaga PR tetap kecil dan mudah ditinjau. Jelaskan apa yang berubah dan cara mengujinya.
- Jika persyaratan tidak jelas, tulis asumsi di deskripsi PR atau ajukan pertanyaan, bukan membuat keputusan besar sendiri.
- Jangan menambah dependency di luar daftar pada `TECH_SPEC.md` §1. Jika benar-benar perlu, jelaskan alasannya di PR dan tunggu persetujuan.

## Perintah

```
npm install
npm run dev        # server pengembangan
npm run build      # build produksi
npm run lint
npm test           # Vitest
```

Semua perintah `build`, `lint`, dan `test` harus lulus sebelum PR dianggap siap.

## Aturan Kode

- TypeScript `strict`. Hindari `any`; bila terpaksa, beri komentar alasan.
- Komponen React fungsional dengan hooks. Satu komponen per file, nama file sama dengan nama komponen.
- Logika murni (status, statistik, format, penggabungan data) berada di `src/lib/` dan **harus punya unit test**. Komponen tidak boleh memuat logika bisnis yang bisa dipisah.
- Komponen **tidak boleh** tahu apakah data berasal dari simulasi atau Supabase. Satu-satunya pintu data adalah `useDashboardData`.
- Styling dengan CSS biasa dan CSS variables dari `src/styles/tokens.css`. Jangan menulis warna heksadesimal langsung di komponen; gunakan token.
- Nama identifier dan komentar kode dalam bahasa Inggris. **Seluruh teks yang dilihat pengguna dalam Bahasa Indonesia.**
- Format tanggal/angka `id-ID`, zona waktu `Asia/Jakarta`.
- Bersihkan semua efek samping (timer, channel Realtime, event listener) di cleanup `useEffect`.

## Keamanan (tidak dapat ditawar)

- Frontend hanya boleh memakai Supabase **anon key**. Jangan pernah menulis, meminta, atau menyebut service role key.
- Jangan commit file `.env`, `.env.local`, atau secret apa pun. Hanya `.env.example` dengan nilai kosong.
- Semua akses data bersifat **baca saja**. Jangan menambah kode yang menulis ke database dari frontend.
- Jangan memakai `dangerouslySetInnerHTML`.
- Jangan membuat atau mengubah kebijakan RLS di luar `supabase/schema.sql`, dan jangan melonggarkannya.

## Batas Lingkup

Tidak boleh dikerjakan di repo ini:

- Firmware ESP32 dan Supabase Edge Function `ingest` (dikerjakan terpisah).
- Login/autentikasi, manajemen banyak perangkat, edit konfigurasi dari web.
- Notifikasi push, email, atau Telegram.
- Menghitung laju kenaikan atau menentukan status di mode data nyata. Nilai itu berasal dari perangkat. Perhitungan di web hanya untuk simulator.

## Gaya Visual (ringkas; detail di `DESIGN_SPEC.md`)

Dashboard monitoring yang tenang dan profesional. **Dilarang:** gradient mencolok, glassmorphism, bayangan tebal, card besar berlebihan, animasi dekoratif, emoji sebagai ikon, library UI siap pakai. Warna hanya untuk makna status. Informasi tidak boleh bergantung pada warna saja.

## Pengujian

- Tambahkan/ubah unit test bersama perubahan logika.
- Untuk komponen yang punya perilaku (StatusBadge, AlertBanner, HistoryTable), tambahkan tes React Testing Library.
- Jangan menghapus atau melemahkan tes agar PR lulus.

## Checklist PR

- [ ] Hanya mengerjakan lingkup tugas yang ditugaskan
- [ ] `build`, `lint`, `test` lulus
- [ ] Tidak ada secret / `.env` ter-commit
- [ ] Teks UI Bahasa Indonesia, tanpa warna hardcode di komponen
- [ ] Diuji di lebar 360 px dan desktop, tema terang dan gelap
- [ ] Deskripsi PR memuat asumsi dan cara menguji
