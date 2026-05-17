const FEEDBACK_EVERY_VALUES = [1, 3, 5];
const DEFAULT_VOLUME = 0.78;
const VOLUME_STEP = 0.1;

export const DEFAULT_SETTINGS = {
  feedbackEvery: 1,
  volume: DEFAULT_VOLUME
};

export function normalizeFeedbackEvery(value = DEFAULT_SETTINGS.feedbackEvery) {
  const number = Number(value);
  return FEEDBACK_EVERY_VALUES.includes(number) ? number : DEFAULT_SETTINGS.feedbackEvery;
}

export function nextFeedbackEvery(value = DEFAULT_SETTINGS.feedbackEvery) {
  const current = normalizeFeedbackEvery(value);
  const index = FEEDBACK_EVERY_VALUES.indexOf(current);
  return FEEDBACK_EVERY_VALUES[(index + 1) % FEEDBACK_EVERY_VALUES.length];
}

export function shouldEmitFeedback(validKeyCount, feedbackEvery = DEFAULT_SETTINGS.feedbackEvery) {
  const count = Math.floor(Number(validKeyCount));
  if (!Number.isFinite(count) || count <= 0) return false;
  return count % normalizeFeedbackEvery(feedbackEvery) === 0;
}

export function normalizeVolume(value = DEFAULT_VOLUME) {
  const number = Number(value);
  if (!Number.isFinite(number)) return DEFAULT_VOLUME;
  return roundVolume(Math.min(1, Math.max(0, number)));
}

export function stepVolume(value = DEFAULT_VOLUME, direction = 1) {
  const delta = direction >= 0 ? VOLUME_STEP : -VOLUME_STEP;
  return normalizeVolume(normalizeVolume(value) + delta);
}

export function formatVolume(value = DEFAULT_VOLUME) {
  return `${Math.round(normalizeVolume(value) * 100)}%`;
}

function roundVolume(value) {
  return Math.round(value * 100) / 100;
}
