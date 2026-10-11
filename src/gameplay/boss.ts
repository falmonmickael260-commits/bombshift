import type Phaser from 'phaser';
import { BOSS_SIZE } from '../core/charArt';
import { COMBAT, TEX, TILE } from '../core/constants';
import { TileKind, type BossKind, type Vec2 } from '../core/types';
import { cellOf, centerOf } from './motion';
import type { World } from './worldApi';

type BossFrame = 0 | 1 | 2 | 3;

/**
 * Socle commun aux trois boss : phases, fenetres de vulnerabilite,
 * telegraphes d'attaque et deplacement contraint a l'arene.
 *
 * Principe de design : toute attaque est annoncee (cadre jaune, changement
 * de pose, son dedie) et laisse une case de fuite. La difficulte vient du
 * placement et du timing, jamais d'un coup non signale.
 */
export abstract class Boss {
  readonly kind: BossKind;
  readonly maxHp: number;
  hp: number;
  alive = true;
  active = false;
  /** Le boss ne subit des degats que pendant ses fenetres de vulnerabilite. */
  vulnerable = true;
  phase = 1;

  x: number;
  y: number;
  protected readonly sprite: Phaser.GameObjects.Sprite;
  protected readonly shadow: Phaser.GameObjects.Image;
  protected hitUntil = 0;
  protected stateTime = 0;
  protected state = 'idle';
  protected readonly size: number;
  private readonly warnings: Phaser.GameObjects.Image[] = [];
  private vulnBadgeAt = -1e9;

  constructor(
    protected readonly world: World,
    kind: BossKind,
    readonly spawn: Vec2,
    hp: number,
    /** Cases de l'arene : le boss n'en sort jamais. */
    protected readonly arena: Set<number>,
  ) {
    this.kind = kind;
    this.maxHp = hp;
    this.hp = hp;
    this.size = BOSS_SIZE[kind] ?? 128;
    const p = centerOf(spawn);
    this.x = p.x;
    this.y = p.y;

    this.shadow = world.scene.add.image(p.x, p.y + this.size * 0.3, TEX.shadow);
    this.shadow.setDepth(15).setAlpha(0.55).setScale(this.size / TILE / 1.4);
    this.sprite = world.scene.add.sprite(p.x, p.y, TEX.boss(kind), 0);
    this.sprite.setDepth(34).setOrigin(0.5, 0.62).setVisible(false);
    this.shadow.setVisible(false);
  }

  get cell(): Vec2 {
    return cellOf({ x: this.x, y: this.y });
  }

  get pos(): Vec2 {
    return { x: this.x, y: this.y };
  }

  /** Rayon de contact : plus petit que le sprite pour rester equitable. */
  get contactRadius(): number {
    return this.size * 0.3;
  }

  activate(): void {
    if (this.active) return;
    this.active = true;
    this.sprite.setVisible(true);
    this.shadow.setVisible(true);
    this.world.audio.play('bossRoar');
    this.world.audio.setBossMode(true);
    this.world.fx.shake(0.012, 600);
    this.world.scene.tweens.add({
      targets: this.sprite,
      scale: { from: 0.6, to: 1 },
      duration: 520,
      ease: 'Back.easeOut',
    });
    // Breve pulsation de camera : l'arrivee du boss se remarque.
    const cam = this.world.scene.cameras.main;
    const base = cam.zoom;
    this.world.scene.tweens.add({
      targets: cam,
      zoom: base * 1.12,
      duration: 260,
      yoyo: true,
      ease: 'Sine.easeInOut',
      onComplete: () => cam.setZoom(base),
    });
  }

  update(dtMs: number): void {
    if (!this.alive || !this.active) return;
    this.stateTime += dtMs;
    this.think(dtMs);
    this.sprite.setPosition(this.x, this.y);
    this.shadow.setPosition(this.x, this.y + this.size * 0.26);

    if (this.vulnerable && this.world.elapsedMs - this.vulnBadgeAt > 2600) {
      this.vulnBadgeAt = this.world.elapsedMs;
      this.world.fx.floatingText({ x: this.x, y: this.y - this.size * 0.4 }, 'VULNERABLE', '#7cf0c0');
    }
    this.sprite.setAlpha(this.vulnerable ? 1 : 0.86);
  }

