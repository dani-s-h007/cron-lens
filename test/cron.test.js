import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseCronExpression } from '../src/parser.js';
import { explainCron } from '../src/explainer.js';
import { getNextOccurrences } from '../src/simulator.js';
import { naturalLanguageToCron } from '../src/from-natural.js';

describe('cron-lens', () => {
  describe('parseCronExpression', () => {
    it('parses valid 5-field cron strings and presets', () => {
      const parsed = parseCronExpression('*/15 9-17 * * 1-5');
      assert.equal(parsed.fields.length, 5);
      assert.deepEqual(parsed.fields[0], [0, 15, 30, 45]); // Minutes

      const preset = parseCronExpression('@daily');
      assert.equal(preset.isSpecial, true);
    });

    it('rejects invalid field counts or out of range values', () => {
      assert.throws(() => parseCronExpression('* * *'), /Expected 5 fields/);
      assert.throws(() => parseCronExpression('65 * * * *'), /Range out of bounds|Invalid value/);
    });
  });

  describe('explainCron', () => {
    it('produces fluent English translations', () => {
      assert.ok(explainCron('*/15 * * * *').includes('Every 15 minutes'));
      assert.ok(explainCron('0 0 * * *').includes('12:00 AM'));
      assert.ok(explainCron('30 14 * * 1-5').includes('Monday through Friday'));
    });
  });

  describe('getNextOccurrences', () => {
    it('calculates the next chronological run dates', () => {
      const baseDate = new Date('2026-01-01T00:00:00Z');
      const runs = getNextOccurrences('0 12 * * *', 3, baseDate);
      assert.equal(runs.length, 3);
      assert.ok(runs[0].getTime() > baseDate.getTime());
      assert.equal(runs[0].getHours(), 12);
      assert.equal(runs[0].getMinutes(), 0);
    });
  });

  describe('naturalLanguageToCron', () => {
    it('converts common English phrases to valid cron expressions', () => {
      assert.equal(naturalLanguageToCron('every 10 minutes'), '*/10 * * * *');
      assert.equal(naturalLanguageToCron('every hour'), '0 * * * *');
      assert.equal(naturalLanguageToCron('every weekday at 2:30 pm'), '30 14 * * 1-5');
      assert.equal(naturalLanguageToCron('every day at 4am'), '0 4 * * *');
    });
  });
});

