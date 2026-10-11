import type { GridMap } from '../core/grid';
import type { BossKind, EnemyKind, Rank, Theme, Vec2 } from '../core/types';

export type MapId = 'volcano' | 'ice' | 'temple';

/** Cycle d'un groupe d'events de lave / de zones toxiques. */
export interface CycleConfig {
  group: number;
  /** Duree totale du cycle (ms). */
  periodMs: number;
  /** Duree de l'avertissement avant activation (ms). */
  warnMs: number;
  /** Duree de la phase mortelle (ms). */
  activeMs: number;
  /** Decalage initial (ms) : desynchronise les groupes. */
  offsetMs: number;
}

/** Portes temporisees de la carte de glace. */
export interface DoorCycleConfig {
  group: number;
  periodMs: number;
  /** Part du cycle pendant laquelle la porte est fermee (0..1). */
  closedRatio: number;
  offsetMs: number;
}

/** Coulee de lave progressive : les cases listees deviennent mortelles une a une. */
export interface LavaFlowConfig {
  cells: readonly Vec2[];
  firstMs: number;
  intervalMs: number;
  warnMs: number;
}

export interface MapObjectiveDef {
  id: string;
  label: string;
  mandatory: boolean;
  total: number;
}

export interface MapDefinition {
  id: MapId;
  index: number;
  name: string;
  tagline: string;
  theme: Theme;
  bossKind: BossKind;
  bossName: string;
  /** Points de vie du boss (nombre d'explosions encaissees). */
  bossHp: number;
  rows: readonly string[];
  /** Briefing : mecaniques expliquees avant la tentative. */
  intro: readonly string[];
  objectives: readonly MapObjectiveDef[];
  /** Seuils de score pour chaque rang. */
  rankScores: Readonly<Record<Rank, number>>;
  parTimeMs: number;
  vents?: readonly CycleConfig[];
  toxic?: readonly CycleConfig[];
  doors?: readonly DoorCycleConfig[];
  lavaFlow?: LavaFlowConfig;
  /** Sols glissants : active l'inertie et le glissement des bombes. */
  slippery?: boolean;
  /** Type de prop derriere les marqueurs 1..4. */
  propKind: 'valve' | 'generator' | 'relic';
  /** L'ordre d'activation est-il impose ? */
  orderedProps: boolean;
  /** Identifiants des secrets (statistiques et sauvegarde). */
  secretCount: number;
}

export interface EnemySpawn {
  kind: EnemyKind;
  cell: Vec2;
}

export interface PropSpawn {
  index: number;
  cell: Vec2;
  kind: 'valve' | 'generator' | 'relic';
}

export interface ParsedMap {
  def: MapDefinition;
  grid: GridMap;
  width: number;
  height: number;
  playerSpawn: Vec2;
  bossSpawn: Vec2;
  exit: Vec2;
  enemies: EnemySpawn[];
  props: PropSpawn[];
  /** Blocs garantissant un bonus. */
  bonusBlocks: Vec2[];
  secrets: Vec2[];
  /** Dalles piegees. */
  plates: Vec2[];
  /** Dalles-mecanismes (ouvrent une grille secondaire). */
  mechanisms: Vec2[];
}
