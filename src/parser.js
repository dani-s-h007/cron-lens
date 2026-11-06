/**
 * cron-lens: Cron Parser & Validator
 */

const PRESETS = {
  '@yearly': '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly': '0 * * * *'
};

const FIELD_LIMITS = [
  { name: 'minute', min: 0, max: 59 },
  { name: 'hour', min: 0, max: 23 },
  { name: 'dayOfMonth', min: 1, max: 31 },
  { name: 'month', min: 1, max: 12 },
  { name: 'dayOfWeek', min: 0, max: 7 } // 0 or 7 = Sunday
];

const MONTH_NAMES = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
};

const DOW_NAMES = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6
};

/**
 * Parses and validates a cron expression string
 * @param {string} expression
 * @returns {{ fields: number[][], rawParts: string[], isSpecial: boolean }}
 */
export function parseCronExpression(expression) {
  if (!expression || typeof expression !== 'string') {
    throw new Error('Cron expression must be a non-empty string');
  }

  const trimmed = expression.trim();
  const normalized = PRESETS[trimmed.toLowerCase()] || trimmed;

  const parts = normalized.split(/\s+/);
  if (parts.length !== 5) {
    throw new Error(`Invalid cron format: Expected 5 fields (minute, hour, day, month, dow), but got ${parts.length}`);
  }

  const fields = parts.map((part, index) => {
    const limit = FIELD_LIMITS[index];
    return parseField(part, limit.min, limit.max, index);
  });

  return {
    fields,
    rawParts: parts,
    isSpecial: Boolean(PRESETS[trimmed.toLowerCase()])
  };
}

function parseField(fieldStr, min, max, fieldIndex) {
  let str = fieldStr.toLowerCase();

  // Replace names in month and day-of-week
  if (fieldIndex === 3) {
    for (const [name, num] of Object.entries(MONTH_NAMES)) {
      str = str.replace(new RegExp(name, 'g'), String(num));
    }
  } else if (fieldIndex === 4) {
    for (const [name, num] of Object.entries(DOW_NAMES)) {
      str = str.replace(new RegExp(name, 'g'), String(num));
    }
  }

  const values = new Set();
  const listParts = str.split(',');

  for (const item of listParts) {
    if (item === '*') {
      for (let i = min; i <= max; i++) values.add(i);
      continue;
    }

    // Step values: */15 or 1-30/5
    const stepMatch = item.match(/^(\*|\d+-\d+|\d+)\/(\d+)$/);
    if (stepMatch) {
      const step = parseInt(stepMatch[2], 10);
      if (step <= 0) throw new Error(`Invalid step value in "${item}"`);

      let start = min;
      let end = max;
      if (stepMatch[1] !== '*') {
        if (stepMatch[1].includes('-')) {
          const [s, e] = stepMatch[1].split('-').map(Number);
          start = s;
          end = e;
        } else {
          start = parseInt(stepMatch[1], 10);
        }
      }

      for (let i = start; i <= end; i += step) {
        values.add(i);
      }
      continue;
    }

    // Range: 1-5
    const rangeMatch = item.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);
      if (start > end || start < min || end > max) {
        throw new Error(`Range out of bounds: "${item}" (allowed: ${min}-${max})`);
      }
      for (let i = start; i <= end; i++) values.add(i);
      continue;
    }

    // Single number
    const single = parseInt(item, 10);
    if (isNaN(single) || single < min || single > max) {
      throw new Error(`Invalid value: "${item}" in field (allowed: ${min}-${max})`);
    }
    // Normalize 7 (Sunday) to 0
    values.add(fieldIndex === 4 && single === 7 ? 0 : single);
  }

  return Array.from(values).sort((a, b) => a - b);
}

