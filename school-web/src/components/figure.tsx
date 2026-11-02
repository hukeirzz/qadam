// Чертёж к задаче по геометрии. Вопрос хранит короткое описание фигуры (точки, отрезки, окружности,
// углы), а рисует его этот компонент: подписи и числа всегда совпадают с условием.
//
// Плоскость: точки [x, y]. Стереометрия: точки [x, y, z] — тогда фигура проецируется на плоскость
// (x — к зрителю, y — вправо, z — вверх); невидимые рёбра помечаются `dashed`.
type Pt = [number, number] | [number, number, number];
type Seg = { from: string; to: string; label?: string; dashed?: boolean; ticks?: number; color?: string; at?: number };

export type FigureSpec = {
  points: Record<string, Pt>;
  /** "AB" или { from, to, label?, dashed?, ticks?, color?, at? } (at — где на отрезке подпись, 0…1) */
  segments?: (string | Seg)[];
  /** Плоская окружность (в 2D-чертеже). */
  circles?: { center: string; r: number; label?: string }[];
  /** Окружность в пространстве: плоскость `plane` (по умолчанию xy — горизонтальная), дальняя половина пунктиром при `hiddenBack`. */
  circles3d?: { center: string; r: number; plane?: 'xy' | 'xz' | 'yz'; hiddenBack?: boolean; dashed?: boolean }[];
  /** Заливка многоугольника (сечение, грань). */
  faces?: { pts: string[]; fill?: string }[];
  /** Дуга угла в вершине `at` между лучами к `of[0]` и `of[1]`; без `of` берутся первые два отрезка из вершины. */
  angles?: { at: string; of?: [string, string]; label?: string; right?: boolean }[];
  /** Оси координат из точки `origin` (по умолчанию из (0,0,0)) заданной длины. */
  axes?: { origin?: string; x?: number; y?: number; z?: number };
  /** Другой текст у точки вместо её имени, например "A(4; 0; 0)". */
  pointLabels?: Record<string, string>;
  /** Сдвиг подписи точки в пикселях [dx, dy] (dy вниз), если авто-расстановка накладывается на линии. */
  labelShift?: Record<string, [number, number]>;
  /** Точки, у которых не нужно рисовать подпись-букву. */
  hideLabels?: string[];
  /** Вид для стереометрии: 'oblique' — косоугольная проекция (по умолчанию), 'above' — сверху-спереди (для цилиндра, конуса). */
  view?: 'oblique' | 'above';
};

type P = [number, number];
const W = 320, PAD = 34;

