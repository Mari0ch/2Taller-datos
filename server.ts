import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const HOST = '0.0.0.0';

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  dataTimestamp?: string | null;
}

const cache: Record<string, CacheEntry> = {};

// Helper to fetch upstream with timeout and caching
async function fetchWithCache<T = any>(
  cacheKey: string,
  url: string,
  ttlMs: number,
  options?: {
    extractDataTimestamp?: (data: any) => string | null;
  }
): Promise<{ data: T; status: 'live' | 'stale'; fetchedAt: string; dataTimestamp: string | null }> {
  const now = Date.now();
  const existing = cache[cacheKey];

  // If valid in cache, return immediately as live
  if (existing && now - existing.timestamp < ttlMs) {
    return {
      data: existing.data,
      status: 'live',
      fetchedAt: new Date(existing.timestamp).toISOString(),
      dataTimestamp: existing.dataTimestamp || null,
    };
  }

  // Fetch with 12s timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'FitAirParksMadrid/1.0 (Ayuntamiento de Madrid Open Data Client)',
        Accept: 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Upstream responded with HTTP ${response.status}`);
    }

    const json = (await response.json()) as T;
    let dataTimestamp: string | null = null;
    if (options?.extractDataTimestamp) {
      try {
        dataTimestamp = options.extractDataTimestamp(json);
      } catch {
        dataTimestamp = null;
      }
    }

    cache[cacheKey] = {
      data: json,
      timestamp: now,
      dataTimestamp,
    };

    return {
      data: json,
      status: 'live',
      fetchedAt: new Date(now).toISOString(),
      dataTimestamp,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    // If upstream failed but we have stale cache, return stale
    if (existing) {
      console.warn(`[API] Serving stale cache for ${cacheKey}: ${err.message}`);
      return {
        data: existing.data,
        status: 'stale',
        fetchedAt: new Date(existing.timestamp).toISOString(),
        dataTimestamp: existing.dataTimestamp || null,
      };
    }
    // No cache available, throw to send 502
    throw err;
  }
}

// 1. GET /api/madrid/air
app.get('/api/madrid/air', async (_req: Request, res: Response) => {
  try {
    const result = await fetchWithCache(
      'air',
      'https://ciudadesabiertas.madrid.es/dynamicAPI/API/query/calair_tiemporeal.json?pageSize=5000',
      5 * 60 * 1000, // 5 min TTL
      {
        extractDataTimestamp: (json: any) => {
          if (json.records && json.records.length > 0) {
            const first = json.records[0];
            // Find latest validated hour
            for (let h = 24; h >= 1; h--) {
              const vKey = `V${h.toString().padStart(2, '0')}`;
              if (first[vKey] === 'V') {
                return `${first.ANO}-${first.MES}-${first.DIA}T${h.toString().padStart(2, '0')}:00:00`;
              }
            }
            return `${first.ANO}-${first.MES}-${first.DIA}`;
          }
          return null;
        },
      }
    );

    res.json({
      meta: {
        source: 'Ayuntamiento de Madrid - Red de Vigilancia de la Calidad del Aire (Dataset 212531)',
        fetchedAt: result.fetchedAt,
        status: result.status,
        dataTimestamp: result.dataTimestamp,
      },
      records: result.data.records || [],
    });
  } catch (err: any) {
    console.error('[API /api/madrid/air Error]:', err.message);
    res.status(502).json({
      meta: {
        source: 'Ayuntamiento de Madrid - Red de Vigilancia de la Calidad del Aire (Dataset 212531)',
        fetchedAt: new Date().toISOString(),
        status: 'error',
        dataTimestamp: null,
      },
      error: `Error al conectar con la Red de Calidad del Aire: ${err.message}`,
      records: [],
    });
  }
});

// 2. GET /api/madrid/meteo
app.get('/api/madrid/meteo', async (_req: Request, res: Response) => {
  try {
    const result = await fetchWithCache(
      'meteo',
      'https://ciudadesabiertas.madrid.es/dynamicAPI/API/query/meteo_tiemporeal_ult.json?pageSize=5000',
      5 * 60 * 1000, // 5 min TTL
      {
        extractDataTimestamp: (json: any) => {
          if (json.records && json.records.length > 0) {
            // Find newest record by year/month/day
            const recs = json.records;
            for (let i = recs.length - 1; i >= 0; i--) {
              const r = recs[i];
              for (let h = 24; h >= 1; h--) {
                const vKey = `V${h.toString().padStart(2, '0')}`;
                if (r[vKey] === 'V') {
                  return `${r.ANO}-${r.MES}-${r.DIA}T${h.toString().padStart(2, '0')}:00:00`;
                }
              }
            }
          }
          return null;
        },
      }
    );

    res.json({
      meta: {
        source: 'Ayuntamiento de Madrid - Meteorología en tiempo real acumulada (Dataset 300754)',
        fetchedAt: result.fetchedAt,
        status: result.status,
        dataTimestamp: result.dataTimestamp,
      },
      records: result.data.records || [],
    });
  } catch (err: any) {
    console.error('[API /api/madrid/meteo Error]:', err.message);
    res.status(502).json({
      meta: {
        source: 'Ayuntamiento de Madrid - Meteorología en tiempo real acumulada (Dataset 300754)',
        fetchedAt: new Date().toISOString(),
        status: 'error',
        dataTimestamp: null,
      },
      error: `Error al conectar con el Servicio Meteorológico Municipal: ${err.message}`,
      records: [],
    });
  }
});

// 3. GET /api/madrid/parks
const CURATED_PARK_MAPPING: Record<string, string> = {
  retiro: '5896013',
  'casa-campo': '5987416',
  'madrid-rio': '6372574',
  'parque-oeste': '5982119',
  'dehesa-villa': '5982087',
  'juan-carlos-i': '5987836',
  'tierno-galvan': '5965783',
  'quinta-molinos': '5985750',
  'lineal-manzanares': '5987787',
  'cerro-tio-pio': '5978133',
  'el-capricho': '5986859',
  'fuente-berro': '6030568',
};

function normalizeName(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

app.get('/api/madrid/parks', async (_req: Request, res: Response) => {
  try {
    const result = await fetchWithCache(
      'parks',
      'https://datos.madrid.es/egob/catalogo/200761-0-parques-jardines.json',
      24 * 60 * 60 * 1000 // 24h TTL
    );

    const fullGraph: any[] = result.data['@graph'] || [];
    const matchedParks: any[] = [];
    let matchedCount = 0;
    const totalCurated = Object.keys(CURATED_PARK_MAPPING).length;

    for (const [appParkId, municipalId] of Object.entries(CURATED_PARK_MAPPING)) {
      // 1. Try exact municipal catalog ID match
      let item = fullGraph.find((g: any) => String(g.id) === municipalId);

      // 2. Fallback tolerant normalized name match
      if (!item) {
        const normAppId = normalizeName(appParkId);
        item = fullGraph.find((g: any) => {
          const normTitle = normalizeName(g.title || '');
          return normTitle.includes(normAppId) || normAppId.includes(normTitle);
        });
      }

      if (item) {
        matchedCount++;
        matchedParks.push({
          appParkId,
          id: item.id,
          title: item.title,
          description: item.organization?.['organization-desc'] || '',
          services: item.organization?.services || '',
          webUrl: item.relation || '',
          location: item.location || null,
          address: item.address || null,
        });
      }
    }

    const matchRatePercent = Math.round((matchedCount / totalCurated) * 100);
    console.log(
      `[Park Catalog Matching] Matched ${matchedCount}/${totalCurated} curated parks (${matchRatePercent}% success rate). Returning only needed parks.`
    );

    res.json({
      meta: {
        source: 'Ayuntamiento de Madrid - Catálogo de Parques y Jardines (Dataset 200761)',
        fetchedAt: result.fetchedAt,
        status: result.status,
        matchedCount,
        totalCurated,
        matchRatePercent,
        dataTimestamp: null,
      },
      parks: matchedParks,
      '@graph': matchedParks,
    });
  } catch (err: any) {
    console.error('[API /api/madrid/parks Error]:', err.message);
    res.status(502).json({
      meta: {
        source: 'Ayuntamiento de Madrid - Catálogo de Parques y Jardines (Dataset 200761)',
        fetchedAt: new Date().toISOString(),
        status: 'error',
        dataTimestamp: null,
      },
      error: `Error al consultar catálogo de parques: ${err.message}`,
      parks: [],
      '@graph': [],
    });
  }
});

// 4. GET /api/madrid/stations (Station directory with exact coordinates)
app.get('/api/madrid/stations', async (_req: Request, res: Response) => {
  try {
    const result = await fetchWithCache(
      'stations',
      'https://ciudadesabiertas.madrid.es/dynamicAPI/API/query/calair_estaciones.json?pageSize=100',
      24 * 60 * 60 * 1000 // 24h TTL
    );

    res.json({
      meta: {
        source: 'Ayuntamiento de Madrid - Estaciones de la Red de Vigilancia (Dataset 212629)',
        fetchedAt: result.fetchedAt,
        status: result.status,
      },
      records: result.data.records || [],
    });
  } catch (err: any) {
    res.status(502).json({ error: err.message, records: [] });
  }
});

// 5. GET /api/madrid/geometries (OpenStreetMap real park perimeters with long cache)
const geometryCache: Record<string, [number, number][] | null> = {};

app.get('/api/madrid/geometries', async (req: Request, res: Response) => {
  const parkName = typeof req.query.name === 'string' ? req.query.name.trim() : '';
  if (!parkName) {
    res.status(400).json({ error: 'Parámetro "name" requerido' });
    return;
  }

  const cacheKey = parkName.toLowerCase();
  if (geometryCache[cacheKey] !== undefined) {
    res.json({ name: parkName, coordinates: geometryCache[cacheKey], source: 'OpenStreetMap' });
    return;
  }

  try {
    // Query OSM via Nominatim polygon_geojson with timeout
    const query = encodeURIComponent(`${parkName}, Madrid, Spain`);
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&polygon_geojson=1&limit=1`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(nominatimUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'FitAirParksMadrid/1.0 (Environmental Sports Platform)',
      },
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0 && data[0].geojson) {
        const geojson = data[0].geojson;
        let coords: [number, number][] | null = null;
        if (geojson.type === 'Polygon' && Array.isArray(geojson.coordinates?.[0])) {
          coords = geojson.coordinates[0].map((pt: [number, number]) => [pt[1], pt[0]]); // [lat, lng]
        } else if (geojson.type === 'MultiPolygon' && Array.isArray(geojson.coordinates?.[0]?.[0])) {
          coords = geojson.coordinates[0][0].map((pt: [number, number]) => [pt[1], pt[0]]);
        }
        if (coords && coords.length >= 3) {
          geometryCache[cacheKey] = coords;
          res.json({ name: parkName, coordinates: coords, source: 'OpenStreetMap' });
          return;
        }
      }
    }
  } catch (e: any) {
    console.warn(`[Geometry] OSM lookup failed for ${parkName}:`, e.message);
  }

  // Not found or error -> null geometry (no fake circles)
  geometryCache[cacheKey] = null;
  res.json({ name: parkName, coordinates: null, source: 'OpenStreetMap' });
});

// Configure Vite middleware in dev or static serving in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`[FitAir Madrid Server] running at http://${HOST}:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('[Server Start Fatal Error]:', err);
  process.exit(1);
});
