/* Степень PRO — вся учебная логика работает в браузере.
   Токены Telegram здесь намеренно не хранятся: результат отправляется
   только через защищённую serverless-функцию Netlify. */

const rules = [
  { n: '01', f: 'a<sup>m</sup> · a<sup>n</sup> = a<sup>m+n</sup>', t: 'Умножение степеней', d: '<b>Пример:</b> x<sup>3</sup> · x<sup>5</sup> = x<sup>8</sup>.<br><b>Ловушка:</b> основания должны быть одинаковыми.' },
  { n: '02', f: 'a<sup>m</sup> : a<sup>n</sup> = a<sup>m−n</sup>', t: 'Деление степеней', d: '<b>Пример:</b> p<sup>9</sup> : p<sup>4</sup> = p<sup>5</sup>.<br><b>Важно:</b> a ≠ 0.' },
  { n: '03', f: '(a<sup>m</sup>)<sup>n</sup> = a<sup>mn</sup>', t: 'Степень степени', d: '<b>Пример:</b> (y<sup>2</sup>)<sup>4</sup> = y<sup>8</sup>.<br><b>Ловушка:</b> показатели <b>умножаем</b>, не складываем.' },
  { n: '04', f: '(ab)<sup>n</sup> = a<sup>n</sup>b<sup>n</sup>', t: 'Степень произведения', d: '<b>Пример:</b> (3xy)<sup>2</sup> = 9x<sup>2</sup>y<sup>2</sup>.' },
  { n: '05', f: '(a/b)<sup>n</sup> = a<sup>n</sup>/b<sup>n</sup>', t: 'Степень дроби', d: '<b>Пример:</b> (2x/y)<sup>3</sup> = 8x<sup>3</sup>/y<sup>3</sup>.' },
  { n: '06', f: 'a<sup>0</sup> = 1', t: 'Нулевой показатель', d: '<b>Пример:</b> (−7)<sup>0</sup> = 1.<br><b>Важно:</b> a ≠ 0; 0<sup>0</sup> не определено.' },
  { n: '07', f: 'a<sup>−n</sup> = 1/a<sup>n</sup>', t: 'Отрицательный показатель', d: '<b>Пример:</b> m<sup>−3</sup> = 1/m<sup>3</sup>.<br><b>Ловушка:</b> минус не делает число отрицательным.' },
  { n: '08', f: '(a/b)<sup>−n</sup> = (b/a)<sup>n</sup>', t: 'Отрицательная степень дроби', d: '<b>Пример:</b> (2x/3y)<sup>−2</sup> = 9y<sup>2</sup>/4x<sup>2</sup>.' },
  { n: '09', f: 'a<sup>1</sup> = a', t: 'Первая степень', d: '<b>Пример:</b> (−5)<sup>1</sup> = −5. Показатель 1 можно не писать.' },
  { n: '10', f: 'a<sup>n</sup> ≠ na', t: 'Степень — не умножение', d: '<b>Пример:</b> 2<sup>3</sup> = 8, а не 6.<br><b>Помни:</b> 2<sup>3</sup> — это 2 · 2 · 2.' }
];

const T = (id, group, badge, topic, question, expression, answers, shown, hint, explanation, extra = {}) => ({
  id, group, badge, topic, question, expression, answers, shown, hint, explanation, type: 'input', ...extra
});

