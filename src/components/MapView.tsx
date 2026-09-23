import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ActivityType, MadridPark } from '../types';
import { MapPin, Navigation, Compass, Sparkles, Ban } from 'lucide-react';

interface MapViewProps {
  parks: MadridPark[];
  selectedPark: MadridPark | null;
  onSelectPark: (park: MadridPark) => void;
  activity: ActivityType;
  isAllergyMode: boolean;
  userLocation: { lat: number; lng: number } | null;
  onRequestLocation: () => void;
  isLocating?: boolean;
  isHighContrast?: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  parks,
  selectedPark,
  onSelectPark,
  activity,
  isAllergyMode,
  userLocation,
  onRequestLocation,
  isLocating = false,
  isHighContrast = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | L.Circle | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [40.418, -3.695],
      zoom: 12,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: true,
    });

    // CartoDB Dark Matter for sporty dark mode and OpenStreetMap for light/high contrast
    // Completely open and free: zero API keys required
    const tileUrl = isHighContrast
      ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    const tileLayer = L.tileLayer(tileUrl, {
      attribution: isHighContrast
        ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: isHighContrast ? 'abc' : 'abcd',
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer if High Contrast mode toggles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !tileLayerRef.current) return;

    map.removeLayer(tileLayerRef.current);
    // CartoDB Dark Matter for dark mode and OpenStreetMap for light / solar contrast (100% free, no API keys)
    const tileUrl = isHighContrast
      ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    const newLayer = L.tileLayer(tileUrl, {
      attribution: isHighContrast
        ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: isHighContrast ? 'abc' : 'abcd',
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, [isHighContrast]);

  // Update User Location Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userLocation) {
      const userHtml = `
        <div style="
          position: relative;
          width: 22px;
          height: 22px;
          border-radius: 9999px;
          background: #38bdf8;
          border: 3px solid #ffffff;
          box-shadow: 0 0 15px #38bdf8, 0 0 30px rgba(56, 189, 248, 0.6);
          animation: pulse 1.8s infinite;
        ">
          <div style="
            position: absolute;
            top: -24px;
            left: 50%;
            transform: translateX(-50%);
            white-space: nowrap;
            background: #0284c7;
            color: #ffffff;
            font-size: 10px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.4);
          ">TÚ ESTÁS AQUÍ</div>
        </div>
      `;

      const userIcon = L.divIcon({
        className: 'custom-user-pin',
        html: userHtml,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 1000,
      }).addTo(map);

      userMarker.bindPopup(
        `<div style="font-size: 12px; font-weight: bold; color: #0284c7; padding: 4px;">
          📍 Tu posición actual (Madrid)
        </div>`
      );

      userMarkerRef.current = userMarker;

      map.flyTo([userLocation.lat, userLocation.lng], 13, {
        duration: 1.5,
      });
    }
  }, [userLocation]);

  // Update Markers when parks, selectedPark, activity, or allergyMode change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    parks.forEach((park) => {
      const isSelected = selectedPark?.id === park.id;

      // 3 clear mandatory states:
      // 1. 🟢 Apto / Aire Limpio
      // 2. 🟠 Moderado / Precaución Alergias
      // 3. 🔴 ZONA A EVITAR (Pico de contaminación)
      let colorClass = '#10b981'; // Green (Apto / Aire Limpio)
      let glowClass = 'rgba(16, 185, 129, 0.4)';
      let statusLabel = '🟢 Apto / Aire Limpio';
      let isWarning = false;

      if (park.isHighPollutionZone || park.exerciseScore < 45 || park.airQuality.level === 'unfavorable') {
        colorClass = '#ef4444'; // Red (ZONA A EVITAR)
        glowClass = 'rgba(239, 68, 68, 0.6)';
        statusLabel = '🔴 ZONA A EVITAR';
        isWarning = true;
      } else if (
        park.airQuality.level === 'moderate' ||
        park.exerciseScore < 75 ||
        (isAllergyMode && (park.pollenInfo.riskLevel === 'high' || park.pollenInfo.riskLevel === 'extreme'))
      ) {
        colorClass = '#ff5500'; // Orange (Moderado / Precaución Alergias)
        glowClass = 'rgba(255, 85, 0, 0.4)';
        statusLabel =
          isAllergyMode && park.pollenInfo.riskLevel !== 'low'
            ? '🟠 Precaución Polen'
            : '🟠 Moderado';
      }

      const iconHtml = `
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${isSelected ? '46px' : '36px'};
          height: ${isSelected ? '46px' : '36px'};
          border-radius: 9999px;
          background: ${isHighContrast ? '#ffffff' : '#0f0f0f'};
          border: ${isSelected ? '3px solid #ff5500' : `2px solid ${colorClass}`};
          box-shadow: 0 0 18px ${glowClass}, 0 4px 6px -1px rgba(0, 0, 0, 0.5);
          cursor: pointer;
          transition: transform 0.2s ease;
        ">
          ${
            isWarning
              ? `
            <div style="
              position: absolute;
              top: -6px;
              right: -6px;
              background: #ef4444;
              color: white;
              font-size: 9px;
              font-weight: 900;
              width: 16px;
              height: 16px;
              border-radius: 9999px;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 1px solid white;
            ">!</div>
          `
              : ''
          }
          <div style="
            width: 10px;
            height: 10px;
            border-radius: 9999px;
            background: ${colorClass};
          "></div>
          <div style="
            position: absolute;
            bottom: -20px;
            white-space: nowrap;
            background: ${isHighContrast ? 'rgba(255, 255, 255, 0.95)' : 'rgba(17, 17, 17, 0.95)'};
            color: ${isHighContrast ? '#000000' : '#ffffff'};
            font-size: 10px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 4px;
            border: 1px solid ${isHighContrast ? '#000000' : '#333333'};
            pointer-events: none;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">
            ${park.name.replace('Parque ', '').replace(' de la Alameda de Osuna', '')}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-park-pin',
        html: iconHtml,
        iconSize: isSelected ? [46, 46] : [36, 36],
        iconAnchor: isSelected ? [23, 23] : [18, 18],
      });

      const marker = L.marker([park.lat, park.lng], { icon: customIcon }).addTo(map);

      // Popup Content with Haversine distance
      const distanceNotice =
        park.userDistanceKm !== undefined
          ? `<div style="font-size: 11px; font-weight: bold; color: #38bdf8; margin-bottom: 6px;">
               📍 A ${park.userDistanceKm} km de tu ubicación (Fórmula Haversine)
             </div>`
          : '';

      const stationNotice =
        park.stationDistanceKm !== undefined
          ? `<div style="font-size: 10px; color: #888; margin-bottom: 6px;">
               📡 A ${Math.round(park.stationDistanceKm * 1000)} m de ${park.airQuality.stationName}
             </div>`
          : '';

      const popupContent = document.createElement('div');
      popupContent.className = 'park-popup-content font-sans text-xs p-1 min-w-[230px]';
      popupContent.innerHTML = `
        <div style="margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #ff5500; font-weight: 800; text-transform: uppercase; font-size: 9px; letter-spacing: 0.05em;">
              ${park.district}
            </span>
            <span style="font-size: 9px; font-weight: 800; color: ${colorClass}; background: rgba(0,0,0,0.6); padding: 2px 5px; border-radius: 4px; border: 1px solid ${colorClass};">
              ${statusLabel}
            </span>
          </div>
          <h4 style="font-size: 14px; font-weight: 800; color: #ffffff; margin-top: 3px;">
            ${park.name}
          </h4>
          ${distanceNotice}
        </div>

        <div style="background: #181818; padding: 8px; border-radius: 8px; border: 1px solid #333; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="color: #999;">Aptitud Deporte:</span>
            <span style="color: ${colorClass}; font-weight: 800;">${park.exerciseScore}/100</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="color: #999;">Índice Aire (ICA):</span>
            <span style="font-weight: 700; color: #fff;">${park.airQuality.aqi} (NO₂: ${park.airQuality.no2} µg/m³)</span>
          </div>
          ${
            isAllergyMode
              ? `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; padding-top: 4px; border-top: 1px dashed #333;">
              <span style="color: #d946ef;">Polen (${park.pollenInfo.dominantSpecies[0]}):</span>
              <span style="font-weight: 700; color: #d946ef;">Riesgo ${park.pollenInfo.riskLabel}</span>
            </div>
          `
              : ''
          }
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #999;">Clima:</span>
            <span style="font-weight: 700; color: #fff;">${park.weather.temperature}°C ${park.weather.isRaining ? '🌧️ Lluvia' : '☀️'}</span>
          </div>
        </div>

        ${stationNotice}

        ${
          park.isHighPollutionZone
            ? `
          <div style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.5); padding: 6px; border-radius: 6px; margin-bottom: 8px; font-size: 10px; color: #fca5a5;">
            ⚠️ Pico de contaminación detectado. Se aconseja no realizar entrenamientos intensos aquí.
          </div>
        `
            : ''
        }

        <button 
          id="btn-select-${park.id}"
          style="
            width: 100%;
            background: #ff5500;
            color: #000000;
            font-weight: 800;
            font-size: 11px;
            padding: 7px 10px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.03em;
          "
        >
          Ver Ficha, Dosis & Equipación
        </button>
      `;

      marker.bindPopup(popupContent, {
        className: 'dark-leaflet-popup',
        offset: [0, -10],
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-select-${park.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectPark(park);
            marker.closePopup();
          };
        }
      });

      marker.on('click', () => {
        onSelectPark(park);
      });

      markersRef.current[park.id] = marker;
    });
  }, [parks, selectedPark, onSelectPark, activity, isAllergyMode, isHighContrast]);

  // Center on selected park if set
  useEffect(() => {
    if (!selectedPark || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([selectedPark.lat, selectedPark.lng], 14, {
      duration: 1.2,
    });
    const marker = markersRef.current[selectedPark.id];
    if (marker) {
      marker.openPopup();
    }
  }, [selectedPark]);

  return (
    <div
      className={`relative w-full h-[420px] sm:h-[480px] lg:h-[520px] rounded-3xl overflow-hidden border shadow-2xl transition-all ${
        isHighContrast ? 'border-black bg-white' : 'border-neutral-800 bg-neutral-950'
      }`}
    >
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Geolocation Button - Top Left */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={onRequestLocation}
          disabled={isLocating}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-black/90 hover:bg-black text-white border border-[#ff5500] hover:border-[#ff6600] shadow-xl text-xs font-bold transition-all cursor-pointer backdrop-blur-md"
        >
          <Navigation
            className={`w-4 h-4 text-[#ff5500] ${isLocating ? 'animate-spin' : ''}`}
          />
          <span>{isLocating ? 'Obteniendo GPS...' : 'Usar mi ubicación (Radio 3 km)'}</span>
        </button>
      </div>

      {/* Map Legend Overlay with the 3 mandatory states - Top Right */}
      <div className="absolute top-4 right-4 z-20 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-2xl p-3.5 text-xs shadow-xl pointer-events-auto max-w-[220px]">
        <span className="font-extrabold text-[10px] tracking-wider text-neutral-400 uppercase block mb-2 font-['Montserrat',sans-serif]">
          Semáforo de Parques de Madrid
        </span>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
            <span className="text-white text-[11px] font-bold">🟢 Apto / Aire Limpio</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5500] shadow-sm shadow-[#ff5500]/50"></span>
            <span className="text-white text-[11px] font-bold">
              {isAllergyMode ? '🟠 Precaución Polen' : '🟠 Moderado / Precaución'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50 animate-pulse"></span>
            <span className="text-white text-[11px] font-bold">🔴 ZONA A EVITAR (Pico)</span>
          </div>
        </div>
      </div>

      {/* Floating Instructions - Bottom Left */}
      <div className="absolute bottom-4 left-4 z-20 bg-neutral-950/85 backdrop-blur-md border border-neutral-800 px-3.5 py-2 rounded-xl text-[11px] text-neutral-300 pointer-events-none hidden sm:flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#ff5500] animate-pulse"></span>
        <span>Haz clic en cualquier parque para ver distancia Haversine, ICA y dosis inhalada</span>
      </div>
    </div>
  );
};
