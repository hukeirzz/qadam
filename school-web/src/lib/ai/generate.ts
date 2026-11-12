// Генерация вопросов ОРТ с помощью Claude. Работает только на сервере (ключ ANTHROPIC_API_KEY).
//
// Как мы экономим токены и не доверяем модели слепо:
//  * системный промпт (правила + образцы) одинаков для всех запросов и кэшируется (prompt caching);
//  * модель пишет короткий структурный JSON (structured outputs), чертёж — компактная JSON-строка;
//  * сравнение: правильный ответ считает КОД по выражениям из check (expr.ts), а не модель;
//  * всё остальное проверяет независимый решатель: он решает задачу, не видя ответа, и вопрос с
//    расхождением отбрасывается;
//  * запрашиваем пачками по 10 параллельно, с запасом ~20% на брак.
import Anthropic from '@anthropic-ai/sdk';
import type { TestKind, TestLevel } from '@qadam/api-client';
import { COMPARE_OPTIONS } from '@/lib/test-kinds';
import { CHOICE_EXAMPLES, COMPARE_EXAMPLES } from './examples';
import { decideCompare, type CompareCheck } from './expr';
import { LEVEL_GUIDE } from './levels';

export type GeneratedQuestion = {
  text: string; colA?: string; colB?: string; options: string[]; correct: number; figure: unknown | null; explanation: string;
};
export type GenerateInput = { kind: TestKind; subjectId: string; subjectName: string; topicTitle: string; level: TestLevel; count: number };
export type Tokens = { input: number; output: number; cacheRead: number; cacheWrite: number };
export type GenerateResult = {
  questions: GeneratedQuestion[];
  requested: number; produced: number;
  dropped: { invalid: number; mismatch: number; unsolved: number; duplicate: number };
  models: string[]; tokens: Tokens;
};

const GENERATOR = 'claude-haiku-5-5';
const GENERATOR_HARD = 'claude-sonnet-5-5'; // геометрия и высокий уровень — модель посильнее
const SOLVER = 'claude-sonnet-5-5';
const CHUNK = 10;
const LEVEL_NAME: Record<TestLevel, string> = { basic: 'I (для 140+)', medium: 'II (для 160+)', high: 'III (для 180+)' };

// ---------- промпт ----------

const RULES = `Ты — составитель заданий ОРТ (общереспубликанское тестирование, Кыргызстан) по математике для школьных учителей. Пиши НОВЫЕ оригинальные задачи в стиле образцов, образцы не копируй.

Запись: формулы — LaTeX между знаками доллара ($\\frac{3}{4}$, $\\sqrt{2}$, $x^2$, $a_n$); десятичная запятая внутри формул — {,} ($0{,}5$), в обычном тексте — обычная запятая. Знак доллара для денег не используй (пиши «сом», «долларов»). Обычный текст — по-русски.
${LEVEL_GUIDE}
Требования: строго заданная тема; один верный ответ; числа «красивые», решение возможно без калькулятора; задачи разные по сюжету и числам; не ссылайся на рисунок, если figure пустое; explanation — 1–2 коротких предложения с ключевым шагом решения.

Геометрия: если в условии есть названные точки, отрезки или фигуры, чертёж ОБЯЗАТЕЛЕН; подписанные длины и углы должны совпадать с рисунком, координаты подбирай пропорционально условию.

Чертёж или данные (поле figure — JSON-СТРОКА, пустая строка если рисунок не нужен). Рисунок должен точно соответствовать условию. Форматы:
 геометрия: {"points":{"A":[0,0],"B":[4,0]},"segments":["AB",{"from":"A","to":"B","label":"6","dashed":false}],"circles":[{"center":"O","r":3}],"angles":[{"at":"A","of":["B","C"],"label":"30°","right":false}]} (стереометрия — точки [x,y,z])
 числовая прямая: {"numberLine":{"points":{"a":-2,"b":3},"marks":[0]}}
 круговая диаграмма: {"pie":{"slices":[{"label":"Июль","value":50}],"unit":"%"}}
 столбики или гистограмма: {"bars":{"items":[{"label":"0–15","value":2}],"histogram":true}}
 таблица: {"table":{"head":["Курс","Студентов"],"rows":[["А",10]]}}`;