/* В задачах можно вводить x^7, a^3/b^2; символ · и пробелы не важны. */
const tasks = [
  T('w1', 'warmup', 'умножение', 'Одинаковые основания', 'Упрости выражение.', 'x<sup>4</sup> · x<sup>7</sup>', ['x^11'], 'x^11', 'При умножении степеней с одним основанием показатели складываются.', '4 + 7 = 11, поэтому <b>x<sup>4</sup> · x<sup>7</sup> = x<sup>11</sup></b>.'),
  T('w2', 'warmup', 'деление', 'Одинаковые основания', 'Упрости выражение.', 'a<sup>13</sup> : a<sup>8</sup>', ['a^5'], 'a^5', 'При делении степеней показатели вычитаются: делимое минус делитель.', '13 − 8 = 5, значит <b>a<sup>13</sup> : a<sup>8</sup> = a<sup>5</sup></b>.'),
  T('w3', 'warmup', 'степень степени', 'Внешний и внутренний показатели', 'Упрости выражение.', '(p<sup>4</sup>)<sup>3</sup>', ['p^12'], 'p^12', 'Внешний показатель умножается на внутренний.', '4 · 3 = 12, поэтому <b>(p<sup>4</sup>)<sup>3</sup> = p<sup>12</sup></b>.'),
  T('w4', 'warmup', 'произведение', 'Степень произведения', 'Раскрой степень.', '(2ab)<sup>3</sup>', ['8a^3b^3', '8b^3a^3'], '8a^3b^3', 'Возведи в третью степень каждый множитель, включая 2.', '(2ab)<sup>3</sup> = 2<sup>3</sup>a<sup>3</sup>b<sup>3</sup> = <b>8a<sup>3</sup>b<sup>3</sup></b>.'),
  T('w5', 'warmup', 'нулевая степень', 'Нулевой показатель', 'Вычисли значение.', '(−17)<sup>0</sup>', ['1'], '1', 'Любое ненулевое число в нулевой степени равно 1.', '<b>(−17)<sup>0</sup> = 1</b>. Знак числа здесь ничего не меняет.'),
  T('w6', 'warmup', 'минус в показателе', 'Отрицательный показатель', 'Запиши без отрицательного показателя.', 'b<sup>−4</sup>', ['1/b^4'], '1/b^4', 'Отрицательный показатель переносит степень в знаменатель.', '<b>b<sup>−4</sup> = 1/b<sup>4</sup></b>. Минуса перед дробью нет!'),
  T('w7', 'warmup', 'смешанное', 'Умножение с отрицательным показателем', 'Упрости выражение и запиши ответ без отрицательной степени.', 'x<sup>5</sup> · x<sup>−9</sup>', ['1/x^4'], '1/x^4', 'Сначала сложи показатели. Потом избавься от отрицательного результата.', '5 + (−9) = −4; x<sup>−4</sup> = <b>1/x<sup>4</sup></b>.'),
  T('w8', 'warmup', 'деление', 'Деление с отрицательными показателями', 'Упрости выражение и запиши ответ без отрицательной степени.', 'y<sup>−6</sup> : y<sup>−2</sup>', ['1/y^4'], '1/y^4', 'При делении: показатель числителя минус показатель знаменателя.', '−6 − (−2) = −4; y<sup>−4</sup> = <b>1/y<sup>4</sup></b>.'),
  T('w9', 'warmup', 'дробь', 'Степень дроби', 'Возведи дробь в квадрат.', '(3m/n)<sup>2</sup>', ['9m^2/n^2'], '9m^2/n^2', 'В квадрат возводятся и числитель, и знаменатель.', '(3m/n)<sup>2</sup> = 3<sup>2</sup>m<sup>2</sup>/n<sup>2</sup> = <b>9m<sup>2</sup>/n<sup>2</sup></b>.'),
  T('w10', 'warmup', 'внимание', 'Знак перед степенью', 'Вычисли значение. Скобок нет.', '−2<sup>4</sup>', ['-16'], '−16', 'Сначала выполняется возведение в степень, затем знак минус.', 'Без скобок это −(2<sup>4</sup>) = <b>−16</b>. А (−2)<sup>4</sup> было бы 16.'),

  T('m1', 'marathon', 'несколько правил', 'Степень произведения и отрицательная степень', 'Упрости выражение и запиши ответ без отрицательных показателей.', '(a<sup>2</sup>b<sup>−3</sup>)<sup>2</sup>', ['a^4/b^6'], 'a^4/b^6', 'Сначала умножь каждый показатель внутри скобок на 2.', '(a<sup>2</sup>b<sup>−3</sup>)<sup>2</sup> = a<sup>4</sup>b<sup>−6</sup> = <b>a<sup>4</sup>/b<sup>6</sup></b>.'),
  T('m2', 'marathon', 'обратная степень', 'Отрицательная степень произведения', 'Упрости выражение и запиши ответ без отрицательных показателей.', '(r<sup>−2</sup>s<sup>4</sup>)<sup>−3</sup>', ['r^6/s^12'], 'r^6/s^12', 'Перемножь показатели: −2·(−3) и 4·(−3).', 'Получаем r<sup>6</sup>s<sup>−12</sup> = <b>r<sup>6</sup>/s<sup>12</sup></b>.'),
  T('m3', 'marathon', 'дробь', 'Деление одночленов', 'Упрости выражение и запиши ответ без отрицательных показателей.', '(x<sup>3</sup>y<sup>−2</sup>) / (x<sup>−4</sup>y)', ['x^7/y^3'], 'x^7/y^3', 'Для каждого основания отдельно вычти показатель знаменателя.', 'Для x: 3 − (−4) = 7. Для y: −2 − 1 = −3. Получаем <b>x<sup>7</sup>/y<sup>3</sup></b>.'),
  T('m4', 'marathon', 'дробь', 'Степень и деление', 'Упрости выражение и запиши ответ без отрицательных показателей.', '((a<sup>−1</sup>b<sup>2</sup>)<sup>3</sup>) / (a<sup>−2</sup>b)', ['b^5/a'], 'b^5/a', 'Сначала возведи числитель в третью степень, затем сократи показатели.', 'Числитель: a<sup>−3</sup>b<sup>6</sup>. Делим: a<sup>−3−(−2)</sup>b<sup>6−1</sup> = a<sup>−1</sup>b<sup>5</sup> = <b>b<sup>5</sup>/a</b>.'),
  T('m5', 'marathon', 'коэффициенты', 'Степень произведения', 'Упрости выражение и запиши ответ без отрицательных показателей.', '((3m<sup>−2</sup>n)<sup>2</sup>) / (9mn<sup>−3</sup>)', ['n^5/m^5'], 'n^5/m^5', 'Сначала: 3² = 9. Затем при делении вычти показатели у m и n.', 'В числителе 9m<sup>−4</sup>n<sup>2</sup>. После деления на 9mn<sup>−3</sup>: m<sup>−5</sup>n<sup>5</sup> = <b>n<sup>5</sup>/m<sup>5</sup></b>.'),
  T('m6', 'marathon', 'сокращение', 'Три действия', 'Упрости выражение.', '((2x<sup>2</sup>)<sup>3</sup> · x<sup>−5</sup>) / (8x)', ['1'], '1', 'Раскрой степень, затем собери степени x и сократи дробь.', '(2x<sup>2</sup>)<sup>3</sup> = 8x<sup>6</sup>; 8x<sup>6</sup>·x<sup>−5</sup> = 8x. Значит <b>8x/(8x) = 1</b>.'),
  T('m7', 'marathon', 'обратная степень', 'Степень частного', 'Упрости выражение.', '(a<sup>5</sup>/a<sup>8</sup>)<sup>−2</sup>', ['a^6'], 'a^6', 'Сначала упрости дробь с одинаковым основанием.', 'a<sup>5</sup>/a<sup>8</sup> = a<sup>−3</sup>. Затем (a<sup>−3</sup>)<sup>−2</sup> = <b>a<sup>6</sup></b>.'),
  T('m8', 'marathon', 'нулевая степень', 'Нулевая степень сложного выражения', 'Вычисли значение.', '(p<sup>−2</sup>q<sup>3</sup>)<sup>0</sup>', ['1'], '1', 'Важен внешний показатель степени.', 'Всё ненулевое выражение в нулевой степени равно <b>1</b>.'),
  T('m9', 'marathon', 'дробь', 'Обратная дробь', 'Упрости выражение.', '(2a/b)<sup>−3</sup>', ['b^3/8a^3'], 'b^3/8a^3', 'Отрицательный показатель переворачивает дробь, потом возводит в третью степень.', '(2a/b)<sup>−3</sup> = (b/(2a))<sup>3</sup> = <b>b<sup>3</sup>/(8a<sup>3</sup>)</b>.'),
  T('m10', 'marathon', 'сокращение', 'Степень произведения и дробь', 'Упрости выражение.', '((a<sup>3</sup>b<sup>2</sup>)<sup>2</sup>) / (ab)<sup>3</sup>', ['a^3b'], 'a^3b', 'Возведи числитель и знаменатель в степень, затем вычти показатели.', 'a<sup>6</sup>b<sup>4</sup> / a<sup>3</sup>b<sup>3</sup> = <b>a<sup>3</sup>b</b>.'),
  T('m11', 'marathon', 'сравнение', 'Приведение к одному основанию', 'Поставь знак <, > или =.', '2<sup>5</sup> &nbsp; ? &nbsp; 4<sup>3</sup>', ['<'], '<', 'Представь 4 как 2².', '4<sup>3</sup> = (2<sup>2</sup>)<sup>3</sup> = 2<sup>6</sup>. Поэтому 2<sup>5</sup> < <b>2<sup>6</sup></b>.'),
  T('m12', 'marathon', 'знак', 'Скобки и знак числа', 'Выбери верную пару значений.', '(−2)<sup>4</sup> &nbsp; и &nbsp; −2<sup>4</sup>', ['16 и −16'], '16 и −16', 'В первом выражении минус входит в основание, во втором — стоит перед степенью.', '(−2)<sup>4</sup> = 16, а −2<sup>4</sup> = −(2<sup>4</sup>) = −16.', { type: 'choice', choices: ['16 и −16', '16 и 16', '−16 и −16', '−8 и −8'] }),
  T('m13', 'marathon', 'цепочка', 'Несколько действий', 'Вычисли значение.', '2<sup>10</sup> : 2<sup>6</sup> · 2<sup>−3</sup>', ['2'], '2', 'Идём слева направо: при делении вычти, при умножении сложи показатели.', '2<sup>10</sup> : 2<sup>6</sup> · 2<sup>−3</sup> = 2<sup>10−6−3</sup> = 2<sup>1</sup> = <b>2</b>.'),
  T('m14', 'marathon', 'одинаковое основание', 'Степени чисел', 'Вычисли значение.', '(4<sup>3</sup> · 8<sup>2</sup>) / 2<sup>9</sup>', ['8'], '8', 'Представь 4 и 8 степенями двойки.', '4<sup>3</sup> = 2<sup>6</sup>, 8<sup>2</sup> = 2<sup>6</sup>. 2<sup>6+6−9</sup> = 2<sup>3</sup> = <b>8</b>.'),
  T('m15', 'marathon', 'отрицательная степень', 'Степень дроби', 'Упрости выражение.', '(a<sup>2</sup>b<sup>3</sup>/c)<sup>−2</sup>', ['c^2/a^4b^6'], 'c^2/a^4b^6', 'Отрицательный показатель переворачивает всю дробь.', '(a<sup>2</sup>b<sup>3</sup>/c)<sup>−2</sup> = (c/(a<sup>2</sup>b<sup>3</sup>))<sup>2</sup> = <b>c<sup>2</sup>/(a<sup>4</sup>b<sup>6</sup>)</b>.'),
  T('m16', 'marathon', 'уравнение', 'Неизвестный показатель', 'Найди показатель k.', 'x<sup>k</sup> · x<sup>−7</sup> = x<sup>5</sup>', ['12'], '12', 'При умножении показатели складываются: k + (−7) = 5.', 'k − 7 = 5, значит <b>k = 12</b>.'),
  T('m17', 'marathon', 'уравнение', 'Степень степени', 'Найди показатель n.', '(a<sup>n</sup>)<sup>3</sup> = a<sup>18</sup>', ['6'], '6', 'В степени степени показатели умножаются.', '3n = 18, поэтому <b>n = 6</b>.'),
  T('m18', 'marathon', 'финал', 'Деление и отрицательные показатели', 'Упрости выражение.', '((x<sup>−1</sup>y<sup>3</sup>)<sup>2</sup>) / (x<sup>−3</sup>y<sup>5</sup>)', ['xy', 'x*y'], 'xy', 'Сначала возведи числитель в квадрат, затем вычти показатели при делении.', 'Числитель: x<sup>−2</sup>y<sup>6</sup>. Делим: x<sup>−2−(−3)</sup>y<sup>6−5</sup> = <b>xy</b>.'),

  T('t1', 'traps', 'ловушка', 'Сложение — не умножение', 'Верно ли равенство?', 'a<sup>3</sup> + a<sup>4</sup> = a<sup>7</sup>', ['нет'], 'нет', 'Правило сложения показателей работает только при умножении степеней.', '<b>Нет.</b> Сложение степеней нельзя заменить сложением показателей: a<sup>3</sup> + a<sup>4</sup> = a<sup>3</sup>(1 + a).', { type: 'choice', choices: ['да', 'нет'] }),
  T('t2', 'traps', 'ловушка', 'Сумма в скобках', 'Какое равенство верное?', '(a + b)<sup>2</sup>', ['a^2+2ab+b^2'], 'a^2 + 2ab + b^2', 'Степень суммы не равна сумме степеней.', '(a + b)<sup>2</sup> = <b>a<sup>2</sup> + 2ab + b<sup>2</sup></b>. Формула (a+b)² здесь необходима.', { type: 'choice', choices: ['a^2 + b^2', 'a^2 + 2ab + b^2', '2a + 2b', 'a^2 + ab + b^2'] }),
  T('t3', 'traps', 'ловушка', 'Степень степени', 'Какое преобразование верное?', '(x<sup>2</sup>)<sup>5</sup>', ['x^10'], 'x^10', 'При степени степени показатели умножаются.', '(x<sup>2</sup>)<sup>5</sup> = x<sup>2·5</sup> = <b>x<sup>10</sup></b>.', { type: 'choice', choices: ['x^7', 'x^10', 'x^25', '2x^5'] }),
  T('t4', 'traps', 'ловушка', 'Отрицательная степень', 'Какое число равно 2<sup>−3</sup>?', '2<sup>−3</sup>', ['1/8'], '1/8', 'Отрицательный показатель означает обратное число.', '2<sup>−3</sup> = 1/2<sup>3</sup> = <b>1/8</b>, а не −8.', { type: 'choice', choices: ['−8', '1/8', '8', '−1/8'] }),
  T('t5', 'traps', 'ловушка', 'Основания разные', 'Верно ли равенство?', 'x<sup>5</sup> · y<sup>5</sup> = (xy)<sup>10</sup>', ['нет'], 'нет', 'У произведения одинаковых показателей степень можно вынести, но показатель не складывается.', '<b>Нет.</b> Верно: x<sup>5</sup>y<sup>5</sup> = <b>(xy)<sup>5</sup></b>.', { type: 'choice', choices: ['да', 'нет'] }),
  T('t6', 'traps', 'ловушка', 'Нулевой показатель', 'Что можно утверждать о 0<sup>0</sup>?', '0<sup>0</sup>', ['не определено'], 'не определено', 'Правило a⁰ = 1 требует, чтобы a не было равно нулю.', 'В школьном курсе <b>0<sup>0</sup> не определено</b>. Нельзя бездумно применять a⁰ = 1.', { type: 'choice', choices: ['равно 0', 'равно 1', 'не определено', 'равно −1'] }),
  T('t7', 'traps', 'ловушка', 'Частное степеней', 'Какое преобразование верное?', 'a<sup>3</sup> : a<sup>7</sup>', ['1/a^4'], '1/a^4', 'Из 3 вычитаем 7; отрицательный показатель переносим в знаменатель.', 'a<sup>3</sup> : a<sup>7</sup> = a<sup>−4</sup> = <b>1/a<sup>4</sup></b>.', { type: 'choice', choices: ['a^10', 'a^4', '1/a^4', '1/a^10'] }),
  T('t8', 'traps', 'ловушка', 'Знак и скобки', 'Какое выражение равно 81?', 'Выбери один вариант.', ['(-3)^4'], '(−3)^4', 'У отрицательного основания нужны скобки.', '<b>(−3)<sup>4</sup> = 81</b>. Без скобок −3<sup>4</sup> = −81.', { type: 'choice', choices: ['−3^4', '(−3)^4', '−(3^4)', '−3·4'] }),
  T('t9', 'traps', 'ловушка', 'Степень дроби', 'Верно ли равенство?', '(a/b)<sup>2</sup> = a<sup>2</sup>/b', ['нет'], 'нет', 'В степень возводится весь знаменатель, не только числитель.', '<b>Нет.</b> Верно: (a/b)<sup>2</sup> = <b>a<sup>2</sup>/b<sup>2</sup></b>.', { type: 'choice', choices: ['да', 'нет'] }),
  T('t10', 'traps', 'ловушка', 'Показатель один', 'Упрости выражение.', '(x<sup>7</sup>)<sup>1</sup>', ['x^7'], 'x^7', 'Умножь показатель 7 на 1.', '(x<sup>7</sup>)<sup>1</sup> = x<sup>7·1</sup> = <b>x<sup>7</sup></b>.'),
  T('t11', 'traps', 'ловушка', 'Одинаковые основания', 'Какое равенство верное?', 'a<sup>m</sup> · a<sup>n</sup>', ['a^(m+n)'], 'a^(m+n)', 'Основания одинаковые, значит показатели складываются.', '<b>a<sup>m</sup> · a<sup>n</sup> = a<sup>m+n</sup></b>.', { type: 'choice', choices: ['a^(m+n)', 'a^(m*n)', '2a^(m+n)', 'a^(m-n)'] }),
  T('t12', 'traps', 'ловушка', 'Не путай действия', 'Что получится после упрощения?', '(x<sup>4</sup> · x<sup>−4</sup>) / x<sup>0</sup>', ['1'], '1', 'В числителе показатели дают 0, а x⁰ = 1.', 'x<sup>4</sup>·x<sup>−4</sup> = x<sup>0</sup> = 1. Затем 1/x<sup>0</sup> = <b>1</b> (при x ≠ 0).')
];

