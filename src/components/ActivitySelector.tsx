import React from 'react';
import { ActivityType } from '../types';
import { Flame, Footprints, Info } from 'lucide-react';

interface ActivitySelectorProps {
  activity: ActivityType;
  onChange: (activity: ActivityType) => void;
}

export const ActivitySelector: React.FC<ActivitySelectorProps> = ({ activity, onChange }) => {
  const isRunning = activity === 'running';

  return (
    <div className="w-full bg-neutral-950/80 border border-neutral-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-sm shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Description */}
        <div>
          <span className="text-xs font-bold tracking-widest text-[#ff5500] uppercase flex items-center gap-1.5 mb-1 font-['Montserrat',sans-serif]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff5500]"></span>
            MODALIDAD DE EJERCICIO URBANO
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            ¿Qué actividad vas a realizar hoy?
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            El algoritmo recalcula la ropa técnica y la aptitud respiratoria según tu esfuerzo aeróbico.
          </p>
        </div>

        {/* Big Switcher Buttons */}
        <div className="flex items-center gap-2 p-1.5 bg-neutral-900 border border-neutral-800 rounded-xl self-start md:self-auto">
          {/* Running Button */}
          <button
            type="button"
            onClick={() => onChange('running')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all cursor-pointer ${
              isRunning
                ? 'bg-[#ff5500] text-black shadow-lg shadow-[#ff5500]/30 font-extrabold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <span className="text-lg">🏃🏻‍♂️</span>
            <span>Correr (Running)</span>
            {isRunning && (
              <span className="text-[10px] bg-black/20 text-black px-1.5 py-0.5 rounded font-mono font-bold">
                +10°C
              </span>
            )}
          </button>

          {/* Walking Button */}
          <button
            type="button"
            onClick={() => onChange('walking')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all cursor-pointer ${
              !isRunning
                ? 'bg-white text-black shadow-lg shadow-white/20 font-extrabold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <span className="text-lg">🚶🏽‍♀️</span>
            <span>Andar / Pasear</span>
            {!isRunning && (
              <span className="text-[10px] bg-black/15 text-black px-1.5 py-0.5 rounded font-mono font-bold">
                Base
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Physics / Thermal Note Banner */}
      <div className="mt-4 pt-3 border-t border-neutral-900 flex items-start gap-2.5 text-xs text-neutral-400">
        <Info className="w-4 h-4 text-[#ff5500] shrink-0 mt-0.5" />
        <div>
          {isRunning ? (
            <p>
              <strong className="text-white font-medium">Fisiología Running: </strong>
              La combustión metabólica genera ~600-850 kcal/h, aumentando tu sensación térmica en aproximadamente{' '}
              <strong className="text-[#ff5500]">+10°C</strong>. La indumentaria recomendada se calcula con este diferencial térmico y exige mayor transpirabilidad.
            </p>
          ) : (
            <p>
              <strong className="text-white font-medium">Fisiología Andar: </strong>
              Caminar a paso ligero produce ~250-350 kcal/h. Tu cuerpo conserva la temperatura ambiental real, requiriendo prendas más abrigadas y calzado ergonómico.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
