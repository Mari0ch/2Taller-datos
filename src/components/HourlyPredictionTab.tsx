import React from 'react';
import { MadridPark } from '../types';
import { BestTimeAndEvolutionChart } from './BestTimeAndEvolutionChart';
import {
  Clock,
  TrendingDown,
  ShieldAlert,
  Sparkles,
  Zap,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface HourlyPredictionTabProps {
  selectedPark: MadridPark | null;
  parks: MadridPark[];
  onSelectPark: (park: MadridPark) => void;
  isHighContrast?: boolean;
}

export const HourlyPredictionTab: React.FC<HourlyPredictionTabProps> = ({
  selectedPark,
  parks,
  onSelectPark,
  isHighContrast = false,
}) => {
  const park = selectedPark || parks[0];
  const hourlyData = park?.hourlyEvolution || [];

  // Filter valid data points
  const validPoints = hourlyData.filter(
    (d): d is typeof d & { no2: number } => d.no2 !== null && typeof d.no2 === 'number'
  );

  const bestHour = [...validPoints].sort((a, b) => a.no2 - b.no2)[0] || null;
  const worstHour = [...validPoints].sort((a, b) => b.no2 - a.no2)[0] || null;

  const reductionPercent =
    worstHour && bestHour && worstHour.no2 > 0
      ? Math.round(((worstHour.no2 - bestHour.no2) / worstHour.no2) * 100)
      : null;

  return (
    <div className="space-y-6">
      {/* Top Banner: Best Time To Train Summary */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border transition-all relative overflow-hidden ${
          isHighContrast
            ? 'bg-white border-black text-black shadow-xl'
            : 'bg-gradient-to-br from-[#121212] via-neutral-950 to-emerald-950/40 border-neutral-800 text-white shadow-2xl'
        }`}
      >
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <Sparkles className="w-4 h-4" />
                </span>
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 font-['Montserrat',sans-serif]">
                  TELEMETRÍA REAL POR HORAS
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-['Montserrat',sans-serif]">
                Evolución Horaria & Ventanas Óptimas de Entrenamiento
              </h2>
            </div>

            {/* Park Selector */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-neutral-400">Analizando:</label>
              <select
                value={park?.id}
                onChange={(e) => {
                  const found = parks.find((p) => p.id === e.target.value);
                  if (found) onSelectPark(found);
                }}
                className={`text-xs font-bold rounded-xl px-3 py-2 border cursor-pointer ${
                  isHighContrast
                    ? 'bg-neutral-100 border-black text-black'
                    : 'bg-neutral-900 border-neutral-700 text-white'
                }`}
              >
                {parks.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cards for Optimal & Critical Windows */}
          {bestHour && worstHour ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Best Window Card */}
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded">
                    HORA MÁS LIMPIA REGISTRADA
                  </span>
                  <span className="text-xs font-mono font-bold text-white">{bestHour.hour} h</span>
                </div>
                <div className="text-2xl font-black text-white font-mono mb-1">
                  {bestHour.no2} µg/m³
                </div>
                <p className="text-xs text-emerald-200/90 leading-relaxed">
                  Mínima concentración de NO₂ del día registrada en la estación. Ideal para carrera o caminata.
                </p>
              </div>

              {/* Peak Window Card */}
              <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-red-400 bg-red-900/60 px-2 py-0.5 rounded">
                    PICO MÁXIMO DE POLUCIÓN
                  </span>
                  <span className="text-xs font-mono font-bold text-white">{worstHour.hour} h</span>
                </div>
                <div className="text-2xl font-black text-white font-mono mb-1">
                  {worstHour.no2} µg/m³
                </div>
                <p className="text-xs text-red-200/90 leading-relaxed">
                  Pico de emisiones por tráfico vehicular. Se aconseja no realizar entrenamientos intensos en esta franja.
                </p>
              </div>

              {/* Inhaled Reduction Stat */}
              <div className="p-4 rounded-2xl bg-sky-950/60 border border-sky-500/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-sky-400 text-xs font-bold mb-1">
                    <TrendingDown className="w-4 h-4" />
                    <span>Beneficio Pulmonar</span>
                  </div>
                  <div className="text-3xl font-black text-white font-mono">
                    -{reductionPercent ?? 0}%
                  </div>
                  <p className="text-xs text-sky-200/90 mt-1 leading-relaxed">
                    Menor dosis de dióxido de nitrógeno inhalado entrenando a las {bestHour.hour} h en comparación con las {worstHour.hour} h.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center gap-3">
              <Info className="w-5 h-5 text-neutral-400 shrink-0" />
              <p className="text-xs text-neutral-300">
                Las estaciones automáticas del Ayuntamiento de Madrid están acumulando registros para la jornada de hoy. A medida que se validen marcas H01..H24 se generará el comparativo horaria automáticamente.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive Chart */}
      <BestTimeAndEvolutionChart selectedPark={park} isHighContrast={isHighContrast} />
    </div>
  );
};
