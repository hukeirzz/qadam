import { SUBJECT_LABELS } from './aggregate';

export const subjectLabel = (id: string | null) => (id ? SUBJECT_LABELS[id] ?? id : 'Без раздела');
export const subjectGlyph = (id: string | null) => (id === 'math' ? '√x' : id === 'geometry' ? '△' : '•');

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
export function formatDate(iso: string) {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${hh}:${mm}`;
}

export const pct = (score: number, total: number) => (total ? Math.round((100 * score) / total) : 0);

/** Badge colours by percentage: ≥70 green, ≥50 violet, below — amber. */
export function pctTone(p: number) {
  if (p >= 70) return { chip: 'bg-emerald-50 text-emerald-600', icon: 'bg-emerald-50 text-emerald-600' };
  if (p >= 50) return { chip: 'bg-violet-50 text-violet-600', icon: 'bg-violet-50 text-violet-600' };
  return { chip: 'bg-amber-50 text-amber-600', icon: 'bg-amber-50 text-amber-600' };
}

export function formatDuration(sec: number | null) {
  if (sec == null) return null;
  const m = Math.floor(sec / 60);
  return m ? `${m} мин ${sec % 60} с` : `${sec} с`;
}
