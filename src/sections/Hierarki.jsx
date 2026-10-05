import { useState, useEffect, lazy, Suspense } from 'react';
import { scaleLinear } from 'd3-scale';

const Plot = lazy(() => import('../components/PlotlyWrapper'));

const getContrastColor = (colorString) => {
  if (!colorString) return '#ffffff';
  let r, g, b;
  
  if (colorString.startsWith('rgb')) {
    const match = colorString.match(/\d+/g);
    [r, g, b] = match ? match.map(Number) : [255, 255, 255];
  } else if (colorString.startsWith('#')) {
    const hex = colorString.replace('#', '');
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    return '#ffffff'; 
  }
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.40 ? '#000000' : '#ffffff';
};

const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
const formatPct = (num) => new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(num) + '%';
const formatNum = (num) => new Intl.NumberFormat('id-ID').format(num);

export default function Hierarki() {
  const [plotData, setPlotData] = useState({ treemap: null, sunburst: null });
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('treemap');

  const COLOR_LIMIT = 50; 

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/konsumsi_yoy.json`)
      .then(res => {
        if (!res.ok) throw new Error('Gagal memuat data');
        return res.json();
      })
      .then(data => {
        const levelGroups = data.filter(d => d.level === 1).sort((a, b) => b.pengeluaran_2025 - a.pengeluaran_2025);
        const levelCommodities = data.filter(d => d.level === 2).sort((a, b) => b.pengeluaran_2025 - a.pengeluaran_2025);
        const totalPengeluaran = levelGroups.reduce((sum, d) => sum + (d.pengeluaran_2025 || 0), 0);

        if (levelGroups.length >= 3 && levelCommodities.length > 0) {
          setInsights({
            largestGroup: { label: levelGroups[0].label, val: formatRp(levelGroups[0].pengeluaran_2025), pct: formatPct((levelGroups[0].pengeluaran_2025 / totalPengeluaran) * 100) },
            top3Share: formatPct(((levelGroups[0].pengeluaran_2025 + levelGroups[1].pengeluaran_2025 + levelGroups[2].pengeluaran_2025) / totalPengeluaran) * 100),
            largestCommodity: { label: levelCommodities[0].label, val: formatRp(levelCommodities[0].pengeluaran_2025), pct: formatPct((levelCommodities[0].pengeluaran_2025 / totalPengeluaran) * 100) }
          });
        }

        const colorScale = scaleLinear()
          .domain([-COLOR_LIMIT, 0, COLOR_LIMIT])
          .range(['#b2182b', '#f7f7f7', '#1b7837']) 
          .clamp(true); 

        const calculatedValues = {};
        data.forEach(row => {
          if (row.level === 2) calculatedValues[row.parent] = (calculatedValues[row.parent] || 0) + (row.pengeluaran_2025 || 0);
        });
        data.forEach(row => {
          if (row.level === 1) {
            const val = calculatedValues[row.id] || row.pengeluaran_2025 || 0;
            calculatedValues[row.parent] = (calculatedValues[row.parent] || 0) + val;
          }
        });

        const ids = []; const labels = []; const parents = []; const values = [];
        const customdata = []; const colors = []; const textColors = [];

        const allIds = new Set(data.map(d => d.id));
        if (!allIds.has("TOTAL")) {
            ids.push("TOTAL");
            labels.push("Total Pengeluaran Makanan");
            parents.push(""); 
            values.push(calculatedValues["TOTAL"] || 0);
            colors.push("#f3f4f6"); 
            textColors.push("#000000");
            customdata.push({ exp25: formatRp(calculatedValues["TOTAL"] || 0), exp24: "-", yoyFormat: "-", qty: "-", harga: "-" });
        }

        data.forEach(row => {
          ids.push(row.id);
          labels.push(row.label);
          
          if (row.id === "TOTAL") parents.push("");
          else parents.push(row.parent || ""); 
          
          const exactValue = (row.level === 1 || row.id === "TOTAL") ? (calculatedValues[row.id] || row.pengeluaran_2025) : row.pengeluaran_2025;
          values.push(exactValue);

          let bgColor = '#e5e7eb'; 
          if (row.pertumbuhan_yoy != null) {
             bgColor = colorScale(row.pertumbuhan_yoy);
          }
          
          colors.push(bgColor);
          textColors.push(getContrastColor(bgColor));

          customdata.push({
            exp25: formatRp(row.pengeluaran_2025 || 0),
            exp24: formatRp(row.pengeluaran_2024 || 0),
            yoyFormat: row.pertumbuhan_yoy != null ? `${row.pertumbuhan_yoy > 0 ? '+' : ''}${formatPct(row.pertumbuhan_yoy)}` : 'N/A',
            qty: row.kuantitas ? `${formatNum(row.kuantitas)} ${row.satuan}` : '-',
            harga: row.harga_implisit ? `${formatRp(row.harga_implisit)} / kg` : 'Tidak dihitung'
          });
        });

        const commonTraceProps = {
          ids, labels, parents, values, customdata,
          branchvalues: 'total',
          hovertemplate: 
            "<b>%{label}</b><br>" +
            "<span class='text-xs opacity-75'>%{id}</span><br><br>" +
            "Pengeluaran 2025: <b>%{customdata.exp25}</b>/kapita<br>" +
            "Pengeluaran 2024: <b>%{customdata.exp24}</b>/kapita<br>" +
            "Pertumbuhan: <b>%{customdata.yoyFormat}</b> YoY<br><br>" +
            "Kuantitas: %{customdata.qty}<br>" +
            "Harga Implisit: %{customdata.harga}<extra></extra>",
          textfont: { color: textColors, size: 14, family: 'Inter, sans-serif' },
          marker: { colors, line: { width: 1.5, color: '#ffffff' } },
          pathbar: { visible: true, textfont: { size: 13 }, thickness: 32 },
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
    // Penyesuaian h-[calc(100vh-85px)] agar menyisakan ruang lebih untuk navbar, margin di-press jadi py-2
    <section className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-2 h-[calc(100vh-85px)] min-h-[500px] flex flex-col">
      
      {/* Header dibuat lebih rapat dengan mb-2 */}
      <div className="mb-2 shrink-0 w-full flex flex-col md:flex-row md:items-end md:justify-between gap-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-0.5">
            Peta Pertumbuhan Pengeluaran Pangan
          </h2>
          <p className="text-xs md:text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
            Nilai Konsumsi Jawa Tengah 2025 dan Laju Pertumbuhan (YoY)
          </p>
        </div>

        {!loading && (
          <div className="flex flex-col gap-1 bg-white p-1.5 md:p-2 rounded-lg border border-gray-200 shadow-sm shrink-0">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider text-center">Laju Pertumbuhan (YoY)</span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-[10px] text-[#b2182b] font-bold">&le; -{COLOR_LIMIT}%</span>
              <div 
                className="h-3 w-28 md:w-36 rounded shadow-inner" 
                style={{ background: 'linear-gradient(to right, #b2182b, #f7f7f7, #1b7837)' }}
              />
              <span className="text-[10px] text-[#1b7837] font-bold">&ge; +{COLOR_LIMIT}%</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        <div className="lg:col-span-4 flex flex-col h-full gap-2.5">
          <div className="flex rounded-lg bg-gray-200/60 p-1 shadow-inner shrink-0">
            <button 
              onClick={() => setActiveTab('treemap')}
              className={`flex-1 py-1 text-sm font-medium rounded-md transition-colors ${activeTab === 'treemap' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Treemap
            </button>
            <button 
              onClick={() => setActiveTab('sunburst')}
              className={`flex-1 py-1 text-sm font-medium rounded-md transition-colors ${activeTab === 'sunburst' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Sunburst
            </button>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-1 pb-1">
            {insights && (
              <>
                <div className="bg-blue-50/50 border border-blue-100 p-2.5 rounded-xl shadow-sm shrink-0">
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-0.5">Kelompok Terbesar (2025)</p>
                  <p className="text-sm font-bold text-gray-900 leading-tight">{insights.largestGroup.label}</p>
                  <p className="text-[11px] text-gray-700 mt-0.5">{insights.largestGroup.val} ({insights.largestGroup.pct} dari total)</p>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-100 p-2.5 rounded-xl shadow-sm shrink-0">
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-0.5">Konsentrasi 3 Teratas (2025)</p>
                  <p className="text-sm font-bold text-gray-900 leading-tight">{insights.top3Share} Pengeluaran</p>
                  <p className="text-[11px] text-gray-700 mt-0.5">Terserap hanya oleh 3 kelompok utama.</p>
                </div>
                <div className="bg-purple-50/50 border border-purple-100 p-2.5 rounded-xl shadow-sm shrink-0">
                  <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider mb-0.5">Komoditas Tunggal Tertinggi (2025)</p>
                  <p className="text-sm font-bold text-gray-900 leading-tight">{insights.largestCommodity.label}</p>
                  <p className="text-[11px] text-gray-700 mt-0.5">{insights.largestCommodity.val} ({insights.largestCommodity.pct} dari total)</p>
                </div>
              </>
            )}

            <div className="mt-1 bg-gray-50 border border-gray-200 p-2.5 rounded-xl shadow-sm shrink-0">
              <div className="flex items-center gap-1.5 mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                <p className="text-[9px] text-gray-700 font-bold uppercase tracking-wider">Keterbatasan Data</p>
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed text-justify">
                <strong>Efek Basis Rendah:</strong> Laju pertumbuhan (YoY) pada komoditas dengan nilai awal sangat kecil dapat menghasilkan lonjakan persentase ekstrem. Interpretasikan warna pekat pada kotak kecil secara hati-hati.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 relative w-full h-full bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          {loading ? (
             <div className="absolute inset-0 flex items-center justify-center bg-gray-50 animate-pulse text-gray-500">Memuat Visualisasi...</div>
          ) : (
            <>
              <div className={`absolute inset-0 p-1 pb-6 ${activeTab === 'treemap' ? 'block' : 'hidden'}`}>
                <Suspense fallback={<div className="w-full h-full bg-gray-50 animate-pulse"></div>}>
                  <Plot
                    data={plotData.treemap}
                    layout={{ margin: { t: 0, l: 0, r: 0, b: 0 }, autosize: true, paper_bgcolor: 'transparent', uniformtext: { minsize: 10, mode: 'hide' } }}
                    config={{ displayModeBar: false, scrollZoom: false, responsive: true }}
                    style={{ width: '100%', height: '100%' }} useResizeHandler={true}
                  />
                </Suspense>
              </div>

              <div className={`absolute inset-0 p-1 pb-6 ${activeTab === 'sunburst' ? 'block' : 'hidden'}`}>
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
          
          <div className="absolute bottom-1 right-3 text-[9px] text-gray-400 bg-white/80 px-2 py-0.5 rounded pointer-events-none z-10">
            Sumber: BPS, Susenas Jawa Tengah 2024-2025
          </div>
        </div>
      </div>
    </section>
  );
}