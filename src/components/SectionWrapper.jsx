import { motion, useReducedMotion } from 'framer-motion';

export default function SectionWrapper({ id, title, subtitle, bridgeText, children }) {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.3, delayChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <motion.section 
      id={id} 
      /* 
         PERBAIKAN: Jika id pembuka, beri pt-28 (112px) agar turun ke bawah navbar.
         Jika section lain, pt-24 sudah cukup.
      */
      className={`min-h-screen pb-12 px-4 md:px-8 max-w-6xl mx-auto flex flex-col scroll-mt-24 ${
        id === 'pembuka' ? 'pt-28 md:pt-32' : 'pt-24'
      }`}
      initial="hidden" 
      whileInView="visible" 
      viewport={{ once: false, margin: "-15% 0px -15% 0px" }} 
      variants={containerVariants}
    >
      {id !== 'pembuka' && (
        <motion.div variants={itemVariants} className="mb-6">
          <h2 className="font-display text-4xl text-hijau-utama font-bold">{title}</h2>
          {subtitle && <p className="font-sans text-xl text-teks-sekunder mt-2">{subtitle}</p>}
        </motion.div>
      )}
      
      <motion.div variants={itemVariants} className="flex flex-col w-full">
        {children}
      </motion.div>
      
      {bridgeText && (
        <motion.div variants={itemVariants} className="mt-12 pt-8 border-t border-garis text-center">
          <p className="text-coklat-aksen italic text-lg">{bridgeText}</p>
        </motion.div>
      )}
    </motion.section>
  );
}