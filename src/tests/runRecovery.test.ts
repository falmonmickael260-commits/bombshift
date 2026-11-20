import { describe, expect, it } from 'vitest';
import { RunRecovery } from '../ui/runRecovery';

describe('reprise de l’onglet mobile',()=>{
  it('retrouve la carte après rechargement et oublie une partie quittée volontairement',()=>{
    const values=new Map<string,string>();
    const storage={getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>{values.set(k,v);},removeItem:(k:string)=>{values.delete(k);}};
    const recovery=new RunRecovery(storage);expect(recovery.mapId).toBeNull();recovery.mark('level-110');
    expect(new RunRecovery(storage).mapId).toBe('level-110');recovery.clear();expect(new RunRecovery(storage).mapId).toBeNull();
  });
  it('tolère un stockage bloqué sans empêcher de jouer',()=>{
    const recovery=new RunRecovery({getItem:()=>{throw Error('blocked');},setItem:()=>{throw Error('blocked');},removeItem:()=>{throw Error('blocked');}});
    expect(()=>recovery.mark('volcano')).not.toThrow();expect(recovery.mapId).toBeNull();expect(()=>recovery.clear()).not.toThrow();
    expect(new RunRecovery(null).mapId).toBeNull();
  });
});
