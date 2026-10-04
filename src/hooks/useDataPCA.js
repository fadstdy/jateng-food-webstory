import { useState, useEffect } from 'react';
import { VARIABEL_CONFIG } from '../config/variabel';

let cachedData = null;

export const useDataPCA = () => {
  const [data, setData] = useState(cachedData);
  const [loading, setLoading] = useState(!cachedData);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cachedData) return;
    
    const fetchData = async () => {
      try {
        const baseUrl = import.meta.env.BASE_URL || '/';
        const res = await fetch(`${baseUrl}data/output_pca.json`);
        if (!res.ok) throw new Error('Gagal memuat data PCA');
        
        const jsonData = await res.json();
        
        // Sanity Check Dev-Only
        if (import.meta.env.DEV) {
          console.assert(jsonData.units.length >= 34, "Minimal observasi adalah 34");
          console.assert(jsonData.variabel.length >= 8, "Minimal variabel adalah 8");
          const kodeSet = new Set(jsonData.units.map(u => u.kode_kabkota));
          console.assert(kodeSet.size === jsonData.units.length, "Ada duplikasi kode kab/kota!");
        }

        cachedData = jsonData;
        setData(jsonData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helpers
  const unitByKode = (kode) => data?.units.find(u => String(u.kode_kabkota) === String(kode));
  const varById = (id) => data?.variabel.find(v => v.id === id);
  const varByNama = (nama) => data?.variabel.find(v => v.nama === nama);
  
  const fmtNilai = (id, nilaiMentah) => {
    const config = VARIABEL_CONFIG[id];
    if (!config) return nilaiMentah;
    const nilaiFinal = nilaiMentah * config.faktor;
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: config.desimal,
      maximumFractionDigits: config.desimal
    }).format(nilaiFinal) + ' ' + config.satuan;
  };

  return { data, loading, error, unitByKode, varById, varByNama, fmtNilai };
};