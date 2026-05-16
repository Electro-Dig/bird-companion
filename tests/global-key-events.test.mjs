import assert from 'node:assert/strict';
import {
  createGlobalKeyTranslator,
  resolveUiohookKeyCodes
} from '../global-key-events.mjs';

const fakeUiohookKeys = {
  A: 30,
  B: 48,
  Z: 44,
  Space: 57,
  Enter: 28,
  Backspace: 14
};

{
  const keyCodes = resolveUiohookKeyCodes(fakeUiohookKeys);
  assert.equal(keyCodes.letters.get(30), 'a');
  assert.equal(keyCodes.letters.get(48), 'b');
  assert.equal(keyCodes.letters.get(44), 'z');
  assert.equal(keyCodes.space, 57);
  assert.equal(keyCodes.enter, 28);
  assert.equal(keyCodes.backspace, 14);
}

{
  const translate = createGlobalKeyTranslator(fakeUiohookKeys);
  assert.equal(translate({ keycode: 30 }), 'a');
  assert.equal(translate({ keycode: 30, shiftKey: true }), 'a');
  assert.equal(translate({ keycode: 57 }), ' ');
  assert.equal(translate({ keycode: 28 }), 'Enter');
  assert.equal(translate({ keycode: 14 }), 'Backspace');
}

{
  const translate = createGlobalKeyTranslator(fakeUiohookKeys, { anonymousLetters: true });
  assert.equal(translate({ keycode: 30 }), 'a');
  assert.equal(translate({ keycode: 48 }), 'a');
  assert.equal(translate({ keycode: 44 }), 'a');
  assert.equal(translate({ keycode: 57 }), ' ');
}

{
  const translate = createGlobalKeyTranslator(fakeUiohookKeys);
  assert.equal(translate({ keycode: 30, ctrlKey: true }), null);
  assert.equal(translate({ keycode: 30, metaKey: true }), null);
  assert.equal(translate({ keycode: 30, altKey: true }), null);
  assert.equal(translate({ keycode: 999 }), null);
}

console.log('global-key-events tests passed');
