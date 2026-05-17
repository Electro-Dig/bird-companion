import assert from 'node:assert/strict';
import {
  DEFAULT_LOCALE,
  getCopy,
  normalizeLocale,
  nextLocale
} from '../src/renderer/i18n.mjs';

{
  assert.equal(DEFAULT_LOCALE, 'en');
  assert.equal(normalizeLocale(), 'en');
  assert.equal(normalizeLocale('en'), 'en');
  assert.equal(normalizeLocale('zh'), 'zh');
  assert.equal(normalizeLocale('zh-CN'), 'zh');
  assert.equal(normalizeLocale('unknown'), 'en');
}

{
  assert.equal(nextLocale('en'), 'zh');
  assert.equal(nextLocale('zh'), 'en');
  assert.equal(nextLocale('unknown'), 'zh');
}

{
  assert.equal(getCopy('en').buttons.language, '中');
  assert.equal(getCopy('zh').buttons.language, 'EN');
  assert.equal(getCopy('en').moods.idle, 'Idle branch');
  assert.equal(getCopy('zh').moods.idle, '安静枝头');
  assert.equal(getCopy('unknown').stats.keys, 'keys');
  assert.equal(getCopy('zh').settings.rate, '频');
  assert.equal(getCopy('zh').settings.volume, '音');
}

console.log('i18n tests passed');
