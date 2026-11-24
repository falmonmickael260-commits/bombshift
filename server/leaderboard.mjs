import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const FILE = resolve(process.env.COOP_LEADERBOARD_FILE || './data/coop-leaderboard.json');
const MAX_ROWS = 1000;
const MAX_TIME = 2 * 60 * 60 * 1000;
export function cleanName(value) {
  return String(value || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 22) || 'Joueur';
}
function normalize(value) {
  return cleanName(value).toLocaleLowerCase('fr');
}
export function readLeaderboard() {
  try {
    const data = JSON.parse(readFileSync(FILE, 'utf8'));
    if (Array.isArray(data)) return data.filter(e => e && typeof e.level === 'string' &&
      typeof e.host === 'string' && typeof e.guest === 'string' &&
      Number.isInteger(e.timeMs) && e.timeMs > 0 && e.timeMs <= MAX_TIME).slice(0, MAX_ROWS);
  } catch { /* Empty database on first launch, or corrupt/absent file. */ }
  return [];
}
export function addCoopResult(entry) {
  if (!entry || typeof entry.level !== 'string' || !Number.isInteger(entry.timeMs) ||
      entry.timeMs < 10_000 || entry.timeMs > MAX_TIME) return false;
  const row = { level: entry.level, host: cleanName(entry.host), guest: cleanName(entry.guest),
    timeMs: entry.timeMs, at: new Date().toISOString() };
  const existing = readLeaderboard();
  const key = [normalize(row.host), normalize(row.guest)].sort().join('::');
  const previous = existing.findIndex(e => e.level === row.level &&
    [normalize(e.host), normalize(e.guest)].sort().join('::') === key);
  if (previous !== -1 && existing[previous].timeMs <= row.timeMs) return false;
  if (previous !== -1) existing.splice(previous, 1);
  existing.push(row);
  existing.sort((a, b) => a.timeMs - b.timeMs);
  mkdirSync(dirname(FILE), { recursive: true });
  const temp = FILE + '.tmp';
  writeFileSync(temp, JSON.stringify(existing.slice(0, MAX_ROWS)), 'utf8');
  renameSync(temp, FILE);
  return true;
}
export function listCoopResults(level) {
  return readLeaderboard()
    .filter(e => !level || e.level === level)
    .sort((a, b) => a.timeMs - b.timeMs)
    .slice(0, 10)
    .map((e, i) => ({
      rank: i + 1, level: e.level, host: e.host, guest: e.guest, time_ms: e.timeMs,
    }));
}
