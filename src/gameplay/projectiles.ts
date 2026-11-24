import Phaser from 'phaser';
import { TEX, TILE } from '../core/constants';
import type { Vec2 } from '../core/types';
import { cellOf } from './motion';
import type { ProjectileSpec, World } from './worldApi';

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  dieAt: number;
  radius: number;
  sprite: Phaser.GameObjects.Sprite;
}

/** Projectiles de boss : detruits par les murs, dangereux au contact. */
export class ProjectileManager {
  private readonly items: Projectile[] = [];

  constructor(private readonly world: World) {}

  spawn(spec: ProjectileSpec): void {
    const len = Math.hypot(spec.dir.x, spec.dir.y) || 1;
    const sprite = this.world.scene.add.sprite(spec.from.x, spec.from.y, TEX.projectile, 0);
    sprite.setDepth(36).setTint(spec.tint).setBlendMode(Phaser.BlendModes.ADD);
    sprite.play('projectile', true);
    this.items.push({
      x: spec.from.x,
      y: spec.from.y,
      vx: (spec.dir.x / len) * spec.speed,
      vy: (spec.dir.y / len) * spec.speed,
      dieAt: this.world.elapsedMs + spec.lifeMs,
      radius: spec.radius ?? TILE * 0.22,
      sprite,
    });
  }

  update(dtMs: number): void {
    const dt = dtMs / 1000;
    const now = this.world.elapsedMs;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const p = this.items[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.sprite.setPosition(p.x, p.y);
      p.sprite.setRotation(Math.atan2(p.vy, p.vx));

      const c = cellOf({ x: p.x, y: p.y });
      const blocked = this.world.grid.isSolid(c.x, c.y) || !this.world.grid.inBounds(c.x, c.y);
      if (blocked || now >= p.dieAt) {
        this.world.fx.puff({ x: p.x, y: p.y }, 0xffffff);
        p.sprite.destroy();
        this.items.splice(i, 1);
      }
    }
  }

  /** Teste la collision avec le joueur et consomme le projectile. */
  hitsPlayer(pos: Vec2, radius: number): boolean {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const p = this.items[i];
      if (Math.hypot(p.x - pos.x, p.y - pos.y) <= radius + p.radius) {
        this.world.fx.explosion({ x: p.x, y: p.y }, 0xffffff);
        p.sprite.destroy();
        this.items.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  snapshot(): Array<{ x: number; y: number; vx: number; vy: number; leftMs: number; radius: number }> {
    return this.items.map(p => ({
      x: p.x, y: p.y, vx: p.vx, vy: p.vy, leftMs: Math.max(0, p.dieAt - this.world.elapsedMs), radius: p.radius,
    }));
  }

  /** L'invité affiche les projectiles de l'hôte sans recalculer leurs collisions. */
  applyNetwork(items: readonly { x: number; y: number; vx: number; vy: number; leftMs: number; radius: number }[]): void {
    while (this.items.length > items.length) this.items.pop()!.sprite.destroy();
    for (let i = 0; i < items.length; i++) {
      const state = items[i];
      if (![state.x, state.y, state.vx, state.vy, state.leftMs, state.radius].every(Number.isFinite)) continue;
      if (i >= this.items.length) {
        this.spawn({ from: { x: state.x, y: state.y },
          dir: { x: state.vx, y: state.vy }, speed: Math.hypot(state.vx, state.vy),
          lifeMs: state.leftMs, tint: 0xffffff, radius: state.radius });
      }
      const p = this.items[i];
      if (!p) continue;
      p.x = state.x; p.y = state.y;
      p.vx = state.vx; p.vy = state.vy;
      p.radius = state.radius;
      p.dieAt = this.world.elapsedMs + state.leftMs;
      p.sprite.setPosition(p.x, p.y).setRotation(Math.atan2(p.vy, p.vx));
    }
  }

  clear(): void {
    for (const p of this.items) p.sprite.destroy();
    this.items.length = 0;
  }
}
