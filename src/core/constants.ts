import type { Difficulty, DifficultyProfile, Theme } from './types';

/**
 * Niveaux de difficulte.
 * Ils agissent sur la pression (vitesse et perception des ennemis, rythme des
 * boss) et non sur les points de vie : le jeu reste lisible et equitable,
 * seule l'exigence change.
 */
export const DIFFICULTIES: Readonly<Record<Difficulty, DifficultyProfile>> = {
  detente: {
    id: 'detente',
    label: 'Detente',
    description: '4 vies, ennemis plus lents, boss plus lisibles. Pour decouvrir.',
    lives: 4,
    enemySpeed: 0.78,
    enemyAggro: 0.75,
    bossWindow: 1.45,
    bossCooldown: 1.35,
    invuln: 1.35,
    scoreFactor: 0.8,
  },
  normal: {
    id: 'normal',
    label: 'Normal',
    description: '3 vies. L\'equilibre prevu par le jeu.',
    lives: 3,
    enemySpeed: 1,
    enemyAggro: 1,
    bossWindow: 1,
    bossCooldown: 1,
    invuln: 1,
    scoreFactor: 1,
  },
  veteran: {
    id: 'veteran',
    label: 'Veteran',
    description: '3 vies, ennemis rapides et tenaces, boss impitoyables. Score majore.',
    lives: 3,
    enemySpeed: 1.18,
    enemyAggro: 1.3,
    bossWindow: 0.78,
    bossCooldown: 0.78,
    invuln: 0.85,
    scoreFactor: 1.25,
  },
};

/** Taille d'une case en pixels (les textures sont generees a cette taille). */
export const TILE = 48;

/** Reglages de deplacement. */
export const MOVE = {
  /** Vitesse de base du joueur en px/s. */
  baseSpeed: 150,
  /** Gain par bonus de vitesse. */
  speedStep: 22,
  maxSpeed: 260,
  /** Rayon de collision du joueur (fraction de TILE). */
  radius: 0.34,
  /** Force de recentrage dans le couloir (px/s). */
  laneSnap: 320,
  /** Acceleration sur sol normal (px/s^2) : reactivite quasi immediate. */
  accel: 2400,
  friction: 2600,
  /** Sol glissant : acceleration faible, friction faible => inertie. */
  iceAccel: 620,
  iceFriction: 250,
} as const;

/** Reglages des bombes et explosions. */
export const BOMB = {
  fuseMs: 2200,
  slowFuseMs: 3600,
  /** Delai avant detonation d'une bombe touchee par une explosion. */
  chainDelayMs: 70,
  /** Duree de vie des flammes. */
  flameMs: 440,
  baseRange: 2,
  maxRange: 7,
  baseCount: 1,
  maxCount: 6,
  /** Nombre de blocs traverses par une bombe perforante. */
  pierceBlocks: 1,
  /** Vitesse de glissement de la bombe SHIFT (px/s). */
  shiftSpeed: 330,
  abilityCooldownMs: 6500,
} as const;

/** Reglages du joueur. */
export const PLAYER = {
  startLives: 3,
  maxLives: 5,
  invulnMs: 1400,
  shieldMs: 7000,
  /** Delai anti double-action sur les boutons tactiles. */
  inputDebounceMs: 110,
  /** Invulnerabilite offerte au debut d'une tentative (temps de s'orienter). */
  spawnGraceMs: 1600,
  /** Distance (en cases) a laquelle un ennemi endormi se reveille. */
  wakeRadius: 9,
} as const;

/** Degats et resistances. */
export const COMBAT = {
  enemyHp: {
    patroller: 1,
    chaser: 1,
    flanker: 1,
    coward: 1,
    heavy: 3,
    guardian: 2,
  },
  /** Invulnerabilite d'un ennemi apres un coup (evite les multi-hits d'une meme explosion). */
  enemyHitCooldownMs: 320,
  bossHitCooldownMs: 700,
} as const;

/** Probabilites de bonus par bloc detruit (somme <= 1, le reste = rien). */
export const DROP_TABLE: Readonly<Record<Theme, Readonly<Record<string, number>>>> = {
  volcano: { range: 0.1, bomb: 0.09, speed: 0.06, shield: 0.04, pierce: 0.03, life: 0.012 },
  ice: { range: 0.09, bomb: 0.08, speed: 0.05, shield: 0.05, pierce: 0.035, life: 0.01 },
  temple: { range: 0.08, bomb: 0.07, speed: 0.045, shield: 0.05, pierce: 0.04, life: 0.008 },
};

