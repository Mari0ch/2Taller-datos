import React from 'react';
import {
  Map,
  ShieldAlert,
  Shirt,
  TrendingUp,
  Settings,
  Sparkles,
} from 'lucide-react';

export type TabId = 'map' | 'avoid' | 'outfit' | 'hourly' | 'settings';

interface TabItem {
  id: TabId;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

interface NavigationTabBarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  isHighContrast?: boolean;
  isAllergyActive?: boolean;
}

export const NAVIGATION_TABS: TabItem[] = [
  {
    id: 'map',
    label: '1. Mapa & Parques',
    shortLabel: 'Mapa',
    icon: Map,
  },
  {
    id: 'avoid',
    label: '2. Zonas a Evitar & Polen',
    shortLabel: 'Evitar & Polen',
    icon: ShieldAlert,
    badge: '3 Zonas',
    badgeColor: 'bg-red-500 text-white',
  },
  {
    id: 'outfit',
    label: '3. Equipación & Planificador',
    shortLabel: 'Equipación',
    icon: Shirt,
    badge: '+10°C Run',
    badgeColor: 'bg-[#ff5500] text-black font-extrabold',
  },
  {
    id: 'hourly',
    label: '4. Predicción Horaria',
    shortLabel: 'Horas',
    icon: TrendingUp,
    badge: '🏆 -28% NO₂',
    badgeColor: 'bg-emerald-500 text-black font-extrabold',
  },
  {
    id: 'settings',
    label: '5. Exportar & Ajustes',
    shortLabel: 'Ajustes',
    icon: Settings,
  },
];

export const NavigationTabBar: React.FC<NavigationTabBarProps> = ({
  activeTab,
  onSelectTab,
  isHighContrast = false,
  isAllergyActive = false,
}) => {
  return (
    <>
      {/* Desktop Sticky Header Tab Bar */}
      <nav
        aria-label="Navegación principal por pestañas"
        className={`sticky top-0 z-30 w-full border-b transition-all duration-200 backdrop-blur-lg ${
          isHighContrast
            ? 'bg-white border-black text-black'
            : 'bg-[#111111]/95 border-neutral-800 text-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center space-x-1 sm:space-x-2 w-full justify-start md:justify-center">
              {NAVIGATION_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => onSelectTab(tab.id)}
                    className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer whitespace-nowrap font-['Montserrat',sans-serif] ${
                      isActive
                        ? isHighContrast
                          ? 'bg-[#ff5500] text-black shadow-md'
                          : 'bg-[#ff5500] text-black shadow-lg shadow-[#ff5500]/25'
                        : isHighContrast
                        ? 'text-neutral-700 hover:bg-neutral-100 hover:text-black'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-black' : isHighContrast ? 'text-black' : 'text-[#ff5500]'
                      }`}
                    />
                    <span>{tab.label}</span>

                    {/* Badge */}
                    {tab.badge && (
                      <span
                        className={`hidden lg:inline-block text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-black text-white'
                            : tab.badgeColor || 'bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        {tab.id === 'avoid' && isAllergyActive ? 'Polen ON' : tab.badge}
                      </span>
                    )}

                    {/* Active Underline Pill */}
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-black rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-xl transition-all ${
          isHighContrast
            ? 'bg-white border-black text-black shadow-[0_-4px_20px_rgba(0,0,0,0.15)]'
            : 'bg-[#0f0f0f]/95 border-neutral-800 text-white shadow-[0_-4px_20px_rgba(0,0,0,0.6)]'
        }`}
      >
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1">
          {NAVIGATION_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 relative transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[#ff5500]'
                    : isHighContrast
                    ? 'text-neutral-600 hover:text-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition-transform ${
                    isActive ? 'bg-[#ff5500]/15 scale-110' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-bold tracking-tight mt-0.5 font-['Montserrat',sans-serif] ${
                    isActive ? 'font-black text-[#ff5500]' : ''
                  }`}
                >
                  {tab.shortLabel}
                </span>

                {/* Active Top Bar Indicator */}
                {isActive && (
                  <span className="absolute top-0 w-8 h-1 bg-[#ff5500] rounded-b-full shadow-sm shadow-[#ff5500]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
