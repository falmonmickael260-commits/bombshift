import { describe, expect, it } from 'vitest';
import { MAPS, parseMap } from '../maps';
import { defaultMapProgress, defaultSave, migrate } from '../core/save';

describe('extension 81–110',()=>{
  const pack=MAPS.slice(80,110);
  it('ajoute trente tracés distincts, six univers et les trois miroirs attendus',()=>{
    expect(pack).toHaveLength(30);
    expect(pack.filter(m=>m.mirrorControls).map(m=>m.index+1)).toEqual([90,100,110]);
    expect(new Set(pack.map(m=>m.theme))).toEqual(new Set(['ocean','desert','electric','sky','clockwork','haunted','mirror']));
    const old=new Set(MAPS.slice(0,80).map(m=>m.rows.join('\n')));
    expect(new Set(pack.map(m=>m.rows.join('\n'))).size).toBe(30);
    for(const def of pack){expect(old.has(def.rows.join('\n'))).toBe(false);const p=parseMap(def);expect(p.enemies).toHaveLength(14);expect(p.mechanisms.length).toBeGreaterThanOrEqual(3);}
  });
  it('augmente modérément la pression tout en gardant des avertissements lisibles',()=>{
    for(const def of pack){
      expect(def.bossHp).toBeGreaterThanOrEqual(14);expect(def.bossHp).toBeLessThanOrEqual(16);
      for(const cycle of def.toxic??[])expect(cycle.warnMs).toBeGreaterThanOrEqual(1800);
      for(const door of def.doors??[])expect(door.closedRatio).toBeLessThanOrEqual(.35);
    }
  });
  it('reprend une campagne terminée au 80 et conserve les records du niveau 110',()=>{
    const save=defaultSave();for(const def of MAPS.slice(0,80))save.maps[def.id]={...defaultMapProgress(),cleared:true,bestTimeMs:123456,bestRank:'SS'};
    save.unlockedMaps=80;const restored=migrate(JSON.parse(JSON.stringify(save)));
    expect(restored.unlockedMaps).toBe(81);expect(restored.maps).toEqual(save.maps);
    restored.maps['level-109']={...defaultMapProgress(),cleared:true};expect(migrate(restored).unlockedMaps).toBe(110);
    restored.maps['level-110']={...defaultMapProgress(),cleared:true,bestTimeMs:234567};const reloaded=migrate(JSON.parse(JSON.stringify(restored)));
    expect(reloaded.unlockedMaps).toBe(110);expect(reloaded.maps['level-110'].bestTimeMs).toBe(234567);
  });
});
