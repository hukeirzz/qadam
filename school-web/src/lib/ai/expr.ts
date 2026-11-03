// Безопасный вычислитель выражений для проверки заданий на сравнение.
// ИИ присылает значения колонок А и Б как выражения (`sqrt(2)*sqrt(8)`, `(200-50)/50*100`), а верный ответ
// считает этот код — арифметике модели мы не доверяем. Никакого eval: свой разбор, только числа,
// + - * / % ^ !, сравнения, && и ||, константы pi и e и короткий список функций.
// Тригонометрия — в градусах (как в школьной геометрии).
type Scope = Record<string, number>;

const FUNCS: Record<string, (...a: number[]) => number> = {
  sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs, ln: Math.log, exp: Math.exp,
  floor: Math.floor, ceil: Math.ceil, round: Math.round, min: Math.min, max: Math.max, pow: Math.pow,
  log: (x, b) => (b == null ? Math.log10(x) : Math.log(x) / Math.log(b)),
  sin: (x) => Math.sin((x * Math.PI) / 180),
  cos: (x) => Math.cos((x * Math.PI) / 180),
  tan: (x) => Math.tan((x * Math.PI) / 180),
};

function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0 || n > 20) throw new Error('factorial');
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

export function evalExpr(src: string, scope: Scope = {}): number {
  const s = src.replace(/,/g, '.').replace(/×|·/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/\*\*/g, '^');
  let i = 0;
  const peek = () => { while (s[i] === ' ') i++; return s[i]; };
  const eat = (t: string) => { peek(); if (s.startsWith(t, i)) { i += t.length; return true; } return false; };

  function or(): number { let v = and(); while (eat('||')) { const r = and(); v = v || r ? 1 : 0; } return v; }
  function and(): number { let v = cmp(); while (eat('&&')) { const r = cmp(); v = v && r ? 1 : 0; } return v; }
  function cmp(): number {
    const l = add();
    for (const op of ['<=', '>=', '==', '!=', '<', '>']) {
      if (eat(op)) {
        const r = add();
        return (op === '<=' ? l <= r : op === '>=' ? l >= r : op === '==' ? l === r : op === '!=' ? l !== r : op === '<' ? l < r : l > r) ? 1 : 0;
      }
    }
    return l;
  }
  function add(): number {
    let v = mul();
    for (;;) { if (eat('+')) v += mul(); else if (eat('-')) v -= mul(); else return v; }
  }
  function mul(): number {
    let v = unary();
    for (;;) { if (eat('*')) v *= unary(); else if (eat('/')) v /= unary(); else if (eat('%')) v %= unary(); else return v; }
  }
  function unary(): number {
    if (eat('-')) return -unary();
    if (eat('+')) return unary();
    return pow();
  }
  function pow(): number {
    const b = postfix();
    return eat('^') ? Math.pow(b, unary()) : b;
  }
  function postfix(): number {
    let v = primary();
    while (peek() === '!' && s[i + 1] !== '=') { i++; v = factorial(v); }
    return v;
  }
  function primary(): number {
    peek();
    if (eat('(')) { const v = or(); if (!eat(')')) throw new Error('paren'); return v; }
    const num = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i));
    if (num) { i += num[0].length; return parseFloat(num[0]); }
    const id = /^[A-Za-z_][A-Za-z_0-9]*/.exec(s.slice(i));
    if (id) {
      i += id[0].length;
      const name = id[0];
      if (peek() === '(') {
        i++;
        const args: number[] = [];
        if (!eat(')')) { do { args.push(or()); } while (eat(',') || eat(';')); if (!eat(')')) throw new Error('paren'); }
        const f = FUNCS[name];
        if (!f) throw new Error(`func ${name}`);
        return f(...args);
      }
      if (name === 'pi') return Math.PI;
      if (name === 'e') return Math.E;
      if (name in scope) return scope[name];
      throw new Error(`var ${name}`);
    }
    throw new Error(`unexpected at ${i}`);
  }

  const v = or();
  peek();
  if (i < s.length) throw new Error('trailing');
  if (!Number.isFinite(v)) throw new Error('not finite');
  return v;
}

export type CompareCheck = {
  a: string; b: string;
  vars: { name: string; lo: number; hi: number; integer: boolean }[];
  where: string;
};

/**
 * Какой ответ верен для сравнения А и Б при всех допустимых значениях переменных.
 * 'А' / 'Б' / 'В' — одно и то же при всех пробах; 'Г' — знак меняется. null — выражения не разобрались
 * или допустимых проб слишком мало (тогда вопрос проверит независимый решатель).
 */
export function decideCompare(c: CompareCheck, samples = 80): 'А' | 'Б' | 'В' | 'Г' | null {
  try {
    if (!c.a.trim() || !c.b.trim()) return null;
    const signs = new Set<number>();
    let used = 0;
    const tries = c.vars.length === 0 ? 1 : samples * 6;
    for (let t = 0; t < tries && used < (c.vars.length === 0 ? 1 : samples); t++) {
      const scope: Scope = {};
      for (const v of c.vars) {
        const u = Math.random();
        scope[v.name] = v.integer ? Math.round(v.lo + u * (v.hi - v.lo)) : v.lo + u * (v.hi - v.lo);
      }
      if (c.where.trim() && !evalExpr(c.where, scope)) continue;
      const A = evalExpr(c.a, scope), B = evalExpr(c.b, scope);
      const tol = 1e-9 * Math.max(1, Math.abs(A), Math.abs(B));
      signs.add(Math.abs(A - B) <= tol ? 0 : A > B ? 1 : -1);
      used++;
    }
    if (used < (c.vars.length === 0 ? 1 : 12)) return null;
    if (signs.size > 1) return 'Г';
    const [only] = [...signs];
    return only === 0 ? 'В' : only === 1 ? 'А' : 'Б';
  } catch {
    return null;
  }
}
