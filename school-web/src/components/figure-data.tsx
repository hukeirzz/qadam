// Данные к задаче: числовая прямая, круговая диаграмма, столбики/гистограмма, таблица.
// Как и чертёж (figure.tsx), вопрос хранит только короткое JSON-описание, а рисует его этот компонент.
import { MathText } from './math-text';

export type DataSpec =
  | { numberLine: { points: Record<string, number>; marks?: number[]; min?: number; max?: number } }
  | { pie: { slices: { label: string; value: number }[]; unit?: string } }
  | { bars: { items: { label: string; value: number }[]; histogram?: boolean; yLabel?: string } }
  | { table: { head?: string[]; rows: (string | number)[][] } };

const W = 320;
const fmt = (v: number) => String(v).replace('-', '−').replace('.', ',');
const SLICE = ['#7c3aed', '#a78bfa', '#c4b5fd', '#64748b', '#94a3b8', '#cbd5e1', '#ddd6fe', '#475569'];

function NumberLine({ spec, className }: { spec: Extract<DataSpec, { numberLine: unknown }>['numberLine']; className: string }) {
  const pts = Object.entries(spec.points);
  const marks = spec.marks ?? [];
  const vals = [...pts.map(([, v]) => v), ...marks, ...(spec.min != null ? [spec.min] : []), ...(spec.max != null ? [spec.max] : [])];
  if (vals.length === 0) return null;
  const lo0 = Math.min(...vals), hi0 = Math.max(...vals);
  const pad = (hi0 - lo0 || 2) * 0.14;
  const lo = spec.min ?? lo0 - pad, hi = spec.max ?? hi0 + pad;
  const X = 22, H = 84, y = 52;
  const x = (v: number) => X + ((v - lo) / (hi - lo)) * (W - 2 * X - 8);
  const sorted = [...pts].sort((a, b) => a[1] - b[1]);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`block h-auto w-full max-w-sm ${className}`} role="img" aria-label="Числовая прямая">
      <defs>
        <marker id="nl-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
        </marker>
      </defs>
      <line x1={X - 8} y1={y} x2={W - 8} y2={y} stroke="#64748b" strokeWidth="1.6" markerEnd="url(#nl-arrow)" />
      {marks.map((m) => (
        <g key={`m${m}`}>
          <line x1={x(m)} y1={y - 5} x2={x(m)} y2={y + 5} stroke="#475569" strokeWidth="1.4" />
          <text x={x(m)} y={y + 20} textAnchor="middle" fontSize="13" fill="#334155">{fmt(m)}</text>
        </g>
      ))}
      {sorted.map(([name, v], i) => {
        const near = i > 0 && x(v) - x(sorted[i - 1][1]) < 16;
        return (
          <g key={name}>
            <circle cx={x(v)} cy={y} r="4" fill="#7c3aed" />
            <text x={x(v)} y={y - (near ? 24 : 12)} textAnchor="middle" fontSize="15" fontStyle="italic" fontWeight="600" fill="#0f172a">{name}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Pie({ spec, className }: { spec: Extract<DataSpec, { pie: unknown }>['pie']; className: string }) {
  const total = spec.slices.reduce((a, s) => a + s.value, 0);
  if (total <= 0) return null;
  const cx = W / 2, cy = 118, r = 70;
  const starts = spec.slices.map((_, i) => -Math.PI / 2 + (spec.slices.slice(0, i).reduce((a, x) => a + x.value, 0) / total) * 2 * Math.PI);
  return (
    <svg viewBox={`0 0 ${W} 236`} className={`block h-auto w-full max-w-sm ${className}`} role="img" aria-label="Круговая диаграмма">
      {spec.slices.map((s, i) => {
        const a0 = starts[i], a1 = a0 + (s.value / total) * 2 * Math.PI, mid = (a0 + a1) / 2;
        const big = a1 - a0 > Math.PI ? 1 : 0;
        const d = spec.slices.length === 1
          ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
          : `M ${cx} ${cy} L ${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A ${r} ${r} 0 ${big} 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} Z`;
        const tx = cx + (r + 12) * Math.cos(mid), ty = cy + (r + 12) * Math.sin(mid);
        const anchor = Math.cos(mid) > 0.25 ? 'start' : Math.cos(mid) < -0.25 ? 'end' : 'middle';
        return (
          <g key={i}>
            <path d={d} fill={SLICE[i % SLICE.length]} stroke="#fff" strokeWidth="1.5" />
            <text x={tx} y={ty} textAnchor={anchor} fontSize="11.5" fill="#0f172a">
              <tspan x={tx} dy={Math.sin(mid) > 0.6 ? 8 : Math.sin(mid) < -0.6 ? -10 : 0}>{s.label}</tspan>
              <tspan x={tx} dy="13" fontWeight="600">{fmt(s.value)}{spec.unit ?? ''}</tspan>
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Bars({ spec, className }: { spec: Extract<DataSpec, { bars: unknown }>['bars']; className: string }) {
  const n = spec.items.length;
  if (n === 0) return null;
  const max = Math.max(...spec.items.map((i) => i.value), 1);
  const step = max <= 10 ? 2 : max <= 30 ? 5 : max <= 100 ? 20 : Math.pow(10, Math.floor(Math.log10(max)));
  const top = Math.ceil(max / step) * step;
  const L = 38, B = 34, T = 14, H = 220;
  const pw = W - L - 10, ph = H - B - T;
  const bw = pw / n;
  const yy = (v: number) => T + ph - (v / top) * ph;
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`block h-auto w-full max-w-sm ${className}`} role="img" aria-label="Диаграмма">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} y1={yy(t)} x2={W - 10} y2={yy(t)} stroke="#e2e8f0" strokeWidth="1" />
          <text x={L - 6} y={yy(t)} textAnchor="end" dominantBaseline="middle" fontSize="11" fill="#64748b">{fmt(t)}</text>
        </g>
      ))}
      {spec.yLabel && <text x={4} y={9} fontSize="11" fill="#64748b">{spec.yLabel}</text>}
      {spec.items.map((it, i) => {
        const w = spec.histogram ? bw : bw * 0.62, x0 = L + i * bw + (bw - w) / 2;
        return (
          <g key={i}>
            <rect x={x0} y={yy(it.value)} width={w} height={ph - (yy(it.value) - T)} fill="#8b5cf6" fillOpacity={spec.histogram ? 0.55 : 0.85} stroke={spec.histogram ? '#6d28d9' : 'none'} />
            <text x={x0 + w / 2} y={yy(it.value) - 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="#0f172a">{fmt(it.value)}</text>
            <text x={L + i * bw + bw / 2} y={H - B + 15} textAnchor="middle" fontSize="11" fill="#334155">{it.label}</text>
          </g>
        );
      })}
      <line x1={L} y1={T} x2={L} y2={T + ph} stroke="#64748b" strokeWidth="1.4" />
      <line x1={L} y1={T + ph} x2={W - 10} y2={T + ph} stroke="#64748b" strokeWidth="1.4" />
    </svg>
  );
}

function Table({ spec, className }: { spec: Extract<DataSpec, { table: unknown }>['table']; className: string }) {
  return (
    <div className={`max-w-full overflow-x-auto ${className}`}>
      <table className="border-collapse text-sm">
        {spec.head && (
          <thead>
            <tr>{spec.head.map((h, i) => <th key={i} className="border border-slate-300 bg-slate-50 px-3 py-1.5 text-left font-semibold text-slate-700"><MathText>{h}</MathText></th>)}</tr>
          </thead>
        )}
        <tbody>
          {spec.rows.map((row, ri) => (
            <tr key={ri}>{row.map((c, ci) => <td key={ci} className="border border-slate-300 px-3 py-1.5 text-slate-700"><MathText>{String(c)}</MathText></td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DataFigure({ spec, className = '' }: { spec: DataSpec; className?: string }) {
  if ('numberLine' in spec) return <NumberLine spec={spec.numberLine} className={className} />;
  if ('pie' in spec) return <Pie spec={spec.pie} className={className} />;
  if ('bars' in spec) return <Bars spec={spec.bars} className={className} />;
  return <Table spec={spec.table} className={className} />;
}
