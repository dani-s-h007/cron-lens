# cron-lens ⏰

[![CI](https://github.com/dani-s-h007/cron-lens/actions/workflows/ci.yml/badge.svg)](https://github.com/dani-s-h007/cron-lens/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-success.svg)](package.json)

> **Cron expression engine, natural language explainer & multi-timezone schedule simulator.**

Misconfigured cron schedules lead to midnight outages, runaway batch loops, and timezone confusion. Reviewing `0 2 15 * 1-5` during code reviews is fraught with ambiguity. `cron-lens` translates cron expressions into clear English, generates cron syntax from natural phrases, and simulates the exact future run timestamps across multiple international timezones.

---

## ✨ Features

- **Fluent English Explanations**: Translates 5-field expressions and aliases (`@daily`, `@weekly`, `@monthly`) into clear natural language.
- **Natural Language Compiler (`--from`)**: Generates cron strings from conversational prompts (`--from "every weekday at 2:30 pm"` -> `30 14 * * 1-5`).
- **Multi-Timezone Simulator**: Visualizes exact future run timestamps across UTC, America/New_York, Europe/London, Asia/Kolkata, or your local system timezone.
- **POSIX & Alias Compliance**: Full support for step values (`*/15`), ranges (`1-5`), lists (`1,15,30`), and named months/days (`MON-FRI`, `JAN-DEC`).
- **Zero Runtime Dependencies**: Ultra-fast execution with zero third-party dependencies.

---

## 🚀 Installation

```bash
# Run on-demand with npx
npx cron-lens --help

# Or install globally
npm install -g cron-lens
```

---

## 🛠️ CLI Usage

### Explain an Expression
```bash
# Inspect schedule and upcoming runs:
cron-lens "*/15 9-17 * * 1-5"
```

### Preview Across Multiple Timezones
```bash
# Check upcoming executions in UTC, New York, and Tokyo:
cron-lens "0 4 * * *" --tz UTC --tz America/New_York --tz Asia/Tokyo
```

### Compile from English
```bash
# Convert English to cron:
cron-lens --from "every 15 minutes"
cron-lens --from "every weekday at 2:30 pm"
```

### JSON Output
```bash
cron-lens "0 0 * * 0" --json
```

---

## 💻 Programmatic TypeScript API

```typescript
import { explainCron, getNextOccurrences, naturalLanguageToCron } from 'cron-lens';

console.log(explainCron('*/30 8-18 * * 1-5'));
// => Every 30 minutes, At minute */30 of hour 8-18, Monday through Friday

const nextDates = getNextOccurrences('0 12 * * *', 3);
console.log(nextDates);

const cron = naturalLanguageToCron('every weekday at 9am');
console.log(cron); // => 0 9 * * 1-5
```

---

## 🧪 Testing

```bash
npm test
```

---

## 📄 License

MIT © Essentials Toolkit Authors

