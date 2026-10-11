import { describe, expect, it } from 'vitest';
import { DangerMap, GridMap } from '../core/grid';
import { TileKind, type Vec2 } from '../core/types';
import { decideEnemy } from '../gameplay/ai';

function arena(w = 11, h = 11): GridMap {
  const g = new GridMap(w, h, TileKind.Floor);
  for (let x = 0; x < w; x++) {
    g.setTile(x, 0, TileKind.Wall);
    g.setTile(x, h - 1, TileKind.Wall);
  }
  for (let y = 0; y < h; y++) {
    g.setTile(0, y, TileKind.Wall);
    g.setTile(w - 1, y, TileKind.Wall);
  }
  return g;
}

const ctx = (grid: GridMap, danger: DangerMap, player: Vec2, extra = {}) => ({
  grid,
  danger,
  player,
  occupied: new Set<number>(),
  aggroRange: 14,
  ...extra,
});

describe('recherche de chemin', () => {
  it('trouve un chemin et retourne le premier pas', () => {
    const g = arena();
    const path = g.findPath({ x: 1, y: 1 }, { x: 5, y: 1 });
    expect(path.length).toBe(4);
    expect(path[0]).toEqual({ x: 2, y: 1 });
    expect(path[path.length - 1]).toEqual({ x: 5, y: 1 });
  });

  it('contourne un obstacle', () => {
    const g = arena();
    for (let y = 1; y <= 8; y++) g.setTile(5, y, TileKind.Wall);
    const path = g.findPath({ x: 2, y: 4 }, { x: 8, y: 4 });
    expect(path.length).toBeGreaterThan(6);
    expect(path.some((c) => c.x === 5 && c.y <= 8 && c.y >= 1)).toBe(false);
  });

  it('ne renvoie aucun chemin vers une case murée', () => {
    const g = arena();
    for (let y = 1; y <= 9; y++) g.setTile(5, y, TileKind.Wall);
    expect(g.findPath({ x: 2, y: 4 }, { x: 8, y: 4 })).toEqual([]);
  });

  it('prefere un detour plutot que traverser une zone de souffle', () => {
    const g = arena();
    const danger = new DangerMap(g.width, g.height);
    // Couloir direct dangereux sur la ligne y=1.
    for (let x = 1; x <= 9; x++) danger.mark(x, 1, 300);
    const path = g.findPath({ x: 1, y: 1 }, { x: 9, y: 1 }, { danger, allowDangerGoal: true });
    const dangerousSteps = path.filter((c) => c.y === 1).length;
    expect(dangerousSteps).toBeLessThan(path.length);
  });

  it('trouve une sortie de zone de souffle', () => {
    const g = arena();
    const danger = new DangerMap(g.width, g.height);
    for (let x = 1; x <= 9; x++) danger.mark(x, 5, 200);
    const escape = g.findEscape({ x: 5, y: 5 }, danger);
    expect(escape.length).toBeGreaterThan(0);
    const last = escape[escape.length - 1];
    expect(danger.isDangerous(last.x, last.y)).toBe(false);
  });
});

describe('comportements d\'ennemis', () => {
  it('le poursuivant se rapproche du joueur', () => {
    const g = arena();
    const danger = new DangerMap(g.width, g.height);
    const d = decideEnemy('chaser', { x: 2, y: 2 }, 'down', ctx(g, danger, { x: 8, y: 2 }));
    expect(d.mode).toBe('chase');
    expect(d.step).toEqual({ x: 3, y: 2 });
  });

  it('la priorite absolue est de fuir le danger', () => {
    const g = arena();
    const danger = new DangerMap(g.width, g.height);
    for (let x = 1; x <= 9; x++) danger.mark(x, 2, 400);
    const d = decideEnemy('chaser', { x: 2, y: 2 }, 'right', ctx(g, danger, { x: 8, y: 2 }));
    expect(d.mode).toBe('flee');
    expect(d.step!.y).not.toBe(2);
  });

  it('le fuyard garde ses distances', () => {
    const g = arena();
    const danger = new DangerMap(g.width, g.height);
    const d = decideEnemy('coward', { x: 5, y: 5 }, 'left', ctx(g, danger, { x: 6, y: 5 }));
    expect(d.step).not.toBeNull();
    // Il s'eloigne : la distance augmente.
    const before = Math.abs(5 - 6) + Math.abs(5 - 5);
    const after = Math.abs(d.step!.x - 6) + Math.abs(d.step!.y - 5);
    expect(after).toBeGreaterThan(before);
  });

  it('le patrouilleur continue tout droit puis change de cap', () => {
    const g = arena();
    const danger = new DangerMap(g.width, g.height);
    const straight = decideEnemy('patroller', { x: 3, y: 5 }, 'right', ctx(g, danger, { x: 9, y: 9 }));
    expect(straight.step).toEqual({ x: 4, y: 5 });
    const blocked = decideEnemy('patroller', { x: 9, y: 5 }, 'right', ctx(g, danger, { x: 1, y: 1 }));
    expect(blocked.step).not.toEqual({ x: 10, y: 5 });
  });

  it('le gardien reste pres de son objectif', () => {
    const g = arena();
    const danger = new DangerMap(g.width, g.height);
    const d = decideEnemy(
      'guardian',
      { x: 7, y: 7 },
      'up',
      ctx(g, danger, { x: 1, y: 1 }, { home: { x: 3, y: 3 }, aggroRange: 4 }),
    );
    expect(d.mode).toBe('guard');
    const dist = Math.abs(d.step!.x - 3) + Math.abs(d.step!.y - 3);
    expect(dist).toBeLessThan(Math.abs(7 - 3) + Math.abs(7 - 3));
  });

  it('l\'encercleur vise une case proche du joueur', () => {
    const g = arena();
    const danger = new DangerMap(g.width, g.height);
    const d = decideEnemy('flanker', { x: 2, y: 5 }, 'right', ctx(g, danger, { x: 7, y: 5 }));
    expect(d.step).not.toBeNull();
    expect(['flank', 'chase']).toContain(d.mode);
  });

  it('n\'emprunte jamais une case mortelle', () => {
    const g = arena();
    const danger = new DangerMap(g.width, g.height);
    g.setTile(3, 2, TileKind.Lava);
    const d = decideEnemy('chaser', { x: 2, y: 2 }, 'right', ctx(g, danger, { x: 8, y: 2 }));
    expect(d.step).not.toEqual({ x: 3, y: 2 });
  });
});
