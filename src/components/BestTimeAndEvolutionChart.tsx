import React, { useEffect, useRef, useState } from 'react';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { MadridPark } from '../types';
import { Clock, TrendingDown, Sun, ShieldAlert, Sparkles, BarChart2 } from 'lucide-react';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface BestTimeAndEvolutionChartProps {
  selectedPark: MadridPark | null;
  isHighContrast?: boolean;
}

export const BestTimeAndEvolutionChart: React.FC<BestTimeAndEvolutionChartProps> = ({
  selectedPark,
  isHighContrast = false,
}) => {
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [activeMetric, setActiveMetric] = useState<'no2' | 'aqi' | 'temp'>('no2');

  const hourlyData = selectedPark?.hourlyEvolution || [];

  // Determine optimal hour
  const lowestPoint = [...hourlyData].sort((a, b) => a.no2 - b.no2)[0];
  const highestPoint = [...hourlyData].sort((a, b) => b.no2 - a.no2)[0];

  const reductionPercent =
    highestPoint && lowestPoint && highestPoint.no2 > 0
      ? Math.round(((highestPoint.no2 - lowestPoint.no2) / highestPoint.no2) * 100)
      : 28;

  useEffect(() => {
    if (!chartCanvasRef.current || hourlyData.length === 0) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const labels = hourlyData.map((d) => d.hour);
    let datasetLabel = 'Dióxido de Nitrógeno NO₂ (µg/m³)';
    let dataValues = hourlyData.map((d) => d.no2);
    let borderColor = '#ff5500';
    let backgroundColor = 'rgba(255, 85, 0, 0.15)';
    let unit = ' µg/m³';

    if (activeMetric === 'aqi') {
      datasetLabel = 'Índice de Calidad del Aire (ICA)';
      dataValues = hourlyData.map((d) => d.aqi);
      borderColor = '#10b981';
      backgroundColor = 'rgba(16, 185, 129, 0.15)';
      unit = ' ICA';
    } else if (activeMetric === 'temp') {
      datasetLabel = 'Temperatura Ambiente (°C)';
      dataValues = hourlyData.map((d) => d.temperature);
      borderColor = '#38bdf8';
      backgroundColor = 'rgba(56, 189, 248, 0.15)';
      unit = ' °C';
    }

    const ctx = chartCanvasRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: datasetLabel,
            data: dataValues,
            borderColor,
            backgroundColor,
            fill: true,
            tension: 0.35,
            borderWidth: 3,
            pointBackgroundColor: hourlyData.map((d) =>
              d.isOptimalWindow ? '#ffffff' : borderColor
            ),
            pointBorderColor: borderColor,
            pointRadius: hourlyData.map((d) => (d.isOptimalWindow ? 7 : 4)),
            pointHoverRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: isHighContrast ? '#000000' : '#111111',
            titleColor: '#ffffff',
            bodyColor: '#e5e5e5',
            borderColor: '#ff5500',
            borderWidth: 1,
            padding: 10,
            displayColors: false,
            callbacks: {
              label: (context) => {
                const idx = context.dataIndex;
                const point = hourlyData[idx];
                return [
                  `${datasetLabel}: ${context.parsed.y}${unit}`,
                  point.note ? `Nota: ${point.note}` : '',
                ].filter(Boolean);
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: isHighContrast ? 'rgba(0,0,0,0.1)' : 'rgba(255, 255, 255, 0.06)',
            },
            ticks: {
              color: isHighContrast ? '#000000' : '#888888',
              font: {
                weight: 'bold',
                size: 11,
              },
            },
          },
          y: {
            grid: {
              color: isHighContrast ? 'rgba(0,0,0,0.1)' : 'rgba(255, 255, 255, 0.06)',
            },
            ticks: {
              color: isHighContrast ? '#000000' : '#888888',
              font: {
                size: 11,
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [hourlyData, activeMetric, isHighContrast]);

  return (
    <div
      className={`rounded-3xl p-5 sm:p-6 border transition-all ${
        isHighContrast
          ? 'bg-white border-black text-black shadow-lg'
          : 'bg-[#111111] border-neutral-850 shadow-2xl text-white'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#ff5500]/15 text-[#ff5500] border border-[#ff5500]/30">
              <Clock className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#ff5500] font-['Montserrat',sans-serif]">
              PREDICTOR DE MEJOR FRANJA HORARIA & TENDENCIA
            </span>
          </div>
          <h3 className="text-xl font-black tracking-tight font-['Montserrat',sans-serif]">
            {selectedPark ? `Evolución Diaria en ${selectedPark.name}` : 'Evolución Horaria en Madrid'}
          </h3>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-900 border border-neutral-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveMetric('no2')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMetric === 'no2'
                ? 'bg-[#ff5500] text-black font-extrabold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            NO₂ (µg/m³)
          </button>
          <button
            onClick={() => setActiveMetric('aqi')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMetric === 'aqi'
                ? 'bg-emerald-500 text-black font-extrabold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            ICA
          </button>
          <button
            onClick={() => setActiveMetric('temp')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMetric === 'temp'
                ? 'bg-sky-400 text-black font-extrabold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Temp °C
          </button>
        </div>
      </div>

      {/* Best Hour Recommendation Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-neutral-900 border border-emerald-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                ⭐ Ventana Óptima Sugerida para Entrenar
              </span>
              <span className="text-[10px] bg-emerald-500 text-black font-extrabold px-2 py-0.5 rounded-full">
                -{reductionPercent}% NO₂
              </span>
            </div>
            <p className="text-xs text-neutral-200 mt-1 leading-relaxed">
              Hoy la mejor hora para correr o andar es a las{' '}
              <strong className="text-white font-extrabold font-mono text-sm">
                {lowestPoint?.hour || '20:30'} h
              </strong>
              : el nivel de dióxido de nitrógeno es un{' '}
              <strong className="text-emerald-400">{reductionPercent}% menor</strong> respecto a la hora punta vespertina, con temperatura templada y máxima dispersión.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-xs border-t md:border-t-0 md:border-l border-neutral-800 pt-2 md:pt-0 md:pl-4">
          <div>
            <div className="text-[10px] uppercase font-bold text-neutral-400">Ventana Matinal</div>
            <div className="font-extrabold text-white font-mono">07:00 - 08:30 h</div>
          </div>
          <div className="h-6 w-px bg-neutral-800" />
          <div>
            <div className="text-[10px] uppercase font-bold text-neutral-400">Ventana Noche</div>
            <div className="font-extrabold text-white font-mono">20:30 - 22:30 h</div>
          </div>
        </div>
      </div>

      {/* Avoid Peak Warning */}
      <div className="mb-4 flex items-center gap-2 text-xs text-neutral-400">
        <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
        <span>
          <strong>Franjas a evitar:</strong> 08:15 a 09:30 h y 18:30 a 20:00 h (pico de tráfico en accesos a M-30, A-6 y Castellana).
        </span>
      </div>

      {/* Chart.js Canvas */}
      <div className="relative w-full h-[240px] sm:h-[280px]">
        <canvas ref={chartCanvasRef} />
      </div>

      {/* Legend & Guide Footer */}
      <div className="mt-4 pt-3 border-t border-neutral-800/80 flex flex-wrap items-center justify-between text-[11px] text-neutral-400 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white border border-[#ff5500]"></span>
            <span>Puntos blancos = Ventanas doradas de entrenamiento</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#ff5500]"></span>
            <span>Límite guía OMS: 40 µg/m³ anual / 25 µg/m³ 24h</span>
          </div>
        </div>
        <div className="font-mono text-[10px] text-neutral-500">
          Estación vinculada: {selectedPark?.airQuality.stationName || 'Red Municipal'}
        </div>
      </div>
    </div>
  );
};
