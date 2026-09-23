export type ActivityType = 'running' | 'walking';

export type AirQualityLevel =
  | 'good'
  | 'fair'
  | 'moderate'
  | 'poor'
  | 'unfavorable'
  | 'very_poor'
  | 'extremely_poor'
  | 'no_data';

export type PollenRiskLevel = 'low' | 'moderate' | 'high' | 'extreme';

export interface AirPollutionData {
  aqi: number | null; // European Air Quality Index normalized score or null
  eeaBand?: number | null; // 1 (Muy bueno) to 6 (Extremadamente desfavorable)
  level: AirQualityLevel;
  levelLabel: string;
  no2: number | null; // µg/m³
  pm10: number | null; // µg/m³
  pm25: number | null; // µg/m³
  o3?: number | null; // µg/m³
  so2?: number | null; // µg/m³
  stationName: string;
  stationCode: string;
  lastUpdated: string | null; // Real measurement hour or timestamp
  isEstimatedFallback?: boolean;
  fallbackStationName?: string;
  dominantPollutant?: string | null;
  pm25StationName?: string;
  pm10StationName?: string;
}

export interface WeatherData {
  temperature: number | null; // °C
  apparentTemperature: number | null; // Steadman formula (°C)
  humidity: number | null; // %
  windSpeed: number | null; // km/h
  isRaining: boolean;
  rainIntensity?: 'none' | 'light' | 'moderate' | 'heavy';
  precipitationProbability?: number | null; // %
  weatherDescription: string;
  weatherCode?: number | null;
  stationName?: string;
  stationDistanceKm?: number;
  lastUpdated?: string | null;
}

export interface PollenData {
  riskLevel: PollenRiskLevel;
  riskLabel: string;
  pollenScore: number; // 0 - 100
  dominantSpecies: string[]; // ej. ['Plátano de sombra', 'Arizónica']
  dispersionFactor: string;
  allergyAdvice: string;
  isBotanicalEstimation: boolean; // Identifies botanical estimation vs direct clinical counter
}

export interface MadridPark {
  id: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
  areaHa: number;
  perimeterKm: number;
  circuitType: 'Tierra compactada' | 'Asfalto y tierra' | 'Pavimento técnico' | 'Senderos mixtos';
  difficulty: 'Fácil (Llano)' | 'Ondulado' | 'Exigente (Cuestas)';
  waterFountains: number;
  highlights: string[];
  nearestStation: string;
  stationCode: string;
  airQuality: AirPollutionData;
  weather: WeatherData;
  pollenInfo: PollenData;
  exerciseScore: number | null; // 0 - 100 or null if air quality data is missing
  exerciseRecommendation: 'Óptimo' | 'Aceptable' | 'Precaución' | 'Desfavorable' | 'No disponible';
  suitabilityReason: string;
  isHighPollutionZone: boolean;
  pollutionPeakReason?: string;
  allergenicFlora: string[];
  stationDistanceKm?: number;
  userDistanceKm?: number;
  perimeterCoordinates?: [number, number][] | null;
  hasRealGeometry?: boolean;
  hourlyEvolution?: {
    hour: string;
    no2: number | null;
    aqi: number | null;
    temperature: number | null;
    isOptimalWindow: boolean;
    note: string;
  }[];
  isSimulation?: boolean;
}

export interface DataSourceStatus {
  status: 'live' | 'stale' | 'error' | 'loading';
  statusLabel?: string;
  fetchedAt?: Date | string | null;
  lastFetchedAt?: string | null;
  minutesAgo?: number;
  dataTimestamp?: string | null;
  isSimulation?: boolean;
  airStatus?: 'live' | 'stale' | 'error';
  meteoStatus?: 'live' | 'stale' | 'error';
  parksStatus?: 'live' | 'stale' | 'error';
  source?: string;
}

export interface GarmentRecommendation {
  id: string;
  category: 'torso' | 'legs' | 'feet' | 'accessories';
  categoryLabel: string;
  name: string;
  description: string;
  iconName: string;
  isCrucial: boolean;
}

export interface OutfitRecommendation {
  activity: ActivityType;
  temperature: number | null;
  perceivedEffortTemp: number | null; // Temp + 10°C for running, Temp for walking
  isRaining: boolean;
  isAllergyMode: boolean;
  summaryRule: string;
  overallAdvice: string;
  garments: GarmentRecommendation[];
  healthTips: string[];
}
