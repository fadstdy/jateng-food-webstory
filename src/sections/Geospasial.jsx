import { useEffect, useState, useMemo } from 'react';
import JatengMap from '../components/Map/JatengMap';
import MapControls from '../components/Map/MapControls';
import MapLegend from '../components/Map/MapLegend';

export default function Geospasial() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // State Kontrol
  const [year, setYear] = useState(2020);
  const [showChoropleth, setShowChoropleth] = useState(true);
  const [showSymbols, setShowSymbols] = useState(true);
  const [selectedKabkota, setSelectedKabkota] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Gunakan BASE_URL bawaan Vite
        const baseUrl = import.meta.env.BASE_URL;

        const [geoRes, tsRes, metaRes] = await Promise.all([
          fetch(`${baseUrl}data/jateng_kabkota.geojson`),
          fetch(`${baseUrl}data/data_wilayah_tahun.json`),
          fetch(`${baseUrl}data/metadata.json`)
        ]);

        if (!geoRes.ok) throw new Error("Gagal memuat jateng_kabkota.geojson");
        if (!tsRes.ok) throw new Error("Gagal memuat data_wilayah_tahun.json");
        if (!metaRes.ok) throw new Error("Gagal memuat metadata.json");
        
        const geo = await geoRes.json();
        const ts = await tsRes.json();
        const meta = await metaRes.json();

        // Validasi 35 Kode Kab/Kota
        const geoCodes = new Set(geo.features.map(f => String(f.properties.kode_kabkota)));
        const tsCodes = new Set(ts.map(d => String(d.kode_kabkota)));
        
        const missingInGeo = [...tsCodes].filter(c => !geoCodes.has(c));
        const missingInTs = [...geoCodes].filter(c => !tsCodes.has(c));

        if (geoCodes.size !== 35 || missingInGeo.length > 0 || missingInTs.length > 0) {
          throw new Error(`Data tidak valid! Ditemukan ${geoCodes.size} wilayah di GeoJSON. Mismatch kode -> Tidak ada di GeoJSON: ${missingInGeo.join(', ')} | Tidak ada di Data Tahun: ${missingInTs.join(', ')}`);
        }

        // Restrukturisasi data time-series menjadi dictionary agar akses cepat (O(1))
        const dict = {};
        ts.forEach(row => {
          const kode = String(row.kode_kabkota);
          if (!dict[kode]) dict[kode] = {};
          dict[kode][row.tahun] = row;
        });

        setData({ geo, ts: dict, meta });
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="flex h-96 items-center justify-center font-medium">Memuat data spasial...</div>;
  if (error) return <div className="flex h-96 items-center justify-center text-red-600 font-bold p-4 text-center">{error}</div>;

  return (
    <section className="relative w-full max-w-5xl mx-auto py-12 px-4 flex flex-col gap-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-gray-900">Produksi padi per kapita dan pekerja pertanian menurut kab/kota, Jawa Tengah, 2020-2025</h2>
        <p className="text-gray-600 text-sm">
          {/* TODO: Placeholder narasi scrollytelling */}
          Eksplorasi perbandingan hasil panen padi per penduduk dengan jumlah tenaga kerja sektor pertanian.
        </p>
      </div>

      {/* Container Peta Utama */}
      <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white flex flex-col lg:flex-row">
        
        <div className="relative w-full lg:w-3/4 h-[420px] lg:h-[560px]">
          <JatengMap 
            data={data} 
            year={year} 
            showChoropleth={showChoropleth}
            showSymbols={showSymbols}
            selectedKabkota={selectedKabkota}
            setSelectedKabkota={setSelectedKabkota}
          />
          <MapControls 
            year={year} setYear={setYear}
            showChoropleth={showChoropleth} setShowChoropleth={setShowChoropleth}
            showSymbols={showSymbols} setShowSymbols={setShowSymbols}
          />
        </div>

        <div className="w-full lg:w-1/4 bg-gray-50 p-4 lg:overflow-y-auto lg:h-[560px] border-t lg:border-t-0 lg:border-l border-gray-200">
           <MapLegend data={data} />
        </div>
      </div>

      <div className="text-xs text-gray-500">
        Sumber: {/* TODO: Placeholder judul tabel BPS */} BPS Provinsi Jawa Tengah (2020-2025).
      </div>
    </section>
  );
}