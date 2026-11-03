// Образцы вопросов для ИИ — настоящий стиль ОРТ (пособия ЦООМО и School Club), ответы проверены вручную.
// Они лежат в системном промпте и кэшируются (prompt caching): платим за них один раз, дальше читаем
// из кэша за малую долю цены. Формат — ровно тот, который ИИ должен вернуть.
type Check = { a: string; b: string; vars: { name: string; lo: number; hi: number; integer: boolean }[]; where: string };

export type CompareExample = { given: string; a: string; b: string; figure: string; check: Check; answer: 'А' | 'Б' | 'В' | 'Г'; explanation: string };
export type ChoiceExample = { text: string; options: string[]; answer: number; figure: string; explanation: string };

const none: Check['vars'] = [];

export const COMPARE_EXAMPLES: CompareExample[] = [
  { given: '', a: '$\\frac{-5+123}{-123+5}$', b: '$-1$', figure: '', answer: 'В',
    check: { a: '(-5+123)/(-123+5)', b: '-1', vars: none, where: '' },
    explanation: 'Числитель 118, знаменатель −118, дробь равна −1.' },
  { given: '', a: '$-4\\sqrt{3}$', b: '$-\\frac{4}{\\sqrt{3}}$', figure: '', answer: 'Б',
    check: { a: '-4*sqrt(3)', b: '-4/sqrt(3)', vars: none, where: '' },
    explanation: '−4√3 ≈ −6,93, а −4/√3 ≈ −2,31; больше величина Б.' },
  { given: '$0<a<1$', a: '$\\sqrt{1-a^2}$', b: '$0{,}5$', figure: '', answer: 'Г',
    check: { a: 'sqrt(1-a^2)', b: '0.5', vars: [{ name: 'a', lo: 0.001, hi: 0.999, integer: false }], where: '' },
    explanation: 'При a = 0,5 величина А ≈ 0,87 больше, при a = 0,95 она ≈ 0,31 меньше.' },
  { given: '$x+y=10$, $2y>x$', a: '$x$', b: '$y$', figure: '', answer: 'Г',
    check: { a: '10-y', b: 'y', vars: [{ name: 'y', lo: -30, hi: 30, integer: false }], where: '2*y>10-y' },
    explanation: 'Условие даёт y > 10/3: при y = 4 имеем x = 6 > y, при y = 8 имеем x = 2 < y.' },
  { given: 'Цена выросла с 50 до 200 долларов на $x\\%$', a: '$x\\%$', b: '$150\\%$', figure: '', answer: 'А',
    check: { a: '(200-50)/50*100', b: '150', vars: none, where: '' },
    explanation: 'Рост на 150 от 50 — это 300%, а 300% > 150%.' },
  { given: '$ABCD$ — квадрат, $AC=4$, $E$ — точка пересечения диагоналей', a: 'Площадь треугольника $EAD$', b: '$4$',
    figure: '{"points":{"A":[0,0],"B":[0,4],"C":[4,4],"D":[4,0],"E":[2,2]},"segments":["AB","BC","CD","DA","AC","BD"]}', answer: 'Б',
    check: { a: '(4*4/2)/4', b: '4', vars: none, where: '' },
    explanation: 'Площадь квадрата с диагональю 4 равна 4²/2 = 8, треугольник EAD — её четверть, то есть 2 < 4.' },
  { given: '', a: '$b-a$', b: '$ab$', figure: '{"numberLine":{"points":{"a":-2,"b":3},"marks":[0]}}', answer: 'А',
    check: { a: 'b-a', b: 'a*b', vars: [{ name: 'a', lo: -5, hi: -0.1, integer: false }, { name: 'b', lo: 0.1, hi: 5, integer: false }], where: '' },
    explanation: 'a < 0 < b, поэтому b − a > 0, а ab < 0.' },
  { given: '', a: '$123\\%$ от $225$', b: '$225\\%$ от $123$', figure: '', answer: 'В',
    check: { a: '1.23*225', b: '2.25*123', vars: none, where: '' },
    explanation: 'Обе величины равны 276,75: 1,23·225 = 2,25·123.' },
];

export const CHOICE_EXAMPLES: ChoiceExample[] = [
  { text: 'Если $\\frac{1}{5}$ числа равна $4$, то чему равна $\\frac{1}{3}$ данного числа?', options: ['12', '3', '$6\\frac{2}{3}$', '5', '15'], answer: 2, figure: '',
    explanation: 'Число равно 20, а 20 : 3 = 6⅔.' },
  { text: 'Сумма корней уравнения $(2x+3)(4x-1)=0$ равна', options: ['$1{,}25$', '$-1{,}25$', '$-0{,}8$', '$0{,}8$', '$0$'], answer: 1, figure: '',
    explanation: 'x = −1,5 и x = 0,25; сумма равна −1,25.' },
  { text: 'Папа купил три арбуза. Первый вдвое легче второго и на 3 кг легче третьего. Три арбуза весят 27 кг. Сколько весит первый арбуз?', options: ['3,5 кг', '6 кг', '7,5 кг', '8 кг', '12 кг'], answer: 1, figure: '',
    explanation: 'x + 2x + (x + 3) = 27, откуда x = 6.' },
  { text: 'Сколько существует трёхзначных натуральных чисел, сумма цифр которых равна 5?', options: ['11', '14', '12', '15', '13'], answer: 3, figure: '',
    explanation: 'Первая цифра не меньше 1; уменьшив её на 1, делим 4 между тремя цифрами: C(6,2) = 15.' },
  { text: '$2x+y=12$, $4x+5y=36$. Найдите среднее арифметическое чисел $x$ и $y$.', options: ['4', '5', '6', '7', '8'], answer: 0, figure: '',
    explanation: 'Из первого y = 12 − 2x; подставив, получаем x = 4, y = 4.' },
  { text: 'В прямоугольном треугольнике $ABC$ угол $C$ прямой, $AC=6$, $BC=8$. Найдите $AB$.', options: ['9', '10', '$\\sqrt{28}$', '12', '14'], answer: 1,
    figure: '{"points":{"C":[0,0],"A":[0,6],"B":[8,0]},"segments":[{"from":"C","to":"A","label":"6"},{"from":"C","to":"B","label":"8"},{"from":"A","to":"B","label":"?"}],"angles":[{"at":"C","right":true,"of":["A","B"]}]}',
    explanation: 'По теореме Пифагора AB = √(36 + 64) = 10.' },
  { text: 'На диаграмме показано, как распределились отдыхающие по месяцам. Сколько процентов составляет число отдыхающих в августе по сравнению с июлем?', options: ['30%', '60%', '50%', '75%', '125%'], answer: 1,
    figure: '{"pie":{"slices":[{"label":"Июль","value":50},{"label":"Август","value":30},{"label":"Июнь","value":20}],"unit":"%"}}',
    explanation: '30 : 50 = 0,6, то есть 60%.' },
];
