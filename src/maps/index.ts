import { ICE } from './level2';
import type { MapDefinition, MapId } from './mapTypes';
import { TEMPLE } from './level3';
import { VOLCANO } from './level1';

export const MAPS: readonly MapDefinition[] = [VOLCANO, ICE, TEMPLE];

export function getMap(id: MapId): MapDefinition {
  const m = MAPS.find((x) => x.id === id);
  if (!m) throw new Error(`carte inconnue: ${id}`);
  return m;
}

export function getMapByIndex(index: number): MapDefinition {
  return MAPS[Math.max(0, Math.min(MAPS.length - 1, index))];
}

export * from './mapTypes';
export { parseMap } from './parse';
