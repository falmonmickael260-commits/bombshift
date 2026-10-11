import { AI } from '../core/constants';
import type { DangerMap, GridMap } from '../core/grid';
import { ALL_DIRS, DIR_VECTORS, type Dir, type EnemyKind, type Vec2 } from '../core/types';

export interface AiContext {
  grid: GridMap;
  danger: DangerMap;
  player: Vec2;
  /** Cases occupees par d'autres ennemis (index de grille). */
  occupied: Set<number>;
  /** Case gardee (ennemis de type guardian). */
  home?: Vec2;
  /** Le joueur est-il visible/pistable ? (distance de perception) */
  aggroRange: number;
}

export interface AiDecision {
  /** Case cible immediate (une case adjacente), ou null si l'ennemi attend. */
  step: Vec2 | null;
  /** Etat pour le debug et les animations. */
  mode: 'flee' | 'chase' | 'flank' | 'patrol' | 'guard' | 'idle';
}

const manhattan = (a: Vec2, b: Vec2): number => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

function isFree(grid: GridMap, occupied: Set<number>, x: number, y: number): boolean {
  if (!grid.inBounds(x, y) || grid.isSolid(x, y)) return false;
  if (grid.isLethalFloor(x, y)) return false;
  return !occupied.has(grid.idx(x, y));
}

/**
 * Decision d'un ennemi pour un pas de grille.
 * L'IA n'utilise que des informations perceptibles dans le jeu :
 * la grille, les bombes posees (via la carte de danger) et la position
 * du joueur lorsqu'il est a portee de perception.
 */
export function decideEnemy(
  kind: EnemyKind,
  self: Vec2,
  facing: Dir,
  ctx: AiContext,
): AiDecision {
  const { grid, danger, player } = ctx;

  // 1. Priorite absolue : quitter une zone de souffle imminente.
  if (danger.isDangerous(self.x, self.y) || grid.isLethalFloor(self.x, self.y)) {
    const escape = grid.findEscape(self, danger);
    if (escape.length > 0) return { step: escape[0], mode: 'flee' };
  }

  const dist = manhattan(self, player);
  const canSee = dist <= ctx.aggroRange;

  switch (kind) {
    case 'coward': {
      // Fuit les explosions et garde ses distances : se rapproche seulement si le joueur est loin.
      if (canSee && dist < 5) {
        const away = bestStepAwayFrom(grid, ctx, self, player);
        if (away) return { step: away, mode: 'flee' };
      }
      return { step: patrolStep(grid, ctx, self, facing), mode: 'patrol' };
    }

    case 'patroller': {
      if (canSee && dist <= 4) {
        const path = grid.findPath(self, player, { danger, blocked: ctx.occupied });
        if (path.length > 0) return { step: path[0], mode: 'chase' };
      }
      return { step: patrolStep(grid, ctx, self, facing), mode: 'patrol' };
    }

    case 'chaser': {
      if (canSee) {
        const path = grid.findPath(self, player, { danger, blocked: ctx.occupied });
        if (path.length > 0) return { step: path[0], mode: 'chase' };
      }
      return { step: patrolStep(grid, ctx, self, facing), mode: 'patrol' };
    }

    case 'heavy': {
      // Lourd : avance en ligne, change de cap seulement quand il est bloque.
      if (canSee) {
        const path = grid.findPath(self, player, { danger, blocked: ctx.occupied });
        if (path.length > 0) {
          const ahead = { x: self.x + DIR_VECTORS[facing].x, y: self.y + DIR_VECTORS[facing].y };
          const keepsCourse =
            path[0].x === ahead.x && path[0].y === ahead.y && isFree(grid, ctx.occupied, ahead.x, ahead.y);
          return { step: keepsCourse ? ahead : path[0], mode: 'chase' };
        }
      }
      return { step: patrolStep(grid, ctx, self, facing), mode: 'patrol' };
    }

    case 'flanker': {
      // Cherche a couper la retraite : vise une case a 2 de distance du joueur,
      // du cote oppose a sa propre approche.
      if (canSee) {
        const target = flankCell(grid, ctx, self, player);
        if (target) {
          const path = grid.findPath(self, target, { danger, blocked: ctx.occupied });
          if (path.length > 0) return { step: path[0], mode: 'flank' };
        }
        const direct = grid.findPath(self, player, { danger, blocked: ctx.occupied });
        if (direct.length > 0) return { step: direct[0], mode: 'chase' };
      }
      return { step: patrolStep(grid, ctx, self, facing), mode: 'patrol' };
    }

    case 'guardian': {
      const home = ctx.home ?? self;
      const homeDist = manhattan(self, home);
      if (canSee && manhattan(player, home) <= ctx.aggroRange) {
        const path = grid.findPath(self, player, { danger, blocked: ctx.occupied });
        if (path.length > 0) return { step: path[0], mode: 'guard' };
      }
      if (homeDist > 1) {
        const path = grid.findPath(self, home, { danger, blocked: ctx.occupied });
        if (path.length > 0) return { step: path[0], mode: 'guard' };
      }
      return { step: null, mode: 'idle' };
    }
  }
}

