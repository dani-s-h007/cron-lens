/**
 * cron-lens: Natural Language Explainer
 */

import { parseCronExpression } from './parser.js';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function explainCron(expression) {
  const { rawParts } = parseCronExpression(expression);
  const [minPart, hourPart, domPart, monthPart, dowPart] = rawParts;

  const descParts = [];

  // 1. Minute & Hour
  if (minPart === '*' && hourPart === '*') {
    descParts.push('Every minute');
  } else if (minPart.startsWith('*/') && hourPart === '*') {
    descParts.push(`Every ${minPart.slice(2)} minutes`);
  } else if (minPart === '0' && hourPart === '*') {
    descParts.push('Every hour, on the hour');
  } else if (minPart === '0' && hourPart.startsWith('*/')) {
    descParts.push(`Every ${hourPart.slice(2)} hours`);
  } else if (minPart !== '*' && hourPart !== '*') {
    const minPadded = minPart.padStart(2, '0');
    const hourNum = parseInt(hourPart, 10);
    if (!isNaN(hourNum)) {
      const ampm = hourNum >= 12 ? 'PM' : 'AM';
      const hour12 = hourNum % 12 || 12;
      descParts.push(`At ${hour12}:${minPadded} ${ampm}`);
    } else {
      descParts.push(`At minute ${minPart} of hour ${hourPart}`);
    }
  } else if (hourPart === '*') {
    descParts.push(`At minute ${minPart} of every hour`);
  }

  // 2. Day of Month
  if (domPart !== '*') {
    descParts.push(`on day ${domPart} of the month`);
  }

  // 3. Month
  if (monthPart !== '*') {
    const monthNum = parseInt(monthPart, 10);
    if (!isNaN(monthNum) && MONTHS[monthNum]) {
      descParts.push(`in ${MONTHS[monthNum]}`);
    } else {
      descParts.push(`in month ${monthPart}`);
    }
  }

  // 4. Day of Week
  if (dowPart !== '*') {
    if (dowPart === '1-5') {
      descParts.push('Monday through Friday');
    } else if (dowPart === '0,6' || dowPart === '6,0') {
      descParts.push('on weekends (Saturday & Sunday)');
    } else {
      const dowNum = parseInt(dowPart, 10);
      if (!isNaN(dowNum) && DAYS_OF_WEEK[dowNum % 7]) {
        descParts.push(`only on ${DAYS_OF_WEEK[dowNum % 7]}`);
      } else {
        descParts.push(`on day-of-week ${dowPart}`);
      }
    }
  }

  if (domPart === '*' && dowPart === '*' && monthPart === '*' && descParts.length === 1 && !descParts[0].includes('Every minute')) {
    descParts.push('every day');
  }

  return descParts.join(', ');
}

