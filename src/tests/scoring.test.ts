import { describe, expect, it } from 'vitest';
import { SCORING } from '../core/constants';
import type { RunStats } from '../core/types';
import { computeScore, emptyStats } from '../gameplay/scoring';
import { getMap } from '../maps';

const def = getMap('volcano');

const stats = (over: Partial<RunStats> = {}): RunStats => ({ ...emptyStats(3), ...over });

describe('score et rangs', () => {
  it('additionne chaque source de points', () => {
    const s = computeScore(
      stats({ kills: 5, bossKills: 1, objectivesDone: 4, secretsFound: 2, timeMs: 60_000, livesLeft: 3 }),
      def,
    );
    expect(s.kills).toBe(5 * SCORING.perKill);
    expect(s.boss).toBe(SCORING.perBoss);
    expect(s.objectives).toBe(4 * SCORING.perObjective);
    expect(s.secrets).toBe(2 * SCORING.perSecret);
    expect(s.time).toBe(SCORING.timeBonusMax);
    expect(s.noDamage).toBe(SCORING.noDamageBonus);
    expect(s.lives).toBe(3 * SCORING.perLifeLeft);
    expect(s.total).toBe(
      s.kills + s.boss + s.objectives + s.secrets + s.time + s.noDamage + s.lives,
    );
  });

  it('retire le bonus "sans degat" des le premier degat', () => {
    const clean = computeScore(stats({ timeMs: 1000 }), def);
    const hurt = computeScore(stats({ timeMs: 1000, damageTaken: 1 }), def);
    expect(clean.noDamage).toBe(SCORING.noDamageBonus);
    expect(hurt.noDamage).toBe(0);
  });

  it('fait decroitre le bonus de temps puis l\'annule', () => {
    const fast = computeScore(stats({ timeMs: def.parTimeMs }), def);
    const mid = computeScore(stats({ timeMs: def.parTimeMs + 120_000 }), def);
    const slow = computeScore(stats({ timeMs: SCORING.timeBonusZeroMs + 1000 }), def);
    expect(fast.time).toBe(SCORING.timeBonusMax);
    expect(mid.time).toBeLessThan(fast.time);
    expect(mid.time).toBeGreaterThan(0);
    expect(slow.time).toBe(0);
  });

  it('attribue un rang croissant et jamais au-dela de SSS', () => {
    const low = computeScore(stats({ timeMs: SCORING.timeBonusZeroMs, livesLeft: 0, damageTaken: 3 }), def);
    expect(low.rank).toBe('C');
    const perfect = computeScore(
      stats({
        kills: 12,
        bossKills: 1,
        objectivesDone: 6,
        secretsFound: 2,
        timeMs: 90_000,
        livesLeft: 3,
      }),
      def,
    );
    expect(perfect.total).toBeGreaterThanOrEqual(def.rankScores.SSS);
    expect(perfect.rank).toBe('SSS');
  });

  it('exige boss + objectifs pour viser les rangs eleves', () => {
    // Detruire des blocs ne rapporte rien directement.
    const blocksOnly = computeScore(
      stats({ blocksDestroyed: 200, timeMs: def.parTimeMs * 2, livesLeft: 1, damageTaken: 2 }),
      def,
    );
    expect(blocksOnly.rank === 'C' || blocksOnly.rank === 'B').toBe(true);
  });

  it('pondere le total par la difficulte choisie', () => {
    const base = stats({ kills: 5, bossKills: 1, objectivesDone: 4, timeMs: 60_000, livesLeft: 3 });
    const normal = computeScore(base, def, 1);
    const easy = computeScore(base, def, 0.8);
    const hard = computeScore(base, def, 1.25);
    expect(easy.total).toBe(Math.round(normal.total * 0.8));
    expect(hard.total).toBe(Math.round(normal.total * 1.25));
    // le detail reste brut : seul le total est pondere
    expect(easy.kills).toBe(normal.kills);
  });

  it('reste coherent pour les trois cartes', () => {
    for (const id of ['volcano', 'ice', 'temple'] as const) {
      const d = getMap(id);
      const prev = Object.values(d.rankScores);
      for (let i = 1; i < prev.length; i++) expect(prev[i]).toBeGreaterThan(prev[i - 1]);
    }
  });
});