const app = {
  mode: null,
  current: 0,
  selected: [],
  answers: [],
  timerId: null,
  startedAt: 0,
  elapsed: 0,
  choice: '',
  savedName: localStorage.getItem('stepProName') || ''
};

const $ = (id) => document.getElementById(id);
const shuffle = (arr) => [...arr].sort(() => Math.random() - .5);
const el = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; };

function renderRules() {
  const root = $('ruleCards');
  rules.forEach((rule) => {
    const card = document.createElement('button');
    card.type = 'button'; card.className = 'rule-card';
    card.setAttribute('aria-expanded', 'false');
    card.innerHTML = `<span class="rule-no">${rule.n}</span><div class="rule-formula">${rule.f}</div><p class="rule-title">${rule.t}</p><div class="rule-detail">${rule.d}</div>`;
    card.addEventListener('click', () => {
      const wasOpen = card.classList.contains('open');
      root.querySelectorAll('.rule-card').forEach(c => { c.classList.remove('open'); c.setAttribute('aria-expanded', 'false'); });
      if (!wasOpen) { card.classList.add('open'); card.setAttribute('aria-expanded', 'true'); }
    });
    root.append(card);
  });
}

function chooseTasks(mode) {
  if (mode === 'warmup') return shuffle(tasks.filter(t => t.group === 'warmup')).slice(0, 10);
  if (mode === 'traps') return shuffle(tasks.filter(t => t.group === 'traps')).slice(0, 12);
  const warm = shuffle(tasks.filter(t => t.group === 'warmup')).slice(0, 4);
  const hard = shuffle(tasks.filter(t => t.group === 'marathon')).slice(0, 11);
  const traps = shuffle(tasks.filter(t => t.group === 'traps')).slice(0, 3);
  return shuffle([...warm, ...hard, ...traps]);
}

