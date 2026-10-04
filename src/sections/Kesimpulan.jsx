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
          <ul className="list-disc list-inside text-sm text-teks space-y-2">
            <li>Pola Pengeluaran Pangan: Konsumsi masyarakat Jawa Tengah pada tahun 2025 sangat didominasi oleh Makanan dan Minuman Jadi yang menyerap 34,3% dari total pengeluaran per kapita. Namun, beras tetap menjadi komoditas tunggal paling krusial dengan porsi pengeluaran tertinggi mencapai 10,7%.</li>
            <li>Distribusi Spasial & Tenaga Kerja: Terdapat tren autokorelasi spasial yang positif, di mana wilayah dengan hasil panen dan jumlah pekerja tani yang mirip cenderung saling mengelompok. Grobogan menjadi pusat tenaga kerja pertanian terbanyak, sementara produksi padi per kapita tertinggi berpusat di wilayah seperti Sragen.</li>
            <li>Karakteristik Ketahanan Pangan: Terdapat tiga klaster utama profil ketahanan pangan daerah, yaitu Sentra Produksi Pertanian, Basis Ekonomi Pertanian, dan Pertanian Produktif. Analisis juga menemukan pencilan (outlier) wilayah perkotaan seperti Kota Magelang dan Kota Surakarta yang memiliki basis tenaga kerja pertanian dan produksi padi yang sangat rendah dibandingkan daerah sekitarnya.</li>
          </ul>
        </InsightCard>

        <div className="flex flex-col justify-between">
          <InsightCard title="Implikasi & Rekomendasi">
            <ul className="list-disc list-inside text-sm text-teks space-y-2">
            <li>Standarisasi Gizi Makanan Olahan: Mengingat lebih dari sepertiga pengeluaran dialokasikan untuk makanan dan minuman jadi, pemerintah daerah perlu memperkuat pengawasan standar gizi, kebersihan, dan keterjangkauan harga pada sektor kuliner dan makanan olahan.</li>
            <li>Manajemen Rantai Pasok Spasial: Kesenjangan yang kontras antara wilayah lumbung padi dan wilayah defisit perkotaan mengharuskan adanya manajemen distribusi logistik pangan yang efisien. Rantai pasok dari klaster "Sentra Produksi Pertanian" harus diintegrasikan langsung untuk menyuplai daerah urban.</li>
            <li>Intervensi Kebijakan Berbasis Klaster: Program bantuan dan penyuluhan pertanian tidak bisa disamaratakan. Daerah yang masuk dalam klaster "Basis Ekonomi Pertanian" membutuhkan kebijakan peningkatan produktivitas hasil tani, sedangkan klaster "Pertanian Produktif" dapat difokuskan pada inovasi teknologi pertanian dan penyerapan tenaga kerja.</li>
          </ul>
          </InsightCard>
        </div>
      </div>
    </div>
  );
}