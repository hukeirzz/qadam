import { StudentProfile } from '@/components/student-profile';

// The mock profile ignores the id for now; it's here so the route and links
// (/students/[id]) are real ahead of wiring Supabase per-student data.
export default function StudentProfilePage() {
  return <StudentProfile />;
}
