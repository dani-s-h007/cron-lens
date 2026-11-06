/**
 * cron-lens: CLI Interface
 */

import { parseArgs } from 'node:util';
import { parseCronExpression } from './parser.js';
import { explainCron } from './explainer.js';
import { getNextOccurrences, formatDateInTimezone } from './simulator.js';
import { naturalLanguageToCron } from './from-natural.js';

export async function runCli(argv = process.argv.slice(2)) {
  const options = {
    help: { type: 'boolean', short: 'h', default: false },
    version: { type: 'boolean', short: 'v', default: false },
    count: { type: 'string', short: 'n', default: '5' },
    tz: { type: 'string', multiple: true },
    from: { type: 'string' },
    json: { type: 'boolean', default: false }
  };

  let parsed;
  try {
    parsed = parseArgs({ args: argv, options, allowPositionals: true });
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }

  const { values, positionals } = parsed;

  if (values.help) {
    printHelp();
    return 0;
  }

  if (values.version) {
    console.log('cron-lens v1.0.0');
    return 0;
  }

  // Case 1: Natural language compilation
  if (values.from) {
    try {
      const expression = naturalLanguageToCron(values.from);
      const explanation = explainCron(expression);
      if (values.json) {
        console.log(JSON.stringify({ input: values.from, expression, explanation }, null, 2));
      } else {
        console.log(`\n Cron Expression: \x1b[32m\x1b[1m${expression}\x1b[0m`);
        console.log(`   English:        ${explanation}\n`);
      }
      return 0;
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  }

  const cronExpr = positionals.join(' ').trim();
  if (!cronExpr) {
    printHelp();
    return 0;
  }

  try {
    parseCronExpression(cronExpr);
  } catch (err) {
    console.error(`Invalid Cron: ${err.message}`);
    process.exit(1);
  }

  const explanation = explainCron(cronExpr);
  const count = parseInt(values.count, 10) || 5;
  const nextRuns = getNextOccurrences(cronExpr, count);
  const timezones = values.tz || ['UTC', Intl.DateTimeFormat().resolvedOptions().timeZone];

  if (values.json) {
    console.log(JSON.stringify({
      expression: cronExpr,
      explanation,
      nextRuns: nextRuns.map((d) => d.toISOString()),
      timezones: Object.fromEntries(timezones.map((tz) => [tz, nextRuns.map((d) => formatDateInTimezone(d, tz))]))
    }, null, 2));
    return 0;
  }

  console.log('\n[cron-lens] Expression Inspector');
  console.log('========================================================================');
  console.log(`Expression: \x1b[32m\x1b[1m${cronExpr}\x1b[0m`);
  console.log(`Meaning:    \x1b[1m${explanation}\x1b[0m\n`);

  console.log(`Next ${count} Scheduled Runs:`);
  for (let i = 0; i < nextRuns.length; i++) {
    const d = nextRuns[i];
    console.log(`  ${i + 1}. ${d.toISOString()}`);
    for (const tz of timezones) {
      console.log(`     └─ [${tz}] ${formatDateInTimezone(d, tz)}`);
    }
  }
  console.log('========================================================================\n');
  return 0;
}

function printHelp() {
  console.log(`
cron-lens - Cron Expression Engine, Explainer & Multi-Timezone Schedule Simulator

USAGE:
  $ cron-lens "<expression>" [flags]
  $ cron-lens --from "<natural language phrase>"

FLAGS:
  -n, --count <num>       Number of future occurrences to simulate (default: 5)
      --tz <timezone>     Timezone to preview (can specify multiple: --tz UTC --tz America/New_York)
      --from <phrase>     Generate cron from natural English (e.g. "every weekday at 2:30 pm")
      --json              Output structured JSON
  -v, --version           Show version
  -h, --help              Show help

EXAMPLES:
  # Explain cron expression and simulate next 5 runs:
  $ cron-lens "*/15 9-17 * * 1-5"

  # Preview schedule in multiple timezones:
  $ cron-lens "0 2 * * *" --tz UTC --tz America/New_York --tz Asia/Tokyo

  # Generate cron from English description:
  $ cron-lens --from "every 10 minutes"
`);
}

