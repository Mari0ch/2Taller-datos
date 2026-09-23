import {
  ActivityType,
  AirPollutionData,
  DataSourceStatus,
  MadridPark,
  PollenData,
  WeatherData,
} from '../types';
import { MADRID_PARKS_BASE } from '../data/parksData';
import {
  findNearestStation,
  findNearestMeteoStation,
  haversineDistanceKm,
  calculateApparentTemperature,
  MADRID_AIR_STATIONS,
  MADRID_METEO_STATIONS,
} from './haversine';
import { calculateEEAAirQuality } from './eeaAirQuality';
import { calculateBotanicalPollen } from './pollenSeasonality';

export interface SimulationParams {
  overrideTemp?: number | null;
  overrideRain?: boolean | null;
  overrideAqi?: 'clean' | 'moderate' | 'polluted' | null;
  overridePollen?: 'low' | 'moderate' | 'high' | 'extreme' | null;
}

// Current status tracking for UI indicator
let lastDataSourceStatus: DataSourceStatus = {
  status: 'live',
  airStatus: 'live',
  meteoStatus: 'live',
  parksStatus: 'live',
  lastFetchedAt: null,
  dataTimestamp: null,
  source: 'Portal de Datos Abiertos del Ayuntamiento de Madrid',
};

export function getDataSourceStatus(): DataSourceStatus {
  return { ...lastDataSourceStatus };
}

