'use client';

import { useState } from 'react';

type TimeFilter = '7days' | '30days' | '3months';

interface EngagementChartProps {
  className?: string;
}

// Mock data for the chart
const mockData = {
  '7days': {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    views: [350, 420, 380, 450, 520, 480, 550],
    inquiries: [120, 150, 130, 180, 200, 170, 220],
    bookings: [40, 55, 45, 70, 85, 65, 90],
  },
  '30days': {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    views: [1400, 1250, 1550, 1700],
    inquiries: [520, 480, 620, 700],
    bookings: [180, 150, 220, 280],
  },
  '3months': {
    labels: ['May', 'Jun', 'Jul'],
    views: [950, 1050, 1400],
    inquiries: [350, 420, 580],
    bookings: [100, 180, 350],
  },
};

export function EngagementChart({ className }: EngagementChartProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('3months');
  const data = mockData[timeFilter];

  // Calculate chart dimensions
  const chartWidth = 800;
  const chartHeight = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  // Find max value for scaling
  const maxValue = Math.max(...data.views, ...data.inquiries, ...data.bookings);
  const yScale = graphHeight / (maxValue * 1.1);

  // Generate path for a data series
  const generatePath = (values: number[]) => {
    const xStep = graphWidth / (values.length - 1);
    return values
      .map((val, i) => {
        const x = padding.left + i * xStep;
        const y = padding.top + graphHeight - val * yScale;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  // Y-axis labels
  const yLabels = [0, maxValue * 0.25, maxValue * 0.5, maxValue * 0.75, maxValue].map(Math.round);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-normal text-black font-poppins">
          Engagement Over Time
        </h3>
        <div className="flex gap-2">
          {[
            { value: '7days' as TimeFilter, label: 'Last 7 Days' },
            { value: '30days' as TimeFilter, label: 'Last 30 Days' },
            { value: '3months' as TimeFilter, label: 'Last 3 Months' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setTimeFilter(filter.value)}
              className={`
                px-4 py-2 rounded-[20px] text-sm font-medium transition-colors
                ${timeFilter === filter.value
                  ? 'bg-[#232834] text-white'
                  : 'bg-[#f2f4f8] text-black hover:bg-slate-200'
                }
              `}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg p-4">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto">
          {/* Y-axis labels */}
          {yLabels.map((label, i) => {
            const y = padding.top + graphHeight - (label / maxValue) * graphHeight * 0.9;
            return (
              <text
                key={i}
                x={padding.left - 10}
                y={y}
                textAnchor="end"
                alignmentBaseline="middle"
                className="fill-slate-500 text-xs"
              >
                {label}
              </text>
            );
          })}

          {/* X-axis labels */}
          {data.labels.map((label, i) => {
            const x = padding.left + (i * graphWidth) / (data.labels.length - 1);
            return (
              <text
                key={i}
                x={x}
                y={chartHeight - 10}
                textAnchor="middle"
                className="fill-slate-500 text-xs"
              >
                {label}
              </text>
            );
          })}

          {/* Grid lines */}
          {yLabels.map((label, i) => {
            const y = padding.top + graphHeight - (label / maxValue) * graphHeight * 0.9;
            return (
              <line
                key={i}
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth={1}
              />
            );
          })}

          {/* Views line (blue) */}
          <path
            d={generatePath(data.views)}
            fill="none"
            stroke="#539dda"
            strokeWidth={3}
          />

          {/* Inquiries line (green) */}
          <path
            d={generatePath(data.inquiries)}
            fill="none"
            stroke="#4ade80"
            strokeWidth={3}
          />

          {/* Bookings line (red/coral) */}
          <path
            d={generatePath(data.bookings)}
            fill="none"
            stroke="#f87171"
            strokeWidth={3}
          />
        </svg>

        {/* Legend */}
        <div className="flex justify-center gap-8 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-[#539dda] rounded" />
            <span className="text-sm text-slate-600">Views</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-[#4ade80] rounded" />
            <span className="text-sm text-slate-600">Inquiries</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-[#f87171] rounded" />
            <span className="text-sm text-slate-600">Bookings</span>
          </div>
        </div>
      </div>
    </div>
  );
}
