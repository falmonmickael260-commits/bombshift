import { DIR_VECTORS, type Vec2 } from '../core/types';
import type { FlowField } from '../maps/mapTypes';
import { moveBody, type Body } from './motion';

export type FlowPhase = 'idle' | 'warning' | 'active';

/** Pure timing shared by the simulation and the visible warning arrows. */
export function flowPhase(field: FlowField, elapsed: number, switchesDone = false): FlowPhase {
  if (field.stopsOnSwitches && switchesDone) return 'idle';
  if (!field.periodMs) return 'active';
  const phase = (elapsed + (field.offsetMs ?? 0)) % field.periodMs;
  const warning = field.warnMs ?? 1200;
  if (phase < warning) return 'warning';
  return phase < warning + (field.activeMs ?? 2500) ? 'active' : 'idle';
}

export function flowAt(fields: readonly FlowField[], cell: Vec2, elapsed: number,
  bombs = false, switchesDone = false): Vec2 {
  const force = { x: 0, y: 0 };
  for (const field of fields) {
    if (bombs && !field.affectsBombs) continue;
    if (cell.x < field.x || cell.y < field.y || cell.x >= field.x + field.width || cell.y >= field.y + field.height) continue;
    if (flowPhase(field, elapsed, switchesDone) !== 'active') continue;
    const dir = DIR_VECTORS[field.direction];
    force.x += dir.x * field.speed;
    force.y += dir.y * field.speed;
  }
  return force;
}

/** Use the same continuous collision solver as walking; preserve the actor's own velocity. */
export function displaceByFlow(body: Body, flow: Vec2, dtMs: number,
  blocked: (x: number, y: number) => boolean): void {
  const speed = Math.hypot(flow.x, flow.y);
  if (!speed) return;
  const pushed = { ...body, vx: flow.x, vy: flow.y };
  moveBody(pushed, flow.x / speed, flow.y / speed, Math.min(50, dtMs) / 1000,
    { speed, slippery: false, laneAssist: false, blocked });
  body.x = pushed.x;
  body.y = pushed.y;
}
