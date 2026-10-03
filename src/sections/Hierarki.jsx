import { useState, useEffect, lazy, Suspense } from 'react';
import { scaleLog } from 'd3-scale';
import { interpolateCividis } from 'd3-scale-chromatic';

// Lazy load Plotly untuk performa
const Plot = lazy(() => import('../components/PlotlyWrapper'));

// Utilitas untuk menghitung kontras teks (WCAG)
const getContrastColor = (rgbString) => {
  if (!rgbString || rgbString.startsWith('#')) return '#000000'; // Fallback
  const rgb = rgbString.match(/\d+/g).map(Number);
  // Rumus luminansi relatif sederhana
  const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
  return luminance > 0.45 ? '#000000' : '#ffffff';
};

// Fungsi format angka Indonesia
const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
const formatNum = (num) => new Intl.NumberFormat('id-ID').format(num);

export default function Hierarki() {
  const [plotData, setPlotData] = useState(null);
  const [legendDomain, setLegendDomain] = useState({ min: 0, max: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { 
    fetch(`${import.meta.env.BASE_URL}data/hierarki.json`)
      .then(res => {
        if (!res.ok) throw new Error('Gagal memuat data');
        return res.json();
      })
      .then(data => {
        // 1. Cari domain skala warna (HANYA satuan kg & ada harga implisit)
        const kgItems = data.filter(d => d.satuan === 'kg' && d.harga_implisit !== null);
        const minPrice = Math.min(...kgItems.map(d => d.harga_implisit));
        const maxPrice = Math.max(...kgItems.map(d => d.harga_implisit));
        
        const colorScale = scaleLog().domain([minPrice, maxPrice]).range([0, 1]);
        setLegendDomain({ min: minPrice, max: maxPrice });

        // 2. Siapkan array untuk Plotly
        const ids = [];
        const labels = [];
        const parents = [];
        const values = [];
        const customdata = [];
        const colors = [];
        const patterns = [];
        const textColors = [];

        data.forEach(row => {
          ids.push(row.id);
          labels.push(row.label);
          parents.push(row.parent || ""); // Plotly butuh "" untuk root
          values.push(row.pengeluaran);

          let bgColor = 'rgb(229, 231, 235)'; // Tailwind gray-200 (Netral)
          let patternShape = '';
          let textColor = '#000000';
          let hargaFmt = 'Tidak dihitung';
          let kuantitasFmt = '-';

          if (row.level === 3) {
            if (row.satuan === 'kg' && row.harga_implisit !== null) {
              bgColor = interpolateCividis(colorScale(row.harga_implisit));
              textColor = getContrastColor(bgColor);
              hargaFmt = `${formatRp(row.harga_implisit)} / kg`;
            } else {
              patternShape = '/'; // Pola garis miring
            }
            kuantitasFmt = row.kuantitas ? `${formatNum(row.kuantitas)} ${row.satuan}` : '-';
          }

          colors.push(bgColor);
          patterns.push(patternShape);
          textColors.push(textColor);

          customdata.push({
            shareTotal: row.share_dari_total || 0,
            shareInduk: row.share_dari_induk || 0,
            kuantitas: kuantitasFmt,
            harga: hargaFmt
          });
        });

        setPlotData([{
          type: 'treemap',
          ids,
          labels,
          parents,
          values,
          branchvalues: 'remainder',
          customdata,
          hovertemplate: 
            "<b>%{label}</b><br>" +
            "<span class='text-xs opacity-75'>%{id}</span><br><br>" +
            "Pengeluaran: <b>%{value:$,.0f}</b> per kapita<br>" +
            "Porsi Total: %{customdata.shareTotal}% | Porsi Kelompok: %{customdata.shareInduk}%<br>" +
            "Kuantitas: %{customdata.kuantitas}<br>" +
            "Harga Implisit: %{customdata.harga}<extra></extra>",
          textfont: { color: textColors, size: 14 },
          marker: {
            colors,
            pattern: { shape: patterns },
            line: { width: 1, color: '#ffffff' }
          },
          pathbar: { 
            visible: true, 
            textfont: { size: 14 },
            thickness: 32
          },
          maxdepth: 2,
          tiling: { pad: 2 }
        }]);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (error) return <div className="p-4 text-red-600 bg-red-50 rounded-lg">Error: {error}</div>;

  return (
    <section className="w-full max-w-6xl mx-auto py-12 px-4 md:px-8">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Peta Pengeluaran Pangan
        </h2>
        <p className="text-gray-600">
          Rata-rata pengeluaran makanan per kapita sebulan, Jawa Tengah, 2025 (Rupiah)
        </p>
        <div className="mt-4 p-4 bg-amber-50 text-amber-900 rounded-lg text-sm border border-amber-200">
          <strong>TODO:</strong> Teks naratif placeholder (Insight utama terkait perbandingan pengeluaran komoditas).
        </div>
      </div>

      <div className="mb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        {/* Legenda Custom */}
        {!loading && (
          <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs text-gray-700">
            <span className="font-semibold">Legenda Harga Implisit (Skala Log)</span>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-col">
                <div 
                  className="h-4 w-48 rounded" 
                  style={{ background: 'linear-gradient(to right, #00204d, #414d6b, #7c7b78, #b9b173, #ffea46)' }} // Perkiraan rentang Cividis
                />
                <div className="flex justify-between w-48 mt-1">
                  <span>{formatRp(legendDomain.min)}</span>
                  <span>{formatRp(legendDomain.max)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
                <span>Kelompok / Root</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded overflow-hidden relative">
                  <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #9ca3af 2px, #9ca3af 4px)' }}></div>
                </div>
                <span>Bukan Kg / Tanpa Harga</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative w-full h-[420px] md:h-[560px] bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <span className="animate-pulse text-gray-500 font-medium">Memuat data BPS...</span>
          </div>
        ) : (
          <Suspense fallback={<div className="w-full h-full bg-gray-50 animate-pulse"></div>}>
            <Plot
              data={plotData}
              layout={{
                margin: { t: 0, l: 0, r: 0, b: 0 },
                autosize: true,
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                uniformtext: { minsize: 10, mode: 'hide' },
                colorway: ['#e5e7eb'] // Fallback color
              }}
              config={{
                displayModeBar: false,
                scrollZoom: false,
                responsive: true
              }}
              style={{ width: '100%', height: '100%' }}
              useResizeHandler={true}
            />
          </Suspense>
        )}
      </div>

      <div className="mt-3 text-right text-xs text-gray-500">
        {/* Komponen Sumber BPS placeholder */}
        Sumber: [Judul Tabel BPS, 2025]
      </div>
    </section>
  );
}