  protected abstract think(dtMs: number): void;

  /** Degat (uniquement par explosion). Retourne true si le boss meurt. */
  hit(): boolean {
    if (!this.alive || !this.active) return false;
    if (!this.vulnerable) {
      this.world.fx.floatingText({ x: this.x, y: this.y - 20 }, 'BLINDE', '#9aa4b2');
      return false;
    }
    const now = this.world.elapsedMs;
    if (now < this.hitUntil) return false;
    this.hitUntil = now + COMBAT.bossHitCooldownMs;
    this.hp--;
    this.world.audio.play('bossHurt');
    this.setFrame(3);
    this.world.fx.explosion(this.pos, 0xffffff);
    this.world.fx.shake(0.01, 240);
    this.world.fx.floatingText({ x: this.x, y: this.y - this.size * 0.35 }, `-1`, '#ff8a6a');

    const ratio = this.hp / this.maxHp;
    const newPhase = ratio > 0.66 ? 1 : ratio > 0.33 ? 2 : ratio > 0.12 ? 3 : 4;
    if (newPhase !== this.phase) {
      this.phase = newPhase;
      this.onPhaseChange();
    }

    if (this.hp <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  protected onPhaseChange(): void {
    this.world.audio.play('bossRoar');
    this.world.notify(`PHASE ${this.phase}`, 'bad');
    this.world.fx.flash(0xff7a2f, 220);
  }

  protected die(): void {
    this.alive = false;
    this.clearWarnings();
    this.world.audio.setBossMode(false);
    this.world.audio.play('explosionBig');
    this.world.fx.shake(0.02, 900);
    for (let i = 0; i < 10; i++) {
      this.world.scene.time.delayedCall(i * 110, () => {
        const a = Math.random() * Math.PI * 2;
        const d = Math.random() * this.size * 0.5;
        this.world.fx.explosion(
          { x: this.x + Math.cos(a) * d, y: this.y + Math.sin(a) * d },
          0xffd27a,
        );
      });
    }
    this.world.scene.tweens.add({
      targets: [this.sprite, this.shadow],
      alpha: 0,
      scale: 0.2,
      duration: 1100,
      onComplete: () => {
        this.sprite.setVisible(false);
        this.shadow.setVisible(false);
      },
    });
  }

  // --- outils d'attaque ----------------------------------------------------

  /** Delai d'attaque ajuste par la difficulte (plus grand = plus permissif). */
  protected cd(ms: number): number {
    return ms * this.world.difficulty.bossCooldown;
  }

  /** Duree d'une fenetre de vulnerabilite ajustee par la difficulte. */
  protected win(ms: number): number {
    return ms * this.world.difficulty.bossWindow;
  }

  protected setFrame(f: BossFrame): void {
    this.sprite.setFrame(f);
  }

  protected inArena(cell: Vec2): boolean {
    return this.arena.has(this.world.grid.idx(cell.x, cell.y));
  }

  /** Annonce visuelle puis execution : le joueur a toujours le temps de bouger. */
  protected telegraph(cells: Vec2[], warnMs: number, then: (cells: Vec2[]) => void): void {
    const valid = cells.filter((c) => this.inArena(c) && !this.world.grid.isSolid(c.x, c.y));
    if (valid.length === 0) return;
    this.world.audio.play('warning');
    const images = valid.map((c) => {
      const p = centerOf(c);
      const img = this.world.scene.add.image(p.x, p.y, TEX.warning);
      img.setDepth(22).setAlpha(0.9);
      this.world.scene.tweens.add({
        targets: img,
        alpha: { from: 0.45, to: 1 },
        duration: warnMs / 3,
        yoyo: true,
        repeat: 1,
      });
      this.warnings.push(img);
      return img;
    });
    this.world.scene.time.delayedCall(warnMs, () => {
      for (const img of images) {
        const i = this.warnings.indexOf(img);
        if (i >= 0) this.warnings.splice(i, 1);
        img.destroy();
      }
      if (this.alive) then(valid);
    });
  }

  protected clearWarnings(): void {
    for (const w of this.warnings) w.destroy();
    this.warnings.length = 0;
  }

  protected igniteCells(cells: Vec2[], durationMs = 620, tint = 0xffffff): void {
    for (const c of cells) this.world.igniteCell(c, durationMs, tint);
  }

  /** Croix complete (ligne + colonne) a partir d'une case, limitee a l'arene. */
  protected crossCells(origin: Vec2, reach = 7): Vec2[] {
    const out: Vec2[] = [{ ...origin }];
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      for (let i = 1; i <= reach; i++) {
        const c = { x: origin.x + dx * i, y: origin.y + dy * i };
        if (!this.world.grid.inBounds(c.x, c.y)) break;
        if (this.world.grid.kindAt(c.x, c.y) === TileKind.Wall) break;
        if (!this.inArena(c)) break;
        out.push(c);
      }
    }
    return out;
  }

  protected ringCells(center: Vec2, radius: number): Vec2[] {
    const out: Vec2[] = [];
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;
        const c = { x: center.x + dx, y: center.y + dy };
        if (this.inArena(c)) out.push(c);
      }
    }
    return out;
  }

  protected arenaCells(): Vec2[] {
    const w = this.world.grid.width;
    return [...this.arena].map((i) => ({ x: i % w, y: Math.floor(i / w) }));
  }

  protected moveToward(target: Vec2, speed: number, dtMs: number): void {
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const d = Math.hypot(dx, dy);
    if (d < 1) return;
    const step = (speed * dtMs) / 1000;
    const nx = this.x + (dx / d) * Math.min(step, d);
    const ny = this.y + (dy / d) * Math.min(step, d);
    const c = cellOf({ x: nx, y: ny });
    // Le boss reste dans son arene et ne traverse pas les murs.
    if (this.inArena(c)) {
      this.x = nx;
      this.y = ny;
    }
  }

  /** Restaure l'etat du boss lors d'une reprise de partie. */
  restoreState(hp: number, active: boolean, phase: number, alive: boolean): void {
    this.hp = hp;
    this.phase = phase;
    this.alive = alive;
    if (!alive) {
      this.sprite.setVisible(false);
      this.shadow.setVisible(false);
      return;
    }
    if (active) {
      this.active = true;
      this.sprite.setVisible(true);
      this.shadow.setVisible(true);
    }
  }

  /** Utilise uniquement par les tests automatises. */
  debugForceKill(): void {
    this.hp = 0;
    this.phase = 4;
    this.die();
  }

  destroy(): void {
    this.clearWarnings();
    this.sprite.destroy();
    this.shadow.destroy();
  }
}

