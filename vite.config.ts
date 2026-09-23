import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function madridOpenDataPlugin(): Plugin {
  const cache: Record<string, { data: string; timestamp: number }> = {};
  const CACHE_TTL_MS = 60 * 1000; // 60s cache

  async function fetchWithCache(url: string) {
    const now = Date.now();
    if (cache[url] && now - cache[url].timestamp < CACHE_TTL_MS) {
      return cache[url].data;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'FitAirMadrid/1.0 (Portal de Datos Abiertos del Ayuntamiento de Madrid)',
          Accept: 'application/json',
        },
      });
      clearTimeout(timeout);
      if (!response.ok) {
        throw new Error(`Municipal API status: ${response.status}`);
      }
      const text = await response.text();
      cache[url] = { data: text, timestamp: now };
      return text;
    } catch (err) {
      clearTimeout(timeout);
      if (cache[url]) {
        return cache[url].data; // Return stale cache on error
      }
      throw err;
    }
  }

  return {
    name: 'madrid-open-data-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();

        // 1. Dataset 200761-0-parques-jardines
        if (req.url.startsWith('/api/madrid/parks')) {
          try {
            const data = await fetchWithCache(
              'https://datos.madrid.es/egob/catalogo/200761-0-parques-jardines.json'
            );
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(data);
            return;
          } catch (err: any) {
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: err.message }));
            return;
          }
        }

        // 2. Dataset 212531-0-calidad-aire-tiempo-real
        if (req.url.startsWith('/api/madrid/air')) {
          try {
            const data = await fetchWithCache(
              'https://ciudadesabiertas.madrid.es/dynamicAPI/API/query/calair_tiemporeal.json?pageSize=5000'
            );
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(data);
            return;
          } catch (err: any) {
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: err.message }));
            return;
          }
        }

        // 3. Dataset 300754-0-meteorologia-tiempo-real-acumula
        if (req.url.startsWith('/api/madrid/meteo')) {
          try {
            const data = await fetchWithCache(
              'https://ciudadesabiertas.madrid.es/dynamicAPI/API/query/meteo_tiemporeal_ult.json?pageSize=5000'
            );
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(data);
            return;
          } catch (err: any) {
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: err.message }));
            return;
          }
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), madridOpenDataPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
