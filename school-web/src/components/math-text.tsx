// Текст с формулами: всё между $…$ рисуется KaTeX, остальное остаётся обычным текстом.
// Пример: «Найдите $\frac{1}{2}+\sqrt{3}$». Знак доллара у денег («11$») формулой не считается:
// открывающий $ не стоит сразу после буквы или цифры, а закрывающий — перед цифрой.
import type { ReactNode } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const MATH = /(?<![\p{L}\p{N}])\$(?=\S)([^$\n]+?)(?<=\S)\$(?!\d)/gu;

export const hasMath = (s: string) => new RegExp(MATH.source, 'u').test(s);

export function MathText({ children, className }: { children: string; className?: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of children.matchAll(MATH)) {
    const at = m.index ?? 0;
    if (at > last) parts.push(children.slice(last, at));
    parts.push(
      <span key={at} dangerouslySetInnerHTML={{ __html: katex.renderToString(m[1], { throwOnError: false, strict: false }) }} />,
    );
    last = at + m[0].length;
  }
  if (last < children.length) parts.push(children.slice(last));
  return <span className={className}>{parts}</span>;
}
