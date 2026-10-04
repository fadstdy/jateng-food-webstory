import Pembuka from '../sections/Pembuka';
import Hierarki from '../sections/Hierarki';
import Geospasial from '../sections/Geospasial';
import Multivariat from '../sections/Multivariat';
import Kesimpulan from '../sections/Kesimpulan';
// import Metodologi from '../sections/Metodologi';

export const sectionConfig = [
  { id: 'pembuka', title: 'Ketahanan Pangan Jawa Tengah', subtitle: 'Pendahuluan', shortTitle: 'Mulai', component: Pembuka, bridgeText: 'Mari kita bedah datanya secara hierarkis.' },
  { id: 'hierarki', title: 'Hierarki Wilayah', subtitle: 'Komparasi Regional', shortTitle: 'Hierarki', component: Hierarki, bridgeText: 'Bagaimana sebaran spasial 35 Kabupaten/Kota ini?' },
  { id: 'geospasial', title: 'Peta Ketahanan Pangan', subtitle: 'Distribusi Geografis', shortTitle: 'Peta', component: Geospasial, bridgeText: 'Lalu, apa faktor pembentuk utamanya?' },
  { id: 'multivariat', title: 'Analisis Multivariat', subtitle: 'Korelasi Antar Faktor', shortTitle: 'Faktor', component: Multivariat, bridgeText: 'Sebagai penutup...' },
  { id: 'kesimpulan', title: 'Kesimpulan', subtitle: null, shortTitle: 'Akhir', component: Kesimpulan, bridgeText: 'Seluruh analisis didasarkan pada data berikut.' },
  // { id: 'metodologi', title: 'Metodologi & Sumber Data', subtitle: null, shortTitle: 'Metode', component: Metodologi, bridgeText: null }
];