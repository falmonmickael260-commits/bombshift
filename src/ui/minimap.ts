import { TileKind } from '../core/types';
import type { Vec2 } from '../core/types';

export interface MinimapData {
  width: number;
  height: number;
  /** Type de chaque case (indexe y * width + x). */
  tiles: number[];
  /** Secret revele / bloc detruit : cases deja ouvertes par le joueur. */
  player: Vec2;
  exit: Vec2;
  exitOpen: boolean;
  props: { cell: Vec2; done: boolean; index: number }[];
  enemies: Vec2[];
  boss: { cell: Vec2; alive: boolean; active: boolean } | null;
}

const COLORS: Partial<Record<TileKind, string>> = {
  [TileKind.Wall]: '#2b2630',
  [TileKind.Secret]: '#2b2630',
  [TileKind.Block]: '#6b4a3a',
  [TileKind.Crystal]: '#79c8e8',
  [TileKind.Lava]: '#ff5a12',
  [TileKind.Vent]: '#6a3a2a',
  [TileKind.Toxic]: '#5f9b36',
  [TileKind.Door]: '#4f8fb5',
  [TileKind.Gate]: '#c9a227',
  [TileKind.Ice]: '#2d5a7d',
  [TileKind.Plate]: '#8d8061',
  [TileKind.Exit]: '#7cf0c0',
};

/**
 * Mini-carte dessinee a la demande (ecran de pause).
 * Elle montre la topologie et les objectifs : sur une carte de 25x19 cases
 * dont on ne voit que 10 a l'ecran, c'est indispensable pour s'orienter.
 */
export function renderMinimap(canvas: HTMLCanvasElement, data: MinimapData): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const cell = Math.max(4, Math.floor(Math.min(canvas.width / data.width, canvas.height / data.height)));
  const w = cell * data.width;
  const h = cell * data.height;
  const ox = Math.floor((canvas.width - w) / 2);
  const oy = Math.floor((canvas.height - h) / 2);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0b0810';
  ctx.fillRect(ox, oy, w, h);

  for (let y = 0; y < data.height; y++) {
    for (let x = 0; x < data.width; x++) {
      const kind = data.tiles[y * data.width + x] as TileKind;
      const color = COLORS[kind] ?? '#1b1620';
      ctx.fillStyle = color;
      ctx.fillRect(ox + x * cell, oy + y * cell, cell, cell);
    }
  }

  const dot = (c: Vec2, color: string, radius = cell * 0.52, ring?: string): void => {
    const px = ox + c.x * cell + cell / 2;
    const py = oy + c.y * cell + cell / 2;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();
    if (ring) {
      ctx.strokeStyle = ring;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
  };

  for (const e of data.enemies) dot(e, '#d63b4a', cell * 0.38);
  for (const p of data.props) {
    dot(p.cell, p.done ? '#7cf0c0' : '#ffd24a', cell * 0.62, '#1a1208');
  }
  if (data.boss && data.boss.alive) dot(data.boss.cell, '#ff6a3b', cell * 0.8, '#2a0d06');
  dot(data.exit, data.exitOpen ? '#7cf0c0' : '#5a5f6b', cell * 0.6, '#06201a');
  dot(data.player, '#ffffff', cell * 0.6, '#ff8a3c');
}
