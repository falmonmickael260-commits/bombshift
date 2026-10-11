import Phaser from 'phaser';
import { registerAnims } from '../core/anims';
import { buildCharacterTextures } from '../core/charArt';
import { buildParticleTextures, buildTileTextures } from '../core/tileArt';
import type { Theme } from '../core/types';

const THEMES: readonly Theme[] = ['volcano', 'ice', 'temple'];

/**
 * Generation de tout l'art du jeu (textures canvas) et des animations.
 * Aucun fichier externe n'est charge : pas de dependance reseau, donc
 * aucun asset provisoire ni lien susceptible de disparaitre.
 */
export class BootScene extends Phaser.Scene {
  static readonly KEY = 'boot';
  static readonly READY_EVENT = 'bombshift:ready';

  constructor() {
    super({ key: BootScene.KEY });
  }

  create(): void {
    buildTileTextures(this, THEMES);
    buildParticleTextures(this);
    buildCharacterTextures(this);
    registerAnims(this, THEMES);
    this.game.events.emit(BootScene.READY_EVENT);
  }
}
