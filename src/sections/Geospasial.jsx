import { useEffect, useState } from 'react';
import JatengMap from '../components/Map/JatengMap';
import MapControls from '../components/Map/MapControls';
import MapLegend from '../components/Map/MapLegend';
import InsightCard from '../components/Map/InsightCard';
import MoranChart from '../components/Map/MoranChart';
import DesignNotes from '../components/Map/DesignNodes';

export default function Geospasial() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // State Kontrol (Diperbarui untuk Tahap 2)
  const [year, setYear] = useState(2020);
  const [baseLayer, setBaseLayer] = useState('choropleth'); // 'choropleth' atau 'lisa'
  const [showSymbols, setShowSymbols] = useState(true);
  const [selectedKabkota, setSelectedKabkota] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const baseUrl = import.meta.env.BASE_URL;
        const [geoRes, tsRes, metaRes, moranRes] = await Promise.all([
          fetch(`${baseUrl}data/jateng_kabkota.geojson`),
          fetch(`${baseUrl}data/data_wilayah_tahun.json`),
          fetch(`${baseUrl}data/metadata.json`),
          fetch(`${baseUrl}data/moran_global.json`)
        ]);

        if (!geoRes.ok) throw new Error("Gagal memuat jateng_kabkota.geojson");
        if (!tsRes.ok) throw new Error("Gagal memuat data_wilayah_tahun.json");
        if (!metaRes.ok) throw new Error("Gagal memuat metadata.json");
        if (!moranRes.ok) throw new Error("Gagal memuat moran_global.json");

        const geo = await geoRes.json();
        const ts = await tsRes.json();
        const meta = await metaRes.json();
        const moran = await moranRes.json();

        // Validasi 35 Kode
        const geoCodes = new Set(geo.features.map(f => String(f.properties.kode_kabkota)));
        if (geoCodes.size !== 35) throw new Error("GeoJSON tidak berisi tepat 35 wilayah!");

        // Restrukturisasi data time-series
        const dict = {};
        ts.forEach(row => {
          const kode = String(row.kode_kabkota);
          if (!dict[kode]) dict[kode] = {};
          dict[kode][row.tahun] = row;
        });

        setData({ geo, ts: dict, meta, moran });
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="flex h-96 items-center justify-center font-medium">Memuat data geospasial...</div>;
  if (error) return <div className="flex h-96 items-center justify-center text-red-600 font-bold p-4 text-center">{error}</div>;

  return (
    // Lebarnya diperbesar jadi max-w-6xl untuk menampung panel baru di sebelah kiri
    <section className="relative w-full max-w-6xl mx-auto py-12 px-4 flex flex-col gap-6">
      
      {/* Header Judul */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Ketahanan Pangan dan Struktur Pekerja Jawa Tengah (2020-2025)</h2>
        <p className="text-gray-600 text-sm max-w-3xl">
          {/* TODO: Placeholder narasi scrollytelling */}
          Eksplorasi perbandingan hasil panen padi per penduduk dengan jumlah tenaga kerja sektor pertanian, serta efek ketetanggaan wilayah lumbung padi.
        </p>
      </div>

      {/* Grid Layout Baru (Tahap 2): Kiri untuk Panel Insight, Kanan untuk Peta */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Kolom Kiri: Panel Informasi (Insight & Moran) */}
        <div className="lg:col-span-1 flex flex-col gap-6 order-2 lg:order-1">
           <InsightCard data={data} year={year} geo={data.geo} />
           <MoranChart moranData={data.moran} currentYear={year} meta={data.meta} />
        </div>

        {/* Kolom Kanan: Container Peta & Legenda Utama */}
        <div className="lg:col-span-3 flex flex-col gap-4 order-1 lg:order-2">
          
          <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white flex flex-col md:flex-row">
            <div className="relative w-full md:w-3/4 h-[420px] md:h-[560px]">
              <JatengMap 
                data={data} 
                year={year} 
                baseLayer={baseLayer}
                showSymbols={showSymbols}
                selectedKabkota={selectedKabkota}
                setSelectedKabkota={setSelectedKabkota}
              />
              <MapControls 
                year={year} setYear={setYear}
                baseLayer={baseLayer} setBaseLayer={setBaseLayer}
                showSymbols={showSymbols} setShowSymbols={setShowSymbols}
              />
            </div>

            <div className="w-full md:w-1/4 bg-gray-50 p-4 lg:overflow-y-auto lg:h-[560px] border-t md:border-t-0 md:border-l border-gray-200">
               <MapLegend data={data} baseLayer={baseLayer} />
            </div>
          </div>

          {/* Footer Bawah Peta */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs text-gray-500">
            <span>Sumber: {/* TODO: Placeholder judul tabel BPS */} BPS Provinsi Jawa Tengah (2020-2025).</span>
            <DesignNotes meta={data.meta} />
          </div>

        </div>
      </div>
    </section>
  );
}