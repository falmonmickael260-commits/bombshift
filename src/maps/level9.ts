import type { MapDefinition } from './mapTypes';

/**
 * CARTE 9 - LE DERNIER AUTEL (temple, la carte la plus difficile du jeu)
 * Zones toxiques plus rapides et une garde complete : le defi final.
 */
export const TEMPLE_III: MapDefinition = {
  id: 'temple3',
  index: 8,
  name: 'Le Dernier Autel',
  tagline: 'Le sanctuaire le plus profond, jamais atteint',
  difficulty: 'difficile',
  theme: 'temple',
  bossKind: 'gardien',
  bossName: 'LE GARDIEN',
  bossHp: 10,
  propKind: 'relic',
  orderedProps: false,
  secretCount: 2,
  parTimeMs: 8.5 * 60 * 1000,
  rows: [
    '#########################',
    '#@..b..b#b..X..b#b..b..b#',
    '#.bP.b..#.X.b.X.#.b.g3b.#',
    '#..b.P.b.b.QX..b#b..b..b#',
    '#b.b..b+#.X.c.X...b.b.g.#',
    '#..P.b.b*b..X..b#b..X..b#',
    '#b..b.P.#.X.bQX.#.bQb.b.#',
    '#..b...b#b..X.cb#b.f.b.b#',
    '#w.b.b..#..b.b..#..b.b..#',
    '####*#######.#######=####',
    '#..b.b.+#..b.b..#.......#',
    '#.b...b.#.b...b.#..b.b..#',
    '#b..h..b...b.b..#.......#',
    '#.b.P.b.##-----##...!...#',
    '#..b.b..#b.X2X.b#.......#',
    '#.P...P.#..b.b..#..b.b..#',
    '#b.1.g.b#..c.w..#....E..#',
    '#..b.b..#..b.b..#h......#',
    '#########################',
  ],
  intro: [
    'Les dalles a triangle dore sont piegees : elles frappent une seconde apres le contact.',
    'Les zones toxiques respirent par cycles plus serres qu\'ailleurs : restez en mouvement.',
    'Les trois dalles-mecanismes (triangle large) ouvrent la chambre de la relique centrale.',
    'Reunissez les 3 reliques pour deverrouiller la salle du Gardien. C\'est le defi final de BOMBSHIFT.',
  ],
  objectives: [
    { id: 'props', label: 'Reliques reunies', mandatory: true, total: 3 },
    { id: 'boss', label: 'Vaincre le Gardien', mandatory: true, total: 1 },
    { id: 'exit', label: 'Rejoindre la sortie', mandatory: true, total: 1 },
    { id: 'mechanism', label: 'Dalles-mecanismes enclenchees', mandatory: false, total: 3 },
    { id: 'secrets', label: 'Passages secrets decouverts', mandatory: false, total: 2 },
    { id: 'kills', label: 'Eliminer 11 ennemis', mandatory: false, total: 11 },
    { id: 'flawless', label: 'Terminer sans perdre une seule vie', mandatory: false, total: 1 },
  ],
  rankScores: { C: 0, B: 6300, A: 8900, S: 11500, SS: 13500, SSS: 15000 },
  toxic: [
    { group: 1, periodMs: 5600, warnMs: 1100, activeMs: 2000, offsetMs: 0 },
    { group: 2, periodMs: 6800, warnMs: 1200, activeMs: 2300, offsetMs: 2200 },
    { group: 3, periodMs: 6000, warnMs: 1000, activeMs: 2100, offsetMs: 4200 },
  ],
};
