import { useEffect, useRef, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { scaleSqrt } from 'd3-scale';
import 'leaflet/dist/leaflet.css';

const CHOROPLETH_COLORS = ['#edf8e9', '#bae4b3', '#74c476', '#31a354', '#006d2c'];
const LISA_COLORS = {
  'HH': '#D55E00',
  'LL': '#0072B2',
  'HL': '#E69F00',
  'LH': '#56B4E9',
  'Tidak signifikan': '#D9D9D9'
};
const LISA_DESC = {
  'HH': 'Produksi tinggi, dikelilingi tinggi',
  'LL': 'Produksi rendah, dikelilingi rendah',
  'HL': 'Produksi tinggi, dikelilingi rendah',
  'LH': 'Produksi rendah, dikelilingi tinggi',
  'Tidak signifikan': 'Bukan klaster signifikan'
};

const fmt = new Intl.NumberFormat('id-ID');
const fmtDec = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });
const fmtP = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 3 });

function ResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

export default function JatengMap({ data, year, baseLayer, showSymbols, selectedKabkota, setSelectedKabkota }) {
  const geoJsonRef = useRef();
  const { geo, ts, meta } = data;
  
  const breaks = meta.klasifikasi_choropleth.quantiles_breaks;
  const symbolDomain = meta.skala_simbol.domain;
  
  const getClassIndex = useCallback((val) => {
    if (val == null) return -1;
    for (let i = 0; i < breaks.length; i++) {
      if (val <= breaks[i]) return i;
    }
    return breaks.length - 1;
  }, [breaks]);

  const centroidData = useMemo(() => {
    const layer = L.geoJSON(geo);
    const symbols = [];
    layer.eachLayer(l => {
      const center = l.getBounds().getCenter();
      symbols.push({ kode: String(l.feature.properties.kode_kabkota), lat: center.lat, lng: center.lng });
    });
    return symbols;
  }, [geo]);

  const activeSymbols = useMemo(() => {
    return centroidData.map(item => ({ ...item, value: ts[item.kode]?.[year]?.penduduk_kerja_pertanian ?? null }))
      .filter(item => item.value !== null)
      .sort((a, b) => b.value - a.value);
  }, [centroidData, ts, year]);

  const radiusScale = useMemo(() => scaleSqrt().domain(symbolDomain).range([4, 28]).clamp(true), [symbolDomain]);

  const getFeatureStyle = useCallback((feature) => {
    const kode = String(feature.properties.kode_kabkota);
    const row = ts[kode]?.[year] || {};
    const isSelected = selectedKabkota === kode;

    let fillColor = '#ffffff';
    let isDataNull = false;

    if (baseLayer === 'choropleth') {
      const classIdx = getClassIndex(row.padi_per_kapita);
      if (classIdx >= 0) fillColor = CHOROPLETH_COLORS[classIdx];
      else isDataNull = true;
    } else if (baseLayer === 'lisa') {
      const lisa = row.lisa_uni;
      fillColor = LISA_COLORS[lisa] || '#ffffff';
      if (!lisa) isDataNull = true;
    }

    return {
      fillColor: isDataNull ? 'url(#stripes)' : fillColor,
      fillOpacity: isSelected ? 1 : (isDataNull ? 0.1 : 0.85),
      color: isSelected ? '#f59e0b' : (baseLayer === 'choropleth' ? '#ffffff' : '#9ca3af'),
      weight: isSelected ? 2.5 : 1, 
      dashArray: isSelected ? '' : '3',
      className: 'outline-none'
    };
  }, [year, baseLayer, selectedKabkota, ts, getClassIndex]);

  useEffect(() => {
    if (!geoJsonRef.current) return;
    geoJsonRef.current.setStyle(getFeatureStyle);
    
    geoJsonRef.current.eachLayer((layer) => {
      const kode = String(layer.feature.properties.kode_kabkota);
      const nama = layer.feature.properties.nama_kabkota;
      const row = ts[kode]?.[year] || {};
      
      const valPadi = row.padi_per_kapita;
      const valPekerja = row.penduduk_kerja_pertanian;
      const lisaKategori = row.lisa_uni;
      const lisaP = row.lisa_uni_p;

      const varPadi = meta.variabel.padi_per_kapita;
      const varKerja = meta.variabel.penduduk_kerja_pertanian;

      let klasterHtml = '';
      if (baseLayer === 'lisa' && lisaKategori) {
        const descText = LISA_DESC[lisaKategori] || '';
        const pValueHtml = lisaP != null ? '<div class="text-[10px] text-gray-400">p-value: ' + fmtP.format(lisaP) + '</div>' : '';
        
        klasterHtml = `
           <div class="mb-2 bg-gray-50 p-2 rounded border border-gray-100">
             <div class="font-semibold text-gray-800">Klaster: ${lisaKategori}</div>
             <div class="text-xs text-gray-600 mb-1">${descText}</div>
             ${pValueHtml}
           </div>
        `;
      }

      const stringPadi = valPadi != null 
        ? `${fmtDec.format(valPadi)} <span class="text-[10px] font-normal text-gray-500">${varPadi.satuan}</span>` 
        : 'Tidak tersedia';
        
      const stringKerja = valPekerja != null 
        ? `${fmt.format(valPekerja)} <span class="text-[10px] font-normal text-gray-500">${varKerja.satuan}</span>` 
        : 'Tidak tersedia';

      const tooltipHtml = `
        <div class="font-sans text-sm min-w-[220px]">
          <div class="font-bold border-b pb-1 mb-2">${nama} (${year})</div>
          
          ${klasterHtml}

          <div class="flex justify-between gap-4 mb-1">
            <span class="text-gray-600">${varPadi.nama}:</span>
            <span class="font-semibold">${stringPadi}</span>
          </div>
          <div class="flex justify-between gap-4">
            <span class="text-gray-600">${varKerja.nama}:</span>
            <span class="font-semibold">${stringKerja}</span>
          </div>
        </div>
      `;
      layer.setTooltipContent(tooltipHtml);
    });
  }, [year, baseLayer, selectedKabkota, ts, meta, getFeatureStyle]);

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
                 e.target.bringToFront();
               }
             });
          }}
        />
        {showSymbols && activeSymbols.map((item) => (
          <CircleMarker
            key={item.kode}
            center={[item.lat, item.lng]}
            radius={radiusScale(item.value)}
            pathOptions={{ fillColor: '#374151', fillOpacity: 0.65, color: '#ffffff', weight: 1.5 }}
            interactive={false}
          />
        ))}
      </MapContainer>
    </>
  );
}