function begin(mode) {
  app.mode = mode; app.current = 0; app.selected = chooseTasks(mode);
  app.answers = app.selected.map(task => ({ task, answer: '', attempts: 0, firstTryCorrect: null, correct: false, usedHint: false }));
  app.elapsed = 0; app.startedAt = Date.now(); app.choice = '';
  $('startScreen').hidden = true; $('resultScreen').hidden = true; $('trainer').hidden = false;
  $('practice').scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.clearInterval(app.timerId); app.timerId = window.setInterval(() => { app.elapsed = Math.floor((Date.now() - app.startedAt) / 1000); $('timer').textContent = timeText(app.elapsed); }, 1000);
  showTask();
}

function quit() {
  if (app.current > 0 && !window.confirm('Выйти из тренировки? Незавершённая попытка не сохранится.')) return;
  window.clearInterval(app.timerId); $('trainer').hidden = true; $('resultScreen').hidden = true; $('startScreen').hidden = false;
}

function showTask() {
  const data = app.answers[app.current]; const task = data.task;
  app.choice = data.answer;
  $('progressLabel').textContent = `Задание ${app.current + 1} из ${app.selected.length}`;
  $('scoreLive').textContent = `${app.answers.filter(a => a.firstTryCorrect).length} с 1-й попытки`;
  $('progressBar').style.width = `${(app.current / app.selected.length) * 100}%`;
  $('taskBadge').textContent = task.badge;
  $('taskTopic').textContent = task.topic;
  $('taskQuestion').textContent = task.question;
  $('taskExpression').innerHTML = task.expression;
  $('feedback').className = 'feedback'; $('feedback').innerHTML = '';
  $('hintBtn').textContent = data.usedHint ? 'Подсказка показана' : 'Нужна подсказка?';
  $('hintBtn').disabled = data.usedHint || data.correct;
  $('checkBtn').hidden = data.correct; $('nextBtn').hidden = !data.correct;
  $('nextBtn').textContent = app.current === app.selected.length - 1 ? 'К результатам →' : 'Следующее →';
  renderAnswer(task, data);
}

