const DEFAULT_DATA_BASE_URL = new URL('./', import.meta.url).href;
const MAX_RECENT_EVENTS = 12;
const MAX_RECENT_LETTERS = 8;
const BANK_NAMES = ['soft', 'bright', 'active', 'alert', 'chorus'];

export function buildSoundBanks(samples = []) {
  const usable = samples
    .filter(sample => sample && (sample.call_audio || sample.audio || sample.raw_audio))
    .map((sample, index) => ({
      sample,
      index,
      brightness: metric(sample, ['centroid_mean', 'spectral_centroid_mean', 'centroid']),
      onset: metric(sample, ['onset_rate', 'onset_count', 'tempo']),
      flux: metric(sample, ['spectral_flux_mean', 'spectral_flux', 'flux_mean']),
      flatness: metric(sample, ['flatness_mean', 'spectral_flatness_mean', 'flatness']),
      zcr: metric(sample, ['zcr_mean', 'zero_crossing_rate_mean', 'zero_crossing_rate'])
    }));

  if (!usable.length) {
    return Object.fromEntries(BANK_NAMES.map(name => [name, []]));
  }

  const soft = [...usable]
    .sort((a, b) => (a.brightness + a.onset * 3000 + a.flux * 3000) - (b.brightness + b.onset * 3000 + b.flux * 3000))
    .map(item => item.sample);

  const bright = [...usable]
    .sort((a, b) => b.brightness - a.brightness || a.index - b.index)
    .map(item => item.sample);

  const active = [...usable]
    .sort((a, b) => (b.onset + b.flux) - (a.onset + a.flux) || b.brightness - a.brightness)
    .map(item => item.sample);

  const alert = [...usable]
    .sort((a, b) => (b.flatness + b.zcr) - (a.flatness + a.zcr) || b.onset - a.onset)
    .map(item => item.sample);

  return {
    soft,
    bright,
    active,
    alert,
    chorus: buildDiverseChorus(usable.map(item => item.sample))
  };
}

export function createInitialFeedbackState() {
  return {
    lastAt: 0,
    burst: 0,
    textLength: 0,
    backspaceStreak: 0,
    recentLetters: [],
    recentEvents: [],
    mood: 'idle'
  };
}

export function createMotionCue(mood = 'idle') {
  const cues = {
    idle: {
      action: 'perch',
      pulses: 0,
      echoes: 0,
      feathers: 0,
      chirps: 0,
      branch: 'still'
    },
    curious: {
      action: 'tilt',
      pulses: 1,
      echoes: 0,
      feathers: 0,
      chirps: 1,
      branch: 'tap'
    },
    busy: {
      action: 'flutter',
      pulses: 2,
      echoes: 0,
      feathers: 1,
      chirps: 2,
      branch: 'bounce'
    },
    alert: {
      action: 'startle',
      pulses: 1,
      echoes: 0,
      feathers: 3,
      chirps: 1,
      branch: 'snap'
    },
    chorus: {
      action: 'chorus-hop',
      pulses: 3,
      echoes: 2,
      feathers: 0,
      chirps: 3,
      branch: 'sway'
    },
    sleepy: {
      action: 'nestle',
      pulses: 0,
      echoes: 0,
      feathers: 0,
      chirps: 0,
      branch: 'settle'
    }
  };
  return cues[mood] || cues.idle;
}

