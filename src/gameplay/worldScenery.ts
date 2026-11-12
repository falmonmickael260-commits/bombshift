import type Phaser from 'phaser';
import { TILE } from '../core/constants';
import { isBiome } from '../core/biomeArt';
import type { GridMap } from '../core/grid';
import type { Settings } from '../core/save';
import { TileKind } from '../core/types';
import type { MapDefinition } from '../maps';
import { flowPhase } from './flowFields';

/** Bounded, world-space scenery. Gameplay hazards always render above these effects. */
export class WorldScenery {
  private readonly motes: { node: Phaser.GameObjects.Arc | Phaser.GameObjects.Ellipse; x: number; y: number; speed: number }[] = [];
  private readonly fields: { graphics: Phaser.GameObjects.Graphics; def: NonNullable<MapDefinition['flows']>[number] }[] = [];
  private readonly fans: Phaser.GameObjects.Graphics[] = [];
  private readonly width: number;
  private readonly height: number;
  private readonly reduceMotion: boolean;

  constructor(scene: Phaser.Scene, grid: GridMap, private readonly def: MapDefinition, settings: Settings) {
    this.width = grid.width * TILE; this.height = grid.height * TILE;
    this.reduceMotion = settings.effects === 'low' || settings.reduceFlashes;
    if (!isBiome(def.theme)) return;

    // Distinct ambient silhouettes: bubbles, sand streaks, orbital stars, cold steam.
    const count = this.reduceMotion ? 8 : settings.effects === 'medium' ? 20 : 36;
    for (let i = 0; i < count; i++) {
      const x = ((i * 197 + 91) % (this.width - 60)) + 30;
      const y = ((i * 137 + 73) % (this.height - 60)) + 30;
      let node: Phaser.GameObjects.Arc | Phaser.GameObjects.Ellipse;
      if (def.theme === 'ocean') node = scene.add.circle(x, y, 2 + i % 3, 0xa6e6d2, 0.02).setStrokeStyle(1, 0xc0f5e2, 0.24);
      else if (def.theme === 'desert') node = scene.add.ellipse(x, y, 22 + i % 11, 1.5, 0xffdfa6, 0.18);
      else if (def.theme === 'dimension') node = scene.add.circle(x, y, i % 3 === 0 ? 2 : 1, i % 2 ? 0xf2d7ff : 0xa6efff, 0.4);
      else node = scene.add.ellipse(x, y, 6, 14, 0xc0e0ef, 0.06);
      node.setDepth(6);
      this.motes.push({ node, x, y, speed: 8 + i % 13 });
    }
    if (def.theme === 'ocean') {
      // Long caustic rays, behind characters and above the seabed.
      const rays = scene.add.graphics().setDepth(4);
      for (let i = 0; i < 5; i++) {
        rays.fillStyle(0x9ae4d1, 0.035);
        rays.fillTriangle(i * 270, 0, i * 270 + 60, 0, i * 270 + 210, this.height);
      }
    }
    if (def.theme === 'electric') {
      grid.forEachTile((t, x, y) => {
        if (t.kind !== TileKind.Wall || (x * 7 + y * 13) % 17 !== 0) return;
        const fan = scene.add.graphics({ x: x * TILE + 24, y: y * TILE + 20 }).setDepth(10);
        fan.fillStyle(0xb0c4ca, 0.55);
        for (let i = 0; i < 4; i++) {
          const a = i * Math.PI / 2;
          fan.fillTriangle(0, 0, Math.cos(a) * 10, Math.sin(a) * 10, Math.cos(a + 0.8) * 10, Math.sin(a + 0.8) * 10);
        }
        this.fans.push(fan);
      });
    }
    for (const field of def.flows ?? []) {
      const g = scene.add.graphics().setDepth(5);
      this.fields.push({ graphics: g, def: field });
    }

  }

  update(elapsed: number, switchesDone: boolean): void {
    const t = elapsed / 1000;
    for (let i = 0; i < this.motes.length; i++) {
      const m = this.motes[i];
      if (this.reduceMotion) continue;
      if (this.def.theme === 'ocean') m.node.setPosition(m.x + Math.sin(t * 0.6 + i) * 9, (m.y - t * m.speed % this.height + this.height) % this.height);
      else if (this.def.theme === 'desert') m.node.setPosition((m.x + t * m.speed * 3) % this.width, m.y + Math.sin(t + i) * 3);
      else if (this.def.theme === 'dimension') m.node.setAlpha(0.25 + (Math.sin(t * 0.5 + i) + 1) * 0.15);
      else m.node.setPosition(m.x + Math.sin(t + i) * 4, (m.y - t * m.speed % this.height + this.height) % this.height);
    }
    this.fans.forEach((f) => { f.rotation = this.reduceMotion ? 0 : t * 0.8; });
    for (const { graphics: g, def: f } of this.fields) {
      const phase = flowPhase(f, elapsed, switchesDone);
      const active = phase === 'active';
      g.clear();
      const color = phase === 'warning' ? 0xffd24a : f.kind === 'conveyor' ? 0xdac394 : f.kind === 'wind' ? 0xffdfaa : 0xa2eff5;
      g.lineStyle(1, color, active ? 0.35 : phase === 'warning' ? 0.7 : 0.12);
      g.strokeRect(f.x * TILE + 2, f.y * TILE + 2, f.width * TILE - 4, f.height * TILE - 4);
      for (let y = f.y; y < f.y + f.height; y++) for (let x = f.x; x < f.x + f.width; x++) {
        const dx = f.direction === 'right' ? 1 : f.direction === 'left' ? -1 : 0;
        const dy = f.direction === 'down' ? 1 : f.direction === 'up' ? -1 : 0;
        const offset = active && !this.reduceMotion ? ((elapsed / 85) % 12) - 6 : 0;
        const px = x * TILE + 24 + dx * offset, py = y * TILE + 24 + dy * offset;
        if (f.kind === 'conveyor') {
          g.fillStyle(0x101b29, 0.7); g.fillRect(x * TILE + 5, y * TILE + 4, 38, 40);
          g.lineStyle(2, 0x74838c, 0.6);
          for (let i = -1; i < 2; i++) g.lineBetween(x * TILE + 7, y * TILE + 24 + i * 12, x * TILE + 41, y * TILE + 24 + i * 12);
        }
        g.lineStyle(2, color, active ? 0.6 : phase === 'warning' ? 0.8 : 0.15);
        g.lineBetween(px - dx * 6, py - dy * 6, px + dx * 6, py + dy * 6);
        g.lineBetween(px + dx * 6, py + dy * 6, px - dy * 4, py + dx * 4);
        g.lineBetween(px + dx * 6, py + dy * 6, px + dy * 4, py - dx * 4);
      }
    }
  }

  destroy(): void {
    for (const m of this.motes) m.node.destroy();
    for (const f of this.fields) f.graphics.destroy();
    for (const f of this.fans) f.destroy();
  }
}
