import { motion, useReducedMotion } from 'framer-motion';

export default function SectionWrapper({ id, title, subtitle, bridgeText, children }) {
  const shouldReduceMotion = useReducedMotion();

  // 1. Variant untuk Container (mengatur waktu muncul anak-anaknya)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3, // Memberi jeda 0.3 detik antar elemen
        delayChildren: 0.1,
      }
    }
  };

  // 2. Variant untuk tiap elemen (Judul -> Isi -> Bridge Text)
  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <motion.section 
      id={id} 
      /* py-24 diubah ke py-16 agar jarak atas-bawah section tidak terlalu jauh */
      className="min-h-screen py-16 px-4 md:px-8 max-w-6xl mx-auto flex flex-col scroll-mt-20"
      initial="hidden" 
      whileInView="visible" 
      viewport={{ once: false, margin: "-15% 0px -15% 0px" }} 
      variants={containerVariants}
    >
      {/* mb-12 diubah ke mb-8 agar judul lebih dekat dengan isi */}
      <motion.div variants={itemVariants} className="mb-8">
        <h2 className="font-display text-4xl text-hijau-utama font-bold">{title}</h2>
        {subtitle && <p className="font-sans text-xl text-teks-sekunder mt-2">{subtitle}</p>}
      </motion.div>
      
      {/* justify-center dihapus agar konten langsung menempel di bawah judul */}
      <motion.div variants={itemVariants} className="flex-grow flex flex-col">
        {children}
      </motion.div>
      
      {bridgeText && (
        <motion.div variants={itemVariants} className="mt-16 pt-8 border-t border-garis text-center">
          <p className="text-coklat-aksen italic text-lg">{bridgeText}</p>
        </motion.div>
      )}
    </motion.section>
  );
}