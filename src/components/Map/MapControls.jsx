export default function MapControls({ year, setYear }) {
  return (
    <div className="absolute bottom-4 left-4 z-[400] flex flex-col gap-2 pointer-events-none">
      
      {/* Year Slider (Tetap melayang di atas peta) */}
      <div className="bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg pointer-events-auto border border-gray-100 flex items-center gap-4">
        <button onClick={() => setYear(y => Math.max(2020, y - 1))} disabled={year === 2020} className="w-11 h-11 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-gray-600 transition-colors">
          &minus;
        </button>
        
        <div className="flex flex-col items-center min-w-[120px]">
          <span className="text-xl font-black text-gray-800">{year}</span>
          <input 
            type="range" 
            min="2020" max="2025" 
            step="1" 
            value={year} 
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full mt-2 cursor-pointer accent-green-700 h-2 bg-gray-200 rounded-lg appearance-none"
          />
        </div>

        <button onClick={() => setYear(y => Math.min(2025, y + 1))} disabled={year === 2025} className="w-11 h-11 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-gray-600 transition-colors">
          +
        </button>
      </div>
    </div>
  );
}