const COMPARE_RULES = `ЧАСТЬ I — сравнение величин. Каждая задача: given — условие над рамками (может быть пустым; переменные в обеих колонках одни и те же), a и b — величины колонок А и Б (коротко: выражение, число или «Площадь …»). answer: «А» — больше А, «Б» — больше Б, «В» — равны, «Г» — по данным определить нельзя (значение зависит от допустимых значений переменных или данных не хватает). Примерно 25% задач — с ответом «Г», остальные поровну между «А», «Б» и «В».
check — проверка для КОДА, который сам посчитает ответ: a и b — вычисляемые выражения (числа через точку; + - * / ^ !; скобки; sqrt(x), cbrt, abs, ln, log(x,основание), sin/cos/tan в градусах, pi, e), в которые вместо слов подставлены числа. vars — независимые переменные с допустимыми диапазонами lo…hi и признаком integer; зависимые переменные выражай через независимые прямо в a и b. where — условие допустимости ("2*y>10-y", можно && и ||) или пустая строка. Диапазоны vars делай так, чтобы они отражали ВСЕ значения, разрешённые условием (для «Г» диапазон должен включать оба случая). Если величину нельзя выразить числом, оставь a и b в check пустыми строками.`;

const CHOICE_RULES = (n: number) => `ЧАСТЬ II — вопрос и ровно ${n} вариантов ответа (в тексте вариантов без букв А–Д). answer — индекс верного варианта с нуля. Неверные варианты — типичные ошибки учеников (знак, пропущенный шаг, не тот множитель), правдоподобные, разные между собой и в том же формате, что верный. Верный ответ ставь на разные позиции.`;

function systemPrompt(kind: TestKind, optN: number): string {
  const ex = kind === 'compare' ? COMPARE_EXAMPLES : CHOICE_EXAMPLES;
  return [
    RULES, kind === 'compare' ? COMPARE_RULES : CHOICE_RULES(optN),
    'Образцы (JSON, один объект на строку):', ...ex.map((e) => JSON.stringify(e)),
  ].join('\n\n');
}

// ---------- схемы structured outputs ----------

const str = { type: 'string' };
const COMPARE_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['questions'],
  properties: { questions: { type: 'array', items: {
    type: 'object', additionalProperties: false,
    required: ['given', 'a', 'b', 'figure', 'check', 'answer', 'explanation'],
    properties: {
      given: str, a: str, b: str, figure: str, explanation: str,
      answer: { type: 'string', enum: ['А', 'Б', 'В', 'Г'] },
      check: {
        type: 'object', additionalProperties: false, required: ['a', 'b', 'vars', 'where'],
        properties: {
          a: str, b: str, where: str,
          vars: { type: 'array', items: {
            type: 'object', additionalProperties: false, required: ['name', 'lo', 'hi', 'integer'],
            properties: { name: str, lo: { type: 'number' }, hi: { type: 'number' }, integer: { type: 'boolean' } },
          } },
        },
      },
    },
  } } },
};
const CHOICE_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['questions'],
  properties: { questions: { type: 'array', items: {
    type: 'object', additionalProperties: false, required: ['text', 'options', 'answer', 'figure', 'explanation'],
    properties: { text: str, options: { type: 'array', items: str }, answer: { type: 'integer' }, figure: str, explanation: str },
  } } },
};
const SOLVER_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['answers'],
  properties: { answers: { type: 'array', items: {
    type: 'object', additionalProperties: false, required: ['i', 'choice'],
    properties: { i: { type: 'integer' }, choice: { type: 'integer' } },
  } } },
};

// ---------- вызовы ----------

const client = () => new Anthropic(); // ключ — из ANTHROPIC_API_KEY

type Acc = { tokens: Tokens; models: Set<string> };
const addUsage = (acc: Acc, model: string, u: Anthropic.Usage) => {
  acc.models.add(model);
  acc.tokens.input += u.input_tokens ?? 0;
  acc.tokens.output += u.output_tokens ?? 0;
  acc.tokens.cacheRead += u.cache_read_input_tokens ?? 0;
  acc.tokens.cacheWrite += u.cache_creation_input_tokens ?? 0;
};

async function ask<T>(acc: Acc, o: {
  model: string; system?: string; user: string; schema: object; effort: 'low' | 'medium' | 'high'; maxTokens: number;
}): Promise<T> {
  const send = () => client().messages.stream({
    model: o.model,
    max_tokens: o.maxTokens,
    ...(o.system ? { system: [{ type: 'text' as const, text: o.system, cache_control: { type: 'ephemeral' as const } }] } : {}),
    messages: [{ role: 'user', content: o.user }],
    output_config: { effort: o.effort, format: { type: 'json_schema', schema: o.schema as { [k: string]: unknown } } },
  }).finalMessage();
  // Соединение с API иногда рвётся посреди ответа («terminated», «other side closed») — SDK такое сам не повторяет.
  let msg: Awaited<ReturnType<typeof send>>;
  try { msg = await send(); } catch (e) {
    if (!/terminated|socket|closed|ECONNRESET|timeout|timed out|connection/i.test(e instanceof Error ? `${e.message} ${String(e.cause ?? '')}` : '')) throw e;
    console.warn('ai stream interrupted, retrying once:', e instanceof Error ? e.message : e);
    msg = await send();
  }
  addUsage(acc, o.model, msg.usage);
  if (msg.stop_reason === 'refusal') throw new Error('Модель отказалась отвечать на этот запрос');
  const text = msg.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
  if (msg.stop_reason === 'max_tokens' && !text.trim().endsWith('}')) throw new Error('Ответ модели оборвался');
  return JSON.parse(text) as T;
}

