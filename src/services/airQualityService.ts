import { ActivityType, AirPollutionData, AirQualityLevel, MadridPark, PollenData, PollenRiskLevel, WeatherData } from '../types';
import { MADRID_PARKS_BASE } from '../data/parksData';
import {
  findNearestStation,
  generateParkPerimeterCoords,
  haversineDistanceKm,
  MADRID_AIR_STATIONS,
} from './haversine';

export interface SimulationParams {
  overrideTemp?: number | null;
  overrideRain?: boolean | null;
  overrideAqi?: 'clean' | 'moderate' | 'polluted' | null;
  overridePollen?: PollenRiskLevel | null;
}

// Metadata for the 3 official datasets requested by user
export const AYUNTAMIENTO_MADRID_DATASETS = {
  portal: 'Portal de Datos Abiertos del Ayuntamiento de Madrid',
  portalUrl: 'https://datos.madrid.es',
  parks: {
    id: '200761-0-parques-jardines',
    name: 'Parques y jardines de la ciudad de Madrid',
    url: 'https://datos.madrid.es/dataset/200761-0-parques-jardines',
    endpoint: 'https://datos.madrid.es/egob/catalogo/200761-0-parques-jardines.json',
    localProxy: '/api/madrid/parks',
    description: 'Catálogo de 208 zonas verdes municipales con flora, servicios y geolocalización',
  },
  airQuality: {
    id: '212531-0-calidad-aire-tiempo-real',
    name: 'Calidad del aire. Datos en tiempo real',
    url: 'https://datos.madrid.es/dataset/212531-0-calidad-aire-tiempo-real',
    endpoint: 'https://ciudadesabiertas.madrid.es/dynamicAPI/API/query/calair_tiemporeal.json?pageSize=5000',
    localProxy: '/api/madrid/air',
    description: 'Telemetría de la Red de Vigilancia (24 estaciones, actualización cada 20 min en :15, :35, :55)',
  },
  meteorology: {
    id: '300754-0-meteorologia-tiempo-real-acumula',
    name: 'Meteorología en tiempo real acumulada',
    url: 'https://datos.madrid.es/dataset/300754-0-meteorologia-tiempo-real-acumula',
    endpoint: 'https://ciudadesabiertas.madrid.es/dynamicAPI/API/query/meteo_tiemporeal_ult.json?pageSize=5000',
    localProxy: '/api/madrid/meteo',
    description: 'Estaciones meteorológicas municipales: temperatura, humedad, viento y precipitación',
  },
};

// Calculate next municipal update timestamp (:15, :35, :55)
export function getNextUpdateInfo(): { nextUpdateTime: string; secondsRemaining: number; lastUpdateTime: string } {
  const now = new Date();
  const currentMinutes = now.getMinutes();

  const checkpoints = [15, 35, 55];
  let nextMin = checkpoints.find((m) => m > currentMinutes);
  let nextHour = now.getHours();

  if (nextMin === undefined) {
    nextMin = 15;
    nextHour = (nextHour + 1) % 24;
  }

  // Last update calculation
  let lastMin = [...checkpoints].reverse().find((m) => m <= currentMinutes);
  let lastHour = now.getHours();
  if (lastMin === undefined) {
    lastMin = 55;
    lastHour = (lastHour + 23) % 24;
  }

  const targetDate = new Date(now);
  targetDate.setHours(nextHour, nextMin, 0, 0);
  if (targetDate.getTime() <= now.getTime()) {
    targetDate.setDate(targetDate.getDate() + 1);
  }

  const secondsRemaining = Math.max(0, Math.floor((targetDate.getTime() - now.getTime()) / 1000));

  const pad = (n: number) => n.toString().padStart(2, '0');
  const nextUpdateTime = `${pad(nextHour)}:${pad(nextMin)}:00`;
  const lastUpdateTime = `${pad(lastHour)}:${pad(lastMin)}:00`;

  return { nextUpdateTime, secondsRemaining, lastUpdateTime };
}

