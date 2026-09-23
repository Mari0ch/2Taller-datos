/**
 * Official European Air Quality Index (EEA) calculation
 *
 * Citation:
 * Directive 2008/50/EC of the European Parliament and of the Council on ambient air quality and cleaner air for Europe.
 * European Environment Agency (EEA): "European Air Quality Index"
 * Official bands and methodology: https://www.eea.europa.eu/themes/air/air-quality-index
 *
 * The European Air Quality Index uses 6 status bands (1 to 6) based on 1-hour or running average concentrations:
 * 1: Good (Muy bueno)
 * 2: Fair (Bueno)
 * 3: Moderate (Moderado)
 * 4: Poor (Desfavorable)
 * 5: Very poor (Muy desfavorable)
 * 6: Extremely poor (Extremadamente desfavorable)
 *
 * The overall index corresponds to the poorest (maximum) sub-index among all monitored pollutants.
 */

import { AirQualityLevel } from '../types';

export interface EEASubIndex {
  pollutant: 'NO2' | 'PM10' | 'PM25' | 'O3' | 'SO2';
  value: number;
  band: number; // 1 to 6
  level: AirQualityLevel;
  levelLabel: string;
}

export interface EEACalculationResult {
  overallBand: number | null; // 1 to 6, or null if no pollutant available
  level: AirQualityLevel;
  levelLabel: string;
  normalizedScore: number | null; // 0 to 100 scale (100 = cleanest, 0 = extremely poor), or null
  worstPollutant: 'NO2' | 'PM10' | 'PM25' | 'O3' | 'SO2' | null;
  subIndices: {
    no2?: EEASubIndex;
    pm10?: EEASubIndex;
    pm25?: EEASubIndex;
    o3?: EEASubIndex;
    so2?: EEASubIndex;
  };
}

/**
 * Bands for NO2 (1-hour concentration in µg/m³)
 * 1: 0 - 40
 * 2: 40 - 90
 * 3: 90 - 120
 * 4: 120 - 230
 * 5: 230 - 340
 * 6: > 340
 */
export function getNO2Band(val: number | null): number | null {
  if (val === null || isNaN(val) || val < 0) return null;
  if (val <= 40) return 1;
  if (val <= 90) return 2;
  if (val <= 120) return 3;
  if (val <= 230) return 4;
  if (val <= 340) return 5;
  return 6;
}

/**
 * Bands for PM10 (24-hour running or 1-hour indicative in µg/m³)
 * 1: 0 - 20
 * 2: 20 - 40
 * 3: 40 - 50
 * 4: 50 - 100
 * 5: 100 - 150
 * 6: > 150
 */
export function getPM10Band(val: number | null): number | null {
  if (val === null || isNaN(val) || val < 0) return null;
  if (val <= 20) return 1;
  if (val <= 40) return 2;
  if (val <= 50) return 3;
  if (val <= 100) return 4;
  if (val <= 150) return 5;
  return 6;
}

/**
 * Bands for PM2.5 (24-hour running or 1-hour indicative in µg/m³)
 * 1: 0 - 10
 * 2: 10 - 20
 * 3: 20 - 25
 * 4: 25 - 50
 * 5: 50 - 75
 * 6: > 75
 */
export function getPM25Band(val: number | null): number | null {
  if (val === null || isNaN(val) || val < 0) return null;
  if (val <= 10) return 1;
  if (val <= 20) return 2;
  if (val <= 25) return 3;
  if (val <= 50) return 4;
  if (val <= 75) return 5;
  return 6;
}

/**
 * Bands for O3 (1-hour concentration in µg/m³)
 * 1: 0 - 50
 * 2: 50 - 100
 * 3: 100 - 130
 * 4: 130 - 240
 * 5: 240 - 380
 * 6: > 380
 */
export function getO3Band(val: number | null): number | null {
  if (val === null || isNaN(val) || val < 0) return null;
  if (val <= 50) return 1;
  if (val <= 100) return 2;
  if (val <= 130) return 3;
  if (val <= 240) return 4;
  if (val <= 380) return 5;
  return 6;
}

export function getBandDetails(band: number): { level: AirQualityLevel; label: string } {
  switch (band) {
    case 1:
      return { level: 'good', label: 'Muy bueno' };
    case 2:
      return { level: 'good', label: 'Bueno' };
    case 3:
      return { level: 'moderate', label: 'Moderado' };
    case 4:
      return { level: 'poor', label: 'Desfavorable' };
    case 5:
      return { level: 'very_poor', label: 'Muy desfavorable' };
    case 6:
      return { level: 'extremely_poor', label: 'Extremadamente desfavorable' };
    default:
      return { level: 'no_data', label: 'Sin datos' };
  }
}

/**
 * Computes European Air Quality Index based on available pollutants
 */
