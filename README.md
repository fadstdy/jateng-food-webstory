# Membaca Pola Pangan Jawa Tengah

Visualisasi data *scrollytelling* interaktif mengenai pola pengeluaran pangan, distribusi spasial, dan karakteristik ketahanan pangan di 35 Kabupaten/Kota Jawa Tengah.

Tautan Web Live: [https://fadstdy.github.io/jateng-food-webstory/](https://fadstdy.github.io/jateng-food-webstory/)

---

## Fitur dan Topik Visualisasi

1. **Data Hierarki (Pengeluaran Pangan)**
   - Visualisasi Treemap dan Sunburst (3 level: Total > Kelompok > Komoditas).
   - Fitur *drill-down* dan *breadcrumb* navigasi.
   - Mengodekan ukuran (pengeluaran per kapita sebulan) dan warna (kategori kelompok makanan).

2. **Data Geospasial (Produksi Padi & Tenaga Kerja 2020–2025)**
   - Peta Koroplet Kuantil untuk produksi padi per kapita.
   - Peta Simbol Proporsional untuk jumlah tenaga kerja sektor pertanian.
   - Layer Autokorelasi Spasial Lokal (LISA/Moran's I) untuk identifikasi klaster spasial (HH, LL, LH, HL).
   - Filter temporal (2020–2025), legenda interaktif, dan *tooltip* terperinci.

3. **Data Berdimensi Tinggi (Analisis Multivariat)**
   - Principal Component Analysis (PCA) Biplot meringkas 9 indikator pangan.
   - K-Means Clustering membagi 35 kab/kota menjadi 3 klaster profil ketahanan pangan.
   - Deteksi pencilan multivariat menggunakan Jarak Mahalanobis.
   - Visualisasi pendamping berupa Radar Plot profil klaster dan Heatmap Terklaster.
   - Interaksi *Brushing and Linking* antara grafik multivariat dan peta wilayah.

---

## Teknologi yang Digunakan

- **Frontend:** React, Vite, Tailwind CSS v4, Lucide React
- **Visualisasi & Peta:** Leaflet.js, Plotly.js / Recharts
- **Prapemrosesan Data & Analisis:** Python (`pandas`, `scikit-learn`, `PySAL/esda`, `scipy`)
- **Deployment:** GitHub Pages via GitHub Actions

---

## Cara Menjalankan Lokal

1. Clone repositori ini:
   ```bash
   git clone [https://github.com/fadstdy/jateng-food-webstory.git](https://github.com/fadstdy/jateng-food-webstory.git)
   ```

2. Masuk ke direktori proyek:
   ```bash
   cd jateng-food-webstory
   ```

3. Instal dependensi:
   ```bash
   npm install
   ```

4. Jalankan server pengembang lokal:
   ```bash
   npm run dev
   ```

5. Buka peramban web Anda dan akses: `http://localhost:5173`

---

## Struktur Proyek

- `src/` - Arsitektur UI React (Komponen visualisasi, Context, Konfigurasi *Scrollytelling*, Token CSS).
- `public/data/` - Aset data statis (JSON, GeoJSON) hasil prapemrosesan untuk peta dan grafik interaktif.
- `analysis/` - Skrip Python lokal untuk pembersihan data BPS, analisis autokorelasi spasial (LISA), PCA, K-Means clustering, serta kalkulasi Jarak Mahalanobis.

---

## Sumber Data

### 1. Data Badan Pusat Statistik (BPS)

| Topik | Judul Tabel / Publikasi BPS | Tahun | Unit | URL Tautan | Tanggal Akses |
| :--- | :--- | :---: | :---: | :--- | :---: |
| **Hierarki** | Rata-Rata Konsumsi dan Pengeluaran per Kapita Menurut Jenis Makanan | 2025 | Provinsi | [BPS Jateng](https://jateng.bps.go.id/) | 02 Okt 2026 |
| **Geospasial** | Produksi Padi menurut Kabupaten/Kota | 2020–2025 | Kab/Kota | [BPS Jateng](https://jateng.bps.go.id/) | 01 Okt 2026 |
| **Geospasial** | Penduduk Bekerja Berdasarkan Sektor Utama | 2020–2025 | Kab/Kota | [BPS Jateng](https://jateng.bps.go.id/) | 02 Okt 2026 |
| **Geospasial** | Rata-rata Konsumsi Kalori dan Protein per Kapita Sehari | 2020–2025 | Kab/Kota | [BPS Jateng](https://jateng.bps.go.id/) | 02 Okt 2026 |
| **Multivariat** | Produktivitas Padi menurut Kabupaten/Kota | 2025 | Kab/Kota | [BPS Jateng](https://jateng.bps.go.id/) | 01 Okt 2026 |
| **Multivariat** | Produksi Cabai menurut Kabupaten/Kota | 2025 | Kab/Kota | [BPS Jateng](https://jateng.bps.go.id/) | 01 Okt 2026 |
| **Multivariat** | Produksi Telur menurut Kabupaten/Kota | 2025 | Kab/Kota | [BPS Jateng](https://jateng.bps.go.id/) | 01 Okt 2026 |
| **Multivariat** | PDRB Pertanian Menurut Kabupaten/Kota | 2025 | Kab/Kota | [BPS Jateng](https://jateng.bps.go.id/) | 02 Okt 2026 |
| **Multivariat** | Persentase Pengeluaran per Kapita Sebulan untuk Makanan | 2025 | Kab/Kota | [BPS Jateng](https://jateng.bps.go.id/) | 02 Okt 2026 |

### 2. Data Spasial Pendukung
- Batas Administrasi Digital Kabupaten/Kota Jawa Tengah (SHP/GeoJSON): Repositori *open-source* GitHub *Batas Administrasi Indonesia* oleh Alf-Anas (diperbarui 13 Juni 2023).

---

## Deklarasi Penggunaan Alat Bantu AI

Alat bantu berbasis AI digunakan sebatas pendukung dalam proses pengembangan proyek ini, yaitu:
- **Consensus AI:** Membantu pencarian dan eksplorasi literatur ilmiah pendukung.
- **Claude:** Membantu penyusunan kerangka dan draf alur kerja.
- **Gemini:** Membantu penulisan, optimasi kode React/Python.

Seluruh keputusan analisis, pemilihan variabel dan teknik statistik, verifikasi hasil, serta isi akhir proyek menjadi tanggung jawab penuh penulis.