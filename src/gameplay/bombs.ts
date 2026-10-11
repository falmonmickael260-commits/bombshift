import Phaser from 'phaser';
import { BOMB, TEX, TILE } from '../core/constants';
import { TileKind, type BombType, type Vec2 } from '../core/types';
import { computeBlast, type BlastCell } from './blast';
import { cellOf, centerOf } from './motion';
import type { World } from './worldApi';

export interface Bomb {
  id: number;
  cell: Vec2;
  x: number;
  y: number;
  type: BombType;
  range: number;
  pierce: number;
  /** Date (ms de jeu) de detonation. */
  explodeAt: number;
  fuseMs: number;
  owner: 'player' | 'boss';
  /** Direction de glissement, null si la bombe est posee. */
  slide: Vec2 | null;
  exploded: boolean;
  sprite: Phaser.GameObjects.Sprite;
  /** Devient solide pour le joueur une fois qu'il a quitte la case. */
  solidForPlayer: boolean;
}

type FlameOwner = 'player' | 'world';

interface Flame {
  until: number;
  tint: number;
  /**
   * Origine de la flamme. Seules les flammes du joueur blessent un boss :
   * sans cela, Magmaron se tuerait avec ses propres vagues de feu.
   */
  owner: FlameOwner;
  sprite: Phaser.GameObjects.Sprite;
}

export interface BombHooks {
  /** Appele pour chaque case destructible soufflee. */
  onTileDestroyed: (cell: Vec2, kind: TileKind) => void;
  /** Appele a chaque explosion (pour le son, la camera, les objectifs). */
  onBlast: (center: Vec2, cells: BlastCell[], type: BombType) => void;
}

const FLAME_TINT: Record<BombType, number> = {
  classic: 0xffffff,
  pierce: 0x9ff0ff,
  shift: 0xd8b4ff,
  slow: 0xffe08a,
};

/**
 * Bombes, explosions, reactions en chaine et carte de danger.
 *
 * La carte de danger est reconstruite a chaque frame a partir des bombes
 * reellement posees : l'IA n'a donc acces qu'a une information que le joueur
 * peut lui aussi percevoir a l'ecran.
 */
export class BombManager {
  readonly bombs: Bomb[] = [];
  private readonly flames = new Map<number, Flame>();
  private nextId = 1;

  constructor(
    private readonly world: World,
    private readonly hooks: BombHooks,
  ) {}

  get playerBombCount(): number {
    return this.bombs.filter((b) => b.owner === 'player' && !b.exploded).length;
  }

  bombAt(cx: number, cy: number): Bomb | null {
    for (const b of this.bombs) {
      if (!b.exploded && b.cell.x === cx && b.cell.y === cy) return b;
    }
    return null;
  }

  /**
   * Une bombe bloque-t-elle cette case pour un ennemi ?
   * L'acteur peut toujours quitter la case ou il se trouve.
   */
  blocksActor(cx: number, cy: number, selfCell?: Vec2): boolean {
    const b = this.bombAt(cx, cy);
    if (!b) return false;
    if (b.slide) return false;
    if (selfCell && selfCell.x === cx && selfCell.y === cy) return false;
    return true;
  }

  /**
   * Une bombe bloque-t-elle cette case pour le joueur ?
   *
   * Elle ne devient solide qu'une fois que le joueur l'a COMPLETEMENT quittee
   * (corps entier hors de la case). Tester seulement la case du centre
   * bloquait le joueur a cheval sur sa propre bombe.
   */
  blocksPlayer(cx: number, cy: number): boolean {
    const b = this.bombAt(cx, cy);
    if (!b || b.slide) return false;
    return b.solidForPlayer;
  }

  place(
    cell: Vec2,
    type: BombType,
    range: number,
    pierce: number,
    slide: Vec2 | null = null,
    owner: 'player' | 'boss' = 'player',
  ): Bomb | null {
    if (this.bombAt(cell.x, cell.y)) return null;
    if (this.world.grid.isSolid(cell.x, cell.y)) return null;

    const p = centerOf(cell);
    const fuseMs = type === 'slow' ? BOMB.slowFuseMs : BOMB.fuseMs;
    const sprite = this.world.scene.add.sprite(p.x, p.y, `${TEX.bomb}-${type}`, 0);
    sprite.setDepth(25).setOrigin(0.5, 0.58);
    sprite.play(`bomb-${type}`, true);

    const bomb: Bomb = {
      id: this.nextId++,
      cell: { ...cell },
      x: p.x,
      y: p.y,
      type,
      range,
      pierce,
      explodeAt: this.world.elapsedMs + fuseMs,
      fuseMs,
      owner,
      slide: slide && (slide.x !== 0 || slide.y !== 0) ? { ...slide } : null,
      exploded: false,
      sprite,
      solidForPlayer: false,
    };
    this.bombs.push(bomb);
    this.world.audio.play(bomb.slide ? 'bombShift' : 'bombPlace');
    return bomb;
  }

