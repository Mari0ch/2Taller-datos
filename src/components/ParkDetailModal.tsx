import React, { useState } from 'react';
import { ActivityType, MadridPark } from '../types';
import { calculateOutfit } from '../services/outfitAdvisor';
import { exportParkToGPX } from '../services/haversine';
import {
  X,
  MapPin,
  Activity,
  Wind,
  Droplets,
  Thermometer,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Footprints,
  Sparkles,
  Ban,
  Watch,
  Download,
  HelpCircle,
  Shield,
} from 'lucide-react';

interface ParkDetailModalProps {
  park: MadridPark | null;
  activity: ActivityType;
  isAllergyMode: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSelectAsActive: (park: MadridPark) => void;
}

export const ParkDetailModal: React.FC<ParkDetailModalProps> = ({
  park,
  activity,
  isAllergyMode,
  isOpen,
  onClose,
  onSelectAsActive,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen || !park) return null;

  const isRunning = activity === 'running';
  const outfit = calculateOutfit(
    activity,
    park.weather.temperature,
    park.weather.isRaining,
    park.weather.windSpeed ?? 10,
    isAllergyMode
  );

  const hasRealGeometry = Boolean(
    park.hasRealGeometry &&
      park.perimeterCoordinates &&
      park.perimeterCoordinates.length >= 3
  );

  const handleExport = () => {
    if (!hasRealGeometry || !park.perimeterCoordinates) return;
    exportParkToGPX(park.name, park.perimeterKm, park.perimeterCoordinates);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111111] border border-neutral-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-white relative">
        {/* Header Bar */}
        <div className="sticky top-0 bg-[#111111]/95 backdrop-blur-md border-b border-neutral-800 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ff5500] bg-[#ff5500]/10 border border-[#ff5500]/30 px-2 py-0.5 rounded">
              FICHA TÉCNICA OFICIAL
            </span>
            <span className="text-xs text-neutral-400">{park.district}</span>
            {park.isSimulation && (
              <span className="text-[9px] font-black uppercase tracking-wider bg-[#ff5500] text-black px-2 py-0.5 rounded font-mono">
                SIMULACIÓN
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* High Pollution Alert Banner if applicable */}
          {park.isHighPollutionZone && (
            <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/50 flex items-start gap-3">
              <Ban className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-400 block">
                  🔴 Zona de Alerta por Contaminación Elevada
                </span>
                <p className="text-xs text-neutral-300 mt-1">
                  {park.pollutionPeakReason ||
                    'Esta estación registra picos de contaminantes por encima de los límites de la EEA. No se aconseja actividad aeróbica intensa en este enclave.'}
                </p>
              </div>
            </div>
          )}

          {/* Main Title & Fitness Score */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
            <div>
              <h2 className="text-2xl font-black tracking-tight font-['Montserrat',sans-serif]">
                {park.name}
              </h2>
              <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-[#ff5500]" />
                Distrito de {park.district} • {park.areaHa} ha • {park.perimeterKm} km perimetrales
              </p>
            </div>

            <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 p-3 rounded-2xl shrink-0">
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-neutral-400">
                  Aptitud Deportiva
                </div>
                <div className="text-xl font-extrabold text-[#ff5500] font-mono">
                  {park.exerciseScore !== null ? `${park.exerciseScore}/100` : 'Sin datos'}
                </div>
              </div>
              <div className="h-8 w-px bg-neutral-800" />
              <div className="text-xs font-bold text-neutral-300">
                {park.exerciseRecommendation}
              </div>
            </div>
          </div>

          {/* Ayto. Madrid Air Quality Station Block */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#ff5500]" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Red de Vigilancia de Calidad del Aire (Ayto. de Madrid)
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">
                Estación: {park.stationCode}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-neutral-400 mb-3 gap-2">
              <div>
                Estación vinculada: <strong className="text-white">{park.airQuality.stationName}</strong>
              </div>
              {park.stationDistanceKm !== undefined && (
                <div className="text-[11px] font-mono text-[#ff5500] font-semibold bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                  📡 Distancia Haversine: {Math.round(park.stationDistanceKm * 1000)} m
                </div>
              )}
            </div>

            {/* Fallback station annotation if a pollutant wasn't measured directly */}
            {park.airQuality.isEstimatedFallback && park.airQuality.fallbackStationName && (
              <div className="mb-3 p-2 rounded-xl bg-sky-950/40 border border-sky-500/30 text-[11px] text-sky-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>
                  Complementado con estación más cercana: <strong>{park.airQuality.fallbackStationName}</strong>
                </span>
              </div>
            )}

            <div className="text-[11px] text-neutral-500 mb-3 font-mono">
              Última medición oficial: {park.airQuality.lastUpdated}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-black border border-neutral-800">
                <div className="text-[10px] text-neutral-400 uppercase font-semibold">Índice EEA</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">
                  {park.airQuality.aqi !== null ? park.airQuality.aqi : 'Sin datos'}
                </div>
                <div className="text-[9px] text-[#ff5500] font-medium">
                  {park.airQuality.levelLabel.split('/')[0]}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black border border-neutral-800">
                <div className="text-[10px] text-neutral-400 uppercase font-semibold">Dióxido NO₂</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">
                  {park.airQuality.no2 !== null ? park.airQuality.no2 : 'Sin datos'}{' '}
                  <span className="text-xs text-neutral-500 font-normal">µg/m³</span>
                </div>
                <div className="text-[9px] text-neutral-400 font-medium">EEA: 0-40 Buena</div>
              </div>

              <div className="p-3 rounded-xl bg-black border border-neutral-800">
                <div className="text-[10px] text-neutral-400 uppercase font-semibold">Partículas PM₁₀</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">
                  {park.airQuality.pm10 !== null ? park.airQuality.pm10 : 'Sin datos'}{' '}
                  <span className="text-xs text-neutral-500 font-normal">µg/m³</span>
                </div>
                <div className="text-[9px] text-neutral-400 font-medium">EEA: 0-20 Buena</div>
              </div>

              <div className="p-3 rounded-xl bg-black border border-neutral-800">
                <div className="text-[10px] text-neutral-400 uppercase font-semibold">Partículas PM₂.₅</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">
                  {park.airQuality.pm25 !== null ? park.airQuality.pm25 : 'Sin datos'}{' '}
                  <span className="text-xs text-neutral-500 font-normal">µg/m³</span>
                </div>
                <div className="text-[9px] text-neutral-400 font-medium">EEA: 0-10 Buena</div>
              </div>
            </div>
          </div>

          {/* Allergenic Flora & Pollen Section (Botanical phenology estimation) */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-fuchsia-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Exposición a Polen & Fenología Botánica
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  park.pollenInfo.riskLevel === 'extreme' || park.pollenInfo.riskLevel === 'high'
                    ? 'bg-fuchsia-950 text-fuchsia-300 border-fuchsia-700'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                }`}
              >
                Riesgo {park.pollenInfo.riskLabel} ({park.pollenInfo.pollenScore}/100)
              </span>
            </div>

            <p className="text-[11px] text-amber-400/90 mb-2 font-mono">
              ℹ️ Estimación botánica estacional basada en el calendario polínico oficial de Madrid (no medición directa).
            </p>

            <p className="text-xs text-neutral-400 mb-3">
              {park.pollenInfo.dispersionFactor}. {park.pollenInfo.allergyAdvice}
            </p>

            <div className="flex flex-wrap gap-2">
              {park.allergenicFlora.map((flora, i) => (
                <span
                  key={i}
                  className="text-xs bg-neutral-950 border border-neutral-800 text-neutral-300 px-3 py-1 rounded-lg"
                >
                  🌿 {flora}
                </span>
              ))}
            </div>
          </div>

          {/* Meteorological Data */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mb-1">
                <Thermometer className="w-3.5 h-3.5 text-[#ff5500]" />
                <span>Temperatura</span>
              </div>
              <div className="text-lg font-extrabold text-white font-mono">
                {park.weather.temperature !== null ? `${park.weather.temperature}°C` : 'Sin datos'}
              </div>
              <div className="text-[10px] text-neutral-500">
                Sensación:{' '}
                {park.weather.apparentTemperature !== null
                  ? `${park.weather.apparentTemperature}°C`
                  : 'Sin datos'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mb-1">
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                <span>Humedad</span>
              </div>
              <div className="text-lg font-extrabold text-white font-mono">
                {park.weather.humidity !== null ? `${park.weather.humidity}%` : 'Sin datos'}
              </div>
              <div className="text-[10px] text-neutral-500">
                {park.weather.isRaining ? 'Lluvia activa' : 'Seco'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mb-1">
                <Wind className="w-3.5 h-3.5 text-teal-400" />
                <span>Viento</span>
              </div>
              <div className="text-lg font-extrabold text-white font-mono">
                {park.weather.windSpeed !== null ? `${park.weather.windSpeed} km/h` : 'Sin datos'}
              </div>
              <div className="text-[10px] text-neutral-500">
                {park.weather.stationName || 'Estación cercana'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mb-1">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Superficie</span>
              </div>
              <div className="text-sm font-bold text-white mt-1">{park.circuitType}</div>
              <div className="text-[10px] text-neutral-500">{park.waterFountains} fuentes mapeadas</div>
            </div>
          </div>

          {/* Highlights & Municipal Info */}
          <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">
              Destacados Deportivos & Entorno
            </span>
            <ul className="space-y-1.5 text-xs text-neutral-300">
              {park.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#ff5500] font-bold">•</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* GPX Export & Select as Active */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleExport}
              disabled={!hasRealGeometry}
              title={
                !hasRealGeometry
                  ? 'No hay geometría perimetral real en OpenStreetMap para este parque'
                  : 'Descargar archivo GPX con el trazado real del parque'
              }
              className={`w-full sm:w-auto flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                !hasRealGeometry
                  ? 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                  : downloadSuccess
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/25 cursor-pointer'
                  : 'bg-neutral-900 hover:bg-neutral-850 text-white border border-neutral-700 cursor-pointer'
              }`}
            >
              <Download className="w-4 h-4 text-[#ff5500]" />
              <span>
                {!hasRealGeometry
                  ? 'Sin trazado OSM (GPX deshabilitado)'
                  : downloadSuccess
                  ? '¡GPX Descargado!'
                  : 'Exportar Trazado GPX Real (Garmin/Apple)'}
              </span>
            </button>

            <button
              onClick={() => {
                onSelectAsActive(park);
                onClose();
              }}
              className="w-full sm:w-auto py-3 px-6 rounded-xl font-black text-xs bg-[#ff5500] hover:bg-[#ff6600] text-black shadow-lg shadow-[#ff5500]/25 transition-all cursor-pointer"
            >
              Seleccionar como Parque Activo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
