import React, { Suspense, useMemo } from 'react';
import { useDataPCA } from '../../hooks/useDataPCA';
import { VARIABEL_CONFIG } from '../../config/variabel';

const Plot = React.lazy(() => import('react-plotly.js'));

const HeatmapKorelasi = ({ data }) => {
  const { varById, varByNama } = useDataPCA();

  const processedData = useMemo(() => {
    const rawOrder = data.korelasi.urutan_variabel_hierarkis;
    const origMatrix = data.korelasi.matriks;
    
    // Cari urutan indeks (0..8) dari rawOrder (bisa id, nama, atau int)
    const orderedIndices = rawOrder.map(item => {
      let idx = -1;
      if (typeof item === 'number') idx = item;
      else if (String(item).startsWith('v')) idx = data.variabel.findIndex(v => v.id === item);
      else idx = data.variabel.findIndex(v => v.nama === item);
      return idx !== -1 ? idx : 0;
    });

    const labels = orderedIndices.map(idx => {
      const vId = data.variabel[idx].id;
      return VARIABEL_CONFIG[vId].label;
    });

    // Urut ulang matriks [baris][kolom]
    const zMatrix = orderedIndices.map(rowIdx => 
      orderedIndices.map(colIdx => origMatrix[rowIdx][colIdx])
    );

    // Siapkan teks custom untuk arah
    const customData = zMatrix.map(row => 
      row.map(val => val > 0 ? 'Korelasi Positif' : val < 0 ? 'Korelasi Negatif' : 'Tidak Ada Korelasi')
    );

    // Bikin anotasi angka agar muncul di dalam kotak (karena Plotly Heatmap butuh layout annotations)
    const annotations = [];
    zMatrix.forEach((row, i) => {
      row.forEach((val, j) => {
        annotations.push({
          x: labels[j], y: labels[i],
          text: val.toFixed(2),
          font: { size: window.innerWidth < 640 ? 7 : 9, color: Math.abs(val) > 0.5 ? 'white' : 'black' },
          showarrow: false
        });
      });
    });

    return { zMatrix, labels, customData, annotations };
  }, [data]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-fit overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h3 className="font-bold text-[#2F5D2F] text-lg">D. Matriks Korelasi (Hierarkis)</h3>
        <p className="text-xs text-[#7A5A3A] mt-1">Korelasi Pearson; variabel produksi memakai log1p; urutan hasil klaster hierarkis.</p>
      </div>
      <div className="w-full h-[380px] overflow-x-auto relative">
        {/* Kontainer dipaksa minimal 500px agar kotak tidak hancur di HP, lalu HP bisa scroll horizontal */}
        <div className="min-w-[500px] h-full">
          <Suspense fallback={<div className="h-full flex items-center justify-center text-gray-400 text-sm">Merender Plotly...</div>}>
            <Plot
              data={[{
                z: processedData.zMatrix,
                x: processedData.labels,
                y: processedData.labels,
                customdata: processedData.customData,
                type: 'heatmap',
                // Skala Divergen (Biru Gelap - Putih - Oranye Gelap), TIDAK sama dengan warna LISA/Klaster
                colorscale: [[0, '#a63603'], [0.5, '#ffffff'], [1, '#08519c']],
                zmin: -1, zmax: 1,
                hovertemplate: '<b>Y:</b> %{y}<br><b>X:</b> %{x}<br><b>r = %{z:.2f}</b> (%{customdata})<extra></extra>',
                showscale: false // Legend scale disembunyikan agar bersih
              }]}
              layout={{
                autosize: true, margin: { l: 140, r: 20, t: 20, b: 120 },
                xaxis: { tickangle: 45, tickfont: { size: 9 } },
                yaxis: { tickfont: { size: 9 }, autorange: 'reversed' }, // Diagonal kiri atas ke kanan bawah
                annotations: processedData.annotations,
                paper_bgcolor: 'transparent', plot_bgcolor: 'transparent'
              }}
              config={{ displayModeBar: false, responsive: true }}
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
export default HeatmapKorelasi;