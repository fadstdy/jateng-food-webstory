export default function DesignNodes({ meta }) {
  return (
    <details className="group max-w-xs md:max-w-md bg-white border border-gray-200 rounded-lg text-xs text-gray-700 shadow-sm cursor-pointer [&_summary::-webkit-details-marker]:hidden">
      <summary className="font-semibold p-2.5 px-4 outline-none flex justify-between items-center bg-gray-50 rounded-lg group-open:rounded-b-none group-open:bg-gray-100 transition-colors">
        <span>Catatan Rancangan Visual</span>
        <span className="transition-transform group-open:rotate-180">▼</span>
      </summary>
      <div className="p-4 space-y-3 leading-relaxed border-t border-gray-100">
        <p><strong>Justifikasi Pemetaan:</strong> Choropleth eksklusif untuk rasio (padi per kapita). Variabel absolut (pekerja tani) disajikan dengan simbol proporsional berdasar luasan agar tidak menipu mata. Kelas kuantil dengan <em>breaks</em> tetap (statis lintas tahun) memungkinkan perbandingan peringkat yang stabil.</p>
        <p><strong>Palet Warna:</strong> <em>Purples</em> sekuensial digunakan untuk menjamin kontras AA dan ramah buta warna. Kategori LISA memakai set Okabe-Ito (aman untuk defisiensi penglihatan warna).</p>
        <p><strong>Statistik Spasial:</strong> Pembobotan <em>Queen contiguity (row-standardized)</em>, permutasi {meta?.analisis?.permutasi || 999}, Alpha {meta?.analisis?.alpha || 0.05}.</p>
        <p className="text-red-700 bg-red-50 p-2 rounded"><strong>Keterbatasan:</strong> Terdapat Modifiable Areal Unit Problem (MAUP). Analisis terbatas pada 35 kab/kota (n kecil) mengurangi <em>statistical power</em>, dan P-value pseudo sangat bergantung pada seed permutasi.</p>
      </div>
    </details>
  );
}