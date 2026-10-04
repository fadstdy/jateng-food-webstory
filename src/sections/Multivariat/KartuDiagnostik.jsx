import React, { Suspense } from 'react';
import { VARIABEL_CONFIG } from '../../config/variabel';

const Plot = React.lazy(() => import('react-plotly.js'));

const KartuDiagnostik = ({ data }) => {
  const { kmo, bartlett, msa_per_variabel } = data.diagnostik;
  const { eigen } = data.pca; 

  const getKmoKategori = (val) => {
    if (val < 0.5) return "Tidak Memadai";
    if (val < 0.6) return "Kurang";
    if (val < 0.7) return "Sedang";
    if (val < 0.8) return "Cukup";
    if (val < 0.9) return "Baik";
    return "Sangat Baik";
  };

  const formatPVal = (val) => val < 0.001 ? "< 0,001" : val.toFixed(4);

  let pcLabels = [];
  let eigenValues = [];
  let pctVarians = [];

  if (Array.isArray(eigen)) {
    pcLabels = eigen.map((_, i) => `PC${i + 1}`);
    eigenValues = eigen.map(e => e.Eigenvalue ?? e.eigenvalue ?? Object.values(e)[1]);
    pctVarians = eigen.map(e => e['% Varians'] ?? e.varians ?? Object.values(e)[2]);
  } else if (typeof eigen === 'object' && eigen !== null) {
    const keys = Object.keys(eigen);
    const valKey = keys.find(k => k.toLowerCase().includes('eigen')) || keys[1];
    const varKey = keys.find(k => k.toLowerCase().includes('varians') && !k.toLowerCase().includes('kumulatif')) || keys[2];

    if (eigen[valKey]) {
      eigenValues = Object.values(eigen[valKey]);
      pcLabels = eigenValues.map((_, i) => `PC${i + 1}`);
    }
    if (eigen[varKey]) {
      pctVarians = Object.values(eigen[varKey]);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-bold text-[#2F5D2F] text-base">A. Diagnostik PCA</h3>
        <p className="text-[10px] text-gray-500 mt-0.5">Uji kelayakan data & varians komponen</p>
      </div>
      
      {/* PADDING DIPERKECIL: dari p-5 menjadi p-4, gap dari 5 ke 3 */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#FAF8F2] p-2 rounded-lg border border-[#e8dfc8]">
            <div className="text-[10px] text-[#7A5A3A] font-semibold mb-0.5">KMO Measure</div>
            <div className="text-lg font-bold text-gray-800 leading-none">{kmo.toFixed(3)}</div>
            <div className="text-[9px] uppercase text-[#2F5D2F] tracking-wide mt-1">
              {getKmoKategori(kmo)}
            </div>
          </div>
          <div className="bg-[#FAF8F2] p-2 rounded-lg border border-[#e8dfc8]">
            <div className="text-[10px] text-[#7A5A3A] font-semibold mb-0.5">Uji Bartlett</div>
            <div className="text-lg font-bold text-gray-800 leading-none truncate" title={`Chi-Square: ${bartlett.chi2.toFixed(2)}`}>
              χ²: {bartlett.chi2.toFixed(1)}
            </div>
            <div className="text-[9px] uppercase text-[#2F5D2F] tracking-wide mt-1">
              p: {formatPVal(bartlett.p_value)}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-700 mb-1.5">Nilai MSA per Variabel</h4>
          {/* TINGGI DIBATASI: max-h-[110px] agar tidak menendang elemen ke bawah */}
          <div className="max-h-[110px] overflow-y-auto rounded border border-gray-200">
            <table className="w-full text-left text-[10px]">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="p-1.5 border-b font-medium text-gray-600">Variabel</th>
                  <th className="p-1.5 border-b font-medium text-gray-600 w-12 text-right">MSA</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(msa_per_variabel).map(([namaKolom, val]) => {
                  const varKey = Object.keys(VARIABEL_CONFIG).find(k => VARIABEL_CONFIG[k].nama === namaKolom);
                  const label = varKey ? VARIABEL_CONFIG[varKey].label : namaKolom;
                  const isWarning = val < 0.5;
                  return (
                    <tr key={namaKolom} className={`border-b last:border-0 ${isWarning ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                      <td className="p-1.5 text-gray-700 truncate max-w-[140px]" title={label}>
                        {isWarning && <span className="text-red-500 font-bold mr-1">!</span>}
                        {label}
                      </td>
                      <td className={`p-1.5 text-right font-mono ${isWarning ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
                        {val.toFixed(3)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {eigenValues.length > 0 && (
          // TINGGI DITEKAN: dari h-40 menjadi h-28
          <div className="h-28 w-full mt-auto relative z-0">
            <Suspense fallback={<div className="h-full flex items-center justify-center text-[10px] text-gray-400">Memuat Plot...</div>}>
              <Plot
                data={[
                  {
                    x: pcLabels, y: pctVarians, type: 'bar', name: '% Varians',
                    marker: { color: '#e8dfc8' }, yaxis: 'y2', opacity: 0.7,
                    hovertemplate: '%{x}: %{y:.1f}%<extra></extra>'
                  },
                  {
                    x: pcLabels, y: eigenValues, type: 'scatter', mode: 'lines+markers',
                    name: 'Eigenvalue', marker: { color: '#7A5A3A', size: 5 },
                    line: { width: 1.5 }, yaxis: 'y1',
                    hovertemplate: '%{x}: %{y:.2f}<extra></extra>'
                  }
                ]}
                layout={{
                  autosize: true, margin: { l: 25, r: 25, t: 5, b: 15 },
                  showlegend: false,
                  xaxis: { fixedrange: true, tickfont: { size: 8 } },
                  yaxis: { title: { text: 'Eigen', font: {size:8} }, fixedrange: true, range: [0, Math.max(...eigenValues)*1.1], tickfont: { size: 8 } },
                  yaxis2: { 
                    title: { text: '%Var', font: {size:8} }, fixedrange: true, 
                    overlaying: 'y', side: 'right', showgrid: false, range: [0, 100], tickfont: { size: 8 }
                  },
                  shapes: [{
                    type: 'line', xref: 'paper', x0: 0, x1: 1, y0: 1, y1: 1, yref: 'y',
                    line: { color: '#2F5D2F', width: 1, dash: 'dash' }
                  }],
                  paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
                }}
                config={{ displayModeBar: false, responsive: true }}
                style={{ width: '100%', height: '100%' }}
              />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
};

export default KartuDiagnostik;