import React from 'react';
import { MadridPark } from '../types';
import { Sparkles, Wind, Droplets, AlertTriangle, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface AllergyModuleProps {
  isAllergyMode: boolean;
  onToggleAllergyMode: (enabled: boolean) => void;
  parks: MadridPark[];
  onSelectPark: (park: MadridPark) => void;
}

export const AllergyModule: React.FC<AllergyModuleProps> = ({
  isAllergyMode,
  onToggleAllergyMode,
  parks,
  onSelectPark,
}) => {
  // Parks with lowest pollen risk
  const lowPollenParks = [...parks]
    .filter((p) => p.pollenInfo.riskLevel === 'low' || p.pollenInfo.riskLevel === 'moderate')
    .sort((a, b) => a.pollenInfo.pollenScore - b.pollenInfo.pollenScore)
    .slice(0, 3);

  // Parks with highest pollen risk
  const highPollenParks = [...parks]
    .filter((p) => p.pollenInfo.riskLevel === 'extreme' || p.pollenInfo.riskLevel === 'high')
    .sort((a, b) => b.pollenInfo.pollenScore - a.pollenInfo.pollenScore)
    .slice(0, 3);

  return (
    <div className="rounded-3xl bg-neutral-950 border border-neutral-800 p-5 sm:p-7 shadow-2xl relative overflow-hidden">
      {/* Background Violet/Amber Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-fuchsia-600/5 blur-3xl pointer-events-none rounded-full" />

      {/* Main Switcher Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-fuchsia-400 bg-fuchsia-950/80 border border-fuchsia-800/80 px-2.5 py-0.5 rounded">
              SALUD RESPIRATORIA & ALERGIAS
            </span>
            <span className="text-xs text-neutral-400">Red Aerobiológica de Madrid</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Montserrat',sans-serif]">
            Módulo "Modo Alergia / Exposición al Polen"
          </h3>
          <p className="text-xs text-neutral-300 mt-1 max-w-2xl leading-relaxed">
            Cruza la biodiversidad botánica del parque (<strong>plátanos de sombra, arizónicas y gramíneas</strong>) con la meteorología: si el viento es fuerte y el aire es seco, se dispara la dispersión de granos alergénicos.
          </p>
        </div>

        {/* Big Toggle Button */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-semibold text-neutral-300">
            {isAllergyMode ? '🌸 Modo Alergia Activado' : 'Filtro Desactivado'}
          </span>
          <button
            onClick={() => onToggleAllergyMode(!isAllergyMode)}
            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
              isAllergyMode ? 'bg-fuchsia-600' : 'bg-neutral-800'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                isAllergyMode ? 'translate-x-9 shadow-md' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* When Active: In-Depth Information */}
      {isAllergyMode ? (
        <div className="mt-5 space-y-5 animate-fade-in">
          {/* Key Aerobiological Factors Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-xs">
            <div className="flex items-start gap-2.5">
              <Wind className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Efecto Dispersión por Viento</span>
                <p className="text-neutral-400 text-[11px] mt-0.5">
                  Vientos superiores a 15 km/h fracturan los granos de polen en partículas respirables más finas.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Droplets className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Humedad & Lavado Atmosférico</span>
                <p className="text-neutral-400 text-[11px] mt-0.5">
                  El aire seco de Madrid (&lt;45%) eleva el tiempo de suspensión del polen; la lluvia lo precipita.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Flora de Alto Riesgo</span>
                <p className="text-neutral-400 text-[11px] mt-0.5">
                  Plátano de sombra en El Retiro / Fuente del Berro y gramíneas en Casa de Campo.
                </p>
              </div>
            </div>
          </div>

          {/* Side by side: Safe Alternatives vs Parks with Extreme Pollen */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Safe Parks for Allergy Sufferers */}
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  ✓ Parques Recomendados para Alérgicos (Menor Exposición)
                </span>
              </div>

              <div className="space-y-2">
                {lowPollenParks.map((park) => (
                  <div
                    key={park.id}
                    onClick={() => onSelectPark(park)}
                    className="p-3 rounded-xl bg-neutral-900/80 hover:bg-neutral-850 border border-neutral-800 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <h5 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {park.name}
                      </h5>
                      <span className="text-[11px] text-neutral-400">
                        Flora: {park.allergenicFlora.slice(0, 2).join(', ')}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded">
                        Riesgo {park.pollenInfo.riskLabel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* High Pollen Exposure Warning */}
            <div className="p-4 rounded-2xl bg-fuchsia-950/30 border border-fuchsia-500/30">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-fuchsia-400" />
                <span className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider">
                  ⚠️ Parques con Mayor Densidad Polínica Actual
                </span>
              </div>

              <div className="space-y-2">
                {highPollenParks.map((park) => (
                  <div
                    key={park.id}
                    onClick={() => onSelectPark(park)}
                    className="p-3 rounded-xl bg-neutral-900/80 hover:bg-neutral-850 border border-neutral-800 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <h5 className="text-sm font-bold text-white group-hover:text-fuchsia-400 transition-colors">
                        {park.name}
                      </h5>
                      <span className="text-[11px] text-neutral-400">
                        Alérgeno dominante: <strong>{park.pollenInfo.dominantSpecies[0]}</strong>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-fuchsia-300 bg-fuchsia-950/70 border border-fuchsia-800/60 px-2 py-0.5 rounded">
                        Riesgo {park.pollenInfo.riskLabel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-400 bg-neutral-900/50 p-3 rounded-xl border border-neutral-850">
          <p>
            Activa el <strong>Modo Alergia</strong> para recalcular el ranking de parques según su concentración de polen y recibir recomendaciones de indumentaria protectora (gafas envolventes y viseras).
          </p>
          <button
            onClick={() => onToggleAllergyMode(true)}
            className="text-xs font-bold text-[#ff5500] hover:text-[#ff7722] shrink-0 self-start sm:self-auto cursor-pointer"
          >
            Activar Ahora →
          </button>
        </div>
      )}
    </div>
  );
};