// ---------- проверка ----------

/** Чертёж приходит JSON-строкой: разбираем и пропускаем, только если это известный нам формат. */
function parseFigure(raw: string): unknown | null {
  if (!raw || !raw.trim()) return null;
  try {
    const f = JSON.parse(raw) as Record<string, unknown>;
    if (f && typeof f === 'object') {
      if (f.points && typeof f.points === 'object' && Object.keys(f.points as object).length > 0
        && Object.values(f.points as Record<string, unknown>).every((p) => Array.isArray(p) && p.length >= 2 && p.every((n) => typeof n === 'number'))) return f;
      if (f.numberLine || f.pie || f.bars || f.table) return f;
    }
  } catch { /* не JSON — без чертежа */ }
  return null;
}

/** Слова задачи (без формул-разметки), чтобы находить почти одинаковые вопросы из разных пачек. */
const words = (q: GeneratedQuestion) => new Set([q.text, q.colA ?? '', q.colB ?? ''].join(' ').toLowerCase().match(/[a-zа-яё0-9]+/g) ?? []);
const similar = (a: Set<string>, b: Set<string>) => {
  let common = 0;
  for (const w of a) if (b.has(w)) common++;
  return common / Math.max(1, a.size + b.size - common) >= 0.5; // порог подобран по реальным наборам: ловит «ту же задачу с другими числами»
};

const norm = (s: string) => s.replace(/[$\s{}\\]/g, '').toLowerCase();
const LETTERS = ['А', 'Б', 'В', 'Г'];

type RawCompare = { given: string; a: string; b: string; figure: string; check: CompareCheck; answer: string; explanation: string };
type RawChoice = { text: string; options: string[]; answer: number; figure: string; explanation: string };
type Candidate = { q: GeneratedQuestion; verified: boolean; promptFigure: string };

function toCompare(r: RawCompare, stats: GenerateResult['dropped']): Candidate | null {
  if (!r.a?.trim() || !r.b?.trim() || norm(r.a) === norm(r.b) || !LETTERS.includes(r.answer)) { stats.invalid++; return null; }
  const decided = decideCompare(r.check);
  if (decided && decided !== r.answer) { stats.mismatch++; return null; }
  return {
    verified: decided !== null,
    promptFigure: r.figure ?? '',
    q: {
      text: (r.given ?? '').trim(), colA: r.a.trim(), colB: r.b.trim(), options: COMPARE_OPTIONS,
      correct: LETTERS.indexOf(r.answer), figure: parseFigure(r.figure), explanation: (r.explanation ?? '').trim(),
    },
  };
}

function toChoice(r: RawChoice, optN: number, stats: GenerateResult['dropped']): Candidate | null {
  const opts = (r.options ?? []).map((o) => String(o).trim());
  if (!r.text?.trim() || opts.length !== optN || opts.some((o) => !o) || new Set(opts.map(norm)).size !== optN
    || !Number.isInteger(r.answer) || r.answer < 0 || r.answer >= optN) { stats.invalid++; return null; }
  return {
    verified: false, promptFigure: r.figure ?? '',
    q: { text: r.text.trim(), options: opts, correct: r.answer, figure: parseFigure(r.figure), explanation: (r.explanation ?? '').trim() },
  };
}

