import {
  createFeedbackEvent,
  createInitialFeedbackState
} from './feedback-engine.mjs';
import {
  createInitialAppearanceState,
  getBirdStyle
} from './bird-appearance.mjs';
import {
  getCopy,
  nextLocale,
  normalizeLocale
} from './i18n.mjs';
import {
  createInitialTypingStats,
  formatTypingStat,
  recordTypingEvent,
  summarizeTypingStats
} from './typing-stats.mjs';

export function mountCompanion({
  root,
  lab = {},
  dataBaseUrl
} = {}) {
  if (!root) return null;

  const samples = lab.samples || [];
  const audioPool = createAudioPool(10);
  const runtime = {
    state: createInitialFeedbackState(),
    appearance: createInitialAppearanceState(readSavedBirdStyle()),
    locale: readSavedLocale(),
    facing: 'right',
    typing: createInitialTypingStats(readSavedTypingStats()),
    muted: false,
    global: {
      enabled: false,
      available: false,
      error: ''
    },
    lastPlan: null,
    events: []
  };

  const els = {
    moodLabel: root.querySelector('[data-mood-label]'),
    callIndex: root.querySelector('[data-call-index]'),
    birdName: root.querySelector('[data-bird-name]'),
    birdMeta: root.querySelector('[data-bird-meta]'),
    listenerMode: root.querySelector('[data-listener-mode]'),
    spectrogram: root.querySelector('[data-spectrogram]'),
    trail: root.querySelector('[data-call-trail]'),
    birdMark: root.querySelector('[data-bird-mark]'),
    pulseField: root.querySelector('[data-pulse-field]'),
    echoField: root.querySelector('[data-echo-field]'),
    chirpField: root.querySelector('[data-chirp-field]'),
    featherField: root.querySelector('[data-feather-field]'),
    birdDirection: root.querySelector('[data-bird-direction]'),
    totalKeys: root.querySelector('[data-total-keys]'),
    sessionKeys: root.querySelector('[data-session-keys]'),
    currentKps: root.querySelector('[data-current-kps]'),
    statLabels: Array.from(root.querySelectorAll('[data-stat-label]')),
    mute: root.querySelector('[data-mute]'),
    global: root.querySelector('[data-global]'),
    language: root.querySelector('[data-language]'),
    minimize: root.querySelector('[data-minimize]'),
    close: root.querySelector('[data-close]')
  };

  if (els.callIndex) els.callIndex.textContent = `${samples.length} calls`;
  render(root, els, runtime);

  root.addEventListener('pointerdown', () => root.focus());
  root.addEventListener('keydown', event => {
    if (runtime.global.enabled) return;
    if (handleFeedbackKey(event.key, performance.now(), runtime, samples, dataBaseUrl, audioPool, els, root)) {
      event.preventDefault();
    }
  });

  window.birdCompanionShell?.getGlobalStatus?.().then(status => {
    applyGlobalStatus(status, runtime, els);
    render(root, els, runtime);
  }).catch(() => {});

  window.birdCompanionShell?.getFacingDirection?.().then(direction => {
    applyFacingDirection(direction, runtime, root, els);
  }).catch(() => {});

  window.birdCompanionShell?.onFacingDirection?.(direction => {
    applyFacingDirection(direction, runtime, root, els);
  });

  window.birdCompanionShell?.onGlobalKey?.(payload => {
    handleFeedbackKey(payload?.key, performance.now(), runtime, samples, dataBaseUrl, audioPool, els, root);
  });

  els.mute?.addEventListener('click', () => {
    runtime.muted = !runtime.muted;
    els.mute.setAttribute('aria-pressed', String(runtime.muted));
    els.mute.textContent = runtime.muted ? 'U' : 'M';
    render(root, els, runtime);
    root.focus();
  });
  els.global?.addEventListener('click', async () => {
    const next = !runtime.global.enabled;
    els.global.disabled = true;
    try {
      const status = await window.birdCompanionShell?.setGlobalListening?.(next);
      applyGlobalStatus(status || { enabled: false, available: false, error: 'Global hook unavailable' }, runtime, els);
    } catch (error) {
      applyGlobalStatus({
        enabled: false,
        available: false,
        error: error?.message || String(error)
      }, runtime, els);
    } finally {
      els.global.disabled = false;
      render(root, els, runtime);
      root.focus();
    }
  });
  els.language?.addEventListener('click', () => {
    runtime.locale = nextLocale(runtime.locale);
    saveLocale(runtime.locale);
    render(root, els, runtime);
    root.focus();
  });
  els.minimize?.addEventListener('click', () => {
    window.birdCompanionShell?.minimize?.();
  });
  els.close?.addEventListener('click', () => {
    window.birdCompanionShell?.close?.();
  });

  setTimeout(() => root.focus(), 80);
  window.__BIRD_COMPANION_READY = true;
  return runtime;
}

