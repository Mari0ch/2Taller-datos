import React from 'react';
import { MadridPark } from '../types';
import { Navigation, Trophy, ArrowRight, ShieldCheck, Check } from 'lucide-react';

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
        return distA - distB;
      })
      .slice(0, 3);
  } else {
    // Default top 3 healthiest overall (handle nullable score)
    top3 = [...candidates]
      .sort((a, b) => (b.exerciseScore ?? -1) - (a.exerciseScore ?? -1))
      .slice(0, 3);
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
                  ? 'border-neutral-200 bg-neutral-50 hover:border-black'
                  : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-extrabold text-[#ff5500] uppercase tracking-wider font-mono">
                    #{index + 1} RECOMENDADO
                  </span>
                  {park.userDistanceKm !== undefined && (
                    <span className="text-[11px] font-mono font-bold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/60">
                      A {park.userDistanceKm} km
                    </span>
                  )}
                </div>

                <h4 className="text-base font-bold text-white mb-1">{park.name}</h4>
                <p className="text-xs text-neutral-400 mb-3">{park.district}</p>

                {/* Score & Air Stats */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-black/60 border border-neutral-800/80 mb-3 text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase block">Aptitud</span>
                    <span className="font-extrabold text-emerald-400 font-mono text-sm">
                      {park.exerciseScore !== null ? `${park.exerciseScore}/100` : 'Sin datos'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase block">Índice EEA</span>
                    <span className="font-bold text-white font-mono text-sm">
                      {park.airQuality.aqi !== null ? park.airQuality.aqi : 'Sin datos'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {park.airQuality.levelLabel.split('/')[0]}
                </span>
                <span className="text-[#ff5500] font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                  Ver circuito <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
