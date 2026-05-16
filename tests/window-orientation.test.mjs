import assert from 'node:assert/strict';
import {
  chooseFacingDirection,
  normalizeFacingDirection
} from '../window-orientation.mjs';

{
  assert.equal(normalizeFacingDirection(), 'right');
  assert.equal(normalizeFacingDirection('right'), 'right');
  assert.equal(normalizeFacingDirection('left'), 'left');
  assert.equal(normalizeFacingDirection('up'), 'right');
}

{
  assert.equal(chooseFacingDirection({ windowBounds: { x: 20, width: 282 }, workArea: { x: 0, width: 1920 } }), 'right');
  assert.equal(chooseFacingDirection({ windowBounds: { x: 1500, width: 282 }, workArea: { x: 0, width: 1920 } }), 'left');
  assert.equal(chooseFacingDirection({ windowBounds: { x: -1800, width: 282 }, workArea: { x: -1920, width: 1920 } }), 'right');
  assert.equal(chooseFacingDirection({ windowBounds: { x: -240, width: 282 }, workArea: { x: -1920, width: 1920 } }), 'left');
}

console.log('window-orientation tests passed');