function renderAnswer(task, data) {
  const zone = $('answerArea'); zone.replaceChildren();
  if (task.type === 'choice') {
    const list = el('div', 'choice-list');
    task.choices.forEach(value => {
      const b = el('button', 'choice', value); b.type = 'button';
      if (app.choice === value) b.classList.add('selected');
      if (data.correct) { b.disabled = true; if (isAnswer(task, value)) b.classList.add('correct'); else if (value === data.answer) b.classList.add('wrong'); }
      b.addEventListener('click', () => { if (data.correct) return; app.choice = value; zone.querySelectorAll('.choice').forEach(x => x.classList.toggle('selected', x.textContent === value)); });
      list.append(b);
    });
    zone.append(list);
  } else {
    const label = el('label', 'answer-label', 'Ответ:'); label.htmlFor = 'answerInput';
    const input = document.createElement('input'); input.id = 'answerInput'; input.className = 'answer-input'; input.type = 'text'; input.autocomplete = 'off'; input.spellcheck = false; input.placeholder = 'например, x^5'; input.value = data.answer || ''; input.disabled = data.correct;
    input.addEventListener('keydown', e => { if (e.key === 'Enter' && !data.correct) checkCurrent(); });
    zone.append(label, input);
    if (!data.correct) window.setTimeout(() => input.focus(), 50);
  }
}

