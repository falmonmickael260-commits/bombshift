import { describe, expect, it } from 'vitest';
import { TileKind } from '../core/types';
import { defaultMapProgress, defaultSave, migrate } from '../core/save';
import { MAPS, MIRROR_LEVELS, isMirrorLevel, parseMap } from '../maps';
import { PortalController } from '../gameplay/portals';

describe('extension de campagne', () => {
  it('ajoute exactement vingt cartes sans déplacer les vingt identifiants existants', () => {
    expect(MAPS).toHaveLength(40);
    expect(MAPS.slice(0, 9).map((m) => m.id)).toEqual([
      'volcano', 'ice', 'temple', 'volcano2', 'ice2', 'temple2', 'volcano3', 'ice3', 'temple3',
    ]);
    expect(MAPS.slice(9).map((m) => m.id)).toEqual(Array.from({ length: 31 }, (_, i) => `level-${i + 10}`));
    expect(new Set(MAPS.map((m) => m.id)).size).toBe(40);
    expect(MAPS.map((m) => m.index)).toEqual(Array.from({ length: 40 }, (_, i) => i));
  });

  it('place les commandes miroir exactement aux multiples de dix', () => {
    expect(MAPS.filter((m) => m.mirrorControls ?? isMirrorLevel(m.index)).map((m) => m.index + 1))
      .toEqual(MIRROR_LEVELS);
    expect(isMirrorLevel(-1)).toBe(false);
    expect(isMirrorLevel(9.5)).toBe(false);
    expect(isMirrorLevel(49)).toBe(true);
  });

  it('ne recycle aucune ancienne carte dans les vingt nouvelles', () => {
    expect(new Set(MAPS.slice(20).map((m) => m.rows.join('\n'))).size).toBe(20);
    const old = new Set(MAPS.slice(0, 20).map((m) => m.rows.join('\n')));
    for (const def of MAPS.slice(20)) expect(old.has(def.rows.join('\n'))).toBe(false);
  });

  for (const def of MAPS.slice(20)) {
    it(`${def.id} reste réalisable sans traverser de lave et sans portail obligatoire`, () => {
      const p = parseMap(def);
      const grid = p.grid;
      // Model destructible passages and open timed doors; permanent lava remains impassable.
      grid.forEachTile((tile) => {
        if ([TileKind.Block, TileKind.Secret, TileKind.Door].includes(tile.kind)) tile.kind = TileKind.Floor;
      });
      const flood = (): Set<number> => {
        const seen = new Set<number>();
        const stack = [p.playerSpawn];
        while (stack.length) {
          const c = stack.pop()!;
          const i = grid.idx(c.x, c.y);
          if (!grid.inBounds(c.x, c.y) || seen.has(i) || grid.isSolid(c.x, c.y) || grid.isLethalFloor(c.x, c.y)) continue;
          seen.add(i);
          stack.push({ x: c.x + 1, y: c.y }, { x: c.x - 1, y: c.y }, { x: c.x, y: c.y + 1 }, { x: c.x, y: c.y - 1 });
        }
        return seen;
      };
      const before = flood();
      for (const prop of p.props) expect(before.has(grid.idx(prop.cell.x, prop.cell.y))).toBe(true);
      expect(before.has(grid.idx(p.bossSpawn.x, p.bossSpawn.y))).toBe(false);
      grid.openGates();
      const after = flood();
      expect(after.has(grid.idx(p.bossSpawn.x, p.bossSpawn.y))).toBe(true);
      expect(after.has(grid.idx(p.exit.x, p.exit.y))).toBe(true);
      for (const pair of def.portals ?? []) {
        for (const end of [pair.a, pair.b]) {
          expect(before.has(grid.idx(end.x, end.y))).toBe(true);
          expect(grid.kindAt(end.x, end.y)).toBe(TileKind.Floor);
        }
      }
      // Every hazard group in the map has a real timing configuration.
      grid.forEachTile((tile) => {
        if (tile.kind === TileKind.Vent) expect(def.vents?.some((c) => c.group === tile.group)).toBe(true);
        if (tile.kind === TileKind.Toxic) expect(def.toxic?.some((c) => c.group === tile.group)).toBe(true);
      });
    });
  }

  it('conserve une ancienne sauvegarde ayant terminé les vingt premiers niveaux et débloque le 21', () => {
    const old = defaultSave();
    old.unlockedMaps = 20;
    for (const def of MAPS.slice(0, 20)) {
      old.maps[def.id] = { ...defaultMapProgress(), cleared: true, bestScore: 12345, bestRank: 'SS', secrets: ['secret-1'] };
    }
    const migrated = migrate(JSON.parse(JSON.stringify(old)));
    expect(migrated.unlockedMaps).toBe(21);
    expect(migrated.maps).toEqual(old.maps);
    expect(migrated.settings).toEqual(old.settings);
  });

  it('conserve et recharge la progression jusqu’au dernier niveau', () => {
    const save = defaultSave();
    for (const def of MAPS.slice(0, 39)) save.maps[def.id] = { ...defaultMapProgress(), cleared: true };
    const restored = migrate(JSON.parse(JSON.stringify(save)));
    expect(restored.unlockedMaps).toBe(40);
  });
});

describe('portails', () => {
  const a = { x: 2, y: 3 }, b = { x: 15, y: 16 };
  it('transporte dans les deux sens après être sorti de la plateforme d’arrivée', () => {
    const portals = new PortalController([{ a, b }]);
    expect(portals.enter(a, () => true)).toEqual(b);
    expect(portals.enter(b, () => true)).toBeNull();
    expect(portals.enter(b, () => true)).toBeNull();
    portals.enter({ x: 14, y: 16 }, () => true);
    expect(portals.enter(b, () => true)).toEqual(a);
  });
  it('refuse une destination occupée ou dangereuse', () => {
    const portals = new PortalController([{ a, b }]);
    expect(portals.enter(a, () => false)).toBeNull();
    portals.enter({ x: 3, y: 3 }, () => true);
    expect(portals.enter(a, () => true)).toEqual(b);
  });
  it('ne change rien aux niveaux dépourvus de portail', () => {
    expect(new PortalController([]).enter(a, () => true)).toBeNull();
  });

  it('rejette les portails sur un mur, sur un objectif ou superposés', () => {
    const def = MAPS[29];
    expect(() => parseMap({ ...def, portals: [{ a: { x: 0, y: 0 }, b }] })).toThrow(/portail/);
    expect(() => parseMap({ ...def, portals: [{ a, b: a }] })).toThrow(/portail/);
    const prop = parseMap(def).props[0].cell;
    expect(() => parseMap({ ...def, portals: [{ a, b: prop }] })).toThrow(/portail/);
  });
});
