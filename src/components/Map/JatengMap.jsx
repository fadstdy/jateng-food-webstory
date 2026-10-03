import { useEffect, useRef, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { scaleSqrt } from 'd3-scale';
import 'leaflet/dist/leaflet.css';

const CHOROPLETH_COLORS = ['#edf8e9', '#bae4b3', '#74c476', '#31a354', '#006d2c'];

function ResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

export default function JatengMap({ data, year, showChoropleth, showSymbols, selectedKabkota, setSelectedKabkota }) {
  const geoJsonRef = useRef();
  const { geo, ts, meta } = data;
  
  const breaks = meta.klasifikasi_choropleth.quantiles_breaks;
  const symbolDomain = meta.skala_simbol.domain;
  
  const fmt = new Intl.NumberFormat('id-ID');
  const fmtDec = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });

  const getClassIndex = (val) => {
    if (val === null || val === undefined) return -1;
    for (let i = 0; i < breaks.length; i++) {
      if (val <= breaks[i]) return i;
    }
    return breaks.length - 1;
  };

  const centroidData = useMemo(() => {
    const layer = L.geoJSON(geo);
    const symbols = [];
    layer.eachLayer(l => {
      const center = l.getBounds().getCenter();
      const kode = String(l.feature.properties.kode_kabkota);
      symbols.push({ kode, lat: center.lat, lng: center.lng, feature: l.feature });
    });
    return symbols;
  }, [geo]);

  const activeSymbols = useMemo(() => {
    return centroidData.map(item => {
      const val = ts[item.kode]?.[year]?.penduduk_kerja_pertanian ?? null;
      return { ...item, value: val };
    }).filter(item => item.value !== null)
      .sort((a, b) => b.value - a.value);
  }, [centroidData, ts, year]);

  const radiusScale = scaleSqrt().domain(symbolDomain).range([4, 28]).clamp(true);

  const getFeatureStyle = useCallback((feature) => {
    const kode = String(feature.properties.kode_kabkota);
    const row = ts[kode]?.[year] || {};
    const valPadi = row.padi_per_kapita;
    const classIdx = getClassIndex(valPadi);
    const isSelected = selectedKabkota === kode;

    return {
      fillColor: showChoropleth ? (classIdx >= 0 ? CHOROPLETH_COLORS[classIdx] : 'url(#stripes)') : '#ffffff',
      fillOpacity: isSelected ? 1 : (showChoropleth ? 0.85 : 0.1),
      // PERBAIKAN: Jika choropleth mati, batas wilayah jadi abu-abu (#9ca3af) agar terlihat
      color: isSelected ? '#f59e0b' : (showChoropleth ? '#ffffff' : '#9ca3af'),
      weight: isSelected ? 2.5 : 1, 
      dashArray: isSelected ? '' : '3',
      className: 'outline-none'
    };
  }, [year, showChoropleth, selectedKabkota, ts, breaks]);

  useEffect(() => {
    if (!geoJsonRef.current) return;
    geoJsonRef.current.setStyle(getFeatureStyle);
    geoJsonRef.current.eachLayer((layer) => {
      const kode = String(layer.feature.properties.kode_kabkota);
      const nama = layer.feature.properties.nama_kabkota;
      const row = ts[kode]?.[year] || {};
      
      const valPadi = row.padi_per_kapita;
      const valPekerja = row.penduduk_kerja_pertanian;

      // PERBAIKAN: Teks "Kelas X dari 5" dibuang agar lebih rapi
      const tooltipHtml = `
        <div class="font-sans text-sm min-w-[200px]">
          <div class="font-bold border-b pb-1 mb-2">${nama} (${year})</div>
          <div class="flex justify-between gap-4 mb-1">
            <span class="text-gray-600">${meta.variabel.padi_per_kapita.nama}:</span>
            <span class="font-semibold">${valPadi != null ? fmtDec.format(valPadi) : 'Tidak tersedia'} <span class="text-xs font-normal text-gray-500">${meta.variabel.padi_per_kapita.satuan}</span></span>
          </div>
          <div class="flex justify-between gap-4">
            <span class="text-gray-600">${meta.variabel.penduduk_kerja_pertanian.nama}:</span>
            <span class="font-semibold">${valPekerja != null ? fmt.format(valPekerja) : 'Tidak tersedia'} <span class="text-xs font-normal text-gray-500">${meta.variabel.penduduk_kerja_pertanian.satuan}</span></span>
          </div>
        </div>
      `;
      layer.setTooltipContent(tooltipHtml);
    });
  }, [year, showChoropleth, selectedKabkota, ts, meta, getFeatureStyle]);

  return (
    <>
      <svg className="sr-only">
        <defs>
          <pattern id="stripes" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="4" height="8" transform="translate(0,0)" fill="#d1d5db"></rect>
          </pattern>
        </defs>
      </svg>

      <MapContainer 
        bounds={[[-8.2, 108.5], [-6.3, 111.7]]} 
        zoomSnap={0.5}
        className="w-full h-full bg-[#f3f4f5]"
        scrollWheelZoom={false}
        dragging={!L.Browser.mobile} 
        tap={!L.Browser.mobile}
      >
        <ResizeHandler />
        <TileLayer
          attribution='Tiles &copy; <a href="https://www.esri.com/">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          className="contrast-125"
        />

        <GeoJSON 
          ref={geoJsonRef}
          data={geo}
          style={getFeatureStyle}
          onEachFeature={(feature, layer) => {
             layer.bindTooltip('', { sticky: true, className: 'bg-white/95 backdrop-blur-sm shadow-xl border-none rounded-lg p-3' });
             layer.on({
               click: (e) => {
                 const kode = String(feature.properties.kode_kabkota);
                 setSelectedKabkota(prev => prev === kode ? null : kode);
                 if (selectedKabkota !== kode) e.target.bringToFront();
               }
             });
          }}
        />

        {showSymbols && activeSymbols.map((item) => (
          <CircleMarker
            key={item.kode}
            center={[item.lat, item.lng]}
            radius={radiusScale(item.value)}
            pathOptions={{
              fillColor: '#374151',
              fillOpacity: 0.65,
              color: '#ffffff',
              weight: 1.5
            }}
            interactive={false}
          />
        ))}
        
        {L.Browser.mobile && (
           <div className="absolute inset-0 pointer-events-none z-[1000] flex items-end justify-center pb-8 opacity-70">
              <div className="bg-black/60 text-white text-xs px-4 py-2 rounded-full">
                 Gunakan dua jari untuk menggeser peta
              </div>
           </div>
        )}
      </MapContainer>
    </>
  );
}