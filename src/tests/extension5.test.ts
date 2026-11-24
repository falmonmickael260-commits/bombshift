import { describe, expect, it } from 'vitest';
import { TileKind } from '../core/types';
import { defaultSave, defaultMapProgress, migrate } from '../core/save';
import { EXTENSION_V } from '../maps/extension5';
import { MAPS, parseMap, isMirrorLevel } from '../maps';

describe('expédition 111–140 : solo + duo', () => {
  it('contient exactement trente nouveaux niveaux aux identifiants stables', () => {
    expect(EXTENSION_V).toHaveLength(30);
    expect(MAPS).toHaveLength(140);
    expect(EXTENSION_V.map(m => m.id)).toEqual(
      Array.from({ length: 30 }, (_, i) => 'level-' + (111 + i)),
    );
    expect(EXTENSION_V.map(m => m.index)).toEqual(
      Array.from({ length: 30 }, (_, i) => 110 + i),
    );
    expect(EXTENSION_V.filter(m => m.mirrorControls).map(m => m.index + 1)).toEqual([120, 130, 140]);
  });

  it('préserve les cent dix anciennes cartes et donne de nouveaux tracés distincts', () => {
    const originals = new Set(MAPS.slice(0, 110).map(m => m.rows.join('\n')));
    const next = EXTENSION_V.map(m => m.rows.join('\n'));
    expect(new Set(next).size).toBe(30);
    for (const layout of next) expect(originals.has(layout)).toBe(false);
  });

  for (const def of EXTENSION_V) {
    it('niveau ' + (def.index + 1) + ' : parsable et itinéraire principal libre après ouverture des portes', () => {
      expect(def.mirrorControls).toBe(isMirrorLevel(def.index));
      const parsed = parseMap(def);
      const grid = parsed.grid;
      expect(parsed.enemies.length).toBe(14);
      grid.forEachTile(tile => {
        if ([TileKind.Block, TileKind.Secret, TileKind.Door].includes(tile.kind)) tile.kind = TileKind.Floor;
      });
      const visit = () => {
        const seen = new Set<number>();
        const queue = [parsed.playerSpawn];
        for (const cell of queue) {
          if (!grid.inBounds(cell.x, cell.y) || grid.isSolid(cell.x, cell.y) || grid.isLethalFloor(cell.x, cell.y)) continue;
          const index = grid.idx(cell.x, cell.y);
          if (seen.has(index)) continue;
          seen.add(index);
          queue.push({ x: cell.x + 1, y: cell.y }, { x: cell.x - 1, y: cell.y },
            { x: cell.x, y: cell.y + 1 }, { x: cell.x, y: cell.y - 1 });
        }
        return seen;
      };
      const before = visit();
      for (const prop of parsed.props) expect(before.has(grid.idx(prop.cell.x, prop.cell.y))).toBe(true);
      for (const button of parsed.mechanisms) expect(before.has(grid.idx(button.x, button.y))).toBe(true);
      grid.openGates();
      const after = visit();
      expect(after.has(grid.idx(parsed.bossSpawn.x, parsed.bossSpawn.y))).toBe(true);
      expect(after.has(grid.idx(parsed.exit.x, parsed.exit.y))).toBe(true);
    });
  }

  it('conserve tous les anciens records après extension', () => {
    const save = defaultSave();
    MAPS.slice(0, 110).forEach(map => {
      save.maps[map.id] = { ...defaultMapProgress(), cleared: true, bestTimeMs: 128000 };
    });
    const restored = migrate(JSON.parse(JSON.stringify(save)));
    expect(restored.unlockedMaps).toBe(111);
    expect(restored.maps).toEqual(save.maps);
    restored.maps['level-140'] = { ...defaultMapProgress(), cleared: true, bestTimeMs: 85000 };
    const after = migrate(JSON.parse(JSON.stringify(restored)));
    expect(after.maps['level-140'].bestTimeMs).toBe(85000);
  });
});
