import React, { useEffect, useState } from 'react';
import { Activity, Clock, RefreshCw, SlidersHorizontal, Sun, Moon, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { getNextUpdateInfo, getDataSourceStatus } from '../services/airQualityService';
import { DataSourceStatus } from '../types';

interface NavbarProps {
  onOpenSimulation: () => void;
  onRefresh: () => void;
  isSimulating: boolean;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  dataSourceStatus?: DataSourceStatus;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSimulation,
  onRefresh,
  isSimulating,
  isHighContrast,
  onToggleHighContrast,
  dataSourceStatus,
}) => {
  const [updateInfo, setUpdateInfo] = useState(getNextUpdateInfo());
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setUpdateInfo(getNextUpdateInfo());
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutesRemaining = Math.floor(updateInfo.secondsRemaining / 60);
  const secondsRemaining = updateInfo.secondsRemaining % 60;
  const timeString = `${minutesRemaining}m ${secondsRemaining.toString().padStart(2, '0')}s`;

  const status = dataSourceStatus || getDataSourceStatus();

  // Calculate elapsed time from last update
  let elapsedMinutes = 0;
  if (status.lastFetchedAt) {
    const fetchedTime = new Date(status.lastFetchedAt).getTime();
    elapsedMinutes = Math.max(0, Math.floor((now - fetchedTime) / 60000));
  }

  // Determine status label according to Phase 1 requirement 6:
  // "En directo (actualizado hace X min)", "Datos de hace X min (fuente no disponible)" o "Sin datos"
  let statusText = 'Sin datos';
  let statusBadgeClass = 'bg-neutral-800 text-neutral-400 border-neutral-700';
  let StatusIcon = WifiOff;
  let pulseDotColor = 'bg-neutral-500';

  if (isSimulating) {
    statusText = 'SIMULACIÓN (Test sintético)';
    statusBadgeClass = 'bg-amber-950/80 text-amber-300 border-amber-500/50';
    StatusIcon = AlertTriangle;
    pulseDotColor = 'bg-amber-400';
  } else if (status.status === 'live') {
    statusText = `En directo (actualizado hace ${elapsedMinutes === 0 ? '<1' : elapsedMinutes} min)`;
    statusBadgeClass = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
    StatusIcon = Wifi;
    pulseDotColor = 'bg-emerald-400';
  } else if (status.status === 'stale') {
    statusText = `Datos de hace ${elapsedMinutes} min (fuente no disponible)`;
    statusBadgeClass = 'bg-amber-950/80 text-amber-300 border-amber-500/50';
    StatusIcon = AlertTriangle;
    pulseDotColor = 'bg-amber-400';
  } else {
    statusText = 'Sin datos';
    statusBadgeClass = 'bg-red-950/80 text-red-300 border-red-500/50';
    StatusIcon = WifiOff;
    pulseDotColor = 'bg-red-400';
  }

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition-colors ${
        isHighContrast
          ? 'bg-white border-black text-black'
          : 'bg-[#0c0c0c]/90 border-neutral-800 text-white backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#ff5500] to-[#ff8800] flex items-center justify-center shadow-lg shadow-[#ff5500]/25 text-black font-extrabold tracking-tight">
            <Activity className="w-5 h-5 text-black" strokeWidth={2.6} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xl font-black tracking-wider font-['Montserrat',sans-serif] ${
                  isHighContrast ? 'text-black' : 'text-white'
                }`}
              >
                FITAIR <span className="text-[#ff5500]">PARKS</span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest bg-[#ff5500] text-black px-2 py-0.5 rounded font-mono">
                PRO
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-neutral-800 text-neutral-300 border border-neutral-700 px-1.5 py-0.5 rounded hidden sm:inline">
                MADRID
              </span>
            </div>
            <p
              className={`text-[11px] font-medium hidden sm:block ${
                isHighContrast ? 'text-neutral-700 font-semibold' : 'text-neutral-400'
              }`}
            >
              Calidad del aire EEA & Clima en parques (Portal Datos Abiertos Ayto. Madrid)
            </p>
          </div>
        </div>

        {/* Live Status Indicator (Phase 1 #6 requirement) & Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Status Indicator */}
          <div
            title="Estado de conexión con la Red de Calidad del Aire y Meteorología de Madrid"
            className={`flex items-center gap-2 border px-3 py-1.5 rounded-xl text-xs font-semibold ${statusBadgeClass}`}
          >
            <span className="relative flex h-2 w-2">
              {status.status === 'live' && (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseDotColor}`}></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${pulseDotColor}`}></span>
            </span>
            <span className="hidden sm:inline">{statusText}</span>
            <span className="sm:hidden">{status.status === 'live' ? 'En directo' : status.status === 'stale' ? 'Caché' : 'Sin datos'}</span>
          </div>

          {/* Countdown Clock */}
          <div
            className={`hidden lg:flex items-center gap-1.5 border px-3 py-1.5 rounded-xl text-xs font-mono font-bold ${
              isHighContrast
                ? 'bg-neutral-100 border-black text-black'
                : 'bg-neutral-900 border-neutral-800 text-neutral-300'
            }`}
            title="Próxima lectura oficial de la red municipal"
          >
            <Clock className="w-3.5 h-3.5 text-[#ff5500]" />
            <span>Ciclo :15/:35/:55</span>
            <span className="text-[#ff5500] ml-1">{timeString}</span>
          </div>

          {/* High Contrast Outdoor Mode Button */}
          <button
            onClick={onToggleHighContrast}
            title={isHighContrast ? 'Modo Oscuro' : 'Modo Alto Contraste Exterior (Luz Solar)'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isHighContrast
                ? 'bg-black text-white border-black shadow-md'
                : 'bg-neutral-900 hover:bg-neutral-850 text-neutral-200 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            {isHighContrast ? (
              <>
                <Moon className="w-3.5 h-3.5 text-[#ff5500]" />
                <span className="hidden sm:inline">Modo Noche</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Luz Solar</span>
              </>
            )}
          </button>

          {/* Quick Refresh */}
          <button
            onClick={onRefresh}
            title="Actualizar datos oficiales"
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isHighContrast
                ? 'bg-neutral-100 border-black text-black hover:bg-neutral-200'
                : 'text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 border-neutral-800'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Simulation Toggle */}
          <button
            onClick={onOpenSimulation}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isSimulating
                ? 'bg-[#ff5500]/15 text-[#ff5500] border-[#ff5500]/50 shadow-sm shadow-[#ff5500]/20'
                : isHighContrast
                ? 'bg-neutral-100 border-black text-black hover:bg-neutral-200'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#ff5500]" />
            <span className="hidden sm:inline">Simulador</span>
            {isSimulating && (
              <span className="text-[9px] font-black uppercase tracking-wider bg-[#ff5500] text-black px-1.5 py-0.2 rounded font-mono">
                TEST
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
