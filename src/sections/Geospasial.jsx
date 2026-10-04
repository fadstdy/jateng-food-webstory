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
    // DIET 1: Padding py-6 diubah jadi py-2 (sangat mepet atas bawah)
    <section className="relative w-full max-w-[1400px] mx-auto py-2 px-4 flex flex-col gap-3 min-h-screen justify-center">
      
      {/* Header Judul (Gap diperkecil) */}
      <div className="space-y-0.5">
        <h2 className="text-xl md:text-[22px] font-bold text-gray-900 leading-tight">Produksi Padi per Kapita dan Tenaga Kerja Pertanian Jawa Tengah (2020-2025)</h2>
        <p className="text-gray-600 text-xs max-w-4xl leading-tight">
          Eksplorasi hasil panen padi per penduduk, jumlah tenaga kerja sektor pertanian, serta efek ketetanggaan wilayah lumbung padi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        
        <div className="lg:col-span-3 flex flex-col gap-3 order-2 lg:order-1 h-full">
           <div className="flex flex-col h-full gap-3">
             <div className="shrink-0">
                <InsightCard data={data} year={year} geo={data.geo} />
             </div>
             <div className="flex-1 flex flex-col min-h-0">
                <MoranChart moranData={data.moran} currentYear={year} meta={data.meta} />
             </div>
           </div>
        </div>

        {/* DIET 2: Tinggi absolut turun dari 520px menjadi 420px */}
        <div className="lg:col-span-9 flex flex-col md:flex-row gap-0 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white order-1 lg:order-2 h-[400px] md:h-[420px]">
          
          <div className="relative w-full md:w-[75%] h-full">
            <JatengMap 
              data={data} 
              year={year} 
              baseLayer={baseLayer}
              showSymbols={showSymbols}
              selectedKabkota={selectedKabkota}
              setSelectedKabkota={setSelectedKabkota}
            />
            {/* Supaya slider tidak nempel terlalu bawah di peta kecil */}
            <div className="absolute bottom-2 left-2 z-[400]">
               <MapControls year={year} setYear={setYear} />
            </div>
          </div>

          <div className="w-full md:w-[25%] bg-gray-50 flex flex-col border-t md:border-t-0 md:border-l border-gray-200 h-full">
             
             {/* Legenda (Padding dikurangi) */}
             <div className="p-3 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                <MapLegend data={data} baseLayer={baseLayer} />
             </div>

             {/* Pilihan Layer (Padding dan margin dikurangi) */}
             <div className="p-3 bg-white border-t border-gray-200 shrink-0 flex flex-col gap-1.5">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Pilihan Layer Warna</div>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="baselayer" className="w-3.5 h-3.5 accent-green-700" checked={baseLayer === 'choropleth'} onChange={() => setBaseLayer('choropleth')} />
                  <span className="text-[11px] font-medium text-gray-800 group-hover:text-green-700 transition-colors">Choropleth (Kuantil)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="baselayer" className="w-3.5 h-3.5 accent-orange-600" checked={baseLayer === 'lisa'} onChange={() => setBaseLayer('lisa')} />
                  <span className="text-[11px] font-medium text-gray-800 group-hover:text-orange-600 transition-colors">Klaster LISA (Spasial)</span>
                </label>
                <div className="w-full h-px bg-gray-100 my-0.5"></div>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-3.5 h-3.5 accent-gray-700 rounded" checked={showSymbols} onChange={e => setShowSymbols(e.target.checked)} />
                  <span className="text-[11px] font-medium text-gray-800">Simbol (Pekerja Tani)</span>
                </label>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}