"use client";

import React, { useState } from "react";

// ==========================================
// DONUT CHART
// ==========================================
interface DonutItem {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutItem[];
  title?: string;
}

export function DonutChart({ data, title }: DonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  // SVG calculations
  const size = 200;
  const radius = 70;
  const strokeWidth = 18;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  // Render segments
  const segments = data.map((item, idx) => {
    const percentage = total > 0 ? item.value / total : 0;
    const strokeLength = percentage * circumference;
    const strokeOffset = circumference - currentOffset;
    currentOffset += strokeLength;

    const isHovered = activeIndex === idx;

    return {
      ...item,
      percentage,
      strokeLength,
      strokeOffset,
      isHovered,
    };
  });

  const activeSegment = activeIndex !== null ? segments[activeIndex] : null;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {title && <h4 className="text-sm font-bold text-gray-700 mb-4">{title}</h4>}
      
      <div className="relative w-[200px] h-[200px]">
        <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
          />
          {total > 0 &&
            segments.map((seg, idx) => {
              if (seg.value === 0) return null;
              return (
                <circle
                  key={idx}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={seg.isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={`${seg.strokeLength} ${circumference}`}
                  strokeDashoffset={seg.strokeOffset}
                  strokeLinecap="round"
                  className="transition-all duration-300 cursor-pointer origin-center hover:scale-[1.02]"
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(null)}
                />
              );
            })}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          {activeSegment ? (
            <>
              <span className="text-2xl font-extrabold text-gray-900 leading-none">
                {activeSegment.value}
              </span>
              <span className="text-[11px] font-bold mt-1 uppercase tracking-wider text-gray-500 truncate max-w-full">
                {activeSegment.label}
              </span>
              <span className="text-xs text-gray-400 mt-0.5">
                {Math.round(activeSegment.percentage * 100)}%
              </span>
            </>
          ) : (
            <>
              <span className="text-3xl font-extrabold text-gray-900 leading-none">
                {total}
              </span>
              <span className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
                Total Patients
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-5 w-full">
        {data.map((item, idx) => {
          const isSelected = activeIndex === idx;
          const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div
              key={idx}
              className={`flex items-center gap-2 px-2 py-1 rounded-lg cursor-pointer transition-colors ${
                isSelected ? "bg-gray-50" : "hover:bg-gray-50/50"
              }`}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700 truncate">{item.label}</p>
                <p className="text-[10px] text-gray-400 font-medium">
                  {item.value} ({percentage}%)
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// BAR CHART (HORIZONTAL RISK PROGRESS BARS)
// ==========================================
interface BarItem {
  label: string;
  value: number;
  color: string;
}

interface BarChartProps {
  data: BarItem[];
  title?: string;
}

export function BarChart({ data, title }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="p-4 space-y-4">
      {title && <h4 className="text-sm font-bold text-gray-800 tracking-wide">{title}</h4>}
      <div className="space-y-3.5">
        {data.map((item, idx) => {
          const percent = total > 0 ? (item.value / total) * 100 : 0;
          const widthPercent = (item.value / max) * 100;
          return (
            <div key={idx} className="space-y-1 group">
              <div className="flex justify-between items-center text-xs font-medium">
                <span className="text-gray-600 font-semibold">{item.label}</span>
                <span className="text-gray-900 font-bold">
                  {item.value} <span className="text-[10px] text-gray-400 font-normal">({Math.round(percent)}%)</span>
                </span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out origin-left group-hover:brightness-95"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// LINE CHART (TREND CHART WITH REF RANGES)
// ==========================================
interface LineDataPoint {
  date: string | Date;
  value: number;
}

interface LineChartProps {
  data: LineDataPoint[];
  referenceRange?: {
    min: number;
    max: number;
  };
  unit?: string;
  color?: string;
  label?: string;
}

export function LineChart({
  data,
  referenceRange,
  unit = "",
  color = "#4f46e5",
  label = "Metric Value",
}: LineChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    value: number;
    date: Date;
    index: number;
  } | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[240px] border border-dashed border-gray-200 rounded-xl bg-gray-50">
        <p className="text-sm text-gray-500 font-medium">Not enough historical data points.</p>
      </div>
    );
  }

  // Sort data chronologically
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // dimensions
  const width = 500;
  const height = 240;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 35;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // values range
  const values = sortedData.map((d) => d.value);
  let minVal = Math.min(...values);
  let maxVal = Math.max(...values);

  if (referenceRange) {
    minVal = Math.min(minVal, referenceRange.min);
    maxVal = Math.max(maxVal, referenceRange.max);
  }

  // Add margin around min/max
  const valueRange = maxVal - minVal;
  const margin = valueRange === 0 ? 10 : valueRange * 0.15;
  const yMin = Math.max(0, minVal - margin);
  const yMax = maxVal + margin;

  // Coordinate mappers
  const getX = (index: number) => {
    if (sortedData.length <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (sortedData.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const range = yMax - yMin;
    if (range === 0) return paddingTop + chartHeight / 2;
    return paddingTop + chartHeight - ((val - yMin) / range) * chartHeight;
  };

  // SVG elements path
  let pathD = "";
  let areaD = "";

  const points = sortedData.map((d, i) => ({
    x: getX(i),
    y: getY(d.value),
    value: d.value,
    date: new Date(d.date),
  }));

  points.forEach((pt, i) => {
    if (i === 0) {
      pathD = `M ${pt.x} ${pt.y}`;
      areaD = `M ${pt.x} ${paddingTop + chartHeight} L ${pt.x} ${pt.y}`;
    } else {
      pathD += ` L ${pt.x} ${pt.y}`;
      areaD += ` L ${pt.x} ${pt.y}`;
    }
    if (i === points.length - 1) {
      areaD += ` L ${pt.x} ${paddingTop + chartHeight} Z`;
    }
  });

  // Reference Range Area
  let refAreaD = "";
  if (referenceRange) {
    const yTop = getY(referenceRange.max);
    const yBottom = getY(referenceRange.min);
    refAreaD = `M ${paddingLeft} ${yTop} L ${paddingLeft + chartWidth} ${yTop} L ${paddingLeft + chartWidth} ${yBottom} L ${paddingLeft} ${yBottom} Z`;
  }

  // Y-axis tick calculations
  const yTicks = 4;
  const tickValues: number[] = [];
  for (let i = 0; i < yTicks; i++) {
    tickValues.push(yMin + (i * (yMax - yMin)) / (yTicks - 1));
  }

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        className="overflow-visible select-none"
      >
        <defs>
          <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0.01} />
          </linearGradient>
        </defs>

        {/* Shaded Reference Range (Background) */}
        {referenceRange && (
          <path
            d={refAreaD}
            fill="#e2e8f0"
            fillOpacity={0.4}
            stroke="#cbd5e1"
            strokeWidth={0.75}
            strokeDasharray="4 4"
          />
        )}

        {/* Grid lines (horizontal) */}
        {tickValues.map((val, idx) => {
          const y = getY(val);
          return (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <text
                x={paddingLeft - 8}
                y={y + 3.5}
                textAnchor="end"
                className="text-[10px] fill-gray-400 font-mono font-medium"
              >
                {Math.round(val * 10) / 10}
              </text>
            </g>
          );
        })}

        {/* X-axis labels (Dates) */}
        {points.map((pt, idx) => {
          // Limit X axis labels to prevent overlap
          const showLabel = points.length < 6 || idx === 0 || idx === points.length - 1 || (points.length === 7 && idx === 3);
          if (!showLabel) return null;
          return (
            <g key={idx}>
              <line
                x1={pt.x}
                y1={paddingTop + chartHeight}
                x2={pt.x}
                y2={paddingTop + chartHeight + 4}
                stroke="#d1d5db"
                strokeWidth={1}
              />
              <text
                x={pt.x}
                y={paddingTop + chartHeight + 16}
                textAnchor="middle"
                className="text-[10px] fill-gray-400 font-semibold"
              >
                {pt.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </text>
            </g>
          );
        })}

        {/* Reference Range Text */}
        {referenceRange && (
          <g>
            <text
              x={width - paddingRight - 4}
              y={getY(referenceRange.max) - 4}
              textAnchor="end"
              className="text-[8px] fill-slate-500 font-bold uppercase tracking-wider"
            >
              Ref Upper Limit ({referenceRange.max})
            </text>
            <text
              x={width - paddingRight - 4}
              y={getY(referenceRange.min) + 10}
              textAnchor="end"
              className="text-[8px] fill-slate-500 font-bold uppercase tracking-wider"
            >
              Ref Lower Limit ({referenceRange.min})
            </text>
          </g>
        )}

        {/* Line & Area */}
        {points.length > 0 && (
          <>
            <path d={areaD} fill="url(#chart-area-grad)" />
            <path
              d={pathD}
              fill="transparent"
              stroke={color}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}

        {/* Hover vertical guide line */}
        {hoveredPoint && (
          <line
            x1={hoveredPoint.x}
            y1={paddingTop}
            x2={hoveredPoint.x}
            y2={paddingTop + chartHeight}
            stroke={color}
            strokeWidth={1.5}
            strokeDasharray="4 2"
            className="transition-all duration-100"
          />
        )}

        {/* Data points (circles) & Hover triggers */}
        {points.map((pt, idx) => {
          const isHovered = hoveredPoint && hoveredPoint.index === idx;
          const isOutOfRange =
            referenceRange &&
            (pt.value < referenceRange.min || pt.value > referenceRange.max);

          return (
            <g key={idx}>
              {/* Outer stroke for alert */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 8 : 4.5}
                fill={isOutOfRange ? "#f43f5e" : color}
                stroke="#ffffff"
                strokeWidth={isHovered ? 2.5 : 1.5}
                className="transition-all duration-200"
              />
              {/* Invisible interactive zone for easier mouse hovering */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={24}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() =>
                  setHoveredPoint({
                    x: pt.x,
                    y: pt.y,
                    value: pt.value,
                    date: pt.date,
                    index: idx,
                  })
                }
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip HTML Overlay */}
      {hoveredPoint && (
        <div
          className="absolute z-10 bg-white border border-gray-100 text-gray-900 px-3 py-2 rounded-xl shadow-elevated flex flex-col pointer-events-none transition-all duration-100 min-w-[120px]"
          style={{
            left: `${(hoveredPoint.x / width) * 100}%`,
            top: `${(hoveredPoint.y / height) * 100 - 60}%`,
            transform: "translate(-50%, -20px)",
          }}
        >
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">
            {hoveredPoint.date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="text-sm font-black text-gray-900 mt-0.5">
            {hoveredPoint.value}
            <span className="text-xs font-normal text-gray-500 ml-0.5">{unit}</span>
          </span>
          <span className="text-[9px] font-bold text-brand-600 mt-1 uppercase tracking-wide">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
