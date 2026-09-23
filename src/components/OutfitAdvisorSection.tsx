import React from 'react';
import { ActivityType, MadridPark } from '../types';
import { calculateOutfit } from '../services/outfitAdvisor';
import {
  ShieldAlert,
  Shirt,
  Footprints,
  Layers,
  Sparkles,
  Sun,
  Wind,
  Umbrella,
  Glasses,
  Shield,
  Activity,
  Droplets,
  Thermometer,
  Flame,
  CheckCircle2,
} from 'lucide-react';

interface OutfitAdvisorSectionProps {
  selectedPark: MadridPark | null;
  activity: ActivityType;
  isAllergyMode: boolean;
}

export const OutfitAdvisorSection: React.FC<OutfitAdvisorSectionProps> = ({
  selectedPark,
  activity,
  isAllergyMode,
}) => {
  const currentTemp = selectedPark ? selectedPark.weather.temperature : 16;
  const isRaining = selectedPark ? selectedPark.weather.isRaining : false;
  const windSpeed = selectedPark ? selectedPark.weather.windSpeed : 12;

  const outfit = calculateOutfit(activity, currentTemp, isRaining, windSpeed, isAllergyMode);
  const isRunning = activity === 'running';

  // Dynamic icon helper
  const renderGarmentIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-[#ff5500]" />;
      case 'Shirt':
        return <Shirt className="w-5 h-5 text-[#ff5500]" />;
      case 'Footprints':
        return <Footprints className="w-5 h-5 text-[#ff5500]" />;
      case 'Layers':
        return <Layers className="w-5 h-5 text-[#ff5500]" />;
      case 'Sun':
        return <Sun className="w-5 h-5 text-[#ff5500]" />;
      case 'Wind':
        return <Wind className="w-5 h-5 text-[#ff5500]" />;
      case 'Umbrella':
        return <Umbrella className="w-5 h-5 text-[#ff5500]" />;
      case 'Glasses':
        return <Glasses className="w-5 h-5 text-fuchsia-400" />;
      case 'Shield':
        return <Shield className="w-5 h-5 text-[#ff5500]" />;
      case 'Activity':
        return <Activity className="w-5 h-5 text-[#ff5500]" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#ff5500]" />;
    }
  };

  return (
    <section className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Background athletic glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff5500]/5 blur-3xl pointer-events-none rounded-full" />

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-2 w-2 rounded-full bg-[#ff5500] animate-ping" />
            <span className="text-xs font-bold tracking-widest text-[#ff5500] uppercase font-['Montserrat',sans-serif]">
              SMART OUTFIT ADVISOR • RECOMENDADOR INTELIGENTE
            </span>
            {isAllergyMode && (
              <span className="text-[10px] font-bold text-fuchsia-300 bg-fuchsia-950/80 border border-fuchsia-800/80 px-2 py-0.5 rounded">
                🌸 Filtro Alergias Activo
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Montserrat',sans-serif]">
            Equipación e Indumentaria Recomendada
          </h2>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
            {selectedPark ? (
              <>
                Ajustado específicamente al microclima de{' '}
                <strong className="text-white">{selectedPark.name}</strong> ({selectedPark.district}).
              </>
            ) : (
              'Selecciona un parque en el mapa o lista para ver el ajuste hiperlocal de temperatura.'
            )}
          </p>
        </div>

        {/* Real-time Weather HUD Card */}
        <div className="flex items-center gap-4 bg-neutral-900 border border-neutral-800 px-5 py-3 rounded-2xl shadow-inner shrink-0">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
              Temperatura Ambiental
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-3xl font-extrabold text-white font-mono">{currentTemp}°C</span>
              {isRaining && (
                <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Droplets className="w-3 h-3" /> Lluvia
                </span>
              )}
            </div>
          </div>

          <div className="h-10 w-px bg-neutral-800" />

          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
              Sensación de Esfuerzo
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-3xl font-extrabold text-[#ff5500] font-mono">
                {outfit.perceivedEffortTemp}°C
              </span>
              {isRunning && (
                <span className="text-[10px] text-neutral-400 font-medium">
                  (+10°C carrera)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Matched Rule Pill */}
      <div className="my-6 p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#ff5500]/15 text-[#ff5500] border border-[#ff5500]/30 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff5500]">
              Criterio Técnico Aplicado ({isRunning ? 'Corredor' : 'Caminante'})
            </span>
            <p className="text-sm sm:text-base font-bold text-white mt-0.5">
              {outfit.summaryRule}
            </p>
          </div>
        </div>

        <span className="text-xs text-neutral-400 bg-neutral-800 px-3 py-1.5 rounded-lg shrink-0 self-start sm:self-auto border border-neutral-700">
          Modo: <strong className="text-white">{isRunning ? '🏃🏻‍♂️ Running' : '🚶🏽‍♀️ Paseo'}</strong>
        </span>
      </div>

      {/* Garments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {outfit.garments.map((garment) => (
          <div
            key={garment.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              garment.id.startsWith('allergy-')
                ? 'bg-fuchsia-950/20 border-fuchsia-500/40 shadow-lg shadow-fuchsia-500/5'
                : garment.isCrucial
                ? 'bg-[#151515] border-[#ff5500]/40 shadow-lg shadow-[#ff5500]/5 hover:border-[#ff5500]'
                : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  {garment.categoryLabel}
                </span>
                <div className="p-2 rounded-xl bg-neutral-800/80 border border-neutral-700">
                  {renderGarmentIcon(garment.iconName)}
                </div>
              </div>

              <h4 className="text-base font-bold text-white mb-1.5 leading-snug">
                {garment.name}
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {garment.description}
              </p>
            </div>

            {garment.isCrucial && (
              <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center gap-1.5 text-[11px] font-bold text-[#ff5500]">
                <span>★ Prenda clave recomendada</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Overall Coach Advice & Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-4 border-t border-neutral-800/80">
        <div className="lg:col-span-2 p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/80">
          <span className="text-xs font-bold text-white uppercase tracking-wider block mb-1">
            Recomendación Biomecánica & Confort Térmico
          </span>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {outfit.overallAdvice}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#ff5500]/10 border border-[#ff5500]/30">
          <span className="text-xs font-bold text-[#ff5500] uppercase tracking-wider block mb-1">
            Consejo Deportivo Municipal
          </span>
          <p className="text-xs text-neutral-200 leading-relaxed">
            {outfit.healthTips[0] ||
              'En Madrid, ajusta el entrenamiento si la humedad es muy baja y aprovecha las fuentes públicas.'}
          </p>
        </div>
      </div>
    </section>
  );
};
