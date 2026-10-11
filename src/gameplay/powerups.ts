import type Phaser from 'phaser';
import { BOMB, DROP_TABLE, PLAYER, POWERUP, TEX, TILE } from '../core/constants';
import type { Rng } from '../core/rng';
import type { PowerUpKind, Theme, Vec2 } from '../core/types';
import { centerOf } from './motion';
import type { Player } from './player';
import type { World } from './worldApi';

interface Pickup {
  kind: PowerUpKind;
  cell: Vec2;
  sprite: Phaser.GameObjects.Sprite;
  takenAt: number;
}

const LABELS: Record<PowerUpKind, string> = {
  range: 'PORTEE +1',
  bomb: 'BOMBE +1',
  speed: 'VITESSE +1',
  shield: 'BOUCLIER',
  pierce: 'PERFORANTE x3',
  ability: 'CAPACITE PRETE',
  life: 'VIE +1',
};

/**
 * Bonus caches dans les blocs.
 *
 * Les probabilites sont reglees par theme (voir DROP_TABLE) : assez genereuses
 * pour recompenser le nettoyage de blocs, assez rares pour que la portee
 * maximale ne soit jamais acquise sans effort.
 */
export class PowerUpManager {
  private readonly pickups: Pickup[] = [];

  constructor(
    private readonly world: World,
    private readonly theme: Theme,
  ) {}

  /** Tirage pour un bloc detruit. `guaranteed` force un bonus (blocs marques). */
  rollForBlock(cell: Vec2, rng: Rng, guaranteed = false): void {
    const table = DROP_TABLE[this.theme];
    if (guaranteed) {
      const pool: PowerUpKind[] = ['range', 'bomb', 'speed', 'shield', 'pierce'];
      this.spawn(cell, rng.pick(pool));
      return;
    }
    let roll = rng.next();
    for (const [kind, chance] of Object.entries(table)) {
      if (roll < chance) {
        this.spawn(cell, kind as PowerUpKind);
        return;
      }
      roll -= chance;
    }
  }

  spawn(cell: Vec2, kind: PowerUpKind): void {
    if (this.pickups.some((p) => p.cell.x === cell.x && p.cell.y === cell.y)) return;
    const p = centerOf(cell);
    const sprite = this.world.scene.add.sprite(p.x, p.y, TEX.powerup(kind), 0);
    sprite.setDepth(18);
    sprite.play(`power-${kind}`, true);
    sprite.setScale(0.1);
    this.world.scene.tweens.add({
      targets: sprite,
      scale: 1,
      duration: 320,
      ease: 'Back.easeOut',
    });
    this.pickups.push({ kind, cell: { ...cell }, sprite, takenAt: 0 });
  }

  /** Un bonus detruit par une explosion disparait (choix classique, lisible). */
  onBlastCells(cells: readonly Vec2[]): void {
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const p = this.pickups[i];
      if (!cells.some((c) => c.x === p.cell.x && c.y === p.cell.y)) continue;
      this.world.fx.debris(centerOf(p.cell), 0xffffff);
      p.sprite.destroy();
      this.pickups.splice(i, 1);
    }
  }

  /** Ramassage : applique l'effet au joueur. */
  tryCollect(player: Player): PowerUpKind | null {
    const cell = player.cell;
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const p = this.pickups[i];
      if (p.cell.x !== cell.x || p.cell.y !== cell.y) continue;
      this.apply(player, p.kind);
      const pos = centerOf(p.cell);
      this.world.fx.floatingText(pos, LABELS[p.kind], '#7df0ff');
      this.world.fx.shockwave(pos, TILE * 1.2, 0x7df0ff);
      this.world.audio.play(p.kind === 'life' ? 'lifeUp' : p.kind === 'shield' ? 'shield' : 'pickup');
      p.sprite.destroy();
      this.pickups.splice(i, 1);
      return p.kind;
    }
    return null;
  }

  private apply(player: Player, kind: PowerUpKind): void {
    switch (kind) {
      case 'range':
        player.range = Math.min(BOMB.maxRange, player.range + 1);
        break;
      case 'bomb':
        player.maxBombs = Math.min(BOMB.maxCount, player.maxBombs + 1);
        break;
      case 'speed':
        player.speedBonus = Math.min(5, player.speedBonus + 1);
        break;
      case 'shield':
        player.shieldUntil = this.world.elapsedMs + POWERUP.shieldMs;
        break;
      case 'pierce':
        player.pierceCharges += POWERUP.pierceCharges;
        break;
      case 'ability':
        player.abilityReadyAt = 0;
        break;
      case 'life':
        player.lives = Math.min(PLAYER.maxLives, player.lives + 1);
        break;
    }
  }

  /** Bonus actuellement au sol (sauvegarde de partie). */
  list(): { kind: PowerUpKind; cell: Vec2 }[] {
    return this.pickups.map((p) => ({ kind: p.kind, cell: { ...p.cell } }));
  }

  clear(): void {
    for (const p of this.pickups) p.sprite.destroy();
    this.pickups.length = 0;
  }
}
