import React, { useState } from 'react';
import { MadridPark } from '../types';
import { SimulationParams, getNextUpdateInfo } from '../services/airQualityService';
import { exportParkToGPX } from '../services/haversine';
import {
  Download,
  Sun,
  Moon,
  SlidersHorizontal,
  Clock,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface ExportAndSettingsTabProps {
  parks: MadridPark[];
  selectedPark: MadridPark | null;
  onSelectPark: (park: MadridPark) => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  simParams: SimulationParams;
  onUpdateSimParams: (params: SimulationParams) => void;
  onResetSimParams: () => void;
  onRefreshData: () => void;
}

export const ExportAndSettingsTab: React.FC<ExportAndSettingsTabProps> = ({
  parks,
  selectedPark,
  onSelectPark,
  isHighContrast,
  onToggleHighContrast,
  simParams,
  onUpdateSimParams,
  onResetSimParams,
  onRefreshData,
}) => {
  const [downloadSuccessPark, setDownloadSuccessPark] = useState<string | null>(null);
  const currentPark = selectedPark || parks[0];

  const updateInfo = getNextUpdateInfo();
  const minutesRemaining = Math.floor(updateInfo.secondsRemaining / 60);
  const secondsRemaining = updateInfo.secondsRemaining % 60;
  const timeString = `${minutesRemaining}m ${secondsRemaining.toString().padStart(2, '0')}s`;

  const isSimulating =
    simParams.overrideTemp !== null && simParams.overrideTemp !== undefined ||
    simParams.overrideRain !== null && simParams.overrideRain !== undefined ||
    simParams.overrideAqi !== null && simParams.overrideAqi !== undefined ||
    simParams.overridePollen !== null && simParams.overridePollen !== undefined;

  const hasRealGeometry = Boolean(
    currentPark &&
      currentPark.hasRealGeometry &&
      currentPark.perimeterCoordinates &&
      currentPark.perimeterCoordinates.length >= 3
  );

  const handleExportGPX = (park: MadridPark) => {
    if (!park.hasRealGeometry || !park.perimeterCoordinates || park.perimeterCoordinates.length < 3) return;
    exportParkToGPX(park.name, park.perimeterKm, park.perimeterCoordinates);
    setDownloadSuccessPark(park.id);
    setTimeout(() => setDownloadSuccessPark(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border transition-all ${
          isHighContrast
            ? 'bg-white border-black text-black shadow-xl'
            : 'bg-[#121212] border-neutral-850 text-white shadow-2xl'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#ff5500] font-['Montserrat',sans-serif]">
              CENTRO DE AJUSTES & EXPORTACIÓN GPX
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-['Montserrat',sans-serif] mt-1">
              Configuración & Trazados Oficiales OpenStreetMap
            </h2>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
              Descarga trazados de circuitos saludables en formato GPX para Garmin, Apple Watch y Strava (con polígonos reales obtenidos de OpenStreetMap), activa el modo de alto contraste para luz solar directa y gestiona simulaciones ambientales.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Core Setting Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. GPX Export Card */}
        <div
          className={`rounded-3xl p-6 border transition-all flex flex-col justify-between ${
            isHighContrast
              ? 'bg-white border-black text-black shadow-lg'
              : 'bg-[#141414] border-neutral-800 text-white shadow-xl'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#ff5500]/15 text-[#ff5500] border border-[#ff5500]/30">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#ff5500]">
                    COMPATIBILIDAD CON WEARABLES
                  </span>
                  <h3 className="text-lg font-black font-['Montserrat',sans-serif]">
                    Exportación GPX (Rutas Reales)
                  </h3>
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
              Descarga el trazado perimetral georreferenciado para cargarlo directamente en tu reloj Garmin, Coros, Apple Watch o Strava.
            </p>

            {/* Park Selector for Export */}
            <div className="mb-4">
              <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                Selecciona el parque a exportar:
              </label>
              <select
                value={currentPark.id}
                onChange={(e) => {
                  const p = parks.find((item) => item.id === e.target.value);
                  if (p) onSelectPark(p);
                }}
                className={`w-full rounded-xl px-3 py-2.5 text-xs font-bold border transition-colors cursor-pointer ${
                  isHighContrast
                    ? 'bg-neutral-100 border-black text-black'
                    : 'bg-neutral-900 border-neutral-700 text-white focus:border-[#ff5500]'
                }`}
              >
                {parks.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.perimeterKm} km)
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Park Summary Card */}
            <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 mb-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Circuito:</span>
                <span className="font-bold text-white">{currentPark.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Perímetro por vuelta:</span>
                <span className="font-mono font-bold text-[#ff5500]">
                  {currentPark.perimeterKm} km
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Geometría OpenStreetMap:</span>
                <span
                  className={`font-mono font-bold ${
                    hasRealGeometry ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {hasRealGeometry ? '✓ Polígono real OSM verificado' : '⚠️ No disponible'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Fuentes potables mapeadas:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {currentPark.waterFountains} fuentes
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleExportGPX(currentPark)}
            disabled={!hasRealGeometry}
            className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
              !hasRealGeometry
                ? 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                : downloadSuccessPark === currentPark.id
                ? 'bg-emerald-500 text-black shadow-emerald-500/25 cursor-pointer'
                : 'bg-[#ff5500] hover:bg-[#ff6600] text-black shadow-[#ff5500]/25 cursor-pointer'
            }`}
          >
            {!hasRealGeometry ? (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Sin trazado OSM real (GPX deshabilitado)</span>
              </>
            ) : downloadSuccessPark === currentPark.id ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>¡Archivo GPX Descargado con Éxito!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Descargar Trazado GPX de {currentPark.name}</span>
              </>
            )}
          </button>
        </div>

        {/* 2. High Contrast Outdoor Mode Toggle */}
        <div
          className={`rounded-3xl p-6 border transition-all flex flex-col justify-between ${
            isHighContrast
              ? 'bg-white border-black text-black shadow-lg'
              : 'bg-[#141414] border-neutral-800 text-white shadow-xl'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl border ${
                    isHighContrast
                      ? 'bg-black text-white border-black'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}
                >
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                    ACCESIBILIDAD AL AIRE LIBRE
                  </span>
                  <h3 className="text-lg font-black font-['Montserrat',sans-serif]">
                    Modo Alto Contraste (Luz Solar Directa)
                  </h3>
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
              Diseñado específicamente para corredores y caminantes que utilizan la aplicación a plena luz del día en Madrid. Cambia el fondo a blanco absoluto, aumenta los contrastes tipográficos y adapta la cartografía del mapa para evitar reflejos solares.
            </p>

            <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-300 font-bold">Estado actual:</span>
                <span
                  className={`text-xs font-mono font-extrabold px-2.5 py-1 rounded-full ${
                    isHighContrast
                      ? 'bg-black text-white'
                      : 'bg-neutral-800 text-neutral-300'
                  }`}
                >
                  {isHighContrast ? '☀️ MODO ALTO CONTRASTE ACTIVO' : '🌙 MODO OSCURO DEPORTIVO'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                {isHighContrast
                  ? 'Fondo blanco puro, bordes oscuros de alto contraste y azulejos abiertos de OpenStreetMap.'
                  : 'Fondo negro mate con detalles naranja deportivo y mapa CartoDB Dark Matter (100% abierto, sin API Key).'}
              </p>
            </div>
          </div>

          <button
            onClick={onToggleHighContrast}
            className={`w-full py-3 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
              isHighContrast
                ? 'bg-black hover:bg-neutral-900 text-white shadow-black/25'
                : 'bg-amber-400 hover:bg-amber-500 text-black shadow-amber-400/25'
            }`}
          >
            {isHighContrast ? (
              <>
                <Moon className="w-4 h-4" />
                <span>Cambiar a Modo Oscuro Deportivo</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4" />
                <span>Activar Modo Alto Contraste (Luz Solar)</span>
              </>
            )}
          </button>
        </div>

        {/* 3. Weather & Air Pollution Simulator */}
        <div
          className={`rounded-3xl p-6 border transition-all ${
            isHighContrast
              ? 'bg-white border-black text-black shadow-lg'
              : 'bg-[#141414] border-neutral-800 text-white shadow-xl'
          }`}
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">
                  LABORATORIO AMBIENTAL
                </span>
                <h3 className="text-lg font-black font-['Montserrat',sans-serif]">
                  Simulador de Condiciones Climáticas
                </h3>
              </div>
            </div>

            {isSimulating && (
              <button
                onClick={onResetSimParams}
                className="text-[11px] font-bold text-[#ff5500] hover:underline cursor-pointer"
              >
                Resetear
              </button>
            )}
          </div>

          <p className="text-xs text-neutral-400 mb-4">
            Simula escenarios meteorológicos extremos para comprobar cómo responde el recomendador de ropa (+10°C) y el semáforo de aptitud de cada parque. Los datos simulados quedan siempre identificados con la etiqueta "SIMULACIÓN".
          </p>

          <div className="space-y-4 text-xs">
            {/* Temperature override */}
            <div>
              <div className="flex justify-between text-neutral-300 font-bold mb-1">
                <span>Temperatura ambiente:</span>
                <span className="font-mono text-[#ff5500]">
                  {simParams.overrideTemp !== null && simParams.overrideTemp !== undefined
                    ? `${simParams.overrideTemp} °C (Simulado)`
                    : 'Tiempo Real'}
                </span>
              </div>
              <div className="flex gap-2">
                {[-2, 8, 16, 26, 38].map((temp) => (
                  <button
                    key={temp}
                    onClick={() =>
                      onUpdateSimParams({
                        ...simParams,
                        overrideTemp: simParams.overrideTemp === temp ? null : temp,
                      })
                    }
                    className={`flex-1 py-1.5 rounded-lg font-mono font-bold border transition-all cursor-pointer ${
                      simParams.overrideTemp === temp
                        ? 'bg-white text-black border-white'
                        : 'bg-neutral-900 text-neutral-300 border-neutral-800'
                    }`}
                  >
                    {temp}°C
                  </button>
                ))}
              </div>
            </div>

            {/* Rain override */}
            <div>
              <div className="flex justify-between text-neutral-300 font-bold mb-1">
                <span>Precipitación / Lluvia:</span>
                <span className="font-mono text-sky-400">
                  {simParams.overrideRain !== null && simParams.overrideRain !== undefined
                    ? simParams.overrideRain
                      ? 'Lluvia Forzada'
                      : 'Seco Forzado'
                    : 'Tiempo Real'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    onUpdateSimParams({
                      ...simParams,
                      overrideRain: simParams.overrideRain === true ? null : true,
                    })
                  }
                  className={`py-2 rounded-lg font-bold border transition-all cursor-pointer ${
                    simParams.overrideRain === true
                      ? 'bg-sky-500 text-black border-sky-500'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800'
                  }`}
                >
                  🌧️ Activar Lluvia
                </button>
                <button
                  onClick={() =>
                    onUpdateSimParams({
                      ...simParams,
                      overrideRain: simParams.overrideRain === false ? null : false,
                    })
                  }
                  className={`py-2 rounded-lg font-bold border transition-all cursor-pointer ${
                    simParams.overrideRain === false
                      ? 'bg-amber-500 text-black border-amber-500'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800'
                  }`}
                >
                  ☀️ Desactivar Lluvia
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Municipal Open Data Status & Synchronizer */}
        <div
          className={`rounded-3xl p-6 border transition-all flex flex-col justify-between ${
            isHighContrast
              ? 'bg-white border-black text-black shadow-lg'
              : 'bg-[#141414] border-neutral-800 text-white shadow-xl'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                    RED MUNICIPAL MADRID
                  </span>
                  <h3 className="text-lg font-black font-['Montserrat',sans-serif]">
                    Sincronización & Fuentes Abiertas
                  </h3>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 mb-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Portal oficial:</span>
                <a
                  href="https://datos.madrid.es"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#ff5500] hover:underline"
                >
                  datos.madrid.es
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Ciclo de refresco oficial:</span>
                <span className="font-mono font-bold text-white">Cada 20 min (:15, :35, :55)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Próxima lectura telemétrica:</span>
                <span className="font-mono font-bold text-[#ff5500]">{timeString}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Cálculo de distancias:</span>
                <span className="font-mono font-bold text-sky-400">Fórmula Haversine real</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 mb-4 space-y-2 text-[11px]">
              <div className="font-bold text-neutral-300 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                <span>APIs consumidas por el servidor proxy:</span>
              </div>
              <ul className="space-y-1.5 pl-3 list-disc text-neutral-400">
                <li>
                  <a
                    href="https://datos.madrid.es/dataset/200761-0-parques-jardines"
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-300 hover:text-[#ff5500] hover:underline font-mono"
                  >
                    Dataset 200761: Parques y Jardines
                  </a>
                </li>
                <li>
                  <a
                    href="https://datos.madrid.es/dataset/212531-0-calidad-aire-tiempo-real"
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-300 hover:text-[#ff5500] hover:underline font-mono"
                  >
                    Dataset 212531: Calidad del aire tiempo real
                  </a>
                </li>
                <li>
                  <a
                    href="https://datos.madrid.es/dataset/300754-0-meteorologia-tiempo-real-acumula"
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-300 hover:text-[#ff5500] hover:underline font-mono"
                  >
                    Dataset 300754: Meteorología tiempo real
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={onRefreshData}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 bg-[#ff5500] hover:bg-[#ff6600] text-black shadow-md cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Forzar Actualización de Estaciones Municipales</span>
          </button>
        </div>
      </div>
    </div>
  );
};
