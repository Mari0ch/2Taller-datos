export type ActivityType = 'running' | 'walking';

export type AirQualityLevel = 'good' | 'moderate' | 'unfavorable';

export type PollenRiskLevel = 'low' | 'moderate' | 'high' | 'extreme';

export interface AirPollutionData {
  aqi: number; // 0 - 200+ (ICA europeo / nacional)
  level: AirQualityLevel;
  levelLabel: string;
  no2: number; // µg/m³
  pm10: number; // µg/m³
  pm25: number; // µg/m³
  o3?: number; // µg/m³
  stationName: string;
  stationCode: string;
  lastUpdated: string;
}

export interface WeatherData {
  temperature: number; // °C
  apparentTemperature: number; // Sensación térmica base (°C)
  humidity: number; // %
  windSpeed: number; // km/h
  isRaining: boolean;
  rainIntensity?: 'none' | 'light' | 'moderate' | 'heavy';
  precipitationProbability: number; // %
  weatherDescription: string;
  weatherCode: number;
}

export interface PollenData {
  riskLevel: PollenRiskLevel;
  riskLabel: string;
  pollenScore: number; // 0 - 100
  dominantSpecies: string[]; // ej. ['Plátano de sombra', 'Arizónica']
  dispersionFactor: string; // ej. 'Alta dispersión por viento > 20 km/h y baja humedad'
  allergyAdvice: string;
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
  exerciseScore: number; // 0 - 100
  exerciseRecommendation: 'Óptimo' | 'Aceptable' | 'Precaución' | 'Desfavorable';
  suitabilityReason: string;
  isHighPollutionZone: boolean; // True si está entre las 3 zonas con peores índices de Madrid
  pollutionPeakReason?: string;
  allergenicFlora: string[];
  stationDistanceKm?: number; // Distance in km to monitoring station via Haversine
  userDistanceKm?: number; // Distance in km to user location via Haversine
  perimeterCoordinates?: [number, number][]; // GPS coordinates for GPX export & trail rendering
  hourlyEvolution?: {
    hour: string;
    no2: number;
    aqi: number;
    temperature: number;
    isOptimalWindow: boolean;
    note: string;
  }[];
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
  temperature: number;
  perceivedEffortTemp: number; // Temp + 10°C for running, Temp for walking
  isRaining: boolean;
  isAllergyMode: boolean;
  summaryRule: string;
  overallAdvice: string;
  garments: GarmentRecommendation[];
  healthTips: string[];
}
