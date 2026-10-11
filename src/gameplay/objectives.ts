import type Phaser from 'phaser';
import { TEX, TILE } from '../core/constants';
import { TileKind, type ObjectiveState, type Vec2 } from '../core/types';
import type { ParsedMap, PropSpawn } from '../maps/mapTypes';
import { centerOf } from './motion';
import type { World } from './worldApi';

interface Prop {
  spawn: PropSpawn;
  done: boolean;
  sprite: Phaser.GameObjects.Sprite;
  label: Phaser.GameObjects.Text | null;
}

export interface ObjectiveHooks {
  onChanged: () => void;
  /** Tous les objectifs principaux sont remplis : la grille du boss s'ouvre. */
  onPropsComplete: () => void;
  onVictory: () => void;
}

/**
 * Suivi des objectifs d'une carte.
 *
 * Une victoire n'est validee qu'apres : objectifs principaux remplis,
 * boss vaincu, puis contact avec la sortie. Rien n'est enregistre avant.
 */
export class ObjectiveController {
  private readonly states = new Map<string, ObjectiveState>();
  private readonly props: Prop[] = [];
  private bossDead = false;
  private exitUnlocked = false;
  private exitSprite: Phaser.GameObjects.Sprite | null = null;

  constructor(
    private readonly world: World,
    private readonly parsed: ParsedMap,
    private readonly hooks: ObjectiveHooks,
  ) {
    for (const def of parsed.def.objectives) {
      this.states.set(def.id, {
        id: def.id,
        label: def.label,
        mandatory: def.mandatory,
        done: false,
        current: 0,
        total: def.total,
      });
    }

    // Les props sont ordonnes par index pour les valves a ordre impose.
    const sorted = [...parsed.props].sort((a, b) => a.index - b.index);
    for (const spawn of sorted) {
      const p = centerOf(spawn.cell);
      const texture =
        spawn.kind === 'valve' ? TEX.valve : spawn.kind === 'generator' ? TEX.generator : TEX.relic;
      const sprite = world.scene.add.sprite(p.x, p.y, texture, 0);
      sprite.setDepth(20);
      if (spawn.kind === 'relic') sprite.play('relic', true);

      let label: Phaser.GameObjects.Text | null = null;
      if (parsed.def.orderedProps) {
        label = world.scene.add.text(p.x, p.y - TILE * 0.52, String(spawn.index), {
          fontFamily: 'Impact, "Arial Black", sans-serif',
          fontSize: '15px',
          color: '#ffd27a',
          stroke: '#1a0b09',
          strokeThickness: 4,
        });
        label.setOrigin(0.5).setDepth(21);
      }
      this.props.push({ spawn, done: false, sprite, label });
    }

    const exitCell = parsed.exit;
    const ep = centerOf(exitCell);
    this.exitSprite = world.scene.add.sprite(ep.x, ep.y, TEX.exit, 0);
    this.exitSprite.setDepth(12);
    this.refreshPropsObjective();
  }

  get list(): ObjectiveState[] {
    return [...this.states.values()];
  }

  get mandatoryComplete(): boolean {
    return this.list.filter((o) => o.mandatory).every((o) => o.done);
  }

  get propsComplete(): boolean {
    return this.props.every((p) => p.done);
  }

  get doneCount(): number {
    return this.list.filter((o) => o.done).length;
  }

  private set(id: string, mutate: (o: ObjectiveState) => void): void {
    const o = this.states.get(id);
    if (!o) return;
    mutate(o);
    o.done = o.current >= o.total;
    this.hooks.onChanged();
  }

  private refreshPropsObjective(): void {
    this.set('props', (o) => {
      o.current = this.props.filter((p) => p.done).length;
    });
  }

  /* ----------------------------------------------------- interactions ---- */

  /** Le joueur entre sur une case : valves, reliques, sortie. */
  onPlayerEnterCell(cell: Vec2): void {
    for (const prop of this.props) {
      if (prop.done) continue;
      if (prop.spawn.cell.x !== cell.x || prop.spawn.cell.y !== cell.y) continue;

      if (prop.spawn.kind === 'valve') {
        const expected = this.props.filter((p) => p.done).length + 1;
        if (prop.spawn.index !== expected) {
          // Mauvais ordre : signale clairement sans tuer le joueur.
          this.world.notify(`Valve ${prop.spawn.index} : activez d'abord la valve ${expected}`, 'bad');
          this.world.audio.play('uiBack');
          this.world.fx.floatingText(centerOf(cell), 'ORDRE INCORRECT', '#ff6a6a');
          return;
        }
        this.completeProp(prop, 'Valve thermique activee');
        return;
      }

      if (prop.spawn.kind === 'relic') {
        this.completeProp(prop, 'Relique recuperee');
        return;
      }
    }

    // Sortie.
    if (this.world.grid.kindAt(cell.x, cell.y) === TileKind.Exit) {
      if (this.exitUnlocked) {
        // L'objectif de sortie n'est valide qu'ici : c'est le contact reel
        // avec la sortie deverrouillee qui termine la carte.
        this.set('exit', (o) => {
          o.current = 1;
        });
        this.hooks.onVictory();
      } else {
        this.world.notify('Sortie verrouillee : objectifs incomplets', 'bad');
      }
    }
  }

  /** Cases touchees par une explosion : alimente les generateurs. */
  onBlastCells(cells: readonly Vec2[]): void {
    for (const prop of this.props) {
      if (prop.done || prop.spawn.kind !== 'generator') continue;
      const hit = cells.some((c) => c.x === prop.spawn.cell.x && c.y === prop.spawn.cell.y);
      if (hit) this.completeProp(prop, 'Generateur alimente');
    }
  }

