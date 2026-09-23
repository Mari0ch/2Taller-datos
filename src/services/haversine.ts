// Haversine formula, Meteorologic stations & Sports Inhaled Pollution Calculations for FitAir Parks Madrid

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

export interface MonitoringStation {
  code: string;
  stationNumber: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  district: string;
}

// Official Red de Vigilancia de la Calidad del Aire del Ayuntamiento de Madrid (Dataset 212531 / 212629)
export const MADRID_AIR_STATIONS: MonitoringStation[] = [
  {
    code: '28079004',
    stationNumber: '4',
    name: 'Plaza de España',
    lat: 40.4238823,
    lng: -3.7122567,
    address: 'Plaza de España c/ Bailén',
    district: 'Centro / Moncloa',
  },
  {
    code: '28079008',
    stationNumber: '8',
    name: 'Escuelas Aguirre',
    lat: 40.4215533,
    lng: -3.6823158,
    address: 'C/ Alcalá esq. C/ O’Donnell',
    district: 'Retiro / Salamanca',
  },
  {
    code: '28079011',
    stationNumber: '11',
    name: 'Ramón y Cajal',
    lat: 40.4514751,
    lng: -3.6773491,
    address: 'Plaza Mariano de Cavia / Príncipe de Vergara',
    district: 'Chamartín',
  },
  {
    code: '28079016',
    stationNumber: '16',
    name: 'Arturo Soria',
    lat: 40.4400457,
    lng: -3.6392422,
    address: 'C/ Arturo Soria esq. C/ Vizconde de los Asilos',
    district: 'Ciudad Lineal',
  },
  {
    code: '28079017',
    stationNumber: '17',
    name: 'Villaverde',
    lat: 40.347147,
    lng: -3.7133167,
    address: 'C/ Juan Peñalver',
    district: 'Villaverde',
  },
  {
    code: '28079018',
    stationNumber: '18',
    name: 'Farolillo',
    lat: 40.3947825,
    lng: -3.7318356,
    address: 'C/ Farolillo - C/ Ervigio',
    district: 'Carabanchel',
  },
  {
    code: '28079024',
    stationNumber: '24',
    name: 'Casa de Campo',
    lat: 40.4193577,
    lng: -3.7473445,
    address: 'Terminal del Teleférico, Casa de Campo',
    district: 'Moncloa-Aravaca',
  },
  {
    code: '28079027',
    stationNumber: '27',
    name: 'Barajas Pueblo',
    lat: 40.4769277,
    lng: -3.5800258,
    address: 'C/ Acuario esq. C/ Pegaso',
    district: 'Barajas',
  },
  {
    code: '28079035',
    stationNumber: '35',
    name: 'Plaza del Carmen',
    lat: 40.4192091,
    lng: -3.7031662,
    address: 'Plaza del Carmen esq. Tres Cruces',
    district: 'Centro',
  },
  {
    code: '28079036',
    stationNumber: '36',
    name: 'Moratalaz',
    lat: 40.4079517,
    lng: -3.6453104,
    address: 'Avda. Moratalaz esq. Camino de los Vinateros',
    district: 'Moratalaz',
  },
  {
    code: '28079038',
    stationNumber: '38',
    name: 'Cuatro Caminos',
    lat: 40.4455439,
    lng: -3.7071303,
    address: 'Avda. Pablo Iglesias esq. C/ Marqués de Lema',
    district: 'Chamberí / Moncloa',
  },
  {
    code: '28079039',
    stationNumber: '39',
    name: 'Barrio del Pilar',
    lat: 40.4782322,
    lng: -3.7115364,
    address: 'Avda. Betanzos esq. C/ Monforte de Lemos',
    district: 'Fuencarral-El Pardo',
  },
  {
    code: '28079040',
    stationNumber: '40',
    name: 'Vallecas',
    lat: 40.3881472,
    lng: -3.6515222,
    address: 'C/ Arroyo del Olivar esq. C/ Río Colorado',
    district: 'Puente de Vallecas',
  },
  {
    code: '28079047',
    stationNumber: '47',
    name: 'Méndez Álvaro',
    lat: 40.39809,
    lng: -3.67843,
    address: 'C/ Juan de Mariana esq. C/ Méndez Álvaro',
    district: 'Arganzuela',
  },
  {
    code: '28079048',
    stationNumber: '48',
    name: 'Castellana',
    lat: 40.43989,
    lng: -3.69037,
    address: 'Paseo de la Castellana 80',
    district: 'Salamanca',
  },
  {
    code: '28079049',
    stationNumber: '49',
    name: 'Parque del Retiro',
    lat: 40.41444,
    lng: -3.6825,
    address: 'Paseo Duque Fernán Núñez (Interior Retiro)',
    district: 'Retiro',
  },
  {
    code: '28079050',
    stationNumber: '50',
    name: 'Plaza Castilla',
    lat: 40.46558,
    lng: -3.68875,
    address: 'Plaza de Castilla',
    district: 'Chamartín',
  },
  {
    code: '28079054',
    stationNumber: '54',
    name: 'Ensanche de Vallecas',
    lat: 40.3730118,
    lng: -3.6121394,
    address: 'Avda. La Gavia / Avda. Las Suertes',
    district: 'Villa de Vallecas',
  },
  {
    code: '28079056',
    stationNumber: '56',
    name: 'Plaza Elíptica',
    lat: 40.3850336,
    lng: -3.7187679,
    address: 'Pza. Fernández Ladreda (Intercambiador)',
    district: 'Carabanchel / Usera',
  },
  {
    code: '28079057',
    stationNumber: '57',
    name: 'Sanchinarro',
    lat: 40.49421,
    lng: -3.66051,
    address: 'C/ Princesa de Éboli',
    district: 'Hortaleza',
  },
  {
    code: '28079058',
    stationNumber: '58',
    name: 'El Pardo',
    lat: 40.5180701,
    lng: -3.7746101,
    address: 'Avda. La Guardia',
    district: 'Fuencarral-El Pardo',
  },
  {
    code: '28079059',
    stationNumber: '59',
    name: 'Parque Juan Carlos I',
    lat: 40.465144,
    lng: -3.609031,
    address: 'Parque Juan Carlos I (Mantenimiento)',
    district: 'Barajas',
  },
  {
    code: '28079060',
    stationNumber: '60',
    name: 'Tres Olivos',
    lat: 40.50055,
    lng: -3.68972,
    address: 'Plaza de los Tres Olivos',
    district: 'Fuencarral-El Pardo',
  },
];

