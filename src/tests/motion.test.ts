import { describe, expect, it } from 'vitest';
import { MOVE, TILE } from '../core/constants';
import { GridMap } from '../core/grid';
import { TileKind } from '../core/types';
import {
  bodyCellRange,
  bodyOverlapsCell,
  cellOf,
  centerOf,
  moveBody,
  type Body,
} from '../gameplay/motion';

const grid = (): GridMap => {
  const g = new GridMap(9, 9, TileKind.Floor);
  for (let x = 0; x < 9; x++) {
    g.setTile(x, 0, TileKind.Wall);
    g.setTile(x, 8, TileKind.Wall);
  }
  for (let y = 0; y < 9; y++) {
    g.setTile(0, y, TileKind.Wall);
    g.setTile(8, y, TileKind.Wall);
  }
  return g;
};

const body = (cx: number, cy: number): Body => {
  const p = centerOf({ x: cx, y: cy });
  return { x: p.x, y: p.y, vx: 0, vy: 0, radius: TILE * MOVE.radius };
};

const opts = (g: GridMap, slippery = false, laneAssist = true) => ({
  speed: 150,
  slippery,
  laneAssist,
  blocked: (cx: number, cy: number) => g.isSolid(cx, cy),
});

const sim = (
  b: Body,
  g: GridMap,
  ix: number,
  iy: number,
  seconds: number,
  o = opts(g),
): void => {
  const steps = Math.round(seconds / (1 / 60));
  for (let i = 0; i < steps; i++) moveBody(b, ix, iy, 1 / 60, o);
};

describe('deplacement et collisions', () => {
  it('avance dans un couloir libre', () => {
    const g = grid();
    const b = body(1, 1);
    sim(b, g, 1, 0, 1);
    expect(cellOf(b).x).toBeGreaterThan(1);
    expect(cellOf(b).y).toBe(1);
  });

  it('ne traverse jamais un mur, meme a grande vitesse', () => {
    const g = grid();
    const b = body(1, 1);
    const fast = { ...opts(g), speed: 2000 };
    for (let i = 0; i < 240; i++) moveBody(b, 1, 0, 1 / 60, fast);
    expect(b.x).toBeLessThan(7 * TILE + TILE);
    expect(g.isSolid(cellOf(b).x, cellOf(b).y)).toBe(false);
  });

  it('bute contre un bloc et s\'arrete proprement', () => {
    const g = grid();
    g.setTile(3, 1, TileKind.Block);
    const b = body(1, 1);
    sim(b, g, 1, 0, 2);
    expect(cellOf(b)).toEqual({ x: 2, y: 1 });
    expect(b.vx).toBe(0);
  });

  it('teste les 4 directions dans un couloir en croix', () => {
    const g = grid();
    for (const [ix, iy, ex, ey] of [
      [1, 0, 1, 0],
      [-1, 0, -1, 0],
      [0, 1, 0, 1],
      [0, -1, 0, -1],
    ]) {
      const b = body(4, 4);
      const before = { ...b };
      sim(b, g, ix, iy, 0.6);
      expect(Math.sign(b.x - before.x)).toBe(ex);
      expect(Math.sign(b.y - before.y)).toBe(ey);
    }
  });

  it('recentre dans le couloir quand on avance en diagonale legere', () => {
    const g = grid();
    const b = body(1, 1);
    b.y += 9; // decale dans la case
    sim(b, g, 1, 0.15, 0.7);
    const center = centerOf({ x: cellOf(b).x, y: 1 }).y;
    expect(Math.abs(b.y - center)).toBeLessThan(2);
  });

  it('conserve de l\'inertie sur la glace', () => {
    const g = grid();
    const ice = body(1, 4);
    const normal = body(1, 4);
    sim(ice, g, 1, 0, 1, opts(g, true, false));
    sim(normal, g, 1, 0, 1, opts(g, false, false));
    const iceSpeed = ice.vx;
    const normalSpeed = normal.vx;
    // On relache : la glace continue de glisser, le sol normal stoppe net.
    for (let i = 0; i < 12; i++) moveBody(ice, 0, 0, 1 / 60, opts(g, true, false));
    for (let i = 0; i < 12; i++) moveBody(normal, 0, 0, 1 / 60, opts(g, false, false));
    expect(normalSpeed).toBeGreaterThan(0);
    expect(iceSpeed).toBeGreaterThan(0);
    expect(ice.vx).toBeGreaterThan(normal.vx);
    expect(normal.vx).toBe(0);
  });

  it('considere la bombe comme encore occupee tant que le corps la chevauche', () => {
    // Regression : le joueur restait coince a cheval sur sa propre bombe des
    // que le centre changeait de case alors que son corps la touchait encore.
    const b = body(2, 1);
    const bombCell = { x: 2, y: 1 };
    expect(bodyOverlapsCell(b, bombCell)).toBe(true);
    b.x += TILE * 0.55; // le centre passe dans la case 3, le corps deborde encore
    expect(cellOf(b).x).toBe(3);
    expect(bodyOverlapsCell(b, bombCell)).toBe(true);
    b.x += TILE * 0.45; // corps entierement sorti
    expect(bodyOverlapsCell(b, bombCell)).toBe(false);
  });

  it('peut toujours quitter une case devenue bloquante sous ses pieds', () => {
    const g = grid();
    const b = body(2, 1);
    // La case (2,1) est bloquante, mais le joueur s'y trouve : il doit pouvoir sortir.
    const blockedExceptSelf = (cx: number, cy: number): boolean => {
      if (cx === 2 && cy === 1) return false; // regle "on peut quitter sa propre bombe"
      return g.isSolid(cx, cy);
    };
    for (let i = 0; i < 60; i++) {
      moveBody(b, 1, 0, 1 / 60, { ...opts(g), blocked: blockedExceptSelf });
    }
    expect(cellOf(b).x).toBeGreaterThan(2);
  });

  it('calcule l\'emprise du corps sur la grille', () => {
    const b = body(4, 4);
    const r = bodyCellRange(b);
    expect(r).toEqual({ minX: 4, minY: 4, maxX: 4, maxY: 4 });
    b.x += TILE / 2;
    expect(bodyCellRange(b).maxX).toBe(5);
  });

  it('reste coherent entre pixels et cases', () => {
    for (let cx = 0; cx < 9; cx++) {
      for (let cy = 0; cy < 9; cy++) {
        expect(cellOf(centerOf({ x: cx, y: cy }))).toEqual({ x: cx, y: cy });
      }
    }
  });
});

