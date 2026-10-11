/**
 * Types partages de BOMBSHIFT.
 * Aucune dependance a Phaser ici : ces types sont testables sans moteur.
 */

export type Dir = 'up' | 'down' | 'left' | 'right';

export interface Vec2 {
  x: number;
  y: number;
}

export const DIR_VECTORS: Readonly<Record<Dir, Vec2>> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export const ALL_DIRS: readonly Dir[] = ['up', 'right', 'down', 'left'];

/** Nature d'une case de la grille. */
export enum TileKind {
  /** Sol libre. */
  Floor = 0,
  /** Mur indestructible. */
  Wall = 1,
  /** Bloc destructible. */
  Block = 2,
  /** Faux mur : destructible, cache un passage secret. */
  Secret = 3,
  /** Cristal indestructible (carte glace). */
  Crystal = 4,
  /** Sol glissant. */
  Ice = 5,
  /** Lave : sol mortel permanent. */
  Lava = 6,
  /** Event : sol qui devient mortel par cycles (avertissement visuel). */
  Vent = 7,
  /** Zone toxique : cycle lent, mortelle en phase active. */
  Toxic = 8,
  /** Porte temporisee : solide quand fermee. */
  Door = 9,
  /** Grille verrouillee tant que les objectifs ne sont pas remplis. */
  Gate = 10,
  /** Sortie de niveau. */
  Exit = 11,
  /** Dalle piegee (carte temple). */
  Plate = 12,
}

export interface Tile {
  kind: TileKind;
  /** Variante visuelle (0..3) pour casser la repetition. */
  variant: number;
  /** Groupe logique : cycles de portes / events / dalles. */
  group: number;
  /** Etat actif : porte fermee, event en eruption, zone toxique mortelle. */
  active: boolean;
  /** Temps ecoule dans la phase courante (secondes). */
  timer: number;
  /** Un prop solide occupe la case (generateur, valve, piedestal, pilier de boss). */
  blocked: boolean;
  /** Passage secret revele. */
  revealed: boolean;
  /** Frame d'animation courante (tuiles animees : lave, event, porte...). */
  frame: number;
  /** Dalle-mecanisme deja enclenchee. */
  latched: boolean;
}

export type Theme = 'volcano' | 'ice' | 'temple';

export type Difficulty = 'detente' | 'normal' | 'veteran';

/** Coefficients appliques par le niveau de difficulte. */
export interface DifficultyProfile {
  id: Difficulty;
  label: string;
  description: string;
  lives: number;
  /** Multiplicateur de vitesse des ennemis. */
  enemySpeed: number;
  /** Multiplicateur du rayon de perception des ennemis. */
  enemyAggro: number;
  /** Multiplicateur de la duree des fenetres de vulnerabilite des boss. */
  bossWindow: number;
  /** Multiplicateur des delais entre attaques de boss (>1 = plus lent). */
  bossCooldown: number;
  /** Multiplicateur de l'invulnerabilite apres degat. */
  invuln: number;
  /** Multiplicateur du score final (recompense la difficulte choisie). */
  scoreFactor: number;
}

/** Familles d'ennemis. */
export type EnemyKind =
  | 'patroller'
  | 'chaser'
  | 'flanker'
  | 'coward'
  | 'heavy'
  | 'guardian';

export type BossKind = 'magmaron' | 'cryon' | 'gardien';

/** Types de bombes. */
export type BombType = 'classic' | 'pierce' | 'shift' | 'slow';

/** Bonus ramassables. */
export type PowerUpKind =
  | 'range'
  | 'bomb'
  | 'speed'
  | 'shield'
  | 'pierce'
  | 'ability'
  | 'life';

export interface ObjectiveState {
  id: string;
  label: string;
  /** Objectif obligatoire pour terminer la carte. */
  mandatory: boolean;
  done: boolean;
  /** Progression affichable (ex: 2/3). */
  current: number;
  total: number;
}

export interface RunStats {
  kills: number;
  bossKills: number;
  blocksDestroyed: number;
  secretsFound: number;
  powerupsTaken: number;
  damageTaken: number;
  bombsPlaced: number;
  objectivesDone: number;
  timeMs: number;
  livesLeft: number;
}

export type Rank = 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';

export interface ScoreBreakdown {
  kills: number;
  boss: number;
  objectives: number;
  secrets: number;
  time: number;
  noDamage: number;
  lives: number;
  total: number;
  rank: Rank;
}

export interface InputState {
  /** Axe du joystick, normalise (-1..1). */
  moveX: number;
  moveY: number;
  /** Intensite du joystick (0..1). */
  magnitude: number;
  /** Demande de pose de bombe (consommee par le jeu). */
  bombPressed: boolean;
  /** Capacite speciale 1 : bombe SHIFT (consommee par le jeu). */
  abilityPressed: boolean;
  /** Capacite speciale 2 : charge lente (consommee par le jeu). */
  ability2Pressed: boolean;
}

export type GamePhase = 'playing' | 'paused' | 'victory' | 'defeat';
