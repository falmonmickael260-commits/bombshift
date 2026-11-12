import type Phaser from 'phaser';
import { TEX, THEME_COLORS, TILE } from './constants';
import { css, glow, makeSheet, roundRect, shade, speckle } from './paint';
import type { Rng } from './rng';
import type { Theme } from './types';

export const BIOMES = ['ocean', 'desert', 'electric', 'dimension'] as const;
export type Biome = typeof BIOMES[number];
export function isBiome(theme: Theme): theme is Biome {
  return (BIOMES as readonly string[]).includes(theme);
}
const T = TILE;
type Context = CanvasRenderingContext2D;
const ellipse = (c: Context, x: number, y: number, rx: number, ry: number, color: number, alpha = 1): void => {
  c.fillStyle = css(color, alpha); c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill();
};
function polygon(c: Context, points: number[][], fill: number): void {
  c.fillStyle = css(fill); c.beginPath(); points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fill();
}
function coral(c: Context, x: number, y: number, color: number, size = 1): void {
  c.strokeStyle = css(shade(color, -0.3)); c.lineWidth = 5 * size; c.lineCap = 'round';
  for (let i = -1; i <= 1; i++) {
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + i * 11 * size, y - 10 * size, x + i * 10 * size, y - (20 - Math.abs(i) * 5) * size); c.stroke();
    c.strokeStyle = css(color); c.lineWidth = 3 * size;
    c.beginPath(); c.moveTo(x + i * 6 * size, y - 8 * size); c.lineTo(x + (i * 10 - 4) * size, y - 14 * size); c.stroke();
  }
}

function floor(c: Context, theme: Biome, v: number, rng: Rng): void {
  const p = THEME_COLORS[theme];
  c.fillStyle = css(p.floorA); c.fillRect(0, 0, T, T);
  if (theme === 'ocean') {
    const g = c.createLinearGradient(0, 0, T, T); g.addColorStop(0, '#176174'); g.addColorStop(1, '#134652'); c.fillStyle = g; c.fillRect(0, 0, T, T);
    speckle(c, rng, T, T, 26, [0x548780, 0x9da986, 0x0c384d], 0.2);
    c.strokeStyle = css(0x91e8c7, 0.16); c.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      c.beginPath(); c.moveTo(-3, i * 18 + v * 2); c.bezierCurveTo(12, i * 18 - 9, 24, i * 18 + 12, 52, i * 18 - 1); c.stroke();
    }
    if (v >= 2) { ellipse(c, 32, 29, 5, 2, 0xa3a98a, 0.35); ellipse(c, 14, 14, 2, 1, 0xd6d9ac, 0.4); }
  } else if (theme === 'desert') {
    const g = c.createLinearGradient(0, 0, T, T); g.addColorStop(0, '#cba46c'); g.addColorStop(1, '#b88b51'); c.fillStyle = g; c.fillRect(0, 0, T, T);
    speckle(c, rng, T, T, 42, [0xf8dba1, 0x88603f, 0xe2b878], 0.2);
    for (let i = 0; i < 5; i++) {
      c.strokeStyle = css(i % 2 ? 0xffe2b0 : 0x7d573a, 0.19); c.lineWidth = 1;
      c.beginPath(); c.moveTo(-4, i * 11); c.quadraticCurveTo(22, i * 11 - 12 + v, 52, i * 11 + 6); c.stroke();
    }
    if (v === 3) { ellipse(c, 14, 26, 3, 1.5, 0x6c5e4a, 0.5); ellipse(c, 18, 29, 2, 1, 0xe9d7a7, 0.7); }
  } else if (theme === 'electric') {
    c.fillStyle = '#172838'; c.fillRect(0, 0, T, T);
    const g = c.createLinearGradient(0, 0, T, T); g.addColorStop(0, '#2c4252'); g.addColorStop(1, '#1a2a39'); c.fillStyle = g; c.fillRect(1, 1, T - 2, T - 2);
    c.strokeStyle = '#101c28'; c.lineWidth = 2; c.strokeRect(2, 2, 44, 44);
    for (let i = 0; i < 4; i++) { c.strokeStyle = css(0x728795, 0.09); c.beginPath(); c.moveTo(4, 8 + i * 10); c.lineTo(43, 8 + i * 10); c.stroke(); }
    for (const x of [5, 41]) for (const y of [5, 41]) ellipse(c, x, y, 1, 1, 0x96aeba, 0.55);
    if (v === 2) { c.fillStyle = '#d8ad53'; c.fillRect(3, 21, 6, 3); c.fillRect(39, 21, 6, 3); }
    if (v === 3) { c.strokeStyle = '#38687a'; c.beginPath(); c.moveTo(0, 37); c.lineTo(17, 37); c.lineTo(24, 30); c.lineTo(48, 30); c.stroke(); }
  } else {
    // Irregular floating rock, with space visible through the seams instead of square paving.
    c.fillStyle = '#0e1029'; c.fillRect(0, 0, T, T);
    ellipse(c, 7 + v * 9, 6, 1, 1, 0xcbb9ff, 0.65);
    polygon(c, [[3, 5], [19, 1], [42, 4], [47, 20], [44, 41], [28, 47], [7, 44], [1, 28]], 0x231c3b);
    polygon(c, [[4, 4], [19, 0], [42, 3], [46, 19], [43, 37], [27, 42], [7, 39], [2, 25]], v % 2 ? 0x41365e : 0x493d68);
    c.strokeStyle = css(0xb2a2d3, 0.13); c.lineWidth = 1; c.beginPath(); c.moveTo(10, 7); c.lineTo(29, 10); c.lineTo(33, 24); c.lineTo(22, 36); c.stroke();
    if (v >= 2) { c.strokeStyle = css(0x9ce9f0, 0.3); c.beginPath(); c.arc(24, 23, 8, 0.3, 4.7); c.stroke(); }
  }
}

