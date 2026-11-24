import type { MapDefinition } from './mapTypes';
import { EXTENSION_IV } from './extension4';

/**
 * The second expedition (111-140). Each stage starts from a tested 81-110
 * encounter and rearranges its *traversable* interior with a deterministic
 * mixture of destructible barricades, ice and slowing ground. The original
 * campaign and its save IDs/layouts are never modified.
 *
 * Enclosed boss arenas, portals, exits, switches, objectives and spawn areas
 * stay untouched. Every layout is stable between reloads and multiplayer peers.
 */
const NAMES = [
  'Le Premier Éclat', 'Les Falaises de Brume', 'Les Dunes à Rebours',
  'Le Laboratoire Submergé', 'La Forge des Nuages', 'Les Ruines du Levant',
  'La Tempête d’Obsidienne', 'Le Pont des Échos', 'La Cité des Courants',
  'Le Miroir des Deux', 'Les Mines du Tonnerre', 'La Grotte des Écluses',
  'La Tour Foudroyée', 'Les Verrières du Désert', 'La Cale des Fantômes',
  'Les Îlots à Dérive', 'Le Labyrinthe des Aiguilles', 'Le Défilé des Automates',
  'Les Marches des Abysses', 'Le Reflet des Ombres', 'La Citadelle des Vents',
  'La Traversée Électrique', 'Le Tombeau des Engrenages', 'Les Canaux Oubliés',
  'Le Carnaval des Pièges', 'L’Orage des Sentinelles', 'Le Dernier Bastion',
  'La Danse des Portails', 'Le Crépuscule des Titans', 'Le Miroir Final',
] as const;

const TAGLINES = [
  'Des remparts et des couloirs glacés réclament un parcours précis.',
  'Des barrières mobiles forcent à contourner le danger.',
  'La roche cache des détours qu’il faut dégager à la bombe.',
  'La brume ralentit les pas à l’approche du gardien.',
  'Deux chemins croisent le cœur brûlant de l’arène.',
  'Les embranchements récompensent les explorateurs patients.',
] as const;

function buildEncounter(source: MapDefinition, i: number): MapDefinition {
  const index = 110 + i;
  const reserved = new Set<string>();
  const keep = (x: number, y: number) => reserved.add(x + ',' + y);
  const width = source.rows[0].length;
  const height = source.rows.length;
  const rows = source.rows.map(row => row.split(''));

  // Avoid all encounter markers and a two-tile safety margin around them.
  const protectedChars = new Set('@!E1234=-DdQ+*');
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (!protectedChars.has(rows[y][x])) continue;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) keep(x + dx, y + dy);
  }
  for (const portal of source.portals ?? []) {
    for (const point of [portal.a, portal.b]) {
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) keep(point.x + dx, point.y + dy);
    }
  }

  const candidates: { x: number; y: number; rank: number }[] = [];
  for (let y = 2; y < height - 2; y++) for (let x = 2; x < width - 2; x++) {
    if (rows[y][x] !== '.' || reserved.has(x + ',' + y)) continue;
    // Never barricade a corridor: blocks only at large open intersections.
    const open = [rows[y - 1][x], rows[y + 1][x], rows[y][x - 1], rows[y][x + 1]]
      .filter(c => c === '.' || c === 'm' || c === '~').length;
    if (open < 3) continue;
    const rank = ((x * 73856093) ^ (y * 19349663) ^ (index * 83492791)) >>> 0;
    candidates.push({ x, y, rank });
  }
  candidates.sort((a, b) => a.rank - b.rank);
  const changes = Math.min(candidates.length, 24 + i % 8);
  let barricades = 0;
  for (let j = 0; j < changes; j++) {
    const { x, y } = candidates[j];
    const nextToBlock = [rows[y - 1]?.[x], rows[y + 1]?.[x], rows[y][x - 1], rows[y][x + 1]].includes('b');
    // Destructible barriers stay sparse and can always be cleared using bombs.
    const block = (j + i) % 7 === 0 && !nextToBlock && barricades < 4;
    rows[y][x] = block ? 'b' : (j + i) % 3 === 0 ? '~' : 'm';
    if (block) barricades++;
  }
  return {
    ...source,
    id: 'level-' + (index + 1) as MapDefinition['id'],
    index,
    name: NAMES[i],
    tagline: TAGLINES[(i + Math.floor(i / 10)) % TAGLINES.length],
    mirrorControls: (index + 1) % 10 === 0,
    difficulty: 'difficile',
    bossHp: source.bossHp + 2 + Math.floor(i / 10),
    parTimeMs: source.parTimeMs + 60000,
    rows: rows.map(row => row.join('')),
    intro: [
      TAGLINES[(i + Math.floor(i / 10)) % TAGLINES.length],
      'De nouveaux passages glissants et ralentissants modifient les itinéraires.',
      ...source.intro.slice(1),
    ],
  };
}

export const EXTENSION_V: readonly MapDefinition[] =
  EXTENSION_IV.map((source, index) => buildEncounter(source, index));
