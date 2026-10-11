import { TileKind, type Tile, type Vec2 } from '../core/types';
import type { ParsedMap } from '../maps/mapTypes';
import { centerOf } from './motion';
import type { World } from './worldApi';

interface PendingFlow {
  cell: Vec2;
  atMs: number;
  warned: boolean;
}

interface TempToxic {
  cell: Vec2;
  untilMs: number;
  previous: TileKind;
}

interface ArmedPlate {
  cell: Vec2;
  firesAt: number;
  readyAt: number;
}

export interface HazardHooks {
  onTileChanged: (cell: Vec2) => void;
  /** Toutes les dalles-mecanismes sont enclenchees. */
  onMechanismComplete: () => void;
  onMechanismProgress: (done: number, total: number) => void;
}

/**
 * Dangers environnementaux : events volcaniques, zones toxiques, portes
 * temporisees, coulee de lave progressive et dalles piegees.
 *
 * Regle de design : chaque danger a une phase d'avertissement visible et un
 * cycle regulier. Le joueur peut toujours apprendre le rythme ; rien n'est
 * aleatoire et invisible.
 */
export class HazardController {
  private readonly flows: PendingFlow[] = [];
  private readonly tempToxic: TempToxic[] = [];
  private readonly armedPlates = new Map<number, ArmedPlate>();
  private mechanismDone = 0;
  private readonly mechanismTotal: number;
  private lastDoorState = new Map<number, boolean>();

  constructor(
    private readonly world: World,
    private readonly parsed: ParsedMap,
    private readonly hooks: HazardHooks,
  ) {
    const flow = parsed.def.lavaFlow;
    if (flow) {
      flow.cells.forEach((c, i) => {
        this.flows.push({ cell: { ...c }, atMs: flow.firstMs + i * flow.intervalMs, warned: false });
      });
    }
    this.mechanismTotal = parsed.mechanisms.length;
  }

  get mechanismProgress(): { done: number; total: number } {
    return { done: this.mechanismDone, total: this.mechanismTotal };
  }

  update(dtMs: number): void {
    void dtMs;
    const now = this.world.elapsedMs;
    this.updateCycles(now);
    this.updateDoors(now);
    this.updateFlow(now);
    this.updateTempToxic(now);
    this.updatePlates(now);
  }

  /* ---- events et zones toxiques : cycle idle -> avertissement -> actif ---- */

  private updateCycles(now: number): void {
    const def = this.parsed.def;
    const apply = (
      kind: TileKind,
      configs: readonly { group: number; periodMs: number; warnMs: number; activeMs: number; offsetMs: number }[],
    ): void => {
      this.world.grid.forEachTile((t, x, y) => {
        if (t.kind !== kind) return;
        const cfg = configs.find((c) => c.group === t.group) ?? configs[0];
        if (!cfg) return;
        const idle = Math.max(0, cfg.periodMs - cfg.warnMs - cfg.activeMs);
        const phase = (now + cfg.offsetMs) % cfg.periodMs;
        let frame = 0;
        let active = false;
        if (phase < idle) {
          frame = 0;
        } else if (phase < idle + cfg.warnMs) {
          // Deux etapes d'avertissement : on voit la montee en puissance.
          frame = phase < idle + cfg.warnMs / 2 ? 1 : 2;
        } else {
          frame = 3;
          active = true;
        }
        if (t.frame !== frame || t.active !== active) {
          t.frame = frame;
          t.active = active;
          this.hooks.onTileChanged({ x, y });
          if (active && frame === 3) {
            const pc = this.world.playerCell();
            if (Math.abs(pc.x - x) + Math.abs(pc.y - y) <= 6) this.world.audio.play('warning');
          }
        }
      });
    };

    if (def.vents) apply(TileKind.Vent, def.vents);
    if (def.toxic) apply(TileKind.Toxic, def.toxic);
  }

  /* ---- portes temporisees ---- */

  private updateDoors(now: number): void {
    const configs = this.parsed.def.doors;
    if (!configs) return;
    this.world.grid.forEachTile((t, x, y) => {
      if (t.kind !== TileKind.Door) return;
      const cfg = configs.find((c) => c.group === t.group) ?? configs[0];
      const phase = ((now + cfg.offsetMs) % cfg.periodMs) / cfg.periodMs;
      const closed = phase < cfg.closedRatio;
      // Progression 0..3 pour l'animation d'ouverture/fermeture.
      const local = closed ? phase / cfg.closedRatio : (phase - cfg.closedRatio) / (1 - cfg.closedRatio);
      const frame = closed
        ? local < 0.15
          ? 2
          : 3
        : local < 0.15
          ? 2
          : local > 0.85
            ? 1
            : 0;
      const idx = this.world.grid.idx(x, y);

      // Une porte ne se referme jamais sur un acteur : securite anti-blocage.
      const pc = this.world.playerCell();
      const occupied = pc.x === x && pc.y === y;
      const nextActive = occupied ? false : closed;

      if (t.active !== nextActive || t.frame !== frame) {
        if (this.lastDoorState.get(idx) !== nextActive) {
          this.lastDoorState.set(idx, nextActive);
          if (Math.abs(pc.x - x) + Math.abs(pc.y - y) <= 7) this.world.audio.play('doorMove');
        }
        t.active = nextActive;
        t.frame = frame;
        this.hooks.onTileChanged({ x, y });
      }
    });
  }

