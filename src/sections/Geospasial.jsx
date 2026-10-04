import { useEffect, useState } from 'react';
import JatengMap from '../components/Map/JatengMap';
import MapControls from '../components/Map/MapControls';
import MapLegend from '../components/Map/MapLegend';
import InsightCard from '../components/Map/InsightCard';
import MoranChart from '../components/Map/MoranChart';

export default function Geospasial() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [year, setYear] = useState(2020);
  const [baseLayer, setBaseLayer] = useState('choropleth'); 
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

        if (!geoRes.ok) throw new Error("Gagal geojson");
        if (!tsRes.ok) throw new Error("Gagal timeseries");
        if (!metaRes.ok) throw new Error("Gagal metadata");
        if (!moranRes.ok) throw new Error("Gagal moran");

        const geo = await geoRes.json();
        const ts = await tsRes.json();
        const meta = await metaRes.json();
        const moran = await moranRes.json();

        const geoCodes = new Set(geo.features.map(f => String(f.properties.kode_kabkota)));
        if (geoCodes.size !== 35) throw new Error("GeoJSON tidak berisi tepat 35 wilayah!");

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
    <section className="relative w-full max-w-[1400px] mx-auto py-6 px-4 flex flex-col gap-4 min-h-[calc(100vh-80px)] justify-center">
      
      <div className="space-y-1 mb-2">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">Produksi Padi per Kapita dan Tenaga Kerja Pertanian Jawa Tengah (2020–2025)</h2>
        <p className="text-gray-600 text-xs md:text-sm max-w-4xl leading-relaxed">
          Eksplorasi hasil panen padi per penduduk, jumlah tenaga kerja sektor pertanian, serta efek ketetanggaan wilayah lumbung padi.
        </p>
      </div>

      {/* Grid Utama diubah menggunakan items-stretch agar tinggi kiri dan kanan identik */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Panel Kiri: Insight & Moran */}
        <div className="lg:col-span-3 flex flex-col gap-4 order-2 lg:order-1 h-full">
           <div className="flex flex-col h-full gap-4">
             {/* Kartu Insight akan diam di atas */}
             <div className="shrink-0">
                <InsightCard data={data} year={year} geo={data.geo} />
             </div>
             {/* Kartu Moran akan dipaksa meregang (flex-1) ke bawah menutupi ruang kosong */}
             <div className="flex-1 flex flex-col min-h-0">
                <MoranChart moranData={data.moran} currentYear={year} meta={data.meta} />
             </div>
           </div>
        </div>

        {/* Panel Kanan: Peta & Legenda */}
        <div className="lg:col-span-9 flex flex-col md:flex-row gap-0 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white order-1 lg:order-2 h-[450px] md:h-[520px]">
          
          {/* Kolom Peta (75%) */}
          <div className="relative w-full md:w-[75%] h-full">
            <JatengMap 
              data={data} 
              year={year} 
              baseLayer={baseLayer}
              showSymbols={showSymbols}
              selectedKabkota={selectedKabkota}
              setSelectedKabkota={setSelectedKabkota}
            />
            <MapControls year={year} setYear={setYear} />
          </div>

          {/* Kolom Legenda & Pilihan Layer (25%) */}
          <div className="w-full md:w-[25%] bg-gray-50 flex flex-col border-t md:border-t-0 md:border-l border-gray-200 h-full">
             
             {/* Sembunyikan scrollbar bawaan dengan custom-scrollbar (atau overflow-hidden jika muat) */}
             <div className="p-4 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                <MapLegend data={data} baseLayer={baseLayer} />
             </div>

             <div className="p-4 bg-white border-t border-gray-200 shrink-0 flex flex-col gap-2">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Pilihan Layer Warna</div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="baselayer" className="w-4 h-4 accent-green-700" checked={baseLayer === 'choropleth'} onChange={() => setBaseLayer('choropleth')} />
                  <span className="text-xs font-medium text-gray-800 group-hover:text-green-700 transition-colors">Choropleth (Kuantil)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="baselayer" className="w-4 h-4 accent-orange-600" checked={baseLayer === 'lisa'} onChange={() => setBaseLayer('lisa')} />
                  <span className="text-xs font-medium text-gray-800 group-hover:text-orange-600 transition-colors">Klaster LISA (Spasial)</span>
                </label>
                
                <div className="w-full h-px bg-gray-100 my-1"></div>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 accent-gray-700 rounded" checked={showSymbols} onChange={e => setShowSymbols(e.target.checked)} />
                  <span className="text-xs font-medium text-gray-800">Simbol (Pekerja Tani)</span>
                </label>
             </div>

          </div>
        </div>

      </div>

      <div className="text-[11px] text-gray-500 pt-1 flex justify-between">
        <span>Sumber: BPS Provinsi Jawa Tengah (2020-2025).</span>
      </div>

    </section>
  );
}