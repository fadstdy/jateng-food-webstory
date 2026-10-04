export default function MoranChart({ moranData, currentYear, meta }) {
  if (!moranData || moranData.length === 0) return null;

  const alpha = meta?.analisis?.alpha || 0.05;
  const width = 250;
  const height = 90;
  const padX = 20;
  const padY = 15;

  const years = moranData.map(d => d.tahun);
  const values = moranData.map(d => d.moran_padi_I);
  
  const minX = Math.min(...years);
  const maxX = Math.max(...years);
  const minY = Math.min(0, ...values); 
  const maxY = Math.max(...values) * 1.2; 

  const getX = (year) => padX + ((year - minX) / (maxX - minX)) * (width - padX * 2);
  const getY = (val) => height - padY - ((val - minY) / (maxY - minY)) * (height - padY * 2);

  const pathD = `M ${moranData.map(d => `${getX(d.tahun)},${getY(d.moran_padi_I)}`).join(' L ')}`;

  return (
    // Tambahkan h-full agar kotak ini meregang mengisi sisa ruang sampai rata bawah dengan peta
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm h-full flex flex-col">
      
      <div className="mb-4">
         <h3 className="font-bold text-gray-900 text-sm mb-1">Tren Autokorelasi</h3>
         {/* Teks diperpendek menjadi satu kalimat sederhana */}
         <p className="text-[11px] text-gray-500 leading-tight">
           Moran's I Positif: wilayah mirip cenderung mengelompok.
         </p>
      </div>

      {/* Gunakan flex-1 agar SVG berada di tengah kotak yang memanjang */}
      <div className="w-full flex-1 flex flex-col justify-center items-center relative min-h-0">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-w-[220px] overflow-visible">
          <line x1={padX} y1={getY(0)} x2={width - padX} y2={getY(0)} stroke="#e5e7eb" strokeWidth="2" strokeDasharray="4 2" />
          <path d={pathD} fill="none" stroke="#9ca3af" strokeWidth="2" />
          {moranData.map((d) => {
            const isSignificant = d.moran_padi_p < alpha;
            const isCurrent = d.tahun === currentYear;
            return (
              <g key={d.tahun}>
                <circle 
                  cx={getX(d.tahun)} 
                  cy={getY(d.moran_padi_I)} 
                  r={isCurrent ? 6 : 4} 
                  fill={isCurrent ? '#f59e0b' : (isSignificant ? '#374151' : '#d1d5db')}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="transition-all duration-300"
                />
                {isCurrent && (
                  <text x={getX(d.tahun)} y={getY(d.moran_padi_I) - 10} textAnchor="middle" className="text-[10px] font-bold fill-orange-600">
                    {d.moran_padi_I.toFixed(2)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      
      <div className="flex justify-center gap-4 mt-auto pt-2 text-[10px] text-gray-500">
         <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-700"></span> Signifikan</div>
         <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300"></span> Tidak</div>
      </div>
    </div>
  );
}