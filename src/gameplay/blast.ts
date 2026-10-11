import type { GridMap } from '../core/grid';
import { ALL_DIRS, DIR_VECTORS, TileKind, type Dir, type Vec2 } from '../core/types';

export interface BlastCell {
  x: number;
  y: number;
  /** Distance au centre (0 = centre). */
  dist: number;
  dir: Dir | 'center';
  /** Derniere case de la branche : sert a choisir l'effet visuel. */
  tip: boolean;
}

export interface BlastResult {
  cells: BlastCell[];
  /** Cases destructibles touchees (a detruire par l'appelant). */
  destroyed: Vec2[];
}

/**
 * Propagation d'une explosion en croix.
 * - s'arrete sur un mur indestructible (sans l'enflammer),
 * - enflamme et detruit un bloc destructible puis s'arrete,
 *   sauf si la bombe est perforante (pierce > 0 : elle traverse N blocs).
 *
 * Fonction pure : testable sans moteur de jeu.
 */
export function computeBlast(
  grid: GridMap,
  origin: Vec2,
  range: number,
  pierce = 0,
): BlastResult {
  const cells: BlastCell[] = [{ x: origin.x, y: origin.y, dist: 0, dir: 'center', tip: false }];
  const destroyed: Vec2[] = [];

  for (const dir of ALL_DIRS) {
    const v = DIR_VECTORS[dir];
    let pierceLeft = pierce;
    for (let step = 1; step <= range; step++) {
      const x = origin.x + v.x * step;
      const y = origin.y + v.y * step;
      if (!grid.inBounds(x, y)) break;

      if (grid.blocksBlast(x, y)) {
        if (grid.isDestructible(x, y)) {
          cells.push({ x, y, dist: step, dir, tip: true });
          destroyed.push({ x, y });
          if (pierceLeft > 0) {
            pierceLeft--;
            continue;
          }
        }
        break;
      }

      const isTip = step === range;
      cells.push({ x, y, dist: step, dir, tip: isTip });
    }
  }

  return { cells, destroyed };
}

/** Les flammes ne peuvent pas apparaitre sur ces cases (securite). */
export function canFlame(grid: GridMap, cell: Vec2): boolean {
  const k = grid.kindAt(cell.x, cell.y);
  return k !== TileKind.Wall && k !== TileKind.Crystal;
}
