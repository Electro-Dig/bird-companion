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
import {
  DEFAULT_SETTINGS,
  formatVolume,
  normalizeFeedbackEvery,
  normalizeVolume,
  shouldEmitFeedback
} from './settings.mjs';

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

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
    sound: readSavedSoundSettings(),
    statsOpen: false,
    infoPanel: '',
    selectedDate: '',
    feedbackKeyCount: 0,
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
    birdStage: root.querySelector('[data-bird-stage]'),
    keyBadgeLabel: root.querySelector('[data-key-badge-label]'),
    totalKeysBadge: root.querySelector('[data-total-keys-badge]'),
    statsToggle: root.querySelector('[data-stats-toggle]'),
    statsPopover: root.querySelector('[data-stats-popover]'),
    todayKeys: root.querySelector('[data-today-keys]'),
    totalKeys: root.querySelector('[data-total-keys]'),
    sessionKeys: root.querySelector('[data-session-keys]'),
    currentKps: root.querySelector('[data-current-kps]'),
    statLabels: Array.from(root.querySelectorAll('[data-stat-label]')),
    datePrev: root.querySelector('[data-date-prev]'),
    dateNext: root.querySelector('[data-date-next]'),
    currentDate: root.querySelector('[data-current-date]'),
    keyGrid: root.querySelector('[data-key-grid]'),
    topKeys: root.querySelector('[data-top-keys]'),
    rateOptions: Array.from(root.querySelectorAll('[data-rate-option]')),
    volumeRange: root.querySelector('[data-volume-range]'),
    volumeValue: root.querySelector('[data-volume-value]'),
    mute: root.querySelector('[data-mute]'),
    global: root.querySelector('[data-global]'),
    language: root.querySelector('[data-language]'),
    support: root.querySelector('[data-support]'),
    help: root.querySelector('[data-help]'),
    guideTitle: root.querySelector('[data-guide-title]'),
    guideLines: Array.from(root.querySelectorAll('[data-guide-line]')),
    guideNote: root.querySelector('[data-guide-note]'),
    supportTitle: root.querySelector('[data-support-title]'),
    supportCopy: root.querySelector('[data-support-copy]'),
    minimize: root.querySelector('[data-minimize]'),
    close: root.querySelector('[data-close]')
  };

  if (els.callIndex) els.callIndex.textContent = `${samples.length} calls`;
  render(root, els, runtime);

  root.addEventListener('pointerdown', () => root.focus());
  root.addEventListener('pointerenter', () => {
    root.dataset.panelOpen = 'true';
  });
  root.addEventListener('pointerleave', () => {
    delete root.dataset.panelOpen;
  });
  root.addEventListener('keydown', event => {
    if (runtime.global.enabled) return;
    if (handleFeedbackKey(event.key, performance.now(), runtime, samples, dataBaseUrl, audioPool, els, root)) {
      event.preventDefault();
    }
  });

  window.birdCompanionShell?.getGlobalStatus?.().then(async status => {
    applyGlobalStatus(status, runtime, els);
    if (!runtime.global.enabled) {
      await enableGlobalListening(runtime, els);
    }
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
  els.help?.addEventListener('click', () => {
    runtime.infoPanel = runtime.infoPanel === 'guide' ? '' : 'guide';
    runtime.statsOpen = false;
    render(root, els, runtime);
    root.focus();
  });
  els.support?.addEventListener('click', () => {
    runtime.infoPanel = runtime.infoPanel === 'support' ? '' : 'support';
    runtime.statsOpen = false;
    render(root, els, runtime);
    root.focus();
  });
  els.statsToggle?.addEventListener('click', event => {
    event.stopPropagation();
    runtime.statsOpen = !runtime.statsOpen;
    runtime.infoPanel = '';
    render(root, els, runtime);
    root.focus();
  });
  els.datePrev?.addEventListener('click', () => {
    runtime.selectedDate = adjacentStatsDate(runtime.typing, runtime.selectedDate, 1);
    render(root, els, runtime);
    root.focus();
  });
  els.dateNext?.addEventListener('click', () => {
    runtime.selectedDate = adjacentStatsDate(runtime.typing, runtime.selectedDate, -1);
    render(root, els, runtime);
    root.focus();
  });
  for (const option of els.rateOptions || []) {
    option.addEventListener('click', () => {
      runtime.sound = {
        ...runtime.sound,
        feedbackEvery: normalizeFeedbackEvery(option.dataset.rateOption)
      };
      saveSoundSettings(runtime.sound);
      render(root, els, runtime);
      root.focus();
    });
  }
  els.volumeRange?.addEventListener('input', () => {
    runtime.sound = {
      ...runtime.sound,
      volume: normalizeVolume(Number(els.volumeRange.value) / 100)
    };
    saveSoundSettings(runtime.sound);
    render(root, els, runtime);
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
      volume: runtime.sound.volume
    });

    if (!feedback.handled) return false;

    runtime.state = feedback.nextState;
    runtime.feedbackKeyCount += 1;
    runtime.typing = recordTypingEvent(runtime.typing, {
      keyType: feedbackLabelToKeyType(feedback.label),
      key,
      timestamp: Date.now(),
      now
    });
    saveTypingStats(runtime.typing);

    if (!shouldEmitFeedback(runtime.feedbackKeyCount, runtime.sound.feedbackEvery)) {
      render(root, els, runtime);
      return true;
    }

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
  root.dataset.statsOpen = String(runtime.statsOpen);
  root.dataset.guideOpen = String(runtime.infoPanel === 'guide');
  root.dataset.supportOpen = String(runtime.infoPanel === 'support');
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
    els.language.title = runtime.locale === 'en' ? 'Switch to Chinese' : 'Switch to English';
    els.language.setAttribute('aria-label', els.language.title);
  }
  if (els.help) {
    els.help.title = copy.buttons.help;
    els.help.setAttribute('aria-label', copy.buttons.help);
    els.help.setAttribute('aria-pressed', String(runtime.infoPanel === 'guide'));
  }
  if (els.support) {
    els.support.title = copy.buttons.support;
    els.support.setAttribute('aria-label', copy.buttons.support);
    els.support.setAttribute('aria-pressed', String(runtime.infoPanel === 'support'));
  }
  if (els.statsToggle) {
    els.statsToggle.setAttribute('aria-expanded', String(runtime.statsOpen));
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
  renderInfoPanels(els, copy);
  renderTypingStats(els, runtime.typing, copy, runtime);
  renderSoundSettings(els, runtime.sound, copy);
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

function renderInfoPanels(els, copy) {
  if (els.guideTitle) els.guideTitle.textContent = copy.guide.title;
  for (const line of els.guideLines || []) {
    const key = line.dataset.guideLine;
    line.textContent = copy.guide.lines[key] || key;
  }
  if (els.guideNote) els.guideNote.textContent = copy.guide.note;
  if (els.supportTitle) els.supportTitle.textContent = copy.support.title;
  if (els.supportCopy) els.supportCopy.textContent = copy.support.copy;
}

function renderTypingStats(els, typingStats, copy, runtime) {
  const summary = summarizeTypingStats(typingStats, { date: runtime.selectedDate });
  runtime.selectedDate = summary.selectedDate;
  if (els.keyBadgeLabel) els.keyBadgeLabel.textContent = copy.stats.keys;
  if (els.totalKeysBadge) els.totalKeysBadge.textContent = formatTypingStat(summary.totalKeys);
  if (els.totalKeys) els.totalKeys.textContent = formatTypingStat(summary.totalKeys);
  if (els.todayKeys) els.todayKeys.textContent = formatTypingStat(summary.todayKeys);
  if (els.sessionKeys) els.sessionKeys.textContent = formatTypingStat(summary.sessionKeys);
  if (els.currentKps) els.currentKps.textContent = summary.currentKps.toFixed(1);
  if (els.currentDate) {
    els.currentDate.textContent = summary.selectedDate === todayKey() ? copy.stats.today : summary.selectedDate.slice(5);
  }
  if (els.datePrev) els.datePrev.disabled = summary.availableDates.length <= 1;
  if (els.dateNext) els.dateNext.disabled = summary.availableDates.length <= 1;
  renderKeyGrid(els.keyGrid, summary.selectedKeyCounts);
  renderTopKeys(els.topKeys, summary.selectedTopKeys, copy);
}

async function enableGlobalListening(runtime, els) {
  if (!window.birdCompanionShell?.setGlobalListening) return;
  if (els.global) els.global.disabled = true;
  try {
    const status = await window.birdCompanionShell.setGlobalListening(true);
    applyGlobalStatus(status || { enabled: false, available: false, error: 'Global hook unavailable' }, runtime, els);
  } catch (error) {
    applyGlobalStatus({
      enabled: false,
      available: false,
      error: error?.message || String(error)
    }, runtime, els);
  } finally {
    if (els.global) els.global.disabled = false;
  }
}

function renderSoundSettings(els, sound, copy) {
  const feedbackEvery = normalizeFeedbackEvery(sound.feedbackEvery);
  const volume = normalizeVolume(sound.volume);
  for (const option of els.rateOptions || []) {
    const active = normalizeFeedbackEvery(option.dataset.rateOption) === feedbackEvery;
    option.setAttribute('aria-pressed', String(active));
    option.title = runtimeTitle(copy.settings.rate, option.dataset.rateOption);
  }
  if (els.volumeRange) els.volumeRange.value = String(Math.round(volume * 100));
  if (els.volumeValue) els.volumeValue.textContent = formatVolume(volume);
}

function renderKeyGrid(container, keyCounts = {}) {
  if (!container) return;
  const max = Math.max(1, ...Object.values(keyCounts).map(value => Number(value) || 0));
  container.innerHTML = KEYBOARD_ROWS.map(row => (
    `<div class="key-row">
      ${row.map(key => {
        const count = keyCounts[key] || 0;
        const heat = count / max;
        return `<span class="key-cell" data-empty="${count === 0}" style="--heat:${heat.toFixed(3)}" title="${key}: ${count}">
          <b>${key}</b><i>${count ? formatTypingStat(count) : ''}</i>
        </span>`;
      }).join('')}
    </div>`
  )).join('');
}

function renderTopKeys(container, topKeys = [], copy) {
  if (!container) return;
  if (!topKeys.length) {
    container.innerHTML = `<li><span>${escapeHtml(copy.stats.noData)}</span><b>0</b></li>`;
    return;
  }
  container.innerHTML = topKeys.slice(0, 4).map(item => (
    `<li><span>${escapeHtml(item.key)}</span><b>${formatTypingStat(item.count)}</b></li>`
  )).join('');
}

function adjacentStatsDate(typingStats, selectedDate, offset) {
  const summary = summarizeTypingStats(typingStats, { date: selectedDate });
  const dates = summary.availableDates.length ? summary.availableDates : [summary.selectedDate];
  const current = dates.indexOf(summary.selectedDate);
  const index = current < 0 ? 0 : current;
  return dates[Math.max(0, Math.min(dates.length - 1, index + offset))] || summary.selectedDate;
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

function readSavedSoundSettings() {
  try {
    const raw = window.localStorage?.getItem('bird-companion-sound-settings');
    const saved = raw ? JSON.parse(raw) : {};
    return {
      feedbackEvery: normalizeFeedbackEvery(saved.feedbackEvery ?? DEFAULT_SETTINGS.feedbackEvery),
      volume: normalizeVolume(saved.volume ?? DEFAULT_SETTINGS.volume)
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSoundSettings(settings) {
  try {
    window.localStorage?.setItem('bird-companion-sound-settings', JSON.stringify({
      feedbackEvery: normalizeFeedbackEvery(settings.feedbackEvery),
      volume: normalizeVolume(settings.volume)
    }));
  } catch {
    // Sound settings can remain session-only if storage is unavailable.
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
      totalKeys: stats.totalKeys,
      keyCounts: stats.keyCounts,
      dailyTotals: stats.dailyTotals,
      dailyKeyCounts: stats.dailyKeyCounts
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

function runtimeTitle(label, value) {
  return `${label}: ${value}`;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
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
