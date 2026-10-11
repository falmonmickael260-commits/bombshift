import type Phaser from 'phaser';
import { Rng } from './rng';

/** Convertit une couleur 0xRRGGBB en chaine CSS, avec alpha optionnel. */
export function css(color: number, alpha = 1): string {
  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;
  return alpha >= 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${alpha})`;
}

/** Eclaircit (amount > 0) ou assombrit (amount < 0) une couleur. */
export function shade(color: number, amount: number): number {
  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;
  const f = (v: number): number =>
    Math.max(0, Math.min(255, Math.round(amount >= 0 ? v + (255 - v) * amount : v * (1 + amount))));
  return (f(r) << 16) | (f(g) << 8) | f(b);
}

export function mix(a: number, b: number, t: number): number {
  const ar = (a >> 16) & 0xff;
  const ag = (a >> 8) & 0xff;
  const ab = a & 0xff;
  const br = (b >> 16) & 0xff;
  const bg = (b >> 8) & 0xff;
  const bb = b & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | bl;
}

export type FrameDrawer = (
  ctx: CanvasRenderingContext2D,
  frame: number,
  w: number,
  h: number,
  rng: Rng,
) => void;

/**
 * Cree une texture canvas multi-frames et y declare les frames Phaser.
 * Tout l'art du jeu passe par ici : rien n'est charge depuis le reseau.
 */
export function makeSheet(
  scene: Phaser.Scene,
  key: string,
  frameW: number,
  frameH: number,
  count: number,
  draw: FrameDrawer,
  seed = 1234,
): void {
  if (scene.textures.exists(key)) return;
  const tex = scene.textures.createCanvas(key, frameW * count, frameH);
  if (!tex) return;
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = true;
  for (let i = 0; i < count; i++) {
    const rng = new Rng(seed + i * 7919);
    ctx.save();
    ctx.beginPath();
    ctx.rect(i * frameW, 0, frameW, frameH);
    ctx.clip();
    ctx.translate(i * frameW, 0);
    draw(ctx, i, frameW, frameH, rng);
    ctx.restore();
    tex.add(i, 0, i * frameW, 0, frameW, frameH);
  }
  tex.refresh();
}

export function makeTexture(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, rng: Rng) => void,
  seed = 4242,
): void {
  makeSheet(scene, key, w, h, 1, (ctx, _f, fw, fh, rng) => draw(ctx, fw, fh, rng), seed);
}

/** Rectangle arrondi (compatible navigateurs sans roundRect). */
export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

/** Mouchetis deterministe : casse l'aspect "aplat" des surfaces. */
export function speckle(
  ctx: CanvasRenderingContext2D,
  rng: Rng,
  w: number,
  h: number,
  count: number,
  colors: number[],
  alpha = 0.25,
  maxSize = 2.2,
): void {
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = css(colors[rng.int(0, colors.length - 1)], alpha * rng.float(0.5, 1));
    const s = rng.float(0.7, maxSize);
    ctx.fillRect(rng.float(0, w - s), rng.float(0, h - s), s, s);
  }
}

/** Lueur radiale. */
export function glow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: number,
  alpha = 0.6,
): void {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, css(color, alpha));
  g.addColorStop(0.55, css(color, alpha * 0.35));
  g.addColorStop(1, css(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

/** Trace une fissure organique (volcan, dalles fendues). */
export function crack(
  ctx: CanvasRenderingContext2D,
  rng: Rng,
  x: number,
  y: number,
  len: number,
  angle: number,
  width: number,
): void {
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  let cx = x;
  let cy = y;
  let a = angle;
  const steps = Math.max(2, Math.round(len / 5));
  for (let i = 0; i < steps; i++) {
    a += rng.float(-0.55, 0.55);
    cx += Math.cos(a) * (len / steps);
    cy += Math.sin(a) * (len / steps);
    ctx.lineTo(cx, cy);
  }
  ctx.stroke();
}
