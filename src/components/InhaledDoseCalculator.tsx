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

  const hasRealGeometry = Boolean(
    selectedPark.hasRealGeometry &&
      selectedPark.perimeterCoordinates &&
      selectedPark.perimeterCoordinates.length >= 3
  );

  const handleExportGPX = () => {
    if (!hasRealGeometry || !selectedPark.perimeterCoordinates) return;
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
              FISIOLOGÍA RESPIRATORIA & TRAZADOS GPX
            </span>
            <h3 className="text-xl font-black tracking-tight font-['Montserrat',sans-serif]">
              Dosis de Contaminación Inhalada & Exportación GPX
            </h3>
          </div>
        </div>

        {/* GPX Export Button */}
        <button
          onClick={handleExportGPX}
          disabled={!hasRealGeometry}
          title={
            !hasRealGeometry
              ? 'No hay geometría real de OpenStreetMap disponible para este parque'
              : 'Exportar trazado GPX real para reloj deportivo'
          }
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all shadow-lg ${
            !hasRealGeometry
              ? 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
              : downloadSuccess
              ? 'bg-emerald-500 text-black shadow-emerald-500/30 cursor-pointer'
              : 'bg-[#ff5500] hover:bg-[#ff6600] text-black shadow-[#ff5500]/25 cursor-pointer'
          }`}
        >
          {downloadSuccess ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>¡GPX Descargado!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>
                {!hasRealGeometry
                  ? 'Sin trazado OSM (GPX no disponible)'
                  : `Exportar GPX de ${selectedPark.name}`}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Main Grid: Controls & Calculations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Duration Slider & Ventilation Rate */}
        <div className="lg:col-span-4 p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-4 text-xs">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-neutral-400 font-bold">Duración de la sesión:</span>
              <span className="font-mono font-extrabold text-[#ff5500] text-sm">
                {duration} minutos ({Math.floor(duration / 60)}h {duration % 60}m)
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="180"
              step="5"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full accent-[#ff5500] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-500 mt-1 font-mono">
              <span>15 min</span>
              <span>60 min</span>
              <span>120 min</span>
              <span>180 min</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Modalidad:</span>
              <span className="font-bold text-white uppercase text-[11px]">
                {isRunning ? '🏃 Carrera Continua' : '🚶 Caminata Activa'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Volumen Ventilación:</span>
              <span className="font-mono font-bold text-sky-400">
                {dose.ventilationLitersPerMin} L/min ({isRunning ? '45 L/min' : '18 L/min'})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Volumen de Aire Inhalado:</span>
              <span className="font-mono font-bold text-white">
                {(dose.totalInhaledAirCubicMeters * 1000).toLocaleString()} Litros ({dose.totalInhaledAirCubicMeters} m³)
              </span>
            </div>
          </div>

          <div className="text-[11px] text-neutral-400 leading-relaxed">
            ℹ️ Al correr, la frecuencia cardíaca y el volumen corriente aumentan la ventilación pulmonar de ~8 L/min en reposo a <strong>45-60 L/min</strong>, multiplicando por 5 la dosis absorbida de contaminantes gaseosos y partículas.
          </div>
        </div>

        {/* Right: Calculated Inhaled Micrograms */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card NO2 Inhaled */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                  Dióxido de Nitrógeno (NO₂)
                </span>
                <span className="text-[10px] font-mono text-[#ff5500] font-bold">
                  {selectedPark.airQuality.no2 !== null ? `${selectedPark.airQuality.no2} µg/m³` : 'Sin datos'}
                </span>
              </div>

              <div className="text-3xl font-black text-white font-mono mt-1 mb-1">
                {dose.inhaledNo2Micrograms !== null ? `${dose.inhaledNo2Micrograms} ` : 'N/D '}
                <span className="text-sm font-normal text-neutral-400">µg inhalados</span>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">
                Masa acumulada de NO₂ depositada en el epitelio respiratorio durante los {duration} minutos en {selectedPark.name}.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-800/80 text-[11px] text-neutral-400 flex items-center justify-between">
              <span>{selectedPark.airQuality.stationName}</span>
              <span className="font-bold text-neutral-300">
                {selectedPark.airQuality.no2 !== null && selectedPark.airQuality.no2 <= 40 ? '✓ Bajo Límite EEA' : '⚠️ Atención'}
              </span>
            </div>
          </div>

          {/* Card PM10 Inhaled */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                  Partículas en Suspensión (PM₁₀)
                </span>
                <span className="text-[10px] font-mono text-orange-400 font-bold">
                  {selectedPark.airQuality.pm10 !== null ? `${selectedPark.airQuality.pm10} µg/m³` : 'Sin datos'}
                </span>
              </div>

              <div className="text-3xl font-black text-white font-mono mt-1 mb-1">
                {dose.inhaledPm10Micrograms !== null ? `${dose.inhaledPm10Micrograms} ` : 'N/D '}
                <span className="text-sm font-normal text-neutral-400">µg inhalados</span>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">
                Partículas inhalables de menos de 10 micras que alcanzan los bronquios principales y los alvéolos.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-800/80 text-[11px] text-neutral-400 flex items-center justify-between">
              <span>Fórmula: Dosis = Concentración × V × t</span>
              <span className="font-bold text-emerald-400">Modelo Fisiológico</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
