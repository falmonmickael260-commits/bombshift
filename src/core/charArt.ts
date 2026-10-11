import type Phaser from 'phaser';
import { TEX, TILE } from './constants';
import { css, glow, makeSheet, mix, roundRect, shade, speckle } from './paint';
import type { Rng } from './rng';
import type { BombType, EnemyKind, PowerUpKind } from './types';

const T = TILE;

/** Index des frames du heros. */
export const PLAYER_FRAMES = {
  downStart: 0,
  upStart: 4,
  sideStart: 8,
  hurt: 12,
  victory: 13,
  defeat: 14,
  count: 15,
} as const;

interface Palette {
  main: number;
  dark: number;
  light: number;
  accent: number;
  eye: number;
}

function shadow(ctx: CanvasRenderingContext2D, cx: number, y: number, rx: number): void {
  ctx.fillStyle = css(0x000000, 0.38);
  ctx.beginPath();
  ctx.ellipse(cx, y, rx, rx * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
}

/* ------------------------------------------------------------------ heros */

/**
 * Heros "bombardier" : casque a visiere, echarpe, bottes.
 * dir: 0 = face, 1 = dos, 2 = profil droit.
 */
function drawHero(
  ctx: CanvasRenderingContext2D,
  dir: 0 | 1 | 2,
  step: number,
  state: 'walk' | 'hurt' | 'victory' | 'defeat',
): void {
  const pal: Palette = {
    main: 0xf2762e,
    dark: 0x9c3f12,
    light: 0xffc06a,
    accent: 0x2b3340,
    eye: 0x7df0ff,
  };
  const bob = state === 'walk' ? Math.sin((step / 4) * Math.PI * 2) * 1.6 : 0;
  const legSwing = state === 'walk' ? Math.sin((step / 4) * Math.PI * 2) * 4 : 0;
  const cx = T / 2;
  const groundY = T - 5;

  ctx.clearRect(0, 0, T, T);
  shadow(ctx, cx, groundY, 13);

  if (state === 'defeat') {
    // Au sol : silhouette couchee, lisible instantanement.
    ctx.save();
    ctx.translate(cx, T - 16);
    ctx.rotate(Math.PI / 2);
    drawHeroBody(ctx, 0, 0, 0, pal, 0);
    ctx.restore();
    ctx.fillStyle = css(0x6f7684, 0.9);
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(cx + 10 + i * 5, 14 - i * 4, 2.6 - i * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  const lift = state === 'victory' ? -4 : 0;
  // Jambes.
  for (const s of [-1, 1]) {
    const lx = cx + s * 6;
    const off = s > 0 ? legSwing : -legSwing;
    ctx.fillStyle = css(pal.accent);
    roundRect(ctx, lx - 4.5, groundY - 13 + lift + off * 0.2, 9, 11, 4);
    ctx.fill();
    ctx.fillStyle = css(shade(pal.accent, 0.3));
    roundRect(ctx, lx - 5, groundY - 5 + lift + off * 0.2, 10, 5, 2.5);
    ctx.fill();
  }

  drawHeroBody(ctx, cx, groundY - 14 + bob + lift, dir, pal, step);

  if (state === 'hurt') {
    ctx.fillStyle = css(0xff4a4a, 0.45);
    ctx.fillRect(0, 0, T, T);
  }
  if (state === 'victory') {
    ctx.strokeStyle = css(0xffe08a, 0.9);
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 15, 16 + Math.sin(a) * 15);
      ctx.lineTo(cx + Math.cos(a) * 20, 16 + Math.sin(a) * 20);
      ctx.stroke();
    }
  }
}

function drawHeroBody(
  ctx: CanvasRenderingContext2D,
  cx: number,
  bodyBottom: number,
  dir: 0 | 1 | 2,
  pal: Palette,
  step: number,
): void {
  // Echarpe arriere (flotte a l'oppose du mouvement).
  const flutter = Math.sin((step / 4) * Math.PI * 2) * 3;
  ctx.fillStyle = css(0xe8ecf2, 0.95);
  ctx.beginPath();
  if (dir === 2) {
    ctx.moveTo(cx - 4, bodyBottom - 14);
    ctx.quadraticCurveTo(cx - 16, bodyBottom - 12 + flutter, cx - 13, bodyBottom - 4 + flutter);
    ctx.quadraticCurveTo(cx - 8, bodyBottom - 10, cx - 3, bodyBottom - 10);
  } else {
    ctx.moveTo(cx - 8, bodyBottom - 15);
    ctx.quadraticCurveTo(cx, bodyBottom - 11 + flutter, cx + 8, bodyBottom - 15);
    ctx.quadraticCurveTo(cx, bodyBottom - 8, cx - 8, bodyBottom - 15);
  }
  ctx.closePath();
  ctx.fill();

  // Torse.
  const g = ctx.createLinearGradient(cx - 11, bodyBottom - 18, cx + 11, bodyBottom);
  g.addColorStop(0, css(pal.light));
  g.addColorStop(0.5, css(pal.main));
  g.addColorStop(1, css(pal.dark));
  ctx.fillStyle = g;
  roundRect(ctx, cx - 11, bodyBottom - 17, 22, 18, 7);
  ctx.fill();
  ctx.strokeStyle = css(0x000000, 0.3);
  ctx.lineWidth = 1.4;
  roundRect(ctx, cx - 11, bodyBottom - 17, 22, 18, 7);
  ctx.stroke();

  // Plastron / sac a dos selon l'orientation.
  if (dir === 1) {
    ctx.fillStyle = css(pal.accent);
    roundRect(ctx, cx - 8, bodyBottom - 14, 16, 13, 4);
    ctx.fill();
    ctx.fillStyle = css(shade(pal.accent, 0.35));
    roundRect(ctx, cx - 5, bodyBottom - 11, 10, 4, 2);
    ctx.fill();
  } else {
    ctx.fillStyle = css(pal.accent, 0.95);
    roundRect(ctx, cx - 7, bodyBottom - 12, 14, 9, 3);
    ctx.fill();
    ctx.fillStyle = css(pal.eye, 0.9);
    ctx.beginPath();
    ctx.arc(cx, bodyBottom - 7.5, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bras.
  const armSwing = Math.sin((step / 4) * Math.PI * 2) * 3;
  ctx.fillStyle = css(shade(pal.main, -0.12));
  for (const s of [-1, 1]) {
    const ax = cx + s * 12;
    const ay = bodyBottom - 13 + (s > 0 ? armSwing : -armSwing) * 0.5;
    roundRect(ctx, ax - 3.5, ay, 7, 11, 3.5);
    ctx.fill();
  }

  // Tete + casque.
  const headY = bodyBottom - 24;
  ctx.fillStyle = css(0xf6d2ac);
  ctx.beginPath();
  ctx.arc(cx, headY, 9, 0, Math.PI * 2);
  ctx.fill();

  const hg = ctx.createLinearGradient(cx - 10, headY - 10, cx + 10, headY + 4);
  hg.addColorStop(0, css(shade(pal.accent, 0.45)));
  hg.addColorStop(1, css(pal.accent));
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.arc(cx, headY, 10, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(cx - 10, headY - 1, 20, 3);
  ctx.strokeStyle = css(0x000000, 0.35);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(cx, headY, 10, Math.PI, Math.PI * 2);
  ctx.stroke();

  // Visiere lumineuse.
  if (dir === 0) {
    ctx.fillStyle = css(pal.eye, 0.95);
    roundRect(ctx, cx - 6.5, headY - 1, 13, 5, 2.5);
    ctx.fill();
    glow(ctx, cx, headY + 1.5, 9, pal.eye, 0.4);
  } else if (dir === 2) {
    ctx.fillStyle = css(pal.eye, 0.95);
    roundRect(ctx, cx + 1, headY - 1, 8, 5, 2.5);
    ctx.fill();
    glow(ctx, cx + 5, headY + 1.5, 8, pal.eye, 0.4);
  } else {
    ctx.fillStyle = css(shade(pal.accent, -0.25));
    roundRect(ctx, cx - 7, headY - 1, 14, 5, 2.5);
    ctx.fill();
  }

  // Crete / meche d'allumage.
  ctx.strokeStyle = css(pal.main);
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(cx, headY - 10);
  ctx.quadraticCurveTo(cx + 5, headY - 16, cx + 2, headY - 19);
  ctx.stroke();
  glow(ctx, cx + 2, headY - 19, 5, 0xffd27a, 0.8);
}

/* --------------------------------------------------------------- ennemis */

const ENEMY_PALETTES: Record<EnemyKind, Palette> = {
  patroller: { main: 0x8c5bd6, dark: 0x4a2a7a, light: 0xc39cf2, accent: 0x2a1840, eye: 0xffe066 },
  chaser: { main: 0xd63b4a, dark: 0x7a1822, light: 0xff8a90, accent: 0x3a0e14, eye: 0xfff066 },
  flanker: { main: 0x3fb8c9, dark: 0x1a5f6b, light: 0x9af0fa, accent: 0x0e3038, eye: 0xffffff },
  coward: { main: 0xe0c04a, dark: 0x8a6a12, light: 0xfff0a0, accent: 0x3a2e08, eye: 0x2a2a2a },
  heavy: { main: 0x7d8694, dark: 0x3c434d, light: 0xc2cad6, accent: 0x20252b, eye: 0xff6a3b },
  guardian: { main: 0x4a9c63, dark: 0x1f4a30, light: 0x9ce0ad, accent: 0x12241a, eye: 0xf2e08a },
};

function drawEnemy(
  ctx: CanvasRenderingContext2D,
  kind: EnemyKind,
  frame: number,
  rng: Rng,
): void {
  const pal = ENEMY_PALETTES[kind];
  const hurt = frame === 4;
  const step = frame % 4;
  const bob = Math.sin((step / 4) * Math.PI * 2);
  const cx = T / 2;
  const base = T - 6;
  ctx.clearRect(0, 0, T, T);
  shadow(ctx, cx, base, kind === 'heavy' ? 15 : 12);

  const body = (y: number, rx: number, ry: number): void => {
    const g = ctx.createRadialGradient(cx - rx * 0.3, y - ry * 0.4, 1, cx, y, rx * 1.3);
    g.addColorStop(0, css(pal.light));
    g.addColorStop(0.55, css(pal.main));
    g.addColorStop(1, css(pal.dark));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = css(0x000000, 0.32);
    ctx.lineWidth = 1.4;
    ctx.stroke();
  };

  const eye = (x: number, y: number, r: number): void => {
    ctx.fillStyle = css(0x120c18, 0.9);
    ctx.beginPath();
    ctx.arc(x, y, r + 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = css(pal.eye);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = css(0xffffff, 0.85);
    ctx.beginPath();
    ctx.arc(x - r * 0.3, y - r * 0.35, r * 0.4, 0, Math.PI * 2);
    ctx.fill();
    glow(ctx, x, y, r * 3, pal.eye, 0.25);
  };

  switch (kind) {
    case 'patroller': {
      // Masse rebondissante a pointes : avance en patrouille reguliere.
      const y = base - 13 - bob * 1.5;
      for (const s of [-1, 1]) {
        ctx.fillStyle = css(pal.dark);
        roundRect(ctx, cx + s * 7 - 4, base - 7, 8, 7, 3);
        ctx.fill();
      }
      body(y, 13, 12);
      ctx.fillStyle = css(pal.dark);
      for (let i = 0; i < 5; i++) {
        const a = Math.PI + (i / 4) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 11, y + Math.sin(a) * 10);
        ctx.lineTo(cx + Math.cos(a - 0.14) * 17, y + Math.sin(a - 0.14) * 16);
        ctx.lineTo(cx + Math.cos(a + 0.14) * 11, y + Math.sin(a + 0.14) * 10);
        ctx.closePath();
        ctx.fill();
      }
      eye(cx, y, 4.6);
      break;
    }
    case 'chaser': {
      // Arachnide bas et rapide : lecture immediate du danger de poursuite.
      const y = base - 11;
      ctx.strokeStyle = css(pal.dark);
      ctx.lineWidth = 2.6;
      for (let i = 0; i < 3; i++) {
        for (const s of [-1, 1]) {
          const ox = cx + s * (6 + i * 3);
          const legPhase = Math.sin((step / 4) * Math.PI * 2 + i) * 3 * s;
          ctx.beginPath();
          ctx.moveTo(ox, y + 2);
          ctx.lineTo(ox + s * 8, y - 3 + legPhase);
          ctx.lineTo(ox + s * 11, base - 1);
          ctx.stroke();
        }
      }
      body(y, 14, 9);
      ctx.fillStyle = css(pal.dark, 0.6);
      ctx.beginPath();
      ctx.ellipse(cx + 2, y - 2, 8, 5, 0.4, 0, Math.PI * 2);
      ctx.fill();
      eye(cx - 5, y - 1, 2.6);
      eye(cx + 1, y - 3, 3.1);
      eye(cx + 6, y - 1, 2.4);
      break;
    }
    case 'flanker': {
      // Spectre flottant : silhouette effilee, se deplace pour encercler.
      const y = base - 18 - bob * 2.5;
      ctx.fillStyle = css(pal.main, 0.3);
      ctx.beginPath();
      ctx.moveTo(cx - 11, y + 4);
      for (let i = 0; i <= 6; i++) {
        const px = cx - 11 + (22 / 6) * i;
        const py = base + Math.sin(i * 1.3 + step) * 2.5;
        ctx.lineTo(px, py);
      }
      ctx.lineTo(cx + 11, y + 4);
      ctx.closePath();
      ctx.fill();
      body(y, 11, 13);
      ctx.fillStyle = css(pal.dark, 0.75);
      ctx.beginPath();
      ctx.ellipse(cx, y + 1, 8, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      eye(cx - 3.6, y - 1, 2.4);
      eye(cx + 3.6, y - 1, 2.4);
      break;
    }
    case 'coward': {
      // Petit fuyard : grands yeux, antennes, lit les explosions a venir.
      const y = base - 10 - Math.abs(bob) * 3;
      ctx.strokeStyle = css(pal.dark);
      ctx.lineWidth = 1.8;
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(cx + s * 3, y - 7);
        ctx.quadraticCurveTo(cx + s * 8, y - 15, cx + s * 5, y - 19);
        ctx.stroke();
        ctx.fillStyle = css(pal.light);
        ctx.beginPath();
        ctx.arc(cx + s * 5, y - 19, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      body(y, 10, 9);
      eye(cx - 3.4, y - 1, 3.4);
      eye(cx + 3.4, y - 1, 3.4);
      break;
    }
    case 'heavy': {
      // Colosse blinde : large, lent, demande plusieurs explosions.
      const y = base - 15;
      for (const s of [-1, 1]) {
        ctx.fillStyle = css(pal.dark);
        roundRect(ctx, cx + s * 9 - 5, base - 9, 10, 9, 3);
        ctx.fill();
      }
      body(y, 16, 13);
      ctx.fillStyle = css(shade(pal.main, 0.3));
      for (const s of [-1, 1]) {
        roundRect(ctx, cx + s * 12 - 5, y - 9, 10, 9, 4);
        ctx.fill();
      }
      ctx.strokeStyle = css(pal.dark);
      ctx.lineWidth = 2;
      roundRect(ctx, cx - 10, y - 6, 20, 13, 4);
      ctx.stroke();
      ctx.fillStyle = css(0x15181c);
      roundRect(ctx, cx - 8, y - 3, 16, 5, 2.5);
      ctx.fill();
      ctx.fillStyle = css(pal.eye);
      roundRect(ctx, cx - 7, y - 2, 14, 3, 1.5);
      ctx.fill();
      glow(ctx, cx, y, 14, pal.eye, 0.35);
      break;
    }
    case 'guardian': {
      // Sentinelle : statue gardienne d'objectif, bouclier orbital.
      const y = base - 16;
      ctx.fillStyle = css(pal.dark);
      roundRect(ctx, cx - 9, base - 10, 18, 10, 3);
      ctx.fill();
      body(y, 12, 15);
      ctx.strokeStyle = css(pal.light, 0.9);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 8, y + 6);
      ctx.lineTo(cx + 8, y + 6);
      ctx.stroke();
      eye(cx, y - 3, 4.2);
      // Bouclier tournant.
      const a = (step / 4) * Math.PI * 2;
      ctx.strokeStyle = css(pal.eye, 0.85);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, y, 17, a, a + 1.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, y, 17, a + Math.PI, a + Math.PI + 1.5);
      ctx.stroke();
      break;
    }
  }

  if (hurt) {
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = css(0xffffff, 0.75);
    ctx.fillRect(0, 0, T, T);
    ctx.globalCompositeOperation = 'source-over';
  }
  speckle(ctx, rng, T, T, 4, [pal.light], 0.12, 1.2);
}

/* ------------------------------------------------------------------ boss */

function drawMagmaron(ctx: CanvasRenderingContext2D, frame: number, rng: Rng, size: number): void {
  // 0 idle | 1 charge d'attaque | 2 attaque | 3 touche
  const cx = size / 2;
  const base = size - 10;
  const windup = frame === 1;
  const attack = frame === 2;
  const hurt = frame === 3;
  ctx.clearRect(0, 0, size, size);
  shadow(ctx, cx, base, size * 0.34);

  const bodyY = base - size * 0.3;
  const rx = size * 0.3 * (attack ? 1.08 : 1);
  const ry = size * 0.26 * (windup ? 0.92 : 1);

  // Jambes trapues.
  for (const s of [-1, 1]) {
    ctx.fillStyle = css(0x2a1410);
    roundRect(ctx, cx + s * size * 0.15 - size * 0.08, base - size * 0.17, size * 0.16, size * 0.18, 8);
    ctx.fill();
  }

  // Corps de roche en fusion.
  const g = ctx.createRadialGradient(cx - rx * 0.3, bodyY - ry * 0.4, 2, cx, bodyY, rx * 1.4);
  g.addColorStop(0, css(0x6b3326));
  g.addColorStop(0.5, css(0x3a1b16));
  g.addColorStop(1, css(0x1a0b09));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(cx, bodyY, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  // Veines de lave : brillent plus fort pendant la charge.
  const veinAlpha = hurt ? 0.4 : windup ? 1 : attack ? 1 : 0.7;
  ctx.strokeStyle = css(attack ? 0xffe08a : 0xff5a12, veinAlpha);
  ctx.lineWidth = size * 0.022;
  for (let i = 0; i < 7; i++) {
    const a = rng.float(0, Math.PI * 2);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * rx * 0.2, bodyY + Math.sin(a) * ry * 0.2);
    let px = cx + Math.cos(a) * rx * 0.2;
    let py = bodyY + Math.sin(a) * ry * 0.2;
    let ang = a;
    for (let k = 0; k < 4; k++) {
      ang += rng.float(-0.5, 0.5);
      px += Math.cos(ang) * rx * 0.22;
      py += Math.sin(ang) * ry * 0.22;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  if (windup || attack) glow(ctx, cx, bodyY, rx * 1.5, 0xff7a2f, attack ? 0.55 : 0.35);

  // Epaules / plaques.
  for (const s of [-1, 1]) {
    ctx.fillStyle = css(0x4a251c);
    ctx.beginPath();
    ctx.ellipse(cx + s * rx * 0.86, bodyY - ry * 0.45, size * 0.1, size * 0.085, s * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = css(0xff7a2f, 0.5);
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Bras : leves en charge, projetes en attaque.
  for (const s of [-1, 1]) {
    const ax = cx + s * rx * 0.95;
    const ay = windup ? bodyY - ry * 0.9 : attack ? bodyY - ry * 0.1 : bodyY + ry * 0.1;
    ctx.fillStyle = css(0x331812);
    roundRect(ctx, ax - size * 0.055, ay, size * 0.11, size * 0.2, size * 0.05);
    ctx.fill();
    ctx.fillStyle = css(0xff5a12, windup ? 0.8 : 0.45);
    roundRect(ctx, ax - size * 0.04, ay + size * 0.13, size * 0.08, size * 0.05, 4);
    ctx.fill();
  }

  // Tete : casque de magma fendu, yeux ardents.
  const headY = bodyY - ry - size * 0.07;
  ctx.fillStyle = css(0x2e1512);
  ctx.beginPath();
  ctx.ellipse(cx, headY, size * 0.13, size * 0.11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = css(0xffb347, 0.6);
  ctx.lineWidth = 2;
  ctx.stroke();
  for (const s of [-1, 1]) {
    const ex = cx + s * size * 0.052;
    ctx.fillStyle = css(hurt ? 0xffffff : 0xffd27a);
    ctx.beginPath();
    ctx.ellipse(ex, headY, size * 0.022, size * 0.015, 0, 0, Math.PI * 2);
    ctx.fill();
    glow(ctx, ex, headY, size * 0.06, 0xff7a2f, 0.7);
  }
  // Cornes.
  ctx.fillStyle = css(0x120807);
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + s * size * 0.1, headY - size * 0.06);
    ctx.lineTo(cx + s * size * 0.17, headY - size * 0.17);
    ctx.lineTo(cx + s * size * 0.06, headY - size * 0.1);
    ctx.closePath();
    ctx.fill();
  }

  if (hurt) {
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = css(0xffffff, 0.6);
    ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = 'source-over';
  }
}

function drawCryon(ctx: CanvasRenderingContext2D, frame: number, rng: Rng, size: number): void {
  const cx = size / 2;
  const cy = size * 0.46;
  const windup = frame === 1;
  const attack = frame === 2;
  const hurt = frame === 3;
  ctx.clearRect(0, 0, size, size);
  shadow(ctx, cx, size - 12, size * 0.26);

  // Eclats orbitaux.
  const spin = (frame / 4) * Math.PI * 2;
  for (let i = 0; i < 6; i++) {
    const a = spin + (i / 6) * Math.PI * 2;
    const d = size * (attack ? 0.42 : windup ? 0.3 : 0.36);
    const px = cx + Math.cos(a) * d;
    const py = cy + Math.sin(a) * d * 0.6;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(a);
    const g = ctx.createLinearGradient(-6, 0, 6, 0);
    g.addColorStop(0, css(0xd8f6ff, 0.95));
    g.addColorStop(1, css(0x3f8db0, 0.9));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.055);
    ctx.lineTo(size * 0.03, 0);
    ctx.lineTo(0, size * 0.055);
    ctx.lineTo(-size * 0.03, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Noyau cristallin.
  const r = size * 0.24 * (attack ? 1.06 : 1);
  const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, 2, cx, cy, r * 1.2);
  g.addColorStop(0, css(0xf2fdff, 0.98));
  g.addColorStop(0.45, css(0x8fd4f0, 0.95));
  g.addColorStop(1, css(0x255e80, 0.95));
  ctx.fillStyle = g;
  ctx.beginPath();
  const facets = 9;
  for (let i = 0; i <= facets; i++) {
    const a = (i / facets) * Math.PI * 2 - Math.PI / 2;
    const rr = r * (i % 2 === 0 ? 1 : 0.82);
    const px = cx + Math.cos(a) * rr;
    const py = cy + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = css(0xffffff, 0.6);
  ctx.lineWidth = 2;
  ctx.stroke();

  // Oeil central.
  ctx.fillStyle = css(0x0b2b3a, 0.9);
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.42, r * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = css(hurt ? 0xffffff : windup ? 0xffd27a : 0x9bf0ff);
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.22, r * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  glow(ctx, cx, cy, r * 1.6, windup ? 0xffd27a : 0x9bf0ff, windup ? 0.6 : 0.35);

  // Givre interne.
  ctx.strokeStyle = css(0xffffff, 0.35);
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 5; i++) {
    const a = rng.float(0, Math.PI * 2);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r * 0.4, cy + Math.sin(a) * r * 0.4);
    ctx.lineTo(cx + Math.cos(a) * r * 0.95, cy + Math.sin(a) * r * 0.95);
    ctx.stroke();
  }

  if (hurt) {
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = css(0xffffff, 0.65);
    ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = 'source-over';
  }
}

function drawGardien(ctx: CanvasRenderingContext2D, frame: number, rng: Rng, size: number): void {
  const cx = size / 2;
  const base = size - 8;
  const windup = frame === 1;
  const attack = frame === 2;
  const hurt = frame === 3;
  ctx.clearRect(0, 0, size, size);
  shadow(ctx, cx, base, size * 0.34);

  // Racines (ecartees en attaque).
  ctx.strokeStyle = css(0x3c2a18);
  ctx.lineWidth = size * 0.035;
  ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    const s = i < 3 ? -1 : 1;
    const spread = attack ? 1.5 : windup ? 0.7 : 1;
    ctx.beginPath();
    ctx.moveTo(cx + s * size * 0.08, base - size * 0.1);
    ctx.quadraticCurveTo(
      cx + s * size * 0.22 * spread,
      base - size * 0.02,
      cx + s * size * (0.3 + i * 0.03) * spread,
      base - size * 0.06,
    );
    ctx.stroke();
  }

  // Socle de pierre.
  const bodyY = base - size * 0.26;
  ctx.fillStyle = css(0x4a4a3c);
  roundRect(ctx, cx - size * 0.2, bodyY, size * 0.4, size * 0.26, size * 0.04);
  ctx.fill();
  ctx.strokeStyle = css(0x27271f);
  ctx.lineWidth = 2;
  ctx.stroke();

  // Tete d'idole.
  const headY = bodyY - size * 0.17;
  const hg = ctx.createLinearGradient(cx - size * 0.2, headY - size * 0.2, cx + size * 0.2, headY + size * 0.2);
  hg.addColorStop(0, css(0x7b7a63));
  hg.addColorStop(0.6, css(0x55543f));
  hg.addColorStop(1, css(0x32311f));
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.19, headY + size * 0.19);
  ctx.lineTo(cx - size * 0.22, headY - size * 0.1);
  ctx.lineTo(cx, headY - size * 0.22);
  ctx.lineTo(cx + size * 0.22, headY - size * 0.1);
  ctx.lineTo(cx + size * 0.19, headY + size * 0.19);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = css(0x1e1d14, 0.9);
  ctx.lineWidth = 2;
  ctx.stroke();

  // Lianes sur la pierre.
  ctx.strokeStyle = css(0x4a7a2e, 0.9);
  ctx.lineWidth = size * 0.02;
  for (let i = 0; i < 5; i++) {
    const sx = cx + rng.float(-size * 0.18, size * 0.18);
    ctx.beginPath();
    ctx.moveTo(sx, headY - size * 0.18);
    ctx.quadraticCurveTo(sx + rng.float(-8, 8), headY, sx + rng.float(-10, 10), headY + size * 0.18);
    ctx.stroke();
    ctx.fillStyle = css(0x6fae3c, 0.9);
    ctx.beginPath();
    ctx.ellipse(sx + 3, headY + rng.float(-10, 10), size * 0.03, size * 0.016, 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Yeux : vulnerables seulement quand ils brillent (phase ouverte).
  const eyeColor = hurt ? 0xffffff : windup ? 0xff6a3b : attack ? 0xf2e08a : 0x7cd44a;
  for (const s of [-1, 1]) {
    const ex = cx + s * size * 0.08;
    ctx.fillStyle = css(0x100f08);
    ctx.beginPath();
    ctx.ellipse(ex, headY, size * 0.045, size * 0.028, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = css(eyeColor);
    ctx.beginPath();
    ctx.ellipse(ex, headY, size * 0.028, size * 0.018, 0, 0, Math.PI * 2);
    ctx.fill();
    glow(ctx, ex, headY, size * 0.08, eyeColor, 0.6);
  }

  // Couronne de pierres flottantes.
  const spin = (frame / 4) * Math.PI * 2;
  for (let i = 0; i < 4; i++) {
    const a = spin + (i / 4) * Math.PI * 2;
    const px = cx + Math.cos(a) * size * 0.26;
    const py = headY - size * 0.2 + Math.sin(a) * size * 0.05;
    ctx.fillStyle = css(0x6a6a52);
    ctx.beginPath();
    ctx.ellipse(px, py, size * 0.035, size * 0.025, a, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = css(0xc9a227, 0.5);
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }

  if (hurt) {
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = css(0xffffff, 0.55);
    ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = 'source-over';
  }
}

/* ----------------------------------------------------------------- bombes */

const BOMB_STYLE: Record<BombType, { shell: number; light: number; accent: number }> = {
  classic: { shell: 0x2a2f3a, light: 0x565f72, accent: 0xff7a2f },
  pierce: { shell: 0x203a40, light: 0x3f7f8c, accent: 0x6ee7ff },
  shift: { shell: 0x32224a, light: 0x6a4a9c, accent: 0xc08cff },
  slow: { shell: 0x3a3320, light: 0x7a6a3a, accent: 0xffd24a },
};

function drawBomb(
  ctx: CanvasRenderingContext2D,
  type: BombType,
  frame: number,
  rng: Rng,
): void {
  const st = BOMB_STYLE[type];
  const cx = T / 2;
  const cy = T / 2 + 3;
  // Pulsation : plus la meche brule, plus la bombe gonfle (lecture du timing).
  const pulse = 1 + Math.sin((frame / 4) * Math.PI * 2) * 0.07;
  const r = T * 0.3 * pulse;
  ctx.clearRect(0, 0, T, T);
  shadow(ctx, cx, T - 5, r * 0.95);

  const g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, 1, cx, cy, r * 1.25);
  g.addColorStop(0, css(st.light));
  g.addColorStop(0.5, css(st.shell));
  g.addColorStop(1, css(shade(st.shell, -0.5)));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = css(0x000000, 0.4);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Reflet.
  ctx.fillStyle = css(0xffffff, 0.3);
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.33, cy - r * 0.42, r * 0.26, r * 0.17, -0.6, 0, Math.PI * 2);
  ctx.fill();

  // Details par type.
  ctx.strokeStyle = css(st.accent, 0.95);
  ctx.lineWidth = 2.2;
  if (type === 'pierce') {
    // Pointes perforantes.
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r * 0.8, cy + Math.sin(a) * r * 0.8);
      ctx.lineTo(cx + Math.cos(a) * (r + 5), cy + Math.sin(a) * (r + 5));
      ctx.stroke();
    }
  } else if (type === 'shift') {
    // Ailettes de glissement.
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx + s * r * 0.75, cy - r * 0.35);
      ctx.lineTo(cx + s * (r + 6), cy);
      ctx.lineTo(cx + s * r * 0.75, cy + r * 0.35);
      ctx.stroke();
    }
  } else if (type === 'slow') {
    // Cadran.
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    const a = (frame / 4) * Math.PI * 2 - Math.PI / 2;
    ctx.lineTo(cx + Math.cos(a) * r * 0.45, cy + Math.sin(a) * r * 0.45);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.15, r * 0.45, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
  }

  // Meche + etincelle.
  ctx.strokeStyle = css(0xbfae8a);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.25, cy - r * 0.9);
  ctx.quadraticCurveTo(cx + r * 0.8, cy - r * 1.5, cx + r * 0.35, cy - r * 1.8);
  ctx.stroke();
  const sparkR = 3.5 + (frame % 2) * 1.6;
  glow(ctx, cx + r * 0.35, cy - r * 1.8, sparkR * 3, st.accent, 0.8);
  ctx.fillStyle = css(0xffffff, 0.95);
  ctx.beginPath();
  ctx.arc(cx + r * 0.35, cy - r * 1.8, sparkR * 0.6, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = css(st.accent, rng.float(0.4, 0.9));
    ctx.beginPath();
    ctx.arc(
      cx + r * 0.35 + rng.float(-5, 5),
      cy - r * 1.8 + rng.float(-5, 2),
      rng.float(0.8, 1.8),
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

/* ----------------------------------------------------------------- bonus */

const POWER_STYLE: Record<PowerUpKind, { color: number; glyph: string }> = {
  range: { color: 0xff7a2f, glyph: 'range' },
  bomb: { color: 0x7df0ff, glyph: 'bomb' },
  speed: { color: 0xffd24a, glyph: 'speed' },
  shield: { color: 0x8fe8ff, glyph: 'shield' },
  pierce: { color: 0xc08cff, glyph: 'pierce' },
  ability: { color: 0xff5ad0, glyph: 'ability' },
  life: { color: 0xff5a7a, glyph: 'life' },
};

function drawPowerUp(ctx: CanvasRenderingContext2D, kind: PowerUpKind, frame: number): void {
  const st = POWER_STYLE[kind];
  const cx = T / 2;
  const bob = Math.sin((frame / 4) * Math.PI * 2) * 2;
  const cy = T / 2 + bob;
  ctx.clearRect(0, 0, T, T);
  shadow(ctx, cx, T - 6, 11);
  glow(ctx, cx, cy, 20, st.color, 0.5);

  // Socle hexagonal.
  const r = 15;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  g.addColorStop(0, css(mix(st.color, 0xffffff, 0.45)));
  g.addColorStop(0.6, css(st.color));
  g.addColorStop(1, css(shade(st.color, -0.45)));
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = css(0xffffff, 0.7);
  ctx.lineWidth = 1.8;
  ctx.stroke();

  ctx.fillStyle = css(0x120f18, 0.85);
  ctx.strokeStyle = css(0xffffff, 0.95);
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';

  switch (st.glyph) {
    case 'range': {
      // Croix de souffle.
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy);
      ctx.lineTo(cx + 8, cy);
      ctx.moveTo(cx, cy - 8);
      ctx.lineTo(cx, cy + 8);
      ctx.stroke();
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        ctx.beginPath();
        ctx.moveTo(cx + dx * 8, cy + dy * 8);
        ctx.lineTo(cx + dx * 8 - dy * 3 - dx * 3, cy + dy * 8 - dx * 3 - dy * 3);
        ctx.moveTo(cx + dx * 8, cy + dy * 8);
        ctx.lineTo(cx + dx * 8 + dy * 3 - dx * 3, cy + dy * 8 + dx * 3 - dy * 3);
        ctx.stroke();
      }
      break;
    }
    case 'bomb': {
      ctx.beginPath();
      ctx.arc(cx, cy + 2, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 3, cy - 4);
      ctx.lineTo(cx + 7, cy - 9);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 9, cy - 6);
      ctx.lineTo(cx - 3, cy - 6);
      ctx.moveTo(cx - 6, cy - 9);
      ctx.lineTo(cx - 6, cy - 3);
      ctx.stroke();
      break;
    }
    case 'speed': {
      ctx.beginPath();
      ctx.moveTo(cx + 3, cy - 9);
      ctx.lineTo(cx - 5, cy + 1);
      ctx.lineTo(cx, cy + 1);
      ctx.lineTo(cx - 3, cy + 9);
      ctx.lineTo(cx + 6, cy - 2);
      ctx.lineTo(cx + 1, cy - 2);
      ctx.closePath();
      ctx.fillStyle = css(0xffffff, 0.95);
      ctx.fill();
      break;
    }
    case 'shield': {
      ctx.beginPath();
      ctx.moveTo(cx, cy - 9);
      ctx.lineTo(cx + 7, cy - 5);
      ctx.lineTo(cx + 7, cy + 2);
      ctx.quadraticCurveTo(cx, cy + 10, cx - 7, cy + 2);
      ctx.lineTo(cx - 7, cy - 5);
      ctx.closePath();
      ctx.fillStyle = css(0xffffff, 0.92);
      ctx.fill();
      ctx.strokeStyle = css(0x12303a, 0.9);
      ctx.lineWidth = 1.6;
      ctx.stroke();
      break;
    }
    case 'pierce': {
      ctx.beginPath();
      ctx.moveTo(cx, cy - 10);
      ctx.lineTo(cx + 5, cy + 2);
      ctx.lineTo(cx, cy + 9);
      ctx.lineTo(cx - 5, cy + 2);
      ctx.closePath();
      ctx.fillStyle = css(0xffffff, 0.95);
      ctx.fill();
      ctx.strokeStyle = css(0x2a1840, 0.9);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 6);
      ctx.lineTo(cx, cy + 5);
      ctx.stroke();
      break;
    }
    case 'ability': {
      ctx.fillStyle = css(0xffffff, 0.95);
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const rr = i % 2 === 0 ? 10 : 4.5;
        const px = cx + Math.cos(a) * rr;
        const py = cy + Math.sin(a) * rr;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'life': {
      ctx.fillStyle = css(0xffffff, 0.95);
      ctx.beginPath();
      ctx.moveTo(cx, cy + 8);
      ctx.bezierCurveTo(cx - 12, cy - 1, cx - 6, cy - 11, cx, cy - 4);
      ctx.bezierCurveTo(cx + 6, cy - 11, cx + 12, cy - 1, cx, cy + 8);
      ctx.closePath();
      ctx.fill();
      break;
    }
  }
}

/* ------------------------------------------------------------ generation */

export const BOSS_SIZE: Record<string, number> = {
  magmaron: 144,
  cryon: 128,
  gardien: 144,
};

export function buildCharacterTextures(scene: Phaser.Scene): void {
  makeSheet(scene, TEX.player, T, T, PLAYER_FRAMES.count, (ctx, f) => {
    if (f < 4) drawHero(ctx, 0, f, 'walk');
    else if (f < 8) drawHero(ctx, 1, f - 4, 'walk');
    else if (f < 12) drawHero(ctx, 2, f - 8, 'walk');
    else if (f === PLAYER_FRAMES.hurt) drawHero(ctx, 0, 0, 'hurt');
    else if (f === PLAYER_FRAMES.victory) drawHero(ctx, 0, 0, 'victory');
    else drawHero(ctx, 0, 0, 'defeat');
  }, 1001);

  const kinds: EnemyKind[] = ['patroller', 'chaser', 'flanker', 'coward', 'heavy', 'guardian'];
  for (const k of kinds) {
    makeSheet(scene, TEX.enemy(k), T, T, 5, (ctx, f, _w, _h, rng) => drawEnemy(ctx, k, f, rng),
      2000 + k.length * 131);
  }

  makeSheet(scene, TEX.boss('magmaron'), BOSS_SIZE.magmaron, BOSS_SIZE.magmaron, 4,
    (ctx, f, w, _h, rng) => drawMagmaron(ctx, f, rng, w), 3001);
  makeSheet(scene, TEX.boss('cryon'), BOSS_SIZE.cryon, BOSS_SIZE.cryon, 4,
    (ctx, f, w, _h, rng) => drawCryon(ctx, f, rng, w), 3002);
  makeSheet(scene, TEX.boss('gardien'), BOSS_SIZE.gardien, BOSS_SIZE.gardien, 4,
    (ctx, f, w, _h, rng) => drawGardien(ctx, f, rng, w), 3003);

  const bombTypes: BombType[] = ['classic', 'pierce', 'shift', 'slow'];
  for (const bt of bombTypes) {
    makeSheet(scene, `${TEX.bomb}-${bt}`, T, T, 4, (ctx, f, _w, _h, rng) =>
      drawBomb(ctx, bt, f, rng), 4000 + bt.length * 17);
  }

  const powers: PowerUpKind[] = ['range', 'bomb', 'speed', 'shield', 'pierce', 'ability', 'life'];
  for (const p of powers) {
    makeSheet(scene, TEX.powerup(p), T, T, 4, (ctx, f) => drawPowerUp(ctx, p, f),
      5000 + p.length * 23);
  }
}
