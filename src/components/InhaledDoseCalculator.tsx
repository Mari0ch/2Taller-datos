import React, { useState } from 'react';
import { ActivityType, MadridPark } from '../types';
import { calculateInhaledDose, exportParkToGPX } from '../services/haversine';
import {
  Activity,
  Download,
  Wind,
  ShieldCheck,
  AlertTriangle,
  Watch,
  HeartPulse,
  Info,
  CheckCircle,
} from 'lucide-react';

interface InhaledDoseCalculatorProps {
  selectedPark: MadridPark | null;
  activity: ActivityType;
  isHighContrast?: boolean;
}

export const InhaledDoseCalculator: React.FC<InhaledDoseCalculatorProps> = ({
  selectedPark,
  activity,
  isHighContrast = false,
}) => {
  const [duration, setDuration] = useState<number>(60); // minutes
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!selectedPark) return null;

  const dose = calculateInhaledDose(
    activity,
    duration,
    selectedPark.airQuality.no2,
    selectedPark.airQuality.pm10
  );

  // Clean park comparison (e.g. Casa de Campo with ~14 ug/m3 NO2)
  const cleanParkDose = calculateInhaledDose(activity, duration, 14, 12);
  const reductionDose = Math.max(
    0,
    Math.round(
      ((dose.inhaledNo2Micrograms - cleanParkDose.inhaledNo2Micrograms) /
        (dose.inhaledNo2Micrograms || 1)) *
        100
    )
  );

  const handleExportGPX = () => {
    if (!selectedPark.perimeterCoordinates || selectedPark.perimeterCoordinates.length === 0) return;
    exportParkToGPX(
      selectedPark.name,
      selectedPark.perimeterKm,
      selectedPark.perimeterCoordinates
    );
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const isRunning = activity === 'running';

  return (
    <div
      className={`rounded-3xl p-5 sm:p-6 border transition-all ${
        isHighContrast
          ? 'bg-white border-black text-black shadow-lg'
          : 'bg-[#111111] border-neutral-850 shadow-2xl text-white'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#ff5500]/15 text-[#ff5500] border border-[#ff5500]/30">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ff5500] block font-['Montserrat',sans-serif]">
              FISIOLOGÍA DEPORTIVA & INTEGRACIÓN RELOJ
            </span>
            <h3 className="text-xl font-black tracking-tight font-['Montserrat',sans-serif]">
              Dosis de Contaminación Inhalada & Exportación GPX
            </h3>
          </div>
        </div>

        {/* GPX Export Button */}
        <button
          onClick={handleExportGPX}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer shadow-lg ${
            downloadSuccess
              ? 'bg-emerald-500 text-black shadow-emerald-500/30'
              : 'bg-[#ff5500] hover:bg-[#ff6600] text-black shadow-[#ff5500]/25'
          }`}
        >
          {downloadSuccess ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>¡GPX Descargado!</span>
            </>
          ) : (
            <>
              <Watch className="w-4 h-4" />
              <span>Exportar GPX (Reloj Deportivo)</span>
              <Download className="w-3.5 h-3.5 ml-0.5" />
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Duration Selector & Ventilation Rate */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">
              Duración Estimada del Entrenamiento:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 45, 60, 90].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setDuration(mins)}
                  className={`py-2 px-2 rounded-xl text-xs font-mono font-extrabold border transition-all cursor-pointer ${
                    duration === mins
                      ? 'bg-white text-black border-white shadow-md'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:border-neutral-700'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Minute Ventilation Explanation */}
          <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 space-y-2 text-xs">
            <div className="flex items-center justify-between text-neutral-400">
              <span>Tasa Ventilación (VE):</span>
              <span className="font-mono font-bold text-white">
                {isRunning ? '~65 Litros/min' : '~20 Litros/min'}
              </span>
            </div>
            <div className="flex items-center justify-between text-neutral-400">
              <span>Volumen de Aire Inhalado:</span>
              <span className="font-mono font-extrabold text-[#ff5500] text-sm">
                {dose.airVolumeM3} m³ ({Math.round(dose.airVolumeM3 * 1000)} Litros)
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed pt-1 border-t border-neutral-900">
              {isRunning
                ? 'Al correr a intensidad aeróbica, la respiración bucal y el volumen tidal se multiplican x3.25 respecto a caminar.'
                : 'Al caminar se mantiene la filtración nasal fisiológica natural, reteniendo gran parte de las partículas.'}
            </p>
          </div>
        </div>

        {/* Center Column: Inhaled Dose Results */}
        <div className="p-4 rounded-2xl bg-neutral-950/90 border border-neutral-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Estimación de Dosis Absorbida
              </span>
              <span
                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${dose.colorClass}`}
              >
                Dosis {dose.doseLevelLabel}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <div className="text-[10px] uppercase font-bold text-neutral-400">NO₂ Inhalado</div>
                <div className="text-2xl font-black font-mono text-white mt-1">
                  {dose.inhaledNo2Micrograms}{' '}
                  <span className="text-xs font-normal text-neutral-500">µg</span>
                </div>
                <div className="text-[9px] text-neutral-400 mt-0.5">Dióxido de nitrógeno</div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <div className="text-[10px] uppercase font-bold text-neutral-400">PM₁₀ Inhalado</div>
                <div className="text-2xl font-black font-mono text-white mt-1">
                  {dose.inhaledPm10Micrograms}{' '}
                  <span className="text-xs font-normal text-neutral-500">µg</span>
                </div>
                <div className="text-[9px] text-neutral-400 mt-0.5">Partículas en suspensión</div>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">{dose.physiologicalImpact}</p>
          </div>

          {/* Clean Park Comparison Pill */}
          {reductionDose > 20 && (
            <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
              <span className="font-bold text-emerald-400">💡 Alternativa:</span>
              <span>
                En Casa de Campo inhalarías un <strong>{reductionDose}% menos</strong> de tóxicos ({cleanParkDose.inhaledNo2Micrograms} µg de NO₂).
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Watch Snyc & Circuit Details */}
        <div className="p-4 rounded-2xl bg-neutral-950/90 border border-neutral-800 space-y-3">
          <div className="flex items-center gap-2">
            <Watch className="w-4 h-4 text-[#ff5500]" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Sincronización con Reloj
            </span>
          </div>

          <div className="text-xs text-neutral-300 space-y-2">
            <div className="flex justify-between py-1 border-b border-neutral-900">
              <span className="text-neutral-500">Circuito:</span>
              <span className="font-semibold text-white">{selectedPark.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-900">
              <span className="text-neutral-500">Distancia por vuelta:</span>
              <span className="font-mono font-bold text-white">{selectedPark.perimeterKm} km</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-900">
              <span className="text-neutral-500">Superficie:</span>
              <span className="font-semibold text-white">{selectedPark.circuitType}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-900">
              <span className="text-neutral-500">Fuentes de agua:</span>
              <span className="font-mono font-bold text-emerald-400">{selectedPark.waterFountains} puntos</span>
            </div>
          </div>

          <p className="text-[11px] text-neutral-400 leading-snug">
            El archivo GPX descargado incluye el perímetro y waypoints de hidratación compatibles con
            <strong> Garmin Connect, Apple Fitness / WorkOutDoors, Strava y Coros</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
