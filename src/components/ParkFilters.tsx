import React from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, Filter, Ban, Sparkles } from 'lucide-react';

interface ParkFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedAptitude: string;
  onAptitudeChange: (val: string) => void;
  selectedSurface: string;
  onSurfaceChange: (val: string) => void;
  sortBy: string;
  onSortChange: (val: string) => void;
  totalParksCount: number;
  filteredCount: number;
  isAllergyMode: boolean;
}

export const ParkFilters: React.FC<ParkFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedAptitude,
  onAptitudeChange,
  selectedSurface,
  onSurfaceChange,
  sortBy,
  onSortChange,
  totalParksCount,
  filteredCount,
  isAllergyMode,
}) => {
  return (
    <div className="bg-neutral-950 border border-neutral-850 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Top search & Sort row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por parque o distrito (ej. Retiro, Casa de Campo, Moncloa, Arganzuela)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500] text-sm text-white placeholder-neutral-500 rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white"
            >
              Borrar
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 shrink-0">
          <ArrowUpDown className="w-4 h-4 text-[#ff5500]" />
          <span className="text-xs text-neutral-400 font-medium hidden sm:inline">Ordenar:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 text-xs font-semibold text-white rounded-xl px-3 py-2.5 outline-none focus:border-[#ff5500] cursor-pointer"
          >
            <option value="score">🏆 Mayor Aptitud para el Deporte</option>
            <option value="air">🍃 Aire más Limpio (Menor ICA)</option>
            {isAllergyMode && <option value="pollen">🌸 Menor Nivel de Polen</option>}
            <option value="perimeter">🏃 Mayor Circuito Perimetral</option>
            <option value="area">🌳 Mayor Superficie (Hectáreas)</option>
            <option value="name">🔤 Nombre Alfabético</option>
          </select>
        </div>
      </div>

      {/* Filter Badges Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-900 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-neutral-400 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#ff5500]" />
            Filtrar:
          </span>

          <button
            onClick={() => onAptitudeChange('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              selectedAptitude === 'all'
                ? 'bg-white text-black font-extrabold shadow-sm'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            Todos ({totalParksCount})
          </button>

          <button
            onClick={() => onAptitudeChange('optimo')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              selectedAptitude === 'optimo'
                ? 'bg-emerald-500 text-black font-extrabold shadow-sm shadow-emerald-500/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            🟢 Óptimo
          </button>

          <button
            onClick={() => onAptitudeChange('aceptable')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              selectedAptitude === 'aceptable'
                ? 'bg-[#ff5500] text-black font-extrabold shadow-sm shadow-[#ff5500]/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            🟠 Moderado
          </button>

          <button
            onClick={() => onAptitudeChange('evitar')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              selectedAptitude === 'evitar'
                ? 'bg-red-500 text-black font-extrabold shadow-sm shadow-red-500/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Ban className="w-3 h-3 text-current" />
            🔴 Zonas a Evitar
          </button>

          {isAllergyMode && (
            <button
              onClick={() => onAptitudeChange('alergia-baja')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                selectedAptitude === 'alergia-baja'
                  ? 'bg-fuchsia-600 text-white font-extrabold shadow-sm shadow-fuchsia-600/20'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              <Sparkles className="w-3 h-3 text-current" />
              🌸 Menor Polen
            </button>
          )}
        </div>

        {/* Counter */}
        <div className="text-[11px] text-neutral-400 font-mono">
          Mostrando <strong className="text-[#ff5500]">{filteredCount}</strong> de {totalParksCount} parques
        </div>
      </div>
    </div>
  );
};
