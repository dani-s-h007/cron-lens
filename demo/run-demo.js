#!/usr/bin/env node
/**
 * cron-lens: Interactive Live Demo
 */

import { explainCron } from '../src/explainer.js';
import { getNextOccurrences, formatDateInTimezone } from '../src/simulator.js';
import { naturalLanguageToCron } from '../src/from-natural.js';

console.log('\n🚀 Starting cron-lens Interactive Demo...\n');

const prompt = 'every weekday at 2:30 pm';
console.log(`1. Compiling English prompt to Cron: "${prompt}"`);
const cron = naturalLanguageToCron(prompt);
console.log(`   Generated Cron: \x1b[32m\x1b[1m${cron}\x1b[0m`);
console.log(`   Explanation:    ${explainCron(cron)}\n`);

console.log(`2. Simulating Next 3 Executions in UTC and America/New_York:`);
console.log('------------------------------------------------------------');
const nextRuns = getNextOccurrences(cron, 3);
for (let i = 0; i < nextRuns.length; i++) {
  const d = nextRuns[i];
  console.log(`Run #${i + 1}:`);
  console.log(`  └─ UTC:      ${formatDateInTimezone(d, 'UTC')}`);
  console.log(`  └─ New York: ${formatDateInTimezone(d, 'America/New_York')}`);
}
console.log('------------------------------------------------------------');
console.log('🎉 Demo completed successfully!\n');

