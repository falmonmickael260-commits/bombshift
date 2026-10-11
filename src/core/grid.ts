import { AI, TILE } from './constants';
import { ALL_DIRS, DIR_VECTORS, TileKind, type Tile, type Vec2 } from './types';

/** Cases infranchissables pour un acteur. */
const SOLID_KINDS = new Set<TileKind>([
  TileKind.Wall,
  TileKind.Block,
  TileKind.Secret,
  TileKind.Crystal,
  TileKind.Gate,
]);

/** Cases qui arretent la propagation d'une explosion. */
const BLAST_BLOCKERS = new Set<TileKind>([
  TileKind.Wall,
  TileKind.Block,
  TileKind.Secret,
  TileKind.Crystal,
  TileKind.Gate,
]);

const DESTRUCTIBLE = new Set<TileKind>([TileKind.Block, TileKind.Secret]);

export function makeTile(kind: TileKind, variant = 0, group = 0): Tile {
  return {
    kind,
    variant,
    group,
    active: kind === TileKind.Door,
    timer: 0,
    blocked: false,
    revealed: false,
    frame: 0,
    latched: false,
  };
}

/**
 * Carte de danger : pour chaque case, le delai (ms) avant qu'une explosion
 * ne l'atteigne. Infinity = case sure. Reconstruite par le gestionnaire de bombes.
 */
export class DangerMap {
  private readonly data: Float64Array;

  constructor(
    readonly width: number,
    readonly height: number,
  ) {
    this.data = new Float64Array(width * height).fill(Number.POSITIVE_INFINITY);
  }

  clear(): void {
    this.data.fill(Number.POSITIVE_INFINITY);
  }

  /** Enregistre le danger le plus imminent pour la case. */
  mark(cx: number, cy: number, msUntil: number): void {
    if (cx < 0 || cy < 0 || cx >= this.width || cy >= this.height) return;
    const i = cy * this.width + cx;
    if (msUntil < this.data[i]) this.data[i] = msUntil;
  }

  at(cx: number, cy: number): number {
    if (cx < 0 || cy < 0 || cx >= this.width || cy >= this.height) {
      return Number.POSITIVE_INFINITY;
    }
    return this.data[cy * this.width + cx];
  }

  isDangerous(cx: number, cy: number, horizonMs: number = AI.dangerHorizonMs): boolean {
    return this.at(cx, cy) <= horizonMs;
  }
}

export interface PathOptions {
  danger?: DangerMap;
  /** Horizon de danger considere comme bloquant. */
  dangerHorizonMs?: number;
  /** Autorise a terminer sur une case dangereuse (utile pour les fuyards). */
  allowDangerGoal?: boolean;
  /** Cases supplementaires a eviter (ex: autres ennemis). */
  blocked?: Set<number>;
  budget?: number;
}

/** File de priorite binaire minimale (A*). */
class MinHeap {
  private keys: number[] = [];
  private vals: number[] = [];

  get size(): number {
    return this.keys.length;
  }

  push(key: number, val: number): void {
    this.keys.push(key);
    this.vals.push(val);
    let i = this.keys.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.keys[p] <= this.keys[i]) break;
      this.swap(p, i);
      i = p;
    }
  }

  pop(): number {
    const top = this.vals[0];
    const lastKey = this.keys.pop()!;
    const lastVal = this.vals.pop()!;
    if (this.keys.length > 0) {
      this.keys[0] = lastKey;
      this.vals[0] = lastVal;
      let i = 0;
      for (;;) {
        const l = i * 2 + 1;
        const r = l + 1;
        let m = i;
        if (l < this.keys.length && this.keys[l] < this.keys[m]) m = l;
        if (r < this.keys.length && this.keys[r] < this.keys[m]) m = r;
        if (m === i) break;
        this.swap(m, i);
        i = m;
      }
    }
    return top;
  }

  private swap(a: number, b: number): void {
    [this.keys[a], this.keys[b]] = [this.keys[b], this.keys[a]];
    [this.vals[a], this.vals[b]] = [this.vals[b], this.vals[a]];
  }
}

