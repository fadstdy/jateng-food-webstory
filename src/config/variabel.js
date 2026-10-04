// Jika data JSON sudah terkonversi/dikali dari Python, ubah faktor menjadi 1
export const VARIABEL_CONFIG = {
  v1: { nama: "kalori", label: "Konsumsi kalori", satuan: "kkal/kapita/hari", faktor: 1000, desimal: 0, diLog: false },
  v2: { nama: "pct_kerja_tani", label: "Penduduk bekerja di pertanian", satuan: "%", faktor: 100, desimal: 1, diLog: false },
  v3: { nama: "pct_pengeluaran_makanan", label: "Pengeluaran untuk makanan", satuan: "% total pengel.", faktor: 1, desimal: 1, diLog: false },
  v4: { nama: "produksi_cabai_kapita", label: "Produksi cabai per kapita", satuan: "kg/kapita", faktor: 1, desimal: 2, diLog: true },
  v5: { nama: "produksi_padi_kapita", label: "Produksi padi per kapita", satuan: "kg GKG/kapita", faktor: 1, desimal: 0, diLog: true },
  v6: { nama: "produksi_telur_kapita", label: "Produksi telur per kapita", satuan: "kg/kapita", faktor: 1, desimal: 1, diLog: true },
  v7: { nama: "produktivitas_padi", label: "Produktivitas padi", satuan: "ku/ha", faktor: 1, desimal: 1, diLog: false },
  v8: { nama: "share_pdrb", label: "Share PDRB pertanian", satuan: "%", faktor: 100, desimal: 1, diLog: false },
  v9: { nama: "protein", label: "Konsumsi protein", satuan: "g/kapita/hari", faktor: 1, desimal: 1, diLog: false }
};