// Red Meteorológica Municipal del Ayuntamiento de Madrid (Dataset 300754)
export const MADRID_METEO_STATIONS: MonitoringStation[] = [
  {
    code: '102',
    stationNumber: '102',
    name: 'Retiro (Palacio de Cristal)',
    lat: 40.41444,
    lng: -3.6825,
    address: 'Parque del Retiro',
    district: 'Retiro',
  },
  {
    code: '103',
    stationNumber: '103',
    name: 'Villaverde',
    lat: 40.34715,
    lng: -3.71332,
    address: 'Villaverde',
    district: 'Villaverde',
  },
  {
    code: '104',
    stationNumber: '104',
    name: 'Hortaleza / Arturo Soria',
    lat: 40.4578,
    lng: -3.6528,
    address: 'Hortaleza',
    district: 'Hortaleza',
  },
  {
    code: '106',
    stationNumber: '106',
    name: 'Cuatro Vientos',
    lat: 40.3775,
    lng: -3.7886,
    address: 'Cuatro Vientos',
    district: 'Latina',
  },
  {
    code: '107',
    stationNumber: '107',
    name: 'El Pardo',
    lat: 40.51807,
    lng: -3.77461,
    address: 'El Pardo',
    district: 'Fuencarral-El Pardo',
  },
  {
    code: '108',
    stationNumber: '108',
    name: 'Méndez Álvaro',
    lat: 40.39809,
    lng: -3.67843,
    address: 'Méndez Álvaro',
    district: 'Arganzuela',
  },
  {
    code: '109',
    stationNumber: '109',
    name: 'Castellana',
    lat: 40.43989,
    lng: -3.69037,
    address: 'Paseo de la Castellana 80',
    district: 'Salamanca',
  },
  {
    code: '110',
    stationNumber: '110',
    name: 'Barajas',
    lat: 40.4769,
    lng: -3.58,
    address: 'Barajas',
    district: 'Barajas',
  },
  {
    code: '111',
    stationNumber: '111',
    name: 'Tres Olivos',
    lat: 40.50055,
    lng: -3.68972,
    address: 'Tres Olivos',
    district: 'Fuencarral-El Pardo',
  },
  {
    code: '112',
    stationNumber: '112',
    name: 'Vallecas',
    lat: 40.38815,
    lng: -3.65152,
    address: 'Vallecas',
    district: 'Puente de Vallecas',
  },
  {
    code: '113',
    stationNumber: '113',
    name: 'Casa de Campo (Meteo)',
    lat: 40.41936,
    lng: -3.74734,
    address: 'Casa de Campo',
    district: 'Moncloa-Aravaca',
  },
  {
    code: '114',
    stationNumber: '114',
    name: 'Puerta del Rey / Madrid Río',
    lat: 40.4172,
    lng: -3.7258,
    address: 'Puerta del Rey',
    district: 'Moncloa-Aravaca',
  },
  {
    code: '115',
    stationNumber: '115',
    name: 'Sanchinarro',
    lat: 40.4942,
    lng: -3.6605,
    address: 'Sanchinarro',
    district: 'Hortaleza',
  },
  {
    code: '28079004',
    stationNumber: '4',
    name: 'Plaza de España',
    lat: 40.42388,
    lng: -3.71226,
    address: 'Plaza de España',
    district: 'Centro',
  },
  {
    code: '28079008',
    stationNumber: '8',
    name: 'Escuelas Aguirre',
    lat: 40.42155,
    lng: -3.68232,
    address: 'C/ Alcalá',
    district: 'Salamanca',
  },
  {
    code: '28079016',
    stationNumber: '16',
    name: 'Arturo Soria',
    lat: 40.44005,
    lng: -3.63924,
    address: 'Arturo Soria',
    district: 'Ciudad Lineal',
  },
  {
    code: '28079018',
    stationNumber: '18',
    name: 'Farolillo',
    lat: 40.39478,
    lng: -3.73184,
    address: 'Farolillo',
    district: 'Carabanchel',
  },
  {
    code: '28079024',
    stationNumber: '24',
    name: 'Casa de Campo',
    lat: 40.41936,
    lng: -3.74734,
    address: 'Casa de Campo',
    district: 'Moncloa-Aravaca',
  },
  {
    code: '28079035',
    stationNumber: '35',
    name: 'Plaza del Carmen',
    lat: 40.41921,
    lng: -3.70317,
    address: 'Plaza del Carmen',
    district: 'Centro',
  },
  {
    code: '28079036',
    stationNumber: '36',
    name: 'Moratalaz',
    lat: 40.40795,
    lng: -3.64531,
    address: 'Moratalaz',
    district: 'Moratalaz',
  },
  {
    code: '28079038',
    stationNumber: '38',
    name: 'Cuatro Caminos',
    lat: 40.44554,
    lng: -3.70713,
    address: 'Cuatro Caminos',
    district: 'Chamberí',
  },
  {
    code: '28079039',
    stationNumber: '39',
    name: 'Barrio del Pilar',
    lat: 40.47823,
    lng: -3.71154,
    address: 'Barrio del Pilar',
    district: 'Fuencarral',
  },
  {
    code: '28079054',
    stationNumber: '54',
    name: 'Ensanche de Vallecas',
    lat: 40.37301,
    lng: -3.61214,
    address: 'Ensanche de Vallecas',
    district: 'Villa de Vallecas',
  },
  {
    code: '28079056',
    stationNumber: '56',
    name: 'Plaza Elíptica',
    lat: 40.38503,
    lng: -3.71877,
    address: 'Plaza Elíptica',
    district: 'Carabanchel',
  },
  {
    code: '28079058',
    stationNumber: '58',
    name: 'El Pardo',
    lat: 40.51807,
    lng: -3.77461,
    address: 'El Pardo',
    district: 'Fuencarral-El Pardo',
  },
  {
    code: '28079059',
    stationNumber: '59',
    name: 'Juan Carlos I',
    lat: 40.46514,
    lng: -3.60903,
    address: 'Juan Carlos I',
    district: 'Barajas',
  },
];

