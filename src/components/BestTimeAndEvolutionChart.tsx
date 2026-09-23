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
import { Clock, TrendingDown, Sun, ShieldAlert, Sparkles, BarChart2, Info } from 'lucide-react';

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
  const [activeMetric, setActiveMetric] = useState<'no2' | 'aqi'>('no2');

  const hourlyData = selectedPark?.hourlyEvolution || [];

  // Filter valid data points
  const validPoints = hourlyData.filter(
    (d): d is typeof d & { no2: number } => d.no2 !== null && typeof d.no2 === 'number'
  );

  const lowestPoint = [...validPoints].sort((a, b) => a.no2 - b.no2)[0];
  const highestPoint = [...validPoints].sort((a, b) => b.no2 - a.no2)[0];

  const reductionPercent =
    highestPoint && lowestPoint && highestPoint.no2 > 0
      ? Math.round(((highestPoint.no2 - lowestPoint.no2) / highestPoint.no2) * 100)
      : null;

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
      datasetLabel = 'Índice de Calidad del Aire EEA';
      dataValues = hourlyData.map((d) => d.aqi);
      borderColor = '#10b981';
      backgroundColor = 'rgba(16, 185, 129, 0.15)';
      unit = ' EEA';
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
            data: dataValues as (number | null)[],
            borderColor,
            backgroundColor,
            fill: true,
            tension: 0.35,
            borderWidth: 3,
            spanGaps: true,
            pointBackgroundColor: hourlyData.map((d) =>
              d.isOptimalWindow ? '#ffffff' : borderColor
            ),
            pointBorderColor: borderColor,
            pointBorderWidth: 2,
            pointRadius: (ctxItem) => {
              const idx = ctxItem.dataIndex;
              return hourlyData[idx]?.isOptimalWindow ? 6 : 4;
            },
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
            backgroundColor: isHighContrast ? '#000000' : '#141414',
            titleColor: '#ffffff',
            bodyColor: '#e5e5e5',
            borderColor: '#333333',
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            usePointStyle: true,
            callbacks: {
              label: (context) => {
                const val = context.parsed.y;
                return ` ${datasetLabel}: ${val !== null && val !== undefined ? val : 'Sin dato'}${unit}`;
              },
              afterLabel: (context) => {
                const item = hourlyData[context.dataIndex];
                if (!item) return '';
                const parts: string[] = [];
                if (item.isOptimalWindow) parts.push('✓ Ventana Óptima Recomendada');
                if (item.note) parts.push(item.note);
                return parts.join('\n');
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: isHighContrast ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
            },
            ticks: {
              color: isHighContrast ? '#404040' : '#888888',
              font: { size: 10, family: 'Montserrat, sans-serif' },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 12,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: isHighContrast ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
            },
            ticks: {
              color: isHighContrast ? '#404040' : '#888888',
              font: { size: 10, family: 'Montserrat, sans-serif' },
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
      className={`rounded-3xl p-5 sm:p-7 border transition-all ${
        isHighContrast
          ? 'bg-white border-black text-black shadow-xl'
          : 'bg-[#121212] border-neutral-850 text-white shadow-2xl'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#ff5500]/15 text-[#ff5500] border border-[#ff5500]/30 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ff5500] font-['Montserrat',sans-serif]">
                EVOLUCIÓN HORARIA H01-H24 (TELEMETRÍA REAL)
              </span>
            </div>
            <h3 className="text-xl font-black tracking-tight font-['Montserrat',sans-serif]">
              {selectedPark ? selectedPark.name : 'Parque Seleccionado'}
            </h3>
          </div>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex items-center gap-1.5 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveMetric('no2')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMetric === 'no2'
                ? 'bg-[#ff5500] text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            NO₂ (Dióxido)
          </button>
          <button
            onClick={() => setActiveMetric('aqi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMetric === 'aqi'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Índice EEA
          </button>
        </div>
      </div>

      {/* Reduction banner if valid points exist */}
      {lowestPoint && highestPoint && reductionPercent !== null && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                Mejor Hora para Entrenar
              </span>
              <span className="text-base font-black text-white font-mono">
                {lowestPoint.hour} h ({lowestPoint.no2} µg/m³)
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-red-400 block">
                Hora de Mayor Pico
              </span>
              <span className="text-base font-black text-white font-mono">
                {highestPoint.hour} h ({highestPoint.no2} µg/m³)
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-500/30 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 shrink-0">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-sky-400 block">
                Reducción de Inhalación
              </span>
              <span className="text-base font-black text-white font-mono">
                -{reductionPercent}% entrenando en hora óptima
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Chart Canvas or Fallback */}
      {hourlyData.length > 0 ? (
        <div className="relative w-full h-64 sm:h-72">
          <canvas ref={chartCanvasRef} />
        </div>
      ) : (
        <div className="h-48 flex flex-col items-center justify-center text-center p-6 border border-dashed border-neutral-800 rounded-2xl">
          <Info className="w-8 h-8 text-neutral-500 mb-2" />
          <p className="text-sm font-bold text-neutral-300">
            Sin telemetría horaria disponible para este parque hoy
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            La estación municipal no ha validado horas H01..H24 para esta fecha.
          </p>
        </div>
      )}

      {/* Caption */}
      <div className="mt-4 pt-3 border-t border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-neutral-400">
        <span>
          📡 Curva obtenida de las marcas validadas (V) del dataset 212531 del Ayuntamiento de Madrid.
        </span>
        <span className="font-mono text-neutral-500">
          Estación: {selectedPark?.airQuality.stationName || 'Red Municipal'}
        </span>
      </div>
    </div>
  );
};
