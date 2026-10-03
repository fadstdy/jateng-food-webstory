import { scaleSqrt } from 'd3-scale';

const CHOROPLETH_COLORS = ['#edf8e9', '#bae4b3', '#74c476', '#31a354', '#006d2c'];

export default function MapLegend({ data }) {
  const { meta } = data;
  const breaks = meta.klasifikasi_choropleth.quantiles_breaks;
  const varPadi = meta.variabel.padi_per_kapita;
  const varKerja = meta.variabel.penduduk_kerja_pertanian;
  
  const domain = meta.skala_simbol.domain;
  const maxRadius = 28; 
  const radiusScale = scaleSqrt().domain(domain).range([4, maxRadius]).clamp(true);
  
  const fmtDec = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });
  const fmt = new Intl.NumberFormat('id-ID');

  const choroplethLabels = breaks.map((brk, idx) => {
    const min = idx === 0 ? 0 : breaks[idx - 1];
    return `${fmtDec.format(min)} - ${fmtDec.format(brk)}`;
  });

  const sampleValues = [domain[1], (domain[0] + domain[1]) / 2, domain[0]];
  // PERBAIKAN: Label Eksplisit
  const symbolLabels = ["Maks", "Tengah", "Min"]; 

  return (
    <div className="flex flex-col gap-6">
      {/* Legenda Choropleth */}
      <div>
        <h4 className="font-bold text-sm text-gray-900 mb-1">{varPadi.nama}</h4>
        <p className="text-xs text-gray-500 mb-3">({varPadi.satuan}) • {meta.klasifikasi_choropleth.metode_disarankan}</p>
        
        <div className="flex flex-col gap-2 text-sm text-gray-700">
          {CHOROPLETH_COLORS.map((color, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-6 h-6 inline-block rounded shadow-sm border border-gray-200" style={{ backgroundColor: color }}></span>
              <span>Kelas {i + 1} : {choroplethLabels[i]}</span>
            </div>
          ))}
          <div className="flex items-center gap-3 mt-1">
             <span className="w-6 h-6 inline-block rounded border border-gray-300 shadow-sm" style={{ background: 'repeating-linear-gradient(45deg, #d1d5db, #d1d5db 2px, #f3f4f6 2px, #f3f4f6 6px)' }}></span>
             <span className="text-gray-500 italic">Data tidak tersedia</span>
          </div>
        </div>
      </div>

      {/* Legenda Simbol */}
      <div className="border-t border-gray-200 pt-4 pb-4 overflow-hidden">
        <h4 className="font-bold text-sm text-gray-900 mb-1">{varKerja.nama}</h4>
        <p className="text-xs text-gray-500 mb-6">({varKerja.satuan})</p>
        
        <div className="flex justify-center relative mt-2" style={{ height: maxRadius * 2 }}>
           {/* Container Utama Lingkaran */}
           <div className="relative" style={{ width: maxRadius * 2, height: maxRadius * 2 }}>
             {sampleValues.map((val, i) => {
               const r = radiusScale(val);
               return (
                 /* PERBAIKAN CSS: Lingkaran dijamin berada tepat di tengah (left-1/2 -translate-x-1/2) */
                 <div key={i} className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ width: r * 2, height: r * 2 }}>
                    
                    {/* Lingkaran Visual */}
                    <div className="w-full h-full rounded-full bg-gray-700/20 border border-gray-500"></div>
                    
                    {/* Garis Penunjuk & Label Eksplisit menempel pas di sisi atas lingkaran */}
                    <div className="absolute top-0 left-1/2 flex items-center" style={{ transform: 'translate(0, -50%)' }}>
                       <div className="h-px bg-gray-400 w-6"></div>
                       <span className="text-[10px] text-gray-700 ml-1 whitespace-nowrap font-medium">
                         {symbolLabels[i]} ({fmt.format(Math.round(val))})
                       </span>
                    </div>

                 </div>
               );
             })}
           </div>
        </div>
      </div>
    </div>
  );
}