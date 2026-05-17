import assert from 'node:assert/strict';
import {
  createInitialTypingStats,
  formatTypingStat,
  recordTypingEvent,
  summarizeTypingStats
} from '../src/renderer/typing-stats.mjs';

{
  const stats = createInitialTypingStats();
  assert.equal(stats.totalKeys, 0);
  assert.equal(stats.sessionKeys, 0);
  assert.equal(stats.letterKeys, 0);
  assert.deepEqual(stats.keyCounts, {});
  assert.deepEqual(stats.dailyTotals, {});
  assert.deepEqual(stats.dailyKeyCounts, {});
  assert.deepEqual(stats.recentTimes, []);
}

{
  let stats = createInitialTypingStats({ totalKeys: 12 });
  stats = recordTypingEvent(stats, { keyType: 'letter', key: 'a', rawText: 'private', now: 1000, timestamp: Date.UTC(2026, 4, 17, 1) });
  stats = recordTypingEvent(stats, { keyType: 'letter', key: 'B', now: 1200, timestamp: Date.UTC(2026, 4, 17, 2) });
  stats = recordTypingEvent(stats, { keyType: 'erase', key: 'Backspace', now: 1600, timestamp: Date.UTC(2026, 4, 18, 1) });

  assert.equal(stats.totalKeys, 15);
  assert.equal(stats.sessionKeys, 3);
  assert.equal(stats.letterKeys, 2);
  assert.equal(stats.controlKeys, 1);
  assert.deepEqual(stats.recentTimes, [1000, 1200, 1600]);
  assert.deepEqual(stats.keyCounts, { A: 1, B: 1, Backspace: 1 });
  assert.deepEqual(stats.dailyTotals, { '2026-05-17': 2, '2026-05-18': 1 });
  assert.deepEqual(stats.dailyKeyCounts['2026-05-17'], { A: 1, B: 1 });
  assert.deepEqual(stats.dailyKeyCounts['2026-05-18'], { Backspace: 1 });
  assert.equal(Object.hasOwn(stats, 'key'), false);
  assert.equal(Object.hasOwn(stats, 'rawText'), false);
}

{
  let stats = createInitialTypingStats();
  for (let index = 0; index < 22; index += 1) {
    stats = recordTypingEvent(stats, { keyType: 'letter', now: index * 100 });
  }

  assert.equal(stats.recentTimes.length, 20);
  assert.equal(stats.recentTimes[0], 200);
}

{
  let stats = createInitialTypingStats();
  stats = recordTypingEvent(stats, { keyType: 'letter', now: 1000 });
  stats = recordTypingEvent(stats, { keyType: 'letter', now: 1500 });
  stats = recordTypingEvent(stats, { keyType: 'letter', now: 2000 });

  const summary = summarizeTypingStats(stats);
  assert.equal(summary.totalKeys, 3);
  assert.equal(summary.sessionKeys, 3);
  assert.equal(summary.currentKps, 1.5);
  assert.deepEqual(summary.topKeys, [{ key: 'Other', count: 3 }]);
  assert.equal(formatTypingStat(12345), '12,345');
}

{
  let stats = createInitialTypingStats();
  stats = recordTypingEvent(stats, { keyType: 'letter', key: 'q', now: 1000, timestamp: Date.UTC(2026, 4, 16, 1) });
  stats = recordTypingEvent(stats, { keyType: 'letter', key: 'q', now: 1100, timestamp: Date.UTC(2026, 4, 16, 2) });
  stats = recordTypingEvent(stats, { keyType: 'rest', key: ' ', now: 1200, timestamp: Date.UTC(2026, 4, 17, 1) });

  const summary = summarizeTypingStats(stats, { date: '2026-05-16' });
  assert.equal(summary.selectedDate, '2026-05-16');
  assert.equal(summary.selectedDateTotal, 2);
  assert.deepEqual(summary.availableDates, ['2026-05-17', '2026-05-16']);
  assert.deepEqual(summary.selectedTopKeys, [{ key: 'Q', count: 2 }]);
}

console.log('typing-stats tests passed');