function handleFeedbackKey(key, now, runtime, samples, dataBaseUrl, audioPool, els, root) {
    const feedback = createFeedbackEvent({
      key,
      now,
      state: runtime.state,
      samples,
      dataBaseUrl,
      volume: 0.78
    });

    if (!feedback.handled) return false;

    runtime.state = feedback.nextState;
    runtime.typing = recordTypingEvent(runtime.typing, {
      keyType: feedbackLabelToKeyType(feedback.label),
      now
    });
    saveTypingStats(runtime.typing);
    runtime.lastPlan = feedback.plans.at(-1) || runtime.lastPlan;
    runtime.events = [{
      label: feedback.label,
      mood: feedback.mood,
      species: runtime.lastPlan?.sample?.species || getCopy(runtime.locale).moods[feedback.mood] || feedback.mood
    }, ...runtime.events].slice(0, 7);

    playPlans(feedback.plans, audioPool, runtime.muted);
    render(root, els, runtime, feedback);
    return true;
}

function render(root, els, runtime, feedback = null) {
  const mood = feedback?.mood || runtime.state.mood || 'idle';
  const plan = runtime.lastPlan;
  const sample = plan?.sample;
  const style = getBirdStyle(runtime.appearance.style);
  const copy = getCopy(runtime.locale);

  root.dataset.mood = mood;
  root.dataset.birdStyle = style.id;
  renderFacingDirection(root, els, runtime.facing);
  root.setAttribute('aria-label', copy.appLabel);
  document.documentElement.lang = runtime.locale === 'zh' ? 'zh-CN' : 'en';
  setMotion(root, feedback?.motion?.action || 'perch', Boolean(feedback));
  if (els.birdMark) {
    els.birdMark.src = style.asset;
    els.birdMark.alt = style.label;
  }
  if (els.moodLabel) els.moodLabel.textContent = copy.moods[mood] || mood;
  if (els.birdName) els.birdName.textContent = sample?.species || copy.fallbackBirdName;
  if (els.birdMeta) {
    els.birdMeta.textContent = sample
      ? `${sample.id} / ${mood}`
      : runtime.global.error || copy.states.waiting;
  }
  if (els.listenerMode) {
    els.listenerMode.textContent = runtime.global.enabled ? copy.modes.global : copy.modes.focus;
  }
  if (els.global) {
    els.global.setAttribute('aria-pressed', String(runtime.global.enabled));
    els.global.title = runtime.global.error || copy.buttons.global;
  }
  if (els.mute) {
    els.mute.title = runtime.muted ? copy.buttons.unmute : copy.buttons.mute;
    els.mute.setAttribute('aria-label', runtime.muted ? copy.buttons.unmute : copy.buttons.mute);
  }
  if (els.language) {
    els.language.textContent = copy.buttons.language;
    els.language.title = runtime.locale === 'en' ? 'Switch to Chinese' : '切换到英文';
    els.language.setAttribute('aria-label', els.language.title);
  }
  if (els.minimize) {
    els.minimize.title = copy.buttons.minimize;
    els.minimize.setAttribute('aria-label', copy.buttons.minimize);
  }
  if (els.close) {
    els.close.title = copy.buttons.close;
    els.close.setAttribute('aria-label', copy.buttons.close);
  }
  renderStaticLabels(els, copy);
  renderTypingStats(els, runtime.typing);
  if (els.spectrogram && plan?.spectrogramUrl) {
    els.spectrogram.src = plan.spectrogramUrl;
    els.spectrogram.hidden = false;
  }
  if (els.trail) {
    els.trail.innerHTML = runtime.events.map(event => (
      `<li data-trail-mood="${escapeHtml(event.mood)}">
        <span>${escapeHtml(displayLabel(event.label, copy))}</span>
        <b>${escapeHtml(event.species)}</b>
      </li>`
    )).join('');
  }
  if (feedback) emitMotion(els, feedback);
}

function renderStaticLabels(els, copy) {
  for (const label of els.statLabels || []) {
    const key = label.dataset.statLabel;
    label.textContent = copy.stats[key] || key;
  }
}

function renderTypingStats(els, typingStats) {
  const summary = summarizeTypingStats(typingStats);
  if (els.totalKeys) els.totalKeys.textContent = formatTypingStat(summary.totalKeys);
  if (els.sessionKeys) els.sessionKeys.textContent = formatTypingStat(summary.sessionKeys);
  if (els.currentKps) els.currentKps.textContent = summary.currentKps.toFixed(1);
}

function applyFacingDirection(direction, runtime, root, els) {
  runtime.facing = direction === 'left' ? 'left' : 'right';
  renderFacingDirection(root, els, runtime.facing);
}

function renderFacingDirection(root, els, direction) {
  root.dataset.facing = direction;
  if (els.birdDirection) {
    els.birdDirection.style.transform = direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)';
  }
}

