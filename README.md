# Peta Pangan Jawa Tengah 🌾

Visualisasi data *scrollytelling* interaktif mengenai ketahanan pangan di 35 Kabupaten/Kota Jawa Tengah. 

🔗 **Tautan Web:** [https://<username-github>.github.io/jateng-food-webstory/](https://<username-github>.github.io/jateng-food-webstory/)

## Cara Menjalankan Lokal
1. Clone repositori ini: `git clone https://github.com/<username>/jateng-food-webstory.git`
2. Masuk ke direktori: `cd jateng-food-webstory`
3. Instal dependensi: `npm install`
4. Jalankan server lokal: `npm run dev`
5. Buka `http://localhost:5173` di browser Anda.

## Struktur Proyek
- `src/` - Arsitektur UI React (Komponen, Context, Konfigurasi *Scrollytelling*, Token CSS).
- `public/data/` - Aset statis (JSON/GeoJSON) bersih hasil ekstraksi untuk dibaca oleh peta interaktif.
- `analysis/` - (Diabaikan dari Git) Lingkungan kerja Python lokal untuk analisis klaster multivariat dan prapemrosesan sebelum data diumpankan ke React.

## Sumber Data BPS
| Judul Tabel | Tahun | URL Tautan | Tanggal Akses |
| :--- | :---: | :--- | :---: |
| Luas Panen dan Produksi Padi di Jawa Tengah | 2023 | [Tautan BPS](https://jateng.bps.go.id/) | 03 Okt 2026 |
| Indeks Ketahanan Pangan (IKP) Kabupaten/Kota | 2023 | [Tautan BPS](https://jateng.bps.go.id/) | 03 Okt 2026 |

## Deklarasi Penggunaan AI
Arsitektur kerangka React, pengaturan *design token* Tailwind CSS v4, dan logika *intersection observer* untuk navigasi *scrollytelling* dalam proyek ini diimplementasikan dengan bantuan asisten AI sebagai pendamping teknis. Proses pemodelan statistik dan penyusunan narasi visual dilakukan secara independen.