  private completeProp(prop: Prop, message: string): void {
    prop.done = true;
    prop.sprite.setFrame(prop.spawn.kind === 'generator' ? 3 : 1);
    if (prop.spawn.kind === 'generator') prop.sprite.play('generator-on', true);
    if (prop.spawn.kind === 'relic') {
      // La relique rejoint le joueur : retour visuel fort.
      this.world.scene.tweens.add({
        targets: prop.sprite,
        y: prop.sprite.y - 30,
        alpha: 0,
        scale: 1.6,
        duration: 520,
        onComplete: () => prop.sprite.destroy(),
      });
    }
    prop.label?.destroy();
    prop.label = null;

    this.world.audio.play(
      prop.spawn.kind === 'generator' ? 'generatorOn' : prop.spawn.kind === 'relic' ? 'relic' : 'switchOn',
    );
    this.world.fx.shockwave(centerOf(prop.spawn.cell), TILE * 1.6, 0xffd27a);
    this.world.notify(message, 'good');
    this.refreshPropsObjective();

    if (this.propsComplete) {
      this.world.notify('Grille du boss deverrouillee !', 'good');
      this.world.audio.play('gateOpen');
      this.hooks.onPropsComplete();
    }
  }

  onSecretFound(count: number): void {
    this.set('secrets', (o) => {
      o.current = count;
    });
    this.world.audio.play('secret');
    this.world.notify('Passage secret decouvert !', 'good');
  }

  onMechanismProgress(done: number): void {
    this.set('mechanism', (o) => {
      o.current = done;
    });
  }

  onEnemyKilled(total: number): void {
    this.set('kills', (o) => {
      o.current = Math.min(o.total, total);
    });
  }

  onBossKilled(): void {
    this.bossDead = true;
    this.set('boss', (o) => {
      o.current = 1;
    });
    this.unlockExitIfReady();
  }

  /** L'objectif "sans degat" echoue des la premiere vie perdue. */
  onPlayerDamaged(): void {
    this.set('flawless', (o) => {
      o.current = 0;
      o.total = 1;
    });
    const o = this.states.get('flawless');
    if (o) {
      o.done = false;
      o.label = 'Objectif "sans degat" perdu';
    }
    this.hooks.onChanged();
  }

  /** Appele a la fin si aucun degat n'a ete subi. */
  markFlawless(): void {
    this.set('flawless', (o) => {
      o.current = 1;
    });
  }

  private unlockExitIfReady(): void {
    if (this.exitUnlocked) return;
    if (!this.propsComplete || !this.bossDead) return;
    this.exitUnlocked = true;
    this.exitSprite?.play('exit-open', true);
    this.world.audio.play('gateOpen');
    this.world.notify('La sortie est ouverte !', 'good');
    this.world.fx.flash(0x7cf0c0, 260);
  }

  update(): void {
    this.unlockExitIfReady();
  }

  /** Etat des objectifs principaux (pour la sauvegarde de partie). */
  get propsDone(): boolean[] {
    return this.props.map((p) => p.done);
  }

  /** Restaure un etat sauvegarde (reprise de partie). */
  restoreState(
    propsDone: boolean[],
    objectives: { id: string; current: number; done: boolean }[],
    bossDead: boolean,
  ): void {
    this.props.forEach((prop, i) => {
      if (!propsDone[i] || prop.done) return;
      prop.done = true;
      prop.label?.destroy();
      prop.label = null;
      if (prop.spawn.kind === 'relic') prop.sprite.destroy();
      else prop.sprite.setFrame(prop.spawn.kind === 'generator' ? 3 : 1);
    });
    for (const o of objectives) {
      const state = this.states.get(o.id);
      if (!state) continue;
      state.current = o.current;
      state.done = o.done;
    }
    this.bossDead = bossDead;
    if (this.propsComplete) this.hooks.onPropsComplete();
    this.unlockExitIfReady();
    this.hooks.onChanged();
  }

  /**
   * Prochaine cible a atteindre, pour la boussole :
   * objectif principal restant, puis le boss, puis la sortie.
   */
  nextTarget(from: Vec2, bossAlive: boolean, bossCell: Vec2): Vec2 | null {
    const pending = this.props.filter((p) => !p.done);
    if (pending.length > 0) {
      if (this.parsed.def.orderedProps) {
        // Ordre impose : on ne montre que la valve suivante.
        const next = pending.reduce((a, b) => (a.spawn.index <= b.spawn.index ? a : b));
        return next.spawn.cell;
      }
      const nearest = pending.reduce((a, b) => {
        const da = Math.abs(a.spawn.cell.x - from.x) + Math.abs(a.spawn.cell.y - from.y);
        const db = Math.abs(b.spawn.cell.x - from.x) + Math.abs(b.spawn.cell.y - from.y);
        return da <= db ? a : b;
      });
      return nearest.spawn.cell;
    }
    if (bossAlive) return bossCell;
    return this.parsed.exit;
  }

  /** Etat des objectifs principaux, pour la mini-carte. */
  get propMarkers(): { cell: Vec2; done: boolean; index: number }[] {
    return this.props.map((p) => ({ cell: p.spawn.cell, done: p.done, index: p.spawn.index }));
  }

  get exitIsOpen(): boolean {
    return this.exitUnlocked;
  }

  get bossDefeated(): boolean {
    return this.bossDead;
  }

  /** Objectifs remplis pour le calcul de score (principaux + secondaires). */
  get completedForScore(): number {
    return this.list.filter((o) => o.done).length;
  }

  destroy(): void {
    for (const p of this.props) {
      p.sprite.destroy();
      p.label?.destroy();
    }
    this.exitSprite?.destroy();
  }
}
