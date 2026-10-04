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

    const scaleFactor = 1.15 * Math.min(maxScoreX / maxLoadX, maxScoreY / maxLoadY);
    const isMobile = window.innerWidth < 640;

    return data.variabel.map(v => {
      const tipX = v.pca_loading[0] * scaleFactor;
      const tipY = v.pca_loading[1] * scaleFactor;
      
      return {
        x: tipX,
        y: tipY,
        xref: 'x',
        yref: 'y',
        ax: 0,
        ay: 0,
        axref: 'x',
        ayref: 'y',
        text: VARIABEL_CONFIG[v.id]?.label?.replace(/ per kapita/gi, '/kap') || v.nama,
        showarrow: true,
        arrowhead: 2,
        arrowsize: 1,
        arrowwidth: 1.5,
        arrowcolor: '#71717a',
        xanchor: tipX >= 0 ? 'left' : 'right',
        yanchor: tipY >= 0 ? 'bottom' : 'top',
        bgcolor: 'rgba(255, 255, 255, 0.85)',
        bordercolor: '#e4e4e7',
        borderwidth: 1,
        borderpad: 1,
        font: { size: isMobile ? 7 : 8, color: '#27272a' }
      };
    });
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
          size: 9,
          color: units.map(u => kodeBrush.length > 0 && !kodeBrush.includes(u.kode_kabkota) ? '#e5e7eb' : klasterInfo.warna),
          line: {
            color: units.map(u => u.pencilan.is_outlier ? '#18181b' : '#ffffff'),
            width: units.map(u => u.pencilan.is_outlier ? 2 : 0.5)
          },
          opacity: units.map(u => kodeBrush.length > 0 && !kodeBrush.includes(u.kode_kabkota) ? 0.3 : 1)
        },
        hovertemplate: '<b>%{customdata.nama}</b><br>Klaster %{customdata.klaster}%{customdata.teksPencilan}<extra></extra>' 
      });
    });
    return traces;
  }, [data, kodeBrush]);

  const handleSelected = (e) => {
    if (e && e.points) setKodeBrush(e.points.map(p => p.customdata.kode));
  };
  const handleClick = (e) => {
    if (e && e.points && e.points.length > 0) setKodeTerpilih(e.points[0].customdata.kode);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden relative">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-[#FAF8F2]">
        <div>
          <h3 className="font-bold text-[#2F5D2F] text-base">B. Biplot PCA & Pengelompokan</h3>
          <p className="text-[10px] text-[#7A5A3A] mt-0.5">Interaksi: {window.innerWidth < 640 ? 'Gunakan tombol area' : 'Drag untuk brush (Lasso)'}. Klik titik untuk detail.</p>
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
              className="text-[10px] px-2 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
            >
              Hapus Pilihan ({kodeBrush.length})
            </button>
          )}
        </div>
      </div>

      {/* TINGGI DITEKAN DRASTIS: Dari h-[420px] menjadi h-[260px] sm:h-[300px] */}
      <div className="w-full h-[260px] sm:h-[300px] relative z-0">
        <Suspense fallback={<div className="h-full flex items-center justify-center text-[10px] text-[#7A5A3A] animate-pulse">Merender Plotly...</div>}>
          <Plot
            data={plotData}
            layout={{
              autosize: true, dragmode: dragMode, hovermode: 'closest',
              margin: { l: 30, r: 30, t: 15, b: 30 }, // Margin dipersempit
              xaxis: { 
                title: { text: `PC1 (${Number(varPC1).toFixed(1)}%)`, font: { size: 10, color: '#7A5A3A' } },
                zeroline: true, zerolinecolor: '#e5e7eb', zerolinewidth: 2, showgrid: true, gridcolor: '#f3f4f6', tickfont: {size:9}
              },
              yaxis: { 
                title: { text: `PC2 (${Number(varPC2).toFixed(1)}%)`, font: { size: 10, color: '#7A5A3A' } },
                zeroline: true, zerolinecolor: '#e5e7eb', zerolinewidth: 2, showgrid: true, gridcolor: '#f3f4f6', tickfont: {size:9}
              },
              annotations: annotations,
              legend: {
                orientation: 'h', yanchor: 'top', y: -0.15, xanchor: 'center', x: 0.5, font: { size: 9 }
              },
              paper_bgcolor: 'transparent', plot_bgcolor: 'transparent'
            }}
            config={{ displaylogo: false, responsive: true, modeBarButtonsToRemove: ['autoScale2d', 'hoverCompareCartesian', 'hoverClosestCartesian', 'toggleSpikelines'] }}
            onSelected={handleSelected}
            onDeselect={clearBrush}
            onClick={handleClick}
            style={{ width: '100%', height: '100%' }}
          />
        </Suspense>
      </div>

      {/* PANEL INFO DIPADATKAN (Grid Dense) */}
      {kodeTerpilih && (
        <div className="p-3 border-t border-gray-200 bg-[#FAF8F2]/80 mt-auto">
          {(() => {
            const u = data?.units?.find(x => String(x.kode_kabkota) === String(kodeTerpilih));
            if (!u) return null;
            return (
              <>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-[#2F5D2F] text-sm leading-none">{u.nama}</span>
                  <span className="text-[8px] text-white bg-[#7A5A3A] px-1.5 py-0.5 rounded uppercase tracking-wider">Nilai Asli</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1">
                  {Object.keys(VARIABEL_CONFIG).map(vid => {
                    const nilaiAsli = u?.nilai_mentah?.[vid] ?? u?.nilai_mentah?.[VARIABEL_CONFIG[vid]?.nama] ?? 0;
                    return (
                      <div key={vid} className="flex flex-col border-b border-[#e8dfc8] pb-0.5">
                        <span className="text-[9px] text-[#7A5A3A] truncate leading-tight">{VARIABEL_CONFIG[vid]?.label}</span>
                        <span className="font-mono text-gray-800 text-[11px] leading-tight font-medium">{fmtNilai(vid, nilaiAsli)}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default BiplotPCA;