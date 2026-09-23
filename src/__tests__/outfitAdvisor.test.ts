import { describe, it, expect } from 'vitest';
import { calculateOutfit } from '../services/outfitAdvisor';

describe('Outfit Advisor with physiological metabolic adjustments', () => {
  it('applies the +10°C rule for running', () => {
    // 8°C real temp -> running feels like 18°C
    const outfit = calculateOutfit('running', 8, false, 5, false);
    expect(outfit.perceivedEffortTemp).toBe(18);
    expect(outfit.temperature).toBe(8);
    expect(outfit.garments.length).toBeGreaterThan(0);
  });

  it('keeps raw apparent temperature for walking (no +10°C boost)', () => {
    // 8°C real temp -> walking perceived is 8°C
    const outfit = calculateOutfit('walking', 8, false, 5, false);
    expect(outfit.perceivedEffortTemp).toBe(8);
    expect(outfit.temperature).toBe(8);
  });

  it('handles null temperature gracefully without crashing', () => {
    const outfit = calculateOutfit('running', null, false, 10, false);
    expect(outfit.temperature).toBeNull();
    expect(outfit.perceivedEffortTemp).toBeNull();
    expect(outfit.overallAdvice).toContain('Sin telemetría');
  });

  it('recommends waterproof protection when it is raining', () => {
    const outfit = calculateOutfit('running', 14, true, 10, false);
    const hasRainProtection = outfit.garments.some(
      (g) =>
        g.name.toLowerCase().includes('chubasquero') ||
        g.name.toLowerCase().includes('impermeable') ||
        g.description.toLowerCase().includes('lluvia') ||
        g.description.toLowerCase().includes('repelente')
    );
    expect(hasRainProtection).toBe(true);
  });

  it('recommends wind protection when wind is strong (>25 km/h)', () => {
    const outfit = calculateOutfit('running', 12, false, 30, false);
    const hasWindProtection = outfit.garments.some(
      (g) =>
        g.name.toLowerCase().includes('cortavientos') ||
        g.description.toLowerCase().includes('viento')
    );
    expect(hasWindProtection).toBe(true);
  });

  it('recommends allergy accessories for active allergy mode', () => {
    const outfit = calculateOutfit('running', 18, false, 10, true);
    const hasAllergyItem = outfit.garments.some(
      (g) =>
        g.name.toLowerCase().includes('gafas') ||
        g.name.toLowerCase().includes('mascarilla') ||
        g.description.toLowerCase().includes('polen') ||
        g.description.toLowerCase().includes('alergia')
    );
    expect(hasAllergyItem).toBe(true);
  });
});