function normalise(value) {
  return String(value ?? '')
    .toLowerCase().trim()
    .replace(/[−–—]/g, '-')
    .replace(/[·∙⋅*×х]/g, '')
    .replace(/[\s{}()]/g, '')
    .replace(/\^\+?/g, '^')
    .replace(/¹/g, '^1').replace(/²/g, '^2').replace(/³/g, '^3')
    .replace(/⁴/g, '^4').replace(/⁵/g, '^5').replace(/⁶/g, '^6').replace(/⁷/g, '^7').replace(/⁸/g, '^8').replace(/⁹/g, '^9').replace(/⁰/g, '^0')
    .replace(/⁻/g, '^-');
}
function isAnswer(task, value) { return task.answers.map(normalise).includes(normalise(value)); }
function currentValue() { const inp = $('answerInput'); return inp ? inp.value.trim() : app.choice; }

function checkCurrent() {
  const data = app.answers[app.current]; const task = data.task; const given = currentValue();
  const feedback = $('feedback');
  if (!given) { feedback.className = 'feedback show hint'; feedback.innerHTML = '✏️ Сначала введи ответ или выбери вариант.'; return; }
  data.answer = given; data.attempts += 1;
  const ok = isAnswer(task, given);
  if (data.firstTryCorrect === null) data.firstTryCorrect = ok;
  if (ok) {
    data.correct = true;
    feedback.className = 'feedback show success';
    feedback.innerHTML = `<b>Верно! ✓</b> ${task.explanation}`;
    $('checkBtn').hidden = true; $('nextBtn').hidden = false; $('hintBtn').disabled = true;
    $('scoreLive').textContent = `${app.answers.filter(a => a.firstTryCorrect).length} с 1-й попытки`;
    renderAnswer(task, data);
    return;
  }
  feedback.className = 'feedback show error';
  feedback.innerHTML = `<b>Пока не так.</b> Проверь правило и попробуй ещё. ${data.attempts > 1 ? `Подсказка: ${task.hint}` : ''}`;
  if (task.type === 'input') $('answerInput').select();
}

