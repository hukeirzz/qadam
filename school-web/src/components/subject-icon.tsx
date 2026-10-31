// Subject marker: the Qadam paw (public/logo_qadam.png) tinted by subject — red for math,
// blue for geometry. The PNG is used as a mask, so only its alpha shape is kept and any
// colour can be applied to it.
const TONES = {
  red: { fg: '#ef4444', bg: 'bg-red-50' },
  blue: { fg: '#3b82f6', bg: 'bg-blue-50' },
  slate: { fg: '#64748b', bg: 'bg-slate-100' },
} as const;
export type SubjectTone = keyof typeof TONES;

export function subjectTone(id: string | null): SubjectTone {
  return id === 'math' ? 'red' : id === 'geometry' ? 'blue' : 'slate';
}

export function SubjectIcon({ id, tone, size = 'md' }: { id: string | null; tone?: SubjectTone; size?: 'md' | 'lg' }) {
  const t = TONES[tone ?? subjectTone(id)];
  const box = size === 'lg' ? 'h-14 w-14' : 'h-11 w-11';
  const paw = size === 'lg' ? 28 : 24;
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-xl ${box} ${t.bg}`} aria-hidden>
      <span
        style={{
          width: paw, height: paw, backgroundColor: t.fg,
          WebkitMaskImage: 'url(/logo_qadam.png)', maskImage: 'url(/logo_qadam.png)',
          WebkitMaskSize: 'contain', maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center', maskPosition: 'center',
        }}
      />
    </span>
  );
}
