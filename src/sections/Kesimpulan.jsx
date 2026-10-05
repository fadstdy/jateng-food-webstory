import { InsightCard, SourceTag } from '../components/UI';

export default function Kesimpulan() {
  return (
    <div className="flex flex-col gap-6 py-6">
      <div>
        <h2 className="font-display text-3xl font-bold text-hijau-utama mb-3">
          Kesimpulan
        </h2>
        <p className="text-sm text-teks-sekunder">
          Rangkuman dari seluruh temuan pola pengeluaran, distribusi spasial, dan karakteristik ketahanan pangan Jawa Tengah.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <InsightCard title="Rangkuman Temuan">
          <ul className="list-disc list-inside text-sm text-teks space-y-2 text-justify">
            <li>Pola Pengeluaran: Pengeluaran pangan Jawa Tengah 2025 didominasi Makanan dan Minuman Jadi (34,3% dari total per kapita), sedangkan beras menjadi komoditas tunggal terbesar (10,7%).</li>
            <li>Pola Spasial: Produksi padi per kapita mengelompok secara spasial (Moran's I signifikan pada 2020–2025). Nilai tertinggi ada di Sragen, dan Grobogan memiliki pekerja tani terbanyak.</li>
            <li>Struktur Indikator: Sembilan indikator pangan membentuk tiga klaster: Sentra Produksi Pertanian, Basis Ekonomi Pertanian, dan Pertanian Produktif/Perkotaan. Kota Magelang menjadi satu-satunya pencilan.</li>
          </ul>
        </InsightCard>

        <div className="flex flex-col justify-between">
          <InsightCard title="Implikasi & Rekomendasi">
            <ul className="list-disc list-inside text-sm text-teks space-y-2 text-justify">
            <li>Makanan Olahan: Besarnya porsi makanan dan minuman jadi menunjukkan pentingnya perhatian pada mutu gizi, kebersihan, dan keterjangkauan harga.</li>
            <li>Distribusi Antarwilayah: Kontras antara wilayah sentra padi dan wilayah perkotaan berproduksi rendah menunjukkan perlunya perhatian pada distribusi pangan antarwilayah.</li>
            <li>Program Berbasis Profil Wilayah: Tiga klaster menunjukkan karakter wilayah yang berbeda, sehingga program pertanian sebaiknya tidak disamaratakan. Temuan ini bersifat deskriptif dan eksploratif, bukan hubungan sebab-akibat.</li>
          </ul>
          </InsightCard>
        </div>
      </div>
    </div>
  );
}