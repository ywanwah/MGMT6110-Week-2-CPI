import { useState } from 'react';
import type { MonthlyDataPoint } from '../types';

interface CpiTrendChartProps {
  data: MonthlyDataPoint[];
}

export function CpiTrendChart({ data }: CpiTrendChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return null;
  }

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const padding = (maxVal - minVal) * 0.15 || 0.5;
  const yMin = Math.floor((minVal - padding) * 10) / 10;
  const yMax = Math.ceil((maxVal + padding) * 10) / 10;

  const width = 800;
  const height = 240;
  const chartPadLeft = 50;
  const chartPadRight = 20;
  const chartPadTop = 20;
  const chartPadBottom = 40;

  const plotW = width - chartPadLeft - chartPadRight;
  const plotH = height - chartPadTop - chartPadBottom;

  const getX = (idx: number) => chartPadLeft + (idx / (data.length - 1)) * plotW;
  const getY = (val: number) => chartPadTop + plotH - ((val - yMin) / (yMax - yMin)) * plotH;

  const pointsString = data
    .map((d, i) => `${getX(i)},${getY(d.value)}`)
    .join(' ');

  // Gradient area path
  const areaPath = `M ${getX(0)},${chartPadTop + plotH} L ${data
    .map((d, i) => `${getX(i)},${getY(d.value)}`)
    .join(' L ')} L ${getX(data.length - 1)},${chartPadTop + plotH} Z`;

  // 4 horizontal grid lines
  const gridSteps = 4;
  const gridLines = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const val = yMin + (i / gridSteps) * (yMax - yMin);
    const y = getY(val);
    return { val: val.toFixed(1), y };
  });

  const activePoint = hoveredIndex !== null ? data[hoveredIndex] : data[data.length - 1];
  const activeIdx = hoveredIndex !== null ? hoveredIndex : data.length - 1;

  return (
    <div id="cpi-trend-section" className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-2 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
            18-Month CPI Trend (All Items)
          </h2>
          <p className="text-xs text-slate-500">
            Monthly movement from {data[0]?.period} to {data[data.length - 1]?.period}
          </p>
        </div>

        {activePoint && (
          <div className="flex items-center gap-3 text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium">Selected:</span>
            <span className="font-semibold text-slate-800">{activePoint.period}</span>
            <span className="font-mono font-bold text-blue-600">{activePoint.value.toFixed(3)}</span>
          </div>
        )}
      </div>

      <div className="w-full overflow-x-auto">
        <div className="min-w-[600px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
            <defs>
              <linearGradient id="cpiAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {gridLines.map((g, i) => (
              <g key={i}>
                <line
                  x1={chartPadLeft}
                  y1={g.y}
                  x2={width - chartPadRight}
                  y2={g.y}
                  stroke="#e2e8f0"
                  strokeDasharray="4,4"
                  strokeWidth="1"
                />
                <text
                  x={chartPadLeft - 8}
                  y={g.y + 4}
                  textAnchor="end"
                  fontSize="11"
                  className="fill-slate-400 font-mono"
                >
                  {g.val}
                </text>
              </g>
            ))}

            {/* Area */}
            <path d={areaPath} fill="url(#cpiAreaGradient)" />

            {/* Trend Line */}
            <polyline
              points={pointsString}
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Points and hover targets */}
            {data.map((d, i) => {
              const cx = getX(i);
              const cy = getY(d.value);
              const isHovered = i === activeIdx;

              return (
                <g key={d.period} className="cursor-pointer" onMouseEnter={() => setHoveredIndex(i)}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 5.5 : 3}
                    className={isHovered ? 'fill-blue-600 stroke-white stroke-2' : 'fill-white stroke-blue-600 stroke-2'}
                  />
                  {/* Invisible larger hover hit area */}
                  <circle cx={cx} cy={cy} r="14" fill="transparent" />

                  {/* X-axis labels every 2nd or 3rd month and endpoints */}
                  {(i % 3 === 0 || i === data.length - 1) && (
                    <text
                      x={cx}
                      y={height - 12}
                      textAnchor="middle"
                      fontSize="10"
                      className="fill-slate-500 font-medium"
                    >
                      {d.period.replace(/^\d{4}\s/, '') + "'" + d.period.slice(2, 4)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
