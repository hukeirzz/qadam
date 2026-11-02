// Чертёж к задаче по геометрии. Вопрос хранит короткое описание фигуры (точки, отрезки, окружности,
// углы), а рисует его этот компонент: подписи и числа всегда совпадают с условием.
export type FigureSpec = {
  points: Record<string, [number, number]>;
  /** "AB" или { from, to, label?, dashed?, ticks? } */
  segments?: (string | { from: string; to: string; label?: string; dashed?: boolean; ticks?: number })[];
  circles?: { center: string; r: number; label?: string }[];
  /** Дуга угла в вершине `at` между лучами к `of[0]` и `of[1]`; без `of` берутся первые два отрезка из вершины. */
  angles?: { at: string; of?: [string, string]; label?: string; right?: boolean }[];
  /** Точки, у которых не нужно рисовать подпись-букву. */
  hideLabels?: string[];
};

type P = [number, number];
const W = 320, H = 240, PAD = 34;

export function Figure({ spec, className = '' }: { spec: FigureSpec; className?: string }) {
  const names = Object.keys(spec.points);
  if (names.length === 0) return null;

  // Границы фигуры (с учётом окружностей), единый масштаб по обеим осям.
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of names) {
    const [x, y] = spec.points[n];
    minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  for (const c of spec.circles ?? []) {
    const [x, y] = spec.points[c.center] ?? [0, 0];
    minX = Math.min(minX, x - c.r); maxX = Math.max(maxX, x + c.r); minY = Math.min(minY, y - c.r); maxY = Math.max(maxY, y + c.r);
  }
  const k = Math.min((W - 2 * PAD) / Math.max(maxX - minX, 1e-6), (H - 2 * PAD) / Math.max(maxY - minY, 1e-6));
  const ox = (W - (maxX - minX) * k) / 2, oy = (H - (maxY - minY) * k) / 2;
  const pt = (n: string): P => { const [x, y] = spec.points[n]; return [ox + (x - minX) * k, H - oy - (y - minY) * k]; };

  const cx = names.reduce((a, n) => a + pt(n)[0], 0) / names.length;
  const cy = names.reduce((a, n) => a + pt(n)[1], 0) / names.length;
  // Точка со сдвигом от центра фигуры наружу — чтобы подписи не лезли на линии.
  const away = (p: P, d: number): P => {
    const dx = p[0] - cx, dy = p[1] - cy, l = Math.hypot(dx, dy) || 1;
    return [p[0] + (dx / l) * d, p[1] + (dy / l) * d];
  };

  const segs = (spec.segments ?? []).map((s) => (typeof s === 'string' ? { from: s[0], to: s[1] } as { from: string; to: string; label?: string; dashed?: boolean; ticks?: number } : s))
    .filter((s) => spec.points[s.from] && spec.points[s.to]);

  const neighbours = (at: string) => segs.flatMap((s) => (s.from === at ? [s.to] : s.to === at ? [s.from] : []));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`block h-auto w-full max-w-sm ${className}`} role="img" aria-label="Чертёж к задаче">
      {(spec.circles ?? []).map((c, i) => {
        const [x, y] = pt(c.center);
        return <circle key={i} cx={x} cy={y} r={c.r * k} fill="none" stroke="#475569" strokeWidth="1.6" />;
      })}

      {segs.map((s, i) => {
        const a = pt(s.from), b = pt(s.to);
        const mid: P = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        const nx = -(b[1] - a[1]) / l, ny = (b[0] - a[0]) / l;
        // нормаль направляем от центра фигуры
        const sign = (mid[0] - cx) * nx + (mid[1] - cy) * ny >= 0 ? 1 : -1;
        return (
          <g key={i}>
            <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#334155" strokeWidth="1.8" strokeLinecap="round" strokeDasharray={s.dashed ? '5 4' : undefined} />
            {Array.from({ length: s.ticks ?? 0 }, (_, t) => {
              const o = (t - ((s.ticks ?? 1) - 1) / 2) * 5, ux = (b[0] - a[0]) / l, uy = (b[1] - a[1]) / l;
              return <line key={t} x1={mid[0] + ux * o - nx * 4} y1={mid[1] + uy * o - ny * 4} x2={mid[0] + ux * o + nx * 4} y2={mid[1] + uy * o + ny * 4} stroke="#334155" strokeWidth="1.4" />;
            })}
            {s.label && (
              <text x={mid[0] + nx * sign * 13} y={mid[1] + ny * sign * 13} textAnchor="middle" dominantBaseline="middle" fontSize="13" fill="#0f172a">{s.label}</text>
            )}
          </g>
        );
      })}

      {(spec.angles ?? []).map((an, i) => {
        if (!spec.points[an.at]) return null;
        const nb = an.of ?? (neighbours(an.at).slice(0, 2) as string[]);
        if (nb.length < 2 || !spec.points[nb[0]] || !spec.points[nb[1]]) return null;
        const v = pt(an.at), p1 = pt(nb[0]), p2 = pt(nb[1]);
        const a1 = Math.atan2(p1[1] - v[1], p1[0] - v[0]), a2 = Math.atan2(p2[1] - v[1], p2[0] - v[0]);
        if (an.right) {
          const s = 12;
          const u1: P = [Math.cos(a1) * s, Math.sin(a1) * s], u2: P = [Math.cos(a2) * s, Math.sin(a2) * s];
          return <path key={i} d={`M ${v[0] + u1[0]} ${v[1] + u1[1]} L ${v[0] + u1[0] + u2[0]} ${v[1] + u1[1] + u2[1]} L ${v[0] + u2[0]} ${v[1] + u2[1]}`} fill="none" stroke="#334155" strokeWidth="1.4" />;
        }
        let d = a2 - a1;
        while (d > Math.PI) d -= 2 * Math.PI;
        while (d < -Math.PI) d += 2 * Math.PI;
        const r = 20, e1: P = [v[0] + Math.cos(a1) * r, v[1] + Math.sin(a1) * r], e2: P = [v[0] + Math.cos(a1 + d) * r, v[1] + Math.sin(a1 + d) * r];
        const mid = a1 + d / 2;
        return (
          <g key={i}>
            <path d={`M ${e1[0]} ${e1[1]} A ${r} ${r} 0 0 ${d > 0 ? 1 : 0} ${e2[0]} ${e2[1]}`} fill="none" stroke="#7c3aed" strokeWidth="1.6" />
            {an.label && <text x={v[0] + Math.cos(mid) * (r + 15)} y={v[1] + Math.sin(mid) * (r + 15)} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="#7c3aed">{an.label}</text>}
          </g>
        );
      })}

      {names.map((n) => {
        const p = pt(n), t = away(p, 14);
        const hidden = spec.hideLabels?.includes(n);
        return (
          <g key={n}>
            <circle cx={p[0]} cy={p[1]} r="2.6" fill="#334155" />
            {!hidden && <text x={t[0]} y={t[1]} textAnchor="middle" dominantBaseline="middle" fontSize="15" fontWeight="600" fill="#0f172a">{n}</text>}
          </g>
        );
      })}
    </svg>
  );
}
