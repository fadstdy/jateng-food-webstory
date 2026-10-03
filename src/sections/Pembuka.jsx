import { InsightCard, SourceTag } from '../components/UI';

export default function Pembuka() {
  return (
    <div className="flex flex-col gap-6 py-8">
      <div className="bg-putih border border-garis rounded-xl p-8 shadow-sm text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-hijau-utama mb-4">
          Eksplorasi Kuliner Jawa Tengah
        </h1>
        <p className="text-teks-sekunder max-w-2xl mx-auto leading-relaxed">
          Sebuah narasi data interaktif yang memetakan kekayaan warisan kuliner, 
          distribusi wilayah, serta analisis pola konsumsi pangan daerah di Jawa Tengah.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <InsightCard title="Pengantar Cerita">
          <p className="text-sm text-teks">
            Latar belakang ringkas mengenai keanekaragaman kuliner Jawa Tengah dan 
            mengapa visualisasi data ini penting untuk disimak.
          </p>
        </InsightCard>
        
        <div className="flex flex-col justify-between">
          <InsightCard title="Sorotan Utama">
            <p className="text-sm text-teks">
              Rangkuman poin-poin kunci atau metrik statistik awal yang diperkenalkan kepada pembaca.
            </p>
          </InsightCard>
          <SourceTag text="Sumber: Survei Sosial Ekonomi Nasional (Susenas) & Koleksi Data Daerah" />
        </div>
      </div>
    </div>
  );
}