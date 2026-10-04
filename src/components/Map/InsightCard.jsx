export default function InsightCard({ data, year, geo }) {
  const { ts } = data;
  
  // Ambil nama dari GeoJSON berdasar kode
  const getName = (kode) => {
    const feature = geo.features.find(f => String(f.properties.kode_kabkota) === String(kode));
    return feature ? feature.properties.nama_kabkota : kode;
  };

  // Kumpulkan data tahun aktif
  const currentData = Object.entries(ts).map(([kode, yearsData]) => {
     return { kode, ...yearsData[year] };
  }).filter(d => d.padi_per_kapita != null); // Hindari data null

  if (currentData.length === 0) return null;

  // Kalkulasi Insight
  const highestPadi = currentData.reduce((prev, curr) => (prev.padi_per_kapita > curr.padi_per_kapita) ? prev : curr);
  const lowestPadi = currentData.reduce((prev, curr) => (prev.padi_per_kapita < curr.padi_per_kapita) ? prev : curr);
  
  const countHH = currentData.filter(d => d.lisa_uni === 'HH').length;
  const countLL = currentData.filter(d => d.lisa_uni === 'LL').length;

  const highestPekerja = currentData.reduce((prev, curr) => (prev.penduduk_kerja_pertanian > curr.penduduk_kerja_pertanian) ? prev : curr);

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 shadow-sm">
      <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
         <span className="text-xl">💡</span> Sorotan {year}
      </h3>
      
      <ul className="space-y-3 text-sm text-gray-800">
        <li>
          Padi per kapita <strong>tertinggi</strong> ada di <strong className="text-blue-700">{getName(highestPadi.kode)}</strong> dan <strong>terendah</strong> di <strong className="text-blue-700">{getName(lowestPadi.kode)}</strong>.
        </li>
        <li>
          Terdapat <strong className="text-orange-600">{countHH} wilayah lumbung padi (HH)</strong> yang saling bertetangga, kontras dengan <strong className="text-cyan-700">{countLL} wilayah defisit (LL)</strong>.
        </li>
        <li>
          Serapan pekerja tani terbanyak berada di <strong className="text-blue-700">{getName(highestPekerja.kode)}</strong> ({(highestPekerja.penduduk_kerja_pertanian).toLocaleString('id-ID')} jiwa).
        </li>
      </ul>
    </div>
  );
}