  /* ---- coulee de lave progressive ---- */

  private updateFlow(now: number): void {
    const cfg = this.parsed.def.lavaFlow;
    if (!cfg) return;
    for (const f of this.flows) {
      if (f.warned === false && now >= f.atMs - cfg.warnMs && now < f.atMs) {
        f.warned = true;
        const p = centerOf(f.cell);
        const img = this.world.scene.add.image(p.x, p.y, 'spr-warning');
        img.setDepth(21).setAlpha(0.9);
        this.world.scene.tweens.add({
          targets: img,
          alpha: { from: 0.4, to: 1 },
          duration: cfg.warnMs / 4,
          yoyo: true,
          repeat: 2,
          onComplete: () => img.destroy(),
        });
        this.world.notify('Une coulee de lave arrive !', 'bad');
        this.world.audio.play('warning');
      }
      if (now >= f.atMs && this.world.grid.kindAt(f.cell.x, f.cell.y) !== TileKind.Lava) {
        this.world.grid.setTile(f.cell.x, f.cell.y, TileKind.Lava, 0);
        this.hooks.onTileChanged(f.cell);
        this.world.fx.explosion(centerOf(f.cell), 0xff5a12);
        this.world.audio.play('explosion');
      }
    }
  }

  /* ---- zones toxiques temporaires (attaques de boss) ---- */

  addTempToxic(cell: Vec2, durationMs: number): void {
    const t = this.world.grid.tileAt(cell.x, cell.y);
    if (!t) return;
    if (t.kind === TileKind.Wall || t.kind === TileKind.Crystal || t.kind === TileKind.Block) return;
    const existing = this.tempToxic.find((x) => x.cell.x === cell.x && x.cell.y === cell.y);
    if (existing) {
      existing.untilMs = Math.max(existing.untilMs, this.world.elapsedMs + durationMs);
      return;
    }
    if (t.kind === TileKind.Toxic) {
      t.active = true;
      t.frame = 3;
      this.hooks.onTileChanged(cell);
      return;
    }
    this.tempToxic.push({
      cell: { ...cell },
      untilMs: this.world.elapsedMs + durationMs,
      previous: t.kind,
    });
    t.kind = TileKind.Toxic;
    t.group = 0;
    t.active = true;
    t.frame = 3;
    this.hooks.onTileChanged(cell);
  }

  private updateTempToxic(now: number): void {
    for (let i = this.tempToxic.length - 1; i >= 0; i--) {
      const tt = this.tempToxic[i];
      if (now < tt.untilMs) continue;
      const t = this.world.grid.tileAt(tt.cell.x, tt.cell.y);
      if (t) {
        t.kind = tt.previous;
        t.active = false;
        t.frame = 0;
        this.hooks.onTileChanged(tt.cell);
      }
      this.tempToxic.splice(i, 1);
    }
  }

  /* ---- dalles piegees et dalles-mecanismes ---- */

  /** Appele quand le joueur entre sur une case. */
  onPlayerEnterCell(cell: Vec2): void {
    const t = this.world.grid.tileAt(cell.x, cell.y);
    if (!t || t.kind !== TileKind.Plate) return;
    const idx = this.world.grid.idx(cell.x, cell.y);

    if (t.group === 2) {
      // Mecanisme : enclenchement definitif.
      if (t.latched) return;
      t.latched = true;
      t.frame = 1;
      this.hooks.onTileChanged(cell);
      this.mechanismDone++;
      this.world.audio.play('switchOn');
      this.world.fx.shockwave(centerOf(cell), 48, 0xc9a227);
      this.hooks.onMechanismProgress(this.mechanismDone, this.mechanismTotal);
      if (this.mechanismDone >= this.mechanismTotal) this.hooks.onMechanismComplete();
      return;
    }

    // Piege : declenchement annonce, le joueur a le temps de sortir.
    const armed = this.armedPlates.get(idx);
    const now = this.world.elapsedMs;
    if (armed && now < armed.readyAt) return;
    this.armedPlates.set(idx, { cell: { ...cell }, firesAt: now + 820, readyAt: now + 3200 });
    t.frame = 1;
    this.hooks.onTileChanged(cell);
    this.world.audio.play('warning');
  }

  private updatePlates(now: number): void {
    for (const [idx, plate] of this.armedPlates) {
      if (plate.firesAt > 0 && now >= plate.firesAt) {
        plate.firesAt = -1;
        this.world.audio.play('trap');
        this.world.igniteCell(plate.cell, 420, 0xffd24a);
        this.world.fx.shockwave(centerOf(plate.cell), 46, 0xffd24a);
      }
      if (now >= plate.readyAt) {
        const t = this.world.grid.tileAt(plate.cell.x, plate.cell.y);
        if (t && t.kind === TileKind.Plate && t.group !== 2) {
          t.frame = 0;
          this.hooks.onTileChanged(plate.cell);
        }
        this.armedPlates.delete(idx);
      }
    }
  }

  /** Etat courant d'une tuile animee (pour l'affichage). */
  static frameOf(t: Tile): number {
    return t.frame;
  }

  reset(): void {
    this.armedPlates.clear();
    this.tempToxic.length = 0;
    this.lastDoorState.clear();
  }
}
