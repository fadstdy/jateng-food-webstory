export default function InsightCard({ data, year, geo }) {
  const { ts } = data;
  
  const getName = (kode) => {
    const feature = geo.features.find(f => String(f.properties.kode_kabkota) === String(kode));
    return feature ? feature.properties.nama_kabkota : kode;
  };

  const currentData = Object.entries(ts).map(([kode, yearsData]) => {
     return { kode, ...yearsData[year] };
  }).filter(d => d.padi_per_kapita != null); 

  if (currentData.length === 0) return null;

  const highestPadi = currentData.reduce((prev, curr) => (prev.padi_per_kapita > curr.padi_per_kapita) ? prev : curr);
  const lowestPadi = currentData.reduce((prev, curr) => (prev.padi_per_kapita < curr.padi_per_kapita) ? prev : curr);
  const countHH = currentData.filter(d => d.lisa_uni === 'HH').length;
  const countLL = currentData.filter(d => d.lisa_uni === 'LL').length;
  const highestPekerja = currentData.reduce((prev, curr) => (prev.penduduk_kerja_pertanian > curr.penduduk_kerja_pertanian) ? prev : curr);

  return (
    // DIET: P-4 menjadi p-3
    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 shadow-sm w-full">
      {/* MB-3 menjadi mb-2 */}
      <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-1.5 text-sm">
         <span></span> Sorotan {year}
      </h3>
      
      {/* Space-y-3 jadi space-y-2, teks jadi 12px (text-xs) */}
      <ul className="space-y-2 text-xs text-gray-800 leading-tight">
        <li>
          Padi per kapita <strong>tertinggi</strong> ada di <strong className="text-blue-700">{getName(highestPadi.kode)}</strong> dan <strong>terendah</strong> di <strong className="text-blue-700">{getName(lowestPadi.kode)}</strong>.
        </li>
        <li>
          Terdapat <strong className="text-orange-600">{countHH} wilayah lumbung (HH)</strong> yang bertetangga, kontras dengan <strong className="text-cyan-700">{countLL} defisit (LL)</strong>.
        </li>
        <li>
          Pekerja tani terbanyak di <strong className="text-blue-700">{getName(highestPekerja.kode)}</strong> ({(highestPekerja.penduduk_kerja_pertanian).toLocaleString('id-ID')} jiwa).
        </li>
      </ul>
    </div>
  );
}