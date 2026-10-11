import { describe, expect, it } from 'vitest';
import { GridMap } from '../core/grid';
import { TileKind } from '../core/types';
import { computeBlast } from '../gameplay/blast';

const open = (w = 9, h = 9): GridMap => {
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
};

const has = (cells: { x: number; y: number }[], x: number, y: number): boolean =>
  cells.some((c) => c.x === x && c.y === y);

describe('propagation des explosions', () => {
  it('couvre les 4 directions sur toute la portee', () => {
    const g = open();
    const { cells } = computeBlast(g, { x: 4, y: 4 }, 2, 0);
    // centre + 2 cases dans chaque direction
    expect(cells.length).toBe(9);
    expect(has(cells, 4, 4)).toBe(true);
    expect(has(cells, 6, 4)).toBe(true);
    expect(has(cells, 2, 4)).toBe(true);
    expect(has(cells, 4, 6)).toBe(true);
    expect(has(cells, 4, 2)).toBe(true);
  });

  it('s\'arrete avant un mur indestructible sans l\'enflammer', () => {
    const g = open();
    g.setTile(6, 4, TileKind.Wall);
    const { cells } = computeBlast(g, { x: 4, y: 4 }, 4, 0);
    expect(has(cells, 5, 4)).toBe(true);
    expect(has(cells, 6, 4)).toBe(false);
    expect(has(cells, 7, 4)).toBe(false);
  });

  it('detruit un bloc, l\'enflamme, puis s\'arrete', () => {
    const g = open();
    g.setTile(6, 4, TileKind.Block);
    const { cells, destroyed } = computeBlast(g, { x: 4, y: 4 }, 4, 0);
    expect(has(cells, 6, 4)).toBe(true);
    expect(has(cells, 7, 4)).toBe(false);
    expect(destroyed).toEqual([{ x: 6, y: 4 }]);
  });

  it('traverse exactement un bloc avec une bombe perforante', () => {
    const g = open(11, 11);
    g.setTile(6, 5, TileKind.Block);
    g.setTile(8, 5, TileKind.Block);
    const { cells, destroyed } = computeBlast(g, { x: 5, y: 5 }, 5, 1);
    expect(has(cells, 6, 5)).toBe(true);
    expect(has(cells, 7, 5)).toBe(true);
    expect(has(cells, 8, 5)).toBe(true);
    expect(has(cells, 9, 5)).toBe(false);
    expect(destroyed.length).toBe(2);
  });

  it('traite un cristal comme un mur', () => {
    const g = open();
    g.setTile(4, 2, TileKind.Crystal);
    const { cells, destroyed } = computeBlast(g, { x: 4, y: 4 }, 3, 2);
    expect(has(cells, 4, 2)).toBe(false);
    expect(destroyed.length).toBe(0);
  });

  it('revele un faux mur et le compte comme detruit', () => {
    const g = open();
    g.setTile(4, 2, TileKind.Secret);
    const { cells, destroyed } = computeBlast(g, { x: 4, y: 4 }, 3, 0);
    expect(has(cells, 4, 2)).toBe(true);
    expect(destroyed).toEqual([{ x: 4, y: 2 }]);
    expect(g.destroyAt(4, 2)).toBe(TileKind.Secret);
    expect(g.isSolid(4, 2)).toBe(false);
  });

  it('est bloquee par une porte fermee mais pas par une porte ouverte', () => {
    const g = open();
    g.setTile(6, 4, TileKind.Door);
    const closed = g.tileAt(6, 4)!;
    closed.active = true;
    expect(has(computeBlast(g, { x: 4, y: 4 }, 4, 0).cells, 7, 4)).toBe(false);
    closed.active = false;
    expect(has(computeBlast(g, { x: 4, y: 4 }, 4, 0).cells, 7, 4)).toBe(true);
  });

  it('ne sort jamais de la grille', () => {
    const g = open(5, 5);
    const { cells } = computeBlast(g, { x: 2, y: 2 }, 9, 3);
    for (const c of cells) {
      expect(c.x).toBeGreaterThanOrEqual(0);
      expect(c.y).toBeGreaterThanOrEqual(0);
      expect(c.x).toBeLessThan(5);
      expect(c.y).toBeLessThan(5);
    }
  });

  it('enflamme la lave sans la detruire (le souffle passe)', () => {
    const g = open();
    g.setTile(5, 4, TileKind.Lava);
    const { cells, destroyed } = computeBlast(g, { x: 4, y: 4 }, 3, 0);
    expect(has(cells, 5, 4)).toBe(true);
    expect(has(cells, 6, 4)).toBe(true);
    expect(destroyed.length).toBe(0);
  });
});
