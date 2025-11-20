import asyncHandler from '../utils/asyncHandler.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL   = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const USE_FALLBACK = String(process.env.AI_FALLBACK || '').trim() === '1';

export const aiHealth = asyncHandler(async (_req, res) => {
  res.json({
    ok: true,
    model: MODEL,
    hasKey: Boolean(API_KEY && API_KEY.trim()),
    fallback: USE_FALLBACK
  });
});

function localFallback(question, monthlyData = [], history = '') {
  const q = String(question || '').toLowerCase().trim();

  // Helper: extract stats from monthlyData
  const stats = (() => {
    const data = Array.isArray(monthlyData)
      ? monthlyData
          .filter(m => m && m.month && typeof m.total === 'number')
          .sort((a, b) => (a.month > b.month ? 1 : -1))
      : [];
    const total = data.reduce((sum, d) => sum + (Number(d.total) || 0), 0);
    const count = data.length || 0;
    const avg = count ? total / count : 0;

    let best = null, worst = null;
    for (const d of data) {
      if (!best || d.total > best.total) best = d;
      if (!worst || d.total < worst.total) worst = d;
    }

    // MoM growth (last vs prev)
    let mom = null;
    if (data.length >= 2) {
      const last = data[data.length - 1];
      const prev = data[data.length - 2];
      const d = prev.total ? ((last.total - prev.total) / prev.total) * 100 : null;
      mom = { last, prev, pct: d };
    }

    // naive forecast (linear over last 2)
    let forecast = null;
    if (data.length >= 2) {
      const last = data[data.length - 1].total;
      const prev = data[data.length - 2].total;
      forecast = Math.max(0, last + (last - prev));
    }

    return { data, total, count, avg, best, worst, mom, forecast };
  })();

  const lastAssistant = (history || '')
    .split('\n')
    .reverse()
    .find(line => line.startsWith('Assistant: ')) || '';

  const greetedBefore = /\b(hi|hello|hey)\b/i.test(lastAssistant);
  const isGreeting = /\b(hi|hello|hey)\b/.test(q);

  // If user said "hi" but assistant already greeted recently → avoid greeting again
  if (isGreeting) {
    if (greetedBefore) {
      return "Ready. Ask me about best month, average revenue, trend, or a quick forecast.";
    }
    return [
      "Hi! 👋 I’m your Revenue Insights assistant.",
      "Try:",
      "• Which month performed best?",
      "• What’s the average revenue?",
      "• Forecast next month based on trend."
    ].join('\n');
  }

  // Simple intent detection
  const askBest     = /\b(best|top|highest|peak)\b/.test(q);
  const askWorst    = /\b(worst|lowest|min)\b/.test(q);
  const askAverage  = /\b(average|avg|mean)\b/.test(q);
  const askTotal    = /\b(total|sum|overall)\b/.test(q);
  const askTrend    = /\b(trend|growth|increase|decrease|mom|month over month)\b/.test(q);
  const askForecast = /\b(forecast|predict|next month)\b/.test(q);
  const askCount    = /\b(how many|count|months analyzed)\b/.test(q);
  const askCompare  = /\b(compare|vs|versus)\b/.test(q);

  const fmtMoney = (n) => (typeof n === 'number' ? n.toFixed(2) : n);

  // Compose targeted answers
  if (askBest && stats.best) {
    return `Best month: ${stats.best.month} — ${fmtMoney(stats.best.total)}.`;
  }

  if (askWorst && stats.worst) {
    return `Lowest month: ${stats.worst.month} — ${fmtMoney(stats.worst.total)}.`;
  }

  if (askAverage) {
    return `Average monthly total: ${fmtMoney(stats.avg)} (${stats.count} months).`;
  }

  if (askTotal) {
    return `Total across ${stats.count} months: ${fmtMoney(stats.total)}.`;
  }

  if (askTrend && stats.mom) {
    const dir = stats.mom.pct > 0 ? '↑' : (stats.mom.pct < 0 ? '↓' : '→');
    return [
      `Trend (MoM): ${stats.mom.prev.month} → ${stats.mom.last.month}`,
      `Change: ${dir} ${fmtMoney(stats.mom.last.total - stats.mom.prev.total)} (${stats.mom.pct?.toFixed(1)}%)`
    ].join(' · ');
  }

  if (askForecast && stats.forecast !== null) {
    return [
      `Naive forecast (next month): ~${fmtMoney(stats.forecast)}.`,
      `Note: based on last two months; refine with more data for better accuracy.`
    ].join(' ');
  }

  if (askCount) {
    return `Months analyzed: ${stats.count}.`;
  }

  if (askCompare && stats.data.length >= 2) {
    // Try to detect two months in the question
    const months = stats.data.map(d => d.month.toLowerCase());
    const found = months.filter(m => q.includes(m.toLowerCase()));
    if (found.length >= 2) {
      const a = stats.data.find(d => d.month.toLowerCase() === found[0]);
      const b = stats.data.find(d => d.month.toLowerCase() === found[1]);
      const diff = (a && b) ? a.total - b.total : null;
      if (diff !== null) {
        const dir = diff > 0 ? 'higher' : (diff < 0 ? 'lower' : 'same');
        return `${a.month} is ${dir} than ${b.month} by ${fmtMoney(Math.abs(diff))}.`;
      }
    }
    // fallback compare: last two
    const last = stats.data[stats.data.length - 1];
    const prev = stats.data[stats.data.length - 2];
    const diff = last.total - prev.total;
    const dir = diff > 0 ? 'higher' : (diff < 0 ? 'lower' : 'same');
    return `${last.month} is ${dir} than ${prev.month} by ${fmtMoney(Math.abs(diff))}.`;
  }

  // Default: concise, non-repetitive summary (avoid repeating last assistant block)
  const summary = [
    stats.best ? `Best month: ${stats.best.month} — ${fmtMoney(stats.best.total)}` : null,
    `Average: ${fmtMoney(stats.avg)}`,
    `Months: ${stats.count}`
  ].filter(Boolean).join(' · ');

  if (lastAssistant.includes(summary)) {
    return `You might explore: growth trend, worst month, or a simple forecast.`;
  }
  return `Summary: ${summary}.`;
}

