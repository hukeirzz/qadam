// Subject glyphs from the design: bold "Mx" for math, a rounded triangle for geometry.
const TONES = {
  violet: 'bg-violet-100/70 text-violet-600',
  green: 'bg-emerald-100/70 text-emerald-600',
  slate: 'bg-slate-100 text-slate-500',
} as const;
export type SubjectTone = keyof typeof TONES;

/** Math → violet, geometry → green, anything else → slate (unless `tone` is forced). */
export function subjectTone(id: string | null): SubjectTone {
  return id === 'math' ? 'violet' : id === 'geometry' ? 'green' : 'slate';
}

export function SubjectIcon({ id, tone, size = 'md' }: { id: string | null; tone?: SubjectTone; size?: 'md' | 'lg' }) {
  const t = tone ?? subjectTone(id);
  const box = size === 'lg' ? 'h-16 w-16 rounded-[20px]' : 'h-12 w-12 rounded-2xl';
  return (
    <span className={`flex shrink-0 items-center justify-center ${box} ${TONES[t]}`}>
      {id === 'geometry' ? (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" aria-hidden>
          <path d="M12 4.5 20 19H4Z" />
        </svg>
      ) : (
        <span className="text-[19px] font-extrabold italic tracking-tight">{id === 'math' ? 'Mx' : '•'}</span>
      )}
    </span>
  );
}
