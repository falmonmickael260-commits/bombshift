import type { Difficulty, Rank } from './types';

export const SAVE_SCHEMA = 3;
const STORAGE_KEY = 'bombshift.save';

export interface MapProgress {
  cleared: boolean;
  bestScore: number;
  bestRank: Rank | null;
  bestTimeMs: number | null;
  attempts: number;
  wins: number;
  /** Secrets decouverts (identifiants stables definis par la carte). */
  secrets: string[];
  objectivesSeen: number;
}

export interface Settings {
  sfxVolume: number;
  musicVolume: number;
  screenShake: boolean;
  /** Niveau d'effets : limite les particules sur mobile d'entree de gamme. */
  effects: 'low' | 'medium' | 'high';
  joystickSide: 'left' | 'right';
  joystickSize: number;
  showDangerHints: boolean;
  haptics: boolean;
  /** Niveau de difficulte choisi. */
  difficulty: Difficulty;
  /** Supprime les flashs plein ecran (confort visuel / photosensibilite). */
  reduceFlashes: boolean;
}

export interface GlobalStats {
  totalKills: number;
  totalDeaths: number;
  totalBombs: number;
  totalBlocks: number;
  totalPowerups: number;
  totalPlaytimeMs: number;
  runs: number;
}

export interface Abilities {
  /** Bombe SHIFT : glisse jusqu'a l'obstacle. Debloquee en battant la carte 1. */
  shift: boolean;
  /** Charge lente : longue meche, grande portee. Debloquee en battant la carte 2. */
  slow: boolean;
}

export interface SaveData {
  schema: number;
  unlockedMaps: number;
  maps: Record<string, MapProgress>;
  settings: Settings;
  stats: GlobalStats;
  abilities: Abilities;
}

export function defaultMapProgress(): MapProgress {
  return {
    cleared: false,
    bestScore: 0,
    bestRank: null,
    bestTimeMs: null,
    attempts: 0,
    wins: 0,
    secrets: [],
    objectivesSeen: 0,
  };
}

export function defaultSave(): SaveData {
  return {
    schema: SAVE_SCHEMA,
    unlockedMaps: 1,
    maps: {},
    settings: {
      sfxVolume: 0.8,
      musicVolume: 0.45,
      screenShake: true,
      effects: 'high',
      joystickSide: 'left',
      joystickSize: 1,
      showDangerHints: true,
      haptics: true,
      difficulty: 'normal',
      reduceFlashes: false,
    },
    stats: {
      totalKills: 0,
      totalDeaths: 0,
      totalBombs: 0,
      totalBlocks: 0,
      totalPowerups: 0,
      totalPlaytimeMs: 0,
      runs: 0,
    },
    abilities: { shift: false, slow: false },
  };
}

/** Migration ascendante : toute sauvegarde plus ancienne est completee sans perte. */
export function migrate(raw: unknown): SaveData {
  const base = defaultSave();
  if (!raw || typeof raw !== 'object') return base;
  const data = raw as Partial<SaveData> & { schema?: number };

  const merged: SaveData = {
    schema: SAVE_SCHEMA,
    unlockedMaps: clampInt(data.unlockedMaps ?? 1, 1, 3),
    maps: {},
    settings: { ...base.settings, ...(data.settings ?? {}) },
    stats: { ...base.stats, ...(data.stats ?? {}) },
    abilities: { ...base.abilities, ...(data.abilities ?? {}) },
  };

  if (data.maps && typeof data.maps === 'object') {
    for (const [key, value] of Object.entries(data.maps)) {
      const p = { ...defaultMapProgress(), ...(value as MapProgress) };
      p.secrets = Array.isArray(p.secrets) ? [...new Set(p.secrets)] : [];
      merged.maps[key] = p;
    }
  }

  // Schema 1 -> 2 : les capacites n'existaient pas, on les deduit des cartes terminees.
  if ((data.schema ?? 1) < 2) {
    merged.abilities.shift = merged.maps['volcano']?.cleared ?? false;
    merged.abilities.slow = merged.maps['ice']?.cleared ?? false;
  }

  // Coherence : le deblocage doit refleter les victoires reelles.
  let unlocked = 1;
  if (merged.maps['volcano']?.cleared) unlocked = 2;
  if (merged.maps['ice']?.cleared) unlocked = 3;
  merged.unlockedMaps = Math.max(unlocked, 1);

  for (const s of [merged.settings]) {
    s.sfxVolume = clamp01(s.sfxVolume);
    s.musicVolume = clamp01(s.musicVolume);
    s.joystickSize = Math.min(1.4, Math.max(0.7, s.joystickSize || 1));
    if (s.effects !== 'low' && s.effects !== 'medium' && s.effects !== 'high') {
      s.effects = 'high';
    }
    if (s.joystickSide !== 'left' && s.joystickSide !== 'right') s.joystickSide = 'left';
    if (s.difficulty !== 'detente' && s.difficulty !== 'normal' && s.difficulty !== 'veteran') {
      s.difficulty = 'normal';
    }
    s.reduceFlashes = s.reduceFlashes === true;
  }

  return merged;
}

