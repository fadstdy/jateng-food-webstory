import { useEffect, useState } from 'react';
import { sectionConfig } from '../config/sections';

export default function NavBar() {
  const [activeId, setActiveId] = useState(sectionConfig[0].id);
  // State baru untuk mengatur buka/tutup menu di layar HP
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => entry.isIntersecting && setActiveId(entry.target.id));
    }, { rootMargin: '-40% 0px -60% 0px' });

    sectionConfig.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    // Otomatis menutup menu HP setelah salah satu navigasi diklik
    setIsMobileMenuOpen(false); 
  };

  return (
    <nav className="sticky top-0 z-50 bg-krem/95 backdrop-blur-md border-b border-garis">
      {/* Container Navigasi Utama */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between md:justify-center items-center h-16">
          
          {/* Tombol Hamburger (Hanya tampil di Layar Kecil/HP) */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center justify-center min-h-[44px] min-w-[44px] text-teks-sekunder hover:text-hijau-utama focus-visible:outline-2 focus-visible:outline-hijau-utama rounded"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                // Ikon Silang (X)
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                // Ikon Hamburger (Garis 3)
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Judul Aktif (Hanya tampil di HP agar area atas tidak kosong) */}
          <span className="md:hidden font-medium text-hijau-utama">
            {sectionConfig.find(s => s.id === activeId)?.shortTitle || 'Menu'}
          </span>

          {/* Area Kosong Penyeimbang Layout di HP */}
          <div className="w-[44px] md:hidden"></div>

          {/* Menu Desktop (Rata tengah, disembunyikan di HP) */}
          <ul className="hidden md:flex justify-center gap-6">
            {sectionConfig.map(s => (
              <li key={s.id}>
                <button
                  onClick={() => scrollTo(s.id)}
                  className={`min-h-[44px] px-4 py-2 text-base font-medium transition-colors cursor-pointer 
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hijau-utama 
                  ${activeId === s.id ? 'text-hijau-utama border-b-2 border-hijau-utama' : 'text-teks-sekunder active:text-coklat-aksen'}`}
                >
                  {s.shortTitle || s.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Menu Dropdown Mobile (Muncul vertikal jika isMobileMenuOpen = true) */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute w-full bg-krem border-b border-garis shadow-lg">
          <ul className="flex flex-col py-2 px-4">
            {sectionConfig.map(s => (
              <li key={s.id}>
                <button
                  onClick={() => scrollTo(s.id)}
                  /* Tombol dibuat w-full dan text-left agar mudah ditekan dari sisi mana saja */
                  className={`w-full text-left min-h-[44px] px-4 py-3 my-1 text-base font-medium transition-colors rounded-lg
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hijau-utama 
                  ${activeId === s.id ? 'text-hijau-utama bg-hijau-muda/50' : 'text-teks-sekunder active:text-coklat-aksen'}`}
                >
                  {s.shortTitle || s.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}