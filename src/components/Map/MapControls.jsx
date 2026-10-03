export default function MapControls({ year, setYear, showChoropleth, setShowChoropleth, showSymbols, setShowSymbols }) {
  const years = [2020, 2021, 2022, 2023, 2024, 2025];
  
  const handlePrev = () => setYear(y => Math.max(2020, y - 1));
  const handleNext = () => setYear(y => Math.min(2025, y + 1));

  return (
    <div className="absolute bottom-4 left-4 z-[400] flex flex-col gap-2 pointer-events-none">
      
      {/* Layer Toggles */}
      <div className="bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg pointer-events-auto border border-gray-100 flex flex-col gap-1 w-max">
        <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 min-h-[44px]">
          {/* Ubah warna accent checkbox menjadi hijau */}
          <input type="checkbox" className="w-5 h-5 accent-green-700 cursor-pointer" checked={showChoropleth} onChange={e => setShowChoropleth(e.target.checked)} />
          <span className="text-sm font-medium text-gray-800">Choropleth (Padi)</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 min-h-[44px]">
          <input type="checkbox" className="w-5 h-5 accent-gray-700 cursor-pointer" checked={showSymbols} onChange={e => setShowSymbols(e.target.checked)} />
          <span className="text-sm font-medium text-gray-800">Simbol (Pekerja)</span>
        </label>
      </div>

      {/* Year Slider */}
      <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg pointer-events-auto border border-gray-100 flex items-center gap-4">
        <button onClick={handlePrev} disabled={year === 2020} className="w-11 h-11 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-gray-600 transition-colors">
          &minus;
        </button>
        
        <div className="flex flex-col items-center min-w-[120px]">
          <span className="text-2xl font-black text-gray-800">{year}</span>
          {/* Ubah warna accent slider menjadi hijau */}
          <input 
            type="range" 
            min="2020" max="2025" 
            step="1" 
            value={year} 
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full mt-2 cursor-pointer accent-green-700 h-2 bg-gray-200 rounded-lg appearance-none"
          />
        </div>

        <button onClick={handleNext} disabled={year === 2025} className="w-11 h-11 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-gray-600 transition-colors">
          +
        </button>
      </div>
    </div>
  );
}