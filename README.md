# FitAir Parks Madrid Pro

**FitAir Parks Madrid** es una aplicación deportiva full-stack diseñada para corredores, ciclistas y caminantes de la Comunidad de Madrid. Su misión es recomendar los mejores parques y circuitos urbanos para realizar actividad física al aire libre basándose en **telemetría real** de calidad del aire, variables meteorológicas, fenología botánica polínica y recomendaciones fisiológicas de indumentaria.

---

## 🚀 Arquitectura y Cómo Ejecutar

La aplicación sigue el patrón de arquitectura full-stack de AI Studio con **React 19**, **TypeScript** (con `"strict": true`), **Tailwind CSS v4** y un servidor **Express** (`server.ts`) ejecutado con **tsx**.

### Scripts de ejecución

```bash
# Instalar dependencias
npm install

# Modo desarrollo (Express con Vite en modo middleware en http://localhost:3000)
npm run dev

# Compilación de producción (TypeScript estricto y Vite bundle)
npm run build

# Ejecución en producción (servidor Express sirviendo la carpeta dist/)
npm start

# Validación de tipos y análisis estático
npm run lint

# Batería de pruebas unitarias con Vitest
npm test
```

### Arquitectura de Pasarela y Caché (`server.ts`)

En producción (Google Cloud Run), las peticiones directas desde el navegador a los servidores del Ayuntamiento de Madrid son bloqueadas por CORS y carecen de persistencia de caché. Por ello, el servidor Express actúa como puerta de enlace telemétrica con endpoints dedicados en `/api/madrid/*`:

- `GET /api/madrid/air`: Proxy hacia la API dinámica de calidad del aire en tiempo real (dataset 212531).
- `GET /api/madrid/meteo`: Proxy hacia la API dinámica de meteorología municipal (dataset 300754).
- `GET /api/madrid/parks`: Proxy hacia el catálogo municipal de parques y zonas verdes (dataset 200761).
- `GET /api/madrid/geometries`: Consulta resiliente a OpenStreetMap (Overpass API) para obtener las geometrías perimetrales reales de cada parque.

**Políticas de Resiliencia del Servidor:**
- **Caché en memoria:** 5 minutos para calidad del aire y meteorología; 24 horas para catálogo de parques y geometrías OpenStreetMap.
- **Timeout controlado:** 12 segundos por petición.
- **Stale-While-Revalidate / Fallback caducado:** Si el origen municipal falla temporalmente o responde con lentitud, el servidor devuelve la última copia en caché marcada como `"status": "stale"`, evitando que el usuario sufra pantallas en blanco o datos inventados.
- **Transparencia telemétrica:** Cada respuesta incluye cabeceras y un objeto `meta` con `source`, `fetchedAt` (ISO), `status` (`"live" | "stale" | "error"`) y `dataTimestamp`.

---

## 📡 Fuentes Oficiales de Datos Abiertos

La aplicación se alimenta exclusivamente de fuentes abiertas verificadas:

