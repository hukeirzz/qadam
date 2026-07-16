import type { UserProfileRow } from '@qadam/types';

// Referencing UserProfileRow here so the student list is typed against the
// shared schema from the start, even though this Stage-1 pass only stubs
// the screen (no filtering/CSV export — that's Stage 2/3).
type StudentRow = Pick<UserProfileRow, 'id' | 'name' | 'xp' | 'streak'>;

export default function StudentsPage() {
  const students: StudentRow[] = [];

  return (
    <div>
      <h1 className="text-xl font-semibold">Ученики</h1>
      <p className="mt-2 text-sm text-gray-500">
        Классы → профиль ученика (Обзор, Пробелы, История) — Этап 1, в разработке.
      </p>
      {students.length === 0 && (
        <p className="mt-4 text-sm text-gray-400">Пока нет данных.</p>
      )}
    </div>
  );
}
