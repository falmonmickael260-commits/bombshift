import type Phaser from 'phaser';
import { AI, COMBAT, MOVE, PLAYER, TEX, TILE } from '../core/constants';
import type { Dir, EnemyKind, Vec2 } from '../core/types';
import { AI_AGGRO, AI_SPEED, decideEnemy } from './ai';
import { cellOf, centerOf } from './motion';
import type { World } from './worldApi';

/**
 * Ennemi a deplacement case par case.
 *
 * Le pas de grille garantit des collisions fiables et une lecture claire :
 * le joueur peut toujours anticiper ou l'ennemi sera a la prochaine case.
 */
export class Enemy {
  readonly kind: EnemyKind;
  x: number;
  y: number;
  dir: Dir = 'down';
  hp: number;
  alive = true;
  /** Deja comptabilise dans les statistiques (evite les doubles comptes). */
  counted = false;
  /**
   * Un ennemi reste inerte tant que le joueur n'approche pas de son secteur.
   * Cela cree une montee en pression progressive et epargne du calcul.
   */
  asleep = true;
  readonly home: Vec2 | null;

  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly shadow: Phaser.GameObjects.Image;
  private step: Vec2 | null = null;
  private nextThinkAt = 0;
  private hitUntil = 0;
  private readonly speed: number;
  private mode = 'patrol';

  constructor(
    private readonly world: World,
    kind: EnemyKind,
    cell: Vec2,
    home: Vec2 | null = null,
  ) {
    this.kind = kind;
    this.hp = COMBAT.enemyHp[kind];
    this.home = home;
    const p = centerOf(cell);
    this.x = p.x;
    this.y = p.y;
    // Les ennemis rapides sont legerement ralentis par rapport au joueur a
    // pleine vitesse : la fuite reste toujours possible.
    this.speed = AI_SPEED[kind] * world.difficulty.enemySpeed;

    this.shadow = world.scene.add.image(p.x, p.y + TILE * 0.28, TEX.shadow);
    this.shadow.setDepth(13).setAlpha(0.45).setScale(0.66);
    this.sprite = world.scene.add.sprite(p.x, p.y, TEX.enemy(kind), 0);
    this.sprite.setDepth(28).setOrigin(0.5, 0.62);
    this.sprite.play(`enemy-${kind}`, true);
    this.nextThinkAt = world.elapsedMs + Math.random() * AI.thinkIntervalMs;
  }

  get cell(): Vec2 {
    return cellOf({ x: this.x, y: this.y });
  }

  get pos(): Vec2 {
    return { x: this.x, y: this.y };
  }

  get currentMode(): string {
    return this.mode;
  }

  update(dtMs: number, occupied: Set<number>): void {
    if (!this.alive) return;
    const now = this.world.elapsedMs;
    const dt = dtMs / 1000;
    const cell = this.cell;

    if (this.asleep) {
      const p = this.world.playerCell();
      if (Math.abs(p.x - cell.x) + Math.abs(p.y - cell.y) <= PLAYER.wakeRadius) {
        this.wake();
      } else {
        this.sprite.setTint(0x7a7a8c);
        return;
      }
    }

    // Decision : a intervalle fixe, ou des qu'un pas est termine.
    if (this.step === null && now >= this.nextThinkAt) {
      this.nextThinkAt = now + AI.thinkIntervalMs;
      const decision = decideEnemy(this.kind, cell, this.dir, {
        grid: this.world.grid,
        danger: this.world.danger,
        player: this.world.playerCell(),
        occupied,
        home: this.home ?? undefined,
        aggroRange: AI_AGGRO[this.kind] * this.world.difficulty.enemyAggro,
      });
      this.mode = decision.mode;
      const s = decision.step;
      if (s && !this.world.actorBlocked(s.x, s.y, cell)) {
        this.step = s;
        this.dir = s.x > cell.x ? 'right' : s.x < cell.x ? 'left' : s.y > cell.y ? 'down' : 'up';
      }
    }

    if (this.step) {
      const target = centerOf(this.step);
      // Un obstacle est apparu (bloc pousse, bombe posee) : on annule le pas.
      if (this.world.actorBlocked(this.step.x, this.step.y, cell)) {
        this.step = null;
      } else {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.hypot(dx, dy);
        const move = this.speed * dt;
        if (dist <= move) {
          this.x = target.x;
          this.y = target.y;
          this.step = null;
        } else {
          this.x += (dx / dist) * move;
          this.y += (dy / dist) * move;
        }
      }
    }

    this.sprite.setPosition(this.x, this.y);
    this.shadow.setPosition(this.x, this.y + TILE * 0.28);
    this.sprite.setFlipX(this.dir === 'left');

    // Les ennemis qui fuient le danger se teintent : indice visuel utile.
    if (this.mode === 'flee') this.sprite.setTint(0xbfd4ff);
    else if (now < this.hitUntil) this.sprite.setTint(0xffffff);
    else this.sprite.clearTint();

    // Mort par sol mortel (lave / zone toxique) : les ennemis ne trichent pas.
    if (this.world.grid.isLethalFloor(cell.x, cell.y)) this.kill('hazard');
  }

  /** Reveil : petit sursaut pour que le joueur le remarque. */
  wake(): void {
    if (!this.asleep) return;
    this.asleep = false;
    this.sprite.clearTint();
    this.world.scene.tweens.add({
      targets: this.sprite,
      scaleX: { from: 1.25, to: 1 },
      scaleY: { from: 0.78, to: 1 },
      duration: 240,
      ease: 'Back.easeOut',
    });
  }

  /**
   * Applique un degat. Retourne true si l'ennemi meurt.
   * Le cooldown evite qu'une meme explosion ne compte plusieurs fois.
   */
  hit(amount = 1): boolean {
    if (!this.alive) return false;
    const now = this.world.elapsedMs;
    if (now < this.hitUntil) return false;
    this.hitUntil = now + COMBAT.enemyHitCooldownMs;
    this.wake();
    this.hp -= amount;
    if (this.hp <= 0) {
      this.kill('blast');
      return true;
    }
    this.sprite.play(`enemy-${this.kind}-hurt`, true);
    this.world.scene.time.delayedCall(140, () => {
      if (this.alive) this.sprite.play(`enemy-${this.kind}`, true);
    });
    this.world.fx.floatingText(this.pos, `${this.hp}`, '#ffd27a');
    return false;
  }

  private kill(cause: 'blast' | 'hazard'): void {
    if (!this.alive) return;
    this.alive = false;
    this.world.audio.play('enemyDie');
    this.world.fx.debris(this.pos, cause === 'hazard' ? 0xff7a2f : 0xffffff);
    this.world.fx.explosion(this.pos, 0xffd27a);
    this.shadow.setVisible(false);
    this.world.scene.tweens.add({
      targets: this.sprite,
      scale: { from: 1.15, to: 0.1 },
      angle: 220,
      alpha: 0,
      duration: 280,
      ease: 'Quad.easeIn',
      onComplete: () => this.sprite.setVisible(false),
    });
  }

  /** Rayon de contact : legerement inferieur a la case pour rester equitable. */
  get contactRadius(): number {
    return TILE * (this.kind === 'heavy' ? 0.42 : 0.36) + TILE * MOVE.radius * 0.1;
  }

  destroy(): void {
    this.sprite.destroy();
    this.shadow.destroy();
  }
}
