import { QuizQuestion } from '../types/quiz';

export const quizPool: QuizQuestion[] = [
  // ─── Математика — Числа и операции (m1) ───────────────────────────────────
  {
    id: 'q-m1-1', topicId: 'm1', subjectId: 'math',
    text: 'Какое число следует в ряду: 2, 4, 8, 16, ?',
    options: [{ id: 'a', text: '24' }, { id: 'b', text: '30' }, { id: 'c', text: '32' }, { id: 'd', text: '64' }],
    correctId: 'c', explanation: 'Каждое число умножается на 2.',
  },
  {
    id: 'q-m1-2', topicId: 'm1', subjectId: 'math',
    text: 'Сколько будет (−3) + 7?',
    options: [{ id: 'a', text: '−10' }, { id: 'b', text: '4' }, { id: 'c', text: '−4' }, { id: 'd', text: '10' }],
    correctId: 'b',
  },
  {
    id: 'q-m1-3', topicId: 'm1', subjectId: 'math',
    text: 'Какое из чисел является простым?',
    options: [{ id: 'a', text: '21' }, { id: 'b', text: '29' }, { id: 'c', text: '33' }, { id: 'd', text: '39' }],
    correctId: 'b', explanation: '29 делится только на 1 и на себя.',
  },
  {
    id: 'q-m1-4', topicId: 'm1', subjectId: 'math',
    text: 'Чему равно 15% от 200?',
    options: [{ id: 'a', text: '15' }, { id: 'b', text: '25' }, { id: 'c', text: '30' }, { id: 'd', text: '35' }],
    correctId: 'c', explanation: '200 × 0.15 = 30.',
  },
  {
    id: 'q-m1-5', topicId: 'm1', subjectId: 'math',
    text: 'НОД(12, 18) равен:',
    options: [{ id: 'a', text: '2' }, { id: 'b', text: '4' }, { id: 'c', text: '6' }, { id: 'd', text: '9' }],
    correctId: 'c', explanation: '12 = 2²×3, 18 = 2×3². НОД = 2×3 = 6.',
  },
  {
    id: 'q-m1-6', topicId: 'm1', subjectId: 'math',
    text: 'Каков остаток от деления 47 на 5?',
    options: [{ id: 'a', text: '1' }, { id: 'b', text: '2' }, { id: 'c', text: '3' }, { id: 'd', text: '7' }],
    correctId: 'b', explanation: '47 = 5×9 + 2, остаток 2.',
  },
  {
    id: 'q-m1-7', topicId: 'm1', subjectId: 'math',
    text: 'Что такое (-5) × (-3)?',
    options: [{ id: 'a', text: '-15' }, { id: 'b', text: '15' }, { id: 'c', text: '-8' }, { id: 'd', text: '8' }],
    correctId: 'b', explanation: 'Минус на минус = плюс.',
  },
  // ─── Математика — Дроби и проценты (m2) ────────────────────────────────────
  {
    id: 'q-m2-1', topicId: 'm2', subjectId: 'math',
    text: 'Сократи дробь 12/18',
    options: [{ id: 'a', text: '2/3' }, { id: 'b', text: '3/4' }, { id: 'c', text: '4/6' }, { id: 'd', text: '6/9' }],
    correctId: 'a', explanation: '12/18 ÷ 6/6 = 2/3.',
  },
  {
    id: 'q-m2-2', topicId: 'm2', subjectId: 'math',
    text: 'Чему равно 3/4 + 1/4?',
    options: [{ id: 'a', text: '4/8' }, { id: 'b', text: '1' }, { id: 'c', text: '4/4' }, { id: 'd', text: '2/4' }],
    correctId: 'b',
  },
  {
    id: 'q-m2-3', topicId: 'm2', subjectId: 'math',
    text: 'Если цена снизилась на 20%, новая цена составляет...',
    options: [{ id: 'a', text: '120% от старой' }, { id: 'b', text: '80% от старой' }, { id: 'c', text: '20% от старой' }, { id: 'd', text: '100% от старой' }],
    correctId: 'b',
  },
  {
    id: 'q-m2-4', topicId: 'm2', subjectId: 'math',
    text: 'Сколько составляет 2/5 от 100?',
    options: [{ id: 'a', text: '20' }, { id: 'b', text: '25' }, { id: 'c', text: '40' }, { id: 'd', text: '50' }],
    correctId: 'c', explanation: '100 × 2/5 = 40.',
  },
  {
    id: 'q-m2-5', topicId: 'm2', subjectId: 'math',
    text: '1/3 + 1/6 = ?',
    options: [{ id: 'a', text: '2/9' }, { id: 'b', text: '1/2' }, { id: 'c', text: '1/3' }, { id: 'd', text: '2/6' }],
    correctId: 'b', explanation: '2/6 + 1/6 = 3/6 = 1/2.',
  },
  {
    id: 'q-m2-6', topicId: 'm2', subjectId: 'math',
    text: 'Цена товара 500 сом, скидка 30%. Цена со скидкой?',
    options: [{ id: 'a', text: '150 сом' }, { id: 'b', text: '300 сом' }, { id: 'c', text: '350 сом' }, { id: 'd', text: '470 сом' }],
    correctId: 'c', explanation: '500 × 0.7 = 350 сом.',
  },
  // ─── Математика — Отношения и пропорции (m3) ───────────────────────────────
  {
    id: 'q-m3-1', topicId: 'm3', subjectId: 'math',
    text: 'Если 3/x = 6/10, то x равен:',
    options: [{ id: 'a', text: '3' }, { id: 'b', text: '4' }, { id: 'c', text: '5' }, { id: 'd', text: '6' }],
    correctId: 'c', explanation: '3×10 = 6×x → x = 30/6 = 5.',
  },
  {
    id: 'q-m3-2', topicId: 'm3', subjectId: 'math',
    text: 'Машина едет 60 км/ч. За 2.5 часа она проедет:',
    options: [{ id: 'a', text: '100 км' }, { id: 'b', text: '120 км' }, { id: 'c', text: '150 км' }, { id: 'd', text: '180 км' }],
    correctId: 'c', explanation: '60 × 2.5 = 150 км.',
  },
  {
    id: 'q-m3-3', topicId: 'm3', subjectId: 'math',
    text: 'Смешали 2 л раствора 10% и 3 л раствора 20%. Концентрация смеси:',
    options: [{ id: 'a', text: '14%' }, { id: 'b', text: '15%' }, { id: 'c', text: '16%' }, { id: 'd', text: '30%' }],
    correctId: 'c', explanation: '(2×10 + 3×20) / 5 = 80/5 = 16%.',
  },
  // ─── Математика — Степени и корни (m4) ────────────────────────────────────
  {
    id: 'q-m4-1', topicId: 'm4', subjectId: 'math',
    text: '2⁵ = ?',
    options: [{ id: 'a', text: '10' }, { id: 'b', text: '25' }, { id: 'c', text: '32' }, { id: 'd', text: '64' }],
    correctId: 'c', explanation: '2×2×2×2×2 = 32.',
  },
  {
    id: 'q-m4-2', topicId: 'm4', subjectId: 'math',
    text: '√144 = ?',
    options: [{ id: 'a', text: '11' }, { id: 'b', text: '12' }, { id: 'c', text: '13' }, { id: 'd', text: '14' }],
    correctId: 'b', explanation: '12 × 12 = 144.',
  },
  {
    id: 'q-m4-3', topicId: 'm4', subjectId: 'math',
    text: '3⁰ = ?',
    options: [{ id: 'a', text: '0' }, { id: 'b', text: '1' }, { id: 'c', text: '3' }, { id: 'd', text: '9' }],
    correctId: 'b', explanation: 'Любое число в степени 0 равно 1.',
  },
  // ─── Математика — Уравнения (m5) ──────────────────────────────────────────
  {
    id: 'q-m5-1', topicId: 'm5', subjectId: 'math',
    text: 'Реши уравнение: 3x + 7 = 22',
    options: [{ id: 'a', text: 'x = 3' }, { id: 'b', text: 'x = 5' }, { id: 'c', text: 'x = 7' }, { id: 'd', text: 'x = 9' }],
    correctId: 'b', explanation: '3x = 22 - 7 = 15, x = 5.',
  },
  {
    id: 'q-m5-2', topicId: 'm5', subjectId: 'math',
    text: 'Реши: 2x − 4 = x + 3',
    options: [{ id: 'a', text: 'x = 5' }, { id: 'b', text: 'x = 7' }, { id: 'c', text: 'x = 3' }, { id: 'd', text: 'x = 1' }],
    correctId: 'b', explanation: '2x - x = 3 + 4 → x = 7.',
  },
  {
    id: 'q-m5-3', topicId: 'm5', subjectId: 'math',
    text: 'При каком x неравенство 4x > 12?',
    options: [{ id: 'a', text: 'x > 3' }, { id: 'b', text: 'x < 3' }, { id: 'c', text: 'x ≥ 3' }, { id: 'd', text: 'x = 3' }],
    correctId: 'a',
  },
  // ─── Геометрия — Углы (g1) ────────────────────────────────────────────────
  {
    id: 'q-g1-1', topicId: 'g1', subjectId: 'geometry',
    text: 'Если прямые a и b параллельны и один из углов при секущей равен 93°, то смежный ему угол x равен',
    options: [{ id: 'a', text: '83°' }, { id: 'b', text: '87°' }, { id: 'c', text: '93°' }, { id: 'd', text: '97°' }, { id: 'e', text: '103°' }],
    correctId: 'b', explanation: 'Смежные углы при параллельных прямых: α + x = 180°. x = 180° − 93° = 87°.',
  },
  {
    id: 'q-g1-2', topicId: 'g1', subjectId: 'geometry',
    text: 'Сколько градусов содержит каждый угол правильного шестиугольника?',
    options: [{ id: 'a', text: '90°' }, { id: 'b', text: '100°' }, { id: 'c', text: '108°' }, { id: 'd', text: '120°' }, { id: 'e', text: '135°' }],
    correctId: 'd', explanation: '(6−2)×180° = 720°. Каждый угол = 720°÷6 = 120°.',
  },
  {
    id: 'q-g1-3', topicId: 'g1', subjectId: 'geometry',
    text: 'Два угла треугольника равны 35° и 75°. Чему равен внешний угол при третьей вершине?',
    options: [{ id: 'a', text: '70°' }, { id: 'b', text: '110°' }, { id: 'c', text: '140°' }, { id: 'd', text: '250°' }, { id: 'e', text: '70° или 110°' }],
    correctId: 'b', explanation: 'Внешний угол = сумма двух несмежных внутренних = 35° + 75° = 110°.',
  },
  {
    id: 'q-g1-4', topicId: 'g1', subjectId: 'geometry',
    text: 'Угол между биссектрисами двух смежных углов равен',
    options: [{ id: 'a', text: '30°' }, { id: 'b', text: '45°' }, { id: 'c', text: '60°' }, { id: 'd', text: '90°' }, { id: 'e', text: '120°' }],
    correctId: 'd', explanation: 'Биссектрисы смежных углов α/2 и (180°−α)/2. Угол между ними = α/2 + (180°−α)/2 = 90°. Всегда 90°!',
  },
  {
    id: 'q-g1-5', topicId: 'g1', subjectId: 'geometry',
    text: 'Вертикальный угол к углу 127° равен',
    options: [{ id: 'a', text: '53°' }, { id: 'b', text: '63°' }, { id: 'c', text: '127°' }, { id: 'd', text: '233°' }, { id: 'e', text: '307°' }],
    correctId: 'c', explanation: 'Вертикальные углы равны. Вертикальный угол = 127°.',
  },
  {
    id: 'q-g1-6', topicId: 'g1', subjectId: 'geometry',
    text: 'Если накрест лежащий угол при параллельных прямых равен 64°, то односторонний угол с ним равен',
    options: [{ id: 'a', text: '64°' }, { id: 'b', text: '90°' }, { id: 'c', text: '116°' }, { id: 'd', text: '128°' }, { id: 'e', text: '180°' }],
    correctId: 'c', explanation: 'Накрест лежащие = 64°. Односторонние в сумме = 180°. Односторонний = 180° − 64° = 116°.',
  },
  {
    id: 'q-g1-7', topicId: 'g1', subjectId: 'geometry',
    text: 'Смежные углы относятся как 2:7. Найдите больший угол.',
    options: [{ id: 'a', text: '20°' }, { id: 'b', text: '36°' }, { id: 'c', text: '40°' }, { id: 'd', text: '120°' }, { id: 'e', text: '140°' }],
    correctId: 'e', explanation: 'Сумма = 180°. Больший = 180° × 7/9 = 140°.',
  },
  {
    id: 'q-g1-8', topicId: 'g1', subjectId: 'geometry',
    text: 'Сколько градусов составляет каждый угол правильного треугольника?',
    options: [{ id: 'a', text: '45°' }, { id: 'b', text: '60°' }, { id: 'c', text: '72°' }, { id: 'd', text: '90°' }, { id: 'e', text: '120°' }],
    correctId: 'b', explanation: 'Правильный (равносторонний) треугольник: 180°÷3 = 60°.',
  },
  {
    id: 'q-g1-9', topicId: 'g1', subjectId: 'geometry',
    text: 'Угол в 3 часа между часовой и минутной стрелками равен',
    options: [{ id: 'a', text: '60°' }, { id: 'b', text: '75°' }, { id: 'c', text: '90°' }, { id: 'd', text: '120°' }, { id: 'e', text: '150°' }],
    correctId: 'c', explanation: '12 делений = 360°. Между 12 и 3 = 3 деления = 3×30° = 90°.',
  },
  {
    id: 'q-g1-10', topicId: 'g1', subjectId: 'geometry',
    text: 'При пересечении двух прямых один из четырёх углов равен 55°. Чему равны остальные три угла?',
    options: [{ id: 'a', text: '55°, 125°, 125°' }, { id: 'b', text: '55°, 55°, 125°' }, { id: 'c', text: '55°, 125°, 55°' }, { id: 'd', text: '125°, 55°, 125°' }, { id: 'e', text: '55°, 55°, 55°' }],
    correctId: 'd', explanation: 'Вертикальный = 55°. Смежные с ним = 180° − 55° = 125° (два угла). Четыре угла: 55°, 125°, 55°, 125°.',
  },
  {
    id: 'q-g1-11', topicId: 'g1', subjectId: 'geometry',
    text: 'Сумма углов пятиугольника равна',
    options: [{ id: 'a', text: '360°' }, { id: 'b', text: '450°' }, { id: 'c', text: '540°' }, { id: 'd', text: '720°' }, { id: 'e', text: '900°' }],
    correctId: 'c', explanation: '(5−2)×180° = 540°.',
  },
  {
    id: 'q-g1-12', topicId: 'g1', subjectId: 'geometry',
    text: 'Один из углов равнобедренного треугольника равен 100°. Найдите углы при основании.',
    options: [{ id: 'a', text: 'по 40°' }, { id: 'b', text: 'по 50°' }, { id: 'c', text: '40° и 60°' }, { id: 'd', text: '50° и 30°' }, { id: 'e', text: 'по 80°' }],
    correctId: 'a', explanation: 'Тупой угол = 100° — при вершине. Углы при основании = (180°−100°)/2 = 40° каждый.',
  },
  // ─── Геометрия — Треугольники (g2) ────────────────────────────────────────
  {
    id: 'q-g2-1', topicId: 'g2', subjectId: 'geometry',
    text: 'В прямоугольном треугольнике катеты равны 6 и 8. Чему равна гипотенуза?',
    options: [{ id: 'a', text: '7' }, { id: 'b', text: '10' }, { id: 'c', text: '12' }, { id: 'd', text: '14' }, { id: 'e', text: '√148' }],
    correctId: 'b', explanation: 'c² = 6² + 8² = 36 + 64 = 100. c = 10.',
  },
  {
    id: 'q-g2-2', topicId: 'g2', subjectId: 'geometry',
    text: 'Если периметр равнобедренного треугольника равен 48 и боковая сторона равна 18, то основание равно',
    options: [{ id: 'a', text: '6' }, { id: 'b', text: '8' }, { id: 'c', text: '10' }, { id: 'd', text: '12' }, { id: 'e', text: '24' }],
    correctId: 'd', explanation: 'P = 2×18 + a = 48. a = 48 − 36 = 12.',
  },
  {
    id: 'q-g2-3', topicId: 'g2', subjectId: 'geometry',
    text: 'Средняя линия треугольника равна 7. Чему равна параллельная ей сторона?',
    options: [{ id: 'a', text: '3,5' }, { id: 'b', text: '7' }, { id: 'c', text: '10,5' }, { id: 'd', text: '14' }, { id: 'e', text: '21' }],
    correctId: 'd', explanation: 'Средняя линия = половина стороны. Сторона = 2 × 7 = 14.',
  },
  {
    id: 'q-g2-4', topicId: 'g2', subjectId: 'geometry',
    text: 'В равностороннем треугольнике со стороной 6 высота равна',
    options: [{ id: 'a', text: '3' }, { id: 'b', text: '3√2' }, { id: 'c', text: '3√3' }, { id: 'd', text: '6√2' }, { id: 'e', text: '6' }],
    correctId: 'c', explanation: 'h = 6√3/2 = 3√3.',
  },
  {
    id: 'q-g2-5', topicId: 'g2', subjectId: 'geometry',
    text: 'Площадь прямоугольного треугольника с катетами 5 и 12 равна',
    options: [{ id: 'a', text: '17' }, { id: 'b', text: '25' }, { id: 'c', text: '30' }, { id: 'd', text: '60' }, { id: 'e', text: '65' }],
    correctId: 'c', explanation: 'S = 5 × 12 / 2 = 30.',
  },
  {
    id: 'q-g2-6', topicId: 'g2', subjectId: 'geometry',
    text: 'AK = KB = AB = BC = s. Периметр ABK = 45, периметр ABC = 40. Чему равно AC?',
    options: [{ id: 'a', text: '5' }, { id: 'b', text: '8' }, { id: 'c', text: '10' }, { id: 'd', text: '12' }, { id: 'e', text: '15' }],
    correctId: 'c', explanation: '3s = 45 → s = 15. 2s + AC = 40 → AC = 40 − 30 = 10.',
  },
  {
    id: 'q-g2-7', topicId: 'g2', subjectId: 'geometry',
    text: 'В треугольнике стороны 7, 24, 25. Это треугольник',
    options: [{ id: 'a', text: 'остроугольный' }, { id: 'b', text: 'тупоугольный' }, { id: 'c', text: 'прямоугольный' }, { id: 'd', text: 'равнобедренный' }, { id: 'e', text: 'равносторонний' }],
    correctId: 'c', explanation: '7² + 24² = 49 + 576 = 625 = 25². Теорема Пифагора выполняется → прямоугольный.',
  },
  {
    id: 'q-g2-8', topicId: 'g2', subjectId: 'geometry',
    text: 'В равнобедренном треугольнике угол при вершине равен 40°. Углы при основании равны',
    options: [{ id: 'a', text: 'по 40°' }, { id: 'b', text: 'по 60°' }, { id: 'c', text: 'по 70°' }, { id: 'd', text: 'по 80°' }, { id: 'e', text: 'по 140°' }],
    correctId: 'c', explanation: '(180° − 40°) / 2 = 140°/2 = 70°.',
  },
  {
    id: 'q-g2-9', topicId: 'g2', subjectId: 'geometry',
    text: 'В прямоугольном треугольнике ABC с прямым углом C, угол A = 30°. Если AC = 12, то BC равно',
    options: [{ id: 'a', text: '4√3' }, { id: 'b', text: '6' }, { id: 'c', text: '6√3' }, { id: 'd', text: '12√3' }, { id: 'e', text: '24' }],
    correctId: 'a', explanation: 'BC = AC × tg(30°) = 12 × (1/√3) = 12/√3 = 4√3.',
  },
  {
    id: 'q-g2-10', topicId: 'g2', subjectId: 'geometry',
    text: 'Периметр прямоугольного треугольника с катетами 3 и 4 равен',
    options: [{ id: 'a', text: '7' }, { id: 'b', text: '9' }, { id: 'c', text: '12' }, { id: 'd', text: '14' }, { id: 'e', text: '15' }],
    correctId: 'c', explanation: 'Гипотенуза = √(9+16) = 5. P = 3 + 4 + 5 = 12.',
  },
  {
    id: 'q-g2-11', topicId: 'g2', subjectId: 'geometry',
    text: 'Если в треугольнике ABC точки M и N — середины AB и BC, то MN',
    options: [{ id: 'a', text: 'параллельна AC и MN = AC' }, { id: 'b', text: 'параллельна AC и MN = AC/2' }, { id: 'c', text: 'перпендикулярна AC' }, { id: 'd', text: 'равна AC/3' }, { id: 'e', text: 'проходит через центр вписанной окружности' }],
    correctId: 'b', explanation: 'По теореме о средней линии: MN ∥ AC и MN = AC/2.',
  },
  {
    id: 'q-g2-12', topicId: 'g2', subjectId: 'geometry',
    text: 'Два угла треугольника равны 50° и 70°. Треугольник является',
    options: [{ id: 'a', text: 'прямоугольным' }, { id: 'b', text: 'тупоугольным' }, { id: 'c', text: 'равносторонним' }, { id: 'd', text: 'равнобедренным' }, { id: 'e', text: 'остроугольным' }],
    correctId: 'e', explanation: 'Третий угол = 180° − 50° − 70° = 60°. Все углы: 50°, 60°, 70° — все < 90° → остроугольный.',
  },
  // ─── Геометрия — Четырёхугольники (g3) ────────────────────────────────────
  {
    id: 'q-g3-1', topicId: 'g3', subjectId: 'geometry',
    text: 'Площадь квадрата равна 81. Чему равен его периметр?',
    options: [{ id: 'a', text: '9' }, { id: 'b', text: '18' }, { id: 'c', text: '27' }, { id: 'd', text: '36' }, { id: 'e', text: '324' }],
    correctId: 'd', explanation: 'Сторона = √81 = 9. Периметр = 4 × 9 = 36.',
  },
  {
    id: 'q-g3-2', topicId: 'g3', subjectId: 'geometry',
    text: 'В параллелограмме один угол равен 70°. Чему равен смежный с ним угол?',
    options: [{ id: 'a', text: '70°' }, { id: 'b', text: '90°' }, { id: 'c', text: '100°' }, { id: 'd', text: '110°' }, { id: 'e', text: '140°' }],
    correctId: 'd', explanation: 'Смежные углы параллелограмма в сумме = 180°. 180° − 70° = 110°.',
  },
  {
    id: 'q-g3-3', topicId: 'g3', subjectId: 'geometry',
    text: 'Диагонали ромба равны 6 и 8. Чему равна сторона ромба?',
    options: [{ id: 'a', text: '5' }, { id: 'b', text: '7' }, { id: 'c', text: '10' }, { id: 'd', text: '12' }, { id: 'e', text: '√50' }],
    correctId: 'a', explanation: 'Диагонали перпендикулярны и делятся пополам: 3 и 4. Сторона = √(3²+4²) = √25 = 5.',
  },
  {
    id: 'q-g3-4', topicId: 'g3', subjectId: 'geometry',
    text: 'Трапеция ABCD: AB ∥ CD, AB = 18, CD = 12. Средняя линия трапеции равна',
    options: [{ id: 'a', text: '6' }, { id: 'b', text: '10' }, { id: 'c', text: '15' }, { id: 'd', text: '21' }, { id: 'e', text: '30' }],
    correctId: 'c', explanation: 'Средняя линия = (18+12)/2 = 15.',
  },
  {
    id: 'q-g3-5', topicId: 'g3', subjectId: 'geometry',
    text: 'Если диагональ прямоугольника равна 13, а одна сторона = 5, то площадь прямоугольника равна',
    options: [{ id: 'a', text: '30' }, { id: 'b', text: '45' }, { id: 'c', text: '60' }, { id: 'd', text: '65' }, { id: 'e', text: '120' }],
    correctId: 'c', explanation: 'Другая сторона = √(13²−5²) = √144 = 12. S = 5×12 = 60.',
  },
  {
    id: 'q-g3-6', topicId: 'g3', subjectId: 'geometry',
    text: 'Сумма углов шестиугольника равна',
    options: [{ id: 'a', text: '360°' }, { id: 'b', text: '540°' }, { id: 'c', text: '720°' }, { id: 'd', text: '900°' }, { id: 'e', text: '1080°' }],
    correctId: 'c', explanation: '(6−2)×180° = 720°.',
  },
  {
    id: 'q-g3-7', topicId: 'g3', subjectId: 'geometry',
    text: 'В параллелограмме ABCD диагонали равны 10 и 14, AD = 8. Периметр треугольника AOD (O — пересечение диагоналей) равен',
    options: [{ id: 'a', text: '15' }, { id: 'b', text: '17' }, { id: 'c', text: '20' }, { id: 'd', text: '25' }, { id: 'e', text: '30' }],
    correctId: 'c', explanation: 'AO = 10/2 = 5; OD = 14/2 = 7. Периметр AOD = 5 + 7 + 8 = 20.',
  },
  {
    id: 'q-g3-8', topicId: 'g3', subjectId: 'geometry',
    text: 'Площадь параллелограмма со стороной 9 и высотой к ней 6 равна',
    options: [{ id: 'a', text: '27' }, { id: 'b', text: '42' }, { id: 'c', text: '54' }, { id: 'd', text: '108' }, { id: 'e', text: '81' }],
    correctId: 'c', explanation: 'S = основание × высота = 9 × 6 = 54.',
  },
  {
    id: 'q-g3-9', topicId: 'g3', subjectId: 'geometry',
    text: 'В прямоугольнике со сторонами 3 и 7 диагональ равна',
    options: [{ id: 'a', text: '4' }, { id: 'b', text: '√50' }, { id: 'c', text: '√58' }, { id: 'd', text: '10' }, { id: 'e', text: '√62' }],
    correctId: 'c', explanation: 'd = √(3²+7²) = √(9+49) = √58.',
  },
  {
    id: 'q-g3-10', topicId: 'g3', subjectId: 'geometry',
    text: 'Площадь трапеции с основаниями 6 и 10 и высотой 4 равна',
    options: [{ id: 'a', text: '24' }, { id: 'b', text: '32' }, { id: 'c', text: '40' }, { id: 'd', text: '48' }, { id: 'e', text: '64' }],
    correctId: 'b', explanation: 'S = (6+10)×4/2 = 16×4/2 = 32.',
  },
  {
    id: 'q-g3-11', topicId: 'g3', subjectId: 'geometry',
    text: 'В равнобедренной трапеции угол при большем основании равен 60°. Угол при меньшем основании равен',
    options: [{ id: 'a', text: '60°' }, { id: 'b', text: '90°' }, { id: 'c', text: '100°' }, { id: 'd', text: '120°' }, { id: 'e', text: '150°' }],
    correctId: 'd', explanation: 'В трапеции углы при одной боковой стороне в сумме = 180°. 180° − 60° = 120°.',
  },
  {
    id: 'q-g3-12', topicId: 'g3', subjectId: 'geometry',
    text: 'Квадрат разбит диагональю на два треугольника. Если сторона квадрата = 8, то площадь каждого треугольника равна',
    options: [{ id: 'a', text: '16' }, { id: 'b', text: '22' }, { id: 'c', text: '32' }, { id: 'd', text: '44' }, { id: 'e', text: '64' }],
    correctId: 'c', explanation: 'S квадрата = 8² = 64. Каждый треугольник = 64/2 = 32.',
  },
  // ─── Геометрия — Окружность и круг (g4) ───────────────────────────────────
  {
    id: 'q-g4-1', topicId: 'g4', subjectId: 'geometry',
    text: 'Длина окружности с радиусом 7 равна',
    options: [{ id: 'a', text: '7π' }, { id: 'b', text: '14π' }, { id: 'c', text: '49π' }, { id: 'd', text: '98π' }, { id: 'e', text: '14' }],
    correctId: 'b', explanation: 'C = 2πr = 2π × 7 = 14π.',
  },
  {
    id: 'q-g4-2', topicId: 'g4', subjectId: 'geometry',
    text: 'Площадь круга с диаметром 10 равна',
    options: [{ id: 'a', text: '10π' }, { id: 'b', text: '20π' }, { id: 'c', text: '25π' }, { id: 'd', text: '50π' }, { id: 'e', text: '100π' }],
    correctId: 'c', explanation: 'r = 5. S = πr² = 25π.',
  },
  {
    id: 'q-g4-3', topicId: 'g4', subjectId: 'geometry',
    text: 'Вписанный угол, опирающийся на дугу 80°, равен',
    options: [{ id: 'a', text: '20°' }, { id: 'b', text: '40°' }, { id: 'c', text: '80°' }, { id: 'd', text: '120°' }, { id: 'e', text: '160°' }],
    correctId: 'b', explanation: 'Вписанный = дуга/2 = 80°/2 = 40°.',
  },
  {
    id: 'q-g4-4', topicId: 'g4', subjectId: 'geometry',
    text: 'Точка C лежит на окружности с диаметром AB = 10. Чему равен угол ACB?',
    options: [{ id: 'a', text: '45°' }, { id: 'b', text: '60°' }, { id: 'c', text: '90°' }, { id: 'd', text: '120°' }, { id: 'e', text: '180°' }],
    correctId: 'c', explanation: 'Вписанный угол на диаметр = 90° (теорема Фалеса).',
  },
  {
    id: 'q-g4-5', topicId: 'g4', subjectId: 'geometry',
    text: 'Окружности с центрами A и B касаются внешним образом. r_A = 4, r_B = 6. Расстояние AB равно',
    options: [{ id: 'a', text: '2' }, { id: 'b', text: '5' }, { id: 'c', text: '10' }, { id: 'd', text: '24' }, { id: 'e', text: '√52' }],
    correctId: 'c', explanation: 'При внешнем касании: AB = r_A + r_B = 4 + 6 = 10.',
  },
  {
    id: 'q-g4-6', topicId: 'g4', subjectId: 'geometry',
    text: 'Площадь сектора с радиусом 6 и центральным углом 60° равна',
    options: [{ id: 'a', text: 'π' }, { id: 'b', text: '3π' }, { id: 'c', text: '6π' }, { id: 'd', text: '9π' }, { id: 'e', text: '36π' }],
    correctId: 'c', explanation: 'S = πr² × α/360° = π×36 × 60/360 = 6π.',
  },
  {
    id: 'q-g4-7', topicId: 'g4', subjectId: 'geometry',
    text: 'Окружности с центрами в вершинах треугольника ABC попарно касаются. AB=6, BC=7, AC=5. Радиус при вершине C равен',
    options: [{ id: 'a', text: '1' }, { id: 'b', text: '2' }, { id: 'c', text: '3' }, { id: 'd', text: '4' }, { id: 'e', text: '5' }],
    correctId: 'c', explanation: 'r_A+r_B=6; r_B+r_C=7; r_A+r_C=5. Сумма: 2(r_A+r_B+r_C)=18, итого=9. r_C=9−6=3.',
  },
  {
    id: 'q-g4-8', topicId: 'g4', subjectId: 'geometry',
    text: 'Площадь кольца: внешний радиус R=6, внутренний r=4.',
    options: [{ id: 'a', text: '2π' }, { id: 'b', text: '12π' }, { id: 'c', text: '16π' }, { id: 'd', text: '20π' }, { id: 'e', text: '36π−16π' }],
    correctId: 'd', explanation: 'S = π(R²−r²) = π(36−16) = 20π.',
  },
  {
    id: 'q-g4-9', topicId: 'g4', subjectId: 'geometry',
    text: 'Длина дуги с центральным углом 90° и радиусом 8 равна',
    options: [{ id: 'a', text: '2π' }, { id: 'b', text: '4π' }, { id: 'c', text: '8π' }, { id: 'd', text: '16π' }, { id: 'e', text: '32π' }],
    correctId: 'b', explanation: 'l = 2π×8 × 90/360 = 16π/4 = 4π.',
  },
  {
    id: 'q-g4-10', topicId: 'g4', subjectId: 'geometry',
    text: 'Квадрат вписан в окружность радиуса R. Площадь квадрата равна',
    options: [{ id: 'a', text: 'R²' }, { id: 'b', text: 'R²√2' }, { id: 'c', text: '2R²' }, { id: 'd', text: '2R²√2' }, { id: 'e', text: '4R²' }],
    correctId: 'c', explanation: 'Диагональ квадрата = 2R. Сторона = 2R/√2 = R√2. S = (R√2)² = 2R².',
  },
  {
    id: 'q-g4-11', topicId: 'g4', subjectId: 'geometry',
    text: 'Вписанный угол равен 45°. Чему равен соответствующий центральный угол?',
    options: [{ id: 'a', text: '22,5°' }, { id: 'b', text: '45°' }, { id: 'c', text: '90°' }, { id: 'd', text: '135°' }, { id: 'e', text: '180°' }],
    correctId: 'c', explanation: 'Центральный = 2 × вписанный = 2 × 45° = 90°.',
  },
  {
    id: 'q-g4-12', topicId: 'g4', subjectId: 'geometry',
    text: 'Радиус описанной окружности правильного треугольника со стороной a равен',
    options: [{ id: 'a', text: 'a/2' }, { id: 'b', text: 'a/√3' }, { id: 'c', text: 'a√3/3' }, { id: 'd', text: 'a√3/2' }, { id: 'e', text: 'a' }],
    correctId: 'c', explanation: 'Для правильного треугольника R = a/√3 = a√3/3.',
  },
  // ─── Геометрия — Вероятность (g5) ─────────────────────────────────────────
  {
    id: 'q-g5-1', topicId: 'g5', subjectId: 'geometry',
    text: 'Айнура забыла последнюю цифру номера телефона и набрала её наугад. Какова вероятность попасть к нужному абоненту?',
    options: [{ id: 'a', text: '1/10' }, { id: 'b', text: '1/9' }, { id: 'c', text: '1/6' }, { id: 'd', text: '1/5' }, { id: 'e', text: '1/2' }],
    correctId: 'a', explanation: 'Цифры 0–9, всего 10 вариантов, верный 1. P = 1/10.',
  },
  {
    id: 'q-g5-2', topicId: 'g5', subjectId: 'geometry',
    text: 'В корзине 5 красных и 3 синих шара. Вытащили один. Вероятность, что синий, равна',
    options: [{ id: 'a', text: '1/5' }, { id: 'b', text: '3/8' }, { id: 'c', text: '3/5' }, { id: 'd', text: '5/8' }, { id: 'e', text: '1/3' }],
    correctId: 'b', explanation: 'Всего 8 шаров. P(синий) = 3/8.',
  },
  {
    id: 'q-g5-3', topicId: 'g5', subjectId: 'geometry',
    text: 'Вероятность события A равна 0,25. Вероятность противоположного события',
    options: [{ id: 'a', text: '0,25' }, { id: 'b', text: '0,5' }, { id: 'c', text: '0,75' }, { id: 'd', text: '1,25' }, { id: 'e', text: '0,025' }],
    correctId: 'c', explanation: 'P(не A) = 1 − 0,25 = 0,75.',
  },
  {
    id: 'q-g5-4', topicId: 'g5', subjectId: 'geometry',
    text: 'На карточках числа от 1 до 10. Выбрали одну. Вероятность чётного числа',
    options: [{ id: 'a', text: '1/5' }, { id: 'b', text: '2/5' }, { id: 'c', text: '1/2' }, { id: 'd', text: '3/5' }, { id: 'e', text: '4/5' }],
    correctId: 'c', explanation: 'Чётных (2,4,6,8,10): 5. Всего: 10. P = 5/10 = 1/2.',
  },
  {
    id: 'q-g5-5', topicId: 'g5', subjectId: 'geometry',
    text: 'Монету подбрасывают дважды. Вероятность выпадения орла оба раза',
    options: [{ id: 'a', text: '1/2' }, { id: 'b', text: '1/3' }, { id: 'c', text: '1/4' }, { id: 'd', text: '1/6' }, { id: 'e', text: '3/4' }],
    correctId: 'c', explanation: '4 равных исхода (ОО, ОР, РО, РР). P = 1/4. Или: (1/2)² = 1/4.',
  },
  {
    id: 'q-g5-6', topicId: 'g5', subjectId: 'geometry',
    text: 'Из колоды 36 карт случайно вытащили одну. Вероятность туза',
    options: [{ id: 'a', text: '1/36' }, { id: 'b', text: '1/9' }, { id: 'c', text: '1/6' }, { id: 'd', text: '1/4' }, { id: 'e', text: '4/9' }],
    correctId: 'b', explanation: '4 туза из 36. P = 4/36 = 1/9.',
  },
  {
    id: 'q-g5-7', topicId: 'g5', subjectId: 'geometry',
    text: 'Кубик бросают один раз. Вероятность числа больше 4',
    options: [{ id: 'a', text: '1/6' }, { id: 'b', text: '1/3' }, { id: 'c', text: '1/2' }, { id: 'd', text: '2/3' }, { id: 'e', text: '5/6' }],
    correctId: 'b', explanation: 'Числа >4: {5,6} — 2 исхода. P = 2/6 = 1/3.',
  },
  {
    id: 'q-g5-8', topicId: 'g5', subjectId: 'geometry',
    text: 'В классе 12 мальчиков и 8 девочек. Случайно выбирают одного. Вероятность выбора девочки',
    options: [{ id: 'a', text: '1/5' }, { id: 'b', text: '2/5' }, { id: 'c', text: '1/2' }, { id: 'd', text: '3/5' }, { id: 'e', text: '2/3' }],
    correctId: 'b', explanation: 'P = 8/20 = 2/5.',
  },
  {
    id: 'q-g5-9', topicId: 'g5', subjectId: 'geometry',
    text: 'Вероятность дождя 0,6. Вероятность того, что дождя НЕ будет',
    options: [{ id: 'a', text: '0,2' }, { id: 'b', text: '0,4' }, { id: 'c', text: '0,5' }, { id: 'd', text: '0,6' }, { id: 'e', text: '1,6' }],
    correctId: 'b', explanation: 'P(нет дождя) = 1 − 0,6 = 0,4.',
  },
  {
    id: 'q-g5-10', topicId: 'g5', subjectId: 'geometry',
    text: 'В мешке 3 белых, 4 чёрных, 5 красных шаров. Вероятность НЕ красного',
    options: [{ id: 'a', text: '5/12' }, { id: 'b', text: '7/12' }, { id: 'c', text: '1/2' }, { id: 'd', text: '5/7' }, { id: 'e', text: '7/5' }],
    correctId: 'b', explanation: 'Не красных: 3+4=7. Всего: 12. P = 7/12.',
  },
  {
    id: 'q-g5-11', topicId: 'g5', subjectId: 'geometry',
    text: 'Случайно выбирается число от 1 до 20. Вероятность кратного 3',
    options: [{ id: 'a', text: '1/5' }, { id: 'b', text: '1/4' }, { id: 'c', text: '3/10' }, { id: 'd', text: '1/3' }, { id: 'e', text: '2/5' }],
    correctId: 'c', explanation: 'Кратные 3 до 20: 3,6,9,12,15,18 — 6 чисел. P = 6/20 = 3/10.',
  },
  {
    id: 'q-g5-12', topicId: 'g5', subjectId: 'geometry',
    text: 'Студент знает 24 из 30 билетов. Вероятность вытащить знакомый билет',
    options: [{ id: 'a', text: '1/5' }, { id: 'b', text: '3/10' }, { id: 'c', text: '2/5' }, { id: 'd', text: '4/5' }, { id: 'e', text: '5/6' }],
    correctId: 'd', explanation: 'P = 24/30 = 4/5.',
  },
  {
    id: 'q-g5-13', topicId: 'g5', subjectId: 'geometry',
    text: 'Из 10 деталей 3 бракованных. Вероятность выбрать рабочую деталь',
    options: [{ id: 'a', text: '3/10' }, { id: 'b', text: '7/10' }, { id: 'c', text: '1/3' }, { id: 'd', text: '2/3' }, { id: 'e', text: '1/10' }],
    correctId: 'b', explanation: 'Рабочих: 7. P = 7/10.',
  },
  // ─── Аналогии (a1) ────────────────────────────────────────────────────────
  {
    id: 'q-a1-1', topicId: 'a1', subjectId: 'analogies',
    text: 'Книга : Чтение = Нож : ?',
    options: [{ id: 'a', text: 'Резать' }, { id: 'b', text: 'Стол' }, { id: 'c', text: 'Металл' }, { id: 'd', text: 'Кухня' }],
    correctId: 'a', explanation: 'Книга нужна для чтения, нож — для резания.',
  },
  {
    id: 'q-a1-2', topicId: 'a1', subjectId: 'analogies',
    text: 'Врач : Больница = Учитель : ?',
    options: [{ id: 'a', text: 'Школа' }, { id: 'b', text: 'Урок' }, { id: 'c', text: 'Книга' }, { id: 'd', text: 'Доска' }],
    correctId: 'a',
  },
  {
    id: 'q-a1-3', topicId: 'a1', subjectId: 'analogies',
    text: 'Птица : Гнездо = Рыба : ?',
    options: [{ id: 'a', text: 'Море' }, { id: 'b', text: 'Вода' }, { id: 'c', text: 'Чешуя' }, { id: 'd', text: 'Река' }],
    correctId: 'd', explanation: 'Птица живёт в гнезде, рыба — в реке/водоёме.',
  },
  {
    id: 'q-a1-4', topicId: 'a1', subjectId: 'analogies',
    text: 'Горячий : Холодный = День : ?',
    options: [{ id: 'a', text: 'Неделя' }, { id: 'b', text: 'Ночь' }, { id: 'c', text: 'Утро' }, { id: 'd', text: 'Солнце' }],
    correctId: 'b',
  },
  {
    id: 'q-a1-5', topicId: 'a1', subjectId: 'analogies',
    text: 'Пианист : Фортепиано = Скрипач : ?',
    options: [{ id: 'a', text: 'Смычок' }, { id: 'b', text: 'Скрипка' }, { id: 'c', text: 'Нота' }, { id: 'd', text: 'Концерт' }],
    correctId: 'b',
  },
  {
    id: 'q-a1-6', topicId: 'a1', subjectId: 'analogies',
    text: 'Лето : Жара = Зима : ?',
    options: [{ id: 'a', text: 'Снег' }, { id: 'b', text: 'Мороз' }, { id: 'c', text: 'Шуба' }, { id: 'd', text: 'Декабрь' }],
    correctId: 'b',
  },
  {
    id: 'q-a1-7', topicId: 'a1', subjectId: 'analogies',
    text: 'Глаза : Видеть = Уши : ?',
    options: [{ id: 'a', text: 'Лицо' }, { id: 'b', text: 'Нос' }, { id: 'c', text: 'Слышать' }, { id: 'd', text: 'Чувствовать' }],
    correctId: 'c',
  },
  {
    id: 'q-a1-8', topicId: 'a1', subjectId: 'analogies',
    text: 'Автор : Книга = Художник : ?',
    options: [{ id: 'a', text: 'Краска' }, { id: 'b', text: 'Картина' }, { id: 'c', text: 'Кисть' }, { id: 'd', text: 'Рисунок' }],
    correctId: 'b',
  },
  // ─── Чтение и понимание (r1) ───────────────────────────────────────────────
  {
    id: 'q-r1-1', topicId: 'r1', subjectId: 'reading',
    text: 'Главная мысль текста — это...',
    options: [{ id: 'a', text: 'Первое предложение' }, { id: 'b', text: 'Основная идея автора' }, { id: 'c', text: 'Самое длинное предложение' }, { id: 'd', text: 'Заголовок книги' }],
    correctId: 'b',
  },
  {
    id: 'q-r1-2', topicId: 'r1', subjectId: 'reading',
    text: 'Что такое синоним?',
    options: [{ id: 'a', text: 'Слово с противоположным значением' }, { id: 'b', text: 'Слово близкое по значению' }, { id: 'c', text: 'Слово одного корня' }, { id: 'd', text: 'Иностранное слово' }],
    correctId: 'b',
  },
  {
    id: 'q-r1-3', topicId: 'r1', subjectId: 'reading',
    text: 'Антоним слова "тихий":',
    options: [{ id: 'a', text: 'тихо' }, { id: 'b', text: 'бесшумный' }, { id: 'c', text: 'громкий' }, { id: 'd', text: 'тихоня' }],
    correctId: 'c',
  },
  {
    id: 'q-r1-4', topicId: 'r1', subjectId: 'reading',
    text: 'Что значит "делать умозаключение" при чтении?',
    options: [{ id: 'a', text: 'Запоминать факты' }, { id: 'b', text: 'Перечитывать текст' }, { id: 'c', text: 'Выводить информацию, не сказанную прямо' }, { id: 'd', text: 'Находить ошибки' }],
    correctId: 'c',
  },
  {
    id: 'q-r1-5', topicId: 'r1', subjectId: 'reading',
    text: 'Синоним слова "большой":',
    options: [{ id: 'a', text: 'маленький' }, { id: 'b', text: 'огромный' }, { id: 'c', text: 'средний' }, { id: 'd', text: 'узкий' }],
    correctId: 'b',
  },
  // ─── Грамматика (gr1) ─────────────────────────────────────────────────────
  {
    id: 'q-gr1-1', topicId: 'gr1', subjectId: 'grammar',
    text: 'He ___ to the gym every morning.',
    options: [{ id: 'a', text: 'go' }, { id: 'b', text: 'goes' }, { id: 'c', text: 'going' }, { id: 'd', text: 'gone' }],
    correctId: 'b', explanation: 'С he/she/it в Present Simple добавляется -s.',
  },
  {
    id: 'q-gr1-2', topicId: 'gr1', subjectId: 'grammar',
    text: 'They ___ students.',
    options: [{ id: 'a', text: 'is' }, { id: 'b', text: 'am' }, { id: 'c', text: 'are' }, { id: 'd', text: 'be' }],
    correctId: 'c',
  },
  {
    id: 'q-gr1-3', topicId: 'gr1', subjectId: 'grammar',
    text: 'I ___ a good book yesterday.',
    options: [{ id: 'a', text: 'read' }, { id: 'b', text: 'reads' }, { id: 'c', text: 'reading' }, { id: 'd', text: 'readed' }],
    correctId: 'a', explanation: '"Read" — неправильный глагол, Past Simple = read.',
  },
  {
    id: 'q-gr1-4', topicId: 'gr1', subjectId: 'grammar',
    text: 'She ___ TV when I called.',
    options: [{ id: 'a', text: 'watched' }, { id: 'b', text: 'was watching' }, { id: 'c', text: 'watches' }, { id: 'd', text: 'is watching' }],
    correctId: 'b', explanation: 'Past Continuous: was/were + Ving.',
  },
  {
    id: 'q-gr1-5', topicId: 'gr1', subjectId: 'grammar',
    text: 'There ___ a lot of people at the party.',
    options: [{ id: 'a', text: 'is' }, { id: 'b', text: 'am' }, { id: 'c', text: 'are' }, { id: 'd', text: 'was' }],
    correctId: 'c', explanation: '"people" — множественное число, поэтому "are".',
  },
  {
    id: 'q-gr1-6', topicId: 'gr1', subjectId: 'grammar',
    text: 'Выбери правильный артикль: ___ sun is bright today.',
    options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'An' }, { id: 'c', text: 'The' }, { id: 'd', text: '—' }],
    correctId: 'c', explanation: 'The — определённый артикль для уникальных предметов.',
  },
  {
    id: 'q-gr1-7', topicId: 'gr1', subjectId: 'grammar',
    text: 'We ___ to Paris next month.',
    options: [{ id: 'a', text: 'go' }, { id: 'b', text: 'went' }, { id: 'c', text: 'are going' }, { id: 'd', text: 'goed' }],
    correctId: 'c', explanation: 'Be going to — для запланированного будущего.',
  },
  // ─── Fallback math ────────────────────────────────────────────────────────
  {
    id: 'q-math-f1', topicId: '*', subjectId: 'math',
    text: 'Чему равно 7 × 8?',
    options: [{ id: 'a', text: '48' }, { id: 'b', text: '54' }, { id: 'c', text: '56' }, { id: 'd', text: '64' }],
    correctId: 'c',
  },
  {
    id: 'q-math-f2', topicId: '*', subjectId: 'math',
    text: '0.75 и 3/4 — это...',
    options: [{ id: 'a', text: '0.75 больше' }, { id: 'b', text: '3/4 больше' }, { id: 'c', text: 'Они равны' }, { id: 'd', text: 'Нельзя сравнить' }],
    correctId: 'c',
  },
];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getRandomQuiz(topicId: string, subjectId: string, count = 5): QuizQuestion[] {
  const topicQuestions = quizPool.filter((q) => q.topicId === topicId);
  const subjectFallback = quizPool.filter((q) => q.subjectId === subjectId && q.topicId === '*');
  const subjectWide = quizPool.filter((q) => q.subjectId === subjectId);

  const pool =
    topicQuestions.length >= count
      ? topicQuestions
      : [...topicQuestions, ...subjectWide, ...subjectFallback];

  const unique = pool.filter((q, i, arr) => arr.findIndex((x) => x.id === q.id) === i);
  return shuffle(unique).slice(0, Math.min(count, unique.length));
}
