import React, { useState, useEffect } from 'react';

const navLinks = [
  { id: 'pembuka', label: 'Mulai' },
  { id: 'hierarki', label: 'Hierarki' },
  { id: 'geospasial', label: 'Peta' },
  { id: 'multivariat', label: 'Faktor' },
  { id: 'kesimpulan', label: 'Akhir' },
];

const NavBar = () => {
  const [activeSection, setActiveSection] = useState('pembuka');

  useEffect(() => {
    const handleScroll = () => {
      // 1. PENGAMAN MUTLAK: Jika scroll mentok di atas, paksa kembali ke 'Mulai'
      if (window.scrollY < 50) {
        setActiveSection('pembuka');
        return;
      }

      let current = 'pembuka';
      
      // 2. CEK DARI BAWAH KE ATAS
      const reversedLinks = [...navLinks].reverse();
      
      for (let link of reversedLinks) {
        const section = document.getElementById(link.id);
        if (section) {
          const rect = section.getBoundingClientRect();
          
          // Jika batas atas section sudah melewati 250px dari atas layar
          if (rect.top <= 250) {
            current = link.id;
            break;
          }
        }
      }
      
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    setTimeout(handleScroll, 200);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    // PERBAIKAN Z-INDEX: Mengubah z-50 menjadi z-[9999] agar selalu di atas grafik Plotly/Peta
    <nav className="fixed top-0 w-full bg-[#FAF8F2]/95 backdrop-blur-md z-[9999] border-b border-green-900/10 shadow-sm transition-all duration-300">
      <div className="flex justify-center items-center p-4 space-x-6 md:space-x-10 max-w-7xl mx-auto w-full">
        {navLinks.map((link) => (
          <a 
            key={link.id} 
            href={`#${link.id}`} 
            className={`text-sm md:text-base font-semibold relative py-1 transition-colors duration-300 ${
              activeSection === link.id 
                ? 'text-[#2F5D2F]' 
                : 'text-gray-500 hover:text-[#7A5A3A]'
            }`}
          >
            {link.label}
            
            {activeSection === link.id && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#2F5D2F] rounded-full transition-all duration-300"></span>
            )}
          </a>
        ))}
      </div>
    </nav>
  );
};

export default NavBar;