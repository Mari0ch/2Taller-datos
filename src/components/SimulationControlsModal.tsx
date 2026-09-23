import React from 'react';
import { SimulationParams } from '../services/airQualityService';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Sparkles,
  CloudRain,
  Sun,
  Wind,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';

interface SimulationControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  simParams: SimulationParams;
  onUpdateSimParams: (params: SimulationParams) => void;
  onReset: () => void;
}

export const SimulationControlsModal: React.FC<SimulationControlsModalProps> = ({
  isOpen,
  onClose,
  simParams,
  onUpdateSimParams,
  onReset,
}) => {
  if (!isOpen) return null;

  const isSimulating =
    simParams.overrideTemp !== null && simParams.overrideTemp !== undefined ||
    simParams.overrideRain !== null && simParams.overrideRain !== undefined ||
    simParams.overrideAqi !== null && simParams.overrideAqi !== undefined ||
    simParams.overridePollen !== null && simParams.overridePollen !== undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#121212] border border-neutral-800 rounded-3xl max-w-lg w-full shadow-2xl text-white overflow-hidden">
        {/* Header */}
        <div className="bg-neutral-900/90 border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#ff5500]/20 text-[#ff5500]">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#ff5500] font-['Montserrat',sans-serif]">
                  MODO PRUEBA
                </span>
                {isSimulating && (
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-500 text-black font-mono">
                    SIMULACIÓN ACTIVA
                  </span>
                )}
              </div>
              <h3 className="text-base font-black font-['Montserrat',sans-serif]">
                Simulador de Escenarios Ambientales
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white bg-neutral-800 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {/* Prominent Simulation Warning */}
          <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300 block text-xs">
                ⚠️ MODO SIMULACIÓN CONTROLADO
              </span>
              <p className="text-[11px] text-amber-200/90 mt-0.5 leading-relaxed">
                Los valores seleccionados sustituyen temporalmente la telemetría real de las estaciones municipales para comprobar la reacción del algoritmo deportivo y la recomendación de ropa (+10°C).
              </p>
            </div>
          </div>

          {/* Temperature Override */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-300 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Temperatura Ambiente:</span>
              </span>
              <span className="font-mono font-extrabold text-[#ff5500]">
                {simParams.overrideTemp !== null && simParams.overrideTemp !== undefined
                  ? `${simParams.overrideTemp}°C (Simulado)`
                  : 'Tiempo Real'}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[-2, 6, 15, 24, 36].map((temp) => (
                <button
                  key={temp}
                  onClick={() =>
                    onUpdateSimParams({
                      ...simParams,
                      overrideTemp: simParams.overrideTemp === temp ? null : temp,
                    })
                  }
                  className={`py-2 rounded-xl font-bold font-mono text-xs border transition-all cursor-pointer ${
                    simParams.overrideTemp === temp
                      ? 'bg-[#ff5500] text-black border-[#ff5500] font-black'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {temp > 0 ? `+${temp}` : temp}°C
                </button>
              ))}
            </div>
          </div>

          {/* Rain Override */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-300 flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-sky-400" />
                <span>Precipitación / Lluvia:</span>
              </span>
              <span className="font-mono font-bold text-sky-400">
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
                className={`py-2.5 rounded-xl font-bold border transition-all cursor-pointer ${
                  simParams.overrideRain === true
                    ? 'bg-sky-500 text-black border-sky-500'
                    : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                🌧️ Forzar Lluvia Activa
              </button>
              <button
                onClick={() =>
                  onUpdateSimParams({
                    ...simParams,
                    overrideRain: simParams.overrideRain === false ? null : false,
                  })
                }
                className={`py-2.5 rounded-xl font-bold border transition-all cursor-pointer ${
                  simParams.overrideRain === false
                    ? 'bg-amber-500 text-black border-amber-500'
                    : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                ☀️ Forzar Sin Lluvia
              </button>
            </div>
          </div>

          {/* Air Quality (ICA/EEA) Override */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-300 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>Escenario de Calidad del Aire (EEA):</span>
              </span>
              <span className="font-mono font-bold text-red-400">
                {simParams.overrideAqi ? `${simParams.overrideAqi.toUpperCase()} (Simulado)` : 'Tiempo Real'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Limpio / Verde', val: 'clean' as const, bg: 'bg-emerald-500' },
                { label: 'Moderado', val: 'moderate' as const, bg: 'bg-orange-500' },
                { label: 'Pico Crítico', val: 'polluted' as const, bg: 'bg-red-500' },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() =>
                    onUpdateSimParams({
                      ...simParams,
                      overrideAqi: simParams.overrideAqi === item.val ? null : item.val,
                    })
                  }
                  className={`py-2 rounded-xl font-bold border transition-all cursor-pointer text-xs ${
                    simParams.overrideAqi === item.val
                      ? `${item.bg} text-black border-transparent font-black`
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-neutral-900/90 border-t border-neutral-800 px-6 py-4 flex items-center justify-between">
          <button
            onClick={onReset}
            disabled={!isSimulating}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              isSimulating
                ? 'text-[#ff5500] hover:bg-[#ff5500]/10 cursor-pointer'
                : 'text-neutral-500 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Resetear a Datos Reales</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-bold text-xs bg-white text-black hover:bg-neutral-200 cursor-pointer transition-colors"
          >
            Cerrar Panel
          </button>
        </div>
      </div>
    </div>
  );
};