/** Независимый решатель: решает задачи, не видя нашего ответа; расхождение — вопрос выбрасываем. */
async function solve(acc: Acc, kind: TestKind, items: Candidate[], stats: GenerateResult['dropped']): Promise<Candidate[]> {
  if (items.length === 0) return [];
  const payload = items.map((c, i) => kind === 'compare'
    ? { i, given: c.q.text, columnA: c.q.colA, columnB: c.q.colB, figure: c.promptFigure || undefined }
    : { i, task: c.q.text, options: c.q.options, figure: c.promptFigure || undefined });
  const system = kind === 'compare'
    ? 'Решай задачи ОРТ по математике «Сравнение величин». Для каждой верни choice: 0 — больше величина колонки А, 1 — больше В, 2 — равны, 3 — по данным определить нельзя, -1 — не удалось решить. Решай сам, ничего не подгоняй. Правила: (1) учитывай ВСЕ условия в «дано», включая неравенства вроде x>0 или 0<x<100; (2) величины, которые по смыслу задачи не бывают отрицательными (цена, масса, число людей, длина, площадь), считай положительными, даже если об этом не сказано; (3) выбирай 3 только если ты нашёл ДВА допустимых набора значений с разным результатом (покажи их себе), а если результат при всех допустимых значениях один и тот же — это А, Б или В.'
    : 'Решай задачи ОРТ по математике. Для каждой верни choice — индекс верного варианта с нуля (-1 — ни один не подходит или решить не удалось). Решай сам, ничего не подгоняй.';
  const res = await ask<{ answers: { i: number; choice: number }[] }>(acc, {
    model: SOLVER, system, user: JSON.stringify(payload), schema: SOLVER_SCHEMA, effort: 'high', maxTokens: 32000,
  });
  const got = new Map(res.answers.map((a) => [a.i, a.choice]));
  return items.filter((c, i) => {
    const ok = got.get(i) === c.q.correct;
    if (!ok) {
      stats.unsolved++;
      console.info('ai rejected', JSON.stringify({ text: c.q.text, a: c.q.colA, b: c.q.colB, options: kind === 'choice' ? c.q.options : undefined, writer: c.q.correct, solver: got.get(i) ?? null }));
    }
    return ok;
  });
}

// ---------- главный вход ----------

async function oneChunk(acc: Acc, stats: GenerateResult['dropped'], inp: GenerateInput, want: number, part: number, parts: number, optN: number): Promise<GeneratedQuestion[]> {
  const hard = inp.subjectId === 'geometry' || inp.level === 'high';
  const user = `Раздел: ${inp.subjectName}. Тема: «${inp.topicTitle}». Уровень: ${LEVEL_NAME[inp.level]}. Составь ровно ${want} задач.`
    + (parts > 1 ? ` Это набор ${part} из ${parts}: сюжеты и числа должны отличаться от других наборов.` : '');
  const t0 = Date.now();
  const raw = await ask<{ questions: (RawCompare | RawChoice)[] }>(acc, {
    model: hard ? GENERATOR_HARD : GENERATOR,
    system: systemPrompt(inp.kind, optN), user,
    schema: inp.kind === 'compare' ? COMPARE_SCHEMA : CHOICE_SCHEMA,
    effort: inp.kind === 'compare' ? 'low' : 'medium',
    maxTokens: 32000,
  });
  const cands = raw.questions
    .map((r) => (inp.kind === 'compare' ? toCompare(r as RawCompare, stats) : toChoice(r as RawChoice, optN, stats)))
    .filter((c): c is Candidate => c !== null);
  // check пишет та же модель, что и текст задачи, и ничто не гарантирует, что он описывает ровно то, что видит ученик.
  // Поэтому независимый решатель проверяет ВСЕ вопросы (по тексту, не видя ответа); совпадение с check — дополнительная страховка.
  const t1 = Date.now();
  const checked = await solve(acc, inp.kind, cands, stats);
  console.info('ai chunk', JSON.stringify({ kind: inp.kind, want, wrote: cands.length, kept: checked.length, writeSec: Math.round((t1 - t0) / 1000), solveSec: Math.round((Date.now() - t1) / 1000) }));
  return checked.map((c) => c.q);
}

export async function generateQuestions(inp: GenerateInput): Promise<GenerateResult> {
  const optN = inp.kind === 'compare' ? 4 : (inp.subjectId === 'math' || inp.subjectId === 'geometry' ? 5 : 4);
  const acc: Acc = { tokens: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, models: new Set() };
  const stats = { invalid: 0, mismatch: 0, unsolved: 0, duplicate: 0 };

  const round = async (need: number) => {
    const asked = Math.ceil(need * 1.2);
    const parts = Math.ceil(asked / CHUNK);
    const sizes = Array.from({ length: parts }, (_, i) => Math.min(CHUNK, asked - i * CHUNK));
    const settled = await Promise.allSettled(sizes.map((n, i) => oneChunk(acc, stats, inp, n, i + 1, parts, optN)));
    const ok = settled.flatMap((s) => (s.status === 'fulfilled' ? s.value : []));
    const failed = settled.find((s): s is PromiseRejectedResult => s.status === 'rejected');
    if (ok.length === 0 && failed) throw failed.reason;
    return ok;
  };

  const out: GeneratedQuestion[] = [];
  const seen: Set<string>[] = [];
  const add = (list: GeneratedQuestion[]) => {
    for (const q of list) {
      const w = words(q);
      if (seen.some((x) => similar(x, w))) { stats.duplicate++; continue; }
      seen.push(w); out.push(q);
    }
  };
  add(await round(inp.count));
  if (out.length < inp.count) add(await round(inp.count - out.length));
  const questions = out.slice(0, inp.count);
  return { questions, requested: inp.count, produced: questions.length, dropped: stats, models: [...acc.models], tokens: acc.tokens };
}
