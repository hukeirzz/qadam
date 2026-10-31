// Subject glyphs from the design: bold "Mx" for math, a rounded triangle for geometry.
const TONES = {
  violet: 'bg-violet-50 text-violet-600',
  green: 'bg-emerald-50 text-emerald-600',
  slate: 'bg-slate-100 text-slate-500',
} as const;
export type SubjectTone = keyof typeof TONES;

/** Math → violet, geometry → green, anything else → slate (unless `tone` is forced). */
export function subjectTone(id: string | null): SubjectTone {
  return id === 'math' ? 'violet' : id === 'geometry' ? 'green' : 'slate';
}

export function SubjectIcon({ id, tone, size = 'md' }: { id: string | null; tone?: SubjectTone; size?: 'md' | 'lg' }) {
  const t = tone ?? subjectTone(id);
  const box = size === 'lg' ? 'h-14 w-14 rounded-xl' : 'h-11 w-11 rounded-xl';
  return (
    <span className={`flex shrink-0 items-center justify-center ${box} ${TONES[t]}`}>
      {id === 'geometry' ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" aria-hidden>
          <path d="M12 4.5 20 19H4Z" />
        </svg>
      ) : (
        <span className="text-base font-extrabold italic tracking-tight">{id === 'math' ? 'Mx' : '•'}</span>
      )}
    </span>
  );
}
