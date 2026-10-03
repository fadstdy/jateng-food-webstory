import { InsightCard, SourceTag } from '../components/UI';

export default function Hierarki() {
  return (
    <div className="grid md:grid-cols-3 gap-6 min-h-[450px]">
      <div className="md:col-span-2 bg-putih border border-garis rounded-xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
        <p className="font-display text-lg text-hijau-utama font-semibold mb-2">
          [ Visualisasi Hierarki / Treemap ]
        </p>
        <p className="text-sm text-teks-sekunder max-w-md">
          Di sini akan diletakkan grafik Sunburst, Treemap, atau Dendrogram untuk menampilkan 
          pengelompokan kategori kuliner dan sub-kategori bahan pangan.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <InsightCard title="Struktur & Pengelompokan">
          <p className="text-sm text-teks">
            Penjelasan mengenai bagaimana kuliner dikelompokkan berdasarkan jenis bahan baku, 
            karakter rasa, atau tradisi penyajian.
          </p>
        </InsightCard>
        <SourceTag text="Sumber: Taksonomi Kuliner & Klasifikasi BPS" />
      </div>
    </div>
  );
}