function wall(c: Context, theme: Biome, v: number, rng: Rng): void {
  ellipse(c, 25, 39, 23, 8, 0x000000, 0.35);
  if (theme === 'ocean') {
    polygon(c, [[3, 23], [8, 11], [22, 4], [39, 12], [46, 27], [40, 41], [13, 44]], 0x1c4953);
    polygon(c, [[4, 21], [10, 9], [24, 3], [39, 10], [45, 25], [36, 35], [13, 36]], 0x557e76);
    speckle(c, rng, T, T, 24, [0x95b3a0, 0x103d49], 0.25);
    coral(c, 19, 32, v % 2 ? 0xd9ae89 : 0xd47f91, 0.9);
    c.strokeStyle = '#296959'; c.lineWidth = 3; c.beginPath(); c.moveTo(37, 36); c.bezierCurveTo(28, 24, 46, 18, 36, 5); c.stroke();
    ellipse(c, 10, 30, 3, 2, 0xe7c2a0); ellipse(c, 34, 31, 3, 2, 0xa6cbaa);
  } else if (theme === 'desert') {
    // A broken sandstone column, round capital and carved face.
    c.fillStyle = '#79563b'; roundRect(c, 6, 12, 36, 31, 4); c.fill();
    c.fillStyle = '#bd915b'; roundRect(c, 8, 8, 32, 30, 4); c.fill();
    const g = c.createLinearGradient(8, 0, 40, 0); g.addColorStop(0, '#edcb91'); g.addColorStop(0.5, '#cca26d'); g.addColorStop(1, '#9e744b'); c.fillStyle = g; c.fillRect(12, 11, 24, 26);
    c.strokeStyle = '#9a7149'; c.lineWidth = 2; for (const x of [16, 23, 30]) { c.beginPath(); c.moveTo(x, 12); c.lineTo(x, 34); c.stroke(); }
    ellipse(c, 24, 9, 19, 6, 0xe8c68b); ellipse(c, 24, 7, 15, 4, 0xf1d29a);
    c.strokeStyle = '#88603f'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(31, 6); c.lineTo(26, 16); c.lineTo(30, 21); c.lineTo(24, 30); c.stroke();
    if (v === 1) { c.fillStyle = '#618273'; c.fillRect(7, 30, 5, 5); }
  } else if (theme === 'electric') {
    c.fillStyle = '#101b2a'; roundRect(c, 2, 5, 44, 40, 5); c.fill();
    const g = c.createLinearGradient(0, 2, 46, 40); g.addColorStop(0, '#70838b'); g.addColorStop(0.5, '#344b5c'); g.addColorStop(1, '#172d3f'); c.fillStyle = g; roundRect(c, 3, 2, 42, 36, 4); c.fill();
    if (v % 2 === 0) {
      ellipse(c, 24, 20, 14, 14, 0x111d29); ellipse(c, 24, 20, 11, 11, 0x405768);
      c.save(); c.translate(24, 20); c.rotate(v * 0.7); for (let i = 0; i < 4; i++) { c.rotate(Math.PI / 2); polygon(c, [[1, 1], [11, 3], [8, 10], [2, 6]], 0x8b9b9b); } c.restore();
      ellipse(c, 24, 20, 3, 3, 0x172b38);
    } else {
      c.fillStyle = '#101d29'; c.fillRect(10, 8, 28, 19); c.fillStyle = '#50e9d7'; c.fillRect(13, 12, 15, 2); c.fillRect(13, 18, 21, 2);
      c.fillStyle = '#aeb9ad'; c.fillRect(11, 30, 24, 3);
    }
    c.strokeStyle = '#d4a956'; c.lineWidth = 3; c.beginPath(); c.moveTo(5, 35); c.lineTo(15, 35); c.stroke();
    glow(c, 37, 33, 5, 0x65f9df, 0.6); ellipse(c, 37, 33, 1.5, 1.5, 0xc5fff1);
  } else {
    c.fillStyle = '#0c0d22'; c.fillRect(0, 0, T, T);
    polygon(c, [[3, 24], [12, 9], [28, 3], [43, 13], [46, 29], [31, 45], [10, 39]], 0x241b3c);
    polygon(c, [[5, 19], [14, 6], [28, 1], [42, 10], [41, 27], [27, 37], [9, 32]], 0x68567f);
    polygon(c, [[13, 25], [18, 5], [26, 15], [24, 30]], 0xb194da);
    polygon(c, [[26, 27], [34, 9], [39, 22], [33, 32]], 0x6fbecb);
    c.strokeStyle = css(0xe2c3ff, 0.7); c.lineWidth = 1; c.beginPath(); c.moveTo(18, 6); c.lineTo(24, 27); c.stroke();
    glow(c, 24, 25, 12, 0xc095ff, 0.22);
  }
}