/**
 * Calculates great-circle distance between two GPS coordinates using the Haversine formula
 * Returns distance in kilometers with 2 decimal precision.
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100;
}

/**
 * Finds nearest monitoring station to a given park location using Haversine
 */
export function findNearestStation(
  lat: number,
  lng: number,
  stations = MADRID_AIR_STATIONS
): { station: MonitoringStation; distanceKm: number } {
  let minDistance = Infinity;
  let nearest = stations[0];

  for (const st of stations) {
    const d = haversineDistanceKm(lat, lng, st.lat, st.lng);
    if (d < minDistance) {
      minDistance = d;
      nearest = st;
    }
  }

  return { station: nearest, distanceKm: minDistance };
}

/**
 * Finds nearest meteorological station to a given park location
 */
export function findNearestMeteoStation(
  lat: number,
  lng: number,
  stations = MADRID_METEO_STATIONS
): { station: MonitoringStation; distanceKm: number } {
  let minDistance = Infinity;
  let nearest = stations[0];

  for (const st of stations) {
    const d = haversineDistanceKm(lat, lng, st.lat, st.lng);
    if (d < minDistance) {
      minDistance = d;
      nearest = st;
    }
  }

  return { station: nearest, distanceKm: minDistance };
}

/**
 * Calculates standard Apparent Temperature (sensación térmica) based on
 * Steadman's model (1984) and Australian Bureau of Meteorology formulation.
 * Formula:
 * AT = Ta + 0.33 * e - 0.70 * ws - 4.00
 * where:
 * Ta = dry bulb temperature (°C)
 * e  = water vapor pressure (hPa) = (rh / 100) * 6.105 * exp((17.27 * Ta) / (237.7 + Ta))
 * ws = wind speed (m/s) = windKmH / 3.6
 */
