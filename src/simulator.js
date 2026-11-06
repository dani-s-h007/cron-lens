/**
 * cron-lens: Next Run Schedule Simulator
 */

import { parseCronExpression } from './parser.js';

/**
 * Calculates the next N occurrence dates for a cron expression
 * @param {string} expression
 * @param {number} [count=5]
 * @param {Date} [startDate=new Date()]
 * @returns {Date[]}
 */
export function getNextOccurrences(expression, count = 5, startDate = new Date()) {
  const { fields } = parseCronExpression(expression);
  const [minutes, hours, daysOfMonth, months, daysOfWeek] = fields;

  const matches = [];
  // Start from the next minute boundary (drop seconds & ms)
  const cursor = new Date(startDate.getTime());
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);

  // Search forward minute by minute (capped to 5 years max to prevent infinite loops)
  const maxIterations = 5 * 365 * 24 * 60;
  let iterations = 0;

  while (matches.length < count && iterations < maxIterations) {
    iterations++;

    const m = cursor.getMinutes();
    const h = cursor.getHours();
    const dom = cursor.getDate();
    const mon = cursor.getMonth() + 1; // 1-12
    const dow = cursor.getDay(); // 0-6

    if (
      months.includes(mon) &&
      daysOfMonth.includes(dom) &&
      daysOfWeek.includes(dow) &&
      hours.includes(h) &&
      minutes.includes(m)
    ) {
      matches.push(new Date(cursor.getTime()));
    }

    cursor.setMinutes(cursor.getMinutes() + 1);
  }

  return matches;
}

/**
 * Formats a date into a specific IANA timezone string
 * @param {Date} date
 * @param {string} [timeZone='UTC']
 * @returns {string}
 */
export function formatDateInTimezone(date, timeZone = 'UTC') {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    }).format(date);
  } catch {
    return date.toISOString() + ` (${timeZone})`;
  }
}

