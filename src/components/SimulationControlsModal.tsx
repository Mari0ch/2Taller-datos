import React from 'react';
import { SimulationParams } from '../services/airQualityService';
import {
  X,
  Sliders,
  Thermometer,
  CloudRain,
  Wind,
  RefreshCw,
  Sun,
  Flame,
  AlertTriangle,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { PollenRiskLevel } from '../types';

interface SimulationControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  simulationParams: SimulationParams;
  onUpdateParams: (newParams: SimulationParams) => void;
  onReset: () => void;
}

export const SimulationControlsModal: React.FC<SimulationControlsModalProps> = ({
  isOpen,
  onClose,
  simulationParams,
  onUpdateParams,
  onReset,
}) => {
  if (!isOpen) return null;

  const currentTemp = simulationParams.overrideTemp ?? 16;
  const currentRain = simulationParams.overrideRain ?? false;
  const currentAqi = simulationParams.overrideAqi ?? null;
  const currentPollen = simulationParams.overridePollen ?? null;

  const applyPreset = (
    temp: number,
    rain: boolean,
    aqi: 'clean' | 'moderate' | 'polluted' | null,
    pollen?: PollenRiskLevel | null
  ) => {
    onUpdateParams({
      overrideTemp: temp,
      overrideRain: rain,
      overrideAqi: aqi,
      overridePollen: pollen,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111111] border border-neutral-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl text-white relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#ff5500]/15 text-[#ff5500] border border-[#ff5500]/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight font-['Montserrat',sans-serif]">
                Simulador de Condiciones & Test de Equipación
              </h3>
              <p className="text-xs text-neutral-400">
                Prueba los diferentes escenarios térmicos, de contaminación y de polen en Madrid
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mb-6">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#ff5500] block mb-2.5 font-['Montserrat',sans-serif]">
            Escenarios Rápidos de Prueba
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              onClick={() => applyPreset(7, false, 'clean', 'low')}
              className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-left transition-all text-xs cursor-pointer hover:border-neutral-700"
            >
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>❄️ Invierno Frío</span>
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">7°C • Despejado</div>
              <div className="text-[9px] text-[#ff5500] mt-1">&lt; 10°C / &lt; 12°C</div>
            </button>

            <button
              onClick={() => applyPreset(9, true, 'moderate', 'low')}
              className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-left transition-all text-xs cursor-pointer hover:border-neutral-700"
            >
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>🌧️ Lluvia & Frío</span>
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">9°C • Lluvia activa</div>
              <div className="text-[9px] text-[#ff5500] mt-1">&lt; 10°C + Lluvia</div>
            </button>

            <button
              onClick={() => applyPreset(14, false, 'clean', 'moderate')}
              className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-left transition-all text-xs cursor-pointer hover:border-neutral-700"
            >
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>🏃 Ventana Oro</span>
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">14°C • Clima óptimo</div>
              <div className="text-[9px] text-[#ff5500] mt-1">10°C - 18°C Running</div>
            </button>

            <button
              onClick={() => applyPreset(19, false, 'clean', 'high')}
              className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-left transition-all text-xs cursor-pointer hover:border-neutral-700"
            >
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>🌸 Pico Polen Plátano</span>
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">19°C • Alerta Alergia</div>
              <div className="text-[9px] text-fuchsia-400 mt-1">Alta densidad</div>
            </button>

            <button
              onClick={() => applyPreset(25, false, 'moderate', 'low')}
              className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-left transition-all text-xs cursor-pointer hover:border-neutral-700"
            >
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>☀️ Calor Veraniego</span>
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">25°C • Mucho sol</div>
              <div className="text-[9px] text-[#ff5500] mt-1">&gt; 18°C / &gt; 20°C</div>
            </button>

            <button
              onClick={() => applyPreset(16, false, 'polluted', 'low')}
              className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-left transition-all text-xs cursor-pointer hover:border-neutral-700"
            >
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>⚠️ Boina NO₂</span>
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">ICA &gt; 110 • Polución</div>
              <div className="text-[9px] text-red-400 mt-1">Alerta Respiratoria</div>
            </button>
          </div>
        </div>

        {/* Custom Sliders & Toggles */}
        <div className="space-y-5 bg-neutral-950 p-4 rounded-2xl border border-neutral-800/80 mb-6">
          {/* Temperature Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-[#ff5500]" />
                Temperatura Ambiente:
              </span>
              <span className="font-mono text-base font-extrabold text-[#ff5500]">
                {currentTemp}°C
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={36}
              step={1}
              value={currentTemp}
              onChange={(e) =>
                onUpdateParams({
                  ...simulationParams,
                  overrideTemp: parseFloat(e.target.value),
                })
              }
              className="w-full accent-[#ff5500] bg-neutral-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-1">
              <span>2°C (Muy frío)</span>
              <span>10°C</span>
              <span>18°C</span>
              <span>20°C</span>
              <span>36°C (Calor)</span>
            </div>
          </div>

          {/* Rain Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-900">
            <div className="flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-blue-400" />
              <div>
                <span className="text-xs font-semibold text-white block">Precipitaciones / Lluvia</span>
                <span className="text-[10px] text-neutral-400">Activa chubascos en los parques</span>
              </div>
            </div>

            <button
              onClick={() =>
                onUpdateParams({
                  ...simulationParams,
                  overrideRain: !currentRain,
                })
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentRain
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {currentRain ? '🌧️ Con Lluvia' : '☀️ Seco'}
            </button>
          </div>

          {/* Air Quality Preset Toggle */}
          <div className="pt-2 border-t border-neutral-900">
            <div className="text-xs font-semibold text-white mb-2">Simular Calidad del Aire (ICA):</div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() =>
                  onUpdateParams({
                    ...simulationParams,
                    overrideAqi: 'clean',
                  })
                }
                className={`py-1.5 px-2 rounded-lg text-xs font-bold text-center border transition-all cursor-pointer ${
                  currentAqi === 'clean'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                Limpio (ICA &lt; 35)
              </button>

              <button
                onClick={() =>
                  onUpdateParams({
                    ...simulationParams,
                    overrideAqi: 'moderate',
                  })
                }
                className={`py-1.5 px-2 rounded-lg text-xs font-bold text-center border transition-all cursor-pointer ${
                  currentAqi === 'moderate'
                    ? 'bg-[#ff5500]/20 text-[#ff5500] border-[#ff5500]/50'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                Moderado (ICA ~65)
              </button>

              <button
                onClick={() =>
                  onUpdateParams({
                    ...simulationParams,
                    overrideAqi: 'polluted',
                  })
                }
                className={`py-1.5 px-2 rounded-lg text-xs font-bold text-center border transition-all cursor-pointer ${
                  currentAqi === 'polluted'
                    ? 'bg-red-500/20 text-red-400 border-red-500/50'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                Dañino (ICA &gt; 110)
              </button>
            </div>
          </div>

          {/* Pollen Risk Preset Toggle */}
          <div className="pt-2 border-t border-neutral-900">
            <div className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Simular Nivel de Exposición al Polen:</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() =>
                  onUpdateParams({
                    ...simulationParams,
                    overridePollen: 'low',
                  })
                }
                className={`py-1.5 px-2 rounded-lg text-xs font-bold text-center border transition-all cursor-pointer ${
                  currentPollen === 'low'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                Bajo
              </button>

              <button
                onClick={() =>
                  onUpdateParams({
                    ...simulationParams,
                    overridePollen: 'moderate',
                  })
                }
                className={`py-1.5 px-2 rounded-lg text-xs font-bold text-center border transition-all cursor-pointer ${
                  currentPollen === 'moderate'
                    ? 'bg-[#ff5500]/20 text-[#ff5500] border-[#ff5500]/50'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                Medio
              </button>

              <button
                onClick={() =>
                  onUpdateParams({
                    ...simulationParams,
                    overridePollen: 'high',
                  })
                }
                className={`py-1.5 px-2 rounded-lg text-xs font-bold text-center border transition-all cursor-pointer ${
                  currentPollen === 'high'
                    ? 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/50'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                Alto
              </button>

              <button
                onClick={() =>
                  onUpdateParams({
                    ...simulationParams,
                    overridePollen: 'extreme',
                  })
                }
                className={`py-1.5 px-2 rounded-lg text-xs font-bold text-center border transition-all cursor-pointer ${
                  currentPollen === 'extreme'
                    ? 'bg-red-500/20 text-red-400 border-red-500/50'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                Extremo
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-neutral-800">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white font-medium px-3 py-2 rounded-lg hover:bg-neutral-900 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restablecer a Datos Reales</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-[#ff5500] hover:bg-[#ff6600] shadow-lg shadow-[#ff5500]/30 transition-all cursor-pointer font-['Montserrat',sans-serif]"
          >
            Aplicar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
