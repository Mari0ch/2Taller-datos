// Haversine formula & Sports Inhaled Pollution Calculations for FitAir Parks Madrid Pro

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

// Official Red de Vigilancia de la Calidad del Aire del Ayuntamiento de Madrid (Dataset 212531)
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
    name: 'Escuelas Aguirre / Retiro',
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
    name: 'Cuatro Caminos / Dehesa',
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
    name: 'Plaza Elíptica / Arganzuela',
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

/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula in JavaScript.
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
 * Finds the nearest monitoring station to a given park location using Haversine
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
 * Generates perimeter GPS coordinates loop around a park center
 * for route simulation and GPX export.
 */
export function generateParkPerimeterCoords(
  centerLat: number,
  centerLng: number,
  radiusKm: number,
  numPoints = 12
): [number, number][] {
  const coords: [number, number][] = [];
  const kmToLat = 1 / 110.574;
  const kmToLng = 1 / (111.32 * Math.cos((centerLat * Math.PI) / 180));

  for (let i = 0; i <= numPoints; i++) {
    const angle = (i * 2 * Math.PI) / numPoints;
    // Slight perturbation to create realistic trail shapes
    const r = radiusKm * (0.85 + 0.3 * Math.sin(angle * 3));
    const lat = centerLat + r * Math.sin(angle) * kmToLat;
    const lng = centerLng + r * Math.cos(angle) * kmToLng;
    coords.push([Math.round(lat * 100000) / 100000, Math.round(lng * 100000) / 100000]);
  }

  return coords;
}

/**
 * Inhaled pollution dose calculator
 * Based on sports exercise physiology:
 * Minute ventilation (VE):
 * - Walking: ~20 L/min (0.020 m³/min -> 1.2 m³/hour)
 * - Running (aerobic 70-80% HRmax): ~65 L/min (0.065 m³/min -> 3.9 m³/hour)
 */
export interface InhaledDoseResult {
  durationMinutes: number;
  airVolumeM3: number;
  inhaledNo2Micrograms: number;
  inhaledPm10Micrograms: number;
  doseLevel: 'baja' | 'moderada' | 'alta' | 'critica';
  doseLevelLabel: string;
  colorClass: string;
  physiologicalImpact: string;
}

