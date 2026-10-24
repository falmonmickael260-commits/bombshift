import { ICE } from './level2';
import type { MapDefinition, MapId } from './mapTypes';
import { TEMPLE } from './level3';
import { VOLCANO } from './level1';
import { VOLCANO_II } from './level4';
import { ICE_II } from './level5';
import { TEMPLE_II } from './level6';
import { VOLCANO_III } from './level7';
import { ICE_III } from './level8';
import { TEMPLE_III } from './level9';

export const MAPS: readonly MapDefinition[] = [
  VOLCANO,
  ICE,
  TEMPLE,
  VOLCANO_II,
  ICE_II,
  TEMPLE_II,
  VOLCANO_III,
  ICE_III,
  TEMPLE_III,
];

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
