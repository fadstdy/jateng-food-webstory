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
    <section className="w-full max-w-7xl mx-auto py-12 px-4 md:px-8">
      {/* HEADER & INSIGHTS */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Peta & Proporsi Pengeluaran Pangan</h2>
        <p className="text-gray-600 mb-6">Rata-rata pengeluaran makanan per kapita sebulan, Jawa Tengah, 2025 (Rupiah)</p>

        {insights && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl shadow-sm">
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Kelompok Terbesar</p>
              <p className="text-lg font-bold text-gray-900">{insights.largestGroup.label}</p>
              <p className="text-sm text-gray-700">{insights.largestGroup.val} ({insights.largestGroup.pct} dari total)</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl shadow-sm">
              <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider mb-1">Konsentrasi 3 Teratas</p>
              <p className="text-lg font-bold text-gray-900">{insights.top3Share} Pengeluaran</p>
              <p className="text-sm text-gray-700">Terserap hanya oleh 3 kelompok makanan utama.</p>
            </div>
            <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl shadow-sm">
              <p className="text-xs text-purple-600 font-semibold uppercase tracking-wider mb-1">Komoditas Tunggal Tertinggi</p>
              <p className="text-lg font-bold text-gray-900">{insights.largestCommodity.label}</p>
              <p className="text-sm text-gray-700">{insights.largestCommodity.val} ({insights.largestCommodity.pct} dari total)</p>
            </div>
          </div>
        )}
      </div>

      {/* TABS UNTUK MOBILE */}
      <div className="md:hidden flex rounded-lg bg-gray-100 p-1 mb-4 shadow-inner">
        <button 
          onClick={() => setActiveTab('treemap')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'treemap' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Treemap
        </button>
        <button 
          onClick={() => setActiveTab('sunburst')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'sunburst' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Sunburst
        </button>
      </div>

      {/* CONTAINER GRAFIK */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4">
        {/* Treemap */}
        <div className={`relative w-full h-[450px] md:h-[560px] bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden ${activeTab === 'treemap' ? 'block' : 'hidden md:block'}`}>
          {loading ? (
             <div className="absolute inset-0 flex items-center justify-center bg-gray-50 animate-pulse text-gray-500">Memuat Treemap...</div>
          ) : (
            <Suspense fallback={<div className="w-full h-full bg-gray-50 animate-pulse"></div>}>
              <Plot
                data={plotData.treemap}
                layout={{ margin: { t: 0, l: 0, r: 0, b: 0 }, autosize: true, paper_bgcolor: 'transparent', uniformtext: { minsize: 10, mode: 'hide' } }}
                config={{ displayModeBar: false, scrollZoom: false, responsive: true }}
                style={{ width: '100%', height: '100%' }} useResizeHandler={true}
              />
            </Suspense>
          )}
        </div>

        {/* Sunburst */}
        <div className={`relative w-full h-[450px] md:h-[560px] bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden ${activeTab === 'sunburst' ? 'block' : 'hidden md:block'}`}>
          {loading ? (
             <div className="absolute inset-0 flex items-center justify-center bg-gray-50 animate-pulse text-gray-500">Memuat Sunburst...</div>
          ) : (
            <Suspense fallback={<div className="w-full h-full bg-gray-50 animate-pulse"></div>}>
              <Plot
                data={plotData.sunburst}
                layout={{ margin: { t: 0, l: 0, r: 0, b: 0 }, autosize: true, paper_bgcolor: 'transparent', uniformtext: { minsize: 10, mode: 'hide' } }}
                config={{ displayModeBar: false, scrollZoom: false, responsive: true }}
                style={{ width: '100%', height: '100%' }} useResizeHandler={true}
              />
            </Suspense>
          )}
        </div>
      </div>

      <div className="mt-3 text-right text-xs text-gray-500">
        Sumber: BPS, Pengeluaran untuk Konsumsi Penduduk Provinsi Jawa Tengah, 2025
      </div>

      {/* CATATAN RANCANGAN (ACCORDION) */}
      <details className="mt-8 group bg-gray-50 border border-gray-200 rounded-xl shadow-sm [&_summary::-webkit-details-marker]:hidden">
        <summary className="flex items-center justify-between cursor-pointer p-5 font-semibold text-gray-800 transition-colors hover:bg-gray-100">
          <span>Catatan Rancangan & Metodologi Visualisasi</span>
          <span className="transition group-open:rotate-180">
            <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
          </span>
        </summary>
        <div className="p-5 border-t border-gray-200 text-sm text-gray-700 leading-relaxed space-y-3 bg-white rounded-b-xl">
          <p>Visualisasi ini dibangun mematuhi prinsip desain informasi untuk hierarki data:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Ukuran/Area/Sudut:</strong> Mengkodekan variabel kuantitatif (Total Pengeluaran). Metode ini sangat efektif untuk membandingkan porsi bagian terhadap keseluruhan <em>(part-to-whole)</em> secara intuitif.</li>
            <li><strong>Warna:</strong> Mengkodekan variabel nominal/kategorikal (Kelompok Makanan). Komoditas mewarisi warna dari kelompok induknya untuk mempermudah identifikasi pola spasial.</li>
            <li><strong>Navigasi <em>Drill-down</em>:</strong> Menggunakan struktur bersarang <em>(nesting)</em> dengan batas <code>maxdepth: 2</code> agar layar tidak terlalu padat. Sinkronisasi kedalaman difasilitasi oleh fitur <em>pathbar</em> bawaan yang dijamin stabil karena dikelola langsung oleh <em>engine</em> SVG tanpa siklus render ulang DOM eksternal.</li>
          </ul>
          <p className="mt-2 font-semibold">Keterbatasan Data & Penyesuaian:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Nilai induk (Level 2) direkalkulasi secara dinamis di <em>frontend</em> untuk memastikan 100% kongruen dengan total anak-anaknya, guna menghindari ruang kosong <em>(remainder/blank space)</em> akibat selisih pembulatan publikasi data BPS asli.</li>
            <li>Harga implisit tidak digunakan sebagai dimensi visual utama karena tidak dapat diagregasikan pada entitas bersatuan jamak, dan bukan merepresentasikan harga pasar melainkan proksi nilai.</li>
          </ul>
        </div>
      </details>
    </section>
  );
}