// Calculate next municipal update timestamp (:15, :35, :55)
export function getNextUpdateInfo(): {
  nextUpdateTime: string;
  secondsRemaining: number;
  lastUpdateTime: string;
} {
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

export interface RawAirRecord {
  PROVINCIA: string;
  MUNICIPIO: string;
  ESTACION: string | number;
  MAGNITUD: string | number;
  PUNTO_MUESTREO: string;
  ANO: string | number;
  MES: string | number;
  DIA: string | number;
  [key: string]: any;
}

export interface ParsedAirTelemetry {
  stationNumber: string;
  no2: number | null;
  pm10: number | null;
  pm25: number | null;
  o3: number | null;
  so2: number | null;
  latestHour: number | null;
  recordDate: string | null;
  hourlyNo2: (number | null)[];
}

export function extractHourlyAndLatest(
  records: RawAirRecord[],
  stationNum: string,
  magnitudeCode: string
): { latest: number | null; latestHr: number | null; hourly: (number | null)[]; recordDate: string | null } {
  const rec = records.find(
    (r) =>
      String(r.ESTACION).trim() === stationNum &&
      String(r.MAGNITUD).trim() === magnitudeCode
  );

  const hourly: (number | null)[] = new Array(24).fill(null);
  let latest: number | null = null;
  let latestHr: number | null = null;
  let recordDate: string | null = null;

  if (rec) {
    recordDate = `${rec.ANO}-${String(rec.MES).padStart(2, '0')}-${String(rec.DIA).padStart(2, '0')}`;
    for (let h = 1; h <= 24; h++) {
      const hKey = `H${h.toString().padStart(2, '0')}`;
      const vKey = `V${h.toString().padStart(2, '0')}`;
      // V = Validated measurement. 0 is a completely valid measurement!
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

  return { latest, latestHr, hourly, recordDate };
}

// Fetch air quality telemetry strictly from server-side proxy /api/madrid/air
async function fetchAirQualityTelemetry(): Promise<{
  telemetryMap: Map<string, ParsedAirTelemetry>;
  metaStatus: 'live' | 'stale' | 'error';
  dataTimestamp: string | null;
  fetchedAt: string;
}> {
  const telemetryMap = new Map<string, ParsedAirTelemetry>();
  let metaStatus: 'live' | 'stale' | 'error' = 'error';
  let dataTimestamp: string | null = null;
  let fetchedAt = new Date().toISOString();

  try {
    const res = await fetch('/api/madrid/air', {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const json = await res.json();
      metaStatus = json.meta?.status || 'live';
      dataTimestamp = json.meta?.dataTimestamp || null;
      fetchedAt = json.meta?.fetchedAt || fetchedAt;

      const records: RawAirRecord[] = Array.isArray(json.records) ? json.records : [];

      for (const st of MADRID_AIR_STATIONS) {
        const stNum = st.stationNumber;
        const no2 = extractHourlyAndLatest(records, stNum, '8');
        const pm10 = extractHourlyAndLatest(records, stNum, '10');
        const pm25 = extractHourlyAndLatest(records, stNum, '9');
        const o3 = extractHourlyAndLatest(records, stNum, '14');
        const so2 = extractHourlyAndLatest(records, stNum, '1');

        const latestHr = no2.latestHr ?? pm10.latestHr ?? pm25.latestHr ?? o3.latestHr;
        const recordDate = no2.recordDate ?? pm10.recordDate ?? pm25.recordDate;

        telemetryMap.set(stNum, {
          stationNumber: stNum,
          no2: no2.latest,
          pm10: pm10.latest,
          pm25: pm25.latest,
          o3: o3.latest,
          so2: so2.latest,
          latestHour: latestHr,
          recordDate,
          hourlyNo2: no2.hourly,
        });
      }
    }
  } catch (err) {
    console.warn('[AirQualityService] Failed to fetch /api/madrid/air:', err);
    metaStatus = 'error';
  }

  return { telemetryMap, metaStatus, dataTimestamp, fetchedAt };
}

interface ParsedMeteoTelemetry {
  stationNumber: string;
  temperature: number | null;
  humidity: number | null;
  windSpeedKmH: number | null;
  rainMm: number | null;
  recordDate: string | null;
  latestHour: number | null;
}

// Fetch meteorology telemetry strictly from server-side proxy /api/madrid/meteo
async function fetchMeteorologyTelemetry(): Promise<{
  meteoMap: Map<string, ParsedMeteoTelemetry>;
  metaStatus: 'live' | 'stale' | 'error';
  dataTimestamp: string | null;
}> {
  const meteoMap = new Map<string, ParsedMeteoTelemetry>();
  let metaStatus: 'live' | 'stale' | 'error' = 'error';
  let dataTimestamp: string | null = null;

  try {
    const res = await fetch('/api/madrid/meteo', {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const json = await res.json();
      metaStatus = json.meta?.status || 'live';
      dataTimestamp = json.meta?.dataTimestamp || null;
      const records: RawAirRecord[] = Array.isArray(json.records) ? json.records : [];

      for (const st of MADRID_METEO_STATIONS) {
        const stNum = st.stationNumber;
        const temp = extractHourlyAndLatest(records, stNum, '83'); // Temperature (°C)
        const hum = extractHourlyAndLatest(records, stNum, '86'); // Relative Humidity (%)
        const wind = extractHourlyAndLatest(records, stNum, '81'); // Wind speed (m/s)
        const rain = extractHourlyAndLatest(records, stNum, '89'); // Precipitation (l/m² = mm)

        const windKmH = wind.latest !== null ? Math.round(wind.latest * 3.6 * 10) / 10 : null;

        meteoMap.set(stNum, {
          stationNumber: stNum,
          temperature: temp.latest !== null ? Math.round(temp.latest * 10) / 10 : null,
          humidity: hum.latest !== null ? Math.round(hum.latest) : null,
          windSpeedKmH: windKmH,
          rainMm: rain.latest !== null ? Math.round(rain.latest * 10) / 10 : null,
          recordDate: temp.recordDate || hum.recordDate || rain.recordDate,
          latestHour: temp.latestHr || hum.latestHr,
        });
      }
    }
  } catch (err) {
    console.warn('[AirQualityService] Failed to fetch /api/madrid/meteo:', err);
    metaStatus = 'error';
  }

  return { meteoMap, metaStatus, dataTimestamp };
}

// Fetch park municipal catalog strictly from server-side proxy /api/madrid/parks
async function fetchParksCatalog(): Promise<{
  catalogMap: Map<string, { desc: string; services: string; webUrl: string }>;
  metaStatus: 'live' | 'stale' | 'error';
}> {
  const catalogMap = new Map<string, { desc: string; services: string; webUrl: string }>();
  let metaStatus: 'live' | 'stale' | 'error' = 'error';

  try {
    const res = await fetch('/api/madrid/parks', {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const json = await res.json();
      metaStatus = json.meta?.status || 'live';
      const parksList = Array.isArray(json.parks)
        ? json.parks
        : Array.isArray(json['@graph'])
        ? json['@graph']
        : [];

      for (const item of parksList) {
        const key = item.appParkId || item.id || (item.title ? item.title.toLowerCase() : '');
        catalogMap.set(String(key), {
          desc: item.description || '',
          services: item.services || '',
          webUrl: item.webUrl || item.relation || '',
        });
      }
    }
  } catch (err) {
    console.warn('[AirQualityService] Failed to fetch /api/madrid/parks:', err);
    metaStatus = 'error';
  }

  return { catalogMap, metaStatus };
}

// Cache of real geometries fetched from server /api/madrid/geometries
const geometryCache = new Map<string, [number, number][] | null>();

async function fetchRealParkGeometry(parkName: string): Promise<[number, number][] | null> {
  const norm = parkName.trim().toLowerCase();
  if (geometryCache.has(norm)) {
    return geometryCache.get(norm) ?? null;
  }

  try {
    const res = await fetch(`/api/madrid/geometries?name=${encodeURIComponent(parkName)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.coordinates) && data.coordinates.length >= 3) {
        geometryCache.set(norm, data.coordinates);
        return data.coordinates;
      }
    }
  } catch {
    // ignore
  }

  geometryCache.set(norm, null);
  return null;
}

// Calculate exercise suitability strictly with real non-null metrics
export function calculateExerciseSuitability(
  airQuality: AirPollutionData,
  weather: WeatherData,
  activity: ActivityType,
  pollen: PollenData,
  isAllergyMode: boolean = false
): {
  score: number | null;
  recommendation: 'Óptimo' | 'Aceptable' | 'Precaución' | 'Desfavorable' | 'No disponible';
  suitabilityReason: string;
} {
  // If air quality index is completely absent, exercise score must be null (no fake numbers)
  if (airQuality.aqi === null) {
    return {
      score: null,
      recommendation: 'No disponible',
      suitabilityReason:
        'Sin datos telemétricos en la red municipal para este parque. Imposible evaluar idoneidad sin mediciones reales.',
    };
  }

  let score = 100;
  const isRunning = activity === 'running';

  // 1. Air Quality impact based on EEA normalized index
  if (airQuality.aqi <= 30) {
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
  if (airQuality.no2 !== null) {
    if (airQuality.no2 > 50) {
      score -= isRunning ? 20 : 12;
    } else if (airQuality.no2 > 38) {
      score -= isRunning ? 12 : 6;
    }
  }

  // 2. Weather impact (if temperature available)
  if (weather.temperature !== null) {
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
  }

  // Rain impact
  if (weather.isRaining) {
    score -= isRunning ? 18 : 22;
  }

  // Wind impact
  if (weather.windSpeed !== null) {
    if (weather.windSpeed > 30) {
      score -= 15;
    } else if (weather.windSpeed > 20) {
      score -= 8;
    }
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
      : 'Apto para pasear cómodamente; viste con prendas versátiles.';
  } else if (score >= 45) {
    recommendation = 'Precaución';
    suitabilityReason = isAllergyMode
      ? `Concentración polínica estacional (${pollen.dominantSpecies.join(', ')}). Se aconseja rodaje suave o buscar parques alternativos.`
      : airQuality.aqi > 65 || (airQuality.no2 !== null && airQuality.no2 > 40)
      ? 'Niveles de NO₂ o partículas moderados en el sensor municipal. Se aconseja reducir la intensidad.'
      : 'Meteorología exigente (frío/calor/viento). Adapta el ritmo.';
  } else {
    recommendation = 'Desfavorable';
    suitabilityReason =
      isAllergyMode && pollen.riskLevel === 'extreme'
        ? `ZONA NO RECOMENDADA PARA ALÉRGICOS: Pico extremo de polen por ${pollen.dominantSpecies.join(' y ')}.`
        : (airQuality.no2 !== null && airQuality.no2 > 50) || airQuality.aqi > 80
        ? 'ZONA A EVITAR: Pico elevado de polución en la red municipal (NO₂/PM₁₀). Alto estrés respiratorio.'
        : 'Polución desfavorable o condiciones meteorológicas adversas. No recomendado.';
  }

  return { score, recommendation, suitabilityReason };
}

// Main fetcher function combining all datasets with zero fake data
export async function fetchMadridParksData(
  activity: ActivityType,
  simParams?: SimulationParams,
  isAllergyMode: boolean = false,
  userLocation?: { lat: number; lng: number } | null
): Promise<MadridPark[]> {
  const isSimulationActive = Boolean(
    simParams &&
      (simParams.overrideTemp !== null && simParams.overrideTemp !== undefined ||
        simParams.overrideRain !== null && simParams.overrideRain !== undefined ||
        simParams.overrideAqi !== null && simParams.overrideAqi !== undefined ||
        simParams.overridePollen !== null && simParams.overridePollen !== undefined)
  );

  // 1. Fetch in parallel from server endpoints
  const [airRes, meteoRes, catalogRes] = await Promise.all([
    fetchAirQualityTelemetry(),
    fetchMeteorologyTelemetry(),
    fetchParksCatalog(),
  ]);

  // Determine overall data source status
  const overallStatus: 'live' | 'stale' | 'error' =
    airRes.metaStatus === 'error' && meteoRes.metaStatus === 'error'
      ? 'error'
      : airRes.metaStatus === 'stale' || meteoRes.metaStatus === 'stale'
      ? 'stale'
      : 'live';

  lastDataSourceStatus = {
    status: overallStatus,
    airStatus: airRes.metaStatus,
    meteoStatus: meteoRes.metaStatus,
    parksStatus: catalogRes.metaStatus,
    lastFetchedAt: airRes.fetchedAt,
    dataTimestamp: airRes.dataTimestamp || meteoRes.dataTimestamp,
    source: 'Portal de Datos Abiertos del Ayuntamiento de Madrid',
  };

  // 2. Fetch real geometries from OpenStreetMap in parallel (tolerantly)
  const geometries = await Promise.all(
    MADRID_PARKS_BASE.map((p) => fetchRealParkGeometry(p.name))
  );

  // 3. Process each park
  const parsedParks = MADRID_PARKS_BASE.map((basePark, index) => {
    // A. Nearest Air Quality Station
    const { station: nearestAirSt, distanceKm: airStDist } = findNearestStation(
      basePark.lat,
      basePark.lng
    );
    const airTelemetry = airRes.telemetryMap.get(nearestAirSt.stationNumber);

    let no2 = airTelemetry?.no2 ?? null;
    let pm10 = airTelemetry?.pm10 ?? null;
    let pm25 = airTelemetry?.pm25 ?? null;
    let o3 = airTelemetry?.o3 ?? null;
    let isEstimatedFallback = false;
    let fallbackStationName: string | undefined;

    // If nearest station lacks PM10 or PM2.5, find nearest station that HAS that pollutant
    if (pm10 === null) {
      for (const st of MADRID_AIR_STATIONS) {
        const alt = airRes.telemetryMap.get(st.stationNumber);
        if (alt && alt.pm10 !== null) {
          pm10 = alt.pm10;
          isEstimatedFallback = true;
          fallbackStationName = `PM₁₀ de ${st.name}`;
          break;
        }
      }
    }

    if (pm25 === null) {
      for (const st of MADRID_AIR_STATIONS) {
        const alt = airRes.telemetryMap.get(st.stationNumber);
        if (alt && alt.pm25 !== null) {
          pm25 = alt.pm25;
          isEstimatedFallback = true;
          fallbackStationName = fallbackStationName
            ? `${fallbackStationName}, PM₂.₅ de ${st.name}`
            : `PM₂.₅ de ${st.name}`;
          break;
        }
      }
    }

    // Apply simulation overrides if explicitly set in simulation modal
    if (simParams?.overrideAqi === 'clean') {
      no2 = 12;
      pm10 = 10;
      pm25 = 5;
      o3 = 25;
    } else if (simParams?.overrideAqi === 'moderate') {
      no2 = 45;
      pm10 = 35;
      pm25 = 20;
      o3 = 55;
    } else if (simParams?.overrideAqi === 'polluted') {
      no2 = 95;
      pm10 = 70;
      pm25 = 45;
      o3 = 110;
    }

    // Calculate official European Air Quality Index (EEA)
    const eeaResult = calculateEEAAirQuality({ no2, pm10, pm25, o3 });

    // Format last updated time
    let lastUpdatedFormatted = 'Sin datos';
    if (airTelemetry?.recordDate && airTelemetry?.latestHour) {
      lastUpdatedFormatted = `${airTelemetry.recordDate} ${airTelemetry.latestHour.toString().padStart(2, '0')}:00 h`;
    } else if (airRes.dataTimestamp) {
      lastUpdatedFormatted = airRes.dataTimestamp;
    }

    const airQuality: AirPollutionData = {
      aqi: eeaResult.normalizedScore,
      level: eeaResult.level,
      levelLabel: eeaResult.levelLabel,
      eeaBand: eeaResult.overallBand,
      dominantPollutant: eeaResult.worstPollutant,
      no2,
      pm10,
      pm25,
      o3,
      stationName: `Estación ${nearestAirSt.stationNumber}: ${nearestAirSt.name}`,
      stationCode: nearestAirSt.code,
      lastUpdated: lastUpdatedFormatted,
      isEstimatedFallback,
      fallbackStationName,
    };

    // B. Nearest Meteorological Station
    // Find closest meteo station that actually has real telemetry
    let matchedMeteo = findNearestMeteoStation(basePark.lat, basePark.lng);
    let meteoData = meteoRes.meteoMap.get(matchedMeteo.station.stationNumber);

    // If closest meteo station has no data, search nearest with data
    if (!meteoData || meteoData.temperature === null) {
      for (const st of MADRID_METEO_STATIONS) {
        const candidate = meteoRes.meteoMap.get(st.stationNumber);
        if (candidate && candidate.temperature !== null) {
          meteoData = candidate;
          matchedMeteo = {
            station: st,
            distanceKm: haversineDistanceKm(basePark.lat, basePark.lng, st.lat, st.lng),
          };
          break;
        }
      }
    }

    let temp = meteoData?.temperature ?? null;
    let humidity = meteoData?.humidity ?? null;
    let windSpeed = meteoData?.windSpeedKmH ?? null;
    const rainMm = meteoData?.rainMm ?? 0;
    let isRaining = rainMm > 0.1;

    // Apply simulation overrides
    if (simParams?.overrideTemp !== undefined && simParams.overrideTemp !== null) {
      temp = simParams.overrideTemp;
    }
    if (simParams?.overrideRain !== undefined && simParams.overrideRain !== null) {
      isRaining = simParams.overrideRain;
    }

    const apparentTemp = calculateApparentTemperature(temp, humidity, windSpeed);

    let weatherDesc = 'Sin datos meteorológicos';
    if (temp !== null) {
      if (isRaining) {
        weatherDesc = 'Precipitación activa detectada en la estación';
      } else if (windSpeed !== null && windSpeed > 25) {
        weatherDesc = `Viento notable (${windSpeed} km/h)`;
      } else {
        weatherDesc = 'Despejado / Soleado con brisa';
      }
    }

    const weather: WeatherData = {
      temperature: temp,
      apparentTemperature: apparentTemp,
      humidity,
      windSpeed,
      isRaining,
      rainIntensity: isRaining ? 'moderate' : 'none',
      precipitationProbability: null, // Removed fake 10/90 values
      weatherDescription: weatherDesc,
      weatherCode: isRaining ? 61 : 0,
      stationName: `Estación Meteo ${matchedMeteo.station.stationNumber}: ${matchedMeteo.station.name}`,
      stationDistanceKm: matchedMeteo.distanceKm,
    };

    // C. Pollen info using scientific botanical seasonality
    const pollenInfo = calculateBotanicalPollen(
      basePark.allergenicFlora,
      weather,
      simParams?.overridePollen
    );

    // D. Exercise suitability
    const { score, recommendation, suitabilityReason } = calculateExerciseSuitability(
      airQuality,
      weather,
      activity,
      pollenInfo,
      isAllergyMode
    );

    // E. Distance to user via Haversine
    const userDist = userLocation
      ? haversineDistanceKm(userLocation.lat, userLocation.lng, basePark.lat, basePark.lng)
      : undefined;

    // F. Real Geometry from OpenStreetMap (No fake circles)
    const realGeom = geometries[index];
    const hasRealGeometry = Boolean(realGeom && realGeom.length >= 3);

    // G. Hourly Evolution from real station measurements (H01..H24)
    const hourlyEvolution = [];
    if (airTelemetry && airTelemetry.hourlyNo2) {
      for (let h = 1; h <= 24; h++) {
        const val = airTelemetry.hourlyNo2[h - 1];
        if (val !== null) {
          const hourStr = `${(h - 1).toString().padStart(2, '0')}:00`;
          const subEea = calculateEEAAirQuality({ no2: val, pm10: null, pm25: null, o3: null });
          hourlyEvolution.push({
            hour: hourStr,
            no2: val,
            aqi: subEea.normalizedScore,
            temperature: null, // No fake 18°C temperature
            isOptimalWindow: val <= 25,
            note:
              h >= 7 && h <= 9
                ? 'Pico de tráfico laboral matinal'
                : h >= 19 && h <= 21
                ? 'Pico vespertino de movilidad'
                : val <= 25
                ? 'Ventana horaria de aire limpio'
                : 'Nivel medio',
          });
        }
      }
    }

    // H. Enrich with official municipal catalog metadata
    const catalogItem =
      catalogRes.catalogMap.get(basePark.id) ||
      catalogRes.catalogMap.get(basePark.name.toLowerCase());
    const highlights = [...basePark.highlights];
    if (catalogItem?.services && catalogItem.services.trim().length > 0) {
      highlights.push(`Equipamiento municipal: ${catalogItem.services}`);
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
      stationDistanceKm: airStDist,
      userDistanceKm: userDist,
      perimeterCoordinates: realGeom,
      hasRealGeometry,
      isSimulation: isSimulationActive,
      hourlyEvolution,
    };
  });

  // Identify high pollution zones based on real non-null measurements
  const validPolluted = parsedParks.filter(
    (p) => p.airQuality.no2 !== null && p.airQuality.aqi !== null
  );

  validPolluted.sort((a, b) => {
    const aVal = (a.airQuality.no2 ?? 0) * 1.5 + (a.airQuality.aqi ?? 0);
    const bVal = (b.airQuality.no2 ?? 0) * 1.5 + (b.airQuality.aqi ?? 0);
    return bVal - aVal;
  });

  const worstThreeIds = new Set(
    validPolluted
      .filter((p) => (p.airQuality.no2 ?? 0) >= 35 || (p.airQuality.aqi ?? 0) >= 60)
      .slice(0, 3)
      .map((p) => p.id)
  );

  return parsedParks.map((p) => {
    const isHigh = worstThreeIds.has(p.id);
    let peakReason = '';
    if (isHigh) {
      peakReason = `Pico de polución registrado en ${p.airQuality.stationName}: NO₂ a ${p.airQuality.no2} µg/m³ y partículas PM₁₀ a ${p.airQuality.pm10 ?? 'N/D'} µg/m³. Se aconseja actividad suave o rodar en parques con mayor masa forestal como Casa de Campo o Dehesa de la Villa.`;
    }

    return {
      ...p,
      isHighPollutionZone: isHigh,
      pollutionPeakReason: peakReason,
    };
  });
}