export function calculateApparentTemperature(
  tempC: number | null,
  humidity: number | null,
  windSpeedKmH: number | null
): number | null {
  if (tempC === null || isNaN(tempC)) return null;
  const rh = humidity !== null && !isNaN(humidity) ? humidity : 50;
  const wsKmh = windSpeedKmH !== null && !isNaN(windSpeedKmH) ? windSpeedKmH : 10;
  const wsMs = wsKmh / 3.6;

  // Vapor pressure in hPa
  const e = (rh / 100) * 6.105 * Math.exp((17.27 * tempC) / (237.7 + tempC));

  // Steadman's Apparent Temperature formula
  let at = tempC + 0.33 * e - 0.7 * wsMs - 4.0;

  // Cold conditions with wind: blend with Wind Chill standard
  if (tempC <= 10 && wsKmh >= 5) {
    const windChill =
      13.12 +
      0.6215 * tempC -
      11.37 * Math.pow(wsKmh, 0.16) +
      0.3965 * tempC * Math.pow(wsKmh, 0.16);
    at = Math.min(at, windChill);
  }

  return Math.round(at * 10) / 10;
}

export interface InhaledDoseResult {
  durationMinutes: number;
  airVolumeM3: number;
  ventilationLitersPerMin: number;
  totalInhaledAirCubicMeters: number;
  inhaledNo2Micrograms: number | null;
  inhaledPm10Micrograms: number | null;
  doseLevel: 'baja' | 'moderada' | 'alta' | 'critica' | 'no_data';
  doseLevelLabel: string;
  colorClass: string;
  physiologicalImpact: string;
}

