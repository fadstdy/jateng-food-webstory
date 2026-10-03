import { InsightCard, SourceTag } from '../components/UI';

export default function Kesimpulan() {
  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="bg-putih border border-garis rounded-xl p-8 shadow-sm text-center">
        <h2 className="font-display text-2xl font-bold text-hijau-utama mb-3">
          Kesimpulan & Catatan Akhir
        </h2>
        <p className="text-sm text-teks-sekunder max-w-2xl mx-auto leading-relaxed">
          Rangkuman dari seluruh temuan spasial, hierarki, dan korelasi data kuliner Jawa Tengah.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <InsightCard title="Rangkuman Temuan">
          <ul className="list-disc list-inside text-sm text-teks space-y-2">
            <li>Poin kesimpulan utama dari distribusi geografis kuliner.</li>
            <li>Poin kesimpulan terkait pola konsumsi/kategori kuliner dominan.</li>
            <li>Rekomendasi atau potensi pelestarian warisan kuliner.</li>
          </ul>
        </InsightCard>

        <div className="flex flex-col justify-between">
          <InsightCard title="Implikasi & Rekomendasi">
            <p className="text-sm text-teks">
              Gagasan tindak lanjut bagi pengembangan pariwisata kuliner dan kebijakan pangan lokal.
            </p>
          </InsightCard>
          <SourceTag text="Tim Peneliti & Analis Data Webstory Jateng Food" />
        </div>
      </div>
    </div>
  );
}