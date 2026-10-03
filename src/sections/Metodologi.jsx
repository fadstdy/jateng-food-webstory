import { InsightCard, SourceTag } from '../components/UI';

export default function Metodologi() {
  return (
    <div className="grid md:grid-cols-3 gap-6 py-6">
      <div className="md:col-span-2 bg-putih border border-garis rounded-xl p-6 shadow-sm">
        <h3 className="font-display text-xl font-bold text-hijau-utama mb-4">
          Metodologi & Pengolahan Data
        </h3>
        <div className="space-y-4 text-sm text-teks leading-relaxed">
          <p>
            <strong>1. Pengumpulan Data:</strong> Data dikumpulkan dari portal Open Data resmi, 
            publikasi Badan Pusat Statistik (BPS), serta survei literatur kuliner daerah.
          </p>
          <p>
            <strong>2. Pembersihan & Standarisasi:</strong> Tahapan *data cleaning*, penyesuaian kode wilayah (BPS), 
            serta transformasi format data spasial (GeoJSON).
          </p>
          <p>
            <strong>3. Teknik Visualisasi:</strong> Penggunaan pemetaan geospasial, bagan hierarki, 
            serta analisis variabel gizi/ekonomi.
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-between">
        <InsightCard title="Batasan Data">
          <p className="text-sm text-teks">
            Informasi keterbatasan data atau cangkupan cakupan wilayah yang dianalisis dalam proyek ini.
          </p>
        </InsightCard>
        <SourceTag text="Dokumentasi Teknis Proyek Webstory" />
      </div>
    </div>
  );
}