1. **Calidad del Aire en Tiempo Real (Ayuntamiento de Madrid):**  
   [Dataset 212531](https://datos.madrid.es/dataset/212531-0-calidad-aire-tiempo-real)  
   Medición horaria de contaminantes criterio: Dióxido de nitrógeno ($NO_2$), partículas en suspensión ($PM_{10}$ y $PM_{2.5}$), ozono troposférico ($O_3$) y dióxido de azufre ($SO_2$) de la Red de Vigilancia de la Calidad del Aire.
2. **Meteorología en Tiempo Real (Ayuntamiento de Madrid):**  
   [Dataset 300754](https://datos.madrid.es/dataset/300754-0-meteorologia-tiempo-real-acumula)  
   Temperatura seca, humedad relativa, velocidad y dirección del viento y estado de precipitaciones.
3. **Catálogo de Parques y Zonas Verdes (Ayuntamiento de Madrid):**  
   [Dataset 200761](https://datos.madrid.es/dataset/200761-0-parques-jardines)  
   Información municipal, superficie en hectáreas y dotación de fuentes de agua potable.
4. **Geometría y Rutas Perimetrales (OpenStreetMap Overpass API):**  
   Extracción de los polígonos perimetrales reales para el dibujo cartográfico en Leaflet y la exportación de archivos **GPX** para relojes Garmin, Apple Watch o plataformas como Strava.

---

## 🔬 Rigor Científico y Criterios Fisiológicos

### 1. Índice Europeo de Calidad del Aire (EEA)
En lugar de escalas arbitrarias o fórmulas ad-hoc, la aplicación implementa las bandas oficiales del **European Air Quality Index** de la Agencia Europea de Medio Ambiente (EEA):

| Banda EEA | NO₂ (µg/m³) | PM₁₀ (µg/m³) | PM₂.₅ (µg/m³) | O₃ (µg/m³) |
|---|---|---|---|---|
| **Buena (Good)** | 0 – 40 | 0 – 20 | 0 – 10 | 0 – 50 |
| **Aceptable (Fair)** | 40 – 90 | 20 – 40 | 10 – 20 | 50 – 100 |
| **Moderada (Moderate)** | 90 – 120 | 40 – 50 | 20 – 25 | 100 – 130 |
| **Desfavorable (Poor)** | 120 – 230 | 50 – 100 | 25 – 50 | 130 – 240 |
| **Muy Desfavorable (Very Poor)** | 230 – 340 | 100 – 150 | 50 – 75 | 240 – 380 |
| **Extremadamente Desfavorable** | > 340 | > 150 | > 75 | > 380 |

*El índice global corresponde estrictamente al **peor subíndice** entre los contaminantes monitorizados.*

### 2. Tratamiento Honesto de Valores Telemétricos
- **Diferenciación estricta entre 0 y ausente (`null`):** Una medición de $0\text{ }\mu\text{g/m}^3$ es un valor físicamente posible y de alta calidad atmosférica. El sistema jamás convierte un 0 en dato ausente.
- **Validación de marcas V/N:** Se respetan las marcas de control de calidad oficiales del Ayuntamiento (`V` = dato validado, `N` = no validado / en calibración). Si no hay marcas validadas para el día en curso, el campo se establece como `null` y en la interfaz se muestra transparentemente **"Sin datos"**.
- **Aptitud Deportiva Nula ante Falta de Datos:** Si una estación no dispone de mediciones telemétricas de aire para la jornada, el puntaje de ejercicio (`exerciseScore`) se establece en `null` y la recomendación en `"No disponible"`.
- **Estación más cercana y complementación:** Cada parque se asocia a la estación de control más cercana mediante la **fórmula de Haversine**. Si la estación más próxima carece de sensor de partículas ($PM_{10}$ / $PM_{2.5}$), se complementa de forma indicada y explícita con la siguiente estación más cercana.

### 3. Fisiología del Ejercicio y Dosis Inhalada
- **Gasto ventilatorio:** Durante el reposo, una persona ventila ~8 L/min. Al caminar activamente la ventilación asciende a ~18 L/min, y al correr de forma continua se eleva a **45–60 L/min**.
- **Dosis acumulada:** La masa inhalada de contaminantes gaseosos y partículas se calcula mediante $Dosis = C \times \dot{V}_E \times t$.
- **Regla del corredor (+10 °C):** Al correr, el calor metabólico generado por la contracción muscular eleva la sensación térmica efectiva entre 8 °C y 10 °C respecto a la temperatura aparente en reposo. El módulo de indumentaria compensa este incremento para evitar el sobrecalentamiento o la sobreabrigación.
- **Sensación térmica documentada:** Calculada según la fórmula estándar de temperatura aparente del *Australian Bureau of Meteorology* combinando temperatura seca, presión de vapor / humedad y velocidad del viento.

### 4. Estacionalidad Botánica del Polen
A diferencia de heurísticas estáticas, el módulo de alergias aplica el **calendario aerobiológico oficial de Madrid**:
- **Plátano de sombra (*Platanus x hispanica*):** Polinización explosiva concentrada entre marzo y abril.
- **Arizónicas y cipreses (*Cupressaceae*):** Picos invernales entre enero y marzo.
- **Gramíneas silvestres (*Poaceae*):** Pico primaveral en mayo y junio.
- **Olivo (*Olea europaea*):** Finales de primavera (mayo y junio).
- Fuera de los meses activos de floración, el riesgo basal se mantiene bajo y no penaliza arbitrariamente el entrenamiento.
- Se etiqueta explícitamente en la interfaz: *"Estimación botánica estacional, no medición volumétrica directa de captadores"*.

---

## ⚠️ Limitaciones y Aviso de Salud

1. **Datos en Tiempo Real Pendientes de Validación:** Los datos automáticos horarios de la Red de Calidad del Aire se publican en tiempo real sin un proceso de validación final diferido, el cual el Ayuntamiento realiza posteriormente. La app refleja las marcas `V` presentes en el momento de consulta.
2. **Estimación Fenológica del Polen:** Los niveles polínicos se modelan a partir de la presencia botánica censada en el parque, la meteorología (viento, sequedad o lluvia) y el calendario estacional de la Comunidad de Madrid. No sustituyen los recuentos volumétricos en captadores de la Red Palinocam.
3. **Descargo de Responsabilidad Médica:** FitAir Parks Madrid es una herramienta informativa y de apoyo a la planificación del entrenamiento deportivo. **No constituye asesoramiento médico ni diagnóstico clínico.** Las personas con asma bronquial, enfermedades pulmonares obstructivas crónicas (EPOC), afecciones cardiovasculares o alergias severas deben seguir siempre las directrices de su médico especialista y consultar los avisos oficiales de Protección Civil o de las autoridades sanitarias.
