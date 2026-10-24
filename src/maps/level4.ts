import type { MapDefinition } from './mapTypes';

/**
 * CARTE 4 - LA CALDEIRA OUBLIEE (variante facile du volcan)
 * Reprend les mecaniques du volcan avec moins de lave et sans events :
 * une bonne carte pour s'entrainer avant d'affronter la version complete.
 */
export const VOLCANO_II: MapDefinition = {
  id: 'volcano2',
  index: 3,
  name: 'La Caldeira Oubliee',
  tagline: 'Un foyer volcanique endormi, presque calme',
  difficulty: 'facile',
  theme: 'volcano',
  bossKind: 'magmaron',
  bossName: 'MAGMARON',
  bossHp: 5,
  propKind: 'valve',
  orderedProps: true,
  secretCount: 2,
  parTimeMs: 4.5 * 60 * 1000,
  rows: [
    '#########################',
    '#@..b..b#...b..#b..b..b.#',
    '#.bb.bp.#b..b.b#.b2..b.b#',
    '#..b...b....b..#b.#..g..#',
    '#b.bbb.b#.b...b#.b#b.bb.#',
    '#..p..b.#b..........b..b#',
    '#b..b.b.#..LL.b#.b.b..b.#',
    '###*.####.bLL.b#b..b..fb#',
    '#.+..b..#c.LL.b#bb..b..b#',
    '#.b.b.b.#b.....##########',
    '#..b..pb#..b3..#....b...#',
    '#b.b.b..#.b...b#.b..b..b#',
    '#..b..........b#..b.....#',
    '#.b..b..#b.....=....!...#',
    '#.b.b.b.#.b...b#..b.....#',
    '#.1..b.c#.....b#.b..b..b#',
    '#gb.b.bw*b..b..#....b..E#',
    '#..b..b.#..+b..#........#',
    '#########################',
  ],
  intro: [
    'La caldeira s\'est en grande partie refroidie : il ne reste qu\'un petit foyer de lave.',
    'La lave tue au contact : elle ne se traverse jamais.',
    'Activez les trois valves thermiques DANS L\'ORDRE 1, 2, 3 pour ouvrir la grille du boss.',
    'Une bonne occasion de prendre vos marques avant la forteresse volcanique complete.',
  ],
  objectives: [
    { id: 'props', label: 'Valves thermiques activees (ordre impose)', mandatory: true, total: 3 },
    { id: 'boss', label: 'Vaincre Magmaron', mandatory: true, total: 1 },
    { id: 'exit', label: 'Rejoindre la sortie', mandatory: true, total: 1 },
    { id: 'secrets', label: 'Passages secrets decouverts', mandatory: false, total: 2 },
    { id: 'kills', label: 'Eliminer 6 ennemis', mandatory: false, total: 6 },
    { id: 'flawless', label: 'Terminer sans perdre une seule vie', mandatory: false, total: 1 },
  ],
  rankScores: { C: 0, B: 5000, A: 7300, S: 9700, SS: 11500, SSS: 13000 },
};
