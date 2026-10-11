import type Phaser from 'phaser';
import { TEX, TILE } from '../core/constants';
import type { GridMap } from '../core/grid';
import { TileKind, type Theme, type Vec2 } from '../core/types';

/**
 * Affichage de la grille en deux couches :
 * - couche de sol (toujours presente, y compris sous les blocs),
 * - couche d'objets (blocs, cristaux, portes, grilles).
 *
 * Un faux mur (passage secret) est dessine exactement comme un mur : il n'est
 * donc pas reperable avant d'etre souffle, ce qui recompense l'exploration.
 */
export class TileRenderer {
  private readonly base: (Phaser.GameObjects.Sprite | null)[];
  private readonly objects: (Phaser.GameObjects.Sprite | null)[];
  private readonly rubble: (Phaser.GameObjects.Image | null)[];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly grid: GridMap,
    private readonly theme: Theme,
  ) {
    const n = grid.width * grid.height;
    this.base = new Array(n).fill(null);
    this.objects = new Array(n).fill(null);
    this.rubble = new Array(n).fill(null);
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) this.refresh({ x, y });
    }
  }

  private pos(cell: Vec2): { x: number; y: number } {
    return { x: cell.x * TILE + TILE / 2, y: cell.y * TILE + TILE / 2 };
  }

  /** Recree l'affichage d'une case (apres destruction, ouverture, coulee...). */
  refresh(cell: Vec2): void {
    const idx = this.grid.idx(cell.x, cell.y);
    const t = this.grid.tiles[idx];
    if (!t) return;
    const p = this.pos(cell);

    const setBase = (key: string, frame = 0, depth = 2): Phaser.GameObjects.Sprite => {
      let s = this.base[idx];
      if (!s) {
        s = this.scene.add.sprite(p.x, p.y, key, frame);
        this.base[idx] = s;
      } else if (s.texture.key !== key) {
        s.anims.stop();
        s.setTexture(key, frame);
      }
      s.setDepth(depth).setFrame(frame).setVisible(true);
      return s;
    };

    const clearObject = (): void => {
      const o = this.objects[idx];
      if (o) {
        o.destroy();
        this.objects[idx] = null;
      }
    };

    const setObject = (key: string, frame = 0, depth = 10): Phaser.GameObjects.Sprite => {
      let s = this.objects[idx];
      if (!s) {
        s = this.scene.add.sprite(p.x, p.y, key, frame);
        this.objects[idx] = s;
      } else if (s.texture.key !== key) {
        s.anims.stop();
        s.setTexture(key, frame);
      }
      s.setDepth(depth).setFrame(frame).setVisible(true);
      return s;
    };

    const floorKey =
      t.kind === TileKind.Ice ? TEX.ice(t.variant % 4) : TEX.floor(this.theme, t.variant % 4);

    switch (t.kind) {
      case TileKind.Wall:
        setBase(TEX.wall(this.theme), 0, 8);
        clearObject();
        break;

      case TileKind.Secret:
        if (t.revealed) {
          setBase(floorKey, 0, 2);
          clearObject();
          this.addRubble(cell, idx);
        } else {
          // Indiscernable d'un mur.
          setBase(TEX.wall(this.theme), 0, 8);
          clearObject();
        }
        break;

      case TileKind.Block:
        setBase(floorKey, 0, 2);
        setObject(TEX.block(this.theme, t.variant % 2), 0, 10);
        break;

      case TileKind.Crystal:
        setBase(floorKey, 0, 2);
        setObject(TEX.crystal, 0, 10);
        break;

      case TileKind.Gate:
        setBase(floorKey, 0, 2);
        setObject(TEX.gate, 0, 10);
        break;

      case TileKind.Door:
        setBase(floorKey, 0, 2);
        setObject(TEX.door, t.frame, 10);
        break;

      case TileKind.Lava: {
        const s = setBase(TEX.lava, 0, 3);
        if (s.anims.currentAnim?.key !== 'lava') s.play('lava', true);
        clearObject();
        break;
      }

      case TileKind.Vent:
        setBase(TEX.vent, t.frame, 3);
        clearObject();
        break;

      case TileKind.Toxic:
        setBase(TEX.toxic, t.frame, 3);
        clearObject();
        break;

      case TileKind.Plate:
        setBase(TEX.plate, t.group === 2 ? (t.latched ? 1 : 0) : t.frame, 3);
        clearObject();
        break;

      case TileKind.Exit:
        // La sortie est geree par le controleur d'objectifs (sprite dedie).
        setBase(TEX.floor(this.theme, 0), 0, 2);
        clearObject();
        break;

      default:
        setBase(floorKey, 0, 2);
        clearObject();
        break;
    }
  }

  private addRubble(cell: Vec2, idx: number): void {
    if (this.rubble[idx]) return;
    const p = this.pos(cell);
    const img = this.scene.add.image(p.x, p.y, TEX.rubble(this.theme));
    img.setDepth(4).setAlpha(0.9);
    this.rubble[idx] = img;
  }

  /** Appele quand un bloc est detruit : on laisse des debris au sol. */
  onDestroyed(cell: Vec2): void {
    const idx = this.grid.idx(cell.x, cell.y);
    this.refresh(cell);
    this.addRubble(cell, idx);
  }

  destroy(): void {
    for (const s of this.base) s?.destroy();
    for (const s of this.objects) s?.destroy();
    for (const s of this.rubble) s?.destroy();
  }
}
