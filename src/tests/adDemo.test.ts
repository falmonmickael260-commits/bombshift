import { describe, expect, it } from 'vitest';
import { AD_CREATIVES, AD_DEMO_MS, AdDemoPreferences, VisibleAdClock } from '../ui/adDemo';

describe('publicité de démonstration', () => {
  it('alterne les quatre jeux même après un rechargement et une réactivation', () => {
    let saved: string | null = null;
    const storage = { getItem: () => saved, setItem: (_key: string, value: string) => { saved = value; } };
    const demo = new AdDemoPreferences(storage);
    expect(demo.nextCreative().id).toBe('camouflip');
    const reloaded = new AdDemoPreferences(storage);
    reloaded.set({ enabled: true, removed: false });
    expect([reloaded.nextCreative().id, reloaded.nextCreative().id, reloaded.nextCreative().id]).toEqual(['la-meute', 'president', 'kilomax']);
    expect(reloaded.nextCreative().id).toBe('camouflip');
    expect(AD_CREATIVES).toHaveLength(4);
  });
  it('exige trente secondes réellement visibles', () => {
    const clock = new VisibleAdClock();clock.sample(0,true);clock.sample(29_999,true);
    expect(clock.done).toBe(false);expect(clock.seconds).toBe(1);
    clock.sample(30_000,true);expect(clock.done).toBe(true);expect(clock.remainingMs).toBe(0);
  });
  it('ne compte ni un onglet masqué ni le dialogue d’achat simulé', () => {
    const clock = new VisibleAdClock();clock.sample(0,true);clock.sample(5000,true);
    clock.sample(5000,false);clock.sample(65000,false);clock.sample(65000,true);
    expect(clock.remainingMs).toBe(25000);clock.sample(90000,true);expect(clock.done).toBe(true);
  });
  it('est désactivée par défaut et ne modifie pas la sauvegarde du jeu', () => {
    const values = new Map<string,string>([['bombshift.save','original-progress']]);
    const storage = {getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>{values.set(k,v);}};
    const demo = new AdDemoPreferences(storage);expect(demo.shouldShow).toBe(false);
    demo.set({enabled:true,removed:false});expect(demo.shouldShow).toBe(true);
    demo.set({enabled:true,removed:true});expect(new AdDemoPreferences(storage).shouldShow).toBe(false);
    expect(values.get('bombshift.save')).toBe('original-progress');
    demo.set({enabled:false,removed:false});expect(demo.shouldShow).toBe(false);
  });
  it('supporte un stockage indisponible et un état endommagé', () => {
    const demo = new AdDemoPreferences(null);demo.set({enabled:true,removed:false});expect(demo.shouldShow).toBe(true);
    expect(new AdDemoPreferences({getItem:()=>'{broken',setItem:()=>{throw Error('quota');}}).shouldShow).toBe(false);
    expect(AD_DEMO_MS).toBe(30000);
  });
});
