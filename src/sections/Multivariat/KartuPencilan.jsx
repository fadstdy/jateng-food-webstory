import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { INSIGHT_MULTIVARIAT } from '../../config/insightMultivariat';

const KartuPencilan = ({ data }) => {
  const { kodeTerpilih, setKodeTerpilih } = useAppContext() || {};
  const { top_5, ambang_chi2_975 } = data.pencilan_meta;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden">
      <div className="p-5 border-b border-gray-100 bg-red-50/30">
        <h3 className="font-bold text-[#2F5D2F] text-lg">F. Daftar Pencilan</h3>
        <p className="text-xs text-[#7A5A3A] mt-1">
          Top 5 jarak Mahalanobis. Ambang batas (df=3): <span className="font-mono font-bold">{ambang_chi2_975.toFixed(2)}</span>.
        </p>
      </div>
      
      <div className="flex-1 overflow-x-auto p-4">
        <table className="w-full text-left text-xs mb-4">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-2 font-semibold text-gray-600">Wilayah</th>
              <th className="p-2 font-semibold text-gray-600 text-right">Jarak</th>
              <th className="p-2 font-semibold text-gray-600 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {top_5.map((outlier, i) => {
              // JEBAKAN DATA: Ambil nama dari units, JANGAN dari nama_wilayah Python
              const u = data.units.find(x => x.kode_kabkota === outlier.kode_kabkota);
              if (!u) return null;
              
              const isOver = outlier.mahalanobis > ambang_chi2_975;
              const isSelected = kodeTerpilih === u.kode_kabkota;

              return (
                <tr 
                  key={u.kode_kabkota}
                  onClick={() => setKodeTerpilih(u.kode_kabkota)}
                  className={`border-b border-gray-100 cursor-pointer transition-colors ${isSelected ? 'bg-[#2F5D2F]/10 font-medium' : 'hover:bg-gray-50'}`}
                >
                  <td className="p-2 text-gray-800 flex items-center gap-1">
                    <span className="text-[10px] text-gray-400 w-3">{i+1}.</span> 
                    {u.nama}
                  </td>
                  <td className="p-2 font-mono text-right text-gray-600">{outlier.mahalanobis.toFixed(2)}</td>
                  <td className="p-2 text-center">
                    {isOver ? (
                      <span className="bg-red-100 text-red-700 py-0.5 px-2 rounded-full text-[9px] font-bold">MELEWATI</span>
                    ) : (
                      <span className="bg-orange-100 text-orange-700 py-0.5 px-2 rounded-full text-[9px]">KANDIDAT</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="bg-[#FAF8F2] p-3 rounded-lg border border-[#e8dfc8] text-xs text-gray-700 italic">
          "{INSIGHT_MULTIVARIAT.pencilan}"
        </div>
      </div>
    </div>
  );
};
export default KartuPencilan;