import { useState, useEffect, lazy, Suspense } from 'react';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';

// Lazy load Plotly untuk performa (Wajib untuk Vite)
const Plot = lazy(() => import('../components/PlotlyWrapper'));

// Utilitas untuk menghitung kontras teks (WCAG AA)
const getContrastColor = (rgbString) => {
  if (!rgbString || rgbString.startsWith('#')) return '#000000';
  const rgb = rgbString.match(/\d+/g)?.map(Number) || [255, 255, 255];
  const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
  return luminance > 0.45 ? '#000000' : '#ffffff';
};

const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
const formatNum = (num) => new Intl.NumberFormat('id-ID').format(num);
const formatPct = (num) => new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(num) + '%';

export default function Hierarki() {
  const [plotData, setPlotData] = useState({ treemap: null, sunburst: null });
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('treemap'); // State untuk tab mobile

  useEffect(() => {
    // Gunakan import.meta.env.BASE_URL agar aman saat di-deploy ke GitHub Pages
    fetch(`${import.meta.env.BASE_URL}data/hierarki.json`)
      .then(res => {
        if (!res.ok) throw new Error('Gagal memuat data');
        return res.json();
      })
      .then(data => {
        // --- 1. MENGHITUNG KARTU INSIGHT DINAMIS ---
        const level2 = data.filter(d => d.level === 2).sort((a, b) => b.pengeluaran - a.pengeluaran);
        const level3 = data.filter(d => d.level === 3).sort((a, b) => b.pengeluaran - a.pengeluaran);
        const totalPengeluaran = level2.reduce((sum, d) => sum + d.pengeluaran, 0);

        const largestGroup = level2[0];
        const top3Share = ((level2[0].pengeluaran + level2[1].pengeluaran + level2[2].pengeluaran) / totalPengeluaran) * 100;
        const largestCommodity = level3[0];

        setInsights({
          largestGroup: { label: largestGroup.label, val: formatRp(largestGroup.pengeluaran), pct: formatPct((largestGroup.pengeluaran / totalPengeluaran) * 100) },
          top3Share: formatPct(top3Share),
          largestCommodity: { label: largestCommodity.label, val: formatRp(largestCommodity.pengeluaran), pct: formatPct((largestCommodity.pengeluaran / totalPengeluaran) * 100) }
        });

        // --- 2. MENGHITUNG NILAI INDUK AGAR KOTAK PENUH (Mencegah Branchvalues Remainder) ---
        const calculatedValues = {};
        data.forEach(row => {
          if (row.level === 3) calculatedValues[row.parent] = (calculatedValues[row.parent] || 0) + row.pengeluaran;
        });
        data.forEach(row => {
          if (row.level === 2) calculatedValues[row.parent] = (calculatedValues[row.parent] || 0) + (calculatedValues[row.id] || row.pengeluaran);
        });

        // --- 3. SKALA WARNA KATEGORIKAL ---
        const level2Groups = level2.map(d => d.id);
        const colorScale = scaleOrdinal(schemeCategory10).domain(level2Groups);

        // --- 4. MENYIAPKAN ARRAY UNTUK PLOTLY ---
        const ids = []; const labels = []; const parents = []; const values = [];
        const customdata = []; const colors = []; const textColors = [];

        data.forEach(row => {
          ids.push(row.id);
          labels.push(row.label);
          parents.push(row.parent || ""); 
          
          const exactValue = row.level < 3 ? calculatedValues[row.id] : row.pengeluaran;
          values.push(exactValue);

          let bgColor = 'rgb(243, 244, 246)'; // Netral untuk Root
          if (row.level === 2) {
            bgColor = colorScale(row.id);
          } else if (row.level === 3) {
            bgColor = colorScale(row.parent); // Mewarisi warna induk
          }
          colors.push(bgColor);
          textColors.push(getContrastColor(bgColor));

          customdata.push({
            shareTotal: row.share_dari_total || 0,
            shareInduk: row.share_dari_induk || 0,
            kuantitas: row.kuantitas ? `${formatNum(row.kuantitas)}${row.satuan}` : '-',
            harga: row.harga_implisit ? `${formatRp(row.harga_implisit)} / kg` : 'Tidak dihitung'
          });
        });

        const commonTraceProps = {
          ids, labels, parents, values, customdata,
          branchvalues: 'total',
          hovertemplate: 
            "<b>%{label}</b><br>" +
            "<span class='text-xs opacity-75'>%{id}</span><br><br>" +
            "Pengeluaran: <b>%{value:$,.0f}</b>/kapita<br>" +
            "Kuantitas: %{customdata.kuantitas}<br>" +
            "Harga Implisit: %{customdata.harga}<extra></extra>",
          textfont: { color: textColors, size: 14 },
          marker: { colors, line: { width: 1, color: '#ffffff' } },
          pathbar: { visible: true, textfont: { size: 14 }, thickness: 32 },
          maxdepth: 2
        };

        setPlotData({
          treemap: [{ type: 'treemap', tiling: { pad: 2 }, ...commonTraceProps }],
          sunburst: [{ type: 'sunburst', ...commonTraceProps }]
        });
        
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (error) return <div className="p-4 text-red-600 bg-red-50 rounded-lg text-center font-medium">Error: {error}</div>;

  return (
    // h-[calc(100vh-90px)] membatasi tinggi section seukuran layar (dikurangi tinggi navbar)
    // flex & flex-col mengatur tumpukan secara dinamis
    <section className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-4 h-[calc(100vh-90px)] min-h-[500px] flex flex-col">
      
      {/* HEADER: Ukuran font judul diturunkan (text-xl md:text-2xl) dan dibuat shrink-0 agar tidak tertekan */}
      <div className="mb-4 shrink-0 w-full">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
          Peta & Proporsi Pengeluaran Pangan
        </h2>
        <p className="text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
          Rata-rata pengeluaran makanan per kapita sebulan, Jawa Tengah, 2025 (Rupiah)
        </p>
      </div>

      {/* GRID KONTEN: flex-1 dan min-h-0 adalah kunci agar tidak meluap (overflow) ke bawah layar */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">
        
        {/* KOLOM KIRI (33%) */}
        <div className="lg:col-span-4 flex flex-col h-full gap-4">
          
          {/* TAB PEMILIHAN GRAFIK */}
          <div className="flex rounded-lg bg-gray-200/60 p-1 shadow-inner shrink-0">
            <button 
              onClick={() => setActiveTab('treemap')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'treemap' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Treemap
            </button>
            <button 
              onClick={() => setActiveTab('sunburst')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'sunburst' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Sunburst
            </button>
          </div>

          {/* KARTU INSIGHT: Menggunakan overflow-y-auto jika tinggi layar sangat kecil */}
          {insights && (
            <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1 pb-1">
              <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl shadow-sm">
                <p className="text-[11px] text-blue-600 font-bold uppercase tracking-wider mb-1">Kelompok Terbesar</p>
                <p className="text-base font-bold text-gray-900 leading-tight">{insights.largestGroup.label}</p>
                <p className="text-xs text-gray-700 mt-1">{insights.largestGroup.val} ({insights.largestGroup.pct} dari total)</p>
              </div>
              <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl shadow-sm">
                <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider mb-1">Konsentrasi 3 Teratas</p>
                <p className="text-base font-bold text-gray-900 leading-tight">{insights.top3Share} Pengeluaran</p>
                <p className="text-xs text-gray-700 mt-1">Terserap hanya oleh 3 kelompok utama.</p>
              </div>
              <div className="bg-purple-50/50 border border-purple-100 p-3 rounded-xl shadow-sm">
                <p className="text-[11px] text-purple-600 font-bold uppercase tracking-wider mb-1">Komoditas Tunggal Tertinggi</p>
                <p className="text-base font-bold text-gray-900 leading-tight">{insights.largestCommodity.label}</p>
                <p className="text-xs text-gray-700 mt-1">{insights.largestCommodity.val} ({insights.largestCommodity.pct} dari total)</p>
              </div>
            </div>
          )}
        </div>

        {/* KOLOM KANAN (67%): Area Grafik */}
        {/* Menggunakan relative dan absolute inset-0 agar Plotly mutlak menempel pada batas container */}
        <div className="lg:col-span-8 relative w-full h-full bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          {loading ? (
             <div className="absolute inset-0 flex items-center justify-center bg-gray-50 animate-pulse text-gray-500">Memuat Visualisasi...</div>
          ) : (
            <>
              {/* TREEMAP */}
              {/* pb-7 memberikan ruang aman agar grafik tidak menabrak tulisan Sumber di pojok kanan bawah */}
              <div className={`absolute inset-0 p-1 pb-7 ${activeTab === 'treemap' ? 'block' : 'hidden'}`}>
                <Suspense fallback={<div className="w-full h-full bg-gray-50 animate-pulse"></div>}>
                  <Plot
                    data={plotData.treemap}
                    layout={{ margin: { t: 0, l: 0, r: 0, b: 0 }, autosize: true, paper_bgcolor: 'transparent', uniformtext: { minsize: 10, mode: 'hide' } }}
                    config={{ displayModeBar: false, scrollZoom: false, responsive: true }}
                    style={{ width: '100%', height: '100%' }} useResizeHandler={true}
                  />
                </Suspense>
              </div>

              {/* SUNBURST */}
              <div className={`absolute inset-0 p-1 pb-7 ${activeTab === 'sunburst' ? 'block' : 'hidden'}`}>
                <Suspense fallback={<div className="w-full h-full bg-gray-50 animate-pulse"></div>}>
                  <Plot
                    data={plotData.sunburst}
                    layout={{ margin: { t: 0, l: 0, r: 0, b: 0 }, autosize: true, paper_bgcolor: 'transparent', uniformtext: { minsize: 10, mode: 'hide' } }}
                    config={{ displayModeBar: false, scrollZoom: false, responsive: true }}
                    style={{ width: '100%', height: '100%' }} useResizeHandler={true}
                  />
                </Suspense>
              </div>
            </>
          )}
          
          <div className="absolute bottom-2 right-3 text-[10px] text-gray-400 bg-white/80 px-2 py-0.5 rounded pointer-events-none z-10">
            Sumber: BPS, Susenas Jawa Tengah 2025
          </div>
        </div>

      </div>
    </section>
  );
}    