// European & Madrid Municipal Air Quality Index (ICA) Sub-indices
function calculateSubIndexNO2(no2: number): number {
  if (no2 <= 40) return Math.round((no2 / 40) * 40); // 0-40 Buena
  if (no2 <= 90) return 40 + Math.round(((no2 - 40) / 50) * 35); // 40-75 Aceptable
  if (no2 <= 120) return 75 + Math.round(((no2 - 90) / 30) * 25); // 75-100 Regular
  if (no2 <= 230) return 100 + Math.round(((no2 - 120) / 110) * 50); // 100-150 Desfavorable
  return Math.min(250, 150 + Math.round(no2 - 230)); // > 150 Muy Desfavorable
}

function calculateSubIndexPM10(pm10: number): number {
  if (pm10 <= 20) return Math.round((pm10 / 20) * 40);
  if (pm10 <= 40) return 40 + Math.round(((pm10 - 20) / 20) * 35);
  if (pm10 <= 50) return 75 + Math.round(((pm10 - 40) / 10) * 25);
  return Math.min(250, 100 + Math.round((pm10 - 50) * 2));
}

function calculateSubIndexPM25(pm25: number): number {
  if (pm25 <= 10) return Math.round((pm25 / 10) * 40);
  if (pm25 <= 20) return 40 + Math.round(((pm25 - 10) / 10) * 35);
  if (pm25 <= 25) return 75 + Math.round(((pm25 - 20) / 5) * 25);
  return Math.min(250, 100 + Math.round((pm25 - 25) * 3));
}

export interface StationTelemetry {
  stationNumber: string;
  stationCode: string;
  name: string;
  no2: number;
  pm10: number;
  pm25: number;
  o3?: number;
  aqi: number;
  level: AirQualityLevel;
  levelLabel: string;
  latestHour: number;
  hourlyEvolution: {
    hour: string;
    no2: number;
    aqi: number;
    temperature: number;
    isOptimalWindow: boolean;
    note: string;
  }[];
}

