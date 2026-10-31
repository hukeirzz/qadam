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

export function formatDuration(sec: number | null) {
  if (sec == null) return null;
  const m = Math.floor(sec / 60);
  return m ? `${m} мин ${sec % 60} с` : `${sec} с`;
}
