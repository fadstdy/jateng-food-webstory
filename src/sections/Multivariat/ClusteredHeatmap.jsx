import React, { Suspense, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useDataPCA } from '../../hooks/useDataPCA';
import { VARIABEL_CONFIG } from '../../config/variabel';

const Plot = React.lazy(() => import('react-plotly.js'));

const ClusteredHeatmap = ({ data }) => {
  const appContext = useAppContext() || {};
  const { kodeTerpilih = null, setKodeTerpilih = () => {}, kodeBrush = [] } = appContext;
  const { varById, varByNama, fmtNilai } = useDataPCA();

  const orderedVars = useMemo(() => {
    return data.korelasi.urutan_variabel_hierarkis.map(item => {
      let v = String(item).startsWith('v') ? varById(item) : varByNama(item);
      if (!v && !isNaN(item)) v = data.variabel[item];
      return v;
    }).filter(Boolean);
  }, [data]);

  const sortedUnits = useMemo(() => {
    return [...data.units].sort((a, b) => {
      if (a.klaster !== b.klaster) return a.klaster - b.klaster;
      return b.skor_pc[0] - a.skor_pc[0]; 
    });
  }, [data.units]);

  const plotData = useMemo(() => {
    // Teks sudah disisipkan <br> agar terbagi menjadi dua baris
    const xLabels = orderedVars.map(v => {
      let label = VARIABEL_CONFIG[v.id].label.replace(/ per kapita/gi, '/kap');
      label = label.replace('Penduduk bekerja di pertanian', 'Pekerja<br>Pertanian');
      label = label.replace('Pengeluaran untuk makanan', 'Pengeluaran<br>Makanan');
      label = label.replace('Share PDRB pertanian', 'Share PDRB<br>Pertanian');
      label = label.replace('Produktivitas padi', 'Produktivitas<br>Padi');
      label = label.replace('Konsumsi kalori', 'Konsumsi<br>Kalori');
      label = label.replace('Konsumsi protein', 'Konsumsi<br>Protein');
      label = label.replace('Produksi cabai/kap', 'Produksi<br>Cabai/kap');
      label = label.replace('Produksi telur/kap', 'Produksi<br>Telur/kap');
      label = label.replace('Produksi padi/kap', 'Produksi<br>Padi/kap');
      return label;
    });
    
    const yLabels = sortedUnits.map(u => {
      const namaPendek = u.nama.replace(/(Kabupaten |Kota )/gi, '');
      return `[K${u.klaster}] ${namaPendek}`;
    });
    
    const zMatrix = sortedUnits.map(u => orderedVars.map(v => u.nilai_z[v.id]));

    const customData = sortedUnits.map(u => 
      orderedVars.map(v => ({
        kode: u.kode_kabkota,
        nama: u.nama,
        klaster: u.klaster,
        varLabel: VARIABEL_CONFIG[v.id].label,
        nilaiMentah: fmtNilai(v.id, u.nilai_mentah[v.id] ?? u.nilai_mentah[v.nama])
      }))
    );

    return { xLabels, yLabels, zMatrix, customData };
  }, [orderedVars, sortedUnits, fmtNilai]);

  const layoutShapes = useMemo(() => {
    const shapes = [];
    let currentKlaster = sortedUnits[0]?.klaster;
    
    sortedUnits.forEach((u, idx) => {
      if (u.klaster !== currentKlaster) {
        shapes.push({
          type: 'line', xref: 'paper', x0: 0, x1: 1, yref: 'y', y0: idx - 0.5, y1: idx - 0.5,
          line: { color: '#444', width: 2, dash: 'dot' }
        });
        currentKlaster = u.klaster;
      }
    });

    const hasSelection = kodeTerpilih || (kodeBrush && kodeBrush.length > 0);
    if (hasSelection) {
      sortedUnits.forEach((u, idx) => {
        const isSelected = String(kodeTerpilih) === String(u.kode_kabkota) || 
                           (kodeBrush && kodeBrush.map(String).includes(String(u.kode_kabkota)));
        if (!isSelected) {
          shapes.push({
            type: 'rect', xref: 'paper', x0: 0, x1: 1, yref: 'y', y0: idx - 0.5, y1: idx + 0.5,
            fillcolor: 'rgba(255, 255, 255, 0.75)', line: { width: 0 }
          });
        }
      });
    }
    return shapes;
  }, [sortedUnits, kodeTerpilih, kodeBrush]);

  const handleClick = (e) => {
    if (e.points && e.points.length > 0) setKodeTerpilih(e.points[0].customdata.kode);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-fit overflow-hidden relative">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-bold text-[#2F5D2F] text-sm">C. Matriks Profil Wilayah</h3>
        <p className="text-[10px] text-[#7A5A3A] mt-1">Sumbu X diurutkan berdasarkan kedekatan. (Merah = di bawah rerata, Biru = di atas rerata)</p>
      </div>
      <div className="w-full h-[350px] sm:h-[400px] overflow-x-auto relative">
        <div className="min-w-[450px] h-full p-2">
          <Suspense fallback={<div className="h-full flex items-center justify-center text-xs text-gray-400">Merender Heatmap...</div>}>
            <Plot
              data={[{
                z: plotData.zMatrix, x: plotData.xLabels, y: plotData.yLabels, customdata: plotData.customData,
                type: 'heatmap', colorscale: [[0, '#a63603'], [0.5, '#ffffff'], [1, '#08519c']],
                zmin: -3, zmax: 3, showscale: false,
                hovertemplate: '<b>%{customdata.nama}</b> (K%{customdata.klaster})<br>%{customdata.varLabel}<br>Z-Score: <b>%{z:.2f}</b><br>Nilai: %{customdata.nilaiMentah}<extra></extra>'
              }]}
              layout={{
                // PERBAIKAN: Margin bawah (b) dilebarkan menjadi 75 agar teks vertikal tidak terpotong
                autosize: true, margin: { l: 90, r: 10, t: 10, b: 75 },
                // PERBAIKAN: tickangle diubah menjadi -90 agar teks tegak lurus (vertikal)
                xaxis: { tickangle: -90, tickfont: { size: 9 } },
                yaxis: { tickfont: { size: 9, color: '#333' }, autorange: 'reversed', dtick: 1 },
                shapes: layoutShapes, paper_bgcolor: 'transparent', plot_bgcolor: 'transparent'
              }}
              config={{ displayModeBar: false, responsive: true }}
              onClick={handleClick}
              style={{ width: '100%', height: '100%' }}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default ClusteredHeatmap;