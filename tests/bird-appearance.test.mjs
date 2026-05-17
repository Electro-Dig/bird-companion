import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BIRD_STYLES,
  createInitialAppearanceState,
  getBirdStyle,
  nextBirdStyle,
  normalizeBirdStyle
} from '../src/renderer/bird-appearance.mjs';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rendererRoot = resolve(projectRoot, 'src', 'renderer');

{
  assert.deepEqual(BIRD_STYLES.map(style => style.id), ['natural']);
  assert.equal(BIRD_STYLES.every(style => style.asset.endsWith('.svg')), true);
  assert.equal(BIRD_STYLES.every(style => style.button.length === 1), true);
  assert.equal(BIRD_STYLES.every(style => existsSync(resolve(rendererRoot, style.asset))), true);
}

{
  assert.equal(normalizeBirdStyle(), 'natural');
  assert.equal(normalizeBirdStyle('natural'), 'natural');
  assert.equal(normalizeBirdStyle('pixel'), 'natural');
  assert.equal(normalizeBirdStyle('origami'), 'natural');
  assert.equal(normalizeBirdStyle('window'), 'natural');
  assert.equal(normalizeBirdStyle('unknown'), 'natural');
}

{
  assert.equal(nextBirdStyle('natural'), 'natural');
  assert.equal(nextBirdStyle('pixel'), 'natural');
  assert.equal(nextBirdStyle('origami'), 'natural');
  assert.equal(nextBirdStyle('window'), 'natural');
  assert.equal(nextBirdStyle('unknown'), 'natural');
}

{
  const state = createInitialAppearanceState('window');
  assert.equal(state.style, 'natural');
  assert.equal(state.blinkSerial, 0);
  assert.equal(getBirdStyle(state.style).asset, 'bird-mark.svg');
  assert.equal(getBirdStyle('origami').asset, 'bird-mark.svg');
  assert.equal(getBirdStyle('window').asset, 'bird-mark.svg');
  assert.match(getBirdStyle('natural').label, /Natural/);
  assert.equal(getBirdStyle('natural').rigged, true);
  assert.equal(getBirdStyle('pixel').rigged, true);
}

console.log('bird-appearance tests passed');
