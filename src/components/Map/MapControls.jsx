export default function MapControls({ year, setYear, baseLayer, setBaseLayer, showSymbols, setShowSymbols }) {
  return (
    <div className="absolute bottom-4 left-4 z-[400] flex flex-col gap-2 pointer-events-none">
      
      <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg pointer-events-auto border border-gray-100 flex flex-col gap-2 w-max">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Layer Warna (Padi)</div>
        <label className="flex items-center gap-3 cursor-pointer group">
          <input type="radio" name="baselayer" className="w-4 h-4 accent-green-700" checked={baseLayer === 'choropleth'} onChange={() => setBaseLayer('choropleth')} />
          <span className="text-sm font-medium text-gray-800 group-hover:text-green-700 transition-colors">Choropleth (Kuantil)</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer group">
          <input type="radio" name="baselayer" className="w-4 h-4 accent-orange-600" checked={baseLayer === 'lisa'} onChange={() => setBaseLayer('lisa')} />
          <span className="text-sm font-medium text-gray-800 group-hover:text-orange-600 transition-colors">Klaster LISA (Spasial)</span>
        </label>
        
        <div className="w-full h-px bg-gray-200 my-1"></div>
        
        <label className="flex items-center gap-3 cursor-pointer group">
          <input type="checkbox" className="w-4 h-4 accent-gray-700 rounded" checked={showSymbols} onChange={e => setShowSymbols(e.target.checked)} />
          <span className="text-sm font-medium text-gray-800">Simbol (Pekerja Tani)</span>
        </label>
      </div>

      <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg pointer-events-auto border border-gray-100 flex items-center gap-4">
        <button onClick={() => setYear(y => Math.max(2020, y - 1))} disabled={year === 2020} className="w-11 h-11 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-gray-600">
          &minus;
        </button>
        <div className="flex flex-col items-center min-w-[120px]">
          <span className="text-2xl font-black text-gray-800">{year}</span>
          <input 
            type="range" min="2020" max="2025" step="1" 
            value={year} onChange={(e) => setYear(Number(e.target.value))}
            className="w-full mt-2 cursor-pointer accent-green-700 h-2 bg-gray-200 rounded-lg appearance-none"
          />
        </div>
        <button onClick={() => setYear(y => Math.min(2025, y + 1))} disabled={year === 2025} className="w-11 h-11 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-gray-600">
          +
        </button>
      </div>
    </div>
  );
}