/* ===================================================================== */
/* MAGMARON - forteresse volcanique                                       */
/* ===================================================================== */

/**
 * Phase 1 : vagues de feu en croix, avance lente.
 * Phase 2 : flaques de lave temporaires + invocation de poursuivants.
 * Phase 3 : charge sur le joueur en laissant une trainee de flammes.
 * Phase 4 : enchaine charges et doubles vagues.
 * Toujours vulnerable, mais 6 explosions sont necessaires.
 */
export class Magmaron extends Boss {
  private attackAt = 1400;
  private dashing = false;
  private dashDir: Vec2 = { x: 0, y: 0 };
  private dashTime = 0;

  protected override think(dtMs: number): void {
    const player = this.world.playerPos();
    this.attackAt -= dtMs;

    if (this.dashing) {
      this.dashTime -= dtMs;
      this.setFrame(2);
      const before = { x: this.x, y: this.y };
      this.moveToward(
        { x: this.x + this.dashDir.x * 400, y: this.y + this.dashDir.y * 400 },
        360,
        dtMs,
      );
      if (Math.hypot(this.x - before.x, this.y - before.y) < 0.6) this.dashTime = 0;
      // Trainee de flammes : la zone traversee reste dangereuse un court instant.
      this.world.igniteCell(this.cell, 420, 0xffb347);
      if (this.dashTime <= 0) {
        this.dashing = false;
        this.setFrame(0);
        this.attackAt = this.cd(this.phase >= 3 ? 900 : 1500);
      }
      return;
    }

    // Deplacement de base : se rapproche sans jamais acculer le joueur.
    const speed = 26 + this.phase * 9;
    this.moveToward(player, speed, dtMs);
    this.setFrame(0);

    if (this.attackAt > 0) return;

    const roll = Math.random();
    if (this.phase >= 3 && roll < 0.45) {
      // Charge.
      this.setFrame(1);
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const d = Math.hypot(dx, dy) || 1;
      this.dashDir = { x: dx / d, y: dy / d };
      this.world.audio.play('bossRoar');
      this.world.scene.time.delayedCall(520, () => {
        if (!this.alive) return;
        this.dashing = true;
        this.dashTime = 900;
      });
      this.attackAt = this.cd(2600);
      return;
    }

    if (this.phase >= 2 && roll > 0.72) {
      // Flaques de lave temporaires autour du joueur.
      const pc = this.world.playerCell();
      const spots: Vec2[] = [];
      for (let i = 0; i < 3 + this.phase; i++) {
        spots.push({
          x: pc.x + Math.round((Math.random() - 0.5) * 5),
          y: pc.y + Math.round((Math.random() - 0.5) * 5),
        });
      }
      this.setFrame(1);
      this.telegraph(spots, 1000, (cells) => {
        for (const c of cells) this.world.igniteCell(c, 1400, 0xff5a12);
        this.setFrame(0);
      });
      this.attackAt = this.cd(2800);
      return;
    }

    if (this.phase >= 2 && roll > 0.55) {
      // Invocation : deux poursuivants, jamais sur la case du joueur.
      this.setFrame(1);
      for (let i = 0; i < 2; i++) {
        const spot = this.world.freeCellNear(this.cell, 3);
        if (spot) this.world.spawnMinion(i === 0 ? 'chaser' : 'patroller', spot);
      }
      this.world.notify('Magmaron invoque des sbires !', 'bad');
      this.attackAt = this.cd(4200);
      this.world.scene.time.delayedCall(400, () => this.setFrame(0));
      return;
    }

    // Vague de feu en croix (attaque de base).
    this.setFrame(1);
    const cells = this.crossCells(this.cell, 8);
    const warn = this.phase >= 3 ? 620 : 900;
    this.telegraph(cells, warn, (c) => {
      this.igniteCells(c, 560, 0xffb347);
      this.world.audio.play('explosion');
      this.setFrame(0);
    });
    this.attackAt = this.cd(this.phase >= 3 ? 1500 : 2300);

    if (this.phase >= 4) {
      // Double vague decalee : exige de bouger immediatement apres la premiere.
      this.world.scene.time.delayedCall(700, () => {
        if (!this.alive) return;
        const pc = this.world.playerCell();
        this.telegraph(this.crossCells(pc, 6), 600, (c) => this.igniteCells(c, 520, 0xff7a2f));
      });
    }
  }
}

