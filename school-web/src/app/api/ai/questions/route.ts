// POST /api/ai/questions — ИИ составляет вопросы теста. Только для учителей; ключ Anthropic остаётся на сервере.
import { NextResponse } from 'next/server';
import { getServerApi, getStaff } from '@/lib/auth';
import { generateQuestions } from '@/lib/ai/generate';
import { TEST_LEVELS, type TestKind, type TestLevel } from '@qadam/api-client';

// Генерация 30 вопросов с проверкой занимает до пары минут.
export const maxDuration = 300;

const DAILY_LIMIT = 40; // генераций в сутки на школу
const err = (message: string, status: number) => NextResponse.json({ error: message }, { status });

export async function POST(req: Request) {
  const { session, role } = await getStaff();
  if (!session || !role?.school_id) return err('Нужно войти как учитель.', 401);
  if (!process.env.ANTHROPIC_API_KEY) return err('ИИ ещё не подключён: на сервере нет ключа.', 503);

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const kind = body?.kind as TestKind;
  const level = body?.level as TestLevel;
  const count = Number(body?.count);
  const topicTitle = typeof body?.topicTitle === 'string' ? body.topicTitle.trim().slice(0, 120) : '';
  const subjectId = typeof body?.subjectId === 'string' ? body.subjectId.slice(0, 40) : '';
  const subjectName = typeof body?.subjectName === 'string' ? body.subjectName.trim().slice(0, 60) : subjectId;
  if ((kind !== 'choice' && kind !== 'compare') || !TEST_LEVELS.some((l) => l.id === level)
    || !Number.isInteger(count) || count < 1 || count > 30 || !topicTitle) return err('Неверные параметры запроса.', 400);

  const { supabase } = await getServerApi();
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count: today, error: cntErr } = await supabase
    .from('ai_usage').select('id', { count: 'exact', head: true }).eq('school_id', role.school_id).gte('created_at', since);
  if (!cntErr && (today ?? 0) >= DAILY_LIMIT) return err('Лимит ИИ-генераций школы на сегодня исчерпан. Попробуйте завтра.', 429);

  try {
    const r = await generateQuestions({ kind, subjectId, subjectName, topicTitle, level, count });
    const { error: logErr } = await supabase.from('ai_usage').insert({
      school_id: role.school_id, user_id: session.user.id, kind, subject_id: subjectId, topic_title: topicTitle, level,
      requested: r.requested, produced: r.produced, dropped: r.dropped, models: r.models,
      input_tokens: r.tokens.input, output_tokens: r.tokens.output, cache_read_tokens: r.tokens.cacheRead, cache_write_tokens: r.tokens.cacheWrite,
    });
    if (logErr) console.warn('ai_usage insert failed:', logErr.message);
    console.info('ai generate', JSON.stringify({ kind, level, topicTitle, produced: r.produced, requested: r.requested, dropped: r.dropped, models: r.models, tokens: r.tokens }));
    return NextResponse.json({ questions: r.questions, produced: r.produced, requested: r.requested, dropped: r.dropped, tokens: r.tokens });
  } catch (e) {
    console.error('ai generate failed:', e);
    const msg = e instanceof Error ? e.message : '';
    if (/rate|429|overloaded|529/i.test(msg)) return err('ИИ сейчас перегружен. Попробуйте через минуту.', 503);
    return err('Не удалось сгенерировать вопросы. Попробуйте ещё раз или создайте заготовки вручную.', 502);
  }
}
