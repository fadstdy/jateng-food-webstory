import React, { Suspense, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { VARIABEL_CONFIG } from '../../config/variabel';

const Plot = React.lazy(() => import('react-plotly.js'));

const RadarProfil = ({ data }) => {
  const appContext = useAppContext() || {};
  const { kodeTerpilih = null, kodeBrush = [] } = appContext;

  const { labels, medianZ, plotData, title } = useMemo(() => {
    const varIds = data.variabel.map(v => v.id);
    // Singkat label variabel untuk Radar agar tidak menabrak batas
    const varLabels = data.variabel.map(v => 
      VARIABEL_CONFIG[v.id].label.replace(/ per kapita/gi, '/kap')
    );

    const medianZ = varIds.map(vId => {
      const zArr = data.units.map(u => u.nilai_z[vId]).sort((a,b) => a-b);
      return zArr[17]; 
    });

    const traces = [];
    let titleStr = "Pilih daerah/klaster untuk melihat profil.";

    if (kodeTerpilih) {
      // PERBAIKAN: Gunakan String() agar tidak gagal saat membandingkan Int vs String
      const u = data.units.find(x => String(x.kode_kabkota) === String(kodeTerpilih));
      
      if (u) {
        titleStr = `Profil Z-Score: ${u.nama}`;
        traces.push({
          type: 'scatterpolar', r: varIds.map(vId => u.nilai_z[vId]), theta: varLabels,
          fill: 'toself', name: u.nama, line: { color: '#2F5D2F' }, opacity: 0.8
        });
      }
    } else if (kodeBrush && kodeBrush.length > 0) {
      titleStr = `Rata-rata Area Terpilih (${kodeBrush.length} Wilayah)`;
      // PERBAIKAN: Gunakan String() juga untuk array brush
      const brushedKodes = kodeBrush.map(String);
      const brushedUnits = data.units.filter(u => brushedKodes.includes(String(u.kode_kabkota)));
      
      if (brushedUnits.length > 0) {
        const avgZ = varIds.map(vId => {
          const sum = brushedUnits.reduce((acc, curr) => acc + curr.nilai_z[vId], 0);
          return sum / brushedUnits.length;
        });
        traces.push({
          type: 'scatterpolar', r: avgZ, theta: varLabels,
          fill: 'toself', name: 'Rerata Area', line: { color: '#7A5A3A' }, opacity: 0.8
        });
      }
    }

    if (traces.length > 0) {
      traces.push({
        type: 'scatterpolar', r: medianZ, theta: varLabels,
        mode: 'lines', name: 'Median Provinsi', line: { color: '#555', dash: 'dot', width: 2 },
        hoverinfo: 'none'
      });
      
      // Tutup poligon
      traces.forEach(t => {
        t.r.push(t.r[0]);
        t.theta.push(t.theta[0]);
      });
    }

    return { labels: varLabels, medianZ, plotData: traces, title: titleStr };
  }, [data, kodeTerpilih, kodeBrush]);

  if (plotData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden relative">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-[#2F5D2F] text-sm">E. Radar Profil</h3>
          <p className="text-[10px] text-[#7A5A3A] truncate">Pilih daerah/klaster untuk melihat profil.</p>
        </div>
        <div className="flex-1 flex items-center justify-center p-5 bg-gray-50/50">
          <p className="text-gray-400 text-xs text-center border border-dashed border-gray-300 p-4 rounded-lg">
            (Radar akan muncul saat Anda mengklik titik daerah<br/>atau memilih area pada Biplot/Heatmap)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden relative">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-bold text-[#2F5D2F] text-sm">E. Radar Profil</h3>
        <p className="text-[10px] text-[#7A5A3A] truncate">{title}</p>
      </div>
      <div className="flex-1 h-[280px]">
        <Suspense fallback={<div className="h-full flex items-center justify-center text-xs text-gray-400">Merender Plotly...</div>}>
          <Plot
            data={plotData}
            layout={{
              autosize: true, margin: { l: 50, r: 50, t: 30, b: 30 }, showlegend: false,
              polar: {
                radialaxis: { visible: true, range: [-3, 3], tickfont: {size:8} },
                angularaxis: { tickfont: { size: 9 }, direction: 'clockwise' }
              },
              paper_bgcolor: 'transparent', plot_bgcolor: 'transparent'
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: '100%', height: '100%' }}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default RadarProfil;