// Fetch and parse Dataset 212531 (Calidad del aire en tiempo real)
async function fetchMadridAirQualityData(): Promise<Map<string, StationTelemetry>> {
  const stationMap = new Map<string, StationTelemetry>();

  const urls = [
    AYUNTAMIENTO_MADRID_DATASETS.airQuality.localProxy,
    AYUNTAMIENTO_MADRID_DATASETS.airQuality.endpoint,
  ];

  let rawRecords: any[] = [];

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeout);
      if (res.ok) {
        const json = await res.json();
        if (json.records && Array.isArray(json.records) && json.records.length > 0) {
          rawRecords = json.records;
          break;
        }
      }
    } catch {
      // try next url
    }
  }

  // Parse records per station
  for (const st of MADRID_AIR_STATIONS) {
    const stNum = st.stationNumber;
    const stRecs = rawRecords.filter((r) => String(r.ESTACION).trim() === stNum);

    const getLatestAndHourly = (magCode: string): { latest: number; latestHr: number; hourly: number[] } => {
      const rec = stRecs.find((r) => String(r.MAGNITUD).trim() === magCode);
      const hourly: number[] = new Array(24).fill(0);
      let latest = 0;
      let latestHr = 12;

      if (rec) {
        // Collect hours 1..24
        for (let h = 1; h <= 24; h++) {
          const hKey = `H${h.toString().padStart(2, '0')}`;
          const vKey = `V${h.toString().padStart(2, '0')}`;
          if (rec[vKey] === 'V' && rec[hKey] !== undefined && rec[hKey] !== null) {
            const val = parseFloat(rec[hKey]);
            if (!isNaN(val)) {
              hourly[h - 1] = val;
              latest = val;
              latestHr = h;
            }
          }
        }
      }

      return { latest, latestHr, hourly };
    };

    const no2Data = getLatestAndHourly('8'); // NO2
    const pm10Data = getLatestAndHourly('10'); // PM10
    const pm25Data = getLatestAndHourly('9'); // PM2.5
    const o3Data = getLatestAndHourly('14'); // O3

    // Real recorded values (or defaults if sensor not installed at that station)
    const finalNo2 = no2Data.latest > 0 ? no2Data.latest : 18;
    const finalPm10 = pm10Data.latest > 0 ? pm10Data.latest : 16;
    const finalPm25 = pm25Data.latest > 0 ? pm25Data.latest : 8;
    const finalO3 = o3Data.latest > 0 ? o3Data.latest : undefined;

    const no2Sub = calculateSubIndexNO2(finalNo2);
    const pm10Sub = calculateSubIndexPM10(finalPm10);
    const pm25Sub = calculateSubIndexPM25(finalPm25);
    const aqi = Math.max(no2Sub, pm10Sub, pm25Sub);

    let level: AirQualityLevel = 'good';
    let levelLabel = 'Excelente / Muy Bueno';
    if (aqi > 75 || finalNo2 > 50) {
      level = 'unfavorable';
      levelLabel = 'Desfavorable (Alerta Deportiva)';
    } else if (aqi > 40 || finalNo2 > 35) {
      level = 'moderate';
      levelLabel = 'Aceptable / Moderado';
    }

    // Build hourly evolution from today's real telemetry
    const hourlyEvolution = [];
    for (let h = 1; h <= 24; h++) {
      const hourStr = `${(h - 1).toString().padStart(2, '0')}:00`;
      const recordedNo2 = no2Data.hourly[h - 1];
      const hNo2 = recordedNo2 > 0 ? recordedNo2 : Math.max(8, Math.round(finalNo2 * (h < 7 ? 0.6 : h < 10 ? 1.4 : h < 16 ? 0.9 : h < 21 ? 1.3 : 0.8)));
      const hAqi = calculateSubIndexNO2(hNo2);
      const isOptimal = hNo2 <= 25 && hAqi <= 40;

      let note = 'Calidad de aire estándar.';
      if (h >= 7 && h <= 9) note = 'Pico de tráfico matinal (hora punta laboral).';
      else if (h >= 19 && h <= 21) note = 'Pico vespertino por retorno de vehículos.';
      else if (h >= 6 && h <= 8) note = 'Franja óptima matinal para carrera continua.';
      else if (isOptimal) note = 'Ventana recomendada para series o rodaje.';

      hourlyEvolution.push({
        hour: hourStr,
        no2: Math.round(hNo2),
        aqi: Math.round(hAqi),
        temperature: 18,
        isOptimalWindow: isOptimal,
        note,
      });
    }

    stationMap.set(stNum, {
      stationNumber: stNum,
      stationCode: st.code,
      name: st.name,
      no2: Math.round(finalNo2),
      pm10: Math.round(finalPm10),
      pm25: Math.round(finalPm25),
      o3: finalO3 ? Math.round(finalO3) : undefined,
      aqi,
      level,
      levelLabel,
      latestHour: no2Data.latestHr,
      hourlyEvolution,
    });
  }

  return stationMap;
}

