import React, { Suspense, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useDataPCA } from '../../hooks/useDataPCA';
import { KLASTER_CONFIG } from '../../config/klaster';
import { VARIABEL_CONFIG } from '../../config/variabel';

const Plot = React.lazy(() => import('react-plotly.js'));

const ParallelCoordinates = ({ data }) => {
  const { kodeTerpilih, setKodeTerpilih, kodeBrush } = useAppContext() || {};
  const { varById, varByNama } = useDataPCA();

  // 1. Tentukan urutan variabel dari JSON (Menangani string ID atau nama)
  const orderedVars = useMemo(() => {
    const rawOrder = data.korelasi.urutan_variabel_hierarkis;
    return rawOrder.map(item => {
      let v = String(item).startsWith('v') ? varById(item) : varByNama(item);
      if (!v && !isNaN(item)) v = data.variabel[item]; // fallback jika indeks (0..8)
      return v;
    }).filter(Boolean);
  }, [data]);

  // 2. Siapkan sumbu X (Label + Satuan)
  const xLabels = orderedVars.map(v => {
    const conf = VARIABEL_CONFIG[v.id];
    return conf.label; // Satuan diletakkan di hover untuk menghemat ruang sumbu X
  });

  // 3. Bangun Traces: 1 Scatter-line per wilayah
  const plotData = useMemo(() => {
    return data.units.map(u => {
      const isBrushed = kodeBrush?.length > 0 && kodeBrush.includes(u.kode_kabkota);
      const isNotBrushed = kodeBrush?.length > 0 && !kodeBrush.includes(u.kode_kabkota);
      const isSelected = kodeTerpilih === u.kode_kabkota;

      // Logika prioritas styling (Pilih > Brush > Normal > Pudar)
      let lineWidth = 1;
      let opacity = 1;
      let color = KLASTER_CONFIG[u.klaster].warna;

      if (isSelected) {
        lineWidth = 4; opacity = 1;
      } else if (isBrushed) {
        lineWidth = 2.5; opacity = 1;
      } else if (isNotBrushed) {
        lineWidth = 1; opacity = 0.15; color = '#D9D9D9';
      }

      // Ambil nilai_z sesuai urutan hierarkis
      const yValues = orderedVars.map(v => u.nilai_z[v.id]);

      return {
        x: xLabels,
        y: yValues,
        type: 'scatter',
        mode: 'lines',
        name: u.nama,
        customdata: yValues.map((val, idx) => ({
          kode: u.kode_kabkota,
          satuan: VARIABEL_CONFIG[orderedVars[idx].id].satuan
        })),
        line: { color, width: lineWidth },
        opacity: opacity,
        hoverinfo: 'text',
        hovertemplate: '<b>%{name}</b><br>%{x}: %{y:.2f} Z-Score<extra></extra>',
        showlegend: false
      };
    });
  }, [data, orderedVars, xLabels, kodeBrush, kodeTerpilih]);

  const handleClick = (e) => {
    if (e.points && e.points.length > 0) setKodeTerpilih(e.points[0].customdata[0].kode);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-fit overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h3 className="font-bold text-[#2F5D2F] text-lg">C. Profil Z-Score (Parallel Plot)</h3>
        <p className="text-xs text-[#7A5A3A] mt-1">z-score; produksi padi, telur, cabai per kapita setelah log1p. Urutan mirip berdekatan.</p>
      </div>
      <div className="w-full h-[350px] overflow-x-auto relative">
        <div className="min-w-[600px] h-full">
          <Suspense fallback={<div className="h-full flex justify-center items-center text-gray-400 text-sm">Merender Plotly...</div>}>
            <Plot
              data={plotData}
              layout={{
                autosize: true, margin: { l: 40, r: 30, t: 20, b: 80 },
                xaxis: { tickangle: 45, tickfont: { size: 9 }, showgrid: true, gridcolor: '#f3f4f6' },
                yaxis: { title: 'Z-Score', zeroline: true, zerolinewidth: 2, zerolinecolor: '#e5e7eb', showgrid: true, gridcolor: '#f3f4f6' },
                hovermode: 'closest', paper_bgcolor: 'transparent', plot_bgcolor: 'transparent'
              }}
              config={{ displayModeBar: false, responsive: true }}
              onClick={handleClick}
              style={{ width: '100%', height: '100%' }}
            />
          </Suspense>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-2 text-right border-t border-gray-100">
        <span className="text-[10px] text-gray-400">Sumber: BPS (diolah)</span>
      </div>
    </div>
  );
};
export default ParallelCoordinates;