export class GridMap {
  readonly tiles: Tile[];

  constructor(
    readonly width: number,
    readonly height: number,
    fill: TileKind = TileKind.Floor,
  ) {
    this.tiles = new Array(width * height);
    for (let i = 0; i < this.tiles.length; i++) this.tiles[i] = makeTile(fill);
  }

  idx(cx: number, cy: number): number {
    return cy * this.width + cx;
  }

  inBounds(cx: number, cy: number): boolean {
    return cx >= 0 && cy >= 0 && cx < this.width && cy < this.height;
  }

  tileAt(cx: number, cy: number): Tile | null {
    return this.inBounds(cx, cy) ? this.tiles[this.idx(cx, cy)] : null;
  }

  kindAt(cx: number, cy: number): TileKind {
    const t = this.tileAt(cx, cy);
    return t ? t.kind : TileKind.Wall;
  }

  setTile(cx: number, cy: number, kind: TileKind, variant = 0, group = 0): void {
    if (!this.inBounds(cx, cy)) return;
    this.tiles[this.idx(cx, cy)] = makeTile(kind, variant, group);
  }

  /** Une case est solide si son type l'est, si un prop l'occupe ou si une porte est fermee. */
  isSolid(cx: number, cy: number): boolean {
    const t = this.tileAt(cx, cy);
    if (!t) return true;
    if (t.blocked) return true;
    if (t.kind === TileKind.Door) return t.active;
    if (t.kind === TileKind.Secret) return !t.revealed;
    return SOLID_KINDS.has(t.kind);
  }

  blocksBlast(cx: number, cy: number): boolean {
    const t = this.tileAt(cx, cy);
    if (!t) return true;
    if (t.kind === TileKind.Door && t.active) return true;
    if (t.kind === TileKind.Secret) return !t.revealed;
    return BLAST_BLOCKERS.has(t.kind);
  }

  isDestructible(cx: number, cy: number): boolean {
    const t = this.tileAt(cx, cy);
    if (!t) return false;
    if (t.kind === TileKind.Secret) return !t.revealed;
    return DESTRUCTIBLE.has(t.kind);
  }

  /** Sol mortel au contact (lave, event en eruption, zone toxique active). */
  isLethalFloor(cx: number, cy: number): boolean {
    const t = this.tileAt(cx, cy);
    if (!t) return false;
    if (t.kind === TileKind.Lava) return true;
    if (t.kind === TileKind.Vent || t.kind === TileKind.Toxic) return t.active;
    return false;
  }

  isSlippery(cx: number, cy: number): boolean {
    return this.kindAt(cx, cy) === TileKind.Ice;
  }

  /**
   * Detruit une case destructible.
   * @returns le type detruit, ou null si rien n'a ete detruit.
   */
  destroyAt(cx: number, cy: number): TileKind | null {
    const t = this.tileAt(cx, cy);
    if (!t) return null;
    if (t.kind === TileKind.Block) {
      const prev = t.kind;
      t.kind = TileKind.Floor;
      t.active = false;
      return prev;
    }
    if (t.kind === TileKind.Secret && !t.revealed) {
      t.revealed = true;
      t.kind = TileKind.Floor;
      return TileKind.Secret;
    }
    return null;
  }

  /** Ouvre toutes les grilles d'un groupe (0 = toutes). */
  openGates(group = 0): number {
    let opened = 0;
    for (const t of this.tiles) {
      if (t.kind === TileKind.Gate && (group === 0 || t.group === group)) {
        t.kind = TileKind.Floor;
        opened++;
      }
    }
    return opened;
  }

  cellCenter(cx: number, cy: number): Vec2 {
    return { x: cx * TILE + TILE / 2, y: cy * TILE + TILE / 2 };
  }