function applyGlobalStatus(status, runtime, els) {
  runtime.global = {
    enabled: Boolean(status?.enabled),
    available: Boolean(status?.available),
    error: status?.error || ''
  };
  if (els.global) {
    els.global.setAttribute('aria-pressed', String(runtime.global.enabled));
  }
}

function setMotion(root, action, replay) {
  if (!replay) {
    root.dataset.motion = action;
    return;
  }
  delete root.dataset.motion;
  void root.offsetWidth;
  root.dataset.motion = action;
}

function playPlans(plans, audioPool, muted) {
  if (muted) return;
  for (const plan of plans) {
    setTimeout(() => playPlan(plan, audioPool), plan.delay || 0);
  }
}

function playPlan(plan, audioPool) {
  if (!plan?.audioUrl) return;
  const audio = audioPool.next();
  audio.pause();
  audio.src = plan.audioUrl;
  audio.currentTime = 0;
  audio.volume = plan.volume;
  audio.playbackRate = plan.playbackRate;
  audio.play().catch(() => {});
}

function emitMotion(els, feedback) {
  emitPulse(els.pulseField, feedback);
  emitEchoes(els.echoField, feedback.motion?.echoes || 0);
  emitChirps(els.chirpField, feedback.motion?.chirps || 0);
  emitFeathers(els.featherField, feedback.motion?.feathers || 0);
}

function emitPulse(container, feedback) {
  if (!container) return;
  const count = feedback.motion?.pulses ?? Math.max(1, feedback.plans.length);
  for (let index = 0; index < count; index += 1) {
    const pulse = document.createElement('i');
    pulse.style.setProperty('--delay', `${index * 80}ms`);
    pulse.dataset.mood = feedback.mood;
    container.append(pulse);
    setTimeout(() => pulse.remove(), 900 + index * 80);
  }
}

function emitEchoes(container, count) {
  if (!container) return;
  for (let index = 0; index < count; index += 1) {
    const echo = document.createElement('i');
    echo.style.setProperty('--side', index % 2 === 0 ? '-1' : '1');
    echo.style.setProperty('--delay', `${index * 90}ms`);
    container.append(echo);
    setTimeout(() => echo.remove(), 900 + index * 90);
  }
}

function emitFeathers(container, count) {
  if (!container) return;
  for (let index = 0; index < count; index += 1) {
    const feather = document.createElement('i');
    feather.style.setProperty('--x', `${-18 + index * 18}px`);
    feather.style.setProperty('--r', `${-28 + index * 22}deg`);
    feather.style.setProperty('--delay', `${index * 45}ms`);
    container.append(feather);
    setTimeout(() => feather.remove(), 980 + index * 45);
  }
}

function emitChirps(container, count) {
  if (!container) return;
  for (let index = 0; index < count; index += 1) {
    const chirp = document.createElement('i');
    chirp.style.setProperty('--delay', `${index * 70}ms`);
    chirp.style.setProperty('--scale', `${1 + index * 0.16}`);
    container.append(chirp);
    setTimeout(() => chirp.remove(), 720 + index * 70);
  }
}

function createAudioPool(size) {
  const pool = Array.from({ length: size }, () => new Audio());
  let cursor = 0;
  return {
    next() {
      const audio = pool[cursor];
      cursor = (cursor + 1) % pool.length;
      return audio;
    }
  };
}

function readSavedBirdStyle() {
  try {
    return window.localStorage?.getItem('bird-companion-style') || 'natural';
  } catch {
    return 'natural';
  }
}

function saveBirdStyle(style) {
  try {
    window.localStorage?.setItem('bird-companion-style', style);
  } catch {
    // Appearance can remain session-only if storage is unavailable.
  }
}

function readSavedLocale() {
  try {
    return normalizeLocale(window.localStorage?.getItem('bird-companion-locale') || 'en');
  } catch {
    return 'en';
  }
}

function saveLocale(locale) {
  try {
    window.localStorage?.setItem('bird-companion-locale', normalizeLocale(locale));
  } catch {
    // Locale can remain session-only if storage is unavailable.
  }
}

function readSavedTypingStats() {
  try {
    const raw = window.localStorage?.getItem('bird-companion-typing-stats');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveTypingStats(stats) {
  try {
    window.localStorage?.setItem('bird-companion-typing-stats', JSON.stringify({
      totalKeys: stats.totalKeys
    }));
  } catch {
    // Counts stay in memory if storage is unavailable.
  }
}

function feedbackLabelToKeyType(label) {
  if (label === 'erase') return 'erase';
  if (label === 'chorus') return 'chorus';
  if (label === 'rest') return 'rest';
  return 'letter';
}

function displayLabel(label, copy) {
  if (label === 'erase') return copy.keyLabels.erase;
  if (label === 'chorus') return copy.keyLabels.chorus;
  if (label === 'rest') return copy.keyLabels.rest;
  return label;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]));
}
