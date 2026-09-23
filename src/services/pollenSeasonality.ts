/**
 * Madrid Aerobiology & Botanical Phenology Service
 *
 * Provides seasonal allergen estimation based on the phenology and botanical composition
 * of Madrid's parks (Cupressaceae, Platanus hispanica, Poaceae, Olea europaea, Pinus, Quercus).
 *
 * Labeling notice:
 * "Estimación botánica basada en fenología estacional, no medición de captador volumétrico directo."
 * In Madrid, daily volumetric pollen bulletins from PALINOCAM (Red Palinológica de la Comunidad de Madrid)
 * operate during the primary spring flowering seasons (February to June).
 */

import { PollenData, PollenRiskLevel } from '../types';

export interface SpeciesPhenology {
  speciesName: string;
  commonName: string;
  // Pollination weight by month (0 = Jan, 11 = Dec), normalized 0 to 1.0
  monthlyFactors: number[];
  allergenicity: 'alta' | 'media' | 'moderada';
}

export const MADRID_POLLEN_PHENOLOGY: Record<string, SpeciesPhenology> = {
  arizonica: {
    speciesName: 'Cupressus arizonica / sempervirens',
    commonName: 'Arizónica y Ciprés',
    // Peak: Jan - Mar
    monthlyFactors: [0.7, 1.0, 0.8, 0.2, 0.05, 0.0, 0.0, 0.0, 0.0, 0.0, 0.05, 0.3],
    allergenicity: 'alta',
  },
  platano: {
    speciesName: 'Platanus hispanica',
    commonName: 'Plátano de sombra',
    // Peak: Mar - Apr (concentrated explosive burst in Madrid)
    monthlyFactors: [0.0, 0.1, 0.8, 1.0, 0.2, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    allergenicity: 'alta',
  },
  gramineas: {
    speciesName: 'Poaceae',
    commonName: 'Gramíneas silvestres',
    // Peak: May - Jun
    monthlyFactors: [0.0, 0.0, 0.1, 0.4, 1.0, 0.85, 0.25, 0.05, 0.05, 0.0, 0.0, 0.0],
    allergenicity: 'alta',
  },
  olivo: {
    speciesName: 'Olea europaea',
    commonName: 'Olivo',
    // Peak: May - Jun
    monthlyFactors: [0.0, 0.0, 0.0, 0.1, 0.9, 1.0, 0.15, 0.0, 0.0, 0.0, 0.0, 0.0],
    allergenicity: 'alta',
  },
  malezas: {
    speciesName: 'Chenopodiaceae / Artemisia / Parietaria',
    commonName: 'Malezas y Cenizos',
    // Peak: Aug - Oct
    monthlyFactors: [0.0, 0.0, 0.05, 0.1, 0.2, 0.3, 0.5, 0.8, 1.0, 0.7, 0.1, 0.0],
    allergenicity: 'media',
  },
  pino: {
    speciesName: 'Pinus halepensis / pinea',
    commonName: 'Pino piñonero y carrasco',
    // Peak: Mar - May
    monthlyFactors: [0.0, 0.1, 0.5, 0.9, 0.6, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    allergenicity: 'moderada',
  },
  encina: {
    speciesName: 'Quercus ilex / faginea',
    commonName: 'Encina y Quejigo',
    // Peak: Apr - May
    monthlyFactors: [0.0, 0.0, 0.2, 0.85, 0.95, 0.2, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    allergenicity: 'media',
  },
};

/**
 * Calculates seasonal pollen risk for a park given its botanical flora,
 * weather conditions and the current month.
 */
export function calculatePollenRisk(
  parkFlora: string[],
  weather: {
    windSpeed: number | null;
    humidity: number | null;
    isRaining: boolean;
  },
  targetDate = new Date()
): PollenData {
  const month = targetDate.getMonth(); // 0 - 11

  // Match park flora against phenology definitions
  const activeSpecies: { name: string; activity: number }[] = [];

  for (const floraItem of parkFlora) {
    const fLower = floraItem.toLowerCase();
    for (const [key, pheno] of Object.entries(MADRID_POLLEN_PHENOLOGY)) {
      if (
        fLower.includes(pheno.commonName.toLowerCase()) ||
        fLower.includes(pheno.speciesName.toLowerCase().split(' ')[0]) ||
        (key === 'platano' && fLower.includes('plátano')) ||
        (key === 'arizonica' && (fLower.includes('ciprés') || fLower.includes('arizónica'))) ||
        (key === 'gramineas' && (fLower.includes('gramínea') || fLower.includes('pradera'))) ||
        (key === 'olivo' && fLower.includes('olivo')) ||
        (key === 'pino' && fLower.includes('pino')) ||
        (key === 'encina' && (fLower.includes('encina') || fLower.includes('quejigo')))
      ) {
        const factor = pheno.monthlyFactors[month];
        if (factor > 0.05) {
          activeSpecies.push({ name: pheno.commonName, activity: factor });
        }
      }
    }
  }

  // Base score from botanical presence multiplied by current month factor
  let rawScore = 10; // Baseline urban background
  if (activeSpecies.length > 0) {
    const maxActivity = Math.max(...activeSpecies.map((s) => s.activity));
    rawScore = Math.round(15 + maxActivity * 65);
  }

  // Meteorological dispersion modifiers:
  // Rain significantly washes pollen from the air (scavenging)
  if (weather.isRaining) {
    rawScore = Math.round(rawScore * 0.35);
  }

  // High wind + low humidity increases dispersion
  const wind = weather.windSpeed ?? 10;
  const humidity = weather.humidity ?? 55;

  let dispersionFactor = 'Dispersión moderada estándar.';
  if (weather.isRaining) {
    dispersionFactor = 'Lavado atmosférico: la lluvia precipita las partículas de polen.';
  } else if (wind > 20 && humidity < 40) {
    rawScore = Math.min(100, Math.round(rawScore * 1.25));
    dispersionFactor = 'Alta dispersión eólica: viento notable (> 20 km/h) y ambiente seco.';
  } else if (wind < 8) {
    dispersionFactor = 'Baja dispersión por calma de viento.';
  }

  const finalScore = Math.max(5, Math.min(100, rawScore));

  let riskLevel: PollenRiskLevel = 'low';
  let riskLabel = 'Bajo';
  let allergyAdvice =
    'Riesgo mínimo en esta época del año. Entrenamiento libre sin precauciones farmacológicas.';

  if (finalScore >= 75) {
    riskLevel = 'extreme';
    riskLabel = 'Extremo';
    allergyAdvice =
      'Pico de polinización activa. Usa gafas de sol envolventes, lava cara y mucosas al finalizar o elige circuito interior.';
  } else if (finalScore >= 50) {
    riskLevel = 'high';
    riskLabel = 'Alto';
    allergyAdvice =
      'Concentración de polen moderada-alta. Se recomienda medicación preventiva prescrita y evitar horas de máxima insolación.';
  } else if (finalScore >= 30) {
    riskLevel = 'moderate';
    riskLabel = 'Moderado';
    allergyAdvice =
      'Presencia estacional incipiente. Atletas con hipersensibilidad deben calentar progresivamente.';
  }

  const dominantSpecies =
    activeSpecies.length > 0
      ? Array.from(new Set(activeSpecies.map((s) => s.name)))
      : ['Bajo nivel estacional en las especies botánicas'];

  return {
    riskLevel,
    riskLabel,
    pollenScore: finalScore,
    dominantSpecies,
    dispersionFactor,
    allergyAdvice,
    isBotanicalEstimation: true,
  };
}

export const MADRID_POLLEN_CALENDAR = [
  {
    name: 'Arizónicas y Cipreses (Cupressaceae)',
    activeMonths: [0, 1, 2], // Ene, Feb, Mar
    description: 'Pico invernal en setos y jardines urbanos.',
  },
  {
    name: 'Plátano de sombra (Platanus x hispanica)',
    activeMonths: [2, 3], // Mar, Abr
    description: 'Pico primaveral concentrado y muy alergénico en paseos arbolados.',
  },
  {
    name: 'Pino (Pinaceae)',
    activeMonths: [2, 3, 4], // Mar, Abr, May
    description: 'Alergenicidad moderada en pinares de Casa de Campo y Dehesa de la Villa.',
  },
  {
    name: 'Gramíneas silvestres (Poaceae)',
    activeMonths: [3, 4, 5], // Abr, May, Jun
    description: 'Principal causa de alergia primaveral en praderas y pastos madrileños.',
  },
  {
    name: 'Olivo (Olea europaea)',
    activeMonths: [4, 5], // May, Jun
    description: 'Floración a finales de primavera en parques y campiñas del sur.',
  },
  {
    name: 'Malezas y Cenizos (Chenopodiaceae)',
    activeMonths: [6, 7, 8, 9], // Jul, Ago, Sep, Oct
    description: 'Polinización estival y otoñal en descampados y márgenes fluviales.',
  },
];

// Alias for backwards compatibility with tests and callers
export const calculateBotanicalPollen = (
  parkFlora: string[],
  windSpeed: number | null,
  humidity: number | null,
  monthIndex?: number,
  isRaining = false
): PollenData => {
  const targetDate = new Date();
  if (monthIndex !== undefined) {
    targetDate.setMonth(monthIndex);
  }
  return calculatePollenRisk(
    parkFlora,
    {
      windSpeed,
      humidity,
      isRaining,
    },
    targetDate
  );
};

