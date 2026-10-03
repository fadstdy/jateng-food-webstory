import { MapContainer, TileLayer } from 'react-leaflet';
import { InsightCard, LegendContainer, SourceTag } from '../components/UI';

export default function Geospasial() {
  return (
    <div className="grid md:grid-cols-3 gap-6 h-[600px]">
      <div className="md:col-span-2 relative h-full rounded-xl overflow-hidden border border-garis shadow-sm z-0">
        {/* z-0 agar legenda dan navbar tetap di atas map */}
        <MapContainer center={[-7.150975, 110.140259]} zoom={8} scrollWheelZoom={false} className="h-full w-full bg-krem">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        </MapContainer>
        <LegendContainer>
          <p className="font-bold text-sm text-hijau-utama">Legenda Peta</p>
        </LegendContainer>
      </div>
      <div className="flex flex-col">
        <InsightCard title="Distribusi Spasial">
          <p className="text-sm">Di sini akan diletakkan temuan dari data GeoJSON Anda untuk area yang disorot.</p>
        </InsightCard>
        <SourceTag text="Sumber: Peta Dasar OSM & Data BPS 2023" />
      </div>
    </div>
  );
}