// Fetch and parse Dataset 300754 (Meteorología en tiempo real acumulada)
async function fetchMadridMeteorologyData(): Promise<WeatherData> {
  const urls = [
    AYUNTAMIENTO_MADRID_DATASETS.meteorology.localProxy,
    AYUNTAMIENTO_MADRID_DATASETS.meteorology.endpoint,
  ];

  let rawRecords: any[] = [];

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeout);
      if (res.ok) {
        const json = await res.json();
        if (json.records && Array.isArray(json.records) && json.records.length > 0) {
          rawRecords = json.records;
          break;
        }
      }
    } catch {
      // try next url
    }
  }

  let temp = 18.0;
  let humidity = 55;
  let windSpeedKmH = 12.0;
  let rainMm = 0.0;

  if (rawRecords.length > 0) {
    // Find latest valid value from stations 102, 103, 106
    const findLatest = (magCode: string): number | null => {
      for (const st of ['102', '106', '103', '104']) {
        const rec = rawRecords.find((r) => String(r.ESTACION).trim() === st && String(r.MAGNITUD).trim() === magCode);
        if (rec) {
          for (let h = 24; h >= 1; h--) {
            const hKey = `H${h.toString().padStart(2, '0')}`;
            const vKey = `V${h.toString().padStart(2, '0')}`;
            if (rec[vKey] === 'V' && rec[hKey] !== undefined && rec[hKey] !== null) {
              const val = parseFloat(rec[hKey]);
              if (!isNaN(val)) return val;
            }
          }
        }
      }
      return null;
    };

    const t = findLatest('83'); // Temperature (°C)
    if (t !== null) temp = t;

    const h = findLatest('86'); // Relative Humidity (%)
    if (h !== null) humidity = Math.round(h);

    const w = findLatest('81'); // Wind speed (m/s)
    if (w !== null) windSpeedKmH = Math.round(w * 3.6 * 10) / 10;

    const r = findLatest('89'); // Precipitation (l/m² = mm)
    if (r !== null) rainMm = r;
  }

  const isRaining = rainMm > 0.1;
  const apparentTemp = isRaining ? temp - 2 : temp > 22 ? temp + 1.5 : temp;

  let weatherDesc = 'Despejado / Soleado con brisa';
  if (isRaining) {
    weatherDesc = 'Chubascos / Precipitación activa en Madrid';
  } else if (windSpeedKmH > 22) {
    weatherDesc = `Viento moderado a fuerte (${windSpeedKmH} km/h)`;
  }

  return {
    temperature: Math.round(temp * 10) / 10,
    apparentTemperature: Math.round(apparentTemp * 10) / 10,
    humidity,
    windSpeed: Math.round(windSpeedKmH),
    isRaining,
    rainIntensity: isRaining ? 'moderate' : 'none',
    precipitationProbability: isRaining ? 90 : 10,
    weatherDescription: weatherDesc,
    weatherCode: isRaining ? 61 : 0,
  };
}

// Fetch and match Dataset 200761 (Catálogo oficial de Parques y Jardines)
async function fetchMadridParksCatalog(): Promise<Map<string, { desc: string; services: string; webUrl: string }>> {
  const parkDetails = new Map<string, { desc: string; services: string; webUrl: string }>();

  const urls = [
    AYUNTAMIENTO_MADRID_DATASETS.parks.localProxy,
    AYUNTAMIENTO_MADRID_DATASETS.parks.endpoint,
  ];

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeout);
      if (res.ok) {
        const json = await res.json();
        const graph = json['@graph'];
        if (Array.isArray(graph)) {
          for (const item of graph) {
            const title = (item.title || '').toLowerCase();
            const desc = item.organization?.['organization-desc'] || '';
            const services = item.organization?.services || '';
            const webUrl = item.relation || '';
            parkDetails.set(title, { desc, services, webUrl });
          }
          break;
        }
      }
    } catch {
      // try next
    }
  }

  return parkDetails;
}

