export const RISK_COLORS = {
  green: '#22c55e',
  yellow: '#eab308',
  orange: '#f97316',
  red: '#ef4444',
};

export const RISK_OPACITY = {
  green: 0.4,
  yellow: 0.45,
  orange: 0.55,
  red: 0.65,
};

export function getLabelForScore(score) {
  if (score <= 30) return 'green';
  if (score <= 55) return 'yellow';
  if (score <= 80) return 'orange';
  return 'red';
}

export function getColorForScore(score) {
  return RISK_COLORS[getLabelForScore(score)];
}

export function getOpacityForScore(score) {
  return RISK_OPACITY[getLabelForScore(score)];
}
