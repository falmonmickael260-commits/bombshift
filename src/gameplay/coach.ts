import type { Vec2 } from '../core/types';
import { TileKind } from '../core/types';
import type { World } from './worldApi';

type HintId =
  | 'move'
  | 'bomb'
  | 'retreat'
  | 'block'
  | 'powerup'
  | 'vent'
  | 'lava'
  | 'compass'
  | 'ice'
  | 'plate';

interface Hint {
  id: HintId;
  text: string;
  /** Delai minimum (ms) avant que le conseil puisse apparaitre. */
  afterMs?: number;
}

/**
 * Conseils contextuels pour la premiere partie d'une carte.
 *
 * Personne ne lit un briefing de dix lignes sur telephone : les regles sont
 * donc rappelees au moment exact ou elles deviennent utiles, une seule fois,
 * et uniquement tant que la carte n'a jamais ete terminee.
 */
export class Coach {
  private readonly shown = new Set<HintId>();
  private nextAllowedAt = 0;

  constructor(
    private readonly world: World,
    private readonly enabled: boolean,
  ) {}

  private say(hint: Hint): void {
    if (!this.enabled || this.shown.has(hint.id)) return;
    const now = this.world.elapsedMs;
    if (now < (hint.afterMs ?? 0) || now < this.nextAllowedAt) return;
    this.shown.add(hint.id);
    // On espace les conseils : jamais deux messages qui se chevauchent.
    this.nextAllowedAt = now + 3200;
    this.world.notify(hint.text, 'info');
  }

  /** Appele a chaque frame avec le contexte courant. */
  update(ctx: {
    playerCell: Vec2;
    bombsPlaced: number;
    blocksDestroyed: number;
    powerupsTaken: number;
    activeBombs: number;
  }): void {
    if (!this.enabled) return;

    if (ctx.bombsPlaced === 0) {
      this.say({
        id: 'move',
        text: 'Approchez un bloc puis appuyez sur le bouton rouge pour poser une bombe.',
        afterMs: 2500,
      });
    } else {
      this.say({ id: 'retreat', text: 'Eloignez-vous : votre propre souffle vous blesse.' });
    }

    if (ctx.blocksDestroyed > 0) {
      this.say({ id: 'block', text: 'Certains blocs cachent des bonus. Nettoyez les couloirs.' });
    }
    if (ctx.powerupsTaken > 0) {
      this.say({ id: 'powerup', text: 'Bonus ramasse ! Les ameliorations durent toute la tentative.' });
    }

    // Conseils lies au terrain proche.
    const g = this.world.grid;
    const p = ctx.playerCell;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const k = g.kindAt(p.x + dx, p.y + dy);
        if (k === TileKind.Vent) {
          this.say({ id: 'vent', text: 'Cadre jaune : eruption imminente. Ne restez pas dessus.' });
        } else if (k === TileKind.Lava) {
          this.say({ id: 'lava', text: 'La lave tue au contact : elle ne se traverse jamais.' });
        } else if (k === TileKind.Ice) {
          this.say({ id: 'ice', text: 'Sur la glace, relachez le joystick avant l\'obstacle.' });
        } else if (k === TileKind.Plate) {
          this.say({ id: 'plate', text: 'Dalle doree : elle frappe une seconde apres le contact.' });
        }
      }
    }

    this.say({
      id: 'compass',
      text: 'La fleche en bord d\'ecran indique votre objectif.',
      afterMs: 9000,
    });
  }
}