// Calculate pollen risk combining botanical species with real weather
export function calculatePollenRisk(
  parkFlora: string[],
  weather: WeatherData,
  simPollen?: PollenRiskLevel | null
): PollenData {
  if (simPollen) {
    let score = 25;
    let label = 'Bajo';
    if (simPollen === 'moderate') {
      score = 55;
      label = 'Moderado';
    }
    if (simPollen === 'high') {
      score = 80;
      label = 'Alto (Alerta)';
    }
    if (simPollen === 'extreme') {
      score = 95;
      label = 'Extremo (Evitar)';
    }

    return {
      riskLevel: simPollen,
      riskLabel: label,
      pollenScore: score,
      dominantSpecies: parkFlora.slice(0, 2),
      dispersionFactor: 'Simulado en panel de control',
      allergyAdvice: 'Condiciones de prueba para deportistas alérgicos.',
    };
  }

  let baseScore = 28;

  const hasPlatano = parkFlora.some((f) => f.toLowerCase().includes('plátano'));
  const hasGramineas = parkFlora.some((f) => f.toLowerCase().includes('gramínea'));
  const hasArizonica = parkFlora.some((f) => f.toLowerCase().includes('arizónica'));

  if (hasPlatano) baseScore += 24;
  if (hasGramineas) baseScore += 20;
  if (hasArizonica) baseScore += 16;

  // Weather modifiers:
  // 1. Rain washes pollen down dramatically
  if (weather.isRaining) {
    baseScore = Math.max(10, Math.round(baseScore * 0.25));
  } else {
    // 2. High wind disperses pollen widely
    if (weather.windSpeed > 20) {
      baseScore += 18;
    } else if (weather.windSpeed > 12) {
      baseScore += 8;
    }

    // 3. Low humidity increases pollen volatility
    if (weather.humidity < 40) {
      baseScore += 14;
    } else if (weather.humidity > 70) {
      baseScore -= 10;
    }
  }

  baseScore = Math.max(10, Math.min(100, baseScore));

  let riskLevel: PollenRiskLevel = 'low';
  let riskLabel = 'Bajo';
  let dispersionFactor = 'Baja dispersión atmosférica';
  let allergyAdvice = 'Apto para deportistas alérgicos sin restricciones especiales.';

  if (weather.isRaining) {
    dispersionFactor = 'Lavado natural por lluvia (filtro de alérgenos)';
    allergyAdvice = 'La lluvia actúa como filtro natural depositando los granos de polen en el suelo.';
  } else if (weather.windSpeed > 15 && weather.humidity < 45) {
    dispersionFactor = `Alta dispersión por viento (${weather.windSpeed} km/h) y aire seco (${weather.humidity}%)`;
  }

  if (baseScore >= 78) {
    riskLevel = 'extreme';
    riskLabel = 'Muy Alto / Extremo';
    allergyAdvice = `Elevadísima densidad de ${parkFlora[0] || 'polen'}. Recomendable sustituir por zonas fluviales como Madrid Río o usar gafas deportivas envolventes.`;
  } else if (baseScore >= 55) {
    riskLevel = 'high';
    riskLabel = 'Alto';
    allergyAdvice = `Presencia significativa de ${parkFlora[0] || 'alérgenos'}. Evitar horarios vespertinos y lavar ojos con suero fisiológico post-entreno.`;
  } else if (baseScore >= 35) {
    riskLevel = 'moderate';
    riskLabel = 'Moderado';
    allergyAdvice = 'Nivel asumible para alérgicos leves. Se recomienda precaución en personas con asma alérgica inducida por esfuerzo.';
  }

  return {
    riskLevel,
    riskLabel,
    pollenScore: baseScore,
    dominantSpecies: parkFlora.slice(0, 2),
    dispersionFactor,
    allergyAdvice,
  };
}