/** Duree des bonus temporaires. */
export const POWERUP = {
  shieldMs: PLAYER.shieldMs,
  /** Charges accordees par un bonus perforant. */
  pierceCharges: 3,
} as const;

/** Bareme de score. */
export const SCORING = {
  perKill: 120,
  perBoss: 2500,
  perObjective: 600,
  perSecret: 800,
  /** Bonus de temps maximum, decroissant jusqu'a parTimeMs. */
  timeBonusMax: 3000,
  /** Au-dela de cette duree le bonus de temps est nul. */
  timeBonusZeroMs: 12 * 60 * 1000,
  noDamageBonus: 1500,
  perLifeLeft: 500,
} as const;

/** Reglages de l'IA. */
export const AI = {
  /** Frequence de reflexion (ms) : limite le cout CPU sur mobile. */
  thinkIntervalMs: 160,
  /** Budget de cases explorees par recherche de chemin. */
  pathBudget: 900,
  /** Un ennemi considere une case dangereuse si l'explosion arrive dans ce delai. */
  dangerHorizonMs: 1700,
  /** Cout additionnel d'une case dangereuse dans A*. */
  dangerCost: 26,
} as const;

export const CAMERA = {
  /** Nombre de cases visibles cible (largeur x hauteur) : conserve la lisibilite. */
  viewTilesX: 10,
  viewTilesY: 8,
  minZoom: 0.45,
  maxZoom: 2.2,
  shakeSmall: 0.004,
  shakeBig: 0.011,
} as const;

/** Palettes par theme (utilisees par le generateur de textures et les effets). */
export const THEME_COLORS: Readonly<
  Record<
    Theme,
    {
      floorA: number;
      floorB: number;
      grout: number;
      wallTop: number;
      wallSide: number;
      blockTop: number;
      blockSide: number;
      accent: number;
      hazard: number;
      glow: number;
      bg: number;
      fog: number;
    }
  >
> = {
  volcano: {
    floorA: 0x2b2229,
    floorB: 0x221b21,
    grout: 0x140f14,
    wallTop: 0x4a3b42,
    wallSide: 0x2a2026,
    blockTop: 0x6b4a3a,
    blockSide: 0x3d281f,
    accent: 0xff7a2f,
    hazard: 0xff4a14,
    glow: 0xffb347,
    bg: 0x120a0c,
    fog: 0x3a1410,
  },
  ice: {
    floorA: 0x24415c,
    floorB: 0x1d3550,
    grout: 0x122233,
    wallTop: 0x4e7fa6,
    wallSide: 0x27465f,
    blockTop: 0x8fd4f0,
    blockSide: 0x4d8bab,
    accent: 0x6ee7ff,
    hazard: 0x9bf0ff,
    glow: 0xd6f7ff,
    bg: 0x081722,
    fog: 0x11384d,
  },
  temple: {
    floorA: 0x2f3a2a,
    floorB: 0x27321f,
    grout: 0x161c12,
    wallTop: 0x5d6150,
    wallSide: 0x33372b,
    blockTop: 0x4f7a39,
    blockSide: 0x2d4722,
    accent: 0xc9a227,
    hazard: 0x7cd44a,
    glow: 0xf2e08a,
    bg: 0x0d130c,
    fog: 0x1d2e18,
  },
};

/** Cles de textures generees. */
export const TEX = {
  floor: (t: Theme, v: number) => `tile-floor-${t}-${v}`,
  wall: (t: Theme) => `tile-wall-${t}`,
  block: (t: Theme, v: number) => `tile-block-${t}-${v}`,
  crystal: 'tile-crystal',
  ice: (v: number) => `tile-ice-${v}`,
  lava: 'tile-lava',
  vent: 'tile-vent',
  toxic: 'tile-toxic',
  door: 'tile-door',
  gate: 'tile-gate',
  exit: 'tile-exit',
  plate: 'tile-plate',
  rubble: (t: Theme) => `tile-rubble-${t}`,
  player: 'spr-player',
  enemy: (k: string) => `spr-enemy-${k}`,
  boss: (k: string) => `spr-boss-${k}`,
  bomb: 'spr-bomb',
  flame: 'spr-flame',
  powerup: (k: string) => `spr-power-${k}`,
  particle: 'spr-particle',
  spark: 'spr-spark',
  smoke: 'spr-smoke',
  shard: 'spr-shard',
  shield: 'spr-shield',
  valve: 'spr-valve',
  generator: 'spr-generator',
  relic: 'spr-relic',
  projectile: 'spr-projectile',
  warning: 'spr-warning',
  arrow: 'spr-arrow',
  shadow: 'spr-shadow',
  vignette: 'spr-vignette',
} as const;
