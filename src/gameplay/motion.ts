import { MOVE, TILE } from '../core/constants';
import type { Dir, Vec2 } from '../core/types';

export interface Body {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Demi-largeur de collision en pixels. */
  radius: number;
}

export interface MotionOptions {
  speed: number;
  /** Sol glissant : forte inertie, la vitesse ne retombe pas immediatement. */
  slippery: boolean;
  /** Recentrage automatique dans le couloir (confort tactile). */
  laneAssist: boolean;
  /** Collision : true si la case bloque l'acteur. */
  blocked: (cx: number, cy: number) => boolean;
}

export interface MotionResult {
  moved: boolean;
  /** Direction dominante du mouvement, utile pour l'animation. */
  dir: Dir | null;
  /** L'acteur a bute contre un obstacle sur cet axe. */
  hitX: boolean;
  hitY: boolean;
}

const EPS = 0.0001;

/**
 * Deplacement continu avec collisions sur grille.
 *
 * Choix de conception :
 * - integration axe par axe (X puis Y) : aucun "tunneling" possible, les
 *   collisions restent fiables meme a haute vitesse ;
 * - recentrage de couloir : sur mobile, viser un couloir d'une case au doigt
 *   est penible, on ramene donc doucement l'acteur sur l'axe du couloir ;
 * - inertie optionnelle pour les sols glissants.
 */
export function moveBody(
  body: Body,
  inputX: number,
  inputY: number,
  dt: number,
  opts: MotionOptions,
): MotionResult {
  const accel = opts.slippery ? MOVE.iceAccel : MOVE.accel;
  const friction = opts.slippery ? MOVE.iceFriction : MOVE.friction;

  // Cible de vitesse.
  const len = Math.hypot(inputX, inputY);
  let tx = 0;
  let ty = 0;
  if (len > EPS) {
    tx = (inputX / len) * opts.speed;
    ty = (inputY / len) * opts.speed;
  }

  body.vx = approach(body.vx, tx, (len > EPS ? accel : friction) * dt);
  body.vy = approach(body.vy, ty, (len > EPS ? accel : friction) * dt);

  const result: MotionResult = { moved: false, dir: null, hitX: false, hitY: false };

  // --- axe X ---
  if (Math.abs(body.vx) > EPS) {
    const nx = body.x + body.vx * dt;
    if (collides(nx, body.y, body.radius, opts.blocked)) {
      // On colle l'acteur contre la paroi.
      const sign = Math.sign(body.vx);
      const edge =
        sign > 0
          ? Math.floor((nx + body.radius) / TILE) * TILE - body.radius - 0.01
          : Math.floor((nx - body.radius) / TILE) * TILE + TILE + body.radius + 0.01;
      if ((sign > 0 && edge > body.x) || (sign < 0 && edge < body.x)) body.x = edge;
      body.vx = 0;
      result.hitX = true;
    } else {
      body.x = nx;
      result.moved = true;
    }
  }

  // --- axe Y ---
  if (Math.abs(body.vy) > EPS) {
    const ny = body.y + body.vy * dt;
    if (collides(body.x, ny, body.radius, opts.blocked)) {
      const sign = Math.sign(body.vy);
      const edge =
        sign > 0
          ? Math.floor((ny + body.radius) / TILE) * TILE - body.radius - 0.01
          : Math.floor((ny - body.radius) / TILE) * TILE + TILE + body.radius + 0.01;
      if ((sign > 0 && edge > body.y) || (sign < 0 && edge < body.y)) body.y = edge;
      body.vy = 0;
      result.hitY = true;
    } else {
      body.y = ny;
      result.moved = true;
    }
  }

  // --- recentrage de couloir ---
  if (opts.laneAssist && len > EPS) {
    const horizontal = Math.abs(inputX) > Math.abs(inputY) * 1.6;
    const vertical = Math.abs(inputY) > Math.abs(inputX) * 1.6;
    if (horizontal) {
      const row = Math.floor(body.y / TILE);
      const center = row * TILE + TILE / 2;
      body.y = snap(body.y, center, MOVE.laneSnap * dt, body.x, body.radius, opts.blocked, false);
    } else if (vertical) {
      const col = Math.floor(body.x / TILE);
      const center = col * TILE + TILE / 2;
      body.x = snap(body.x, center, MOVE.laneSnap * dt, body.y, body.radius, opts.blocked, true);
    }
  }

  if (Math.abs(body.vx) > Math.abs(body.vy)) {
    if (Math.abs(body.vx) > 4) result.dir = body.vx > 0 ? 'right' : 'left';
  } else if (Math.abs(body.vy) > 4) {
    result.dir = body.vy > 0 ? 'down' : 'up';
  }

  return result;
}

function approach(current: number, target: number, maxDelta: number): number {
  if (current < target) return Math.min(current + maxDelta, target);
  if (current > target) return Math.max(current - maxDelta, target);
  return current;
}

function snap(
  value: number,
  center: number,
  maxDelta: number,
  other: number,
  radius: number,
  blocked: (cx: number, cy: number) => boolean,
  axisIsX: boolean,
): number {
  const diff = center - value;
  if (Math.abs(diff) < 0.5) return center;
  const step = Math.sign(diff) * Math.min(Math.abs(diff), maxDelta);
  const next = value + step;
  const ok = axisIsX
    ? !collides(next, other, radius, blocked)
    : !collides(other, next, radius, blocked);
  return ok ? next : value;
}

/** Collision AABB de l'acteur contre les cases bloquantes. */
export function collides(
  x: number,
  y: number,
  radius: number,
  blocked: (cx: number, cy: number) => boolean,
): boolean {
  const x0 = Math.floor((x - radius) / TILE);
  const x1 = Math.floor((x + radius) / TILE);
  const y0 = Math.floor((y - radius) / TILE);
  const y1 = Math.floor((y + radius) / TILE);
  for (let cy = y0; cy <= y1; cy++) {
    for (let cx = x0; cx <= x1; cx++) {
      if (blocked(cx, cy)) return true;
    }
  }
  return false;
}

export function cellOf(pos: Vec2): Vec2 {
  return { x: Math.floor(pos.x / TILE), y: Math.floor(pos.y / TILE) };
}

export function centerOf(cell: Vec2): Vec2 {
  return { x: cell.x * TILE + TILE / 2, y: cell.y * TILE + TILE / 2 };
}

/**
 * Cases reellement occupees par le corps (et non la seule case du centre).
 *
 * Sert a decider si une bombe peut redevenir solide pour le joueur : tant
 * que son corps chevauche la case de la bombe, elle doit rester traversable,
 * sinon le joueur se retrouve coince a cheval sur sa propre bombe.
 */
export function bodyCellRange(body: Body): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  return {
    minX: Math.floor((body.x - body.radius) / TILE),
    minY: Math.floor((body.y - body.radius) / TILE),
    maxX: Math.floor((body.x + body.radius) / TILE),
    maxY: Math.floor((body.y + body.radius) / TILE),
  };
}

/** La case est-elle (meme partiellement) occupee par le corps ? */
export function bodyOverlapsCell(body: Body, cell: Vec2): boolean {
  const r = bodyCellRange(body);
  return cell.x >= r.minX && cell.x <= r.maxX && cell.y >= r.minY && cell.y <= r.maxY;
}

/** Distance au centre de la case : sert aux tests de contact "justes". */
export function offsetInCell(pos: Vec2): Vec2 {
  const c = centerOf(cellOf(pos));
  return { x: pos.x - c.x, y: pos.y - c.y };
}
