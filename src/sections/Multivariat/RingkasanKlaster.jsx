import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { KLASTER_CONFIG } from '../../config/klaster';
import { useDataPCA } from '../../hooks/useDataPCA';
import { VARIABEL_CONFIG } from '../../config/variabel';

const RingkasanKlaster = ({ data }) => {
  const { setBrush } = useAppContext() || {}; // Menggunakan custom setBrush alias dari context Tahap 1
  const setKodeBrush = useAppContext()?.setKodeBrush || setBrush || (() => {});
  const { varByNama } = useDataPCA();
  const { profil, silhouette } = data.klaster_meta;
  
  // State accordion wilayah
  const [openId, setOpenId] = useState(null);

  // Peringatan Silhouette
  const isWeak = silhouette < 0.25;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <h3 className="font-bold text-[#2F5D2F] text-lg">F. Profil Klaster</h3>
          <p className="text-xs text-[#7A5A3A] mt-1">Klik kartu untuk menyorot anggota di peta/biplot.</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 font-semibold uppercase">Skor Silhouette</div>
          <div className={`text-xl font-bold ${isWeak ? 'text-orange-500' : 'text-green-600'}`}>
            {silhouette.toFixed(3)}
          </div>
        </div>
      </div>

      {isWeak && (
        <div className="bg-orange-50 px-5 py-2 text-xs text-orange-700 border-b border-orange-100 font-medium">
          Struktur klaster lemah (Silhouette &lt; 0.25); pengelompokan bersifat eksploratif.
        </div>
      )}

      <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
        {profil.map(k => {
          const klasterInfo = KLASTER_CONFIG[k.id_klaster];
          
          // Verifikasi jumlah anggota
          const anggotaUnit = data.units.filter(u => u.klaster === k.id_klaster);
          if (import.meta.env.DEV) {
            console.assert(anggotaUnit.length === k.jumlah_anggota, `Mismatch jumlah anggota Klaster ${k.id_klaster}`);
          }

          // Cari Top 3 & Bottom 3 variabel berdasarkan Z-Score
          const zScoresArray = Object.entries(k.rata_rata_z).map(([nama, nilai]) => ({
            nama, nilai, label: VARIABEL_CONFIG[varByNama(nama)?.id]?.label || nama
          }));
          zScoresArray.sort((a, b) => b.nilai - a.nilai);
          const top3 = zScoresArray.slice(0, 3);
          const bottom3 = zScoresArray.slice(-3).reverse();

          const isExpanded = openId === k.id_klaster;

          return (
            <div 
              key={k.id_klaster} 
              className="border border-gray-200 rounded-lg overflow-hidden flex flex-col transition-shadow hover:shadow-md cursor-pointer"
              onClick={() => setKodeBrush(anggotaUnit.map(u => u.kode_kabkota))}
            >
              {/* Header Kartu */}
              <div 
                className="p-3 text-white flex justify-between items-center" 
                style={{ backgroundColor: klasterInfo.warna }}
              >
                <div className="font-bold text-sm">{klasterInfo.label}</div>
                <div className="bg-white/20 px-2 py-0.5 rounded text-xs">n = {anggotaUnit.length}</div>
              </div>

              {/* Body: Karakteristik Z-Score */}
              <div className="p-3 text-xs flex-1">
                <div className="text-[10px] uppercase font-bold text-gray-500 mb-1">Ciri Tertinggi (Z &gt; 0):</div>
                <ul className="mb-2">
                  {top3.map(v => (
                    <li key={v.nama} className="truncate flex justify-between">
                      <span className="text-gray-700 truncate mr-2" title={v.label}>• {v.label}</span>
                      <span className="font-mono text-green-600">+{v.nilai.toFixed(1)}</span>
                    </li>
                  ))}
                </ul>
                <div className="text-[10px] uppercase font-bold text-gray-500 mb-1">Ciri Terendah (Z &lt; 0):</div>
                <ul>
                  {bottom3.map(v => (
                    <li key={v.nama} className="truncate flex justify-between">
                      <span className="text-gray-700 truncate mr-2" title={v.label}>• {v.label}</span>
                      <span className="font-mono text-red-500">{v.nilai.toFixed(1)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer: Accordion List Anggota */}
              <div className="border-t border-gray-100">
                <button 
                  className="w-full text-center text-[10px] font-semibold text-gray-500 bg-gray-50 py-2 hover:bg-gray-100"
                  onClick={(e) => { e.stopPropagation(); setOpenId(isExpanded ? null : k.id_klaster); }}
                >
                  {isExpanded ? 'Tutup Daftar Wilayah' : 'Lihat Daftar Wilayah'}
                </button>
                {isExpanded && (
                  <div className="p-3 bg-gray-50 max-h-32 overflow-y-auto text-[10px] text-gray-700">
                    {anggotaUnit.map(u => <div key={u.kode_kabkota} className="mb-1 border-b border-gray-200 pb-1">{u.nama}</div>)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default RingkasanKlaster;