/* ===================================================================== */
/* CRYON - labyrinthe de glace                                            */
/* ===================================================================== */

/**
 * Cryon glisse en ligne droite et rebondit sur les murs : le joueur doit
 * lire sa trajectoire. Il n'est vulnerable qu'apres un impact (etourdissement),
 * ce qui force a preparer une bombe a l'avance.
 */
export class Cryon extends Boss {
  private vel: Vec2 = { x: 1, y: 0.6 };
  private speed = 150;
  private stunMs = 0;
  private shootAt = 2600;
  private wallsAt = 5200;

  constructor(
    world: World,
    kind: BossKind,
    spawn: Vec2,
    hp: number,
    arena: Set<number>,
  ) {
    super(world, kind, spawn, hp, arena);
    this.vulnerable = false;
  }

  protected override think(dtMs: number): void {
    if (this.stunMs > 0) {
      // Fenetre de vulnerabilite.
      this.stunMs -= dtMs;
      this.vulnerable = true;
      this.setFrame(1);
      if (this.stunMs <= 0) {
        this.vulnerable = false;
        this.setFrame(0);
        this.speed = 150 + this.phase * 26;
      }
      return;
    }

    this.vulnerable = false;
    this.setFrame(0);

    // Glissement avec rebond : on teste chaque axe separement.
    const step = (this.speed * dtMs) / 1000;
    const nx = this.x + this.vel.x * step;
    const ny = this.y + this.vel.y * step;
    let bounced = false;

    if (this.inArena(cellOf({ x: nx, y: this.y }))) {
      this.x = nx;
    } else {
      this.vel.x *= -1;
      bounced = true;
    }
    if (this.inArena(cellOf({ x: this.x, y: ny }))) {
      this.y = ny;
    } else {
      this.vel.y *= -1;
      bounced = true;
    }

    if (bounced) {
      // Impact : etourdissement et onde de choc autour du point de contact.
      this.stunMs = this.win(Math.max(900, 1500 - this.phase * 130));
      this.world.audio.play('bossHurt');
      this.world.fx.shockwave(this.pos, TILE * 2.4, 0x9bf0ff);
      this.world.fx.shake(0.008, 220);
      const ring = this.ringCells(this.cell, 1);
      this.telegraph(ring, 420, (c) => this.igniteCells(c, 420, 0x9bf0ff));
    }

    this.shootAt -= dtMs;
    this.wallsAt -= dtMs;

    if (this.phase >= 2 && this.shootAt <= 0) {
      // Eclats de glace dans 4 (puis 8) directions.
      this.shootAt = this.cd(2800 - this.phase * 250);
      this.setFrame(2);
      const dirs: Vec2[] =
        this.phase >= 3
          ? [
              { x: 1, y: 0 },
              { x: -1, y: 0 },
              { x: 0, y: 1 },
              { x: 0, y: -1 },
              { x: 0.7, y: 0.7 },
              { x: -0.7, y: 0.7 },
              { x: 0.7, y: -0.7 },
              { x: -0.7, y: -0.7 },
            ]
          : [
              { x: 1, y: 0 },
              { x: -1, y: 0 },
              { x: 0, y: 1 },
              { x: 0, y: -1 },
            ];
      for (const d of dirs) {
        this.world.spawnProjectile({
          from: this.pos,
          dir: d,
          speed: 190,
          tint: 0x9bf0ff,
          lifeMs: 2600,
        });
      }
      this.world.scene.time.delayedCall(260, () => this.setFrame(0));
    }

    if (this.phase >= 2 && this.wallsAt <= 0) {
      // Murs de glace : reduisent l'espace sans jamais enfermer le joueur.
      this.wallsAt = this.cd(7000);
      const pc = this.world.playerCell();
      const candidates = this.ringCells(pc, 2).filter(
        (c) =>
          this.world.grid.kindAt(c.x, c.y) === TileKind.Ice &&
          !this.world.hasBombAt(c) &&
          !this.world.playerOccupies(c.x, c.y),
      );
      const chosen = candidates.filter((_, i) => i % 2 === 0).slice(0, 4);
      this.telegraph(chosen, 800, (cells) => {
        for (const c of cells) {
          // Dernier controle au moment de la materialisation.
          if (this.world.playerOccupies(c.x, c.y)) continue;
          this.world.grid.setTile(c.x, c.y, TileKind.Block, 0);
          this.world.onTileChanged(c);
        }
        this.world.audio.play('doorMove');
        this.world.notify('Cryon dresse des murs de glace', 'bad');
      });
    }
  }
}

