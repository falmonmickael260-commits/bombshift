import type Phaser from 'phaser';
import { BOMB, MOVE, PLAYER, TEX, TILE } from '../core/constants';
import { TileKind, type Dir, type InputState, type Vec2 } from '../core/types';
import { cellOf, centerOf, moveBody, type Body } from './motion';
import type { World } from './worldApi';

export interface PlayerIntents {
  wantBomb: boolean;
  wantAbility: boolean;
  wantAbility2: boolean;
}

/**
 * Le heros. Ne gere ni la pose de bombe ni les degats d'explosion
 * (orchestres par la scene), mais tout son etat propre : vies, bonus,
 * invulnerabilite, animation et deplacement.
 */
export class Player {
  readonly body: Body;
  dir: Dir = 'down';
  alive = true;

  lives: number;
  maxBombs: number = BOMB.baseCount;
  range: number = BOMB.baseRange;
  speedBonus = 0;
  pierceCharges = 0;

  /** Horodatages (ms de jeu). */
  invulnUntil = 0;
  shieldUntil = 0;
  abilityReadyAt = 0;
  ability2ReadyAt = 0;

  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly shadow: Phaser.GameObjects.Image;
  private readonly halo: Phaser.GameObjects.Image;
  private readonly shield: Phaser.GameObjects.Image;
  private lastBombAt = -1e9;
  private lastAbilityAt = -1e9;
  private lastAbility2At = -1e9;
  private walking = false;
  private stepDustAt = 0;

  constructor(
    private readonly world: World,
    spawn: Vec2,
    lives: number = PLAYER.startLives,
  ) {
    const p = centerOf(spawn);
    this.body = { x: p.x, y: p.y, vx: 0, vy: 0, radius: TILE * MOVE.radius };
    this.lives = lives;

    // Halo au sol : le heros reste identifiable au milieu des effets.
    this.halo = world.scene.add.image(p.x, p.y + TILE * 0.22, TEX.shield);
    this.halo.setDepth(11).setAlpha(0.22).setScale(0.62).setTint(0xffb347);

    this.shadow = world.scene.add.image(p.x, p.y + TILE * 0.3, TEX.shadow);
    this.shadow.setDepth(14).setAlpha(0.55).setScale(0.78);

    this.sprite = world.scene.add.sprite(p.x, p.y, TEX.player, 0);
    this.sprite.setDepth(30).setOrigin(0.5, 0.62).setScale(1.08);

    this.shield = world.scene.add.image(p.x, p.y, TEX.shield);
    this.shield.setDepth(31).setVisible(false).setScale(0.78);

    // Court repit au demarrage : personne ne perd une vie avant d'avoir
    // pu lire l'ecran.
    this.invulnUntil = PLAYER.spawnGraceMs;
  }

  get speed(): number {
    return Math.min(MOVE.maxSpeed, MOVE.baseSpeed + this.speedBonus * MOVE.speedStep);
  }

  get cell(): Vec2 {
    return cellOf(this.body);
  }

  get pos(): Vec2 {
    return { x: this.body.x, y: this.body.y };
  }

  get invulnerable(): boolean {
    return this.world.elapsedMs < this.invulnUntil || this.shielded;
  }

  get shielded(): boolean {
    return this.world.elapsedMs < this.shieldUntil;
  }

  get abilityCooldownRatio(): number {
    const left = this.abilityReadyAt - this.world.elapsedMs;
    return left <= 0 ? 0 : Math.min(1, left / BOMB.abilityCooldownMs);
  }

  get ability2CooldownRatio(): number {
    const left = this.ability2ReadyAt - this.world.elapsedMs;
    return left <= 0 ? 0 : Math.min(1, left / (BOMB.abilityCooldownMs * 1.6));
  }

  /** Vitesse courante en pixels/s (sert a decider si une bombe glisse). */
  get speedMagnitude(): number {
    return Math.hypot(this.body.vx, this.body.vy);
  }

