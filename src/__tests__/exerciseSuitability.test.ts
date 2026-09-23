import { describe, it, expect } from 'vitest';
import { calculateExerciseSuitability } from '../services/airQualityService';
import { AirPollutionData, WeatherData, PollenData } from '../types';

describe('Exercise Suitability Algorithm (Zero fake numbers)', () => {
  const baseWeather: WeatherData = {
    temperature: 18,
    apparentTemperature: 17,
    humidity: 45,
    windSpeed: 10,
    isRaining: false,
    precipitationProbability: null,
    weatherDescription: 'Despejado',
    stationName: 'Retiro Meteo',
  };

  const basePollen: PollenData = {
    riskLevel: 'low',
    riskLabel: 'Bajo',
    pollenScore: 15,
    dominantSpecies: ['Pino'],
    dispersionFactor: 'Viento suave',
    allergyAdvice: 'Condiciones favorables para alérgicos.',
    isBotanicalEstimation: true,
  };

  it('returns null score and "No disponible" recommendation when air quality is missing', () => {
    const missingAir: AirPollutionData = {
      aqi: null,
      level: 'no_data',
      levelLabel: 'Sin datos',
      no2: null,
      pm10: null,
      pm25: null,
      o3: null,
      stationName: 'Estación Sin Datos',
      stationCode: '28079099',
      lastUpdated: 'Sin datos',
    };

    const result = calculateExerciseSuitability(
      missingAir,
      baseWeather,
      'running',
      basePollen,
      false
    );

    expect(result.score).toBeNull();
    expect(result.recommendation).toBe('No disponible');
    expect(result.suitabilityReason).toContain('Sin datos telemétricos');
  });

  it('rates clean air and mild weather as Óptimo', () => {
    const cleanAir: AirPollutionData = {
      aqi: 18,
      level: 'good',
      levelLabel: 'Buena',
      no2: 22,
      pm10: 14,
      pm25: 6,
      o3: 40,
      stationName: 'Retiro',
      stationCode: '28079049',
      lastUpdated: '12:00',
    };

    const result = calculateExerciseSuitability(
      cleanAir,
      baseWeather,
      'running',
      basePollen,
      false
    );

    expect(result.score).not.toBeNull();
    expect(result.score!).toBeGreaterThanOrEqual(80);
    expect(result.recommendation).toBe('Óptimo');
  });

  it('drastically penalizes high NO2 pollution (>50 µg/m³)', () => {
    const pollutedAir: AirPollutionData = {
      aqi: 75,
      level: 'unfavorable',
      levelLabel: 'Desfavorable',
      no2: 65,
      pm10: 45,
      pm25: 25,
      o3: 20,
      stationName: 'Escuelas Aguirre',
      stationCode: '28079008',
      lastUpdated: '12:00',
    };

    const result = calculateExerciseSuitability(
      pollutedAir,
      baseWeather,
      'running',
      basePollen,
      false
    );

    expect(result.score).not.toBeNull();
    expect(result.score!).toBeLessThan(50);
    expect(result.recommendation).toBe('Desfavorable');
    expect(result.suitabilityReason).toContain('ZONA A EVITAR');
  });

  it('adjusts advice when allergy mode is enabled and pollen risk is high', () => {
    const cleanAir: AirPollutionData = {
      aqi: 20,
      level: 'good',
      levelLabel: 'Buena',
      no2: 15,
      pm10: 10,
      pm25: 5,
      o3: 30,
      stationName: 'Casa de Campo',
      stationCode: '28079024',
      lastUpdated: '12:00',
    };

    const highPollen: PollenData = {
      riskLevel: 'high',
      riskLabel: 'Alto',
      pollenScore: 78,
      dominantSpecies: ['Plátano de sombra'],
      dispersionFactor: 'Viento activo',
      allergyAdvice: 'Evitar zonas arboladas.',
      isBotanicalEstimation: true,
    };

    const result = calculateExerciseSuitability(
      cleanAir,
      baseWeather,
      'running',
      highPollen,
      true // allergy mode active
    );

    expect(result.score).not.toBeNull();
    expect(result.score!).toBeLessThan(80); // reduced due to allergy
    expect(result.suitabilityReason).toContain('polen');
  });
});
