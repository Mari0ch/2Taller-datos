import React from 'react';
import { ActivityType, MadridPark } from '../types';
import {
  Compass,
  Droplets,
  Footprints,
  Info,
  MapPin,
  ShieldAlert,
  Thermometer,
  Wind,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Ban,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

interface ParkCardProps {
  park: MadridPark;
  isSelected: boolean;
  activity: ActivityType;
  isAllergyMode: boolean;
  onSelect: (park: MadridPark) => void;
  onOpenDetails: (park: MadridPark) => void;
}

export const ParkCard: React.FC<ParkCardProps> = ({
  park,
  isSelected,
  activity,
  isAllergyMode,
  onSelect,
  onOpenDetails,
}) => {
  // Aptitud badge color & icon
  let scoreBadgeColor = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  let scoreBarColor = 'bg-emerald-500';
  let RecommendationIcon = CheckCircle;

  if (park.exerciseScore === null) {
    scoreBadgeColor = 'bg-neutral-800 text-neutral-400 border-neutral-700';
    scoreBarColor = 'bg-neutral-700';
    RecommendationIcon = HelpCircle;
  } else if (park.isHighPollutionZone || park.exerciseScore < 50) {
    scoreBadgeColor = 'bg-red-500/15 text-red-400 border-red-500/30';
    scoreBarColor = 'bg-red-500';
    RecommendationIcon = XCircle;
  } else if (park.exerciseScore < 75) {
    scoreBadgeColor = 'bg-[#ff5500]/15 text-[#ff5500] border-[#ff5500]/30';
    scoreBarColor = 'bg-[#ff5500]';
    RecommendationIcon = AlertTriangle;
  }

  // ICA color
  let aqiBadgeColor = 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
  if (park.airQuality.level === 'no_data') {
    aqiBadgeColor = 'bg-neutral-900 text-neutral-400 border-neutral-800';
  } else if (
    park.airQuality.level === 'poor' ||
    park.airQuality.level === 'very_poor' ||
    park.airQuality.level === 'extremely_poor' ||
    park.airQuality.level === 'unfavorable'
  ) {
    aqiBadgeColor = 'bg-red-950/60 text-red-300 border-red-800/60';
  } else if (park.airQuality.level === 'moderate') {
    aqiBadgeColor = 'bg-orange-950/60 text-[#ff8800] border-orange-800/60';
  }

  return (
    <div
      onClick={() => onSelect(park)}
      className={`group rounded-2xl p-5 transition-all cursor-pointer border flex flex-col justify-between relative overflow-hidden ${
        park.isHighPollutionZone
          ? isSelected
            ? 'bg-neutral-900 border-red-500 shadow-xl ring-2 ring-red-500'
            : 'bg-[#150d0d] hover:bg-[#1a0f0f] border-red-500/50 shadow-lg'
          : isSelected
          ? 'bg-neutral-900 border-[#ff5500] shadow-xl shadow-[#ff5500]/10 ring-1 ring-[#ff5500]'
          : 'bg-[#111111] hover:bg-[#161616] border-neutral-800/80 hover:border-neutral-700 shadow-lg'
      }`}
    >
      {/* High Pollution Warning Strip */}
      {park.isHighPollutionZone && (
        <div className="absolute top-0 left-0 right-0 bg-red-600/90 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Ban className="w-3 h-3" /> ZONA A EVITAR (PICO DE POLUCIÓN)
          </span>
          <span className="font-mono">
            {park.airQuality.no2 !== null ? `NO₂ ${park.airQuality.no2} µg/m³` : 'Alerta sensor'}
          </span>
        </div>
      )}

      {/* Simulation Badge if active */}
      {park.isSimulation && !park.isHighPollutionZone && (
        <div className="absolute top-0 right-0 bg-[#ff5500] text-black text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-bl-lg font-mono">
          SIMULACIÓN
        </div>
      )}

      {/* Top Header */}
      <div className={park.isHighPollutionZone ? 'mt-4' : ''}>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div>
            <div className="flex items-center flex-wrap gap-1.5 text-xs text-neutral-400 mb-1">
              <MapPin className="w-3.5 h-3.5 text-[#ff5500]" />
              <span className="font-semibold text-neutral-300">{park.district}</span>
              <span className="text-neutral-600">•</span>
              <span className="text-[11px] text-neutral-500">{park.perimeterKm} km perim.</span>
              {park.userDistanceKm !== undefined && (
                <>
                  <span className="text-neutral-600">•</span>
                  <span className="text-[11px] text-sky-400 font-bold font-mono">
                    A {park.userDistanceKm} km
                  </span>
                </>
              )}
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-[#ff5500] transition-colors leading-snug">
              {park.name}
            </h3>
          </div>

          {/* Fitness Score Badge */}
          <div className="flex flex-col items-end shrink-0">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${scoreBadgeColor}`}
            >
              <RecommendationIcon className="w-3.5 h-3.5" />
              <span>{park.exerciseScore !== null ? `${park.exerciseScore}/100` : 'Sin datos'}</span>
            </div>
            <span className="text-[10px] text-neutral-400 font-medium mt-1 uppercase tracking-wider">
              {park.isHighPollutionZone ? 'No recomendado' : park.exerciseRecommendation}
            </span>
          </div>
        </div>

        {/* Aptitud Score Progress Bar */}
        <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full rounded-full transition-all duration-500 ${scoreBarColor}`}
            style={{ width: `${park.exerciseScore !== null ? park.exerciseScore : 0}%` }}
          />
        </div>

        {/* Air Quality & Weather Row */}
        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-neutral-950/70 border border-neutral-850 mb-3.5">
          {/* Air Quality */}
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-0.5">
              Calidad Aire (EEA)
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-extrabold text-white font-mono">
                {park.airQuality.aqi !== null ? park.airQuality.aqi : 'Sin datos'}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${aqiBadgeColor}`}>
                {park.airQuality.levelLabel.split('/')[0]}
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
              <span>
                NO₂:{' '}
                {park.airQuality.no2 !== null ? (
                  <strong className={park.airQuality.no2 > 45 ? 'text-red-400' : 'text-neutral-200'}>
                    {park.airQuality.no2} µg/m³
                  </strong>
                ) : (
                  <span className="text-neutral-500">Sin datos</span>
                )}
              </span>
            </div>
          </div>

          {/* Weather */}
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-0.5">
              Clima Actual
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-extrabold text-white font-mono">
                {park.weather.temperature !== null ? `${park.weather.temperature}°C` : 'Sin datos'}
              </span>
              <span className="text-[10px] text-neutral-400">
                {park.weather.isRaining ? '🌧️ Lluvia' : '☀️ Seco'}
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
              <span>
                Viento:{' '}
                {park.weather.windSpeed !== null ? (
                  <strong>{park.weather.windSpeed} km/h</strong>
                ) : (
                  <span className="text-neutral-500">Sin datos</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Allergy Mode Active Banner in Card */}
        {isAllergyMode && (
          <div className="mb-3 p-2.5 rounded-xl bg-fuchsia-950/40 border border-fuchsia-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
              <span className="text-[11px] text-neutral-200">
                Polen ({park.pollenInfo.dominantSpecies[0] || 'Flora'}):
              </span>
            </div>
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                park.pollenInfo.riskLevel === 'extreme' || park.pollenInfo.riskLevel === 'high'
                  ? 'bg-fuchsia-900/60 text-fuchsia-300 border-fuchsia-600'
                  : 'bg-neutral-800 text-neutral-300 border-neutral-700'
              }`}
            >
              Riesgo {park.pollenInfo.riskLabel}
            </span>
          </div>
        )}

        {/* Reason snippet */}
        <p className="text-xs text-neutral-400 mb-3 line-clamp-2 leading-relaxed">
          {park.suitabilityReason}
        </p>

        {/* Surface & Fountains badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="text-[10px] bg-neutral-900 text-neutral-300 border border-neutral-800 px-2 py-0.5 rounded-md font-medium">
            🏃 {park.circuitType}
          </span>
          <span className="text-[10px] bg-neutral-900 text-neutral-300 border border-neutral-800 px-2 py-0.5 rounded-md font-medium">
            💧 {park.waterFountains} fuentes
          </span>
          <span className="text-[10px] bg-neutral-900 text-neutral-300 border border-neutral-800 px-2 py-0.5 rounded-md font-medium">
            ⛰️ {park.difficulty}
          </span>
          {park.stationDistanceKm !== undefined && (
            <span className="text-[10px] bg-neutral-900 text-neutral-400 border border-neutral-800 px-2 py-0.5 rounded-md font-mono">
              📡 A {Math.round(park.stationDistanceKm * 1000)}m estación
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(park);
          }}
          className="text-xs text-neutral-300 hover:text-white font-semibold flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Info className="w-3.5 h-3.5 text-[#ff5500]" />
          <span>Ficha Técnica</span>
        </button>

        <button
          type="button"
          onClick={() => onSelect(park)}
          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            isSelected
              ? 'bg-[#ff5500] text-black shadow-md shadow-[#ff5500]/30 font-extrabold'
              : 'bg-neutral-800 text-white hover:bg-neutral-700'
          }`}
        >
          {isSelected ? 'Parque Activo' : 'Ver Equipación'}
        </button>
      </div>
    </div>
  );
};
