import React, { Suspense, useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { KLASTER_CONFIG } from '../../config/klaster';
import { useDataPCA } from '../../hooks/useDataPCA';
import { VARIABEL_CONFIG } from '../../config/variabel';

const Plot = React.lazy(() => import('react-plotly.js'));

const BiplotPCA = ({ data }) => {
  const appContext = useAppContext() || {}; 
  const { 
    kodeTerpilih = null, 
    setKodeTerpilih = () => {}, 
    kodeBrush = [], 
    setKodeBrush = () => {}, 
    clearBrush = () => {} 
  } = appContext;

  const { fmtNilai } = useDataPCA();
  const [dragMode, setDragMode] = useState(window.innerWidth < 640 ? 'pan' : 'lasso');

  const getVarPC = (index) => {
    if (Array.isArray(data?.pca?.eigen)) {
       return data.pca.eigen[index]?.['% Varians'] ?? data.pca.eigen[index]?.varians ?? 0;
    } else if (typeof data?.pca?.eigen === 'object' && data.pca.eigen !== null) {
       const keys = Object.keys(data.pca.eigen);
       const varKey = keys.find(k => k.toLowerCase().includes('varians') && !k.toLowerCase().includes('kumulatif')) || keys[2];
       if (data.pca.eigen[varKey]) {
          return Object.values(data.pca.eigen[varKey])[index] || 0;
       }
    }
    return (index === 0) ? 40.47 : 19.67; 
  };
  
  const varPC1 = getVarPC(0);
  const varPC2 = getVarPC(1);

  const annotations = useMemo(() => {
    let maxScoreX = 0, maxScoreY = 0;
    data.units.forEach(u => {
      if (Math.abs(u.skor_pc[0]) > maxScoreX) maxScoreX = Math.abs(u.skor_pc[0]);
      if (Math.abs(u.skor_pc[1]) > maxScoreY) maxScoreY = Math.abs(u.skor_pc[1]);
    });

    let maxLoadX = 0, maxLoadY = 0;
    data.variabel.forEach(v => {
      if (Math.abs(v.pca_loading[0]) > maxLoadX) maxLoadX = Math.abs(v.pca_loading[0]);
      if (Math.abs(v.pca_loading[1]) > maxLoadY) maxLoadY = Math.abs(v.pca_loading[1]);
    });

    // PERBAIKAN 1: Angka pengali diperbesar dari 0.85 menjadi 1.25 agar panah lebih panjang
    const scaleFactor = 1.25 * Math.min(maxScoreX / maxLoadX, maxScoreY / maxLoadY);
    const isMobile = window.innerWidth < 640;

    return data.variabel.map(v => ({
      ax: 0, ay: 0,
      x: v.pca_loading[0] * scaleFactor,
      y: v.pca_loading[1] * scaleFactor,
      xref: 'x', yref: 'y', axref: 'x', ayref: 'y',
      text: VARIABEL_CONFIG[v.id]?.label?.replace(/ per kapita/gi, '/kap') || v.nama, 
      showarrow: true,
      arrowhead: 2,
      arrowsize: 1,
      arrowwidth: 1.5,
      arrowcolor: '#8c8c8c',
      // PERBAIKAN 2: Tambahkan latar belakang putih semi-transparan agar teks terbaca walau numpuk
      bgcolor: 'rgba(255, 255, 255, 0.75)',
      borderpad: 2,
      font: { size: isMobile ? 8 : 9, color: '#444' },
      xanchor: v.pca_loading[0] > 0 ? 'left' : 'right',
      yanchor: v.pca_loading[1] > 0 ? 'bottom' : 'top',
    }));
  }, [data]);

  const plotData = useMemo(() => {
    const traces = [];
    
    [1, 2, 3].forEach(klasterId => {
      const units = data.units.filter(u => u.klaster === klasterId);
      if (units.length === 0) return;

      const klasterInfo = KLASTER_CONFIG[klasterId];

      traces.push({
        x: units.map(u => u.skor_pc[0]),
        y: units.map(u => u.skor_pc[1]),
        type: 'scatter',
        mode: 'markers',
        name: klasterInfo.label,
        customdata: units.map(u => ({
          kode: u.kode_kabkota,
          nama: u.nama,
          klaster: klasterId,
          teksPencilan: u.pencilan.is_outlier ? " ⚠ (Pencilan)" : "",
          mentah: u.nilai_mentah 
        })),
        marker: {
          size: 10,
          color: units.map(u => 
            kodeBrush.length > 0 && !kodeBrush.includes(u.kode_kabkota)
              ? '#D9D9D9' 
              : klasterInfo.warna
          ),
          line: {
            color: units.map(u => u.pencilan.is_outlier ? '#222222' : '#ffffff'),
            width: units.map(u => u.pencilan.is_outlier ? 2.5 : 0.5)
          },
          opacity: units.map(u => 
            kodeBrush.length > 0 && !kodeBrush.includes(u.kode_kabkota) ? 0.25 : 1
          )
        },
        hovertemplate: 
          '<b>%{customdata.nama}</b><br>' +
          'Klaster %{customdata.klaster}%{customdata.teksPencilan}' +
          '<extra></extra>' 
      });
    });

    return traces;
  }, [data, kodeBrush]);

  const handleSelected = (e) => {
    if (e && e.points) {
      const selectedKodes = e.points.map(p => p.customdata.kode);
      setKodeBrush(selectedKodes);
    }
  };

  const handleClick = (e) => {
    if (e && e.points && e.points.length > 0) {
      setKodeTerpilih(e.points[0].customdata.kode);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-fit overflow-hidden relative">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#FAF8F2]">
        <div>
          <h3 className="font-bold text-[#2F5D2F] text-lg">B. Biplot PCA & Pengelompokan</h3>
          <p className="text-xs text-[#7A5A3A] mt-1">Interaksi: {window.innerWidth < 640 ? 'Gunakan tombol area' : 'Drag untuk brush (Lasso)'}. Klik titik untuk detail.</p>
        </div>
        <div className="flex gap-2">
          {window.innerWidth < 640 && (
            <button 
              onClick={() => setDragMode(prev => prev === 'pan' ? 'lasso' : 'pan')}
              className="text-[10px] px-2 py-1 rounded bg-[#2F5D2F] text-white"
            >
              Mode: {dragMode === 'pan' ? 'Geser' : 'Pilih'}
            </button>
          )}
          {kodeBrush.length > 0 && (
            <button 
              onClick={clearBrush}
              className="text-[10px] px-3 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
            >
              Hapus Pilihan ({kodeBrush.length})
            </button>
          )}
        </div>
      </div>

      <div className="w-full h-[350px] sm:h-[420px] relative z-0">
        <Suspense fallback={<div className="h-full flex items-center justify-center text-[#7A5A3A] animate-pulse">Merender Plotly...</div>}>
          <Plot
            data={plotData}
            layout={{
              autosize: true,
              dragmode: dragMode,
              hovermode: 'closest',
              margin: { l: 40, r: 40, t: 15, b: 40 },
              xaxis: { 
                title: { text: `PC1 (${Number(varPC1).toFixed(1)}%)`, font: { size: 11, color: '#7A5A3A' } },
                zeroline: true, zerolinecolor: '#e5e7eb', zerolinewidth: 2,
                showgrid: true, gridcolor: '#f3f4f6'
              },
              yaxis: { 
                title: { text: `PC2 (${Number(varPC2).toFixed(1)}%)`, font: { size: 11, color: '#7A5A3A' } },
                zeroline: true, zerolinecolor: '#e5e7eb', zerolinewidth: 2,
                showgrid: true, gridcolor: '#f3f4f6'
              },
              annotations: annotations,
              legend: {
                orientation: window.innerWidth < 640 ? 'h' : 'v',
                yanchor: window.innerWidth < 640 ? 'top' : 'auto',
                y: window.innerWidth < 640 ? -0.2 : 1,
                xanchor: window.innerWidth < 640 ? 'center' : 'left',
                x: window.innerWidth < 640 ? 0.5 : 1.02,
                font: { size: 10 }
              },
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent'
            }}
            config={{ 
              displaylogo: false, 
              responsive: true,
              modeBarButtonsToRemove: ['autoScale2d', 'hoverCompareCartesian', 'hoverClosestCartesian', 'toggleSpikelines']
            }}
            onSelected={handleSelected}
            onDeselect={clearBrush}
            onClick={handleClick}
            style={{ width: '100%', height: '100%' }}
          />
        </Suspense>
      </div>

      {kodeTerpilih && (
        <div className="p-4 border-t border-gray-100 bg-[#FAF8F2]/60">
          {(() => {
            const u = data?.units?.find(x => String(x.kode_kabkota) === String(kodeTerpilih));
            if (!u) return null;
            return (
              <>
                <div className="font-bold text-[#2F5D2F] border-b border-gray-200 pb-2 mb-3 flex justify-between items-center">
                  <span className="text-sm">{u.nama}</span>
                  <span className="text-[9px] text-gray-500 font-bold uppercase bg-white px-2 py-1 rounded shadow-sm border border-gray-200">
                    Nilai Asli
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.keys(VARIABEL_CONFIG).map(vid => {
                    const nilaiAsli = u?.nilai_mentah?.[vid] ?? u?.nilai_mentah?.[VARIABEL_CONFIG[vid]?.nama] ?? 0;
                    return (
                      <div key={vid} className="flex flex-col truncate bg-white p-2 rounded border border-gray-100 shadow-sm">
                        <span className="text-[10px] text-gray-400 mb-0.5">{VARIABEL_CONFIG[vid]?.label}</span>
                        <span className="font-mono text-gray-700 font-medium text-xs">{fmtNilai(vid, nilaiAsli)}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>
      )}

      <div className="bg-gray-50 px-5 py-2 text-right border-t border-gray-100 flex justify-between">
        <span className="text-[10px] text-[#7A5A3A]">● Titik Cincin Hitam = Pencilan</span>
        <span className="text-[10px] text-gray-400">Sumber: BPS (diolah)</span>
      </div>
    </div>
  );
};

export default BiplotPCA;