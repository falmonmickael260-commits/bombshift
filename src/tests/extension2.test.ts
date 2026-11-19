import { describe, expect, it, vi } from 'vitest';
import { MAPS, parseMap, isMirrorLevel } from '../maps';
import { defaultMapProgress, defaultSave, migrate } from '../core/save';
import { HazardController } from '../gameplay/hazards';
import type { World } from '../gameplay/worldApi';
import { TileKind } from '../core/types';
import { GridMap } from '../core/grid';
import { computeBlast } from '../gameplay/blast';

const pack = MAPS.slice(40,60);
describe('nouveaux niveaux 41–60', () => {
  it('ajoute vingt cartes et cinq identités visuelles distinctes, dont deux miroirs', () => {
    expect(pack).toHaveLength(20);
    expect(pack.map((m) => m.id)).toEqual(Array.from({length:20},(_,i)=>`level-${i+41}`));
    expect(new Set(pack.map((m) => m.theme))).toEqual(new Set(['fungal','sky','clockwork','haunted','mirror']));
    expect(pack.filter((m) => m.mirrorControls).map((m)=>m.index+1)).toEqual([50,60]);
    expect(pack.every((m)=>(m.mirrorControls??false)===isMirrorLevel(m.index))).toBe(true);
    const old = new Set(MAPS.slice(0,40).map((m)=>m.rows.join('\n')));
    expect(new Set(pack.map((m)=>m.rows.join('\n'))).size).toBe(20);
    expect(pack.every((m)=>!old.has(m.rows.join('\n')))).toBe(true);
    expect(new Set(pack.map((m)=>`${m.rows[0].length}x${m.rows.length}`)).size).toBeGreaterThanOrEqual(6);
  });

  it('conserve une sauvegarde ayant terminé les quarante premiers niveaux et débloque le 41', () => {
    const save=defaultSave();
    for(const def of MAPS.slice(0,40)) save.maps[def.id]={...defaultMapProgress(),cleared:true,bestScore:15000,bestRank:'SS',secrets:[`${def.id}-s1`]};
    save.unlockedMaps=40;
    const restored=migrate(JSON.parse(JSON.stringify(save)));
    expect(restored.unlockedMaps).toBe(41);
    expect(restored.maps).toEqual(save.maps);
  });

  it('conserve le niveau 60 et ses records après rechargement d’une sauvegarde partielle', () => {
    const raw=defaultSave();raw.maps['level-59']={...defaultMapProgress(),cleared:true,bestScore:16000};
    const restored=migrate(JSON.parse(JSON.stringify(raw)));
    expect(restored.unlockedMaps).toBe(60);
    expect(restored.maps['level-59'].bestScore).toBe(16000);
    const last=defaultSave();last.maps['level-60']={...defaultMapProgress(),cleared:true,bestScore:18000};
    expect(migrate(JSON.parse(JSON.stringify(last))).unlockedMaps).toBe(61);
  });

  it('le mycélium ralentit sans devenir solide ni bloquer une explosion', () => {
    const g=new GridMap(7,5,TileKind.Floor);g.setTile(3,2,TileKind.Moss);
    expect(g.groundSpeedAt(3,2)).toBe(0.68);
    expect(g.groundSpeedAt(2,2)).toBe(1);
    expect(g.isSolid(3,2)).toBe(false);expect(g.isLethalFloor(3,2)).toBe(false);
    expect(computeBlast(g,{x:2,y:2},3,0).cells.some((c)=>c.x===5&&c.y===2)).toBe(true);
    for(const def of pack.filter((m)=>m.theme==='fungal')) expect(parseMap(def).grid.tiles.some((t)=>t.kind===TileKind.Moss)).toBe(true);
  });

  for(const def of pack.filter((m)=>m.mechanismTrigger==='blast')) {
    it(`${def.id} exige une explosion et mémorise ses lanternes / rouages une seule fois`, () => {
      const parsed=parseMap(def);const onDone=vi.fn();const onProgress=vi.fn();
      const world={grid:parsed.grid,elapsedMs:0,audio:{play:vi.fn()},fx:{shockwave:vi.fn()}} as unknown as World;
      const controller=new HazardController(world,parsed,{onTileChanged:vi.fn(),onMechanismComplete:onDone,onMechanismProgress:onProgress});
      for(const c of parsed.mechanisms) controller.onPlayerEnterCell(c);
      expect(controller.mechanismProgress.done).toBe(0);
      expect(def.objectives.find((o)=>o.id==='mechanism')?.mandatory).toBe(true);
      for(const c of parsed.mechanisms) {controller.onBlastCells([c]);controller.onBlastCells([c]);}
      expect(controller.mechanismProgress.done).toBe(parsed.mechanisms.length);
      expect(onDone).toHaveBeenCalledTimes(1);
      const restored=new HazardController(world,parsed,{onTileChanged:vi.fn(),onMechanismComplete:vi.fn(),onMechanismProgress:vi.fn()});
      restored.syncMechanismsFromGrid();
      expect(restored.mechanismProgress.done).toBe(parsed.mechanisms.length);
    });
  }
});
