import { describe, expect, it } from 'vitest';
import { GridMap } from '../core/grid';
import { TileKind, type Vec2 } from '../core/types';
import { MAPS, parseMap } from '../maps';

/** Toutes les cases atteignables depuis le depart, blocs destructibles inclus. */
function reachable(grid: GridMap, from: Vec2): Set<number> {
  return grid.reachableThroughBlocks(from);
}

describe('cartes', () => {
  for (const def of MAPS) {
    describe(def.name, () => {
      const parsed = parseMap(def);
      const grid = parsed.grid;

      it('est rectangulaire et bordee de murs', () => {
        expect(grid.width).toBeGreaterThanOrEqual(20);
        expect(grid.height).toBeGreaterThanOrEqual(15);
        for (let x = 0; x < grid.width; x++) {
          expect(grid.kindAt(x, 0)).toBe(TileKind.Wall);
          expect(grid.kindAt(x, grid.height - 1)).toBe(TileKind.Wall);
        }
      });

      it('a un depart libre et degage', () => {
        const s = parsed.playerSpawn;
        expect(grid.isSolid(s.x, s.y)).toBe(false);
        expect(grid.isLethalFloor(s.x, s.y)).toBe(false);
        // Au moins deux cases libres adjacentes : jamais coince au depart.
        const free = [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ].filter(([dx, dy]) => !grid.isSolid(s.x + dx, s.y + dy)).length;
        expect(free).toBeGreaterThanOrEqual(2);
      });

      it('rend tous les objectifs, le boss et la sortie atteignables', () => {
        const set = reachable(grid, parsed.playerSpawn);
        for (const prop of parsed.props) {
          expect(set.has(grid.idx(prop.cell.x, prop.cell.y))).toBe(true);
        }
        expect(set.has(grid.idx(parsed.bossSpawn.x, parsed.bossSpawn.y))).toBe(true);
        expect(set.has(grid.idx(parsed.exit.x, parsed.exit.y))).toBe(true);
      });

      it('ne fait apparaitre aucun ennemi au contact du depart', () => {
        const s = parsed.playerSpawn;
        for (const e of parsed.enemies) {
          const d = Math.abs(e.cell.x - s.x) + Math.abs(e.cell.y - s.y);
          expect(d).toBeGreaterThanOrEqual(4);
        }
      });

      it('place tous les ennemis sur des cases praticables', () => {
        expect(parsed.enemies.length).toBeGreaterThanOrEqual(8);
        for (const e of parsed.enemies) {
          expect(grid.isSolid(e.cell.x, e.cell.y)).toBe(false);
          expect(grid.isLethalFloor(e.cell.x, e.cell.y)).toBe(false);
        }
      });

      it('protege le boss derriere une grille verrouillee', () => {
        // Sans ouvrir les grilles, l'arene du boss est inaccessible.
        const open = grid.reachable(parsed.playerSpawn);
        expect(open.has(grid.idx(parsed.bossSpawn.x, parsed.bossSpawn.y))).toBe(false);
        const gates = grid.findCells((t) => t.kind === TileKind.Gate && t.group === 1);
        expect(gates.length).toBeGreaterThan(0);
      });

      it('ouvre l\'arene du boss une fois les grilles levees', () => {
        const fresh = parseMap(def).grid;
        fresh.openGates(0);
        // Les blocs destructibles restent franchissables a la bombe.
        const set = fresh.reachableThroughBlocks(parsed.playerSpawn);
        expect(set.has(fresh.idx(parsed.bossSpawn.x, parsed.bossSpawn.y))).toBe(true);
      });

      it('declare le bon nombre de secrets et d\'objectifs', () => {
        expect(parsed.secrets.length).toBe(def.secretCount);
        expect(parsed.props.length).toBe(
          def.objectives.find((o) => o.id === 'props')?.total ?? -1,
        );
      });

      it('garde les objectifs accessibles meme apres la coulee de lave', () => {
        const flow = def.lavaFlow;
        if (!flow) return;
        const fresh = parseMap(def).grid;
        for (const c of flow.cells) fresh.setTile(c.x, c.y, TileKind.Lava, 0);
        const set = fresh.reachableThroughBlocks(parsed.playerSpawn);
        for (const prop of parsed.props) {
          expect(set.has(fresh.idx(prop.cell.x, prop.cell.y))).toBe(true);
        }
        expect(set.has(fresh.idx(parsed.exit.x, parsed.exit.y))).toBe(true);
      });

      it('ne pose aucun prop ni sortie sur une case solide ou mortelle', () => {
        const cells: Vec2[] = [...parsed.props.map((p) => p.cell), parsed.exit, parsed.bossSpawn];
        for (const c of cells) {
          expect(grid.isSolid(c.x, c.y)).toBe(false);
          expect(grid.isLethalFloor(c.x, c.y)).toBe(false);
        }
      });

      if (def.id === 'temple') {
        it('verrouille la relique centrale derriere les dalles-mecanismes', () => {
          const fresh = parseMap(def).grid;
          expect(parsed.mechanisms.length).toBe(3);
          const relic = parsed.props.find((p) => p.index === 2)!;
          // Avant l'ouverture de la grille secondaire : inaccessible.
          const before = fresh.reachableThroughBlocks(parsed.playerSpawn, false);
          expect(before.has(fresh.idx(relic.cell.x, relic.cell.y))).toBe(false);
          fresh.openGates(2);
          const after = fresh.reachableThroughBlocks(parsed.playerSpawn, false);
          expect(after.has(fresh.idx(relic.cell.x, relic.cell.y))).toBe(true);
        });

        it('rend les dalles-mecanismes atteignables sans grille', () => {
          const set = grid.reachableThroughBlocks(parsed.playerSpawn, false);
          for (const m of parsed.mechanisms) {
            expect(set.has(grid.idx(m.x, m.y))).toBe(true);
          }
        });
      }
    });
  }
});