export function calculateEEAAirQuality(pollutants: {
  no2?: number | null;
  pm10?: number | null;
  pm25?: number | null;
  o3?: number | null;
}): EEACalculationResult {
  const subIndices: EEACalculationResult['subIndices'] = {};
  let maxBand = 0;
  let worstPollutant: EEACalculationResult['worstPollutant'] = null;

  const validEntries: { name: 'NO2' | 'PM10' | 'PM25' | 'O3'; val: number; band: number }[] = [];

  if (pollutants.no2 !== undefined && pollutants.no2 !== null) {
    const band = getNO2Band(pollutants.no2);
    if (band !== null) {
      const details = getBandDetails(band);
      subIndices.no2 = {
        pollutant: 'NO2',
        value: pollutants.no2,
        band,
        level: details.level,
        levelLabel: details.label,
      };
      validEntries.push({ name: 'NO2', val: pollutants.no2, band });
    }
  }

  if (pollutants.pm10 !== undefined && pollutants.pm10 !== null) {
    const band = getPM10Band(pollutants.pm10);
    if (band !== null) {
      const details = getBandDetails(band);
      subIndices.pm10 = {
        pollutant: 'PM10',
        value: pollutants.pm10,
        band,
        level: details.level,
        levelLabel: details.label,
      };
      validEntries.push({ name: 'PM10', val: pollutants.pm10, band });
    }
  }

  if (pollutants.pm25 !== undefined && pollutants.pm25 !== null) {
    const band = getPM25Band(pollutants.pm25);
    if (band !== null) {
      const details = getBandDetails(band);
      subIndices.pm25 = {
        pollutant: 'PM25',
        value: pollutants.pm25,
        band,
        level: details.level,
        levelLabel: details.label,
      };
      validEntries.push({ name: 'PM25', val: pollutants.pm25, band });
    }
  }

  if (pollutants.o3 !== undefined && pollutants.o3 !== null) {
    const band = getO3Band(pollutants.o3);
    if (band !== null) {
      const details = getBandDetails(band);
      subIndices.o3 = {
        pollutant: 'O3',
        value: pollutants.o3,
        band,
        level: details.level,
        levelLabel: details.label,
      };
      validEntries.push({ name: 'O3', val: pollutants.o3, band });
    }
  }

  if (validEntries.length === 0) {
    return {
      overallBand: null,
      level: 'no_data',
      levelLabel: 'Sin datos',
      normalizedScore: null,
      worstPollutant: null,
      subIndices,
    };
  }

  // Official EEA rule: the index corresponds to the poorest (maximum) level for any of the pollutants
  for (const entry of validEntries) {
    if (entry.band > maxBand) {
      maxBand = entry.band;
      worstPollutant = entry.name;
    }
  }

  const bandDetails = getBandDetails(maxBand);

  // Linear continuous score (0 - 100) reflecting position within band
  // Band 1 -> 90-100, Band 2 -> 75-89, Band 3 -> 55-74, Band 4 -> 35-54, Band 5 -> 15-34, Band 6 -> 0-14
  let normalizedScore = 100;
  if (maxBand === 1) normalizedScore = 95;
  else if (maxBand === 2) normalizedScore = 80;
  else if (maxBand === 3) normalizedScore = 60;
  else if (maxBand === 4) normalizedScore = 40;
  else if (maxBand === 5) normalizedScore = 20;
  else normalizedScore = 5;

  return {
    overallBand: maxBand,
    level: bandDetails.level,
    levelLabel: bandDetails.label,
    normalizedScore,
    worstPollutant,
    subIndices,
  };
}

/**
 * Exercise suitability calculator based on EEA bands, weather and sports science
 * Returns null score and "No disponible" recommendation if air quality data is missing.
 */
export function calculateExerciseSuitability(
  airResult: EEACalculationResult,
  weather: {
    temperature: number | null;
    windSpeed: number | null;
    isRaining: boolean;
  },
  pollenScore = 15
): {
  exerciseScore: number | null;
  exerciseRecommendation: 'Óptimo' | 'Aceptable' | 'Precaución' | 'Desfavorable' | 'No disponible';
  suitabilityReason: string;
} {
  // If air data is missing, we must NOT invent a score
  if (airResult.overallBand === null || airResult.normalizedScore === null) {
    return {
      exerciseScore: null,
      exerciseRecommendation: 'No disponible',
      suitabilityReason: 'Sin telemetría de calidad del aire disponible en las estaciones del entorno.',
    };
  }

  let score = airResult.normalizedScore;

  // Temperature penalty
  if (weather.temperature !== null) {
    if (weather.temperature > 32) score -= 25;
    else if (weather.temperature > 28) score -= 15;
    else if (weather.temperature < 0) score -= 15;
    else if (weather.temperature < 5) score -= 8;
  }

  // Rain penalty
  if (weather.isRaining) {
    score -= 15;
  }

  // Wind penalty (> 35 km/h)
  if (weather.windSpeed !== null && weather.windSpeed > 35) {
    score -= 15;
  }

  // High pollen penalty
  if (pollenScore > 65) {
    score -= 10;
  }

  const finalScore = Math.max(5, Math.min(100, Math.round(score)));

  let exerciseRecommendation: 'Óptimo' | 'Aceptable' | 'Precaución' | 'Desfavorable' = 'Óptimo';
  let suitabilityReason = 'Condiciones ambientales excelentes para el entrenamiento al aire libre.';

  if (airResult.overallBand >= 5 || finalScore < 35) {
    exerciseRecommendation = 'Desfavorable';
    suitabilityReason = `Nivel ${airResult.levelLabel.toLowerCase()} de calidad del aire (${airResult.worstPollutant || 'contaminación'}). No recomendado para entrenamientos de alta intensidad.`;
  } else if (airResult.overallBand === 4 || finalScore < 55) {
    exerciseRecommendation = 'Precaución';
    suitabilityReason = `Calidad del aire desfavorable o meteorología adversa. Se recomienda reducir la intensidad del ejercicio o caminar en lugar de correr.`;
  } else if (airResult.overallBand === 3 || finalScore < 75) {
    exerciseRecommendation = 'Aceptable';
    suitabilityReason = 'Condiciones aptas para deporte aeróbico con vigilancia en personas sensibles.';
  }

  return {
    exerciseScore: finalScore,
    exerciseRecommendation,
    suitabilityReason,
  };
}