function showHint() {
  const data = app.answers[app.current]; if (data.correct || data.usedHint) return;
  data.usedHint = true; $('hintBtn').textContent = 'Подсказка показана'; $('hintBtn').disabled = true;
  $('feedback').className = 'feedback show hint';
  $('feedback').innerHTML = `<b>Подсказка:</b> ${data.task.hint}`;
}
function nextTask() { if (!app.answers[app.current].correct) return; if (app.current >= app.selected.length - 1) finish(); else { app.current += 1; showTask(); } }
function timeText(seconds) { return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`; }

function finish() {
  window.clearInterval(app.timerId); app.elapsed = Math.floor((Date.now() - app.startedAt) / 1000);
  $('trainer').hidden = true; $('resultScreen').hidden = false;
  const firstCorrect = app.answers.filter(a => a.firstTryCorrect).length;
  const total = app.answers.length; const pct = Math.round(firstCorrect / total * 100);
  const titles = pct >= 90 ? ['Великолепно!', 'Ты уверенно управляешься со степенями.'] : pct >= 70 ? ['Очень хороший результат!', 'База уже крепкая — повтори задания с ошибками, и будет максимум.'] : ['Тренировка засчитана!', 'Степени любят порядок. Пройди разбор ошибок и попробуй ещё раз.'];
  $('resultTitle').textContent = titles[0]; $('resultText').textContent = titles[1];
  $('resultScore').textContent = `${firstCorrect}/${total}`; $('resultPercent').textContent = `${pct}%`; $('resultTime').textContent = timeText(app.elapsed);
  $('studentName').value = app.savedName;
  renderReview(); $('progressBar').style.width = '100%'; $('practice').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function renderReview() {
  const wrong = app.answers.filter(a => !a.firstTryCorrect); const root = $('reviewList'); root.replaceChildren();
  if (!wrong.length) { const p = el('p', 'review-title', 'Нет ошибок с первой попытки — идеальная серия!'); root.append(p); return; }
  const title = el('p', 'review-title', `Повтори ${wrong.length} ${plural(wrong.length, 'задание', 'задания', 'заданий')}:`); root.append(title);
  wrong.forEach(a => { const row = el('div', 'review-row'); row.innerHTML = `<span class="review-x">×</span><span><b>${a.task.topic}.</b> Верный ответ: ${a.task.shown}.</span>`; root.append(row); });
}
function plural(number, one, few, many) { const n = Math.abs(number) % 100; const n1 = n % 10; if (n > 10 && n < 20) return many; if (n1 > 1 && n1 < 5) return few; if (n1 === 1) return one; return many; }

function getReport() {
  const firstCorrect = app.answers.filter(a => a.firstTryCorrect).length;
  return {
    studentName: $('studentName').value.trim(),
    mode: ({ warmup: 'Быстрый старт', marathon: 'Марафон степеней', traps: 'Ловушки' })[app.mode],
    score: firstCorrect, total: app.answers.length, percent: Math.round(firstCorrect / app.answers.length * 100), duration: timeText(app.elapsed),
    completedAt: new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    tasks: app.answers.map((a, index) => ({ number: index + 1, topic: a.task.topic, expected: a.task.shown, answer: a.answer || '—', firstTryCorrect: Boolean(a.firstTryCorrect), attempts: a.attempts, usedHint: a.usedHint }))
  };
}
function reportText(report) {
  const lines = [
    'СТЕПЕНЬ PRO · результат тренировки',
    `Ученик: ${report.studentName || 'Не указано'}`,
    `Режим: ${report.mode}`,
    `Дата: ${report.completedAt}`,
    '', `ИТОГ: ${report.score}/${report.total} с первой попытки (${report.percent}%)`, `Время: ${report.duration}`, '', 'ОТВЕТЫ:'
  ];
  report.tasks.forEach(x => lines.push(`${x.firstTryCorrect ? '✓' : '×'} ${x.number}. ${x.topic}: ${x.answer} → ${x.expected}${x.usedHint ? ' [подсказка]' : ''}${x.attempts > 1 ? ` [попыток: ${x.attempts}]` : ''}`));
  return lines.join('\n');
}

async function sendReport() {
  const status = $('sendStatus'); const button = $('sendBtn'); const report = getReport();
  if (report.studentName.length < 2) { status.textContent = 'Напиши имя (минимум 2 символа), чтобы учитель знал, чей результат.'; status.className = 'send-status error'; $('studentName').focus(); return; }
  app.savedName = report.studentName; localStorage.setItem('stepProName', report.studentName);
  button.disabled = true; button.textContent = 'Отправляем…'; status.textContent = 'Отправляем результат учителю…'; status.className = 'send-status';
  try {
    const response = await fetch('/.netlify/functions/send-results', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(report) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) throw new Error(result.error || 'Сервис не ответил');
    status.textContent = '✓ Результат отправлен учителю!'; status.className = 'send-status ok'; button.textContent = 'Отправлено ✓';
  } catch (error) {
    status.textContent = 'Не удалось отправить онлайн. Скачай отчёт и передай учителю: ' + error.message; status.className = 'send-status error'; button.disabled = false; button.textContent = 'Повторить';
  }
}
function downloadReport() {
  const report = getReport(); const text = reportText(report); const blob = new Blob([text], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `stepen-pro-${report.studentName ? report.studentName.replace(/[^a-zа-яё0-9_-]/gi, '_') : 'rezultat'}.txt`; a.click(); URL.revokeObjectURL(url);
}

function init() {
  renderRules();
  document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => begin(b.dataset.mode)));
  $('quitBtn').addEventListener('click', quit); $('hintBtn').addEventListener('click', showHint); $('checkBtn').addEventListener('click', checkCurrent); $('nextBtn').addEventListener('click', nextTask);
  $('retryBtn').addEventListener('click', () => begin(app.mode)); $('sendBtn').addEventListener('click', sendReport); $('downloadBtn').addEventListener('click', downloadReport);
}
document.addEventListener('DOMContentLoaded', init);