  update(dtMs: number): void {
    const now = this.world.elapsedMs;
    const dt = dtMs / 1000;

    for (const b of this.bombs) {
      if (b.exploded) continue;

      if (b.slide) {
        this.updateSlide(b, dt);
      }

      // Pulsation d'alerte : la bombe accelere et grossit juste avant d'exploser.
      const left = b.explodeAt - now;
      const urgency = 1 - Math.max(0, Math.min(1, left / b.fuseMs));
      const scale = 1 + Math.sin(now / (90 - urgency * 55)) * (0.04 + urgency * 0.1);
      b.sprite.setScale(scale);
      b.sprite.setPosition(b.x, b.y);
      if (urgency > 0.82) {
        b.sprite.setTint(Math.floor(now / 70) % 2 === 0 ? 0xffffff : 0xff9a6a);
      }

      if (left <= 0) this.detonate(b);
    }

    // Nettoyage des flammes expirees.
    for (const [idx, flame] of this.flames) {
      if (now >= flame.until) {
        flame.sprite.destroy();
        this.flames.delete(idx);
      }
    }

    for (let i = this.bombs.length - 1; i >= 0; i--) {
      if (this.bombs[i].exploded) this.bombs.splice(i, 1);
    }

    this.rebuildDanger();
  }

  /** Glissement : la bombe avance jusqu'au premier obstacle. */
  private updateSlide(b: Bomb, dt: number): void {
    const dir = b.slide!;
    const step = BOMB.shiftSpeed * dt;
    const nx = b.x + dir.x * step;
    const ny = b.y + dir.y * step;
    const nextCell = cellOf({ x: nx + dir.x * (TILE * 0.5), y: ny + dir.y * (TILE * 0.5) });

    const blockedAhead =
      this.world.grid.isSolid(nextCell.x, nextCell.y) ||
      (this.bombAt(nextCell.x, nextCell.y)?.id ?? b.id) !== b.id;

    const current = cellOf({ x: b.x, y: b.y });
    const center = centerOf(current);
    const passedCenter =
      (dir.x > 0 && nx >= center.x) ||
      (dir.x < 0 && nx <= center.x) ||
      (dir.y > 0 && ny >= center.y) ||
      (dir.y < 0 && ny <= center.y);

    if (blockedAhead && passedCenter) {
      // Arret net, aligne sur la grille : la position reste lisible.
      b.x = center.x;
      b.y = center.y;
      b.cell = current;
      b.slide = null;
      // Elle ne redevient un obstacle qu'une fois le joueur degage : sinon
      // une bombe qui s'arrete sous lui le bloquerait sur place.
      b.solidForPlayer = false;
      this.world.fx.puff({ x: b.x, y: b.y + 12 }, 0xd6f7ff);
      return;
    }

    b.x = nx;
    b.y = ny;
    b.cell = cellOf({ x: b.x, y: b.y });
    this.world.fx.trail({ x: b.x, y: b.y + 8 }, FLAME_TINT[b.type]);

    // Une bombe qui glisse sur de la lave explose immediatement.
    if (this.world.grid.isLethalFloor(b.cell.x, b.cell.y)) this.detonate(b);
  }

  /** Detonation immediate d'une bombe (chaine incluse). */
  detonate(b: Bomb): void {
    if (b.exploded) return;
    b.exploded = true;
    b.sprite.destroy();
    this.blast(b.cell, b.range, b.pierce, b.type);
  }

  /**
   * Explosion a une position arbitraire (bombe, attaque de boss, piege).
   * Applique les destructions, cree les flammes et declenche les chaines.
   */
  blast(cell: Vec2, range: number, pierce: number, type: BombType = 'classic'): void {
    const { cells, destroyed } = computeBlast(this.world.grid, cell, range, pierce);

    // Notifie AVANT la destruction : les bonus deja au sol sont souffles,
    // mais ceux liberes par ce meme souffle ne le sont pas.
    this.hooks.onBlast(cell, cells, type);

    for (const d of destroyed) {
      const kind = this.world.grid.destroyAt(d.x, d.y);
      if (kind !== null) this.hooks.onTileDestroyed(d, kind);
    }

    const tint = FLAME_TINT[type];
    for (const c of cells) {
      this.addFlame({ x: c.x, y: c.y }, BOMB.flameMs, tint, c);
    }

    // Reaction en chaine : toute bombe dans le souffle part juste apres.
    const touched = new Set(cells.map((c) => this.world.grid.idx(c.x, c.y)));
    for (const other of this.bombs) {
      if (other.exploded) continue;
      if (!touched.has(this.world.grid.idx(other.cell.x, other.cell.y))) continue;
      const chainAt = this.world.elapsedMs + BOMB.chainDelayMs;
      if (other.explodeAt > chainAt) other.explodeAt = chainAt;
    }

    const big = range >= 4 || cells.length > 11;
    this.world.audio.play(big ? 'explosionBig' : 'explosion');
    const center = centerOf(cell);
    this.world.fx.explosion(center, tint === 0xffffff ? 0xffb347 : tint);
    this.world.fx.shockwave(center, TILE * (1 + range * 0.35), tint);
    this.world.fx.blastShake(big);
  }

