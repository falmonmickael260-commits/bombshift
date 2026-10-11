import type Phaser from 'phaser';
import { BOMB, TEX } from './constants';
import type { BombType, EnemyKind, PowerUpKind, Theme } from './types';

/** Enregistre toutes les animations une seule fois (evite les doublons). */
export function registerAnims(scene: Phaser.Scene, themes: readonly Theme[]): void {
  const add = (key: string, texture: string, frames: number[], frameRate: number, repeat = -1): void => {
    if (scene.anims.exists(key)) return;
    scene.anims.create({
      key,
      frames: frames.map((f) => ({ key: texture, frame: f })),
      frameRate,
      repeat,
    });
  };

  add('player-down', TEX.player, [0, 1, 2, 3], 10);
  add('player-up', TEX.player, [4, 5, 6, 7], 10);
  add('player-side', TEX.player, [8, 9, 10, 11], 10);
  add('player-hurt', TEX.player, [12], 1, 0);
  add('player-victory', TEX.player, [13], 1, 0);
  add('player-defeat', TEX.player, [14], 1, 0);

  const enemies: EnemyKind[] = ['patroller', 'chaser', 'flanker', 'coward', 'heavy', 'guardian'];
  for (const k of enemies) {
    add(`enemy-${k}`, TEX.enemy(k), [0, 1, 2, 3], 8);
    add(`enemy-${k}-hurt`, TEX.enemy(k), [4], 1, 0);
  }

  const bombs: BombType[] = ['classic', 'pierce', 'shift', 'slow'];
  for (const b of bombs) {
    add(`bomb-${b}`, `${TEX.bomb}-${b}`, [0, 1, 2, 3], 6);
  }

  // La flamme joue ses 6 etapes exactement sur la duree de vie du souffle.
  if (!scene.anims.exists('flame')) {
    scene.anims.create({
      key: 'flame',
      frames: [0, 1, 2, 3, 4, 5].map((f) => ({ key: TEX.flame, frame: f })),
      duration: BOMB.flameMs,
      repeat: 0,
    });
  }

  const powers: PowerUpKind[] = ['range', 'bomb', 'speed', 'shield', 'pierce', 'ability', 'life'];
  for (const p of powers) add(`power-${p}`, TEX.powerup(p), [0, 1, 2, 3], 7);

  add('lava', TEX.lava, [0, 1, 2, 3], 5);
  add('relic', TEX.relic, [0, 1, 2, 3], 6);
  add('exit-open', TEX.exit, [1, 2, 3, 2], 5);
  add('generator-on', TEX.generator, [1, 2, 3, 2], 7);
  add('projectile', TEX.projectile, [0, 1, 2, 3], 10);
  void themes;
}
