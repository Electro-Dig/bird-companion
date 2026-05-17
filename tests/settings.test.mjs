import assert from 'node:assert/strict';
import {
  DEFAULT_SETTINGS,
  formatVolume,
  normalizeFeedbackEvery,
  normalizeVolume,
  nextFeedbackEvery,
  shouldEmitFeedback,
  stepVolume
} from '../src/renderer/settings.mjs';

{
  assert.equal(DEFAULT_SETTINGS.feedbackEvery, 1);
  assert.equal(DEFAULT_SETTINGS.volume, 0.78);
}

{
  assert.equal(normalizeFeedbackEvery(), 1);
  assert.equal(normalizeFeedbackEvery(1), 1);
  assert.equal(normalizeFeedbackEvery(3), 3);
  assert.equal(normalizeFeedbackEvery(5), 5);
  assert.equal(normalizeFeedbackEvery(2), 1);
  assert.equal(normalizeFeedbackEvery('3'), 3);
}

{
  assert.equal(nextFeedbackEvery(1), 3);
  assert.equal(nextFeedbackEvery(3), 5);
  assert.equal(nextFeedbackEvery(5), 1);
  assert.equal(nextFeedbackEvery('bad'), 3);
}

{
  assert.equal(shouldEmitFeedback(1, 1), true);
  assert.equal(shouldEmitFeedback(1, 3), false);
  assert.equal(shouldEmitFeedback(2, 3), false);
  assert.equal(shouldEmitFeedback(3, 3), true);
  assert.equal(shouldEmitFeedback(5, 5), true);
  assert.equal(shouldEmitFeedback(0, 3), false);
}

{
  assert.equal(normalizeVolume(), 0.78);
  assert.equal(normalizeVolume(-1), 0);
  assert.equal(normalizeVolume(2), 1);
  assert.equal(normalizeVolume('0.333'), 0.33);
  assert.equal(stepVolume(0.78, 1), 0.88);
  assert.equal(stepVolume(0.78, -1), 0.68);
  assert.equal(stepVolume(0.96, 1), 1);
  assert.equal(formatVolume(0.678), '68%');
}

console.log('settings tests passed');