function block(c: Context, theme: Biome, v: number, rng: Rng): void {
  ellipse(c, 24, 39, 18, 6, 0x000000, 0.35);
  if (theme === 'ocean') {
    coral(c, 21, 40, v ? 0xeab488 : 0xe48eaa, 1.6);
    ellipse(c, 31, 32, 11, 6, 0xc6be94); c.strokeStyle = '#806c69'; c.lineWidth = 1;
    for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(31, 35); c.lineTo(31 + i * 4, 27); c.stroke(); }
    coral(c, 36, 39, 0x61b7a4, 0.65);
  } else if (theme === 'desert') {
    // Destructible terracotta amphora, not a recolored crate.
    c.fillStyle = '#7b4f34'; c.lineWidth = 3; c.strokeStyle = '#8b5f3a';
    c.beginPath(); c.ellipse(24, 25, 13, 16, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#bd8153'; c.beginPath(); c.ellipse(23, 23, 11, 15, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#a46b43'; c.beginPath(); c.ellipse(10, 20, 5, 8, 0, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.ellipse(37, 20, 5, 8, 0, 0, Math.PI * 2); c.stroke();
    ellipse(c, 24, 8, 8, 3, 0xe2b37c); ellipse(c, 24, 8, 5, 1.5, 0x3f3026);
    c.strokeStyle = '#e7c68c'; c.lineWidth = 2; c.beginPath(); c.moveTo(14, 24); c.lineTo(34, 24); c.stroke();
    if (v) { c.strokeStyle = '#5f4032'; c.lineWidth = 1; c.beginPath(); c.moveTo(29, 10); c.lineTo(25, 20); c.lineTo(28, 28); c.stroke(); }
  } else if (theme === 'electric') {
    c.fillStyle = '#152631'; roundRect(c, 7, 9, 34, 32, 5); c.fill();
    c.fillStyle = '#6b7c83'; roundRect(c, 7, 4, 34, 29, 4); c.fill();
    c.fillStyle = '#172e3d'; c.fillRect(11, 8, 26, 20);
    for (const x of [16, 24, 32]) { c.fillStyle = v ? '#efc56b' : '#60e2db'; roundRect(c, x - 2, 11, 4, 13, 2); c.fill(); }
    c.fillStyle = '#dfb15b'; c.fillRect(10, 33, 9, 4); c.fillStyle = '#172330'; c.fillRect(14, 33, 3, 4);
  } else {
    polygon(c, [[9, 18], [22, 6], [37, 11], [42, 27], [27, 39], [11, 33]], 0x463554);
    polygon(c, [[9, 18], [22, 6], [37, 11], [28, 26]], 0x9072a8);
    polygon(c, [[28, 26], [37, 11], [42, 27], [27, 39]], 0x645078);
    c.strokeStyle = '#b9f1f4'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(22, 10); c.lineTo(26, 19); c.lineTo(20, 26); c.lineTo(26, 34); c.stroke();
    c.strokeStyle = css(0xd4a4f6, 0.6); c.beginPath(); c.ellipse(24, 24, 22, 8, -0.3, 0, Math.PI * 2); c.stroke();
  }
  void rng;
}

