const DEFAULT_DIRECTION = 'right';

export function normalizeFacingDirection(direction = DEFAULT_DIRECTION) {
  return direction === 'left' || direction === 'right' ? direction : DEFAULT_DIRECTION;
}

export function chooseFacingDirection({ windowBounds, workArea } = {}) {
  if (!windowBounds || !workArea) return DEFAULT_DIRECTION;
  const windowCenter = windowBounds.x + windowBounds.width / 2;
  const screenCenter = workArea.x + workArea.width / 2;
  return windowCenter < screenCenter ? 'right' : 'left';
}