export function createFeedbackEvent({
  key,
  now = performanceNow(),
  state = createInitialFeedbackState(),
  samples = [],
  dataBaseUrl = DEFAULT_DATA_BASE_URL,
  volume = 0.74
} = {}) {
  const classified = classifyKey(key);
  if (classified.type === 'ignored') {
    return {
      handled: false,
      mood: state.mood || 'idle',
      label: 'ignored',
      motion: createMotionCue(state.mood || 'idle'),
      plans: [],
      nextState: cloneState(state)
    };
  }

  const banks = buildSoundBanks(samples);
  const delta = state.lastAt ? Math.max(0, now - state.lastAt) : Number.POSITIVE_INFINITY;
  const burst = classified.type === 'letter'
    ? delta < 140 ? (state.burst || 0) + 1 : 1
    : Math.max(0, Math.floor((state.burst || 0) * 0.6));

  const recentEvents = appendRecent(state.recentEvents, {
    keyType: classified.type,
    key: classified.key,
    at: now
  }, MAX_RECENT_EVENTS);
  const pulse = summarizePulse(recentEvents);

  if (classified.type === 'rest') {
    const nextState = {
      ...cloneState(state),
      lastAt: now,
      burst: 0,
      backspaceStreak: 0,
      recentEvents,
      mood: 'sleepy'
    };
    return {
      handled: true,
      mood: 'sleepy',
      label: 'rest',
      pulse,
      motion: createMotionCue('sleepy'),
      plans: [],
      nextState
    };
  }

  if (classified.type === 'erase') {
    const sample = pickFromBank(focusBank(banks.alert), now, state.textLength);
    const nextState = {
      ...cloneState(state),
      lastAt: now,
      burst,
      textLength: Math.max(0, (state.textLength || 0) - 1),
      backspaceStreak: (state.backspaceStreak || 0) + 1,
      recentEvents,
      recentLetters: state.recentLetters || [],
      mood: 'alert'
    };
    return {
      handled: true,
      mood: 'alert',
      label: 'erase',
      pulse,
      motion: createMotionCue('alert'),
      plans: [makePlan(sample, {
        mood: 'alert',
        volume: volume * 0.58,
        playbackRate: 0.96,
        dataBaseUrl
      })].filter(Boolean),
      nextState
    };
  }

  if (classified.type === 'chorus') {
    const recentLetters = state.recentLetters || [];
    const seeds = recentLetters.length ? recentLetters.slice(-3) : ['a', 's', 'd'];
    const plans = seeds.map((letter, index) => {
      const sample = pickChorusSample(banks.chorus, letter, index);
      return makePlan(sample, {
        mood: 'chorus',
        volume: volume * (0.72 - index * 0.08),
        playbackRate: 0.96 + index * 0.035,
        delay: index * 95,
        dataBaseUrl
      });
    }).filter(Boolean);
    const nextState = {
      ...cloneState(state),
      lastAt: now,
      burst: 0,
      backspaceStreak: 0,
      recentEvents,
      mood: 'chorus'
    };
    return {
      handled: true,
      mood: 'chorus',
      label: 'chorus',
      pulse,
      motion: createMotionCue('chorus'),
      plans,
      nextState
    };
  }

  const mood = chooseLetterMood({ burst, pulse, delta });
  const bank = chooseBankForMood(banks, mood, classified.key);
  const sample = pickFromBank(bank, keyScore(classified.key) + Math.max(0, burst - 1), state.textLength || 0);
  const recentLetters = appendRecent(state.recentLetters, classified.key, MAX_RECENT_LETTERS);
  const nextState = {
    ...cloneState(state),
    lastAt: now,
    burst,
    textLength: (state.textLength || 0) + 1,
    backspaceStreak: 0,
    recentEvents,
    recentLetters,
    mood
  };

  return {
    handled: true,
    mood,
    label: classified.key,
    pulse,
    motion: createMotionCue(mood),
    plans: [makePlan(sample, {
      mood,
      volume: volume * volumeForMood(mood, pulse),
      playbackRate: rateForMood(mood, classified.key, burst),
      dataBaseUrl
    })].filter(Boolean),
    nextState
  };
}

export function summarizePulse(events = []) {
  const relevant = events
    .filter(event => event && Number.isFinite(event.at))
    .sort((a, b) => a.at - b.at);

  if (relevant.length < 2) {
    return {
      tempo: 'slow',
      density: 0,
      erasePressure: countType(relevant, 'erase') / Math.max(relevant.length, 1),
      duration: 0
    };
  }

  const duration = Math.max(1, relevant.at(-1).at - relevant[0].at);
  const intervals = [];
  for (let index = 1; index < relevant.length; index += 1) {
    intervals.push(Math.max(1, relevant[index].at - relevant[index - 1].at));
  }

  const averageInterval = intervals.reduce((sum, value) => sum + value, 0) / intervals.length;
  const density = relevant.length / (duration / 1000);
  const erasePressure = countType(relevant, 'erase') / relevant.length;
  const tempo = averageInterval < 120 || density > 6
    ? 'fast'
    : averageInterval < 280
      ? 'medium'
      : 'slow';

  return {
    tempo,
    density: Number(density.toFixed(2)),
    erasePressure: Number(erasePressure.toFixed(2)),
    duration
  };
}

function chooseLetterMood({ burst, pulse, delta }) {
  if (burst >= 4 || pulse.tempo === 'fast') return 'busy';
  if (delta > 900) return 'curious';
  return 'curious';
}

