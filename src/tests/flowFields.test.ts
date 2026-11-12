import { describe, expect, it } from 'vitest';
import { flowAt, flowPhase, displaceByFlow } from '../gameplay/flowFields';
import type { FlowField } from '../maps/mapTypes';
import { TILE } from '../core/constants';

const conveyor: FlowField = { x: 2, y: 3, width: 4, height: 2, direction: 'right', kind: 'conveyor', speed: 60, affectsBombs: true };
describe('mécaniques des univers', () => {
  it('le courant ne change pas les commandes et ne pousse que dans sa zone', () => {
    expect(flowAt([conveyor], { x: 3, y: 3 }, 0)).toEqual({ x: 60, y: 0 });
    expect(flowAt([conveyor], { x: 6, y: 3 }, 0)).toEqual({ x: 0, y: 0 });
    expect(flowAt([conveyor], { x: 3, y: 5 }, 0)).toEqual({ x: 0, y: 0 });
  });
  it('annonce une rafale avant de déplacer le joueur puis offre une accalmie', () => {
    const wind = { ...conveyor, periodMs: 8000, warnMs: 1600, activeMs: 2600 };
    expect(flowPhase(wind, 0)).toBe('warning');
    expect(flowAt([wind], { x: 3, y: 3 }, 1599)).toEqual({ x: 0, y: 0 });
    expect(flowPhase(wind, 1600)).toBe('active');
    expect(flowPhase(wind, 4200)).toBe('idle');
    expect(flowPhase(wind, 8000)).toBe('warning');
  });
  it('réserve le transport des bombes aux champs prévus pour cela', () => {
    expect(flowAt([{ ...conveyor, affectsBombs: false }], { x: 3, y: 3 }, 0, true)).toEqual({ x: 0, y: 0 });
    expect(flowAt([conveyor], { x: 3, y: 3 }, 0, true)).toEqual({ x: 60, y: 0 });
  });
  it('arrête définitivement un champ quand ses consoles sont activées', () => {
    const field = { ...conveyor, stopsOnSwitches: true };
    expect(flowAt([field], { x: 3, y: 3 }, 500, true, true)).toEqual({ x: 0, y: 0 });
    expect(flowAt([conveyor], { x: 3, y: 3 }, 500, true, true)).toEqual({ x: 60, y: 0 });
  });
  it('conserve la vitesse volontaire du joueur et respecte les collisions', () => {
    const body = { x: TILE * 2.5, y: TILE * 3.5, vx: -100, vy: 0, radius: TILE * 0.34 };
    const original = body.x;
    displaceByFlow(body, { x: 60, y: 0 }, 50, () => false);
    expect(body.x).toBeGreaterThan(original);
    expect(body.vx).toBe(-100);
    for (let i = 0; i < 300; i++) displaceByFlow(body, { x: 60, y: 0 }, 50, (x) => x >= 4);
    expect(body.x + body.radius).toBeLessThanOrEqual(TILE * 4 + 0.01);
  });
});
