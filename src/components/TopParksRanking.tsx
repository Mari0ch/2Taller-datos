import React from 'react';
import { ActivityType, MadridPark } from '../types';
import { Award, Sparkles, Wind, Thermometer, ArrowRight, ShieldCheck } from 'lucide-react';

interface TopParksRankingProps {
  parks: MadridPark[];
  selectedPark: MadridPark | null;
  onSelectPark: (park: MadridPark) => void;
  onOpenDetails: (park: MadridPark) => void;
  activity: ActivityType;
}

export const TopParksRanking: React.FC<TopParksRankingProps> = ({
  parks,
  selectedPark,
  onSelectPark,
  onOpenDetails,
  activity,
}) => {
  // Sort parks by exercise score descending
  const sorted = [...parks].sort((a, b) => b.exerciseScore - a.exerciseScore);
  const topThree = sorted.slice(0, 3);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest text-[#ff5500] uppercase font-['Montserrat',sans-serif] flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#ff5500]" />
            PODIO DE SALUD URBANA EN MADRID
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Montserrat',sans-serif]">
            Top Parques con Aire Más Limpio & Mejor Aptitud
          </h2>
        </div>
        <p className="text-xs text-neutral-400">
          Actualizado cada 20 minutos según la red de sensores municipales
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topThree.map((park, index) => {
          const isSelected = selectedPark?.id === park.id;

          return (
            <div
              key={park.id}
              onClick={() => onSelectPark(park)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-neutral-900 border-[#ff5500] shadow-xl shadow-[#ff5500]/15'
                  : 'bg-neutral-950 hover:bg-neutral-900/90 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {/* Corner Medal Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{medals[index]}</span>
                <div className="flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{park.exerciseScore}/100</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  {park.district}
                </span>
                <h3 className="text-lg font-black text-white mt-0.5 mb-1 group-hover:text-[#ff5500] transition-colors">
                  {park.name}
                </h3>
                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mb-4">
                  {park.suitabilityReason}
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-850 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-white flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-[#ff5500]" />
                    {park.weather.temperature}°C
                  </span>
                  <span className="font-mono text-emerald-400 flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5" />
                    ICA {park.airQuality.aqi}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDetails(park);
                  }}
                  className="text-xs font-bold text-[#ff5500] hover:text-[#ff7722] flex items-center gap-1 cursor-pointer"
                >
                  <span>Ver Datos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
