import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const temp = mkdtempSync(join(tmpdir(), 'bombshift-duo-'));
process.env.COOP_LEADERBOARD_FILE = join(temp, 'rankings.json');
const { addCoopResult, cleanName, listCoopResults } = await import('./leaderboard.mjs');

test('normalizes and limits team names', () => {
  assert.equal(cleanName(' <Alex> \n'), 'Alex');
  assert.ok(cleanName('X'.repeat(80)).length <= 22);
});

test('saves best results for the same pair regardless of join order', () => {
  assert.equal(addCoopResult({ level: 'level-111', host: 'Alice', guest: 'Bob', timeMs: 45500 }), true);
  assert.equal(addCoopResult({ level: 'level-111', host: 'bob', guest: 'alice', timeMs: 55500 }), false);
  assert.equal(addCoopResult({ level: 'level-111', host: 'Bob', guest: 'Alice', timeMs: 40500 }), true);
  const entries = listCoopResults('level-111');
  assert.equal(entries.length, 1);
  assert.equal(entries[0].time_ms, 40500);
});

test('separates levels and refuses impossible timestamps', () => {
  assert.equal(addCoopResult({ level: 'level-112', host: 'Claire', guest: 'Dora', timeMs: 500 }), false);
  assert.equal(addCoopResult({ level: 'level-112', host: 'Claire', guest: 'Dora', timeMs: 69500 }), true);
  assert.equal(listCoopResults('level-112').length, 1);
  assert.equal(listCoopResults().length, 2);
});

test.after(() => rmSync(temp, { recursive: true, force: true }));