  worldToCell(x: number, y: number): Vec2 {
    return { x: Math.floor(x / TILE), y: Math.floor(y / TILE) };
  }

  forEachTile(fn: (t: Tile, cx: number, cy: number) => void): void {
    for (let cy = 0; cy < this.height; cy++) {
      for (let cx = 0; cx < this.width; cx++) fn(this.tiles[this.idx(cx, cy)], cx, cy);
    }
  }

  findCells(predicate: (t: Tile) => boolean): Vec2[] {
    const out: Vec2[] = [];
    this.forEachTile((t, cx, cy) => {
      if (predicate(t)) out.push({ x: cx, y: cy });
    });
    return out;
  }

  /** Ensemble des index de cases atteignables depuis une case (collisions courantes). */
  reachable(start: Vec2): Set<number> {
    const seen = new Set<number>();
    if (!this.inBounds(start.x, start.y)) return seen;
    const queue: number[] = [this.idx(start.x, start.y)];
    seen.add(queue[0]);
    while (queue.length > 0) {
      const cur = queue.pop()!;
      const cx = cur % this.width;
      const cy = (cur - cx) / this.width;
      for (const d of ALL_DIRS) {
        const v = DIR_VECTORS[d];
        const nx = cx + v.x;
        const ny = cy + v.y;
        if (!this.inBounds(nx, ny)) continue;
        const ni = this.idx(nx, ny);
        if (seen.has(ni)) continue;
        if (this.isSolid(nx, ny)) continue;
        seen.add(ni);
        queue.push(ni);
      }
    }
    return seen;
  }

  /**
   * Ensemble des index atteignables en considerant les blocs destructibles
   * comme franchissables (une bombe peut les ouvrir).
   * `gatesOpen` permet de verifier qu'une zone est bien verrouillee par une grille.
   */
  reachableThroughBlocks(start: Vec2, gatesOpen = true): Set<number> {
    const seen = new Set<number>();
    if (!this.inBounds(start.x, start.y)) return seen;
    const queue: number[] = [this.idx(start.x, start.y)];
    seen.add(queue[0]);
    while (queue.length > 0) {
      const cur = queue.pop()!;
      const cx = cur % this.width;
      const cy = (cur - cx) / this.width;
      for (const d of ALL_DIRS) {
        const v = DIR_VECTORS[d];
        const nx = cx + v.x;
        const ny = cy + v.y;
        if (!this.inBounds(nx, ny)) continue;
        const ni = this.idx(nx, ny);
        if (seen.has(ni)) continue;
        const t = this.tiles[ni];
        const passable =
          !t.blocked &&
          (!this.isSolid(nx, ny) ||
            t.kind === TileKind.Block ||
            t.kind === TileKind.Secret ||
            (t.kind === TileKind.Gate && gatesOpen) ||
            t.kind === TileKind.Door);
        if (!passable) continue;
        seen.add(ni);
        queue.push(ni);
      }
    }
    return seen;
  }

