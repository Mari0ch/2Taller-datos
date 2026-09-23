import React from 'react';
import { MadridPark } from '../types';
import { Sparkles, Wind, Droplets, AlertTriangle, ShieldCheck, CheckCircle2, ArrowRight, Calendar } from 'lucide-react';
import { MADRID_POLLEN_CALENDAR } from '../services/pollenSeasonality';

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
  const currentMonthIdx = new Date().getMonth();
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const currentMonthName = monthNames[currentMonthIdx];

  // Active species in Madrid this month
  const activeSpeciesThisMonth = MADRID_POLLEN_CALENDAR.filter(
    (item: { name: string; activeMonths: number[]; description: string }) =>
      item.activeMonths.includes(currentMonthIdx)
  );

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
            <span className="text-xs text-neutral-400">Calendario Polínico & Censo Arbóreo</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Montserrat',sans-serif]">
            Módulo "Modo Alergia / Exposición al Polen"
          </h3>
          <p className="text-xs text-neutral-300 mt-1 max-w-2xl leading-relaxed">
            Cruza la biodiversidad botánica del parque con la <strong>estacionalidad mensual fenológica</strong> (plátanos de sombra en primavera, arizónicas en invierno, gramíneas en mayo-junio) y la meteorología (viento y humedad).
          </p>
          <div className="mt-2 text-[11px] text-amber-400/90 font-mono flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Nota: Estimación botánica fenológica, no medición volumétrica directa de captadores.</span>
          </div>
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
          {/* Active Pollens for Current Month */}
          <div className="p-4 rounded-2xl bg-fuchsia-950/30 border border-fuchsia-500/30 text-xs">
            <div className="font-bold text-fuchsia-300 mb-2 flex items-center gap-1.5">
              <span>📅 Estado Fenológico de Madrid en {currentMonthName}:</span>
            </div>
            {activeSpeciesThisMonth.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {activeSpeciesThisMonth.map((sp: { name: string; activeMonths: number[]; description: string }) => (
                  <div key={sp.name} className="p-2.5 rounded-xl bg-black/60 border border-fuchsia-500/20">
                    <div className="font-bold text-white text-xs">{sp.name}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">{sp.description}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-400 text-xs">
                Actualmente no hay picos masivos de polinización activa para las especies arbóreas principales de Madrid. Riesgo basal bajo.
              </p>
            )}
          </div>

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
                  Plátano de sombra (primavera), cupresáceas/arizónicas (invierno) y gramíneas silvestres.
                </p>
              </div>
            </div>
          </div>

          {/* Two Columns: Recommended vs High Exposure Parks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Low Pollen Parks */}
            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 font-['Montserrat',sans-serif]">
                  Parques Recomendados para Alérgicos
                </h4>
              </div>

              <div className="space-y-2">
                {lowPollenParks.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onSelectPark(p)}
                    className="p-3 rounded-xl bg-black/50 border border-neutral-800 hover:border-emerald-500/60 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-white text-xs block">{p.name}</span>
                      <span className="text-[11px] text-neutral-400">{p.district}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 font-mono">
                        Riesgo {p.pollenInfo.riskLabel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* High Pollen Parks */}
            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-fuchsia-500/30">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-fuchsia-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-fuchsia-400 font-['Montserrat',sans-serif]">
                  Parques con Mayor Exposición de Flora
                </h4>
              </div>

              <div className="space-y-2">
                {highPollenParks.length > 0 ? (
                  highPollenParks.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => onSelectPark(p)}
                      className="p-3 rounded-xl bg-black/50 border border-neutral-800 hover:border-fuchsia-500/60 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-white text-xs block">{p.name}</span>
                        <span className="text-[11px] text-neutral-400">
                          {p.pollenInfo.dominantSpecies.join(', ')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-fuchsia-400 bg-fuchsia-950/80 px-2 py-0.5 rounded border border-fuchsia-800 font-mono">
                          Riesgo {p.pollenInfo.riskLabel}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-neutral-400 p-3">
                    Ningún parque supera el umbral de alerta polínica en las condiciones actuales.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-400">
          <span>
            Activa el Modo Alergia si eres sensible al polen de plátano de sombra, arizónicas o gramíneas en Madrid.
          </span>
          <button
            onClick={() => onToggleAllergyMode(true)}
            className="text-fuchsia-400 hover:text-fuchsia-300 font-bold underline cursor-pointer self-start sm:self-auto"
          >
            Activar Módulo de Polen
          </button>
        </div>
      )}
    </div>
  );
};
