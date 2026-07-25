// Dependency-free SVG charts for the dashboard. Sized via viewBox so they
// scale to their container; colors follow the violet/indigo brand.

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
  // Wide viewBox so the SVG barely upscales — keeps axis text small/crisp.
  const W = 1000;
  const H = 230;
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

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 w-full" role="img" aria-label="График активности">
      <defs>
        <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6d28d9" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#6d28d9" stopOpacity="0" />
        </linearGradient>
      </defs>

      {yTicks.map((t) => (
        <g key={t}>
          <line x1={padL} y1={y(t)} x2={W - padR} y2={y(t)} stroke="#eef0f3" strokeWidth="1" />
          <text x={padL - 8} y={y(t) + 3} textAnchor="end" fontSize="9" fill="#9ca3af">
            {t}
          </text>
        </g>
      ))}

      {threshold != null && (
        <g>
          <line x1={padL} y1={y(threshold)} x2={W - padR} y2={y(threshold)} stroke="#ef4444" strokeWidth="1.2" strokeDasharray="5 4" opacity="0.75" />
          {thresholdLabel && (
            <text x={W - padR} y={y(threshold) - 4} textAnchor="end" fontSize="9" fill="#ef4444">
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
      {labels.map((l, i) => (
        <text key={l} x={x(i)} y={H - 7} textAnchor="middle" fontSize="9" fill="#9ca3af">
          {l}
        </text>
      ))}
    </svg>
  );
}

export function BarChart({
  labels,
  values,
  max,
}: {
  labels: string[];
  values: number[];
  max: number;
}) {
  const W = 520;
  const H = 220;
  const padL = 10;
  const padR = 10;
  const padT = 10;
  const padB = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const n = values.length;
  const slot = plotW / n;
  const barW = slot * 0.5;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" role="img" aria-label="Столбчатый график">
      {values.map((v, i) => {
        const h = (v / max) * plotH;
        const bx = padL + i * slot + (slot - barW) / 2;
        const by = padT + plotH - h;
        return (
          <g key={i}>
            <rect x={bx} y={by} width={barW} height={h} rx="5" fill="#6d28d9" opacity={0.85} />
            <text x={bx + barW / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="#9ca3af">
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Sparkline({ values, color = '#6d28d9' }: { values: number[]; color?: string }) {
  const W = 200;
  const H = 44;
  const pad = 3;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const x = (i: number) => pad + (i * (W - 2 * pad)) / (values.length - 1);
  const y = (v: number) => pad + (1 - (v - min) / range) * (H - 2 * pad);
  const pts = values.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const area = `M ${x(0)},${y(values[0])} ${values
    .map((v, i) => `L ${x(i)},${y(v)}`)
    .join(' ')} L ${x(values.length - 1)},${H} L ${x(0)},${H} Z`;
  const gid = `spark_${color.replace('#', '')}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-10 w-full" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function RadarChart({
  axes,
  series,
  max = 100,
  size = 260,
}: {
  axes: string[];
  series: { label: string; color: string; values: number[] }[];
  max?: number;
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 34;
  const n = axes.length;
  const ang = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, frac: number): [number, number] => [
    cx + frac * r * Math.cos(ang(i)),
    cy + frac * r * Math.sin(ang(i)),
  ];
  const rings = [0.25, 0.5, 0.75, 1];
  const P = 52; // room for full axis labels

  return (
    <svg viewBox={`${-P} ${-20} ${size + 2 * P} ${size + 40}`} className="w-full max-w-[340px]" role="img" aria-label="Радар точности по разделам">
      {rings.map((f) => (
        <polygon key={f} points={axes.map((_, i) => pt(i, f).join(',')).join(' ')} fill="none" stroke="#e5e7eb" strokeWidth="1" />
      ))}
      {axes.map((_, i) => {
        const [x, y] = pt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e5e7eb" strokeWidth="1" />;
      })}
      {series.map((s) => (
        <polygon
          key={s.label}
          points={s.values.map((v, i) => pt(i, v / max).join(',')).join(' ')}
          fill={s.color}
          fillOpacity="0.08"
          stroke={s.color}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      ))}
      {axes.map((a, i) => {
        const [x, y] = pt(i, 1.14);
        const anchor = Math.abs(x - cx) < 8 ? 'middle' : x > cx ? 'start' : 'end';
        return (
          <text key={a} x={x} y={y + 3} textAnchor={anchor} fontSize="12" fill="#64748b">
            {a}
          </text>
        );
      })}
    </svg>
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
  let offset = 0;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label="Кольцевая диаграмма">
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {segments.map((s) => {
          const len = (s.value / total) * c;
          const seg = (
            <circle
              key={s.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return seg;
        })}
      </g>
    </svg>
  );
}
