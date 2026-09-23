import { describe, it, expect } from 'vitest';
import { calculateBotanicalPollen } from '../services/pollenSeasonality';

describe('Botanical Pollen Seasonality (Phenology Model)', () => {
  const platanusFlora = ['Plátano de sombra (Platanus x hispanica)', 'Ciprés'];

  it('reports high pollen risk during Platanus peak season in March/April (months 2 and 3)', () => {
    // Month 3 = April
    const result = calculateBotanicalPollen(platanusFlora, 10, 35, 3);
    expect(result.riskLevel).toBe('high');
    expect(result.pollenScore).toBeGreaterThanOrEqual(60);
    expect(result.dominantSpecies.some((s) => s.includes('Plátano'))).toBe(true);
  });

  it('reports low pollen risk for Platanus outside its pollination window (e.g. October, month 9)', () => {
    // Month 9 = October
    const result = calculateBotanicalPollen(platanusFlora, 10, 50, 9);
    expect(result.riskLevel).toBe('low');
    expect(result.pollenScore).toBeLessThanOrEqual(30);
  });

  it('increases dispersion factor on dry windy days (>20 km/h and <40% humidity)', () => {
    const calm = calculateBotanicalPollen(platanusFlora, 5, 70, 3);
    const windyDry = calculateBotanicalPollen(platanusFlora, 25, 30, 3);
    expect(windyDry.pollenScore).toBeGreaterThan(calm.pollenScore);
    expect(windyDry.dispersionFactor).toContain('Viento activo');
  });

  it('washes away pollen when raining (isRaining = true)', () => {
    const dry = calculateBotanicalPollen(platanusFlora, 10, 60, 3, false);
    const rainy = calculateBotanicalPollen(platanusFlora, 10, 60, 3, true);
    expect(rainy.pollenScore).toBeLessThan(dry.pollenScore);
    expect(rainy.dispersionFactor).toContain('Lavado atmosférico por lluvia');
  });
});
