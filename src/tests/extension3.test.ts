import { describe, expect, it } from 'vitest';
import { MAPS, parseMap } from '../maps';
import { defaultSave, defaultMapProgress, migrate } from '../core/save';
import { formatSpeedTime, parseSpeedEntries } from '../ui/leaderboard';

describe('campagne 61–80 et rapidité',()=>{
  it('ajoute vingt parcours originaux et quatre nouveaux univers',()=>{
    const pack=MAPS.slice(60,80);
    expect(pack).toHaveLength(20);
    expect(new Set(pack.map(m=>m.theme))).toEqual(new Set(['jungle','candy','abyss','lunar','mirror']));
    expect(pack.filter(m=>m.mirrorControls).map(m=>m.index+1)).toEqual([70,80]);
    const old=new Set(MAPS.slice(0,60).map(m=>m.rows.join('\n')));
    expect(new Set(pack.map(m=>m.rows.join('\n'))).size).toBe(20);
    for(const def of pack){expect(old.has(def.rows.join('\n'))).toBe(false);expect(parseMap(def).enemies).toHaveLength(12);}
  });
  it('débloque le niveau 61 sans perdre les records et conserve le dernier niveau',()=>{
    const save=defaultSave();
    for(const def of MAPS.slice(0,60))save.maps[def.id]={...defaultMapProgress(),cleared:true,bestTimeMs:123456,bestRank:'S'};
    save.unlockedMaps=60;const restored=migrate(JSON.parse(JSON.stringify(save)));
    expect(restored.unlockedMaps).toBe(61);expect(restored.maps).toEqual(save.maps);
    restored.maps['level-80']={...defaultMapProgress(),cleared:true,bestTimeMs:654321};
    expect(migrate(restored).unlockedMaps).toBe(81);expect(migrate(restored).maps['level-80'].bestTimeMs).toBe(654321);
  });
  it('affiche les centièmes et trie les résultats sans accepter les temps invalides',()=>{
    expect(formatSpeedTime(123456)).toBe('2:03.45');
    expect(parseSpeedEntries([{username:'A',best_time_ms:2500},{username:'B',best_time_ms:1200}]).map(e=>e.username)).toEqual(['B','A']);
    for(const time of [null,-1,0,Infinity,'1234'])expect(()=>parseSpeedEntries([{username:'A',best_time_ms:time}])).toThrow();
    expect(parseSpeedEntries([])).toEqual([]);
  });
});