export function calculateInhaledDose(
  activity: 'running' | 'walking',
  durationMinutes: number,
  no2Ugm3: number | null,
  pm10Ugm3: number | null
): InhaledDoseResult {
  const ventilationRateM3PerMin = activity === 'running' ? 0.065 : 0.02;
  const ventilationLitersPerMin = activity === 'running' ? 65 : 20;
  const totalVolumeM3 = Math.round(ventilationRateM3PerMin * durationMinutes * 10) / 10;

  if (no2Ugm3 === null && pm10Ugm3 === null) {
    return {
      durationMinutes,
      airVolumeM3: totalVolumeM3,
      ventilationLitersPerMin,
      totalInhaledAirCubicMeters: totalVolumeM3,
      inhaledNo2Micrograms: null,
      inhaledPm10Micrograms: null,
      doseLevel: 'no_data',
      doseLevelLabel: 'Sin datos',
      colorClass: 'text-neutral-400 bg-neutral-800/40 border-neutral-700/40',
      physiologicalImpact:
        'No se dispone de mediciones de NO₂ o PM10 en las estaciones de control del entorno para calcular la dosis inhalada.',
    };
  }

  const no2 = no2Ugm3 ?? 0;
  const pm10 = pm10Ugm3 ?? 0;

  const inhaledNo2 = no2Ugm3 !== null ? Math.round(totalVolumeM3 * no2) : null;
  const inhaledPm10 = pm10Ugm3 !== null ? Math.round(totalVolumeM3 * pm10) : null;
  const totalToxicDose = (inhaledNo2 ?? 0) + (inhaledPm10 ?? 0) * 0.5;

  let doseLevel: 'baja' | 'moderada' | 'alta' | 'critica' = 'baja';
  let doseLevelLabel = 'Baja / Segura';
  let colorClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  let physiologicalImpact =
    'Carga pulmonar inocua. El sistema mucociliar filtra eficientemente el aire sin estrés oxidativo.';

  if (totalToxicDose > 250) {
    doseLevel = 'critica';
    doseLevelLabel = 'Crítica / Alerta';
    colorClass = 'text-red-400 bg-red-500/10 border-red-500/30';
    physiologicalImpact =
      'Elevada penetración alveolar de contaminantes. Riesgo de broncoconstricción e irritación respiratoria en esfuerzo.';
  } else if (totalToxicDose > 140) {
    doseLevel = 'alta';
    doseLevelLabel = 'Elevada';
    colorClass = 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    physiologicalImpact =
      'Estrés pulmonar moderado-alto. La hiperventilación introduce partículas finas en vías respiratorias bajas.';
  } else if (totalToxicDose > 70) {
    doseLevel = 'moderada';
    doseLevelLabel = 'Moderada';
    colorClass = 'text-[#ff5500] bg-[#ff5500]/10 border-[#ff5500]/30';
    physiologicalImpact =
      'Nivel asumible para deportistas sin patologías. Personas con hiperreactividad bronquial deben moderar el ritmo.';
  }

  return {
    durationMinutes,
    airVolumeM3: totalVolumeM3,
    inhaledNo2Micrograms: inhaledNo2,
    inhaledPm10Micrograms: inhaledPm10,
    doseLevel,
    doseLevelLabel,
    colorClass,
    physiologicalImpact,
  };
}

/**
 * Generates valid GPX 1.1 XML string for an array of [lat, lng] coordinates
 */
export function generateGPXString(
  parkName: string,
  perimeterKm: number,
  coords: [number, number][]
): string {
  const nowIso = new Date().toISOString();
  let trackPointsXml = '';
  coords.forEach(([lat, lng], idx) => {
    trackPointsXml += `      <trkpt lat="${lat}" lon="${lng}">
        <ele>660</ele>
        <time>${nowIso}</time>
        <name>Km ${(idx * (perimeterKm / coords.length)).toFixed(1)}</name>
      </trkpt>\n`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="FitAir Parks Madrid Pro"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${parkName} - Circuito Deportivo</name>
    <desc>Trazado de running y senderismo OpenStreetMap - Perímetro: ${perimeterKm} km</desc>
    <author>
      <name>FitAir Parks Madrid</name>
    </author>
    <time>${nowIso}</time>
  </metadata>
  <trk>
    <name>Circuito ${parkName} (${perimeterKm} km)</name>
    <type>Running</type>
    <trkseg>
${trackPointsXml}    </trkseg>
  </trk>
</gpx>`;
}

/**
 * Creates and triggers a download of a valid GPX file with the circuit
 * Requires real OSM coordinates (array of [lat, lng]).
 */
export function exportParkToGPX(
  parkName: string,
  perimeterKm: number,
  coords: [number, number][] | null | undefined
): void {
  if (!coords || coords.length < 3) {
    throw new Error(`No se dispone de trazado geométrico real en OpenStreetMap para ${parkName}.`);
  }

  const sanitizedName = parkName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const gpxContent = generateGPXString(parkName, perimeterKm, coords);

  const blob = new Blob([gpxContent], { type: 'application/gpx+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `FitAir_${sanitizedName}_${perimeterKm}k.gpx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
