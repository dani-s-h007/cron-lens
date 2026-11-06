/**
 * cron-lens: Natural Language to Cron Compiler
 */

export function naturalLanguageToCron(phrase) {
  if (!phrase) throw new Error('Input phrase cannot be empty');
  const lower = phrase.trim().toLowerCase();

  if (lower === 'every minute' || lower === 'once a minute') return '* * * * *';
  if (lower === 'every hour' || lower === 'hourly') return '0 * * * *';
  if (lower === 'every day' || lower === 'daily' || lower === 'every midnight') return '0 0 * * *';
  if (lower === 'every noon') return '0 12 * * *';
  if (lower === 'every week' || lower === 'weekly') return '0 0 * * 0';
  if (lower === 'every month' || lower === 'monthly') return '0 0 1 * *';
  if (lower === 'every year' || lower === 'yearly') return '0 0 1 1 *';

  // "every X minutes"
  const minMatch = lower.match(/every\s+(\d+)\s+(?:min|minute|minutes)/);
  if (minMatch) {
    return `*/${minMatch[1]} * * * *`;
  }

  // "every X hours"
  const hourMatch = lower.match(/every\s+(\d+)\s+(?:hour|hours)/);
  if (hourMatch) {
    return `0 */${hourMatch[1]} * * *`;
  }

  // "every weekday at 2:30 pm"
  const weekdayTimeMatch = lower.match(/every\s+weekday\s+at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (weekdayTimeMatch) {
    let h = parseInt(weekdayTimeMatch[1], 10);
    const m = parseInt(weekdayTimeMatch[2] || '0', 10);
    const meridian = weekdayTimeMatch[3];
    if (meridian === 'pm' && h < 12) h += 12;
    if (meridian === 'am' && h === 12) h = 0;
    return `${m} ${h} * * 1-5`;
  }

  // "every day at 4am"
  const dailyTimeMatch = lower.match(/(?:every\s+day|daily)\s+at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (dailyTimeMatch) {
    let h = parseInt(dailyTimeMatch[1], 10);
    const m = parseInt(dailyTimeMatch[2] || '0', 10);
    const meridian = dailyTimeMatch[3];
    if (meridian === 'pm' && h < 12) h += 12;
    if (meridian === 'am' && h === 12) h = 0;
    return `${m} ${h} * * *`;
  }

  throw new Error(`Could not automatically compile phrase to cron: "${phrase}". Try specifying specific times like "every 15 minutes" or "every weekday at 2:30 pm".`);
}