function hazard(c: Context, theme: Biome, frame: number, kind: string, rng: Rng): void {
  floor(c, theme, 0, rng);
  const p = THEME_COLORS[theme];
  const active = frame === 3;
  const warning = frame === 1 || frame === 2;
  const color = warning ? 0xffd24a : active ? p.hazard : p.accent;
  if (theme === 'ocean') {
    // Anemone / jellyfish bed; calm tentacles become a glowing electric crown.
    ellipse(c, 24, 29, 18, 11, 0x092c45, 0.8);
    for (let i = 0; i < 7; i++) {
      c.strokeStyle = css(color, active ? 0.9 : 0.4); c.lineWidth = active ? 2.5 : 1.5;
      const x = 9 + i * 5; c.beginPath(); c.moveTo(x, 36); c.bezierCurveTo(x - 5, 28, x + 5, 21, x, active ? 8 : 20); c.stroke();
    }
    ellipse(c, 24, 25, active ? 14 : 9, active ? 10 : 6, color, active ? 0.6 : 0.3);
  } else if (theme === 'desert') {
    ellipse(c, 24, 24, 18, 13, 0x533d2e, 0.8);
    for (let i = 0; i < 5; i++) {
      c.strokeStyle = css(color, active ? 0.9 : 0.3); c.lineWidth = 2;
      c.beginPath(); c.moveTo(11 + i * 6, 34); c.quadraticCurveTo(8 + i * 5, 20, 16 + i * 5, active ? 3 : 22); c.stroke();
    }
    if (active) speckle(c, rng, T, T, 36, [0xffdb9f, 0xeac17b], 0.7);
  } else if (theme === 'electric') {
    c.fillStyle = '#0b1525'; c.fillRect(3, 7, 42, 33);
    for (const x of [6, 41]) { c.fillStyle = '#879da6'; c.fillRect(x - 2, 10, 4, 26); }
    c.strokeStyle = css(color, active ? 1 : 0.25); c.lineWidth = active ? 3 : 1;
    c.beginPath(); c.moveTo(6, 24); for (let x = 10; x < 41; x += 5) c.lineTo(x, 24 + (active ? (x % 2 ? 7 : -7) : 0)); c.lineTo(41, 24); c.stroke();
  } else {
    ellipse(c, 24, 24, 19, 17, 0x090a23, 0.9);
    c.strokeStyle = css(color, active ? 0.95 : 0.45); c.lineWidth = active ? 3 : 1.5;
    c.beginPath(); c.ellipse(24, 24, active ? 18 : 13, active ? 16 : 6, -0.4, 0, Math.PI * 2); c.stroke();
    if (active) { glow(c, 24, 24, 21, color, 0.4); polygon(c, [[24, 6], [28, 21], [23, 26], [27, 42], [19, 25]], 0xe6d3ff); }
  }
  if (warning) { c.strokeStyle = '#ffd24a'; c.lineWidth = 2; c.setLineDash([5, 4]); c.strokeRect(3, 3, 42, 42); c.setLineDash([]); }
  if (kind === 'abyss' && !active) { ellipse(c, 24, 24, 20, 17, p.bg); }
}

