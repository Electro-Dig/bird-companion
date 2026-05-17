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
  assert.equal(getCopy('en').stats.today, 'today');
  assert.equal(getCopy('zh').stats.today, '今天');
  assert.equal(getCopy('en').buttons.help, 'Help');
  assert.equal(getCopy('en').buttons.moreInfo, 'More');
  assert.equal(getCopy('en').support.copy, 'If you like this app, you are welcome to support the maker.');
  assert.equal(getCopy('zh').support.title, '给我一杯咖啡');
  assert.equal(getCopy('zh').buttons.moreInfo, '更多');
  assert.equal(getCopy('zh').support.copy, '如果你喜欢这个应用，欢迎支持创作者。');
}

console.log('i18n tests passed');
