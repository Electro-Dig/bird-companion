const MAX_RECENT_TIMES = 20;

export function createInitialTypingStats(saved = {}) {
  return {
    totalKeys: positiveInteger(saved.totalKeys),
    sessionKeys: 0,
    letterKeys: 0,
    controlKeys: 0,
    recentTimes: []
  };
}

export function recordTypingEvent(stats = createInitialTypingStats(), {
  keyType = 'letter',
  now = performanceNow()
} = {}) {
  const isLetter = keyType === 'letter';
  return {
    totalKeys: positiveInteger(stats.totalKeys) + 1,
    sessionKeys: positiveInteger(stats.sessionKeys) + 1,
    letterKeys: positiveInteger(stats.letterKeys) + (isLetter ? 1 : 0),
    controlKeys: positiveInteger(stats.controlKeys) + (isLetter ? 0 : 1),
    recentTimes: [...(stats.recentTimes || []), now]
      .filter(Number.isFinite)
      .slice(-MAX_RECENT_TIMES)
  };
}

export function summarizeTypingStats(stats = createInitialTypingStats()) {
  return {
    totalKeys: positiveInteger(stats.totalKeys),
    sessionKeys: positiveInteger(stats.sessionKeys),
    letterKeys: positiveInteger(stats.letterKeys),
    controlKeys: positiveInteger(stats.controlKeys),
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

function performanceNow() {
  return globalThis.performance?.now?.() ?? Date.now();
}
