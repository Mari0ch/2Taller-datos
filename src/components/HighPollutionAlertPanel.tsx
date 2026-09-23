import React from 'react';
import { MadridPark } from '../types';
import { AlertOctagon, ArrowRight, Ban, AlertTriangle } from 'lucide-react';

interface HighPollutionAlertPanelProps {
  parks: MadridPark[];
  onSelectPark: (park: MadridPark) => void;
  onOpenDetails: (park: MadridPark) => void;
}

export const HighPollutionAlertPanel: React.FC<HighPollutionAlertPanelProps> = ({
  parks,
  onSelectPark,
  onOpenDetails,
}) => {
  // Find the high pollution parks
  const highPollutionParks = parks.filter((p) => p.isHighPollutionZone).slice(0, 3);

  // Find a clean recommended alternative
  const safeAlternatives = [...parks]
    .filter((p) => !p.isHighPollutionZone && p.exerciseScore !== null && p.exerciseScore >= 75)
    .sort((a, b) => (a.airQuality.aqi ?? 999) - (b.airQuality.aqi ?? 999));
  const bestAlternative = safeAlternatives[0];

  if (highPollutionParks.length === 0) return null;

  return (
    <div className="rounded-3xl bg-neutral-950 border-2 border-red-500/50 p-5 sm:p-7 shadow-2xl relative overflow-hidden">
      {/* Background Alert Glow */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-red-600/10 blur-3xl pointer-events-none rounded-full" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-red-500/20">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-2xl bg-red-500/20 text-red-500 border border-red-500/40 shrink-0 animate-pulse">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-red-400 bg-red-950/80 border border-red-800/80 px-2.5 py-0.5 rounded">
                ALERTA OFICIAL • ZONAS A EVITAR
              </span>
              <span className="text-xs text-neutral-400">Picos de Contaminación en Tiempo Real</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 font-['Montserrat',sans-serif]">
              Estaciones y Parques No Recomendados para Actividad Física Intensa
            </h3>
            <p className="text-xs text-neutral-300 mt-1 max-w-3xl leading-relaxed">
              La red municipal de sensores registra picos de dióxido de nitrógeno (NO₂) o partículas en suspensión en las siguientes zonas. Al correr o caminar a ritmo activo, la ventilación pulmonar se multiplica, incrementando la dosis alveolar absorbida.
            </p>
          </div>
        </div>

        {/* Clean Alternative Shortcut */}
        {bestAlternative && (
          <div className="bg-emerald-950/60 border border-emerald-500/40 p-3.5 rounded-2xl shrink-0 self-start md:self-auto max-w-xs">
            <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block">
              ✓ Alternativa Limpia Sugerida
            </span>
            <div className="text-sm font-bold text-white mt-0.5">
              {bestAlternative.name}
            </div>
            <div className="text-[11px] text-emerald-300 font-mono mt-0.5">
              ICA {bestAlternative.airQuality.aqi ?? 'N/D'} • NO₂ {bestAlternative.airQuality.no2 ?? 'N/D'} µg/m³
            </div>
            <button
              onClick={() => onSelectPark(bestAlternative)}
              className="mt-2 text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 px-3 py-1.5 rounded-lg w-full transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Ir a este parque</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Grid of Worst Parks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        {highPollutionParks.map((park, idx) => (
          <div
            key={park.id}
            onClick={() => onSelectPark(park)}
            className="p-4 rounded-2xl bg-neutral-900/90 border border-red-500/30 hover:border-red-500 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-red-400 bg-red-950/60 border border-red-800/60 px-2 py-0.5 rounded flex items-center gap-1">
                  <Ban className="w-3 h-3 text-red-400" />
                  <span>ALTA POLUCIÓN #{idx + 1}</span>
                </span>
                <span className="text-xs text-neutral-400 font-medium">{park.district}</span>
              </div>

              <h4 className="text-base font-bold text-white group-hover:text-red-400 transition-colors">
                {park.name}
              </h4>
              <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">
                {park.airQuality.stationName}
              </p>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 rounded-xl bg-black/60 border border-neutral-800">
                <div>
                  <span className="text-[9px] uppercase font-bold text-neutral-400 block">Dióxido NO₂</span>
                  <span className="text-sm font-black text-red-400 font-mono">
                    {park.airQuality.no2 !== null ? `${park.airQuality.no2} ` : 'N/D '}
                    <span className="text-[10px] text-neutral-500">µg/m³</span>
                  </span>
                  <span className="text-[9px] text-red-400/80 block">Límite EEA: 40</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-neutral-400 block">Partículas PM₁₀</span>
                  <span className="text-sm font-black text-orange-400 font-mono">
                    {park.airQuality.pm10 !== null ? `${park.airQuality.pm10} ` : 'N/D '}
                    <span className="text-[10px] text-neutral-500">µg/m³</span>
                  </span>
                  <span className="text-[9px] text-neutral-400 block">
                    Índice: {park.airQuality.aqi ?? 'N/D'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
              <span className="text-red-400 font-bold text-[11px] flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                Desaconsejado
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetails(park);
                }}
                className="text-[11px] font-semibold text-neutral-300 hover:text-white underline cursor-pointer"
              >
                Ver Estación
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
