'use client';

interface EventTypeBreakdownProps {
  className?: string;
}

// Mock data
const mockData = [
  { name: 'Wedding', value: 45, color: '#539dda' },
  { name: 'Corporate', value: 30, color: '#4ade80' },
  { name: 'Private', value: 25, color: '#f87171' },
];

const total = mockData.reduce((sum, item) => sum + item.value, 0);

export function EventTypeBreakdown({ className }: EventTypeBreakdownProps) {
  // Calculate pie slices
  const size = 200;
  const center = size / 2;
  const radius = 80;
  const innerRadius = 50;

  let currentAngle = -90; // Start from top

  const slices = mockData.map((item) => {
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    // Convert angles to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Calculate arc path
    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);
    const x3 = center + innerRadius * Math.cos(endRad);
    const y3 = center + innerRadius * Math.sin(endRad);
    const x4 = center + innerRadius * Math.cos(startRad);
    const y4 = center + innerRadius * Math.sin(startRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const path = `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
      Z
    `;

    return {
      ...item,
      path,
    };
  });

  return (
    <div className={`bg-[rgba(224,219,255,0.2)] border border-[rgba(0,0,0,0.1)] rounded-[15px] p-6 ${className}`}>
      <div className="flex items-center justify-center gap-8">
        {/* Pie Chart */}
        <div className="relative">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {slices.map((slice, i) => (
              <path
                key={i}
                d={slice.path}
                fill={slice.color}
                className="transition-opacity hover:opacity-80"
              />
            ))}
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-[#539dda]">${(total * 16).toLocaleString()}</span>
            <span className="text-sm text-slate-500">Total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-3">
          {mockData.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-lg text-black font-poppins">
                {item.value}
              </span>
              <span className="text-lg text-slate-600">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
