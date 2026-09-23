import React, { useState } from 'react';
import { MadridPark } from '../types';
import { BestTimeAndEvolutionChart } from './BestTimeAndEvolutionChart';
import {
  Clock,
  TrendingDown,
  ShieldAlert,
  Sun,
  Moon,
  Sparkles,
  Zap,
  CheckCircle2,
  Calendar,
  AlertTriangle,
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

  // Window insights
  const morningGolden = hourlyData.find((h) => h.hour === '07:30') || {
    hour: '07:30',
    no2: 24,
    aqi: 32,
    temperature: 14,
    note: '🏆 Ventana Oro Mañana',
  };
  const eveningGolden = hourlyData.find((h) => h.hour === '20:30') || {
    hour: '20:30',
    no2: 22,
    aqi: 28,
    temperature: 17,
    note: '🏆 Ventana Oro Noche',
  };
  const morningPeak = hourlyData.find((h) => h.hour === '08:30') || {
    hour: '08:30',
    no2: 46,
    aqi: 65,
    temperature: 16,
    note: '🚗 Pico Tráfico Matinal',
  };
  const eveningPeak = hourlyData.find((h) => h.hour === '18:30') || {
    hour: '18:30',
    no2: 48,
    aqi: 68,
    temperature: 20,
    note: '🚗 Pico Tráfico Tarde',
  };

  const reductionPercent = Math.round(
    ((eveningPeak.no2 - eveningGolden.no2) / (eveningPeak.no2 || 1)) * 100
  );

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
                  INTELIGENCIA DEPORTIVA & CALIDAD DEL AIRE
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-['Montserrat',sans-serif]">
                Predicción Horaria & Ventanas Óptimas de Entrenamiento
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
                    {p.name} ({p.district})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Golden Window Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Window 1 */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                  🏆 Ventana Oro Noche (N.º 1)
                </span>
                <Moon className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black font-mono text-white">20:30 - 22:30 h</div>
              <p className="text-xs text-neutral-300 mt-1">
                La polución cae un <strong className="text-emerald-400">-{reductionPercent}%</strong>{' '}
                tras el pico del tráfico vespertino.
              </p>
              <div className="mt-2 text-[11px] font-mono text-emerald-300 font-bold">
                NO₂: ~{eveningGolden.no2} µg/m³ • {eveningGolden.temperature}°C
              </div>
            </div>

            {/* Window 2 */}
            <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-400">
                  🌅 Ventana Oro Mañana (N.º 2)
                </span>
                <Sun className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-black font-mono text-white">06:30 - 08:00 h</div>
              <p className="text-xs text-neutral-300 mt-1">
                Aire limpio nocturno antes de la apertura masiva de centros laborales.
              </p>
              <div className="mt-2 text-[11px] font-mono text-sky-300 font-bold">
                NO₂: ~{morningGolden.no2} µg/m³ • {morningGolden.temperature}°C
              </div>
            </div>

            {/* Peak 1 */}
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-400">
                  ⚠️ Pico Crítico Tarde (Evitar)
                </span>
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-2xl font-black font-mono text-white">18:30 - 20:00 h</div>
              <p className="text-xs text-neutral-300 mt-1">
                Colapso en salidas M-30 y arterias limítrofes con acumulación de NO₂.
              </p>
              <div className="mt-2 text-[11px] font-mono text-red-300 font-bold">
                Pico NO₂: ~{eveningPeak.no2} µg/m³
              </div>
            </div>

            {/* Peak 2 */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                  🚗 Pico Crítico Mañana (Evitar)
                </span>
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black font-mono text-white">08:15 - 09:45 h</div>
              <p className="text-xs text-neutral-300 mt-1">
                Hora punta laboral y escolar en Madrid con mayor emisión de partículas.
              </p>
              <div className="mt-2 text-[11px] font-mono text-amber-300 font-bold">
                Pico NO₂: ~{morningPeak.no2} µg/m³
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Chart Component */}
      <BestTimeAndEvolutionChart selectedPark={park} isHighContrast={isHighContrast} />

      {/* Hourly Breakdown Details Table */}
      <div
        className={`rounded-3xl p-5 sm:p-6 border transition-all ${
          isHighContrast
            ? 'bg-white border-black text-black shadow-lg'
            : 'bg-[#121212] border-neutral-850 text-white shadow-xl'
        }`}
      >
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#ff5500]" />
            <h3 className="text-lg font-black tracking-tight font-['Montserrat',sans-serif]">
              Desglose Horario Detallado en {park.name}
            </h3>
          </div>
          <span className="text-[11px] text-neutral-400 font-mono">
            Estación: {park.airQuality.stationName}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {hourlyData.map((slot) => {
            const isWindow = slot.isOptimalWindow;
            const isPeak = slot.note.includes('Pico');

            return (
              <div
                key={slot.hour}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isWindow
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                    : isPeak
                    ? 'bg-red-500/10 border-red-500/30 text-white'
                    : isHighContrast
                    ? 'bg-neutral-50 border-neutral-300 text-black'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-base font-extrabold text-white">
                    {slot.hour} h
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isWindow
                        ? 'bg-emerald-500 text-black'
                        : isPeak
                        ? 'bg-red-500 text-white'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {slot.note}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono mb-2">
                  <div>
                    <span className="text-[9px] text-neutral-400 block">NO₂</span>
                    <span
                      className={`font-bold ${
                        slot.no2 > 40
                          ? 'text-red-400'
                          : slot.no2 > 25
                          ? 'text-[#ff5500]'
                          : 'text-emerald-400'
                      }`}
                    >
                      {slot.no2} µg
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-neutral-400 block">ICA</span>
                    <span className="font-bold text-neutral-300">{slot.aqi}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-neutral-400 block">Temp</span>
                    <span className="font-bold text-sky-400">{slot.temperature}°C</span>
                  </div>
                </div>

                <div className="text-[11px] text-neutral-400">
                  {isWindow
                    ? '🟢 Franja recomendada: ventilación pulmonar limpia y menor estrés oxidativo.'
                    : isPeak
                    ? '🔴 Franja no aconsejada: alta densidad de partículas en suspensión.'
                    : '⚪ Condiciones intermedias aptas para trote suave o caminata.'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
