/*
 * Защищённая отправка отчёта в Telegram.
 * Добавьте переменные окружения в Netlify, а не в файлы сайта:
 * TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID.
 */

const clean = (value, limit = 160) => String(value ?? '')
  .replace(/[<>]/g, '')
  .replace(/[\r\n\t]+/g, ' ')
  .replace(/\s{2,}/g, ' ')
  .trim()
  .slice(0, limit);

function scoreLine(report) {
  return `${report.score}/${report.total} с первой попытки (${report.percent}%)`;
}

function makeText(report) {
  const lines = [
    '📐 СТЕПЕНЬ PRO · результат',
    '━━━━━━━━━━━━━━━━━━━━',
    `👤 Ученик: ${clean(report.studentName, 40)}`,
    `📝 Режим: ${clean(report.mode, 50)}`,
    `📅 Дата: ${clean(report.completedAt, 50)}`,
    `⏱ Время: ${clean(report.duration, 12)}`,
    `🎯 Итог: ${scoreLine(report)}`,
    '',
    'Ответы:'
  ];

  (Array.isArray(report.tasks) ? report.tasks : []).slice(0, 25).forEach((task, index) => {
    const icon = task.firstTryCorrect ? '✓' : '✗';
    const hint = task.usedHint ? ', подсказка' : '';
    const attempts = Number(task.attempts) > 1 ? `, попыток: ${Math.min(Number(task.attempts), 9)}` : '';
    lines.push(`${icon} ${index + 1}. ${clean(task.topic, 44)}: ${clean(task.answer, 45) || '—'} → ${clean(task.expected, 45)}${hint}${attempts}`);
  });
  return lines.join('\n').slice(0, 4000);
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { Allow: 'POST' }, body: JSON.stringify({ ok: false, error: 'Метод не поддерживается' }) };
  }

  const headers = { 'Content-Type': 'application/json; charset=utf-8' };
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error('Telegram environment variables are not configured.');
    return { statusCode: 503, headers, body: JSON.stringify({ ok: false, error: 'Отправка ещё не настроена' }) };
  }

  let report;
  try { report = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Некорректный отчёт' }) }; }

  const studentName = clean(report.studentName, 40);
  const score = Number(report.score), total = Number(report.total), percent = Number(report.percent);
  if (studentName.length < 2 || !Number.isInteger(score) || !Number.isInteger(total) || total < 1 || total > 25 || score < 0 || score > total || !Number.isFinite(percent)) {
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Проверьте данные отчёта' }) };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: makeText(report), disable_web_page_preview: true })
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      console.error('Telegram API error:', data.description || response.status);
      return { statusCode: 502, headers, body: JSON.stringify({ ok: false, error: 'Telegram временно недоступен' }) };
    }
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  } catch (error) {
    console.error('Sending report failed:', error.message);
    return { statusCode: 502, headers, body: JSON.stringify({ ok: false, error: 'Не удалось связаться с Telegram' }) };
  }
};