  /**
   * A* sur la grille (4 directions), avec cout additionnel sur les cases dangereuses.
   * @returns la suite de cases depuis la case suivante jusqu'au but, vide si aucun chemin.
   */
  findPath(start: Vec2, goal: Vec2, opts: PathOptions = {}): Vec2[] {
    if (!this.inBounds(start.x, start.y) || !this.inBounds(goal.x, goal.y)) return [];
    const startIdx = this.idx(start.x, start.y);
    const goalIdx = this.idx(goal.x, goal.y);
    if (startIdx === goalIdx) return [];
    if (this.isSolid(goal.x, goal.y)) return [];

    const budget = opts.budget ?? AI.pathBudget;
    const horizon = opts.dangerHorizonMs ?? AI.dangerHorizonMs;
    const cameFrom = new Map<number, number>();
    const gScore = new Map<number, number>();
    const open = new MinHeap();
    const closed = new Set<number>();

    const h = (i: number): number => {
      const x = i % this.width;
      const y = (i - x) / this.width;
      return Math.abs(x - goal.x) + Math.abs(y - goal.y);
    };

    gScore.set(startIdx, 0);
    open.push(h(startIdx), startIdx);
    let expanded = 0;

    while (open.size > 0 && expanded < budget) {
      const cur = open.pop();
      if (closed.has(cur)) continue;
      closed.add(cur);
      expanded++;
      if (cur === goalIdx) break;

      const cx = cur % this.width;
      const cy = (cur - cx) / this.width;
      const g = gScore.get(cur) ?? 0;

      for (const d of ALL_DIRS) {
        const v = DIR_VECTORS[d];
        const nx = cx + v.x;
        const ny = cy + v.y;
        if (!this.inBounds(nx, ny)) continue;
        const ni = this.idx(nx, ny);
        if (closed.has(ni)) continue;
        if (this.isSolid(nx, ny)) continue;
        if (opts.blocked?.has(ni) && ni !== goalIdx) continue;

        let cost = 1;
        if (this.isLethalFloor(nx, ny)) {
          if (ni !== goalIdx) continue;
          cost += AI.dangerCost;
        }
        if (opts.danger) {
          const t = opts.danger.at(nx, ny);
          if (t <= horizon) {
            if (ni === goalIdx && !opts.allowDangerGoal) continue;
            cost += AI.dangerCost * (1 - Math.min(1, t / Math.max(1, horizon)));
          }
        }

        const ng = g + cost;
        if (ng < (gScore.get(ni) ?? Number.POSITIVE_INFINITY)) {
          gScore.set(ni, ng);
          cameFrom.set(ni, cur);
          open.push(ng + h(ni), ni);
        }
      }
    }

    if (!cameFrom.has(goalIdx)) return [];
    const path: Vec2[] = [];
    let node = goalIdx;
    while (node !== startIdx) {
      const x = node % this.width;
      path.push({ x, y: (node - x) / this.width });
      const prev = cameFrom.get(node);
      if (prev === undefined) return [];
      node = prev;
    }
    path.reverse();
    return path;
  }

  /**
   * Trouve le premier pas vers la case sure la plus proche (BFS).
   * Utilise par l'IA et par les ennemis fuyards pour sortir d'une zone de souffle.
   */
  findEscape(start: Vec2, danger: DangerMap, horizonMs: number = AI.dangerHorizonMs): Vec2[] {
    if (!this.inBounds(start.x, start.y)) return [];
    const startIdx = this.idx(start.x, start.y);
    const cameFrom = new Map<number, number>();
    const seen = new Set<number>([startIdx]);
    const queue: number[] = [startIdx];
    const dist = new Map<number, number>([[startIdx, 0]]);
    let head = 0;

    while (head < queue.length) {
      const cur = queue[head++];
      const cx = cur % this.width;
      const cy = (cur - cx) / this.width;
      const d = dist.get(cur) ?? 0;

      // Case sure trouvee : on reconstruit le chemin.
      const safe = !danger.isDangerous(cx, cy, horizonMs) && !this.isLethalFloor(cx, cy);
      if (safe && cur !== startIdx) {
        const path: Vec2[] = [];
        let node = cur;
        while (node !== startIdx) {
          const x = node % this.width;
          path.push({ x, y: (node - x) / this.width });
          node = cameFrom.get(node)!;
        }
        path.reverse();
        return path;
      }
      if (d > 10) continue;

      for (const dir of ALL_DIRS) {
        const v = DIR_VECTORS[dir];
        const nx = cx + v.x;
        const ny = cy + v.y;
        if (!this.inBounds(nx, ny)) continue;
        const ni = this.idx(nx, ny);
        if (seen.has(ni) || this.isSolid(nx, ny)) continue;
        if (this.isLethalFloor(nx, ny)) continue;
        seen.add(ni);
        cameFrom.set(ni, cur);
        dist.set(ni, d + 1);
        queue.push(ni);
      }
    }
    return [];
  }
}
