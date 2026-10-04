import React from 'react';
import { motion } from 'framer-motion';
import heroImg from '../assets/hero.jpg'; 

const Pembuka = () => {
  return (
    <div className="w-full flex flex-col items-center justify-start pb-4">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
        
        {/* KOLOM KIRI */}
        {/* PERUBAHAN: space-y-5 diubah jadi space-y-3 agar teks lebih padat */}
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

          {/* PERUBAHAN: Ukuran teks disesuaikan sedikit agar lebih ringkas */}
          <h1 className="text-4xl lg:text-4xl font-extrabold leading-tight text-gray-900 font-serif">
            Membaca Pola Pangan <br className="hidden lg:block" />
            <span className="text-[#2F5D2F]">Jawa Tengah</span>
          </h1>

          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700">
              Eksplorasi konsumsi, produksi, dan karakteristik pangan di 35 kabupaten/kota berdasarkan data BPS
            </p>
            <p className="text-sm md:text-base text-gray-600">
            
            </p>
          </div>

          {/* Tombol ditarik lebih ke atas
          <div className="pt-1">
            <a href="#hierarki" className="inline-flex bg-[#2F5D2F] hover:bg-[#1f401f] text-white text-sm md:text-base font-medium py-2.5 px-6 rounded-lg transition-colors items-center gap-2 shadow-md w-fit">
              Mulai membaca <span>↓</span>
            </a>
          </div> */}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 pt-2">
            {[
              { angka: '35', label: 'KABUPATEN / KOTA' },
              { angka: '2020-2025', label: 'RENTANG DATA' },
              { angka: '9', label: 'PROFIL PANGAN' },
              { angka: '3', label: 'VISUALISASI' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
                <span className="text-xl font-bold text-[#2F5D2F] mb-0.5">{stat.angka}</span>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* KOLOM KANAN */}
        {/* KOLOM KANAN: GAMBAR & SUMBER */}
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
          {/* Teks sumber gambar: abu-abu terang dan rata kanan */}
          <span className="text-[11px] text-gray-400 mt-1 text-right">
            Sumber: Pexels / Foto oleh M D Fahmi
          </span>
        </motion.div>
      </div>

      {/* INFOGRAPHIC HOOK */}
      {/* PERUBAHAN: mt dikurangi drastis dari mt-16 menjadi mt-6 md:mt-10 */}
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
            "...Jawa Tengah tetap menjadi lumbung pangan nasional. Tahun 2025 kita sudah menghasilkan 9,1 juta ton gabah kering, dari jumlah itu 15,6 persen untuk kebutuhan nasional,"
          </p>
          
          <div className="text-sm md:text-base font-bold text-[#7A5A3A] relative z-10">
            — Ahmad Luthfi,
            <span className="block text-xs font-medium text-gray-600 mt-0.5">Boyolali, (2/6/2026)</span>
          </div>
        </div>
      </motion.div>

    </div>
  );
};

export default Pembuka;