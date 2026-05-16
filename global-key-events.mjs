const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

export function resolveUiohookKeyCodes(uiohookKeys = {}) {
  const letters = new Map();
  for (const letter of LETTERS) {
    const value = findKeyCode(uiohookKeys, [letter.toUpperCase(), letter]);
    if (Number.isFinite(value)) letters.set(value, letter);
  }

  return {
    letters,
    space: findKeyCode(uiohookKeys, ['Space', 'SPACE', 'space']),
    enter: findKeyCode(uiohookKeys, ['Enter', 'ENTER', 'Return', 'RETURN']),
    backspace: findKeyCode(uiohookKeys, ['Backspace', 'BACKSPACE'])
  };
}

export function createGlobalKeyTranslator(uiohookKeys = {}, options = {}) {
  const keyCodes = resolveUiohookKeyCodes(uiohookKeys);

  return function translateGlobalKey(event = {}) {
    if (event.ctrlKey || event.altKey || event.metaKey) return null;

    const code = Number(event.keycode);
    if (!Number.isFinite(code)) return null;
    if (keyCodes.letters.has(code)) {
      return options.anonymousLetters ? 'a' : keyCodes.letters.get(code);
    }
    if (code === keyCodes.space) return ' ';
    if (code === keyCodes.enter) return 'Enter';
    if (code === keyCodes.backspace) return 'Backspace';
    return null;
  };
}

function findKeyCode(source, names) {
  for (const name of names) {
    const value = Number(source?.[name]);
    if (Number.isFinite(value)) return value;
  }
  return undefined;
}
