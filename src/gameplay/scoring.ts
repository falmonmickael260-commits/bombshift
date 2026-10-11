import { PLAYER, SCORING } from '../core/constants';
import type { Rank, RunStats, ScoreBreakdown } from '../core/types';
import type { MapDefinition } from '../maps/mapTypes';

const RANK_ORDER: readonly Rank[] = ['SSS', 'SS', 'S', 'A', 'B', 'C'];

/**
 * Calcule le score final et le rang.
 * Le bareme recompense la maitrise (objectifs, secrets, absence de degats,
 * rapidite) et non la simple destruction de blocs.
 */
export function computeScore(
  stats: RunStats,
  def: MapDefinition,
  /** Coefficient de difficulte applique au total (1 = Normal). */
  scoreFactor = 1,
): ScoreBreakdown {
  const kills = stats.kills * SCORING.perKill;
  const boss = stats.bossKills * SCORING.perBoss;
  const objectives = stats.objectivesDone * SCORING.perObjective;
  const secrets = stats.secretsFound * SCORING.perSecret;

  // Bonus de temps : plein sous le temps de reference, nul au-dela du plafond.
  const t = stats.timeMs;
  let time = 0;
  if (t <= def.parTimeMs) {
    time = SCORING.timeBonusMax;
  } else if (t < SCORING.timeBonusZeroMs) {
    const span = SCORING.timeBonusZeroMs - def.parTimeMs;
    time = Math.round(SCORING.timeBonusMax * (1 - (t - def.parTimeMs) / span));
  }
  time = Math.max(0, time);

  const noDamage = stats.damageTaken === 0 ? SCORING.noDamageBonus : 0;
  // Plafonne au nombre de vies reellement atteignable dans une partie.
  const lives =
    Math.min(PLAYER.maxLives, Math.max(0, stats.livesLeft)) * SCORING.perLifeLeft;

  const raw = kills + boss + objectives + secrets + time + noDamage + lives;
  const total = Math.round(raw * scoreFactor);

  let rank: Rank = 'C';
  for (const r of RANK_ORDER) {
    if (total >= def.rankScores[r]) {
      rank = r;
      break;
    }
  }

  return { kills, boss, objectives, secrets, time, noDamage, lives, total, rank };
}

export function emptyStats(lives: number): RunStats {
  return {
    kills: 0,
    bossKills: 0,
    blocksDestroyed: 0,
    secretsFound: 0,
    powerupsTaken: 0,
    damageTaken: 0,
    bombsPlaced: 0,
    objectivesDone: 0,
    timeMs: 0,
    livesLeft: lives,
  };
}