describe('sortie de blocage (cases devenues solides sous le joueur)', () => {
  /**
   * Regression : une porte qui se ferme sur le joueur, ou une bombe qui se
   * fige sous lui, faisait chevaucher son corps avec une case solide.
   * `moveBody` bloquait alors les DEUX axes et le joueur ne pouvait plus
   * bouger du tout.
   */
  const stuckBody = (): Body => {
    const b = body(2, 4);
    b.x += TILE * 0.5; // a cheval sur les cases 2 et 3
    return b;
  };

  it('peut se degager vers la gauche quand la case de droite devient solide', () => {
    const g = grid();
    g.setTile(3, 4, TileKind.Block); // la case chevauchee devient solide
    const b = stuckBody();
    const startX = b.x;
    sim(b, g, -1, 0, 0.6);
    expect(b.x).toBeLessThan(startX - 8);
    expect(cellOf(b).x).toBeLessThanOrEqual(2);
    // Plus aucun chevauchement avec la case devenue solide.
    expect(b.x + b.radius).toBeLessThanOrEqual(3 * TILE + 0.5);
  });

  it('peut se degager perpendiculairement', () => {
    const g = grid();
    g.setTile(3, 4, TileKind.Block);
    const b = stuckBody();
    const startY = b.y;
    sim(b, g, 0, 1, 0.6, opts(g, false, false));
    expect(Math.abs(b.y - startY)).toBeGreaterThan(8);
  });

  it('n\'est jamais immobile dans les quatre directions', () => {
    const g = grid();
    g.setTile(3, 4, TileKind.Block);
    let freed = 0;
    for (const [ix, iy] of [
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 0],
    ]) {
      const b = stuckBody();
      const before = { x: b.x, y: b.y };
      sim(b, g, ix, iy, 0.5, opts(g, false, false));
      if (Math.hypot(b.x - before.x, b.y - before.y) > 4) freed++;
    }
    expect(freed).toBeGreaterThanOrEqual(3);
  });

  it('se repousse tout seul hors de la case solide, sans commande', () => {
    const g = grid();
    g.setTile(3, 4, TileKind.Block);
    const b = stuckBody();
    for (let i = 0; i < 120; i++) moveBody(b, 0, 0, 1 / 60, opts(g, false, false));
    // Plus aucun chevauchement avec la case solide.
    expect(b.x + b.radius).toBeLessThanOrEqual(3 * TILE + 0.5);
  });

  it('continue de bloquer normalement un mur aborde de l\'exterieur', () => {
    const g = grid();
    g.setTile(4, 4, TileKind.Block);
    const b = body(2, 4);
    sim(b, g, 1, 0, 2);
    expect(cellOf(b).x).toBe(3);
    expect(b.x + b.radius).toBeLessThanOrEqual(4 * TILE + 0.5);
  });
});

describe('le degagement ne permet pas de tricher', () => {
  it('ne traverse pas un mur en etant coince dedans', () => {
    const g = grid();
    // Mur d'une case d'epaisseur, le joueur demarre a cheval dessus.
    g.setTile(3, 4, TileKind.Wall);
    const b = body(2, 4);
    b.x += TILE * 0.5;
    // Il pousse vers le mur pendant 3 secondes.
    sim(b, g, 1, 0, 3, opts(g, false, false));
    // Il n'est jamais passe de l'autre cote.
    expect(b.x).toBeLessThan(4 * TILE);
    expect(cellOf(b).x).toBeLessThanOrEqual(3);
  });

  it('ne s\'enfonce pas davantage dans la case solide', () => {
    const g = grid();
    g.setTile(3, 4, TileKind.Block);
    const b = body(2, 4);
    b.x += TILE * 0.5;
    const penetrationAvant = b.x + b.radius - 3 * TILE;
    sim(b, g, 1, 0, 1, opts(g, false, false));
    const penetrationApres = b.x + b.radius - 3 * TILE;
    expect(penetrationApres).toBeLessThanOrEqual(penetrationAvant + 0.5);
  });
});
