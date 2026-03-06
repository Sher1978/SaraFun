import React from 'react';

interface ABCDChartProps {
    a: number; // 0-5
    b: number; // 0-5
    c: number; // 0-5
    d: number; // 0-5
    size?: number; // pixel width/height
}

export default function ABCDChart({ a, b, c, d, size = 48 }: ABCDChartProps) {
    const center = size / 2;
    const maxRadius = size / 2 - 4; // 4px padding

    const scale = (val: number) => (val / 5) * maxRadius;

    const getX = (val: number, angle: number) => center + scale(val) * Math.sin(angle);
    const getY = (val: number, angle: number) => center - scale(val) * Math.cos(angle);

    const points = `
    ${getX(a, 0)},${getY(a, 0)}
    ${getX(b, Math.PI / 2)},${getY(b, Math.PI / 2)}
    ${getX(c, Math.PI)},${getY(c, Math.PI)}
    ${getX(d, Math.PI * 1.5)},${getY(d, Math.PI * 1.5)}
  `.trim();

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible inline-block">
            {/* Background Diamond (Value = 5 reference edge) */}
            <polygon
                points={`
          ${getX(5, 0)},${getY(5, 0)}
          ${getX(5, Math.PI / 2)},${getY(5, Math.PI / 2)}
          ${getX(5, Math.PI)},${getY(5, Math.PI)}
          ${getX(5, Math.PI * 1.5)},${getY(5, Math.PI * 1.5)}
        `}
                fill="none"
                stroke="var(--tg-theme-hint-color, #999)"
                strokeOpacity={0.2}
                strokeWidth={1}
            />
            {/* 4 Axes Lines */}
            <line x1={center} y1={center - maxRadius} x2={center} y2={center + maxRadius} stroke="var(--tg-theme-hint-color, #999)" strokeOpacity={0.2} strokeWidth={1} />
            <line x1={center - maxRadius} y1={center} x2={center + maxRadius} y2={center} stroke="var(--tg-theme-hint-color, #999)" strokeOpacity={0.2} strokeWidth={1} />

            {/* Active Data Area */}
            <polygon
                points={points}
                fill="rgba(20, 184, 166, 0.4)" // Teal glow
                stroke="rgba(13, 148, 136, 1)"
                strokeWidth={1.5}
                className="transition-all duration-300 ease-in-out"
            />
        </svg>
    );
}
