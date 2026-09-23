import { describe, it, expect } from 'vitest';
import {
  haversineDistanceKm,
  findNearestStation,
  calculateApparentTemperature,
  generateGPXString,
} from '../services/haversine';

describe('Haversine distance and Geospatial helpers', () => {
  it('returns 0 distance for the exact same point', () => {
    const dist = haversineDistanceKm(40.4168, -3.7038, 40.4168, -3.7038);
    expect(dist).toBe(0);
  });

  it('accurately computes Madrid Sol to Retiro (~1.8 km)', () => {
    // Sol: 40.4168, -3.7038 | Retiro Center: 40.4153, -3.6845
    const dist = haversineDistanceKm(40.4168, -3.7038, 40.4153, -3.6845);
    expect(dist).toBeGreaterThan(1.4);
    expect(dist).toBeLessThan(2.0);
  });

  it('finds nearest air station for El Retiro (Station 49 - Retiro)', () => {
    const { station, distanceKm } = findNearestStation(40.4153, -3.6845);
    expect(station.stationNumber).toBe('49'); // Parque del Retiro
    expect(distanceKm).toBeLessThan(1.0);
  });
});

describe('Apparent Temperature (Standard Australian BOM formula)', () => {
  it('returns null when temperature is null', () => {
    expect(calculateApparentTemperature(null, 50, 10)).toBeNull();
  });

  it('calculates wind chill effect in cold and windy weather', () => {
    // 5°C with 40 km/h wind and 40% humidity feels colder
    const apparent = calculateApparentTemperature(5, 40, 40);
    expect(apparent).not.toBeNull();
    expect(apparent!).toBeLessThan(5);
  });

  it('calculates heat index effect in hot and humid weather', () => {
    // 34°C with 70% humidity and calm wind feels hotter
    const apparent = calculateApparentTemperature(34, 70, 5);
    expect(apparent).not.toBeNull();
    expect(apparent!).toBeGreaterThan(34);
  });

  it('handles 0°C as valid temperature', () => {
    const apparent = calculateApparentTemperature(0, 80, 15);
    expect(apparent).not.toBeNull();
  });
});

describe('GPX File Generation', () => {
  it('generates valid GPX XML structure for Garmin/Apple Watch', () => {
    const coords: [number, number][] = [
      [40.418, -3.695],
      [40.419, -3.694],
      [40.418, -3.693],
      [40.418, -3.695],
    ];
    const gpx = generateGPXString('Parque del Retiro', 4.5, coords);
    expect(gpx).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(gpx).toContain('<gpx version="1.1"');
    expect(gpx).toContain('<name>Parque del Retiro - Circuito Deportivo</name>');
    expect(gpx).toContain('lat="40.418" lon="-3.695"');
    expect(gpx).toContain('</trkpt>');
  });
});