// Calculate exercise suitability score (0-100) based on air quality, weather, activity, and allergy mode
export function calculateExerciseSuitability(
  airQuality: AirPollutionData,
  weather: WeatherData,
  activity: ActivityType,
  pollen: PollenData,
  isAllergyMode: boolean = false
): {
  score: number;
  recommendation: 'Óptimo' | 'Aceptable' | 'Precaución' | 'Desfavorable';
  suitabilityReason: string;
} {
  let score = 100;
  const isRunning = activity === 'running';

  // 1. Air Quality impact
  if (airQuality.aqi <= 35) {
    score -= 0;
  } else if (airQuality.aqi <= 50) {
    score -= isRunning ? 8 : 4;
  } else if (airQuality.aqi <= 75) {
    score -= isRunning ? 22 : 12;
  } else if (airQuality.aqi <= 100) {
    score -= isRunning ? 38 : 22;
  } else {
    score -= isRunning ? 60 : 40;
  }

  // NO2 specifically (traffic peak)
  if (airQuality.no2 > 50) {
    score -= isRunning ? 20 : 12;
  } else if (airQuality.no2 > 38) {
    score -= isRunning ? 12 : 6;
  }

  // 2. Weather impact
  const temp = weather.temperature;
  if (isRunning) {
    if (temp >= 10 && temp <= 18) {
      score += 5; // Golden running zone
    } else if (temp > 28) {
      score -= 30;
    } else if (temp > 23) {
      score -= 15;
    } else if (temp < 3) {
      score -= 15;
    }
  } else {
    if (temp >= 14 && temp <= 23) {
      score += 5;
    } else if (temp > 33) {
      score -= 25;
    } else if (temp < 0) {
      score -= 20;
    }
  }

  // Rain impact
  if (weather.isRaining) {
    score -= isRunning ? 18 : 22;
  }

  // Wind impact
  if (weather.windSpeed > 30) {
    score -= 15;
  } else if (weather.windSpeed > 20) {
    score -= 8;
  }

  // 3. Allergy Mode Impact
  if (isAllergyMode) {
    if (pollen.riskLevel === 'extreme') {
      score -= isRunning ? 40 : 25;
    } else if (pollen.riskLevel === 'high') {
      score -= isRunning ? 25 : 15;
    } else if (pollen.riskLevel === 'moderate') {
      score -= isRunning ? 12 : 6;
    }
  }

  score = Math.max(10, Math.min(100, Math.round(score)));

  let recommendation: 'Óptimo' | 'Aceptable' | 'Precaución' | 'Desfavorable';
  let suitabilityReason = '';

  if (score >= 80) {
    recommendation = 'Óptimo';
    suitabilityReason = isAllergyMode
      ? `Baja polinización (${pollen.dominantSpecies[0] || 'flora'}) y aire limpio. Excelente para alérgicos.`
      : isRunning
      ? 'Excelente calidad de aire municipal y temperatura idónea para series o rodaje continuo.'
      : 'Condiciones magníficas para una caminata saludable sin estrés respiratorio.';
  } else if (score >= 60) {
    recommendation = 'Aceptable';
    suitabilityReason = isAllergyMode
      ? `Riesgo de polen moderado (${pollen.dominantSpecies[0] || 'gramíneas'}). Lleva gafas deportivas envolventes.`
      : isRunning
      ? 'Buen ambiente para entrenamiento aeróbico a ritmo suave o moderado.'
      : 'Apto para pasear cómodamente; lleva la ropa recomendada.';
  } else if (score >= 45) {
    recommendation = 'Precaución';
    suitabilityReason = isAllergyMode
      ? `Alta concentración de alérgenos (${pollen.dominantSpecies.join(', ')}). Se aconseja rodaje suave o buscar parques alternativos.`
      : airQuality.aqi > 65 || airQuality.no2 > 40
      ? 'Niveles de NO₂ o partículas moderados en el sensor municipal. Se aconseja reducir la intensidad.'
      : 'Meteorología exigente (frío/calor/viento). Hidrátate y adapta el ritmo.';
  } else {
    recommendation = 'Desfavorable';
    suitabilityReason =
      isAllergyMode && pollen.riskLevel === 'extreme'
        ? `ZONA NO RECOMENDADA PARA ALÉRGICOS: Pico extremo de polen por ${pollen.dominantSpecies.join(' y ')}.`
        : airQuality.no2 > 50 || airQuality.aqi > 80
        ? 'ZONA A EVITAR: Pico elevado de polución en la red municipal (NO₂/PM₁₀). Alto estrés respiratorio.'
        : 'Polución desfavorable o condiciones meteorológicas adversas. No recomendado.';
  }

  return { score, recommendation, suitabilityReason };
}

