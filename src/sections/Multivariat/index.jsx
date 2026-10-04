import React, { Component } from 'react';
import { useDataPCA } from '../../hooks/useDataPCA';
import KartuDiagnostik from './KartuDiagnostik';
import BiplotPCA from './BiplotPCA';
import ClusteredHeatmap from './ClusteredHeatmap';
import KartuPencilan from './KartuPencilan';
import RingkasanKlaster from './RingkasanKlaster';
import RadarProfil from './RadarProfil';

class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError(error) { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">Gagal memuat komponen ini.</div>;
    return this.props.children;
  }
}

const MultivariatSection = () => {
  const { data, loading, error } = useDataPCA();

  if (loading) return <div className="py-20 text-center text-[#2F5D2F] animate-pulse">Memuat data analitik...</div>;
  if (error) return <div className="py-20 text-center text-red-600">Terjadi kesalahan: {error}</div>;
  if (!data) return null;

  return (
    // PERBAIKAN: Padding vertikal atas dikurangi dari py-16 menjadi py-6
    <section id="multivariat" className="py-6 bg-[#FAF8F2] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* PERBAIKAN: Margin bawah judul dikurangi, teks sedikit dikecilkan */}
        <header className="mb-4 text-left">
          <h2 className="text-3xl font-bold text-[#2F5D2F] mb-1">Analisis Multivariat</h2>
          <p className="text-[14px] text-[#7A5A3A]">
            Mengeksplorasi karakteristik ketahanan pangan daerah melalui reduksi dimensi dan pengelompokan.
          </p>
        </header>

        {/* BARIS 1: Diagnostik & Biplot */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-1">
            <ErrorBoundary><KartuDiagnostik data={data} /></ErrorBoundary>
          </div>
          <div className="lg:col-span-2">
            <ErrorBoundary><BiplotPCA data={data} /></ErrorBoundary>
          </div>
        </div>

        {/* BARIS 2: Kanan-Kiri Profil (Clustered Heatmap & Radar) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
           <ErrorBoundary><ClusteredHeatmap data={data} /></ErrorBoundary>
           <ErrorBoundary><RadarProfil data={data} /></ErrorBoundary>
        </div>

        {/* BARIS 3: Pencilan & Klaster */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-1">
             <ErrorBoundary><KartuPencilan data={data} /></ErrorBoundary>
          </div>
          <div className="lg:col-span-2">
             <ErrorBoundary><RingkasanKlaster data={data} /></ErrorBoundary>
          </div>
        </div>

      </div>
    </section>
  );
};

export default MultivariatSection;