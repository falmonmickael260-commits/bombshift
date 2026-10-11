import type Phaser from 'phaser';
import type { AudioEngine } from '../core/audio';
import type { DangerMap, GridMap } from '../core/grid';
import type { Settings } from '../core/save';
import type { DifficultyProfile, EnemyKind, RunStats, Vec2 } from '../core/types';
import type { MapDefinition } from '../maps/mapTypes';
import type { Fx } from './fx';

export interface ProjectileSpec {
  from: Vec2;
  /** Direction normalisee. */
  dir: Vec2;
  speed: number;
  tint: number;
  lifeMs: number;
  radius?: number;
}

/**
 * Contrat minimal que la scene de jeu expose aux entites.
 * Les entites ne connaissent jamais la scene concrete : pas de dependance
 * circulaire, et chaque systeme reste testable / remplacable.
 */
export interface World {
  readonly scene: Phaser.Scene;
  readonly grid: GridMap;
  readonly danger: DangerMap;
  readonly def: MapDefinition;
  readonly fx: Fx;
  readonly audio: AudioEngine;
  readonly settings: Settings;
  /** Coefficients de difficulte appliques a toute la partie. */
  readonly difficulty: DifficultyProfile;
  readonly stats: RunStats;
  /** Temps de jeu ecoule (ms), pause exclue. */
  readonly elapsedMs: number;

  playerPos(): Vec2;
  playerCell(): Vec2;
  /**
   * Case bloquante pour un acteur : murs, props, portes fermees et bombes.
   * `selfCell` permet a un acteur de quitter la case ou il vient de poser
   * une bombe (regle classique : la bombe ne devient solide qu'une fois quittee).
   */
  actorBlocked(cx: number, cy: number, selfCell?: Vec2): boolean;
  /**
   * Variante pour le joueur : une bombe ne le bloque qu'une fois qu'il l'a
   * entierement quittee (sinon il reste coince sur sa propre bombe).
   */
  playerBlocked(cx: number, cy: number): boolean;

  notify(text: string, tone?: 'info' | 'good' | 'bad'): void;
  /** Place une flamme (vague de feu d'un boss, piege...) sans bombe. */
  igniteCell(cell: Vec2, durationMs: number, tint?: number): void;
  /** Declenche une explosion complete depuis une case. */
  requestBlast(cell: Vec2, range: number, pierce: number): void;
  spawnProjectile(spec: ProjectileSpec): void;
  spawnMinion(kind: EnemyKind, cell: Vec2): void;
  /** Cherche une case libre proche (apparition de sbires, teleportation). */
  freeCellNear(cell: Vec2, radius: number): Vec2 | null;
  /** Une bombe occupe-t-elle cette case ? */
  hasBombAt(cell: Vec2): boolean;
  /** Signale a l'affichage qu'une case a change de nature. */
  onTileChanged(cell: Vec2): void;
  /** Rend une case toxique temporairement (attaque de boss, piege). */
  spreadToxic(cell: Vec2, durationMs: number): void;
}