/* ===================================================================== */
/* LE GARDIEN - temple oublie                                             */
/* ===================================================================== */

/**
 * Le plus exigeant : il n'est vulnerable que les yeux ouverts (fenetre
 * reguliere et annoncee), repand des zones toxiques en croix, invoque des
 * sentinelles, se teleporte et termine en frenesie.
 */
export class Gardien extends Boss {
  private cycleMs = 0;
  private attackAt = 1800;
  private readonly openMs = 3000;
  private readonly closedMs = 4200;

  constructor(
    world: World,
    kind: BossKind,
    spawn: Vec2,
    hp: number,
    arena: Set<number>,
  ) {
    super(world, kind, spawn, hp, arena);
    this.vulnerable = false;
  }

  protected override think(dtMs: number): void {
    this.cycleMs += dtMs;
    const closed = this.cd(Math.max(1600, this.closedMs - this.phase * 500));
    const total = closed + this.win(this.openMs);
    const inCycle = this.cycleMs % total;
    const wasVulnerable = this.vulnerable;
    this.vulnerable = inCycle >= closed;
    if (this.vulnerable && !wasVulnerable) {
      this.world.audio.play('switchOn');
      this.setFrame(2);
    }
    if (!this.vulnerable) this.setFrame(0);

    this.attackAt -= dtMs;
    if (this.attackAt > 0) return;

    const roll = Math.random();

    if (this.phase >= 3 && roll < 0.3) {
      // Teleportation pres du joueur, annoncee par une onde.
      const spot = this.world.freeCellNear(this.world.playerCell(), 3);
      if (spot && this.inArena(spot)) {
        this.setFrame(1);
        this.telegraph([spot, ...this.ringCells(spot, 1)], 760, () => {
          const p = centerOf(spot);
          this.world.fx.shockwave(this.pos, TILE * 2, 0x7cd44a);
          this.x = p.x;
          this.y = p.y;
          this.world.fx.shockwave(this.pos, TILE * 2.6, 0x7cd44a);
          this.igniteCells(this.ringCells(spot, 1), 420, 0x7cd44a);
          this.setFrame(0);
        });
        this.attackAt = this.cd(3000);
        return;
      }
    }

    if (roll < 0.45) {
      // Frappe de racines : croix toxique depuis le joueur.
      const pc = this.world.playerCell();
      this.setFrame(1);
      const cells = this.crossCells(pc, 4);
      this.telegraph(cells, this.phase >= 3 ? 700 : 1000, (c) => {
        for (const cell of c) this.world.spreadToxic(cell, 2600);
        this.world.audio.play('trap');
        this.setFrame(0);
      });
      this.attackAt = this.cd(2800 - this.phase * 200);
      return;
    }

    if (roll < 0.68) {
      // Onde circulaire expansive : il faut sortir de l'anneau.
      this.setFrame(1);
      const center = this.cell;
      for (let r = 1; r <= 3; r++) {
        this.world.scene.time.delayedCall((r - 1) * 520, () => {
          if (!this.alive) return;
          this.telegraph(this.ringCells(center, r), 420, (c) =>
            this.igniteCells(c, 380, 0xf2e08a),
          );
        });
      }
      this.attackAt = this.cd(3400);
      this.world.scene.time.delayedCall(1800, () => this.setFrame(0));
      return;
    }

    if (roll < 0.86) {
      // Invocation de sentinelles.
      this.setFrame(1);
      const n = this.phase >= 3 ? 3 : this.phase >= 2 ? 2 : 1;
      for (let i = 0; i < n; i++) {
        const spot = this.world.freeCellNear(this.cell, 4);
        if (spot) this.world.spawnMinion(i % 2 === 0 ? 'guardian' : 'flanker', spot);
      }
      this.world.notify('Le Gardien appelle ses sentinelles', 'bad');
      this.attackAt = this.cd(5200);
      this.world.scene.time.delayedCall(420, () => this.setFrame(0));
      return;
    }

    // Dards : tirs multidirectionnels.
    this.setFrame(2);
    const count = this.phase >= 4 ? 8 : 6;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + Math.random() * 0.2;
      this.world.spawnProjectile({
        from: this.pos,
        dir: { x: Math.cos(a), y: Math.sin(a) },
        speed: 170 + this.phase * 16,
        tint: 0x7cd44a,
        lifeMs: 2800,
      });
    }
    this.attackAt = this.cd(2600);
    this.world.scene.time.delayedCall(300, () => this.setFrame(0));
  }

  protected override onPhaseChange(): void {
    super.onPhaseChange();
    if (this.phase >= 4) {
      this.world.notify('LE GARDIEN ENTRE EN FRENESIE', 'bad');
      this.cycleMs = 0;
    }
  }
}

export function createBoss(
  world: World,
  kind: BossKind,
  spawn: Vec2,
  hp: number,
  arena: Set<number>,
): Boss {
  switch (kind) {
    case 'magmaron':
      return new Magmaron(world, kind, spawn, hp, arena);
    case 'cryon':
      return new Cryon(world, kind, spawn, hp, arena);
    case 'gardien':
      return new Gardien(world, kind, spawn, hp, arena);
  }
}