export function Figure({ spec, className = '' }: { spec: FigureSpec; className?: string }) {
  const names = Object.keys(spec.points);
  if (names.length === 0) return null;
  const is3d = names.some((n) => spec.points[n].length === 3);
  const H = is3d ? 300 : 240;

  // мировые координаты → плоскость чертежа (y вверх)
  const project = (x: number, y: number, z: number): P =>
    spec.view === 'above' ? [y, z - 0.42 * x] : [y - 0.42 * x, z - 0.28 * x];
  const world = (n: string): P => {
    const p = spec.points[n];
    return is3d ? project(p[0], p[1], p.length === 3 ? p[2] : 0) : [p[0], p[1]];
  };

  // Окружности в пространстве — ломаные из 72 точек.
  const ring = (c: NonNullable<FigureSpec['circles3d']>[number]): P[] => {
    const o = spec.points[c.center] as [number, number, number];
    return Array.from({ length: 73 }, (_, i) => {
      const t = (i / 72) * 2 * Math.PI, a = c.r * Math.cos(t), b = c.r * Math.sin(t);
      const plane = c.plane ?? 'xy';
      return plane === 'xy' ? project(o[0] + a, o[1] + b, o[2]) : plane === 'xz' ? project(o[0] + a, o[1], o[2] + b) : project(o[0], o[1] + a, o[2] + b);
    });
  };

  const ax = spec.axes;
  const axO = ax ? (ax.origin ? (spec.points[ax.origin] as number[]) : [0, 0, 0]) : null;
  const axEnds: { name: string; to: P }[] = ax && axO ? [
    ...(ax.x ? [{ name: 'x', to: project(axO[0] + ax.x, axO[1], axO[2] ?? 0) }] : []),
    ...(ax.y ? [{ name: 'y', to: project(axO[0], axO[1] + ax.y, axO[2] ?? 0) }] : []),
    ...(ax.z ? [{ name: 'z', to: project(axO[0], axO[1], (axO[2] ?? 0) + ax.z) }] : []),
  ] : [];
  const axOrigin: P | null = axO ? project(axO[0], axO[1], axO[2] ?? 0) : null;

  // Границы фигуры, единый масштаб по обеим осям.
  const all: P[] = names.map(world);
  for (const c of spec.circles ?? []) {
    const [x, y] = world(c.center);
    all.push([x - c.r, y - c.r], [x + c.r, y + c.r]);
  }
  for (const c of spec.circles3d ?? []) all.push(...ring(c));
  for (const e of axEnds) all.push(e.to);
  if (axOrigin) all.push(axOrigin);
  const minX = Math.min(...all.map((p) => p[0])), maxX = Math.max(...all.map((p) => p[0]));
  const minY = Math.min(...all.map((p) => p[1])), maxY = Math.max(...all.map((p) => p[1]));
  const k = Math.min((W - 2 * PAD) / Math.max(maxX - minX, 1e-6), (H - 2 * PAD) / Math.max(maxY - minY, 1e-6));
  const ox = (W - (maxX - minX) * k) / 2, oy = (H - (maxY - minY) * k) / 2;
  const sc = (p: P): P => [ox + (p[0] - minX) * k, H - oy - (p[1] - minY) * k];
  const pt = (n: string): P => sc(world(n));

  const cx = names.reduce((a, n) => a + pt(n)[0], 0) / names.length;
  const cy = names.reduce((a, n) => a + pt(n)[1], 0) / names.length;
  // Точка со сдвигом от центра фигуры наружу — чтобы подписи не лезли на линии.
  const away = (p: P, d: number): P => {
    const dx = p[0] - cx, dy = p[1] - cy, l = Math.hypot(dx, dy) || 1;
    return [p[0] + (dx / l) * d, p[1] + (dy / l) * d];
  };

  const segs: Seg[] = (spec.segments ?? []).map((s) => (typeof s === 'string' ? { from: s[0], to: s[1] } : s))
    .filter((s) => spec.points[s.from] && spec.points[s.to]);

  const neighbours = (at: string) => segs.flatMap((s) => (s.from === at ? [s.to] : s.to === at ? [s.from] : []));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`block h-auto w-full ${is3d ? 'max-w-md' : 'max-w-sm'} ${className}`} role="img" aria-label="Чертёж к задаче">
      <defs>
        <marker id="fig-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
        </marker>
      </defs>

      {(spec.faces ?? []).map((f, i) => (
        <polygon key={i} points={f.pts.filter((n) => spec.points[n]).map((n) => pt(n).join(',')).join(' ')} fill={f.fill ?? '#7c3aed'} fillOpacity="0.16" stroke="none" />
      ))}

      {(spec.circles ?? []).map((c, i) => {
        const [x, y] = pt(c.center);
        return <circle key={i} cx={x} cy={y} r={c.r * k} fill="none" stroke="#475569" strokeWidth="1.6" />;
      })}

      {(spec.circles3d ?? []).map((c, i) => {
        const pts = ring(c).map(sc);
        // дальняя половина — там, где x меньше центра (зритель смотрит со стороны +x)
        const o = spec.points[c.center] as number[];
        const isBack = (idx: number) => c.hiddenBack && (c.plane ?? 'xy') === 'xy' && Math.cos((idx / 72) * 2 * Math.PI) < 0 && o !== undefined;
        const runs: { pts: P[]; dashed: boolean }[] = [];
        pts.forEach((p, idx) => {
          const dashed = !!c.dashed || !!isBack(idx);
          const last = runs[runs.length - 1];
          if (last && last.dashed === dashed) last.pts.push(p);
          else runs.push({ pts: last ? [last.pts[last.pts.length - 1], p] : [p], dashed });
        });
        return (
          <g key={i} fill="none" stroke="#475569" strokeWidth="1.6">
            {runs.map((r, j) => (
              <polyline key={j} points={r.pts.map((p) => p.join(',')).join(' ')} strokeDasharray={r.dashed ? '5 4' : undefined} />
            ))}
          </g>
        );
      })}

      {axOrigin && axEnds.map((e) => {
        const to = sc(e.to), from = sc(axOrigin as P);
        const dx = to[0] - from[0], dy = to[1] - from[1], l = Math.hypot(dx, dy) || 1;
        return (
          <g key={e.name}>
            <line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} stroke="#64748b" strokeWidth="1.4" markerEnd="url(#fig-arrow)" />
            <text x={to[0] + (dx / l) * 10} y={to[1] + (dy / l) * 10} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontStyle="italic" fill="#475569">{e.name}</text>
          </g>
        );
      })}

      {segs.map((s, i) => {
        const a = pt(s.from), b = pt(s.to);
        const f = s.at ?? 0.5;
        const mid: P = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
        const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        const nx = -(b[1] - a[1]) / l, ny = (b[0] - a[0]) / l;
        // нормаль направляем от центра фигуры
        const sign = (mid[0] - cx) * nx + (mid[1] - cy) * ny >= 0 ? 1 : -1;
        return (
          <g key={i}>
            <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={s.color ?? '#334155'} strokeWidth={s.color ? 2.2 : 1.8} strokeLinecap="round" strokeDasharray={s.dashed ? '5 4' : undefined} />
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
        const p = pt(n);
        const hidden = spec.hideLabels?.includes(n);
        const text = spec.pointLabels?.[n] ?? n;
        const long = text.length > 3;
        // длинные подписи с координатами выносим вбок от точки, чтобы они не наезжали на линии
        const sh = spec.labelShift?.[n];
        const t = sh ? [p[0] + sh[0], p[1] + sh[1]] as P : long ? [p[0] + (p[0] >= cx ? 9 : -9), p[1] + (p[1] >= cy ? 12 : -12)] as P : away(p, 14);
        const anchor = sh ? (sh[0] > 2 ? 'start' : sh[0] < -2 ? 'end' : 'middle') : long ? (p[0] >= cx ? 'start' : 'end') : 'middle';
        return (
          <g key={n}>
            <circle cx={p[0]} cy={p[1]} r="2.6" fill="#334155" />
            {!hidden && <text x={t[0]} y={t[1]} textAnchor={anchor} dominantBaseline="middle" fontSize={long ? 11 : 15} fontWeight={long ? 500 : 600} fill="#0f172a">{text}</text>}
          </g>
        );
      })}
    </svg>
  );
}
