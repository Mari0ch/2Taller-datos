import React from 'react';
import { MadridPark } from '../types';
import { Navigation, Sparkles, Wind, Trophy, ArrowRight, ShieldCheck, Check } from 'lucide-react';

interface NearbyCleanestParksProps {
  parks: MadridPark[];
  userLocation: { lat: number; lng: number } | null;
  onRequestLocation: () => void;
  isLocating: boolean;
  onSelectPark: (park: MadridPark) => void;
  selectedPark: MadridPark | null;
  isHighContrast?: boolean;
}

export const NearbyCleanestParks: React.FC<NearbyCleanestParksProps> = ({
  parks,
  userLocation,
  onRequestLocation,
  isLocating,
  onSelectPark,
  selectedPark,
  isHighContrast = false,
}) => {
  // Sort parks by a combination of closeness & air cleanliness
  const candidates = [...parks].filter((p) => !p.isHighPollutionZone);

  // If user location is known, sort by distance; take 3 closest with good/moderate air
  let top3 = candidates;
  if (userLocation) {
    top3 = candidates
      .sort((a, b) => {
        const distA = a.userDistanceKm ?? 99;
        const distB = b.userDistanceKm ?? 99;
        // Prioritize parks within 5km that have exercise score >= 70
        return distA - distB;
      })
      .slice(0, 3);
  } else {
    // Default top 3 healthiest overall
    top3 = [...candidates].sort((a, b) => b.exerciseScore - a.exerciseScore).slice(0, 3);
  }

  return (
    <div
      className={`rounded-3xl p-5 sm:p-6 border transition-all ${
        isHighContrast
          ? 'bg-white border-black text-black shadow-lg'
          : 'bg-[#141414] border-neutral-800 text-white shadow-xl'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Trophy className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 font-['Montserrat',sans-serif]">
                RADAR GEOLOCALIZADO (RADIO 3 - 5 KM)
              </span>
              {userLocation && (
                <span className="text-[9px] bg-sky-500 text-black font-extrabold px-2 py-0.5 rounded-full font-mono">
                  GPS ACTIVO
                </span>
              )}
            </div>
            <h3 className="text-lg font-black tracking-tight font-['Montserrat',sans-serif]">
              {userLocation
                ? 'Los 3 Parques Más Limpios Cerca de Ti'
                : 'Top 3 Parques Recomendados con Aire Más Puro'}
            </h3>
          </div>
        </div>

        <button
          onClick={onRequestLocation}
          disabled={isLocating}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-md self-start sm:self-auto ${
            isLocating
              ? 'bg-neutral-800 text-neutral-400'
              : 'bg-[#ff5500] hover:bg-[#ff6600] text-black shadow-[#ff5500]/25'
          }`}
        >
          <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Obteniendo GPS...' : '📍 Usar Mi Ubicación'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {top3.map((park, index) => {
          const isSelected = selectedPark?.id === park.id;

          return (
            <div
              key={park.id}
              onClick={() => onSelectPark(park)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'border-[#ff5500] bg-[#ff5500]/10 shadow-lg shadow-[#ff5500]/10'
                  : isHighContrast
                  ? 'bg-neutral-50 border-neutral-300 hover:border-black'
                  : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#ff5500] bg-[#ff5500]/15 px-2 py-0.5 rounded border border-[#ff5500]/30 font-mono">
                    #{index + 1} RECOMENDADO
                  </span>
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-black">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{park.exerciseScore}/100</span>
                  </div>
                </div>

                <h4 className="text-base font-bold text-white mb-1 group-hover:text-[#ff5500]">
                  {park.name}
                </h4>
                <p className="text-xs text-neutral-400 mb-3">{park.district}</p>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="p-2 rounded-xl bg-black/60 border border-neutral-800">
                    <span className="text-[9px] text-neutral-400 uppercase font-bold block">
                      Calidad Aire
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      ICA {park.airQuality.aqi} • {park.airQuality.no2} µg NO₂
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-black/60 border border-neutral-800">
                    <span className="text-[9px] text-neutral-400 uppercase font-bold block">
                      Distancia GPS
                    </span>
                    <span className="font-mono font-bold text-sky-400">
                      {park.userDistanceKm !== undefined
                        ? `${park.userDistanceKm} km`
                        : 'Calcular GPS'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-xs">
                <span className="text-[11px] text-neutral-400">
                  Circuito: <strong className="text-white">{park.perimeterKm} km</strong>
                </span>
                <span className="flex items-center gap-1 font-bold text-[#ff5500] text-xs">
                  {isSelected ? 'Seleccionado' : 'Ver en mapa'}
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
