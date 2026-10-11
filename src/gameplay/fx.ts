import Phaser from 'phaser';
import { CAMERA, TEX, TILE } from '../core/constants';
import type { Settings } from '../core/save';
import type { Vec2 } from '../core/types';

type EffectLevel = Settings['effects'];

const BUDGET: Record<EffectLevel, number> = { low: 0.35, medium: 0.7, high: 1 };

/**
 * Effets visuels : particules, debris, textes flottants, secousses.
 * Tout passe par un budget global pour pouvoir alleger sur mobile
 * (reglage "Effets" dans les options) sans toucher au gameplay.
 */
export class Fx {
  private level: EffectLevel = 'high';
  private shakeEnabled = true;
  private flashesEnabled = true;
  private readonly container: Phaser.GameObjects.Container;

  constructor(
    private readonly scene: Phaser.Scene,
    depth = 60,
  ) {
    this.container = scene.add.container(0, 0);
    this.container.setDepth(depth);
  }

  configure(settings: Settings): void {
    this.level = settings.effects;
    this.shakeEnabled = settings.screenShake;
    this.flashesEnabled = !settings.reduceFlashes;
  }

  private count(base: number): number {
    return Math.max(1, Math.round(base * BUDGET[this.level]));
  }

  shake(intensity: number, durationMs: number): void {
    if (!this.shakeEnabled) return;
    this.scene.cameras.main.shake(durationMs, intensity, false);
  }

  flash(color = 0xffffff, durationMs = 120): void {
    if (!this.flashesEnabled) return;
    this.scene.cameras.main.flash(
      durationMs,
      (color >> 16) & 0xff,
      (color >> 8) & 0xff,
      color & 0xff,
      false,
    );
  }

  /** Eclat d'explosion : etincelles + fumee. */
  explosion(pos: Vec2, tint = 0xffb347): void {
    const n = this.count(10);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.4;
      const d = 14 + Math.random() * 26;
      const spark = this.scene.add.image(pos.x, pos.y, TEX.particle);
      spark.setTint(tint).setDepth(58).setScale(0.5 + Math.random() * 0.5).setBlendMode(Phaser.BlendModes.ADD);
      this.scene.tweens.add({
        targets: spark,
        x: pos.x + Math.cos(a) * d,
        y: pos.y + Math.sin(a) * d,
        alpha: 0,
        scale: 0.1,
        duration: 260 + Math.random() * 220,
        ease: 'Quad.easeOut',
        onComplete: () => spark.destroy(),
      });
    }
    if (this.level !== 'low') {
      const smoke = this.scene.add.image(pos.x, pos.y, TEX.smoke);
      smoke.setTint(0x6a5a52).setAlpha(0.5).setDepth(57).setScale(0.8);
      this.scene.tweens.add({
        targets: smoke,
        scale: 2.1,
        alpha: 0,
        y: pos.y - 18,
        duration: 620,
        onComplete: () => smoke.destroy(),
      });
    }
  }

  /** Debris de bloc detruit. */
  debris(pos: Vec2, tint: number): void {
    const n = this.count(7);
    for (let i = 0; i < n; i++) {
      const shard = this.scene.add.image(pos.x, pos.y, TEX.shard);
      shard.setTint(tint).setDepth(56).setScale(0.6 + Math.random() * 0.6);
      shard.setRotation(Math.random() * Math.PI * 2);
      this.scene.tweens.add({
        targets: shard,
        x: pos.x + (Math.random() - 0.5) * TILE * 1.6,
        y: pos.y + (Math.random() - 0.5) * TILE * 1.4,
        rotation: shard.rotation + (Math.random() - 0.5) * 6,
        alpha: 0,
        scale: 0.2,
        duration: 420 + Math.random() * 260,
        ease: 'Quad.easeIn',
        onComplete: () => shard.destroy(),
      });
    }
  }

  /** Poussiere de pas / impact leger. */
  puff(pos: Vec2, tint = 0xffffff): void {
    if (this.level === 'low') return;
    const img = this.scene.add.image(pos.x, pos.y, TEX.smoke);
    img.setTint(tint).setAlpha(0.35).setDepth(20).setScale(0.4);
    this.scene.tweens.add({
      targets: img,
      scale: 1,
      alpha: 0,
      duration: 340,
      onComplete: () => img.destroy(),
    });
  }

  /** Onde de choc circulaire. */
  shockwave(pos: Vec2, radius = TILE * 2, tint = 0xffd27a): void {
    if (this.level === 'low') return;
    const ring = this.scene.add.image(pos.x, pos.y, TEX.shield);
    ring.setTint(tint).setDepth(57).setScale(0.2).setAlpha(0.8).setBlendMode(Phaser.BlendModes.ADD);
    this.scene.tweens.add({
      targets: ring,
      scale: (radius * 2) / 72,
      alpha: 0,
      duration: 380,
      ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy(),
    });
  }

  /** Texte flottant (bonus, score, avertissement). */
  floatingText(pos: Vec2, text: string, color = '#ffd27a'): void {
    const label = this.scene.add.text(pos.x, pos.y - 10, text, {
      fontFamily: 'Impact, "Arial Black", sans-serif',
      fontSize: '16px',
      color,
      stroke: '#120a0c',
      strokeThickness: 4,
    });
    label.setOrigin(0.5).setDepth(70);
    this.scene.tweens.add({
      targets: label,
      y: pos.y - 42,
      alpha: 0,
      duration: 900,
      ease: 'Quad.easeOut',
      onComplete: () => label.destroy(),
    });
  }

  /** Trainee de glissement (bombe SHIFT, patinage sur glace). */
  trail(pos: Vec2, tint = 0xd6f7ff): void {
    if (this.level === 'low') return;
    const img = this.scene.add.image(pos.x, pos.y, TEX.particle);
    img.setTint(tint).setAlpha(0.45).setDepth(18).setScale(0.6);
    this.scene.tweens.add({
      targets: img,
      alpha: 0,
      scale: 0.2,
      duration: 260,
      onComplete: () => img.destroy(),
    });
  }

  /** Secousse calibree pour les explosions. */
  blastShake(big: boolean): void {
    this.shake(big ? CAMERA.shakeBig : CAMERA.shakeSmall, big ? 320 : 170);
  }

  destroy(): void {
    this.container.destroy();
  }
}