  /** Ajoute une flamme sur une case (sans explosion complete). */
  addFlame(
    cell: Vec2,
    durationMs: number,
    tint = 0xffffff,
    info?: BlastCell,
    owner: FlameOwner = 'player',
  ): void {
    const kind = this.world.grid.kindAt(cell.x, cell.y);
    if (kind === TileKind.Wall || kind === TileKind.Crystal) return;

    const idx = this.world.grid.idx(cell.x, cell.y);
    const until = this.world.elapsedMs + durationMs;
    const existing = this.flames.get(idx);
    if (existing) {
      existing.until = Math.max(existing.until, until);
      // Une flamme de joueur prend le dessus : son souffle doit pouvoir
      // toucher le boss meme si une attaque de boss couvre la meme case.
      if (owner === 'player') existing.owner = 'player';
      return;
    }

    const p = centerOf(cell);
    const sprite = this.world.scene.add.sprite(p.x, p.y, TEX.flame, 0);
    sprite.setDepth(40).setBlendMode(Phaser.BlendModes.ADD);
    if (tint !== 0xffffff) sprite.setTint(tint);
    // Les branches sont legerement etirees : la croix d'explosion se lit mieux.
    if (info && info.dir !== 'center') {
      const horizontal = info.dir === 'left' || info.dir === 'right';
      sprite.setScale(horizontal ? 1.18 : 0.94, horizontal ? 0.94 : 1.18);
    } else {
      sprite.setScale(1.22);
    }
    sprite.setRotation(Math.random() * Math.PI * 2);
    sprite.play('flame', true);
    this.flames.set(idx, { until, tint, owner, sprite });
  }

  isFlameAt(cx: number, cy: number): boolean {
    const f = this.flames.get(this.world.grid.idx(cx, cy));
    return f !== undefined && this.world.elapsedMs < f.until;
  }

  /** Flamme issue d'une bombe du joueur (seule source de degats pour un boss). */
  isPlayerFlameAt(cx: number, cy: number): boolean {
    const f = this.flames.get(this.world.grid.idx(cx, cy));
    return f !== undefined && f.owner === 'player' && this.world.elapsedMs < f.until;
  }

  /** Reconstruit la carte de danger (delai avant explosion par case). */
  rebuildDanger(): void {
    const danger = this.world.danger;
    danger.clear();
    const now = this.world.elapsedMs;

    // Deux passes : la seconde propage les chaines (bombe dans le souffle d'une autre).
    for (let pass = 0; pass < 2; pass++) {
      for (const b of this.bombs) {
        if (b.exploded) continue;
        let when = Math.max(0, b.explodeAt - now);
        if (pass === 1) {
          const own = danger.at(b.cell.x, b.cell.y);
          if (own < when) when = own + BOMB.chainDelayMs;
        }
        const { cells } = computeBlast(this.world.grid, b.cell, b.range, b.pierce);
        for (const c of cells) danger.mark(c.x, c.y, when);
      }
    }

    // Les flammes actives sont un danger immediat.
    for (const [idx, f] of this.flames) {
      if (now >= f.until) continue;
      const x = idx % this.world.grid.width;
      const y = (idx - x) / this.world.grid.width;
      danger.mark(x, y, 0);
    }
  }

  /**
   * Met a jour la solidite des bombes vis-a-vis du joueur, a partir de
   * l'emprise reelle de son corps (et non de sa seule case centrale).
   */
  refreshPlayerSolidity(minX: number, minY: number, maxX: number, maxY: number): void {
    for (const b of this.bombs) {
      if (b.exploded || b.solidForPlayer) continue;
      const overlaps =
        b.cell.x >= minX && b.cell.x <= maxX && b.cell.y >= minY && b.cell.y <= maxY;
      if (!overlaps) b.solidForPlayer = true;
    }
  }

  /** Fin de tentative : aucune bombe ni flamme ne doit survivre. */
  clear(): void {
    for (const b of this.bombs) {
      b.exploded = true;
      b.sprite.destroy();
    }
    this.bombs.length = 0;
    for (const f of this.flames.values()) f.sprite.destroy();
    this.flames.clear();
    this.world.danger.clear();
  }
}