function chooseBankForMood(banks, mood, key) {
  if (mood === 'busy') {
    return focusBank(keyScore(key) % 2 === 0 ? banks.active : banks.bright);
  }
  return focusBank(banks.soft);
}

function makePlan(sample, {
  mood,
  volume,
  playbackRate,
  delay = 0,
  dataBaseUrl
}) {
  if (!sample) return null;
  return {
    mood,
    sample,
    audioUrl: resolveSampleAsset(sample, 'audio', dataBaseUrl),
    spectrogramUrl: resolveSampleAsset(sample, 'spectrogram', dataBaseUrl),
    volume: clamp(Number(volume.toFixed(3)), 0, 1),
    playbackRate: clamp(Number(playbackRate.toFixed(3)), 0.76, 1.22),
    delay
  };
}

function pickFromBank(bank = [], seed = 0, offset = 0) {
  if (!bank.length) return null;
  const index = Math.abs(Math.floor(seed + offset)) % bank.length;
  return bank[index];
}

function focusBank(bank = []) {
  if (bank.length <= 2) return bank;
  return bank.slice(0, Math.max(1, Math.floor(bank.length * 0.25)));
}

function classifyKey(key) {
  if (typeof key !== 'string') return { type: 'ignored', key: '' };
  if (key.length === 1 && /^[a-z]$/i.test(key)) {
    return { type: 'letter', key: key.toLowerCase() };
  }
  if (key === ' ') return { type: 'rest', key };
  if (key === 'Enter') return { type: 'chorus', key };
  if (key === 'Backspace') return { type: 'erase', key };
  return { type: 'ignored', key };
}

function resolveSampleAsset(sample, kind, dataBaseUrl = DEFAULT_DATA_BASE_URL) {
  if (!sample) return '';
  const raw = kind === 'spectrogram'
    ? sample.call_spectrogram || sample.spectrogram || sample.raw_spectrogram
    : sample.call_audio || sample.audio || sample.raw_audio;
  return raw ? new URL(raw, dataBaseUrl).href : '';
}

function pickChorusSample(bank = [], letter, index) {
  if (!bank.length) return null;
  const usedSpecies = new Set();
  const seed = keyScore(letter) + index * 3;
  for (let step = 0; step < bank.length; step += 1) {
    const sample = bank[(seed + step) % bank.length];
    const species = sample.species || sample.id;
    if (!usedSpecies.has(species)) {
      usedSpecies.add(species);
      return sample;
    }
  }
  return bank[seed % bank.length];
}

function buildDiverseChorus(samples) {
  const bySpecies = new Map();
  for (const sample of samples) {
    const species = sample.species || sample.id || 'unknown';
    if (!bySpecies.has(species)) bySpecies.set(species, []);
    bySpecies.get(species).push(sample);
  }

  const rounds = Math.max(...[...bySpecies.values()].map(group => group.length));
  const chorus = [];
  for (let round = 0; round < rounds; round += 1) {
    for (const group of bySpecies.values()) {
      if (group[round]) chorus.push(group[round]);
    }
  }
  return chorus;
}

function metric(sample, names) {
  for (const name of names) {
    const value = Number(sample.features?.[name]);
    if (Number.isFinite(value)) return value;
  }
  return 0;
}

function keyScore(key) {
  const char = String(key || 'a').toLowerCase().charCodeAt(0);
  return Number.isFinite(char) ? Math.max(0, char - 97) : 0;
}

function volumeForMood(mood, pulse) {
  if (mood === 'busy') return pulse.tempo === 'fast' ? 0.9 : 0.78;
  return 0.68;
}

function rateForMood(mood, key, burst) {
  const position = keyScore(key) / 25;
  if (mood === 'busy') return 1.02 + Math.min(burst, 6) * 0.018 + position * 0.04;
  return 0.91 + position * 0.05;
}

function appendRecent(items = [], item, max) {
  return [...items, item].slice(-max);
}

function countType(events, type) {
  return events.filter(event => event.keyType === type).length;
}

function cloneState(state) {
  return {
    ...createInitialFeedbackState(),
    ...state,
    recentLetters: [...(state.recentLetters || [])],
    recentEvents: [...(state.recentEvents || [])]
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function performanceNow() {
  return globalThis.performance?.now?.() ?? Date.now();
}
