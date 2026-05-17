const MAX_RECENT_TIMES = 20;
const MAX_STORED_DAYS = 45;

export function createInitialTypingStats(saved = {}) {
  return {
    totalKeys: positiveInteger(saved.totalKeys),
    sessionKeys: 0,
    letterKeys: 0,
    controlKeys: 0,
    keyCounts: normalizeCountMap(saved.keyCounts),
    dailyTotals: normalizeCountMap(saved.dailyTotals),
    dailyKeyCounts: normalizeDailyKeyCounts(saved.dailyKeyCounts),
    recentTimes: []
  };
}

export function recordTypingEvent(stats = createInitialTypingStats(), {
  keyType = 'letter',
  key = '',
  now = performanceNow(),
  timestamp = Date.now()
} = {}) {
  const isLetter = keyType === 'letter';
  const keyName = normalizeKeyName(key, keyType);
  const day = toDateKey(timestamp);
  const keyCounts = incrementCount(stats.keyCounts, keyName);
  const dailyTotals = trimDailyMap(incrementCount(stats.dailyTotals, day));
  const dailyKeyCounts = trimDailyKeyCounts({
    ...normalizeDailyKeyCounts(stats.dailyKeyCounts),
    [day]: incrementCount(stats.dailyKeyCounts?.[day], keyName)
  });

  return {
    totalKeys: positiveInteger(stats.totalKeys) + 1,
    sessionKeys: positiveInteger(stats.sessionKeys) + 1,
    letterKeys: positiveInteger(stats.letterKeys) + (isLetter ? 1 : 0),
    controlKeys: positiveInteger(stats.controlKeys) + (isLetter ? 0 : 1),
    keyCounts,
    dailyTotals,
    dailyKeyCounts,
    recentTimes: [...(stats.recentTimes || []), now]
      .filter(Number.isFinite)
      .slice(-MAX_RECENT_TIMES)
  };
}

export function summarizeTypingStats(stats = createInitialTypingStats(), options = {}) {
  const date = normalizeDateKey(options.date) || latestDate(stats.dailyTotals) || toDateKey(Date.now());
  const dailyKeyCounts = normalizeDailyKeyCounts(stats.dailyKeyCounts);
  return {
    totalKeys: positiveInteger(stats.totalKeys),
    sessionKeys: positiveInteger(stats.sessionKeys),
    letterKeys: positiveInteger(stats.letterKeys),
    controlKeys: positiveInteger(stats.controlKeys),
    todayKeys: positiveInteger(stats.dailyTotals?.[toDateKey(Date.now())]),
    selectedDate: date,
    selectedDateTotal: positiveInteger(stats.dailyTotals?.[date]),
    availableDates: Object.keys(normalizeCountMap(stats.dailyTotals)).sort().reverse(),
    topKeys: topKeyCounts(stats.keyCounts),
    selectedTopKeys: topKeyCounts(dailyKeyCounts[date]),
    keyCounts: normalizeCountMap(stats.keyCounts),
    selectedKeyCounts: normalizeCountMap(dailyKeyCounts[date]),
    currentKps: calculateCurrentKps(stats.recentTimes || [])
  };
}

export function formatTypingStat(value) {
  return positiveInteger(value).toLocaleString('en-US');
}

function calculateCurrentKps(times) {
  if (times.length < 2) return 0;
  const duration = Math.max(2000, times.at(-1) - times[0]);
  return Number((times.length / (duration / 1000)).toFixed(1));
}

function positiveInteger(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
}

function incrementCount(source = {}, key) {
  const normalized = normalizeCountMap(source);
  const safeKey = String(key || 'Other');
  return {
    ...normalized,
    [safeKey]: positiveInteger(normalized[safeKey]) + 1
  };
}

function normalizeCountMap(source = {}) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) return {};
  return Object.fromEntries(Object.entries(source)
    .map(([key, value]) => [String(key), positiveInteger(value)])
    .filter(([, value]) => value > 0));
}

function normalizeDailyKeyCounts(source = {}) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) return {};
  return Object.fromEntries(Object.entries(source)
    .map(([date, counts]) => [normalizeDateKey(date), normalizeCountMap(counts)])
    .filter(([date, counts]) => date && Object.keys(counts).length));
}

function topKeyCounts(source = {}, limit = 6) {
  return Object.entries(normalizeCountMap(source))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

function normalizeKeyName(key, keyType) {
  const value = String(key || '').trim();
  if (/^[a-z]$/i.test(value)) return value.toUpperCase();
  if (keyType === 'rest' || value === ' ') return 'Space';
  if (keyType === 'erase') return 'Backspace';
  if (keyType === 'chorus') return 'Enter';
  return value.length ? value.slice(0, 18) : 'Other';
}

function toDateKey(timestamp) {
  const date = new Date(Number(timestamp));
  if (Number.isNaN(date.getTime())) return toDateKey(Date.now());
  return date.toISOString().slice(0, 10);
}

function normalizeDateKey(value) {
  const text = String(value || '');
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : '';
}

function latestDate(source = {}) {
  return Object.keys(normalizeCountMap(source)).sort().at(-1) || '';
}

function trimDailyMap(source = {}) {
  return Object.fromEntries(Object.entries(normalizeCountMap(source))
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, MAX_STORED_DAYS));
}

function trimDailyKeyCounts(source = {}) {
  return Object.fromEntries(Object.entries(normalizeDailyKeyCounts(source))
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, MAX_STORED_DAYS));
}

function performanceNow() {
  return globalThis.performance?.now?.() ?? Date.now();
}
