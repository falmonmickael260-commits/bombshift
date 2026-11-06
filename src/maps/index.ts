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

// Temporary expedition pack. Each entry keeps the proven collision and
// objective layout of its source map while providing its own progression ID.
// World art and bespoke hazards are layered in follow-up map data.
const expedition = (source: MapDefinition, index: number, name: string, tagline: string, mirror = false): MapDefinition => ({
  ...source,
  id: `level-${index + 1}`,
  index,
  name,
  tagline,
  mirrorControls: mirror,
  bossHp: source.bossHp + Math.floor((index - 8) / 4),
});

const EXPEDITION: readonly MapDefinition[] = [
  expedition(ICE, 9, 'Le Passage Inversé', 'Des cristaux renvoient chaque mouvement', true),
  expedition(TEMPLE, 10, 'Lisière des Ruines', 'Les racines cachent un ancien passage'),
  expedition(ICE_II, 11, 'Les Bassins Suspendus', 'Traversez les clairières prises dans la brume'),
  expedition(TEMPLE_II, 12, 'Le Sanctuaire Englouti', 'Les dalles anciennes commandent les portes'),
  expedition(TEMPLE_III, 13, 'La Canopée des Échos', 'Les chemins toxiques isolent les reliques'),
  expedition(VOLCANO_II, 14, 'Les Fours de l’Atelier', 'Les portes alternent autour des machines'),
  expedition(VOLCANO, 15, 'La Ligne de Production', 'La lave impose un rythme aux couloirs'),
  expedition(ICE_III, 16, 'Les Presses de Fonte', 'Les zones actives se resserrent'),
  expedition(TEMPLE_III, 17, 'Le Noyau des Engrenages', 'Les dalles ouvrent la chambre centrale'),
  expedition(VOLCANO_III, 18, 'L’Usine en Surchauffe', 'Les valves maintiennent la grille ouverte'),
  expedition(ICE, 19, 'Le Miroir des Glaces', 'Commandes inversées sur sol glissant', true),
];

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
  ...EXPEDITION,
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
export { MIRROR_LEVELS, isMirrorLevel } from './mapTypes';
