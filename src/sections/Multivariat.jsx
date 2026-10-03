import { InsightCard, SourceTag } from '../components/UI';

export default function Multivariat() {
  return (
    <div className="grid md:grid-cols-3 gap-6 min-h-[450px]">
      <div className="md:col-span-2 bg-putih border border-garis rounded-xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
        <p className="font-display text-lg text-hijau-utama font-semibold mb-2">
          [ Visualisasi Multivariat / Scatter Plot / Parallel Coordinates ]
        </p>
        <p className="text-sm text-teks-sekunder max-w-md">
          Di sini akan diletakkan grafik korelasi antar variabel (misal: harga, nilai gizi, 
          atau popularitas kuliner antar kabupaten/kota).
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <InsightCard title="Analisis Antar Variabel">
          <p className="text-sm text-teks">
            Temuan atau pola hubungan korelasi yang ditemukan dari data multivariat.
          </p>
        </InsightCard>
        <SourceTag text="Sumber: Hasil Olah Data Sekunder 2023-2024" />
      </div>
    </div>
  );
}