import { beforeEach, describe, expect, it } from 'vitest';
import { defaultSave, migrate, SaveManager, SAVE_SCHEMA } from '../core/save';

class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length(): number {
    return this.map.size;
  }
  clear(): void {
    this.map.clear();
  }
  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }
  key(index: number): string | null {
    return [...this.map.keys()][index] ?? null;
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

describe('sauvegarde', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  it('demarre avec une seule carte debloquee', () => {
    const d = defaultSave();
    expect(d.unlockedMaps).toBe(1);
    expect(d.abilities.shift).toBe(false);
    expect(d.schema).toBe(SAVE_SCHEMA);
  });

  it('ignore une sauvegarde corrompue sans planter', () => {
    expect(migrate(null).unlockedMaps).toBe(1);
    expect(migrate('???').unlockedMaps).toBe(1);
    expect(migrate({ unlockedMaps: 99 }).unlockedMaps).toBe(1);
  });

  it('migre un ancien schema et en deduit les capacites', () => {
    const old = {
      schema: 1,
      unlockedMaps: 3,
      maps: { volcano: { cleared: true, bestScore: 5000, secrets: ['a', 'a'] } },
      settings: { sfxVolume: 2, musicVolume: -1, effects: 'ultra', joystickSide: 'top' },
    };
    const m = migrate(old);
    expect(m.schema).toBe(SAVE_SCHEMA);
    expect(m.abilities.shift).toBe(true);
    expect(m.abilities.slow).toBe(false);
    // Le deblocage est recalcule d'apres les victoires reelles.
    expect(m.unlockedMaps).toBe(2);
    expect(m.maps.volcano.secrets).toEqual(['a']);
    expect(m.settings.sfxVolume).toBe(1);
    expect(m.settings.musicVolume).toBe(0);
    expect(m.settings.effects).toBe('high');
    expect(m.settings.joystickSide).toBe('left');
  });

  it('ne debloque jamais une carte sans victoire reelle', () => {
    const m = migrate({ schema: 2, unlockedMaps: 3, maps: {} });
    expect(m.unlockedMaps).toBe(1);
  });

  it('persiste et relit la progression', () => {
    const a = new SaveManager(storage);
    a.update((d) => {
      d.maps.volcano = { ...a.mapProgress('volcano'), cleared: true, bestScore: 9000, bestRank: 'S' };
      d.unlockedMaps = 2;
      d.abilities.shift = true;
    });
    a.flush();

    const b = new SaveManager(storage);
    expect(b.get().maps.volcano.bestScore).toBe(9000);
    expect(b.get().maps.volcano.bestRank).toBe('S');
    expect(b.get().unlockedMaps).toBe(2);
    expect(b.get().abilities.shift).toBe(true);
  });

  it('fonctionne sans stockage disponible', () => {
    const m = new SaveManager(null);
    m.update((d) => {
      d.stats.totalKills = 5;
    });
    expect(m.get().stats.totalKills).toBe(5);
    expect(() => m.flush()).not.toThrow();
  });

  it('remet tout a zero sur demande', () => {
    const m = new SaveManager(storage);
    m.update((d) => {
      d.unlockedMaps = 3;
    });
    m.reset();
    expect(m.get().unlockedMaps).toBe(1);
  });
});