  update(dtMs: number, input: InputState): PlayerIntents {
    const intents: PlayerIntents = { wantBomb: false, wantAbility: false, wantAbility2: false };
    if (!this.alive) {
      this.sprite.setPosition(this.body.x, this.body.y);
      return intents;
    }

    const dt = dtMs / 1000;
    const cell = this.cell;
    const slippery = this.world.grid.isSlippery(cell.x, cell.y);

    const res = moveBody(this.body, input.moveX, input.moveY, dt, {
      speed: this.speed * (input.magnitude > 0.01 ? Math.min(1, Math.max(0.35, input.magnitude)) : 0),
      slippery,
      laneAssist: !slippery,
      blocked: (cx, cy) => this.world.playerBlocked(cx, cy),
    });

    if (res.dir) this.dir = res.dir;
    this.walking = Math.hypot(this.body.vx, this.body.vy) > 12;
    this.updateAnim();

    // Poussiere de pas / trainee sur la glace.
    if (this.walking && this.world.elapsedMs - this.stepDustAt > (slippery ? 90 : 220)) {
      this.stepDustAt = this.world.elapsedMs;
      if (slippery) this.world.fx.trail({ x: this.body.x, y: this.body.y + 14 }, 0xd6f7ff);
      else this.world.fx.puff({ x: this.body.x, y: this.body.y + 16 }, 0xb8a79a);
    }

    // Anti double-action : une seule prise en compte par appui.
    const now = this.world.elapsedMs;
    if (input.bombPressed && now - this.lastBombAt > PLAYER.inputDebounceMs) {
      this.lastBombAt = now;
      intents.wantBomb = true;
    }
    if (input.abilityPressed && now - this.lastAbilityAt > PLAYER.inputDebounceMs) {
      this.lastAbilityAt = now;
      intents.wantAbility = true;
    }
    if (input.ability2Pressed && now - this.lastAbility2At > PLAYER.inputDebounceMs) {
      this.lastAbility2At = now;
      intents.wantAbility2 = true;
    }

    this.syncSprites();
    return intents;
  }

  /** Mise a jour minimale apres la fin de partie (anim de victoire/defaite conservee). */
  idleUpdate(): void {
    if (!this.sprite.scene) return;
    this.syncSprites();
  }

  private updateAnim(): void {
    if (!this.sprite.scene) return;
    const key =
      this.dir === 'up' ? 'player-up' : this.dir === 'down' ? 'player-down' : 'player-side';
    if (this.dir === 'left') this.sprite.setFlipX(true);
    else if (this.dir === 'right') this.sprite.setFlipX(false);

    if (this.walking) {
      if (this.sprite.anims.currentAnim?.key !== key || !this.sprite.anims.isPlaying) {
        this.sprite.play(key, true);
      }
    } else {
      this.sprite.anims.stop();
      this.sprite.setFrame(
        this.dir === 'up' ? 4 : this.dir === 'down' ? 0 : 8,
      );
    }
  }

  private syncSprites(): void {
    if (!this.sprite.scene) return;
    this.sprite.setPosition(this.body.x, this.body.y);
    this.shadow.setPosition(this.body.x, this.body.y + TILE * 0.3);
    this.halo.setPosition(this.body.x, this.body.y + TILE * 0.22);
    this.halo.setRotation(this.world.elapsedMs / 1400);

    // Clignotement d'invulnerabilite : lisible sans masquer le personnage.
    const inv = this.world.elapsedMs < this.invulnUntil;
    this.sprite.setAlpha(inv ? (Math.floor(this.world.elapsedMs / 90) % 2 === 0 ? 0.35 : 1) : 1);

    if (this.shielded) {
      this.shield.setVisible(true).setPosition(this.body.x, this.body.y);
      const t = (this.shieldUntil - this.world.elapsedMs) / 1000;
      this.shield.setAlpha(t < 1.6 ? 0.4 + 0.4 * Math.sin(this.world.elapsedMs / 70) : 0.85);
      this.shield.setRotation(this.world.elapsedMs / 600);
    } else {
      this.shield.setVisible(false);
    }
  }

