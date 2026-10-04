import { scaleSqrt } from 'd3-scale';

const CHOROPLETH_COLORS = ['#edf8e9', '#bae4b3', '#74c476', '#31a354', '#006d2c'];
const LISA_CATEGORIES = [
  { id: 'HH', label: 'Tinggi, dikelilingi Tinggi', color: '#D55E00' },
  { id: 'LL', label: 'Rendah, dikelilingi Rendah', color: '#0072B2' },
  { id: 'HL', label: 'Tinggi, dikelilingi Rendah', color: '#E69F00' },
  { id: 'LH', label: 'Rendah, dikelilingi Tinggi', color: '#56B4E9' },
  { id: 'Tidak signifikan', label: 'Tidak ada klaster signifikan', color: '#D9D9D9' }
];

export default function MapLegend({ data, baseLayer }) {
  const { meta } = data;
  const breaks = meta.klasifikasi_choropleth.quantiles_breaks;
  
  const domain = meta.skala_simbol.domain;
  const maxRadius = 28; 
  const radiusScale = scaleSqrt().domain(domain).range([4, maxRadius]).clamp(true);
  
  const fmtDec = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });
  const fmt = new Intl.NumberFormat('id-ID');

  const choroplethLabels = breaks.map((brk, idx) => {
    const min = idx === 0 ? 0 : breaks[idx - 1];
    return `${fmtDec.format(min)} - ${fmtDec.format(brk)}`;
  });

  return (
    <div className="flex flex-col gap-6">
      
      {/* Dynamic Base Layer Legend */}
      <div className="min-h-[220px]"> 
        {baseLayer === 'choropleth' ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h4 className="font-bold text-sm text-gray-900 mb-1">{meta.variabel.padi_per_kapita.nama}</h4>
            <p className="text-[11px] text-gray-500 mb-3">({meta.variabel.padi_per_kapita.satuan}) • Kuantil</p>
            <div className="flex flex-col gap-2 text-sm text-gray-700">
              {CHOROPLETH_COLORS.map((color, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-5 h-5 shrink-0 inline-block rounded border border-gray-200" style={{ backgroundColor: color }}></span>
                  <span className="text-xs">Kelas {i + 1} : {choroplethLabels[i]}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
             <h4 className="font-bold text-sm text-gray-900 mb-1">Klaster LISA (Padi)</h4>
             <p className="text-[11px] text-gray-500 mb-3">Autokorelasi Spasial Lokal (p &lt; {meta.analisis.alpha})</p>
             <div className="flex flex-col gap-3 text-sm text-gray-700">
              {LISA_CATEGORIES.map((cat) => (
                <div key={cat.id} className="flex items-start gap-3">
                  <span className="w-5 h-5 shrink-0 inline-block rounded-full border border-gray-300 mt-0.5" style={{ backgroundColor: cat.color }}></span>
                  <div className="flex flex-col leading-tight">
                    <span className="font-semibold text-gray-900">{cat.id}</span>
                    <span className="text-[11px] text-gray-600">{cat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Legenda Simbol */}
      <div className="border-t border-gray-200 pt-4 pb-4 overflow-hidden">
        <h4 className="font-bold text-sm text-gray-900 mb-1">Pekerja Pertanian</h4>
        <p className="text-[11px] text-gray-500 mb-6">(Jiwa)</p>
        
        <div className="flex justify-center relative mt-2" style={{ height: maxRadius * 2 }}>
           <div className="relative" style={{ width: maxRadius * 2, height: maxRadius * 2 }}>
             {[domain[1], (domain[0] + domain[1]) / 2, domain[0]].map((val, i) => {
               const r = radiusScale(val);
               return (
                 <div key={i} className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ width: r * 2, height: r * 2 }}>
                    <div className="w-full h-full rounded-full bg-gray-700/20 border border-gray-500"></div>
                    <div className="absolute top-0 left-1/2 flex items-center" style={{ transform: 'translate(0, -50%)' }}>
                       <div className="h-px bg-gray-400 w-6"></div>
                       <span className="text-[10px] text-gray-700 ml-1 whitespace-nowrap font-medium">
                         {["Maks", "Tengah", "Min"][i]} ({fmt.format(Math.round(val))})
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