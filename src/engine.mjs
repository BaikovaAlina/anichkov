/* Shared, dependency-free algebra engine. Used in the browser AND the Telegram worker.
   No eval, Function, random-point equivalence checks, or external math services. */
export const ENGINE_VERSION = 1;
export const FORMULAS = [
  { id: 'sq-plus', title: 'Квадрат суммы', lhs: '(a+b)^2', rhs: 'a^2+2ab+b^2', grade: 7, group: 'squares', tag: 'Складываем', accent: 'peach', rule: 'Квадрат первого, плюс удвоенное произведение, плюс квадрат второго.', warning: 'Квадрат суммы — НЕ сумма квадратов. Не теряй среднее слагаемое 2ab!', example: '(x+3)^2', answer: 'x^2+6x+9', values: ['x', '3'], steps: ['Возведи первое слагаемое в квадрат: x².', 'Найди удвоенное произведение: 2 · x · 3 = 6x.', 'Возведи второе слагаемое в квадрат: 3² = 9.', 'Сложи три части: x² + 6x + 9.'] },
  { id: 'sq-minus', title: 'Квадрат разности', lhs: '(a-b)^2', rhs: 'a^2-2ab+b^2', grade: 7, group: 'squares', tag: 'Вычитаем', accent: 'blue', rule: 'Квадрат первого, минус удвоенное произведение, плюс квадрат второго.', warning: 'Последнее слагаемое со знаком «плюс»: (−b)² = b².', example: '(2x-3)^2', answer: '4x^2-12x+9', values: ['2x', '3'], steps: ['Первое слагаемое целиком: a = 2x, второе: b = 3.', 'Квадрат первого: (2x)² = 4x², а не 2x².', 'Удвоенное произведение со знаком «минус»: −2 · 2x · 3 = −12x.', 'Квадрат второго: 3² = 9. Ответ: 4x² − 12x + 9.'] },
  { id: 'diff-sq', title: 'Разность квадратов', lhs: 'a^2-b^2', rhs: '(a-b)(a+b)', grade: 7, group: 'squares', tag: 'Раскладываем', accent: 'mint', rule: 'Разность квадратов равна произведению разности и суммы.', warning: 'Для суммы квадратов a² + b² эта формула не работает.', example: 'x^2-25', answer: '(x-5)(x+5)', values: ['x', '5'], steps: ['Заметь два квадрата: x² и 25 = 5².', 'Убедись, что между ними стоит «минус».', 'Запиши разность оснований: (x − 5).', 'Умножь на сумму оснований: (x − 5)(x + 5).'] },
  { id: 'cube-plus', title: 'Куб суммы', lhs: '(a+b)^3', rhs: 'a^3+3a^2b+3ab^2+b^3', grade: 8, group: 'cubes', tag: 'Четыре слагаемых', accent: 'yellow', rule: 'Коэффициенты идут в ритме 1–3–3–1. Степень a убывает, степень b растёт.', warning: 'В середине два слагаемых, а не одно: 3a²b и 3ab².', example: '(x+2)^3', answer: 'x^3+6x^2+12x+8', values: ['x', '2'], steps: ['Куб первого: x³.', 'Первое среднее: 3 · x² · 2 = 6x².', 'Второе среднее: 3 · x · 2² = 12x.', 'Куб второго: 2³ = 8. Все знаки «плюс».'] },
  { id: 'cube-minus', title: 'Куб разности', lhs: '(a-b)^3', rhs: 'a^3-3a^2b+3ab^2-b^3', grade: 8, group: 'cubes', tag: 'Знаки чередуются', accent: 'peach', rule: 'Коэффициенты 1–3–3–1, а знаки чередуются: плюс, минус, плюс, минус.', warning: 'Перед третьим слагаемым — «плюс», потому что (−b)² = b².', example: '(x-2)^3', answer: 'x^3-6x^2+12x-8', values: ['x', '2'], steps: ['Куб первого: x³.', 'Вычти 3 · x² · 2 = 6x².', 'Прибавь 3 · x · 2² = 12x.', 'Вычти куб второго: 8. Ответ: x³ − 6x² + 12x − 8.'] },
  { id: 'sum-cubes', title: 'Сумма кубов', lhs: 'a^3+b^3', rhs: '(a+b)(a^2-ab+b^2)', grade: 8, group: 'cubes', tag: 'Неполный квадрат', accent: 'mint', rule: 'Сумма оснований × неполный квадрат разности. Во вторых скобках знак меняется.', warning: 'В неполном квадрате нет двойки перед ab. Это a² − ab + b², а не (a − b)².', example: 'x^3+8', answer: '(x+2)(x^2-2x+4)', values: ['x', '2'], steps: ['Распознай кубы: x³ и 8 = 2³.', 'Первые скобки — сумма оснований: (x + 2).', 'Вторые скобки: x² − x · 2 + 2² = x² − 2x + 4.', 'Умножь: (x + 2)(x² − 2x + 4).'] },
  { id: 'diff-cubes', title: 'Разность кубов', lhs: 'a^3-b^3', rhs: '(a-b)(a^2+ab+b^2)', grade: 8, group: 'cubes', tag: 'Неполный квадрат', accent: 'blue', rule: 'Разность оснований × неполный квадрат суммы. Во вторых скобках все знаки «плюс».', warning: 'Не путай с разностью квадратов: здесь во вторых скобках три слагаемых.', example: 'x^3-27', answer: '(x-3)(x^2+3x+9)', values: ['x', '3'], steps: ['Распознай кубы: x³ и 27 = 3³.', 'Первые скобки — разность оснований: (x − 3).', 'Вторые скобки: x² + 3x + 9.', 'Ответ: (x − 3)(x² + 3x + 9).'] }
];
export const MODE_LABELS = { mixed: 'Смешанная практика', memory: 'Вспомни формулу', expand: 'Раскрой скобки', factor: 'Разложи на множители', test: 'Проверка себя' };
const VARIABLES = 'abcmnxty';
const EPS = 1e-8;
function clean(p) { for (const [k, v] of p) { if (!Number.isFinite(v) || Math.abs(v) > 1e15) throw new Error('Слишком большие числа.'); if (Math.abs(v) < EPS) p.delete(k); } if (p.size > 160) throw new Error('Слишком длинное выражение.'); return p; }
function scalar(v) { return clean(new Map([['', v]])); }
function add(a, b, sign = 1) { const out = new Map(a); for (const [k, v] of b) out.set(k, (out.get(k) || 0) + sign * v); return clean(out); }
function mul(a, b) { const out = new Map(); for (const [ka, va] of a) for (const [kb, vb] of b) { const k = (ka + kb).split('').sort().join(''); if (k.length > 12) throw new Error('Слишком высокая степень.'); out.set(k, (out.get(k) || 0) + va * vb); } return clean(out); }
function pow(a, n) { if (!Number.isInteger(n) || n < 0 || n > 6) throw new Error('Используй целую степень от 0 до 6.'); let out = scalar(1); for (let i = 0; i < n; i++) out = mul(out, a); return out; }
function constant(p) { return p.size === 0 || (p.size === 1 && p.has('')); }
export function normalizeInput(text) {
  return String(text).replace(/[−–—]/g, '-').replace(/[·×⋅]/g, '*').replace(/²/g, '^2').replace(/³/g, '^3').replace(/⁴/g, '^4').replace(/⁵/g, '^5').replace(/⁶/g, '^6').replace(/,/g, '.').replace(/[хХ]/g, 'x').replace(/[аА]/g, 'a').replace(/[вВ]/g, 'b').replace(/[сС]/g, 'c').replace(/[уУ]/g, 'y').toLowerCase().replace(/\s/g, '');
}
export function parsePolynomial(text) {
  const s = normalizeInput(text);
  if (!s) throw new Error('Сначала введи ответ.');
  if (s.length > 220) throw new Error('Ответ должен быть короче 220 символов.');
  let i = 0, nodes = 0;
  const make = (type, p, args = []) => { if (++nodes > 320) throw new Error('Слишком длинное выражение.'); return { type, p, args }; };
  function expression() { let a = product(); while (s[i] === '+' || s[i] === '-') { const op = s[i++], b = product(); a = make(op, add(a.p, b.p, op === '+' ? 1 : -1), [a, b]); } return a; }
  function product() {
    let a = unary();
    while (i < s.length) {
      const c = s[i];
      if (c === '*' || c === '/') { i++; const b = unary(); if (c === '/') { if (!constant(b.p) || !b.p.get('')) throw new Error('Делить можно только на ненулевое число.'); a = make('/', mul(a.p, scalar(1 / b.p.get(''))), [a, b]); } else a = make('*', mul(a.p, b.p), [a, b]); }
      else if (c === '(' || VARIABLES.includes(c)) { const b = unary(); a = make('*', mul(a.p, b.p), [a, b]); }
      else break;
    }
    return a;
  }
  function unary() { if (s[i] === '+' || s[i] === '-') { const op = s[i++], a = unary(); return make('unary' + op, op === '-' ? mul(scalar(-1), a.p) : a.p, [a]); } return power(); }
  function power() { let a = atom(); if (s[i] === '^') { i++; const match = s.slice(i).match(/^\d+/); if (!match) throw new Error('После ^ укажи степень: например, x^2.'); const n = Number(match[0]); i += match[0].length; a = make('^', pow(a.p, n), [a, n]); } return a; }
  function atom() {
    if (s[i] === '(') { i++; const a = expression(); if (s[i++] !== ')') throw new Error('Проверь закрывающую скобку.'); return a; }
    if (i < s.length && VARIABLES.includes(s[i])) { return make('var', new Map([[s[i++], 1]])); }
    const m = s.slice(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)/);
    if (m) { i += m[0].length; return make('num', scalar(Number(m[0]))); }
    throw new Error('Используй числа, латинские буквы, +, −, скобки и степени ^2 или ^3.');
  }
  const ast = expression();
  if (i !== s.length) throw new Error('Проверь запись: в ответе не нужны знак = и пояснения.');
  return { polynomial: ast.p, ast };
}
export function equivalent(a, b) { const pa = typeof a === 'string' ? parsePolynomial(a).polynomial : a; const pb = typeof b === 'string' ? parsePolynomial(b).polynomial : b; return clean(add(pa, pb, -1)).size === 0; }
export function polynomialString(p) {
  if (!p.size) return '0';
  return [...p].sort(([a], [b]) => b.length - a.length || a.localeCompare(b)).map(([k, v], i) => {
    const abs = Math.abs(v), coeff = Number(abs.toFixed(8));
    let vars = ''; for (let n = 0; n < k.length;) { let j = n + 1; while (k[j] === k[n]) j++; vars += k[n] + (j - n > 1 ? '^' + (j - n) : ''); n = j; }
    return (v < 0 ? '-' : i ? '+' : '') + ((!k || Math.abs(abs - 1) > EPS) ? coeff : '') + vars;
  }).join('');
}
export function expand(s) { return polynomialString(parsePolynomial(s).polynomial); }
export function pretty(s) { return String(s).replace(/\^2/g, '²').replace(/\^3/g, '³').replace(/\^4/g, '⁴').replace(/\^5/g, '⁵').replace(/\^6/g, '⁶').replace(/\*/g, '·').replace(/-/g, '−').replace(/\+/g, ' + ').replace(/−/g, ' − ').replace(/\(\s*−\s*/g, '(−').replace(/^\s*−\s*/, '−').replace(/\s+/g, ' ').trim(); }
function isExpanded(ast) {
  if (ast.type === '^' && ast.args[1] > 1 && ast.args[0].p.size > 1) return false;
  if (ast.type === '*' && !constant(ast.args[0].p) && !constant(ast.args[1].p) && (ast.args[0].p.size > 1 || ast.args[1].p.size > 1)) return false;
  return ast.args.filter(x => typeof x === 'object').every(isExpanded);
}
function isFactored(ast) {
  if (ast.type.startsWith('unary')) return isFactored(ast.args[0]);
  if (ast.type === '^') return ast.args[1] >= 2 && ast.args[0].p.size >= 2;
  if (ast.type !== '*') return false;
  const [a, b] = ast.args;
  if (constant(a.p)) return isFactored(b);
  if (constant(b.p)) return isFactored(a);
  return true;
}
export function checkAnswer(task, value) {
  if (value == null || String(value).trim() === '') return { correct: false, empty: true, message: 'Сначала выбери или введи ответ.' };
  if (task.kind === 'choice') return { correct: String(value) === String(task.correctIndex), message: 'Сверь знаки и среднее слагаемое с формулой.' };
  try {
    const { polynomial, ast } = parsePolynomial(value);
    if (!equivalent(polynomial, parsePolynomial(task.expected).polynomial)) return { correct: false, message: task.formula.warning };
    if (task.kind === 'expand' && !isExpanded(ast)) return { correct: false, formError: true, message: 'Выражение равносильно, но скобки ещё не раскрыты. Запиши сумму одночленов.' };
    if (task.kind === 'factor' && !isFactored(ast)) return { correct: false, formError: true, message: 'Выражение верное, но нужно разложить его на множители: запиши произведение скобок.' };
    return { correct: true, message: 'Всё верно!' };
  } catch (e) { return { correct: false, syntax: true, message: e.message }; }
}
export function random(seed) { let x = Number(seed) >>> 0 || 1; return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return (x >>> 0) / 4294967296; }; }
function shuffle(a, rng) { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function sourceFor(f, u, v) {
  const a = '(' + u + ')', b = '(' + v + ')';
  switch (f.id) {
    case 'sq-plus': return `(${u}+${v})^2`;
    case 'sq-minus': return `(${u}-${v})^2`;
    case 'diff-sq': return `${a}^2-${b}^2`;
    case 'cube-plus': return `(${u}+${v})^3`;
    case 'cube-minus': return `(${u}-${v})^3`;
    case 'sum-cubes': return `${a}^3+${b}^3`;
    case 'diff-cubes': return `${a}^3-${b}^3`;
  }
}
function factoredFor(f, u, v) {
  if (f.id === 'diff-sq') return `(${u}-${v})(${u}+${v})`;
  if (f.id === 'sum-cubes') return `(${u}+${v})(${expand(`(${u})^2-(${u})*(${v})+(${v})^2`)})`;
  if (f.id === 'diff-cubes') return `(${u}-${v})(${expand(`(${u})^2+(${u})*(${v})+(${v})^2`)})`;
  return sourceFor(f, u, v);
}
function makeTask(f, kind, rng, index) {
  const rand = n => Math.floor(rng() * n);
  const k = 1 + rand(3), c = 1 + rand(6), variable = rng() < .74 ? 'x' : 'a';
  const u = (k === 1 ? '' : k) + variable;
  const v = rng() < .18 ? (c === 1 ? '' : c) + (variable === 'x' ? 'y' : 'b') : String(c);
  const src = sourceFor(f, u, v), expanded = expand(src), factored = factoredFor(f, u, v);
  const task = { id: 'q' + (index + 1), formulaId: f.id, formula: f, kind, u, v, expected: kind === 'factor' ? factored : expanded, expression: kind === 'factor' ? expanded : (['diff-sq', 'sum-cubes', 'diff-cubes'].includes(f.id) ? factored : src) };
  task.hints = [`Узнай формулу «${f.title.toLowerCase()}»: ${pretty(f.lhs)} = ${pretty(f.rhs)}.`, `Здесь a = ${pretty(u)}, b = ${pretty(v)}. ${f.rule}`];
  task.steps = [`Подходит формула: ${pretty(f.lhs)} = ${pretty(f.rhs)}.`, `Возьми a = ${pretty(u)} и b = ${pretty(v)}. Не забудь возвести числовой коэффициент в степень.`, kind === 'factor' ? `Запиши произведение: ${pretty(factored)}.` : `Вычисли и приведи подобные слагаемые: ${pretty(expanded)}.`];
  if (kind === 'choice') {
    task.expression = f.lhs;
    task.expected = f.rhs;
    const correct = f.rhs;
    let wrong;
    if (f.id === 'sq-plus') wrong = ['a^2+b^2', 'a^2-2ab+b^2', 'a^2+ab+b^2'];
    else if (f.id === 'sq-minus') wrong = ['a^2-b^2', 'a^2-2ab-b^2', 'a^2+2ab+b^2'];
    else if (f.id === 'diff-sq') wrong = ['(a-b)^2', '(a+b)^2', '(a-b)(a-b)'];
    else if (f.id === 'cube-plus') wrong = ['a^3+b^3', 'a^3+3ab+b^3', 'a^3-3a^2b+3ab^2-b^3'];
    else if (f.id === 'cube-minus') wrong = ['a^3-b^3', 'a^3-3a^2b-3ab^2-b^3', 'a^3+3a^2b+3ab^2+b^3'];
    else if (f.id === 'sum-cubes') wrong = ['(a+b)(a^2+ab+b^2)', '(a+b)(a^2-2ab+b^2)', '(a-b)(a^2+ab+b^2)'];
    else wrong = ['(a-b)(a^2-ab+b^2)', '(a-b)(a^2+2ab+b^2)', '(a+b)(a^2-ab+b^2)'];
    task.options = shuffle([correct, ...wrong], rng); task.correctIndex = task.options.indexOf(correct);
    task.hints = [f.rule, f.warning]; task.steps = [f.rule, `${pretty(f.lhs)} = ${pretty(f.rhs)}`];
  }
  if (kind === 'fill') {
    const minus = f.id.includes('minus');
    // Coefficient drills always use a square; topic is kept consistent with the actual question.
    const sf = FORMULAS[minus ? 1 : 0]; task.formula = sf; task.formulaId = sf.id;
    const coef = (minus ? -1 : 1) * 2 * k * c;
    task.expression = `(${u}${minus ? '-' : '+'}${c})^2 = ${expand(`(${u})^2`)} + □${variable} + ${c * c}`;
    task.expected = String(coef); task.expectedDisplay = String(coef);
    task.hints = ['В пропуске — коэффициент удвоенного произведения. Если он отрицательный, впиши его со знаком «минус».', `Вычисли ${minus ? '−' : ''}2 · ${k} · ${c}.`];
    task.steps = [`a = ${u}, b = ${c}.`, `Удвоенное произведение: ${minus ? '−' : ''}2 · ${u} · ${c} = ${coef}${variable}.`, `В окошко нужно вписать число ${coef}.`];
  }
  return task;
}
export function normalizeSettings(raw = {}) {
  const level = Number(raw.level) === 8 ? 8 : 7;
  const mode = Object.hasOwn(MODE_LABELS, raw.mode) ? raw.mode : 'mixed';
  const count = [10, 15, 20].includes(Number(raw.count)) ? Number(raw.count) : 10;
  const topic = ['all', 'squares', 'cubes'].includes(raw.topic) ? raw.topic : 'all';
  const available = FORMULAS.filter(f => f.grade <= level && (topic === 'all' || f.group === topic));
  const formulaIds = Array.isArray(raw.formulaIds) ? [...new Set(raw.formulaIds.filter(id => available.some(f => f.id === id)))].slice(0, 7) : [];
  return { level, mode, count, topic: level === 7 && topic === 'cubes' ? 'all' : topic, formulaIds };
}
export function createTasks(seed, rawSettings = {}) {
  const settings = normalizeSettings(rawSettings), rng = random(seed);
  let pool = FORMULAS.filter(f => f.grade <= settings.level && (settings.topic === 'all' || f.group === settings.topic));
  if (settings.formulaIds.length) pool = pool.filter(f => settings.formulaIds.includes(f.id));
  if (!pool.length) pool = FORMULAS.slice(0, 3);
  const formulaOrder = shuffle(pool, rng), out = [];
  for (let i = 0; i < settings.count; i++) {
    const f = formulaOrder[i % formulaOrder.length];
    let kind = settings.mode;
    if (kind === 'memory') kind = i % 2 === 1 && ['sq-plus','sq-minus'].includes(f.id) ? 'fill' : 'choice';
    if (kind === 'mixed') kind = ['choice', 'expand', 'factor', 'fill', 'expand'][i % 5];
    if (kind === 'fill' && !['sq-plus','sq-minus'].includes(f.id)) kind = 'expand';
    if (kind === 'test') kind = ['expand', 'factor', 'choice', 'expand', 'factor'][i % 5];
    out.push(makeTask(f, kind, rng, i));
  }
  return out;
}
export function emptyRecord() { return { attempts: [], hints: 0, revealed: false, skipped: false, draft: '' }; }
export function analyze(tasks, records) {
  let solved = 0, independent = 0, first = 0, assisted = 0, hinted = 0, revealed = 0, attempts = 0, answered = 0;
  const topics = {};
  const details = tasks.map((t, i) => {
    const r = records[i] || emptyRecord(), arr = r.attempts || [];
    const last = arr.length ? arr[arr.length - 1] : null;
    const correct = !!last && checkAnswer(t, last.value).correct;
    const firstCorrect = correct && !!arr[0] && checkAnswer(t, arr[0].value).correct && !arr[0].hints && !arr[0].revealed;
    const unaided = correct && !r.hints && !r.revealed;
    if (correct) solved++; if (unaided) independent++; if (firstCorrect) first++; if (correct && !unaided) assisted++;
    if (r.hints) hinted++; if (r.revealed) revealed++; if (arr.length) answered++; attempts += arr.length;
    const topic = topics[t.formulaId] ||= { title: t.formula.title, total: 0, solved: 0, first: 0, independent: 0, hints: 0 };
    topic.total++; if (correct) topic.solved++; if (firstCorrect) topic.first++; if (unaided) topic.independent++; if (r.hints || r.revealed) topic.hints++;
    return { task: t, record: r, correct, firstCorrect, independent: unaided, lastValue: last?.value ?? '', attempts: arr.length };
  });
  return { total: tasks.length, solved, independent, first, assisted, hinted, revealed, attempts, answered, unanswered: tasks.length - answered, percent: Math.round(100 * first / Math.max(1, tasks.length)), topics, details };
}
export function answerText(t, value) { return t.kind === 'choice' ? (t.options[Number(value)] != null ? pretty(t.options[Number(value)]) : '—') : (String(value).trim() ? pretty(value) : '—'); }
export function durationText(ms) { const minutes = Math.floor(Math.max(0, ms) / 60000), seconds = Math.floor(Math.max(0, ms) / 1000) % 60; return minutes ? `${minutes} мин ${seconds} с` : `${seconds} с`; }
export function makeReport(session, student, comment = '') {
  const tasks = createTasks(session.seed, session.settings), s = analyze(tasks, session.records);
  const date = new Date(session.finishedAt || Date.now()).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
  const lines = ['АНИЧКОВ · АЛГЕБРА', 'Формулы сокращённого умножения', '', `Ученик: ${student.name}`, `Класс: ${student.grade}`, `Работа: ${MODE_LABELS[session.settings.mode]}`, `Дата: ${date} (МСК)`, `Код работы: ${session.id}`, `Время в тренажёре: ${durationText(session.elapsedMs || 0)}`, '', `С первого раза без помощи: ${s.first} / ${s.total} (${s.percent}%)`, `Решено самостоятельно, включая исправления: ${s.independent} / ${s.total}`, `Решено с помощью: ${s.assisted}`, `Ответ верен в итоге: ${s.solved} / ${s.total}`, `Без отправленного ответа: ${s.unanswered}`, `Попыток: ${s.attempts}; заданий с подсказками: ${s.hinted}; открыто разборов: ${s.revealed}`, '', 'ПО ФОРМУЛАМ'];
  for (const x of Object.values(s.topics)) lines.push(`${x.title}: с первого раза ${x.first}/${x.total}, верно в итоге ${x.solved}/${x.total}`);
  lines.push('', 'ОТВЕТЫ И ПОПЫТКИ');
  for (const [i, d] of s.details.entries()) {
    const t = d.task, r = d.record;
    lines.push('', `${i + 1}. ${t.formula.title} · ${t.kind === 'factor' ? 'Разложи на множители' : t.kind === 'choice' ? 'Выбери формулу' : t.kind === 'fill' ? 'Впиши коэффициент' : 'Раскрой скобки'}`, `Задание: ${pretty(t.expression)}`, `Верный ответ: ${pretty(t.expected)}`);
    if (!r.attempts?.length) lines.push(r.revealed ? 'Ответ не отправлен; открыт разбор.' : 'Ответ не отправлен.');
    for (const [j, a] of (r.attempts || []).entries()) lines.push(`Попытка ${j + 1}: ${answerText(t, a.value)} — ${checkAnswer(t, a.value).correct ? 'верно' : 'неверно'}${a.hints ? `; подсказок к этому моменту: ${a.hints}` : ''}${a.revealed ? '; после открытия разбора' : ''}`);
    lines.push(`Итог: ${d.firstCorrect ? 'верно с первого раза без помощи' : d.independent ? 'исправлено самостоятельно' : d.correct ? 'верно с помощью' : 'нужно повторить'}; подсказок: ${r.hints || 0}; разбор: ${r.revealed ? 'открыт' : 'не открыт'}.`);
  }
  if (comment.trim()) lines.push('', `Комментарий ученика: ${comment.trim()}`);
  lines.push('', 'Учебный тренажёр, не защищённая контрольная. Ответы перепроверены алгебраическим движком; сведения о времени и помощи переданы браузером.');
  return lines.join('\n');
}