  /**
   * Applique un degat. Retourne false si le joueur etait invulnerable
   * (protege contre les degats repetes d'une meme collision).
   */
  hit(): boolean {
    if (!this.alive || this.invulnerable) return false;
    this.lives--;
    this.invulnUntil = this.world.elapsedMs + PLAYER.invulnMs * this.world.difficulty.invuln;
    this.world.audio.play('hurt');
    if (this.world.settings.haptics && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([40, 40, 60]);
      } catch {
        /* vibration non supportee */
      }
    }
    this.world.fx.flash(0xff3b3b, 160);
    this.world.fx.shake(0.009, 240);
    this.sprite.play('player-hurt', true);
    this.world.scene.time.delayedCall(260, () => this.updateAnim());

    // Les ameliorations temporaires de la tentative sont partiellement perdues :
    // perdre une vie a un cout, sans reduire a zero la progression.
    this.range = Math.max(BOMB.baseRange, this.range - 1);
    this.pierceCharges = 0;
    if (this.lives <= 0) this.alive = false;
    return true;
  }

  /** Replace le joueur apres une perte de vie. */
  respawn(cell: Vec2): void {
    const p = centerOf(cell);
    this.body.x = p.x;
    this.body.y = p.y;
    this.body.vx = 0;
    this.body.vy = 0;
    this.dir = 'down';
    this.invulnUntil = this.world.elapsedMs + PLAYER.invulnMs * this.world.difficulty.invuln;
    this.syncSprites();
  }

  canPlaceBomb(activeBombs: number): boolean {
    return this.alive && activeBombs < this.maxBombs;
  }

  canUseAbility(hasAbility: boolean): boolean {
    return this.alive && hasAbility && this.world.elapsedMs >= this.abilityReadyAt;
  }

  startAbilityCooldown(): void {
    this.abilityReadyAt = this.world.elapsedMs + BOMB.abilityCooldownMs;
  }

  canUseAbility2(hasAbility: boolean): boolean {
    return this.alive && hasAbility && this.world.elapsedMs >= this.ability2ReadyAt;
  }

  startAbility2Cooldown(): void {
    this.ability2ReadyAt = this.world.elapsedMs + BOMB.abilityCooldownMs * 1.6;
  }

  /** Case devant le joueur : utilisee par la bombe SHIFT. */
  facingVector(): Vec2 {
    switch (this.dir) {
      case 'up':
        return { x: 0, y: -1 };
      case 'down':
        return { x: 0, y: 1 };
      case 'left':
        return { x: -1, y: 0 };
      default:
        return { x: 1, y: 0 };
    }
  }

  playVictory(): void {
    this.sprite.anims.stop();
    this.sprite.play('player-victory', true);
    this.world.scene.tweens.add({
      targets: this.sprite,
      y: this.body.y - 10,
      duration: 260,
      yoyo: true,
      repeat: 3,
      ease: 'Quad.easeOut',
    });
  }

  playDefeat(): void {
    this.sprite.anims.stop();
    this.sprite.play('player-defeat', true);
    this.shield.setVisible(false);
  }

  /** Le joueur est-il sur une case mortelle (lave, event, zone toxique) ? */
  standingOnLethalFloor(): boolean {
    const c = this.cell;
    const t = this.world.grid.tileAt(c.x, c.y);
    if (!t) return false;
    if (t.kind === TileKind.Lava) return true;
    return (t.kind === TileKind.Vent || t.kind === TileKind.Toxic) && t.active;
  }

  destroy(): void {
    this.sprite.destroy();
    this.shadow.destroy();
    this.halo.destroy();
    this.shield.destroy();
  }
}
