'use client';

// Dependency-free SVG charts for the dashboard. Sized via viewBox so they
// scale to their container; colors follow the violet/indigo brand.
import { useEffect, useRef, useState } from 'react';

export function LineChart({
  labels,
  values,
  max,
  threshold,
  thresholdLabel,
}: {
  labels: string[];
  values: number[];
  max: number;
  threshold?: number;
  thresholdLabel?: string;
}) {
  // Measure the actual rendered width so we can draw at 1:1 pixel scale — this
  // keeps axis text/points a readable size and the chart a sensible height on
  // narrow (mobile) screens instead of collapsing into a thin sliver.
  const ref = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setCw(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const W = cw || 640;
  const H = Math.round(Math.min(Math.max(W * 0.42, 160), 240));
  const padL = 34;
  const padR = 14;
  const padT = 16;
  const padB = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const n = values.length;

  const x = (i: number) => padL + (i * plotW) / (n - 1);
  const y = (v: number) => padT + (1 - v / max) * plotH;

  const linePts = values.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const areaPath = `M ${x(0)},${y(values[0])} ${values
    .map((v, i) => `L ${x(i)},${y(v)}`)
    .join(' ')} L ${x(n - 1)},${padT + plotH} L ${x(0)},${padT + plotH} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(f * max));

  // On a narrow chart not every x label fits: show an evenly spaced subset (always the last one)
  // and shorten long names, so labels never overlap.
  const maxLabels = Math.max(2, Math.floor(plotW / 78));
  const step = Math.ceil(n / maxLabels);
  const show = (i: number) => i === n - 1 || (i % step === 0 && n - 1 - i >= step);
  const short = (l: string) => (l.length > 12 ? `${l.slice(0, 11)}…` : l);

  return (
    <div ref={ref} className="mt-4 w-full">
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} className="block" role="img" aria-label="График активности">
      <defs>
        <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6d28d9" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#6d28d9" stopOpacity="0" />
        </linearGradient>
      </defs>

      {yTicks.map((t) => (
        <g key={t}>
          <line x1={padL} y1={y(t)} x2={W - padR} y2={y(t)} stroke="#eef0f3" strokeWidth="1" />
          <text x={padL - 8} y={y(t) + 3} textAnchor="end" fontSize="11" fill="#9ca3af">
            {t}
          </text>
        </g>
      ))}

      {threshold != null && (
        <g>
          <line x1={padL} y1={y(threshold)} x2={W - padR} y2={y(threshold)} stroke="#ef4444" strokeWidth="1.2" strokeDasharray="5 4" opacity="0.75" />
          {thresholdLabel && (
            <text x={W - padR} y={y(threshold) - 4} textAnchor="end" fontSize="11" fill="#ef4444">
              {thresholdLabel}
            </text>
          )}
        </g>
      )}

      <path d={areaPath} fill="url(#lineFill)" />
      <polyline points={linePts} fill="none" stroke="#4f46e5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r="2.6" fill="#4f46e5" stroke="#fff" strokeWidth="1.4" />
      ))}
      {labels.map((l, i) => show(i) && (
        <text key={i} x={x(i)} y={H - 7} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} fontSize="11" fill="#9ca3af">
          {short(l)}
        </text>
      ))}
    </svg>
    </div>
  );
}

export function DonutChart({
  segments,
  size = 180,
  thickness = 26,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
}) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const lens = segments.map((s) => (s.value / total) * c);
  const offsets = lens.map((_, i) => lens.slice(0, i).reduce((a, b) => a + b, 0));

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label="Кольцевая диаграмма">
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {segments.map((s, i) => {
          const len = lens[i];
          return (
            <circle
              key={s.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offsets[i]}
              strokeLinecap="butt"
            />
          );
        })}
      </g>
    </svg>
  );
}