/** Avance tout droit si possible, sinon change de direction (sans faire demi-tour si evitable). */
function patrolStep(grid: GridMap, ctx: AiContext, self: Vec2, facing: Dir): Vec2 | null {
  const ahead = { x: self.x + DIR_VECTORS[facing].x, y: self.y + DIR_VECTORS[facing].y };
  const aheadOk =
    isFree(grid, ctx.occupied, ahead.x, ahead.y) &&
    !ctx.danger.isDangerous(ahead.x, ahead.y, AI.dangerHorizonMs * 0.7);
  if (aheadOk) return ahead;

  const back: Dir =
    facing === 'up' ? 'down' : facing === 'down' ? 'up' : facing === 'left' ? 'right' : 'left';
  const options: Vec2[] = [];
  for (const d of ALL_DIRS) {
    if (d === back || d === facing) continue;
    const c = { x: self.x + DIR_VECTORS[d].x, y: self.y + DIR_VECTORS[d].y };
    if (isFree(grid, ctx.occupied, c.x, c.y) && !ctx.danger.isDangerous(c.x, c.y)) options.push(c);
  }
  if (options.length > 0) {
    // Choix stable : depend de la position, donc pas de tremblement image par image.
    return options[(self.x * 7 + self.y * 13) % options.length];
  }
  const b = { x: self.x + DIR_VECTORS[back].x, y: self.y + DIR_VECTORS[back].y };
  return isFree(grid, ctx.occupied, b.x, b.y) ? b : null;
}

function bestStepAwayFrom(grid: GridMap, ctx: AiContext, self: Vec2, from: Vec2): Vec2 | null {
  let best: Vec2 | null = null;
  let bestScore = -Infinity;
  for (const d of ALL_DIRS) {
    const c = { x: self.x + DIR_VECTORS[d].x, y: self.y + DIR_VECTORS[d].y };
    if (!isFree(grid, ctx.occupied, c.x, c.y)) continue;
    let score = manhattan(c, from);
    if (ctx.danger.isDangerous(c.x, c.y)) score -= 12;
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best;
}

/** Case d'encerclement : proche du joueur, opposee a la position de l'ennemi. */
function flankCell(grid: GridMap, ctx: AiContext, self: Vec2, player: Vec2): Vec2 | null {
  const candidates: Vec2[] = [];
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const d = Math.abs(dx) + Math.abs(dy);
      if (d < 1 || d > 2) continue;
      const c = { x: player.x + dx, y: player.y + dy };
      if (!isFree(grid, ctx.occupied, c.x, c.y)) continue;
      if (ctx.danger.isDangerous(c.x, c.y)) continue;
      candidates.push(c);
    }
  }
  if (candidates.length === 0) return null;

  // On privilegie les cases qui coupent la fuite : loin de l'ennemi en ligne droite
  // mais proches du joueur.
  let best: Vec2 | null = null;
  let bestScore = Infinity;
  for (const c of candidates) {
    const score = manhattan(c, self) - manhattan(c, player) * 2;
    if (score < bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best;
}

export const AI_AGGRO: Record<EnemyKind, number> = {
  patroller: 6,
  chaser: 14,
  flanker: 12,
  coward: 8,
  heavy: 10,
  guardian: 7,
};

export const AI_SPEED: Record<EnemyKind, number> = {
  patroller: 72,
  chaser: 104,
  flanker: 96,
  coward: 112,
  heavy: 58,
  guardian: 80,
};
