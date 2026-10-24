import type { MapDefinition } from './mapTypes';

/**
 * CARTE 7 - LA CHAMBRE ARDENTE (volcan, difficulte normale accrue)
 * Reprend la forteresse volcanique avec sa lave et ses events au complet,
 * et une garde renforcee : le vrai test avant les cartes difficiles.
 */
export const VOLCANO_III: MapDefinition = {
  id: 'volcano3',
  index: 6,
  name: 'La Chambre Ardente',
  tagline: 'Le coeur du volcan, en pleine activite',
  difficulty: 'normal',
  theme: 'volcano',
  bossKind: 'magmaron',
  bossName: 'MAGMARON',
  bossHp: 7,
  propKind: 'valve',
  orderedProps: true,
  secretCount: 2,
  parTimeMs: 5.5 * 60 * 1000,
  rows: [
    '#########################',
    '#@..b..b#...b..#b..b..b.#',
    '#.bb.bp.#b..b.b#.b2..b.b#',
    '#..b...b....b..#b.#..g..#',
    '#b.bbb.b#.bLL.b#.b#b.bb.#',
    '#..p..b.#b.LL.......b..b#',
    '#b..b.b.#..LL.b#.bVb..b.#',
    '###*.####.bLL.b#b..b..fb#',
    '#.+..b..#c.LL.b#bb.hb..b#',
    '#.bVb.b.#b.....##########',
    '#..b..pb#..b3..#....b...#',
    '#bVb.b..#.bLL.b#.b..b..b#',
    '#..b.h.....LL.b#..b.....#',
    '#.b..b..#b.LL..=....!...#',
    '#Vb.b.b.#.bLL.b#..b.....#',
    '#.1..b.c#..LL.b#.b..b..b#',
    '#gb.b.bw*b..b.w#....b..E#',
    '#..b..b.#..+b..#.p......#',
    '#########################',
  ],
  intro: [
    'La lave tue au contact : elle ne se traverse jamais.',
    'Les events de pierre s\'embrasent par cycles, plus vite qu\'au premier passage. Le cadre jaune annonce l\'eruption.',
    'Activez les trois valves thermiques DANS L\'ORDRE 1, 2, 3 pour ouvrir la grille du boss.',
    'Magmaron est revenu plus fort : surveillez vos arrieres, la garnison a double.',
  ],
  objectives: [
    { id: 'props', label: 'Valves thermiques activees (ordre impose)', mandatory: true, total: 3 },
    { id: 'boss', label: 'Vaincre Magmaron', mandatory: true, total: 1 },
    { id: 'exit', label: 'Rejoindre la sortie', mandatory: true, total: 1 },
    { id: 'secrets', label: 'Passages secrets decouverts', mandatory: false, total: 2 },
    { id: 'kills', label: 'Eliminer 9 ennemis', mandatory: false, total: 9 },
    { id: 'flawless', label: 'Terminer sans perdre une seule vie', mandatory: false, total: 1 },
  ],
  rankScores: { C: 0, B: 5800, A: 8300, S: 10800, SS: 12800, SSS: 14200 },
  vents: [
    { group: 1, periodMs: 4600, warnMs: 1000, activeMs: 1400, offsetMs: 0 },
    { group: 2, periodMs: 5600, warnMs: 1100, activeMs: 1600, offsetMs: 2300 },
  ],
};
