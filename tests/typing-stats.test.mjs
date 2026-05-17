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
  assert.deepEqual(stats.recentTimes, []);
}

{
  let stats = createInitialTypingStats({ totalKeys: 12 });
  stats = recordTypingEvent(stats, { keyType: 'letter', key: 'secret', rawText: 'private', now: 1000 });
  stats = recordTypingEvent(stats, { keyType: 'letter', now: 1200 });
  stats = recordTypingEvent(stats, { keyType: 'erase', now: 1600 });

  assert.equal(stats.totalKeys, 15);
  assert.equal(stats.sessionKeys, 3);
  assert.equal(stats.letterKeys, 2);
  assert.equal(stats.controlKeys, 1);
  assert.deepEqual(stats.recentTimes, [1000, 1200, 1600]);
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
  assert.equal(formatTypingStat(12345), '12,345');
}

console.log('typing-stats tests passed');
