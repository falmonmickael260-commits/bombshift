import type { Vec2 } from '../core/types';
import type { MapDefinition } from '../maps/mapTypes';

const same = (a: Vec2, b: Vec2): boolean => a.x === b.x && a.y === b.y;

/** Travel happens on entry. The arrival pad stays latched until the player leaves. */
export class PortalController {
  private arrival: Vec2 | null = null;

  constructor(private readonly pairs: NonNullable<MapDefinition['portals']>) {}

  enter(cell: Vec2, safe: (destination: Vec2) => boolean): Vec2 | null {
    if (this.arrival && same(cell, this.arrival)) return null;
    this.arrival = null;
    for (const { a, b } of this.pairs) {
      const destination = same(cell, a) ? b : same(cell, b) ? a : null;
      if (!destination || !safe(destination)) continue;
      this.arrival = { ...destination };
      return { ...destination };
    }
    return null;
  }
}
