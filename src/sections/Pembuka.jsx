import React from 'react';
import { motion } from 'framer-motion';
import heroImg from '../assets/hero.jpg'; 

const Pembuka = () => {
  return (
    <div className="w-full flex flex-col items-center justify-start pb-4">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
        
        {/* KOLOM KIRI */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col space-y-3 md:space-y-4"
        >
          <div className="inline-flex items-center space-x-2 bg-green-100/50 text-[#2F5D2F] px-4 py-1 rounded-full w-fit text-xs font-bold tracking-wider border border-green-200">
            <span className="w-2 h-2 rounded-full bg-[#2F5D2F]"></span>
            <span>WEBSTORY DATA - BPS - 2020-2025</span>
          </div>

          <h1 className="text-4xl lg:text-4xl font-extrabold leading-tight text-gray-900 font-serif">
            Membaca Pola Pangan <br className="hidden lg:block" />
            <span className="text-[#2F5D2F]">Jawa Tengah</span>
          </h1>

          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700">
              Eksplorasi konsumsi, produksi, dan karakteristik pangan di 35 kabupaten/kota berdasarkan data BPS
            </p>
          </div>

          {/* Kotak-kotak (Stats) - Penyesuaian satu baris untuk 2020-2025 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 pt-4">
            {[
              { angka: '35', label: 'Kab / Kota' },
              { angka: '2020-2025', label: 'Rentang Tahun' },
              { angka: '9', label: 'Profil Pangan' },
              { angka: '3', label: 'Visualisasi' }
            ].map((stat, idx) => (
              <div 
                key={idx} 
                className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-green-900/10 flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-green-900/30 group"
              >
                {/* PERUBAHAN: Menambahkan whitespace-nowrap dan ukuran teks dinamis */}
                <span 
                  className={`font-black text-[#2F5D2F] mb-1 transition-transform duration-300 group-hover:scale-110 whitespace-nowrap ${
                    stat.angka.length > 5 ? 'text-lg md:text-xl' : 'text-2xl md:text-3xl'
                  }`}
                >
                  {stat.angka}
                </span>
                <span className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-tight">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* KOLOM KANAN */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-end w-full"
        >
          <img 
            src={heroImg} 
            alt="Pemandangan Sawah dan Gunung Jawa Tengah" 
            className="w-full h-auto max-h-[280px] md:max-h-[300px] object-cover rounded-2xl shadow-lg border border-gray-200"
          />
          <span className="text-[11px] text-gray-400 mt-1 text-right">
            Sumber: Pexels / Foto oleh M D Fahmi
          </span>
        </motion.div>
      </div>

      {/* INFOGRAPHIC HOOK */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="w-full max-w-4xl mt-6 md:mt-10"
      >
        <div className="bg-[#EDF2E8] relative rounded-2xl p-6 md:p-8 text-center shadow-sm border border-[#2F5D2F]/10">
          
          <div className="absolute top-0 left-4 md:left-6 text-6xl text-[#2F5D2F] opacity-10 font-serif leading-none">“</div>
          <div className="absolute bottom-[-15px] right-4 md:right-6 text-6xl text-[#2F5D2F] opacity-10 font-serif leading-none rotate-180">“</div>
          
          <p className="text-base md:text-lg italic font-semibold text-gray-800 leading-relaxed mb-3 relative z-10">
            "Jawa Tengah tetap menjadi lumbung pangan nasional. Tahun 2025 kita sudah menghasilkan 9,1 juta ton gabah kering, dari jumlah itu 15,6 persen untuk kebutuhan nasional,"
          </p>
          
          <div className="text-sm md:text-base font-bold text-[#7A5A3A] relative z-10">
            — Gubernur Jawa Tengah Ahmad Luthfi
            <span className="block text-xs font-medium text-gray-600 mt-0.5">Rembug Pembangunan Jateng 2026 di Boyolali, (2/6/2026)</span>
          </div>
        </div>
      </motion.div>

    </div>
  );
};

export default Pembuka;