export function calculateInhaledDose(
  activity: 'running' | 'walking',
  durationMinutes: number,
  no2Ugm3: number,
  pm10Ugm3: number
): InhaledDoseResult {
  // Ventilation rate in cubic meters per minute
  const ventilationRateM3PerMin = activity === 'running' ? 0.065 : 0.02;
  const totalVolumeM3 = Math.round(ventilationRateM3PerMin * durationMinutes * 10) / 10;

  const inhaledNo2 = Math.round(totalVolumeM3 * no2Ugm3);
  const inhaledPm10 = Math.round(totalVolumeM3 * pm10Ugm3);
  const totalToxicDose = inhaledNo2 + inhaledPm10 * 0.5;

  let doseLevel: 'baja' | 'moderada' | 'alta' | 'critica' = 'baja';
  let doseLevelLabel = 'Baja / Segura';
  let colorClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  let physiologicalImpact =
    'Carga pulmonar inocua. Los cilios bronquiales y el sistema mucociliar filtran eficientemente el aire sin estrés oxidativo.';

  if (totalToxicDose > 250) {
    doseLevel = 'critica';
    doseLevelLabel = 'Crítica / Alerta';
    colorClass = 'text-red-400 bg-red-500/10 border-red-500/30';
    physiologicalImpact =
      'Elevada penetración alveolar de NO₂ y partículas finas. Riesgo de broncoconstricción, aumento de citoquinas inflamatorias y tos en deportistas.';
  } else if (totalToxicDose > 140) {
    doseLevel = 'alta';
    doseLevelLabel = 'Elevada';
    colorClass = 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    physiologicalImpact =
      'Estrés pulmonar moderado-alto. La hiperventilación introduce contaminantes a las vías respiratorias bajas. Conviene acortar la sesión o buscar otro parque.';
  } else if (totalToxicDose > 70) {
    doseLevel = 'moderada';
    doseLevelLabel = 'Moderada';
    colorClass = 'text-[#ff5500] bg-[#ff5500]/10 border-[#ff5500]/30';
    physiologicalImpact =
      'Nivel asumible para deportistas sanos. Personas con asma inducida por esfuerzo o rinitis deben vigilar sensaciones.';
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
 * Creates and triggers a download of a valid GPX file with the circuit
 * compatible with Garmin, Apple Watch, Strava, Polar, Suunto, Coros.
 */
export function exportParkToGPX(
  parkName: string,
  perimeterKm: number,
  coords: [number, number][]
): void {
  const sanitizedName = parkName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const nowIso = new Date().toISOString();

  let trackPointsXml = '';
  coords.forEach(([lat, lng], idx) => {
    trackPointsXml += `      <trkpt lat="${lat}" lon="${lng}">
        <ele>660</ele>
        <time>${nowIso}</time>
        <name>Km ${(idx * (perimeterKm / coords.length)).toFixed(1)}</name>
      </trkpt>\n`;
  });

  const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="FitAir Parks Madrid Pro - https://madrid.es"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>Circuito Saludable ${parkName}</name>
    <desc>Trazado de running y senderismo urbano libre de picos de polución - Perímetro: ${perimeterKm} km</desc>
    <author>
      <name>FitAir Parks Madrid Pro</name>
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

/**
 * Generates 24-hour diurnal profile of air quality & weather for Madrid
 * Incorporates Madrid's known traffic curves:
 * - Morning rush hour peak: 08:00 - 09:30 (High NO2)
 * - Evening rush hour peak: 18:30 - 20:00 (High NO2)
 * - Cleanest training windows: 06:30 - 08:00 and 20:30 - 22:30
 */
export interface HourlyDataPoint {
  hour: string;
  no2: number;
  aqi: number;
  temperature: number;
  isOptimalWindow: boolean;
  note: string;
}

export function generateHourlyEvolution(
  currentNo2: number,
  currentAqi: number,
  currentTemp: number
): HourlyDataPoint[] {
  const hours = [
    { label: '06:00', no2Factor: 0.65, tempOffset: -4, note: 'Aire limpio nocturno' },
    { label: '07:30', no2Factor: 0.75, tempOffset: -3, note: '🏆 Ventana Oro Mañana' },
    { label: '08:30', no2Factor: 1.35, tempOffset: -1, note: '🚗 Pico Tráfico Matinal' },
    { label: '10:30', no2Factor: 1.05, tempOffset: 1, note: 'Dispersión solar' },
    { label: '13:00', no2Factor: 0.85, tempOffset: 4, note: 'Calor central' },
    { label: '16:00', no2Factor: 0.90, tempOffset: 5, note: 'Máxima térmica' },
    { label: '18:30', no2Factor: 1.40, tempOffset: 3, note: '🚗 Pico Tráfico Tarde' },
    { label: '20:30', no2Factor: 0.72, tempOffset: 0, note: '🏆 Ventana Oro Noche' },
    { label: '22:30', no2Factor: 0.68, tempOffset: -2, note: 'Noche fresca' },
  ];

  return hours.map((h) => {
    const no2 = Math.round(currentNo2 * h.no2Factor);
    const aqi = Math.round(currentAqi * (h.no2Factor * 0.9 + 0.1));
    const temp = Math.round((currentTemp + h.tempOffset) * 10) / 10;
    const isOptimal = h.label === '07:30' || h.label === '20:30';

    return {
      hour: h.label,
      no2,
      aqi,
      temperature: temp,
      isOptimalWindow: isOptimal,
      note: h.note,
    };
  });
}