function device(c: Context, theme: Biome, kind: string, f: number): void {
  const p = THEME_COLORS[theme]; const on = f > 0;
  if (kind === 'gate' || kind === 'door') {
    if (theme === 'dimension' && kind === 'door') {
      c.fillStyle = '#0c1028'; c.fillRect(0, 0, T, T);
      if (f < 2) { polygon(c, [[2, 8], [43, 3], [46, 39], [5, 44]], 0x74608d); c.strokeStyle = '#acf1f5'; c.strokeRect(8, 10, 31, 27); }
      else { ellipse(c, 24, 24, 15, 6, 0x9c7cc5, 0.2); }
      return;
    }
    const open = kind === 'door' && f < 2;
    c.fillStyle = css(theme === 'desert' ? 0x745039 : 0x16343b); c.fillRect(2, 1, 7, 46); c.fillRect(39, 1, 7, 46);
    c.strokeStyle = css(open ? p.accent : p.hazard, open ? 0.3 : 0.85); c.lineWidth = theme === 'electric' ? 2 : 4;
    for (let x = 12; x <= 36; x += 6) { c.beginPath(); c.moveTo(x, open ? 2 : 5); c.lineTo(x, open ? 8 : 43); c.stroke(); }
    if (kind === 'gate') { c.fillStyle = css(p.accent); roundRect(c, 18, 18, 12, 12, 2); c.fill(); c.fillStyle = '#152a31'; c.fillRect(23, 21, 2, 6); }
    return;
  }
  if (kind === 'exit') {
    ellipse(c, 24, 31, 20, 10, 0x000000, 0.4);
    c.strokeStyle = css(p.accent, on ? 1 : 0.4); c.lineWidth = 5; c.beginPath(); c.ellipse(24, 23, 14, 21, 0, 0, Math.PI * 2); c.stroke();
    if (on) { glow(c, 24, 23, 24, p.accent, 0.35); c.fillStyle = css(p.accent, 0.18); c.fillRect(14, 9, 20, 28); }
    return;
  }
  ellipse(c, 24, 37, 17, 6, 0x000000, 0.35);
  if (theme === 'ocean') {
    coral(c, 24, 39, on ? 0xa4f7d9 : 0xb085b4, 1.4);
    ellipse(c, 24, 18, 9, 10, on ? 0xe1fff3 : 0xb3c8ae); glow(c, 24, 18, 18, p.accent, on ? 0.5 : 0.15);
  } else if (theme === 'desert') {
    polygon(c, [[15, 38], [15, 14], [24, 4], [33, 14], [33, 38]], 0xd9b17a);
    polygon(c, [[24, 4], [33, 14], [33, 38], [24, 34]], 0x976d4c);
    c.strokeStyle = css(on ? 0xb8ffed : 0x5a4938); c.lineWidth = 2; c.beginPath(); c.arc(23, 21, 5, 0, Math.PI * 2); c.stroke();
    if (on) glow(c, 23, 21, 20, p.accent, 0.4);
  } else if (theme === 'electric') {
    c.fillStyle = '#607785'; roundRect(c, 10, 5, 28, 35, 5); c.fill(); c.fillStyle = '#102437'; c.fillRect(14, 9, 20, 23);
    for (let y = 13; y < 30; y += 6) { c.fillStyle = css(on ? 0x94ffe2 : 0x41747e); c.fillRect(17, y, 14, 3); }
    if (on) glow(c, 24, 22, 20, p.accent, 0.35);
  } else {
    polygon(c, [[24, 3], [36, 20], [24, 36], [12, 20]], on ? 0xbdf2f3 : 0xc3a2e4);
    polygon(c, [[24, 3], [36, 20], [24, 36]], 0x77609b);
    c.strokeStyle = css(p.accent, 0.7); c.beginPath(); c.ellipse(24, 25, 20, 7, -0.4, 0, Math.PI * 2); c.stroke();
    glow(c, 24, 21, 20, p.accent, 0.25);
  }
}

