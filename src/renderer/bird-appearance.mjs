export const BIRD_STYLES = [
  {
    id: 'natural',
    label: 'Natural Kawaii',
    asset: 'bird-mark.svg',
    button: 'N',
    rigged: true
  }
];

const DEFAULT_STYLE = BIRD_STYLES[0].id;

export function normalizeBirdStyle(style = DEFAULT_STYLE) {
  return BIRD_STYLES.some(candidate => candidate.id === style)
    ? style
    : DEFAULT_STYLE;
}

export function createInitialAppearanceState(savedStyle = DEFAULT_STYLE) {
  return {
    style: normalizeBirdStyle(savedStyle),
    blinkSerial: 0
  };
}

export function getBirdStyle(style = DEFAULT_STYLE) {
  const normalized = normalizeBirdStyle(style);
  return BIRD_STYLES.find(candidate => candidate.id === normalized) || BIRD_STYLES[0];
}

export function nextBirdStyle(currentStyle = DEFAULT_STYLE) {
  const current = normalizeBirdStyle(currentStyle);
  const index = BIRD_STYLES.findIndex(style => style.id === current);
  return BIRD_STYLES[(index + 1) % BIRD_STYLES.length].id;
}
