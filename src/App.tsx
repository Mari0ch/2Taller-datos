import React, { useEffect, useState, useMemo, Suspense, lazy, useCallback } from 'react';
import { ActivityType, DataSourceStatus, MadridPark } from './types';
import {
  fetchMadridParksData,
  getDataSourceStatus,
  SimulationParams,
} from './services/airQualityService';
import { Navbar } from './components/Navbar';
import { NavigationTabBar, TabId } from './components/NavigationTabBar';
import { NearbyCleanestParks } from './components/NearbyCleanestParks';
import { ParkCard } from './components/ParkCard';
import { ParkFilters } from './components/ParkFilters';
import { HighPollutionAlertPanel } from './components/HighPollutionAlertPanel';
import { AllergyModule } from './components/AllergyModule';
import { ActivitySelector } from './components/ActivitySelector';
import { OutfitAdvisorSection } from './components/OutfitAdvisorSection';
import { InhaledDoseCalculator } from './components/InhaledDoseCalculator';
import { ParkDetailModal } from './components/ParkDetailModal';
import { SimulationControlsModal } from './components/SimulationControlsModal';
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';

// Lazy load heavy components to optimize bundle size (Leaflet, Chart.js, Export tab)
const MapView = lazy(() =>
  import('./components/MapView').then((m) => ({ default: m.MapView }))
);
const HourlyPredictionTab = lazy(() =>
  import('./components/HourlyPredictionTab').then((m) => ({
    default: m.HourlyPredictionTab,
  }))
);
const ExportAndSettingsTab = lazy(() =>
  import('./components/ExportAndSettingsTab').then((m) => ({
    default: m.ExportAndSettingsTab,
  }))
);

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabId>('map');
  const [activity, setActivity] = useState<ActivityType>('running');
  const [isAllergyMode, setIsAllergyMode] = useState<boolean>(false);
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  const [parks, setParks] = useState<MadridPark[]>([]);
  const [selectedPark, setSelectedPark] = useState<MadridPark | null>(null);
  const [detailModalPark, setDetailModalPark] = useState<MadridPark | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSimModalOpen, setIsSimModalOpen] = useState<boolean>(false);
  const [dataSourceStatus, setDataSourceStatus] = useState<DataSourceStatus>(
    getDataSourceStatus()
  );

  // Geolocation State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationToast, setLocationToast] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAptitude, setSelectedAptitude] = useState('all');
  const [selectedSurface, setSelectedSurface] = useState('all');
  const [sortBy, setSortBy] = useState('score');

  // Simulation Overrides
  const [simParams, setSimParams] = useState<SimulationParams>({
    overrideTemp: null,
    overrideRain: null,
    overrideAqi: null,
    overridePollen: null,
  });

  const isSimulating =
    simParams.overrideTemp !== null && simParams.overrideTemp !== undefined ||
    simParams.overrideRain !== null && simParams.overrideRain !== undefined ||
    simParams.overrideAqi !== null && simParams.overrideAqi !== undefined ||
    simParams.overridePollen !== null && simParams.overridePollen !== undefined;

  // Load data callback
  const loadData = useCallback(
    async (
      simOver?: SimulationParams,
      allergyState?: boolean,
      coords?: { lat: number; lng: number } | null
    ) => {
      setIsLoading(true);
      try {
        const mode = allergyState !== undefined ? allergyState : isAllergyMode;
        const currentCoords = coords !== undefined ? coords : userLocation;
        const data = await fetchMadridParksData(activity, simOver ?? simParams, mode, currentCoords);
        setParks(data);
        setDataSourceStatus(getDataSourceStatus());

        if (selectedPark) {
          const found = data.find((p) => p.id === selectedPark.id);
          if (found) setSelectedPark(found);
        } else if (data.length > 0) {
          setSelectedPark(data[0]);
        }
      } catch (e) {
        console.error('Error fetching Madrid parks data:', e);
        setDataSourceStatus(getDataSourceStatus());
      } finally {
        setIsLoading(false);
      }
    },
    [activity, simParams, isAllergyMode, userLocation, selectedPark]
  );

  // Initial load
  useEffect(() => {
    loadData(simParams, isAllergyMode, userLocation);
  }, [activity, simParams, isAllergyMode]);

  // Phase 1 requirement 6: Auto-refresh every 5 minutes and on visibilitychange
  useEffect(() => {
    const interval = setInterval(() => {
      loadData(simParams, isAllergyMode, userLocation);
    }, 5 * 60 * 1000); // 5 min

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadData(simParams, isAllergyMode, userLocation);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [loadData, simParams, isAllergyMode, userLocation]);

  // Request browser geolocation with fallback to Madrid center (Puerta del Sol)
  const handleRequestLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      const fallback = { lat: 40.4168, lng: -3.7038 };
      setUserLocation(fallback);
      loadData(simParams, isAllergyMode, fallback);
      setIsLocating(false);
      setLocationToast('📍 Geolocalización no soportada. Usando centro de Madrid (Puerta del Sol).');
      setTimeout(() => setLocationToast(null), 5000);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(coords);
        loadData(simParams, isAllergyMode, coords);
        setIsLocating(false);
        setLocationToast(
          '📍 Ubicación fijada. Calculadas distancias Haversine a los parques más limpios en 3 km.'
        );
        setTimeout(() => setLocationToast(null), 5000);
      },
      () => {
        const fallback = { lat: 40.4168, lng: -3.7038 };
        setUserLocation(fallback);
        loadData(simParams, isAllergyMode, fallback);
        setIsLocating(false);
        setLocationToast('📍 Permiso GPS omitido. Usando centro de Madrid (Puerta del Sol).');
        setTimeout(() => setLocationToast(null), 5000);
      },
      { timeout: 7000 }
    );
  };

  // Filtered & Sorted Parks (Phase 2 & 3: handle null values properly)
  const filteredParks = useMemo(() => {
    let result = [...parks];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q) ||
          p.highlights.some((h) => h.toLowerCase().includes(q)) ||
          p.allergenicFlora.some((f) => f.toLowerCase().includes(q))
      );
    }

    if (selectedAptitude === 'optimo') {
      result = result.filter((p) => p.exerciseScore !== null && p.exerciseScore >= 80 && !p.isHighPollutionZone);
    } else if (selectedAptitude === 'aceptable') {
      result = result.filter(
        (p) => p.exerciseScore !== null && p.exerciseScore >= 50 && p.exerciseScore < 80 && !p.isHighPollutionZone
      );
    } else if (selectedAptitude === 'evitar') {
      result = result.filter((p) => p.isHighPollutionZone || (p.exerciseScore !== null && p.exerciseScore < 50));
    } else if (selectedAptitude === 'alergia-baja') {
      result = result.filter(
        (p) => p.pollenInfo.riskLevel === 'low' || p.pollenInfo.riskLevel === 'moderate'
      );
    } else if (selectedAptitude === 'cercanos' && userLocation) {
      result = result.filter((p) => (p.userDistanceKm ?? 99) <= 4.0);
    }

    if (selectedSurface !== 'all') {
      result = result.filter((p) => p.circuitType === selectedSurface);
    }

    result.sort((a, b) => {
      if (sortBy === 'distance' && userLocation) {
        return (a.userDistanceKm ?? 99) - (b.userDistanceKm ?? 99);
      }
      if (sortBy === 'score') {
        const scoreA = a.exerciseScore ?? -1;
        const scoreB = b.exerciseScore ?? -1;
        return scoreB - scoreA;
      }
      if (sortBy === 'air') {
        const aqiA = a.airQuality.aqi ?? 999;
        const aqiB = b.airQuality.aqi ?? 999;
        return aqiA - aqiB;
      }
      if (sortBy === 'pollen') {
        return a.pollenInfo.pollenScore - b.pollenInfo.pollenScore;
      }
      if (sortBy === 'perimeter') {
        return b.perimeterKm - a.perimeterKm;
      }
      if (sortBy === 'area') {
        return b.areaHa - a.areaHa;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return result;
  }, [parks, searchQuery, selectedAptitude, selectedSurface, sortBy, userLocation]);

  const handleResetSimulation = () => {
    const emptyParams: SimulationParams = {
      overrideTemp: null,
      overrideRain: null,
      overrideAqi: null,
      overridePollen: null,
    };
    setSimParams(emptyParams);
    loadData(emptyParams, isAllergyMode, userLocation);
  };

  return (
    <div
      className={`min-h-screen transition-colors pb-20 md:pb-10 ${
        isHighContrast
          ? 'bg-[#ffffff] text-black selection:bg-[#ff5500] selection:text-white'
          : 'bg-[#0a0a0a] text-white selection:bg-[#ff5500] selection:text-white'
      } flex flex-col font-sans`}
    >
      {/* Brand Navbar */}
      <Navbar
        onOpenSimulation={() => setIsSimModalOpen(true)}
        onRefresh={() => loadData(simParams, isAllergyMode, userLocation)}
        isSimulating={isSimulating}
        isHighContrast={isHighContrast}
        onToggleHighContrast={() => setIsHighContrast(!isHighContrast)}
        dataSourceStatus={dataSourceStatus}
      />

      {/* FIXED 5-TAB BAR NAVIGATION (Desktop Sticky & Mobile Fixed Bar) */}
      <NavigationTabBar
        activeTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isHighContrast={isHighContrast}
        isAllergyActive={isAllergyMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Location Toast Notification */}
        {locationToast && (
          <div className="p-3.5 rounded-2xl bg-sky-950/80 border border-sky-500/40 text-sky-200 text-xs flex items-center justify-between gap-3 shadow-xl animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{locationToast}</span>
            </div>
            <button
              onClick={() => setLocationToast(null)}
              className="text-sky-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Simulation Banner if Active */}
        {isSimulating && (
          <div className="p-3.5 rounded-2xl bg-[#ff5500]/10 border border-[#ff5500]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#ff5500] animate-pulse"></span>
              <span className="text-[#ff5500] font-bold uppercase tracking-wider font-mono">
                SIMULACIÓN ACTIVA:
              </span>
              <span className="text-neutral-200">
                {simParams.overrideTemp !== null &&
                  simParams.overrideTemp !== undefined &&
                  `Temp: ${simParams.overrideTemp}°C • `}
                {simParams.overrideRain !== null &&
                  simParams.overrideRain !== undefined &&
                  (simParams.overrideRain ? 'Lluvia activada • ' : 'Seco • ')}
                {simParams.overrideAqi !== null &&
                  simParams.overrideAqi !== undefined &&
                  `Aire: ${simParams.overrideAqi} • `}
                {simParams.overridePollen !== null &&
                  simParams.overridePollen !== undefined &&
                  `Polen: ${simParams.overridePollen}`}
              </span>
            </div>
            <button
              onClick={handleResetSimulation}
              className="text-xs font-bold text-black bg-[#ff5500] hover:bg-[#ff6600] px-3 py-1 rounded-lg self-start sm:self-auto cursor-pointer"
            >
              Volver a Datos Reales
            </button>
          </div>
        )}

        {/* =========================================================================
            PESTAÑA 1: 🗺️ MAPA & PARQUES
        ========================================================================= */}
        {currentTab === 'map' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top 3 Cleanest Parks Near User (Haversine Formula) */}
            <NearbyCleanestParks
              parks={parks}
              userLocation={userLocation}
              onRequestLocation={handleRequestLocation}
              isLocating={isLocating}
              onSelectPark={(p) => setSelectedPark(p)}
              selectedPark={selectedPark}
              isHighContrast={isHighContrast}
            />

            {/* Interactive Leaflet Map View (Lazy Loaded) */}
            <div className="space-y-3">
              <Suspense
                fallback={
                  <div className="w-full h-[420px] rounded-3xl bg-neutral-950 border border-neutral-800 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-[#ff5500] animate-spin" />
                  </div>
                }
              >
                <MapView
                  parks={filteredParks}
                  selectedPark={selectedPark}
                  onSelectPark={(p) => setSelectedPark(p)}
                  activity={activity}
                  isAllergyMode={isAllergyMode}
                  userLocation={userLocation}
                  onRequestLocation={handleRequestLocation}
                  isLocating={isLocating}
                  isHighContrast={isHighContrast}
                />
              </Suspense>
            </div>

            {/* Filters & Park Cards */}
            <div className="space-y-6 pt-4 border-t border-neutral-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#ff5500] font-['Montserrat',sans-serif]">
                    DIRECTORIO MUNICIPAL
                  </span>
                  <h3 className="text-xl font-black font-['Montserrat',sans-serif]">
                    Parques y Circuitos Deportivos ({filteredParks.length})
                  </h3>
                </div>
              </div>

              <ParkFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedAptitude={selectedAptitude}
                onAptitudeChange={setSelectedAptitude}
                selectedSurface={selectedSurface}
                onSurfaceChange={setSelectedSurface}
                sortBy={sortBy}
                onSortChange={setSortBy}
                totalParksCount={parks.length}
                filteredCount={filteredParks.length}
                isAllergyMode={isAllergyMode}
              />

              {filteredParks.length === 0 ? (
                <div
                  className={`text-center py-16 border rounded-3xl p-8 ${
                    isHighContrast ? 'bg-white border-black text-black' : 'bg-neutral-950 border-neutral-800'
                  }`}
                >
                  <AlertCircle className="w-10 h-10 text-neutral-500 mx-auto mb-3" />
                  <h4 className="text-lg font-bold mb-1">
                    No se encontraron parques con los filtros seleccionados
                  </h4>
                  <p className="text-xs text-neutral-400 mb-4">
                    Prueba a ajustar tu búsqueda o seleccionar "Todos" en el filtro.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedAptitude('all');
                      setSelectedSurface('all');
                    }}
                    className="px-4 py-2 bg-[#ff5500] text-black text-xs font-extrabold rounded-xl cursor-pointer"
                  >
                    Restablecer Filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredParks.map((park) => (
                    <ParkCard
                      key={park.id}
                      park={park}
                      isSelected={selectedPark?.id === park.id}
                      activity={activity}
                      isAllergyMode={isAllergyMode}
                      onSelect={(p) => setSelectedPark(p)}
                      onOpenDetails={(p) => setDetailModalPark(p)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            PESTAÑA 2: ⚠️ ZONAS A EVITAR & POLEN
        ========================================================================= */}
        {currentTab === 'avoid' && (
          <div className="space-y-6 animate-fade-in">
            {/* Panel con las 3 zonas/estaciones más contaminadas en tiempo real */}
            <HighPollutionAlertPanel
              parks={parks}
              onSelectPark={(p) => setSelectedPark(p)}
              onOpenDetails={(p) => setDetailModalPark(p)}
            />

            {/* Conmutador Modo Alergia & Dispersión de Polen cruzando flora con viento y humedad */}
            <AllergyModule
              isAllergyMode={isAllergyMode}
              onToggleAllergyMode={(enabled) => {
                setIsAllergyMode(enabled);
                loadData(simParams, enabled, userLocation);
              }}
              parks={parks}
              onSelectPark={(p) => setSelectedPark(p)}
            />
          </div>
        )}

        {/* =========================================================================
            PESTAÑA 3: 🏃🏻‍♂️ EQUIPACIÓN & PLANIFICADOR
        ========================================================================= */}
        {currentTab === 'outfit' && (
          <div className="space-y-6 animate-fade-in">
            {/* Selector de Actividad: Correr (+10°C) vs Andar */}
            <ActivitySelector activity={activity} onChange={setActivity} />

            {/* Recomendador Inteligente de Ropa según Sensación Térmica */}
            <OutfitAdvisorSection
              selectedPark={selectedPark}
              activity={activity}
              isAllergyMode={isAllergyMode}
            />

            {/* Calculadora de Estimación de Contaminación Inhalada (30 min vs 60 min vs 90 min) */}
            <InhaledDoseCalculator
              selectedPark={selectedPark}
              activity={activity}
              isHighContrast={isHighContrast}
            />
          </div>
        )}

        {/* =========================================================================
            PESTAÑA 4: 📈 PREDICCIÓN HORARIA
        ========================================================================= */}
        {currentTab === 'hourly' && (
          <div className="space-y-6 animate-fade-in">
            <Suspense
              fallback={
                <div className="w-full h-80 rounded-3xl bg-neutral-950 border border-neutral-800 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-[#ff5500] animate-spin" />
                </div>
              }
            >
              <HourlyPredictionTab
                selectedPark={selectedPark}
                parks={parks}
                onSelectPark={(p) => setSelectedPark(p)}
                isHighContrast={isHighContrast}
              />
            </Suspense>
          </div>
        )}

        {/* =========================================================================
            PESTAÑA 5: ⚙️ EXPORTAR & AJUSTES
        ========================================================================= */}
        {currentTab === 'settings' && (
          <div className="space-y-6 animate-fade-in">
            <Suspense
              fallback={
                <div className="w-full h-80 rounded-3xl bg-neutral-950 border border-neutral-800 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-[#ff5500] animate-spin" />
                </div>
              }
            >
              <ExportAndSettingsTab
                parks={parks}
                selectedPark={selectedPark}
                onSelectPark={(p) => setSelectedPark(p)}
                isHighContrast={isHighContrast}
                onToggleHighContrast={() => setIsHighContrast(!isHighContrast)}
                simParams={simParams}
                onUpdateSimParams={(params) => {
                  setSimParams(params);
                  loadData(params, isAllergyMode, userLocation);
                }}
                onResetSimParams={handleResetSimulation}
                onRefreshData={() => loadData(simParams, isAllergyMode, userLocation)}
              />
            </Suspense>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className={`border-t mt-12 py-8 text-xs transition-colors ${
          isHighContrast
            ? 'bg-neutral-100 border-black text-black'
            : 'border-neutral-900 bg-[#0c0c0c] text-neutral-500'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span
              className={`font-black font-['Montserrat',sans-serif] ${
                isHighContrast ? 'text-black' : 'text-white'
              }`}
            >
              FitAir Parks Madrid Pro
            </span>
            <span>•</span>
            <span>Navegación por Pestañas 1 a 5</span>
          </div>

          <p className="text-center sm:text-right text-[11px] text-neutral-400">
            Fórmula Haversine en JS • Red de Calidad del Aire del Ayuntamiento de Madrid • Exportación de rutas GPX para relojes deportivos.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <ParkDetailModal
        park={detailModalPark}
        activity={activity}
        isAllergyMode={isAllergyMode}
        isOpen={Boolean(detailModalPark)}
        onClose={() => setDetailModalPark(null)}
        onSelectAsActive={(p) => setSelectedPark(p)}
      />

      <SimulationControlsModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        simParams={simParams}
        onUpdateSimParams={(p) => {
          setSimParams(p);
          loadData(p, isAllergyMode, userLocation);
        }}
        onReset={handleResetSimulation}
      />
    </div>
  );
}
