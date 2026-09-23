import { describe, it, expect } from 'vitest';
import { calculateEEAAirQuality } from '../services/eeaAirQuality';

describe('EEA Air Quality Index (European Environment Agency)', () => {
  it('should return null / no_data when all pollutants are null', () => {
    const result = calculateEEAAirQuality({ no2: null, pm10: null, pm25: null, o3: null });
    expect(result.level).toBe('no_data');
    expect(result.normalizedScore).toBeNull();
    expect(result.levelLabel).toBe('Sin datos');
    expect(result.overallBand).toBeNull();
  });

  it('correctly calculates Good / Muy bueno when NO2 is low and other pollutants are absent', () => {
    // NO2 = 25 is within [0, 40] -> Band 1 (Good)
    const result = calculateEEAAirQuality({ no2: 25, pm10: null, pm25: null, o3: null });
    expect(result.level).toBe('good');
    expect(result.overallBand).toBe(1);
    expect(result.normalizedScore).toBeGreaterThanOrEqual(90);
    expect(result.levelLabel).toBe('Muy bueno');
    expect(result.subIndices.no2?.band).toBe(1);
  });

  it('correctly determines global index as the WORST sub-index', () => {
    // NO2 = 30 (Band 1: Good), PM10 = 110 (Band 5: Very poor [100, 150])
    const result = calculateEEAAirQuality({ no2: 30, pm10: 110, pm25: null, o3: null });
    expect(result.level).toBe('very_poor');
    expect(result.overallBand).toBe(5);
    expect(result.subIndices.pm10?.band).toBe(5);
    expect(result.worstPollutant).toBe('PM10');
  });

  it('correctly classifies extreme pollution as very_poor or extremely_poor', () => {
    // NO2 = 350 (Extremely poor > 340 -> Band 6)
    const result = calculateEEAAirQuality({ no2: 350 });
    expect(result.level).toBe('extremely_poor');
    expect(result.overallBand).toBe(6);
    expect(result.normalizedScore).toBeLessThanOrEqual(15);
  });

  it('treats 0 as a valid measurement, NOT as missing/null', () => {
    // 0 ug/m3 is clean air, level should be good, NOT no_data
    const result = calculateEEAAirQuality({ no2: 0, pm10: 0, pm25: 0, o3: 0 });
    expect(result.level).toBe('good');
    expect(result.overallBand).toBe(1);
    expect(result.normalizedScore).toBe(95);
    expect(result.subIndices.no2).toBeDefined();
  });
});
