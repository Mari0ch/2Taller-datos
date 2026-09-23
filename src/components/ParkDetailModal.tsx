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
    park.weather.windSpeed,
    isAllergyMode
  );

  const handleExport = () => {
    if (!park.perimeterCoordinates) return;
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
                  {park.pollutionPeakReason || 'Esta estación registra picos de dióxido de nitrógeno por encima de los límites recomendados. No se aconseja actividad aeróbica intensa en este enclave.'}
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
                  {park.exerciseScore}/100
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

            <div className="flex flex-wrap items-center justify-between text-xs text-neutral-400 mb-4 gap-2">
              <div>
                Estación más próxima vinculada:{' '}
                <strong className="text-white">{park.airQuality.stationName}</strong>
              </div>
              {park.stationDistanceKm !== undefined && (
                <div className="text-[11px] font-mono text-[#ff5500] font-semibold bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                  📡 Distancia Haversine: {Math.round(park.stationDistanceKm * 1000)} m
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-black border border-neutral-800">
                <div className="text-[10px] text-neutral-400 uppercase font-semibold">Índice ICA</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">{park.airQuality.aqi}</div>
                <div className="text-[9px] text-[#ff5500] font-medium">{park.airQuality.levelLabel.split('/')[0]}</div>
              </div>

              <div className="p-3 rounded-xl bg-black border border-neutral-800">
                <div className="text-[10px] text-neutral-400 uppercase font-semibold">Dióxido NO₂</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">{park.airQuality.no2} <span className="text-xs text-neutral-500 font-normal">µg/m³</span></div>
                <div className="text-[9px] text-neutral-400 font-medium">Límite anual: 40</div>
              </div>

              <div className="p-3 rounded-xl bg-black border border-neutral-800">
                <div className="text-[10px] text-neutral-400 uppercase font-semibold">Partículas PM₁₀</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">{park.airQuality.pm10} <span className="text-xs text-neutral-500 font-normal">µg/m³</span></div>
                <div className="text-[9px] text-neutral-400 font-medium">Umbral OMS: 45</div>
              </div>

              <div className="p-3 rounded-xl bg-black border border-neutral-800">
                <div className="text-[10px] text-neutral-400 uppercase font-semibold">Partículas PM₂.₅</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">{park.airQuality.pm25} <span className="text-xs text-neutral-500 font-normal">µg/m³</span></div>
                <div className="text-[9px] text-neutral-400 font-medium">Finas respirables</div>
              </div>
            </div>
          </div>

          {/* Allergenic Flora & Pollen Section */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-fuchsia-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Biodiversidad Botánica & Exposición a Polen
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                park.pollenInfo.riskLevel === 'extreme' || park.pollenInfo.riskLevel === 'high'
                  ? 'bg-fuchsia-950 text-fuchsia-300 border-fuchsia-700'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-700'
              }`}>
                Riesgo {park.pollenInfo.riskLabel} ({park.pollenInfo.pollenScore}/100)
              </span>
            </div>

            <p className="text-xs text-neutral-400 mb-3">
              {park.pollenInfo.dispersionFactor}. {park.pollenInfo.allergyAdvice}
            </p>

            <div className="flex flex-wrap gap-2">
              {park.allergenicFlora.map((flora, i) => (
                <span key={i} className="text-xs bg-neutral-950 border border-neutral-800 text-neutral-300 px-3 py-1 rounded-lg">
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
              <div className="text-lg font-extrabold text-white font-mono">{park.weather.temperature}°C</div>
              <div className="text-[10px] text-neutral-500">Sensación: {park.weather.apparentTemperature}°C</div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mb-1">
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                <span>Humedad</span>
              </div>
              <div className="text-lg font-extrabold text-white font-mono">{park.weather.humidity}%</div>
              <div className="text-[10px] text-neutral-500">{park.weather.isRaining ? 'Lluvia activa' : 'Seco'}</div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mb-1">
                <Wind className="w-3.5 h-3.5 text-teal-400" />
                <span>Viento</span>
              </div>
              <div className="text-lg font-extrabold text-white font-mono">{park.weather.windSpeed} km/h</div>
              <div className="text-[10px] text-neutral-500">Dispersión moderada</div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mb-1">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Fuentes Agua</span>
              </div>
              <div className="text-lg font-extrabold text-white font-mono">{park.waterFountains}</div>
              <div className="text-[10px] text-neutral-500">Puntos potables</div>
            </div>
          </div>

          {/* Running Highlights */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Características del Trazado & Puntos de Interés
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {park.highlights.map((h, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-2.5 rounded-xl bg-neutral-900/50 border border-neutral-800/80 text-xs text-neutral-300"
                >
                  <span className="text-[#ff5500] font-bold">✓</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Outfit Recommendation for this specific park */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-[#ff5500]/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#ff5500]">
                Equipación Recomendada para {park.name} ({isRunning ? 'Correr' : 'Andar'})
              </span>
              <span className="text-xs font-mono font-bold text-white">
                {outfit.perceivedEffortTemp}°C sensación
              </span>
            </div>
            <p className="text-xs text-neutral-300 font-semibold mb-2">
              {outfit.summaryRule}
            </p>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {outfit.overallAdvice}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-[#111111]/95 backdrop-blur-md border-t border-neutral-800 px-6 py-4 flex flex-wrap items-center justify-between gap-3 z-10">
          <button
            type="button"
            onClick={handleExport}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              downloadSuccess
                ? 'bg-emerald-500 text-black'
                : 'bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700'
            }`}
          >
            {downloadSuccess ? (
              <>
                <CheckCircle className="w-4 h-4 text-black" />
                <span>¡GPX Descargado!</span>
              </>
            ) : (
              <>
                <Watch className="w-4 h-4 text-[#ff5500]" />
                <span>Descargar GPX ({park.perimeterKm} km)</span>
                <Download className="w-3.5 h-3.5 text-neutral-400" />
              </>
            )}
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectAsActive(park);
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-[#ff5500] hover:bg-[#ff6600] shadow-lg shadow-[#ff5500]/30 transition-all cursor-pointer font-['Montserrat',sans-serif]"
            >
              Fijar como Parque Activo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
