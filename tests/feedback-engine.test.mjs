import assert from 'node:assert/strict';
import {
  buildSoundBanks,
  createFeedbackEvent,
  createInitialFeedbackState,
  createMotionCue,
  summarizePulse
} from '../feedback-engine.mjs';

const samples = [
  {
    id: 'soft-001',
    species: 'Soft Bulbul',
    latin: 'Avis mollis',
    call_audio: '../audio/soft.wav',
    call_spectrogram: '../spec/soft.png',
    features: {
      centroid_mean: 1200,
      onset_rate: 0.08,
      spectral_flux_mean: 0.04,
      zcr_mean: 0.03,
      flatness_mean: 0.02
    }
  },
  {
    id: 'bright-001',
    species: 'Bright Tit',
    latin: 'Avis clara',
    call_audio: '../audio/bright.wav',
    call_spectrogram: '../spec/bright.png',
    features: {
      centroid_mean: 5200,
      onset_rate: 0.16,
      spectral_flux_mean: 0.08,
      zcr_mean: 0.07,
      flatness_mean: 0.05
    }
  },
  {
    id: 'active-001',
    species: 'Active Magpie',
    latin: 'Avis agilis',
    call_audio: '../audio/active.wav',
    call_spectrogram: '../spec/active.png',
    features: {
      centroid_mean: 3400,
      onset_rate: 0.82,
      spectral_flux_mean: 0.76,
      zcr_mean: 0.06,
      flatness_mean: 0.04
    }
  },
  {
    id: 'alert-001',
    species: 'Alert Finch',
    latin: 'Avis cauta',
    call_audio: '../audio/alert.wav',
    call_spectrogram: '../spec/alert.png',
    features: {
      centroid_mean: 4100,
      onset_rate: 0.32,
      spectral_flux_mean: 0.22,
      zcr_mean: 0.48,
      flatness_mean: 0.43
    }
  },
  {
    id: 'soft-002',
    species: 'Soft Bulbul',
    latin: 'Avis mollis',
    call_audio: '../audio/soft2.wav',
    call_spectrogram: '../spec/soft2.png',
    features: {
      centroid_mean: 1500,
      onset_rate: 0.1,
      spectral_flux_mean: 0.05,
      zcr_mean: 0.04,
      flatness_mean: 0.03
    }
  }
];

const baseUrl = 'http://localhost:8792/sound-similarity-lab/teaching-site/';

{
  const banks = buildSoundBanks(samples);
  assert.equal(banks.soft[0].id, 'soft-001');
  assert.equal(banks.bright[0].id, 'bright-001');
  assert.equal(banks.active[0].id, 'active-001');
  assert.equal(banks.alert[0].id, 'alert-001');
  assert.ok(banks.chorus.length >= 4, 'chorus keeps a species-diverse pool');
}

{
  const first = createFeedbackEvent({
    key: 'a',
    now: 1000,
    state: createInitialFeedbackState(),
    samples,
    dataBaseUrl: baseUrl
  });

  assert.equal(first.handled, true);
  assert.equal(first.mood, 'curious');
  assert.deepEqual(first.motion, createMotionCue('curious'));
  assert.equal(first.plans.length, 1);
  assert.equal(first.plans[0].sample.id, 'soft-001');
  assert.equal(first.plans[0].audioUrl, 'http://localhost:8792/sound-similarity-lab/audio/soft.wav');
  assert.equal(first.nextState.textLength, 1);
}

{
  let state = createInitialFeedbackState();
  for (const [key, now] of [['a', 1000], ['s', 1050], ['d', 1090], ['f', 1130]]) {
    state = createFeedbackEvent({ key, now, state, samples, dataBaseUrl: baseUrl }).nextState;
  }
  const burst = createFeedbackEvent({ key: 'g', now: 1165, state, samples, dataBaseUrl: baseUrl });

  assert.equal(burst.mood, 'busy');
  assert.equal(burst.motion.action, 'flutter');
  assert.equal(burst.motion.feathers, 1);
  assert.ok(['active-001', 'bright-001'].includes(burst.plans[0].sample.id));
  assert.ok(burst.plans[0].playbackRate > 1);
  assert.ok(burst.nextState.burst >= 4);
}

{
  let state = createInitialFeedbackState();
  state = createFeedbackEvent({ key: 'a', now: 1000, state, samples, dataBaseUrl: baseUrl }).nextState;
  state = createFeedbackEvent({ key: 'b', now: 1260, state, samples, dataBaseUrl: baseUrl }).nextState;
  const erase = createFeedbackEvent({ key: 'Backspace', now: 1320, state, samples, dataBaseUrl: baseUrl });

  assert.equal(erase.mood, 'alert');
  assert.equal(erase.motion.action, 'startle');
  assert.equal(erase.motion.feathers, 3);
  assert.equal(erase.plans[0].sample.id, 'alert-001');
  assert.ok(erase.plans[0].volume < 0.55);
  assert.equal(erase.nextState.textLength, 1);
}

{
  let state = createInitialFeedbackState();
  for (const [key, now] of [['j', 1000], ['k', 1180], ['l', 1370]]) {
    state = createFeedbackEvent({ key, now, state, samples, dataBaseUrl: baseUrl }).nextState;
  }
  const chorus = createFeedbackEvent({ key: 'Enter', now: 1600, state, samples, dataBaseUrl: baseUrl });

  assert.equal(chorus.mood, 'chorus');
  assert.equal(chorus.motion.echoes, 2);
  assert.equal(chorus.plans.length, 3);
  assert.deepEqual(chorus.plans.map(plan => plan.delay), [0, 95, 190]);
  assert.equal(new Set(chorus.plans.map(plan => plan.sample.species)).size, 3);
}

{
  const pulse = summarizePulse([
    { keyType: 'letter', at: 1000 },
    { keyType: 'letter', at: 1070 },
    { keyType: 'letter', at: 1160 },
    { keyType: 'erase', at: 1210 }
  ]);

  assert.equal(pulse.tempo, 'fast');
  assert.equal(pulse.erasePressure, 0.25);
  assert.ok(pulse.density > 6);
}

{
  assert.equal(createMotionCue('curious').chirps, 1);
  assert.equal(createMotionCue('busy').chirps, 2);
  assert.equal(createMotionCue('chorus').chirps, 3);
}

{
  assert.deepEqual(createMotionCue('sleepy'), {
    action: 'nestle',
    pulses: 0,
    echoes: 0,
    feathers: 0,
    chirps: 0,
    branch: 'settle'
  });
}

console.log('feedback-engine tests passed');
