import type { MapDefinition } from './mapTypes';

/**
 * CARTE 3 - LE TEMPLE OUBLIE (la plus difficile)
 * Mecaniques : dalles piegees, zones toxiques cycliques, dalles-mecanismes
 * qui ouvrent la chambre de la relique centrale, passages secrets,
 * gardien final en quatre phases.
 */
export const TEMPLE: MapDefinition = {
  id: 'temple',
  index: 2,
  name: 'Le Temple Oublie',
  tagline: 'Ruines envahies par les racines',
  theme: 'temple',
  bossKind: 'gardien',
  bossName: 'LE GARDIEN',
  bossHp: 9,
  propKind: 'relic',
  orderedProps: false,
  secretCount: 2,
  parTimeMs: 8 * 60 * 1000,
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
    '#..b.b..#..b.b..#.......#',
    '#########################',
  ],
  intro: [
    'Les dalles a triangle dore sont piegees : elles frappent une seconde apres le contact.',
    'Les zones toxiques respirent par cycles. Le pointille clair indique la montee.',
    'Les trois dalles-mecanismes (triangle large) ouvrent la chambre de la relique centrale.',
    'Reunissez les 3 reliques pour deverrouiller la salle du Gardien. Il n\'est vulnerable que les yeux ouverts.',
  ],
  objectives: [
    { id: 'props', label: 'Reliques reunies', mandatory: true, total: 3 },
    { id: 'boss', label: 'Vaincre le Gardien', mandatory: true, total: 1 },
    { id: 'exit', label: 'Rejoindre la sortie', mandatory: true, total: 1 },
    { id: 'mechanism', label: 'Dalles-mecanismes enclenchees', mandatory: false, total: 3 },
    { id: 'secrets', label: 'Passages secrets decouverts', mandatory: false, total: 2 },
    { id: 'kills', label: 'Eliminer 10 ennemis', mandatory: false, total: 10 },
    { id: 'flawless', label: 'Terminer sans perdre une seule vie', mandatory: false, total: 1 },
  ],
  // Maximum theorique ~15700 : la carte la plus exigeante du jeu.
  rankScores: { C: 0, B: 6000, A: 8600, S: 11200, SS: 13200, SSS: 14700 },
  toxic: [
    { group: 1, periodMs: 6800, warnMs: 1400, activeMs: 2200, offsetMs: 0 },
    { group: 2, periodMs: 8200, warnMs: 1500, activeMs: 2600, offsetMs: 2700 },
    { group: 3, periodMs: 7400, warnMs: 1300, activeMs: 2400, offsetMs: 5200 },
  ],
};
