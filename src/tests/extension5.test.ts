import { describe,expect,it } from 'vitest';
import { MAPS,parseMap } from '../maps';
import {defaultSave,defaultMapProgress,migrate} from '../core/save';

describe('campagne 111–140',()=>{
 const pack=MAPS.slice(110);
 it('conserve les 110 niveaux existants et ajoute trente nouveaux niveaux uniques',()=>{
  expect(MAPS).toHaveLength(140);
  expect(pack).toHaveLength(30);
  expect(pack.map(m=>m.id)).toEqual(Array.from({length:30},(_,i)=>`level-${111+i}`));
  expect(pack.map(m=>m.index)).toEqual(Array.from({length:30},(_,i)=>110+i));
  const existing=new Set(MAPS.slice(0,110).map(m=>m.rows.join('\n')));
  expect(new Set(pack.map(m=>m.rows.join('\n'))).size).toBe(30);
  for(const level of pack)expect(existing.has(level.rows.join('\n'))).toBe(false);
 });
 it('préserve les jalons miroir tous les dix niveaux',()=>{
  expect(pack.filter(m=>m.mirrorControls).map(m=>m.index+1)).toEqual([120,130,140]);
 });
 it('les trente cartes possèdent les objectifs, boss, sorties, secrets et couloirs requis',()=>{
  for(const m of pack){
   const p=parseMap(m);
   expect(p.enemies.length).toBeGreaterThanOrEqual(12);
   expect(p.props).toHaveLength(3);
   expect(p.secrets).toHaveLength(m.secretCount);
   expect(p.mechanisms.length).toBeGreaterThanOrEqual(3);
   expect(p.exit).toBeTruthy();
   expect(p.bossSpawn).toBeTruthy();
  }
 });
 it('garde les anciens records et déverrouille la suite 111–140',()=>{
  const save=defaultSave();
  for(const m of MAPS.slice(0,110)) save.maps[m.id]={...defaultMapProgress(),cleared:true,bestTimeMs:321000};
  const after=migrate(save);
  expect(after.unlockedMaps).toBe(111);
  expect(after.maps['level-110'].bestTimeMs).toBe(321000);
  for(const m of pack.slice(0,29))after.maps[m.id]={...defaultMapProgress(),cleared:true};
  const later=migrate(after);
  expect(later.unlockedMaps).toBe(140);
  expect(later.maps['level-110'].bestTimeMs).toBe(321000);
 });
});
