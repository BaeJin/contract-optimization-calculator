const isInvalidNumber = (value) => !Number.isFinite(value) || Number.isNaN(value);

export const fmt = (value) => {
  if (isInvalidNumber(value)) return '-';
  if (Math.abs(value) >= 10000) return `${(value / 10000).toFixed(1)}억`;
  return `${Math.round(value).toLocaleString()}만`;
};

export const fmt1 = (value) => {
  if (isInvalidNumber(value)) return '-';
  if (Math.abs(value) >= 10000) return `${(value / 10000).toFixed(1)}억`;
  return `${value.toFixed(1)}`;
};

export const fmtN = (value) => {
  if (isInvalidNumber(value)) return '-';
  return Math.round(value).toLocaleString();
};

export const fmtR = (value) => {
  if (isInvalidNumber(value)) return '-';
  return `${value.toFixed(1)}배`;
};