export const chatWithAI = asyncHandler(async (req, res) => {
  const { question = '', monthlyData = [], history = '' } = req.body || {};
  const q = String(question || '').trim();
  if (!q) return res.status(400).json({ message: 'Question is required' });

  // Fallback mode (or missing key)
  if (USE_FALLBACK || !API_KEY) {
    const answer = localFallback(q, monthlyData, history);
    return res.json({ ok: true, answer, fallback: true });
  }

  // Normalize dataset
  const slim = Array.isArray(monthlyData)
    ? monthlyData.slice(0, 24).map(m => ({
        month: m?.month ?? m?.label ?? '',
        total: Number(m?.total ?? m?.amount ?? 0),
      }))
    : [];
  const dsLines = slim.map(s => `- ${s.month}: $${s.total}`).join('\n');

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: { temperature: 0.2 },
  });

  const prompt = `
    You are "Revenue Insights (AI)", a concise revenue analyst for a wellness resort.

    DATASET (month → total USD):
    ${dsLines || '(no data provided)'}

    CONVERSATION HISTORY (latest first):
    ${(history || '').trim() || '(none)'}

    USER QUESTION:
    ${q}

    RESPONSE RULES:
    - If there is conversation history, DO NOT greet. Answer directly.
    - Do NOT repeat insights already stated in the history. Add NEW information only.
    - Be specific with numbers from the dataset; avoid vague advice.
    - Prefer short paragraphs and bullet points.
    - Keep it under ~120 words unless the user asks for detail.
    - If the user says only “hi/hello”, return one-line friendly reply + 3 example questions.
    - Finish with 1–2 “Next steps” bullets only when helpful.
  `;

  try {
    // Either of these works with the SDK; using simple string input:
    const result = await model.generateContent(prompt);
    const text = result?.response?.text ? await result.response.text() : '';

    if (!text) {
      console.error('Gemini empty response:', result);
      return res.status(502).json({ message: 'No answer from model' });
    }
    res.json({ ok: true, answer: text });
  } catch (e) {
    console.error('Gemini error:', e?.response?.status, e?.message || e);
    return res.status(500).json({
      message: 'AI request failed',
      detail: e?.response?.statusText || e?.message || 'Unknown error',
    });
  }
});