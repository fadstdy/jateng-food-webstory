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
  // DIET: Radius maksimal turun dari 28px ke 24px agar legenda bawah tidak terlalu tinggi
  const maxRadius = 24; 
  const radiusScale = scaleSqrt().domain(domain).range([4, maxRadius]).clamp(true);
  
  const fmtDec = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });
  const fmt = new Intl.NumberFormat('id-ID');

  const choroplethLabels = breaks.map((brk, idx) => {
    const min = idx === 0 ? 0 : breaks[idx - 1];
    return `${fmtDec.format(min)} - ${fmtDec.format(brk)}`;
  });

  return (
    // Gap-6 jadi gap-4
    <div className="flex flex-col gap-4">
      
      {/* Min-height diturunkan */}
      <div className="min-h-[160px]"> 
        {baseLayer === 'choropleth' ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h4 className="font-bold text-xs text-gray-900 mb-0.5">{meta.variabel.padi_per_kapita.nama}</h4>
            <p className="text-[10px] text-gray-500 mb-2">({meta.variabel.padi_per_kapita.satuan}) • Kuantil</p>
            {/* Gap antar item kelas dirapatkan */}
            <div className="flex flex-col gap-1.5 text-xs text-gray-700">
              {CHOROPLETH_COLORS.map((color, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-4 h-4 shrink-0 inline-block rounded border border-gray-200" style={{ backgroundColor: color }}></span>
                  <span className="text-[11px]">Kelas {i + 1} : {choroplethLabels[i]}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
             <h4 className="font-bold text-xs text-gray-900 mb-0.5">Klaster LISA (Padi)</h4>
             <p className="text-[10px] text-gray-500 mb-2">Autokorelasi Spasial Lokal (p &lt; {meta.analisis.alpha})</p>
             <div className="flex flex-col gap-2 text-xs text-gray-700">
              {LISA_CATEGORIES.map((cat) => (
                <div key={cat.id} className="flex items-start gap-2">
                  <span className="w-4 h-4 shrink-0 inline-block rounded-full border border-gray-300 mt-0.5" style={{ backgroundColor: cat.color }}></span>
                  <div className="flex flex-col leading-none">
                    <span className="font-semibold text-[11px] text-gray-900">{cat.id}</span>
                    <span className="text-[9px] text-gray-500 mt-0.5">{cat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-3 pb-2 overflow-hidden">
        <h4 className="font-bold text-xs text-gray-900 mb-0.5">Pekerja Pertanian</h4>
        <p className="text-[10px] text-gray-500 mb-4">(Jiwa)</p>
        
        <div className="flex justify-center relative mt-1" style={{ height: maxRadius * 2 }}>
           <div className="relative" style={{ width: maxRadius * 2, height: maxRadius * 2 }}>
             {[domain[1], (domain[0] + domain[1]) / 2, domain[0]].map((val, i) => {
               const r = radiusScale(val);
               return (
                 <div key={i} className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ width: r * 2, height: r * 2 }}>
                    <div className="w-full h-full rounded-full bg-gray-700/20 border border-gray-500"></div>
                    <div className="absolute top-0 left-1/2 flex items-center" style={{ transform: 'translate(0, -50%)' }}>
                       <div className="h-px bg-gray-400 w-4"></div>
                       <span className="text-[9px] text-gray-700 ml-1 whitespace-nowrap font-medium">
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