function clamp01(v: number): number {
  return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0.5;
}

function clampInt(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(Number.isFinite(v) ? v : min)));
}

type Listener = (data: SaveData) => void;

/**
 * Gestionnaire de sauvegarde locale.
 * Resiste a un localStorage indisponible (mode prive, quota) : on garde la
 * progression en memoire pour ne jamais casser la session de jeu.
 */
export class SaveManager {
  private data: SaveData;
  private listeners = new Set<Listener>();
  private writeTimer: ReturnType<typeof setTimeout> | null = null;
  private storageOk = true;

  constructor(private readonly storage: Storage | null = safeStorage()) {
    this.data = this.read();
  }

  private read(): SaveData {
    if (!this.storage) return defaultSave();
    try {
      const raw = this.storage.getItem(STORAGE_KEY);
      if (!raw) return defaultSave();
      return migrate(JSON.parse(raw));
    } catch {
      return defaultSave();
    }
  }

  get(): Readonly<SaveData> {
    return this.data;
  }

  get settings(): Readonly<Settings> {
    return this.data.settings;
  }

  onChange(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  update(mutator: (data: SaveData) => void): void {
    mutator(this.data);
    this.flushSoon();
    for (const fn of this.listeners) fn(this.data);
  }

  mapProgress(id: string): MapProgress {
    if (!this.data.maps[id]) this.data.maps[id] = defaultMapProgress();
    return this.data.maps[id];
  }

  isMapUnlocked(index: number): boolean {
    return index < this.data.unlockedMaps;
  }

  private flushSoon(): void {
    if (this.writeTimer !== null) return;
    this.writeTimer = setTimeout(() => {
      this.writeTimer = null;
      this.flush();
    }, 180);
  }

  flush(): void {
    if (!this.storage || !this.storageOk) return;
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // Quota ou mode prive : on continue en memoire uniquement.
      this.storageOk = false;
    }
  }

  reset(): void {
    this.data = defaultSave();
    this.flush();
    for (const fn of this.listeners) fn(this.data);
  }
}

function safeStorage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const probe = '__bombshift_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return localStorage;
  } catch {
    return null;
  }
}

/* ===================================================================== */
/* Sauvegarde de la tentative en cours                                   */
/* ===================================================================== */

const RUN_KEY = 'bombshift.run';
const RUN_VERSION = 1;

/**
 * Instantane d'une tentative en cours.
 *
 * Les bombes, flammes et projectiles ne sont volontairement pas conserves :
 * reprendre au milieu d'une explosion serait injuste. Tout le reste
 * (grille, objectifs, bonus au sol, ennemis, boss, statistiques) est restaure.
 */
export interface RunSnapshot {
  v: number;
  mapId: string;
  difficulty: string;
  elapsedMs: number;
  savedAt: number;
  /** Type de chaque case, dans l'ordre de la grille. */
  tileKinds: number[];
  /** Index des faux murs reveles. */
  revealed: number[];
  /** Index des dalles-mecanismes enclenchees. */
  latched: number[];
  player: {
    cx: number;
    cy: number;
    lives: number;
    maxBombs: number;
    range: number;
    speedBonus: number;
    pierceCharges: number;
    shieldLeftMs: number;
  };
  enemies: { kind: string; cx: number; cy: number; hp: number; asleep: boolean }[];
  powerups: { kind: string; cx: number; cy: number }[];
  propsDone: boolean[];
  objectives: { id: string; current: number; done: boolean }[];
  boss: { hp: number; active: boolean; phase: number; alive: boolean } | null;
  stats: Record<string, number>;
  secrets: number[];
}

function runStorage(): Storage | null {
  return safeStorage();
}

export function saveRun(snapshot: RunSnapshot): void {
  const storage = runStorage();
  if (!storage) return;
  try {
    storage.setItem(RUN_KEY, JSON.stringify({ ...snapshot, v: RUN_VERSION }));
  } catch {
    // Quota depasse : on abandonne silencieusement, la partie continue.
  }
}

export function loadRun(): RunSnapshot | null {
  const storage = runStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(RUN_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as RunSnapshot;
    if (!data || data.v !== RUN_VERSION || typeof data.mapId !== 'string') return null;
    if (!Array.isArray(data.tileKinds) || data.tileKinds.length === 0) return null;
    return data;
  } catch {
    return null;
  }
}

export function clearRun(): void {
  const storage = runStorage();
  if (!storage) return;
  try {
    storage.removeItem(RUN_KEY);
  } catch {
    /* rien a faire */
  }
}