export function buildBiomeTextures(scene: Phaser.Scene): void {
  for (const theme of BIOMES) {
    for (let v = 0; v < 4; v++) {
      makeSheet(scene, TEX.floor(theme, v), T, T, 1, (c, _f, _w, _h, r) => floor(c, theme, v, r), 1200 + v);
      makeSheet(scene, TEX.biome(theme, 'wall', v), T, T, 1, (c, _f, _w, _h, r) => wall(c, theme, v, r), 1210 + v);
    }
    // Wall alias used by secrets; all silhouettes obey their collision tile.
    makeSheet(scene, TEX.wall(theme), T, T, 1, (c, _f, _w, _h, r) => wall(c, theme, 0, r), 1210);
    for (let v = 0; v < 2; v++) makeSheet(scene, TEX.block(theme, v), T, T, 1, (c, _f, _w, _h, r) => block(c, theme, v, r), 1230 + v);
    makeSheet(scene, TEX.rubble(theme), T, T, 1, (c, _f, _w, _h, r) => {
      for (let i = 0; i < 9; i++) { const x = r.float(7, 39), y = r.float(12, 40); polygon(c, [[x, y], [x + 5, y - 3], [x + 7, y + 3]], THEME_COLORS[theme].blockSide); }
    }, 1240);
    for (const kind of ['hazard', 'abyss']) makeSheet(scene, TEX.biome(theme, kind), T, T, 4, (c, f, _w, _h, r) => hazard(c, theme, f, kind, r), 1260);
    makeSheet(scene, TEX.biome(theme, 'plate'), T, T, 4, (c, f, _w, _h, r) => {
      floor(c, theme, 0, r);
      ellipse(c, 24, 25, 17, 15, THEME_COLORS[theme].wallSide);
      c.strokeStyle = css(f ? 0xa6ffcc : 0xebcf8c); c.lineWidth = 2;
      c.beginPath(); c.arc(24, 24, 11, 0, Math.PI * 2); c.stroke();
      polygon(c, [[24, 16], [30, 28], [18, 28]], f ? 0x91e8be : 0xc1ad7c);
    }, 1265);
    for (const kind of ['door', 'gate', 'prop', 'exit']) makeSheet(scene, TEX.biome(theme, kind), T, T, 4, (c, f) => device(c, theme, kind, f), 1270);
    makeSheet(scene, TEX.biome(theme, 'crystal'), T, T, 1, (c, _f, _w, _h, r) => wall(c, theme, 2, r), 1280);
  }
}
