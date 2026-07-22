// Dependency-free SVG charts for the dashboard. Sized via viewBox so they
// scale to their container; colors follow the violet/indigo brand.

export function LineChart({
  labels,
  values,
  max,
}: {
  labels: string[];
  values: number[];
  max: number;
}) {
  const W = 760;
  const H = 260;
  const padL = 44;
  const padR = 12;
  const padT = 12;
  const padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const n = values.length;

  const x = (i: number) => padL + (i * plotW) / (n - 1);
  const y = (v: number) => padT + (1 - v / max) * plotH;

  const linePts = values.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const areaPath = `M ${x(0)},${y(values[0])} ${values
    .map((v, i) => `L ${x(i)},${y(v)}`)
    .join(' ')} L ${x(n - 1)},${padT + plotH} L ${x(0)},${padT + plotH} Z`;

  const yTicks = [0, max / 3, (max / 3) * 2, max].map((t) => Math.round(t));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 w-full" role="img" aria-label="График активности">
      <defs>
        <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6d28d9" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#6d28d9" stopOpacity="0" />
        </linearGradient>
      </defs>

      {yTicks.map((t) => (
        <g key={t}>
          <line x1={padL} y1={y(t)} x2={W - padR} y2={y(t)} stroke="#eef0f3" strokeWidth="1" />
          <text x={padL - 10} y={y(t) + 4} textAnchor="end" fontSize="12" fill="#9ca3af">
            {t}
          </text>
        </g>
      ))}

      <path d={areaPath} fill="url(#lineFill)" />
      <polyline points={linePts} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r="4" fill="#4f46e5" stroke="#fff" strokeWidth="2" />
      ))}
      {labels.map((l, i) => (
        <text key={l} x={x(i)} y={H - 8} textAnchor="middle" fontSize="12" fill="#9ca3af">
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
