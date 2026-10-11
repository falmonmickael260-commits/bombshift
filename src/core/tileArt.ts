import type Phaser from 'phaser';
import { TEX, THEME_COLORS, TILE } from './constants';
import { crack, css, glow, makeSheet, makeTexture, mix, roundRect, shade, speckle } from './paint';
import type { Rng } from './rng';
import type { Theme } from './types';

const T = TILE;

/* ------------------------------------------------------------------ sols */

function drawFloor(
  ctx: CanvasRenderingContext2D,
  theme: Theme,
  variant: number,
  rng: Rng,
): void {
  const c = THEME_COLORS[theme];
  const base = variant % 2 === 0 ? c.floorA : c.floorB;

  const g = ctx.createLinearGradient(0, 0, T, T);
  g.addColorStop(0, css(shade(base, 0.18)));
  g.addColorStop(1, css(shade(base, -0.06)));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, T, T);

  // Joints de dalle : grille lisible meme avec beaucoup d'effets par-dessus.
  ctx.strokeStyle = css(c.grout, 0.85);
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, T - 2, T - 2);
  ctx.strokeStyle = css(shade(base, 0.16), 0.5);
  ctx.lineWidth = 1;
  ctx.strokeRect(3, 3, T - 6, T - 6);

  speckle(ctx, rng, T, T, 34, [shade(base, 0.2), shade(base, -0.25), c.grout], 0.3);

  if (theme === 'volcano') {
    // Fissures discretes : elles donnent de la matiere sans parasiter la
    // lecture des dangers (flammes, lave) qui doivent rester les seuls
    // elements oranges vraiment lumineux.
    if (variant >= 2) {
      ctx.strokeStyle = css(c.hazard, 0.18);
      crack(ctx, rng, rng.float(8, 20), rng.float(6, 18), rng.float(12, 22), rng.float(0.2, 1.3), 1.3);
    }
    if (variant === 3) {
      glow(ctx, rng.float(14, 34), rng.float(14, 34), 11, c.glow, 0.14);
    }
  } else if (theme === 'ice') {
    ctx.strokeStyle = css(0xffffff, variant >= 2 ? 0.3 : 0.16);
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 3; i++) {
      crack(ctx, rng, rng.float(4, 44), rng.float(4, 44), rng.float(10, 22), rng.float(0, 6.2), 1.1);
    }
    const sheen = ctx.createLinearGradient(0, T, T, 0);
    sheen.addColorStop(0, css(0xffffff, 0));
    sheen.addColorStop(0.5, css(0xffffff, 0.12));
    sheen.addColorStop(1, css(0xffffff, 0));
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, T, T);
  } else {
    // Temple : gravures et mousse.
    ctx.strokeStyle = css(shade(base, -0.4), 0.6);
    ctx.lineWidth = 1.6;
    if (variant % 2 === 0) {
      ctx.beginPath();
      ctx.arc(T / 2, T / 2, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(T / 2, T / 2, 5, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(8, 8);
      ctx.lineTo(T - 8, 8);
      ctx.lineTo(T - 8, T - 8);
      ctx.stroke();
    }
    if (variant >= 2) {
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = css(mix(c.hazard, 0x2f4a22, 0.5), rng.float(0.15, 0.4));
        const r = rng.float(3, 7);
        ctx.beginPath();
        ctx.arc(rng.float(5, T - 5), rng.float(5, T - 5), r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Occlusion douce sur les bords : donne du relief sans masquer la case.
  const vig = ctx.createRadialGradient(T / 2, T / 2, T * 0.25, T / 2, T / 2, T * 0.72);
  vig.addColorStop(0, css(0x000000, 0));
  vig.addColorStop(1, css(0x000000, 0.28));
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, T, T);
}

function drawWall(ctx: CanvasRenderingContext2D, theme: Theme, rng: Rng): void {
  const c = THEME_COLORS[theme];
  ctx.fillStyle = css(shade(c.wallSide, -0.35));
  ctx.fillRect(0, 0, T, T);

  // Faces laterales (pseudo 3D vue de dessus).
  const side = ctx.createLinearGradient(0, 0, 0, T);
  side.addColorStop(0, css(shade(c.wallSide, 0.1)));
  side.addColorStop(1, css(shade(c.wallSide, -0.4)));
  ctx.fillStyle = side;
  roundRect(ctx, 1, 1, T - 2, T - 2, 5);
  ctx.fill();

  // Face superieure.
  const top = ctx.createLinearGradient(0, 3, T, T - 9);
  top.addColorStop(0, css(shade(c.wallTop, 0.2)));
  top.addColorStop(0.6, css(c.wallTop));
  top.addColorStop(1, css(shade(c.wallTop, -0.2)));
  ctx.fillStyle = top;
  roundRect(ctx, 3, 2, T - 6, T - 9, 4);
  ctx.fill();

  speckle(ctx, rng, T, T - 8, 30, [shade(c.wallTop, 0.25), shade(c.wallTop, -0.3)], 0.35);

  ctx.strokeStyle = css(0xffffff, 0.1);
  ctx.lineWidth = 1.5;
  roundRect(ctx, 4, 3, T - 8, T - 11, 4);
  ctx.stroke();

  if (theme === 'volcano') {
    ctx.strokeStyle = css(c.hazard, 0.4);
    ctx.lineWidth = 1.4;
    crack(ctx, rng, 10, 8, 22, 1.1, 1.4);
    ctx.fillStyle = css(shade(c.wallTop, -0.45), 0.8);
    ctx.fillRect(8, T - 16, T - 16, 3);
  } else if (theme === 'ice') {
    ctx.fillStyle = css(0xffffff, 0.16);
    ctx.beginPath();
    ctx.moveTo(8, T - 12);
    ctx.lineTo(T / 2, 6);
    ctx.lineTo(T - 8, T - 12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = css(c.accent, 0.5);
    ctx.lineWidth = 1.2;
    ctx.stroke();
  } else {
    // Glyphe grave.
    ctx.strokeStyle = css(shade(c.wallTop, -0.5), 0.9);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(14, 12);
    ctx.lineTo(14, T - 18);
    ctx.lineTo(T - 14, T - 18);
    ctx.stroke();
    ctx.strokeStyle = css(c.accent, 0.35);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(T / 2, T / 2 - 3, 7, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Ombre portee vers le bas.
  const sh = ctx.createLinearGradient(0, T - 10, 0, T);
  sh.addColorStop(0, css(0x000000, 0));
  sh.addColorStop(1, css(0x000000, 0.5));
  ctx.fillStyle = sh;
  ctx.fillRect(0, T - 10, T, 10);
}

function drawBlock(
  ctx: CanvasRenderingContext2D,
  theme: Theme,
  variant: number,
  rng: Rng,
): void {
  const c = THEME_COLORS[theme];
  ctx.clearRect(0, 0, T, T);

  // Ombre au sol pour detacher le bloc du decor.
  ctx.fillStyle = css(0x000000, 0.4);
  roundRect(ctx, 4, 8, T - 8, T - 10, 6);
  ctx.fill();

  const g = ctx.createLinearGradient(0, 2, T, T - 6);
  g.addColorStop(0, css(shade(c.blockTop, 0.22)));
  g.addColorStop(0.55, css(c.blockTop));
  g.addColorStop(1, css(shade(c.blockSide, -0.1)));
  ctx.fillStyle = g;
  roundRect(ctx, 3, 3, T - 6, T - 9, 6);
  ctx.fill();

  ctx.strokeStyle = css(0xffffff, 0.18);
  ctx.lineWidth = 1.6;
  roundRect(ctx, 4, 4, T - 8, T - 11, 5);
  ctx.stroke();

  if (theme === 'volcano') {
    // Briques de pierre noire chauffee.
    ctx.strokeStyle = css(shade(c.blockSide, -0.4), 0.85);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(4, 18);
    ctx.lineTo(T - 4, 18);
    ctx.moveTo(4, 30);
    ctx.lineTo(T - 4, 30);
    ctx.moveTo(T / 2, 6);
    ctx.lineTo(T / 2, 18);
    ctx.moveTo(14, 30);
    ctx.lineTo(14, 39);
    ctx.stroke();
    if (variant === 1) {
      ctx.strokeStyle = css(c.hazard, 0.6);
      crack(ctx, rng, 12, 10, 24, 1.2, 1.5);
    }
    speckle(ctx, rng, T, T - 8, 26, [shade(c.blockTop, 0.3), shade(c.blockSide, -0.3)], 0.35);
  } else if (theme === 'ice') {
    // Glace translucide avec bulles internes.
    ctx.fillStyle = css(0xffffff, 0.22);
    roundRect(ctx, 7, 7, T - 22, T - 26, 4);
    ctx.fill();
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = css(0xffffff, rng.float(0.2, 0.45));
      ctx.beginPath();
      ctx.arc(rng.float(10, T - 10), rng.float(10, T - 14), rng.float(1.2, 3.1), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = css(c.accent, 0.5);
    ctx.lineWidth = 1.2;
    crack(ctx, rng, 10, 12, 20, 0.8, 1.2);
    if (variant === 1) crack(ctx, rng, T - 12, 14, 18, 2.4, 1);
  } else {
    // Vegetation dense.
    for (let i = 0; i < 14; i++) {
      const lx = rng.float(6, T - 6);
      const ly = rng.float(6, T - 10);
      const r = rng.float(4, 9);
      ctx.fillStyle = css(mix(c.blockTop, i % 2 ? 0x8fc45a : 0x27401c, rng.float(0.1, 0.7)), 0.95);
      ctx.beginPath();
      ctx.ellipse(lx, ly, r, r * 0.68, rng.float(0, Math.PI), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = css(0x2a3f1c, 0.8);
    ctx.lineWidth = 2;
    crack(ctx, rng, T / 2, T - 8, 20, -1.6, 2);
    if (variant === 1) {
      ctx.fillStyle = css(0xe4617d, 0.9);
      ctx.beginPath();
      ctx.arc(rng.float(14, T - 14), rng.float(12, 26), 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/* --------------------------------------------------------------- hazards */

function drawLava(ctx: CanvasRenderingContext2D, frame: number, rng: Rng): void {
  const g = ctx.createLinearGradient(0, 0, T, T);
  g.addColorStop(0, css(0x6b1205));
  g.addColorStop(1, css(0x400a04));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, T, T);

  const phase = (frame / 4) * Math.PI * 2;
  for (let i = 0; i < 7; i++) {
    const x = rng.float(2, T - 2) + Math.sin(phase + i) * 3;
    const y = rng.float(2, T - 2) + Math.cos(phase + i * 1.7) * 3;
    const r = rng.float(5, 13) * (0.85 + 0.15 * Math.sin(phase + i));
    glow(ctx, x, y, r, i % 3 === 0 ? 0xffd27a : 0xff6a1a, 0.75);
  }
  // Croute solidifiee : repere visuel que c'est de la lave, pas un sol.
  ctx.strokeStyle = css(0x1a0703, 0.85);
  ctx.lineWidth = 2.4;
  crack(ctx, rng, 2, rng.float(8, 20), 44, 0.2, 2.4);
  crack(ctx, rng, rng.float(8, 20), 2, 40, 1.4, 2);
  ctx.fillStyle = css(0xffe9b0, 0.12 + 0.07 * Math.sin(phase));
  ctx.fillRect(0, 0, T, T);
}

function drawVent(ctx: CanvasRenderingContext2D, frame: number, rng: Rng): void {
  // frame 0 : inerte | 1-2 : avertissement | 3 : eruption
  ctx.fillStyle = css(0x241a19);
  ctx.fillRect(0, 0, T, T);
  speckle(ctx, rng, T, T, 26, [0x3a2a26, 0x171010], 0.4);

  ctx.strokeStyle = css(0x120b0a, 0.9);
  ctx.lineWidth = 3;
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(6, (T / 4) * i);
    ctx.lineTo(T - 6, (T / 4) * i);
    ctx.stroke();
  }
  ctx.strokeStyle = css(0x4a3a36, 0.9);
  ctx.lineWidth = 2;
  roundRect(ctx, 5, 5, T - 10, T - 10, 4);
  ctx.stroke();

  if (frame === 1 || frame === 2) {
    const a = frame === 1 ? 0.35 : 0.65;
    glow(ctx, T / 2, T / 2, 22, 0xff7a2f, a);
    ctx.strokeStyle = css(0xffb347, a + 0.2);
    ctx.lineWidth = 2;
    roundRect(ctx, 4, 4, T - 8, T - 8, 5);
    ctx.stroke();
  }
  if (frame === 3) {
    glow(ctx, T / 2, T / 2, 30, 0xffd27a, 0.95);
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle = css(i % 2 ? 0xff5a12 : 0xffe08a, rng.float(0.5, 0.95));
      const x = rng.float(6, T - 6);
      const y = rng.float(4, T - 4);
      ctx.beginPath();
      ctx.ellipse(x, y, rng.float(3, 8), rng.float(6, 14), 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawToxic(ctx: CanvasRenderingContext2D, frame: number, rng: Rng): void {
  // frame 0 : dormant | 1-2 : montee | 3 : actif mortel
  const intensity = frame / 3;
  const g = ctx.createLinearGradient(0, 0, 0, T);
  g.addColorStop(0, css(mix(0x21301c, 0x4f8a2b, intensity)));
  g.addColorStop(1, css(mix(0x151e12, 0x2f6a1c, intensity)));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, T, T);

  for (let i = 0; i < 6; i++) {
    const r = rng.float(3, 9) * (0.6 + intensity * 0.8);
    ctx.fillStyle = css(mix(0x3d5c2a, 0x9bf05a, intensity), rng.float(0.25, 0.6));
    ctx.beginPath();
    ctx.arc(rng.float(5, T - 5), rng.float(5, T - 5), r, 0, Math.PI * 2);
    ctx.fill();
  }
  if (frame >= 2) glow(ctx, T / 2, T / 2, 24, 0x9bf04a, 0.25 + intensity * 0.35);

  // Bordure en chevrons : la zone dangereuse est identifiable au premier coup d'oeil.
  ctx.strokeStyle = css(0xcfe84a, 0.25 + intensity * 0.55);
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 4]);
  ctx.strokeRect(2, 2, T - 4, T - 4);
  ctx.setLineDash([]);
}

function drawDoor(ctx: CanvasRenderingContext2D, frame: number, rng: Rng): void {
  // frame 0 : ouverte | 1-2 : en mouvement | 3 : fermee
  ctx.fillStyle = css(0x1b2a38);
  ctx.fillRect(0, 0, T, T);
  speckle(ctx, rng, T, T, 18, [0x27465f, 0x101c26], 0.4);
  ctx.strokeStyle = css(0x6ee7ff, 0.35);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 5);
  ctx.lineTo(T, 5);
  ctx.moveTo(0, T - 5);
  ctx.lineTo(T, T - 5);
  ctx.stroke();

  const closed = frame / 3;
  const barW = (T / 2) * closed;
  for (const sideX of [0, T - barW]) {
    const g = ctx.createLinearGradient(sideX, 0, sideX + barW, 0);
    g.addColorStop(0, css(0x7fb6d4));
    g.addColorStop(1, css(0x2f5a74));
    ctx.fillStyle = g;
    ctx.fillRect(sideX, 6, barW, T - 12);
    ctx.strokeStyle = css(0xd6f7ff, 0.6);
    ctx.lineWidth = 1.4;
    ctx.strokeRect(sideX + 0.5, 6.5, Math.max(0, barW - 1), T - 13);
  }
  if (frame === 3) {
    ctx.fillStyle = css(0xd6f7ff, 0.5);
    ctx.fillRect(T / 2 - 1.5, 6, 3, T - 12);
    glow(ctx, T / 2, T / 2, 16, 0x6ee7ff, 0.3);
  }
}

function drawGate(ctx: CanvasRenderingContext2D, rng: Rng): void {
  ctx.fillStyle = css(0x191419);
  ctx.fillRect(0, 0, T, T);
  speckle(ctx, rng, T, T, 20, [0x2d2630, 0x0d0a0e], 0.5);
  for (let i = 0; i < 4; i++) {
    const x = 6 + i * 11;
    const g = ctx.createLinearGradient(x, 0, x + 7, 0);
    g.addColorStop(0, css(0x8d7f6a));
    g.addColorStop(1, css(0x4a4136));
    ctx.fillStyle = g;
    roundRect(ctx, x, 3, 7, T - 6, 3);
    ctx.fill();
  }
  ctx.fillStyle = css(0x2b241d);
  ctx.fillRect(2, T / 2 - 4, T - 4, 8);
  ctx.strokeStyle = css(0xc9a227, 0.9);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(T / 2, T / 2, 7, 0, Math.PI * 2);
  ctx.stroke();
  glow(ctx, T / 2, T / 2, 12, 0xff3b3b, 0.45);
}

function drawExit(ctx: CanvasRenderingContext2D, frame: number, rng: Rng): void {
  ctx.fillStyle = css(0x0e1118);
  ctx.fillRect(0, 0, T, T);
  speckle(ctx, rng, T, T, 16, [0x1d2330, 0x070a0f], 0.5);
  const locked = frame === 0;
  const color = locked ? 0x5a5f6b : 0x7cf0c0;
  const pulse = locked ? 0.25 : 0.55 + 0.25 * Math.sin((frame / 3) * Math.PI * 2);

  ctx.strokeStyle = css(color, 0.9);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(T / 2, T / 2, 15, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = css(color, 0.5);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(T / 2, T / 2, 19, 0, Math.PI * 2);
  ctx.stroke();
  glow(ctx, T / 2, T / 2, 22, color, pulse);

  // Fleche vers le haut : indique clairement "sortie".
  ctx.fillStyle = css(locked ? 0x8b8f99 : 0xe8fff6, 0.95);
  ctx.beginPath();
  ctx.moveTo(T / 2, 13);
  ctx.lineTo(T / 2 + 8, 25);
  ctx.lineTo(T / 2 + 3, 25);
  ctx.lineTo(T / 2 + 3, 34);
  ctx.lineTo(T / 2 - 3, 34);
  ctx.lineTo(T / 2 - 3, 25);
  ctx.lineTo(T / 2 - 8, 25);
  ctx.closePath();
  ctx.fill();
  if (locked) {
    ctx.strokeStyle = css(0xff5a5a, 0.8);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(10, 10);
    ctx.lineTo(T - 10, T - 10);
    ctx.stroke();
  }
}

function drawPlate(ctx: CanvasRenderingContext2D, frame: number, rng: Rng): void {
  const pressed = frame === 1;
  ctx.fillStyle = css(0x272f21);
  ctx.fillRect(0, 0, T, T);
  speckle(ctx, rng, T, T, 20, [0x39412f, 0x171c13], 0.4);
  ctx.fillStyle = css(0x000000, 0.45);
  roundRect(ctx, 6, 8, T - 12, T - 12, 5);
  ctx.fill();
  const off = pressed ? 4 : 0;
  const g = ctx.createLinearGradient(0, 6 + off, 0, T - 8);
  g.addColorStop(0, css(pressed ? 0x6a5f44 : 0x8d8061));
  g.addColorStop(1, css(0x4a4232));
  ctx.fillStyle = g;
  roundRect(ctx, 6, 6 + off, T - 12, T - 16, 5);
  ctx.fill();
  ctx.strokeStyle = css(pressed ? 0xff6a3b : 0xc9a227, 0.85);
  ctx.lineWidth = 2;
  roundRect(ctx, 9, 9 + off, T - 18, T - 22, 4);
  ctx.stroke();
  // Marque triangulaire : signale un mecanisme, pas un sol neutre.
  ctx.fillStyle = css(pressed ? 0xff8a5b : 0xd9c37a, 0.9);
  ctx.beginPath();
  ctx.moveTo(T / 2, 16 + off);
  ctx.lineTo(T / 2 + 6, 28 + off);
  ctx.lineTo(T / 2 - 6, 28 + off);
  ctx.closePath();
  ctx.fill();
  if (pressed) glow(ctx, T / 2, T / 2, 18, 0xff6a3b, 0.35);
}

function drawCrystal(ctx: CanvasRenderingContext2D, rng: Rng): void {
  ctx.clearRect(0, 0, T, T);
  ctx.fillStyle = css(0x000000, 0.4);
  roundRect(ctx, 5, 10, T - 10, T - 12, 7);
  ctx.fill();
  const g = ctx.createLinearGradient(6, 4, T - 6, T - 8);
  g.addColorStop(0, css(0xd8f6ff, 0.95));
  g.addColorStop(0.5, css(0x79c8e8, 0.95));
  g.addColorStop(1, css(0x2f6f93, 0.95));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(T / 2, 2);
  ctx.lineTo(T - 5, 16);
  ctx.lineTo(T - 9, T - 7);
  ctx.lineTo(9, T - 7);
  ctx.lineTo(5, 16);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = css(0xffffff, 0.55);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.strokeStyle = css(0xffffff, 0.3);
  ctx.beginPath();
  ctx.moveTo(T / 2, 3);
  ctx.lineTo(T / 2, T - 8);
  ctx.moveTo(6, 17);
  ctx.lineTo(T - 6, 17);
  ctx.stroke();
  glow(ctx, T / 2, T / 2, 18, 0x9bf0ff, 0.3);
  speckle(ctx, rng, T, T, 10, [0xffffff], 0.4, 1.4);
}

function drawRubble(ctx: CanvasRenderingContext2D, theme: Theme, rng: Rng): void {
  const c = THEME_COLORS[theme];
  ctx.clearRect(0, 0, T, T);
  for (let i = 0; i < 9; i++) {
    ctx.fillStyle = css(mix(c.blockSide, c.grout, rng.float(0, 0.7)), rng.float(0.5, 0.85));
    const x = rng.float(6, T - 10);
    const y = rng.float(8, T - 8);
    const s = rng.float(3, 7);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + s, y + rng.float(-2, 2));
    ctx.lineTo(x + s * 0.6, y + s * 0.7);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = css(0x000000, 0.18);
  ctx.beginPath();
  ctx.ellipse(T / 2, T / 2 + 4, 16, 9, 0, 0, Math.PI * 2);
  ctx.fill();
}

/* ----------------------------------------------------------------- props */

function drawValve(ctx: CanvasRenderingContext2D, frame: number, rng: Rng): void {
  const on = frame >= 1;
  ctx.clearRect(0, 0, T, T);
  ctx.fillStyle = css(0x000000, 0.4);
  roundRect(ctx, 7, 12, T - 14, T - 14, 8);
  ctx.fill();
  const g = ctx.createLinearGradient(0, 6, 0, T - 6);
  g.addColorStop(0, css(0x6b5a50));
  g.addColorStop(1, css(0x2e2621));
  ctx.fillStyle = g;
  roundRect(ctx, 7, 7, T - 14, T - 16, 7);
  ctx.fill();
  ctx.strokeStyle = css(0x9c8878, 0.9);
  ctx.lineWidth = 2;
  roundRect(ctx, 9, 9, T - 18, T - 20, 6);
  ctx.stroke();

  // Volant de valve.
  const cx = T / 2;
  const cy = T / 2 - 1;
  const rot = on ? Math.PI / 4 : 0;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.strokeStyle = css(on ? 0xffb347 : 0x8d8373, 0.95);
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.arc(0, 0, 9, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * 9, Math.sin(a) * 9);
  }
  ctx.stroke();
  ctx.restore();
  if (on) glow(ctx, cx, cy, 20, 0xffb347, 0.5 + (frame === 2 ? 0.2 : 0));
  else speckle(ctx, rng, T, T, 10, [0x463b33], 0.5);
}

function drawGenerator(ctx: CanvasRenderingContext2D, frame: number, rng: Rng): void {
  const charge = frame / 3;
  ctx.clearRect(0, 0, T, T);
  ctx.fillStyle = css(0x000000, 0.45);
  roundRect(ctx, 6, 12, T - 12, T - 14, 7);
  ctx.fill();
  const g = ctx.createLinearGradient(0, 4, 0, T - 6);
  g.addColorStop(0, css(0x4a6378));
  g.addColorStop(1, css(0x1d2c38));
  ctx.fillStyle = g;
  roundRect(ctx, 6, 4, T - 12, T - 14, 6);
  ctx.fill();
  ctx.strokeStyle = css(0x8fc6e0, 0.8);
  ctx.lineWidth = 2;
  roundRect(ctx, 8, 6, T - 16, T - 18, 5);
  ctx.stroke();

  // Bobine centrale.
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = css(charge > i / 3 ? 0x6ee7ff : 0x3d5a6b, 0.95);
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(14, 14 + i * 7);
    ctx.lineTo(T - 14, 14 + i * 7);
    ctx.stroke();
  }
  if (frame > 0) {
    glow(ctx, T / 2, T / 2 - 3, 20, 0x6ee7ff, 0.25 + charge * 0.5);
    ctx.strokeStyle = css(0xd6f7ff, charge);
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 3; i++) {
      const a1 = rng.float(0, Math.PI * 2);
      ctx.beginPath();
      ctx.moveTo(T / 2, T / 2 - 3);
      ctx.lineTo(T / 2 + Math.cos(a1) * 14, T / 2 - 3 + Math.sin(a1) * 14);
      ctx.stroke();
    }
  }
}

function drawRelic(ctx: CanvasRenderingContext2D, frame: number, rng: Rng): void {
  ctx.clearRect(0, 0, T, T);
  const bob = Math.sin((frame / 4) * Math.PI * 2) * 2;
  ctx.fillStyle = css(0x000000, 0.35);
  ctx.beginPath();
  ctx.ellipse(T / 2, T - 8, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  glow(ctx, T / 2, T / 2 + bob, 22, 0xf2e08a, 0.45);
  const g = ctx.createLinearGradient(14, 8, T - 14, T - 10);
  g.addColorStop(0, css(0xfff3c4));
  g.addColorStop(0.5, css(0xe0b94a));
  g.addColorStop(1, css(0x8a6a1c));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(T / 2, 8 + bob);
  ctx.lineTo(T - 13, T / 2 + bob);
  ctx.lineTo(T / 2, T - 10 + bob);
  ctx.lineTo(13, T / 2 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = css(0xfff8de, 0.85);
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.fillStyle = css(0x4b2c86, 0.9);
  ctx.beginPath();
  ctx.arc(T / 2, T / 2 + bob, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = css(0xffffff, 0.8);
  ctx.beginPath();
  ctx.arc(T / 2 - 1.5, T / 2 - 2 + bob, 1.8, 0, Math.PI * 2);
  ctx.fill();
  speckle(ctx, rng, T, T, 6, [0xfff3c4], 0.6, 1.6);
}

/* ------------------------------------------------------------ generation */

export function buildTileTextures(scene: Phaser.Scene, themes: readonly Theme[]): void {
  for (const theme of themes) {
    for (let v = 0; v < 4; v++) {
      makeSheet(scene, TEX.floor(theme, v), T, T, 1, (ctx, _f, _w, _h, rng) =>
        drawFloor(ctx, theme, v, rng), 100 + v * 31 + theme.length * 7);
    }
    makeSheet(scene, TEX.wall(theme), T, T, 1, (ctx, _f, _w, _h, rng) =>
      drawWall(ctx, theme, rng), 900 + theme.length);
    for (let v = 0; v < 2; v++) {
      makeSheet(scene, TEX.block(theme, v), T, T, 1, (ctx, _f, _w, _h, rng) =>
        drawBlock(ctx, theme, v, rng), 300 + v * 97 + theme.length * 3);
    }
    makeSheet(scene, TEX.rubble(theme), T, T, 1, (ctx, _f, _w, _h, rng) =>
      drawRubble(ctx, theme, rng), 700 + theme.length);
  }

  makeSheet(scene, TEX.crystal, T, T, 1, (ctx, _f, _w, _h, rng) => drawCrystal(ctx, rng), 511);
  for (let v = 0; v < 4; v++) {
    makeSheet(scene, TEX.ice(v), T, T, 1, (ctx, _f, _w, _h, rng) =>
      drawFloor(ctx, 'ice', v, rng), 160 + v * 13);
  }
  makeSheet(scene, TEX.lava, T, T, 4, (ctx, f, _w, _h, rng) => drawLava(ctx, f, rng), 611);
  makeSheet(scene, TEX.vent, T, T, 4, (ctx, f, _w, _h, rng) => drawVent(ctx, f, rng), 622);
  makeSheet(scene, TEX.toxic, T, T, 4, (ctx, f, _w, _h, rng) => drawToxic(ctx, f, rng), 633);
  makeSheet(scene, TEX.door, T, T, 4, (ctx, f, _w, _h, rng) => drawDoor(ctx, f, rng), 644);
  makeSheet(scene, TEX.gate, T, T, 1, (ctx, _f, _w, _h, rng) => drawGate(ctx, rng), 655);
  makeSheet(scene, TEX.exit, T, T, 4, (ctx, f, _w, _h, rng) => drawExit(ctx, f, rng), 666);
  makeSheet(scene, TEX.plate, T, T, 2, (ctx, f, _w, _h, rng) => drawPlate(ctx, f, rng), 677);
  makeSheet(scene, TEX.valve, T, T, 3, (ctx, f, _w, _h, rng) => drawValve(ctx, f, rng), 688);
  makeSheet(scene, TEX.generator, T, T, 4, (ctx, f, _w, _h, rng) => drawGenerator(ctx, f, rng), 699);
  makeSheet(scene, TEX.relic, T, T, 4, (ctx, f, _w, _h, rng) => drawRelic(ctx, f, rng), 710);

  // Overlay d'avertissement (zone qui va devenir dangereuse).
  makeTexture(scene, TEX.warning, T, T, (ctx) => {
    ctx.clearRect(0, 0, T, T);
    ctx.strokeStyle = css(0xffd24a, 0.95);
    ctx.lineWidth = 3;
    ctx.setLineDash([7, 5]);
    ctx.strokeRect(3, 3, T - 6, T - 6);
    ctx.setLineDash([]);
    ctx.fillStyle = css(0xffd24a, 0.14);
    ctx.fillRect(3, 3, T - 6, T - 6);
    ctx.fillStyle = css(0xffd24a, 0.95);
    ctx.beginPath();
    ctx.moveTo(T / 2, 14);
    ctx.lineTo(T / 2 + 9, 31);
    ctx.lineTo(T / 2 - 9, 31);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = css(0x2a1c00, 0.95);
    ctx.fillRect(T / 2 - 1.4, 19, 2.8, 7);
    ctx.fillRect(T / 2 - 1.4, 27.5, 2.8, 2.4);
  });

  // Fleche de boussole : indique l'objectif courant hors champ.
  makeTexture(scene, TEX.arrow, 44, 44, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;
    ctx.fillStyle = css(0x120a0c, 0.55);
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fill();
    glow(ctx, cx, cy, 20, 0xffd27a, 0.35);
    const g = ctx.createLinearGradient(cx - 12, cy, cx + 14, cy);
    g.addColorStop(0, css(0xfff3c4));
    g.addColorStop(1, css(0xff8a3c));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(cx + 15, cy);
    ctx.lineTo(cx - 8, cy - 11);
    ctx.lineTo(cx - 3, cy);
    ctx.lineTo(cx - 8, cy + 11);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = css(0x2a1004, 0.85);
    ctx.lineWidth = 1.6;
    ctx.stroke();
  });

  // Ombre d'acteur.
  makeTexture(scene, TEX.shadow, T, Math.round(T / 2), (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 1, w / 2, h / 2, w / 2);
    g.addColorStop(0, css(0x000000, 0.55));
    g.addColorStop(1, css(0x000000, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function buildParticleTextures(scene: Phaser.Scene): void {
  makeTexture(scene, TEX.particle, 16, 16, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, css(0xffffff, 1));
    g.addColorStop(0.4, css(0xffffff, 0.75));
    g.addColorStop(1, css(0xffffff, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });

  makeTexture(scene, TEX.spark, 6, 20, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, css(0xffffff, 0));
    g.addColorStop(0.45, css(0xffffff, 1));
    g.addColorStop(1, css(0xffffff, 0));
    ctx.fillStyle = g;
    roundRect(ctx, w / 2 - 1.5, 0, 3, h, 1.5);
    ctx.fill();
  });

  makeTexture(scene, TEX.smoke, 32, 32, (ctx, w, h, rng) => {
    for (let i = 0; i < 6; i++) {
      const g = ctx.createRadialGradient(
        w / 2 + rng.float(-5, 5),
        h / 2 + rng.float(-5, 5),
        0,
        w / 2,
        h / 2,
        w / 2,
      );
      g.addColorStop(0, css(0xffffff, 0.3));
      g.addColorStop(1, css(0xffffff, 0));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
  });

  makeTexture(scene, TEX.shard, 12, 12, (ctx, w, h) => {
    ctx.fillStyle = css(0xffffff, 0.95);
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w, h * 0.7);
    ctx.lineTo(w * 0.35, h);
    ctx.closePath();
    ctx.fill();
  });

  makeTexture(scene, TEX.shield, 72, 72, (ctx, w, h) => {
    const r = w / 2 - 3;
    ctx.strokeStyle = css(0x8fe8ff, 0.9);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
    ctx.stroke();
    const g = ctx.createRadialGradient(w / 2, h / 2, r * 0.55, w / 2, h / 2, r);
    g.addColorStop(0, css(0x8fe8ff, 0));
    g.addColorStop(1, css(0x8fe8ff, 0.35));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = css(0xffffff, 0.5);
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r - 5, a, a + 0.5);
      ctx.stroke();
    }
  });

  // Flammes : 6 etapes (naissance -> plein -> extinction).
  makeSheet(scene, TEX.flame, T, T, 6, (ctx, f, w, h, rng) => {
    const t = f / 5;
    const scale = f === 0 ? 0.55 : f === 1 ? 0.95 : 1 - (f - 1) * 0.12;
    const alpha = f <= 1 ? 1 : 1 - (f - 1) * 0.16;
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale(scale, scale);
    const outer = ctx.createRadialGradient(0, 0, 0, 0, 0, w / 2);
    outer.addColorStop(0, css(0xfff3c0, alpha));
    outer.addColorStop(0.35, css(0xffb347, alpha * 0.95));
    outer.addColorStop(0.7, css(0xff5a12, alpha * 0.7));
    outer.addColorStop(1, css(0xb52400, 0));
    ctx.fillStyle = outer;
    ctx.beginPath();
    ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 5; i++) {
      const a = rng.float(0, Math.PI * 2);
      const d = rng.float(3, w / 3);
      glow(
        ctx,
        Math.cos(a) * d,
        Math.sin(a) * d,
        rng.float(5, 11),
        i % 2 ? 0xffffff : 0xffd27a,
        alpha * (0.5 - t * 0.3),
      );
    }
    if (f >= 3) {
      ctx.fillStyle = css(0x3a2a22, (f - 2) * 0.12);
      ctx.beginPath();
      ctx.arc(0, 0, w / 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }, 808);

  // Projectile (boule de feu / eclat de glace / dard) : teinte a l'usage.
  makeSheet(scene, TEX.projectile, 26, 26, 4, (ctx, f, w, h, rng) => {
    const r = w / 2;
    glow(ctx, r, r, r, 0xffffff, 0.85);
    const g = ctx.createRadialGradient(r, r, 0, r, r, r * 0.72);
    g.addColorStop(0, css(0xffffff, 1));
    g.addColorStop(0.55, css(0xffe08a, 0.95));
    g.addColorStop(1, css(0xff6a1a, 0.6));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(r, r, r * 0.6 + Math.sin((f / 4) * Math.PI * 2) * 1.2, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = css(0xffffff, rng.float(0.3, 0.7));
      ctx.beginPath();
      ctx.arc(rng.float(5, w - 5), rng.float(5, h - 5), rng.float(1, 2.4), 0, Math.PI * 2);
      ctx.fill();
    }
  }, 818);

  // Vignette plein ecran (ambiance, dessinee en overlay fixe).
  makeTexture(scene, TEX.vignette, 256, 256, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.72);
    g.addColorStop(0, css(0x000000, 0));
    g.addColorStop(1, css(0x000000, 0.65));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
}