// Main fetcher function combining all 3 official Ayuntamiento de Madrid datasets
export async function fetchMadridParksData(
  activity: ActivityType,
  simParams?: SimulationParams,
  isAllergyMode: boolean = false,
  userLocation?: { lat: number; lng: number } | null
): Promise<MadridPark[]> {
  const { lastUpdateTime } = getNextUpdateInfo();

  // 1. Fetch in parallel from official Ayuntamiento datasets:
  // - Calidad del aire tiempo real (Dataset 212531)
  // - Meteorología tiempo real acumulada (Dataset 300754)
  // - Catálogo de Parques y Jardines (Dataset 200761)
  const [stationTelemetryMap, baseMeteo, municipalParksCatalog] = await Promise.all([
    fetchMadridAirQualityData().catch(() => new Map<string, StationTelemetry>()),
    fetchMadridMeteorologyData().catch(() => ({
      temperature: 18.0,
      apparentTemperature: 18.0,
      humidity: 55,
      windSpeed: 12,
      isRaining: false,
      rainIntensity: 'none' as const,
      precipitationProbability: 10,
      weatherDescription: 'Despejado / Soleado con brisa',
      weatherCode: 0,
    })),
    fetchMadridParksCatalog().catch(() => new Map<string, { desc: string; services: string; webUrl: string }>()),
  ]);

  // Apply simulation overrides to meteorology if requested
  const weather: WeatherData = { ...baseMeteo };
  if (simParams?.overrideTemp !== undefined && simParams.overrideTemp !== null) {
    weather.temperature = simParams.overrideTemp;
    weather.apparentTemperature = simParams.overrideTemp;
  }
  if (simParams?.overrideRain !== undefined && simParams.overrideRain !== null) {
    weather.isRaining = simParams.overrideRain;
    if (simParams.overrideRain) {
      weather.rainIntensity = 'moderate';
      weather.weatherDescription = 'Chubascos / Lluvia activa en Madrid';
      weather.apparentTemperature = weather.temperature - 2;
    }
  }

  const initialParks = MADRID_PARKS_BASE.map((basePark) => {
    // 2. Haversine distance to find nearest municipal monitoring station
    const { station: nearestSt, distanceKm: stationDist } = findNearestStation(basePark.lat, basePark.lng);

    // 3. Retrieve real telemetry for that monitoring station
    const liveTelemetry = stationTelemetryMap.get(nearestSt.stationNumber);

    let no2 = liveTelemetry ? liveTelemetry.no2 : 22;
    let pm10 = liveTelemetry ? liveTelemetry.pm10 : 18;
    let pm25 = liveTelemetry ? liveTelemetry.pm25 : 8;
    let aqi = liveTelemetry ? liveTelemetry.aqi : 32;
    let level: AirQualityLevel = liveTelemetry ? liveTelemetry.level : 'good';
    let levelLabel = liveTelemetry ? liveTelemetry.levelLabel : 'Excelente / Muy Bueno';

    // Apply simulation overrides if requested
    if (simParams?.overrideAqi === 'clean') {
      aqi = 20;
      no2 = 12;
      pm10 = 10;
      pm25 = 5;
      level = 'good';
      levelLabel = 'Excelente / Muy Bueno';
    } else if (simParams?.overrideAqi === 'moderate') {
      aqi = 65;
      no2 = 45;
      pm10 = 35;
      pm25 = 20;
      level = 'moderate';
      levelLabel = 'Aceptable / Moderado';
    } else if (simParams?.overrideAqi === 'polluted') {
      aqi = 125;
      no2 = 85;
      pm10 = 70;
      pm25 = 45;
      level = 'unfavorable';
      levelLabel = 'Desfavorable (Alerta)';
    }

    const airQuality: AirPollutionData = {
      aqi,
      level,
      levelLabel,
      no2,
      pm10,
      pm25,
      o3: liveTelemetry?.o3,
      stationName: `Estación ${nearestSt.stationNumber}: ${nearestSt.name}`,
      stationCode: nearestSt.code,
      lastUpdated: lastUpdateTime,
    };

    // 4. Enrich with official municipal catalog metadata if available
    const matchedCatalog = municipalParksCatalog.get(basePark.name.toLowerCase());
    const highlights = [...basePark.highlights];
    if (matchedCatalog?.services && matchedCatalog.services.trim().length > 0) {
      highlights.push(`Equipamiento municipal: ${matchedCatalog.services}`);
    }

    // 5. Pollen calculation
    const pollenInfo = calculatePollenRisk(basePark.allergenicFlora, weather, simParams?.overridePollen);

    // 6. Exercise Suitability Calculation
    const { score, recommendation, suitabilityReason } = calculateExerciseSuitability(
      airQuality,
      weather,
      activity,
      pollenInfo,
      isAllergyMode
    );

    // 7. Distance to user via Haversine
    const userDist = userLocation
      ? haversineDistanceKm(userLocation.lat, userLocation.lng, basePark.lat, basePark.lng)
      : undefined;

    // 8. Perimeter coordinates for GPS / GPX trail
    const radiusEstimateKm = Math.max(0.4, (basePark.perimeterKm / (2 * Math.PI)) * 0.9);
    const perimeterCoordinates = generateParkPerimeterCoords(basePark.lat, basePark.lng, radiusEstimateKm);

    // 9. Real hourly evolution curves from today's H01..H24 measurements
    let hourlyEvolution = liveTelemetry?.hourlyEvolution;
    if (!hourlyEvolution || hourlyEvolution.length === 0) {
      hourlyEvolution = [];
      for (let h = 0; h < 24; h++) {
        const hourStr = `${h.toString().padStart(2, '0')}:00`;
        const estNo2 = Math.round(no2 * (h < 7 ? 0.6 : h < 10 ? 1.4 : h < 16 ? 0.9 : h < 21 ? 1.3 : 0.8));
        const estAqi = calculateSubIndexNO2(estNo2);
        hourlyEvolution.push({
          hour: hourStr,
          no2: estNo2,
          aqi: estAqi,
          temperature: Math.round(weather.temperature),
          isOptimalWindow: estNo2 <= 25,
          note: h >= 7 && h <= 9 ? 'Hora punta tráfico' : h >= 19 && h <= 21 ? 'Tráfico vespertino' : 'Ventana deportiva favorable',
        });
      }
    }

    return {
      ...basePark,
      highlights,
      airQuality,
      weather,
      pollenInfo,
      exerciseScore: score,
      exerciseRecommendation: recommendation,
      suitabilityReason,
      isHighPollutionZone: false,
      stationDistanceKm: stationDist,
      userDistanceKm: userDist,
      perimeterCoordinates,
      hourlyEvolution,
    };
  });

  // Identify the top 3 parks with highest pollution levels in Madrid
  const sortedByPollution = [...initialParks].sort((a, b) => {
    return b.airQuality.no2 * 1.5 + b.airQuality.aqi - (a.airQuality.no2 * 1.5 + a.airQuality.aqi);
  });

  const worstThreeIds = new Set(sortedByPollution.slice(0, 3).map((p) => p.id));

  return initialParks.map((p) => {
    const isHigh = worstThreeIds.has(p.id) && (p.airQuality.no2 >= 35 || p.airQuality.aqi >= 45);
    let peakReason = '';
    if (isHigh) {
      peakReason = `Pico de polución registrado en ${p.airQuality.stationName}: NO₂ a ${p.airQuality.no2} µg/m³ y partículas PM₁₀ a ${p.airQuality.pm10} µg/m³. Se aconseja rodar en parques con mayor masa forestal como Casa de Campo o Dehesa de la Villa.`;
    }

    return {
      ...p,
      isHighPollutionZone: isHigh,
      pollutionPeakReason: peakReason,
    };
  });
}
