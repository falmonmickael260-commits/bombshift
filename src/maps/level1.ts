import type { MapDefinition } from './mapTypes';

/**
 * CARTE 1 - LA FORTERESSE VOLCANIQUE
 * Mecaniques : lave permanente, events eruptifs cycliques, coulee progressive,
 * trois valves thermiques a activer dans l'ordre, boss Magmaron en trois phases.
 */
export const VOLCANO: MapDefinition = {
  id: 'volcano',
  index: 0,
  name: 'La Forteresse Volcanique',
  tagline: 'Forteresse batie dans un volcan actif',
  theme: 'volcano',
  bossKind: 'magmaron',
  bossName: 'MAGMARON',
  bossHp: 6,
  propKind: 'valve',
  orderedProps: true,
  secretCount: 2,
  parTimeMs: 5 * 60 * 1000,
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
    '#..b..b.#..+b..#........#',
    '#########################',
  ],
  intro: [
    'La lave tue au contact : elle ne se traverse jamais.',
    'Les events de pierre s\'embrasent par cycles. Le cadre jaune annonce l\'eruption.',
    'Une coulee progresse pendant la partie et ferme certains chemins.',
    'Activez les trois valves thermiques DANS L\'ORDRE 1, 2, 3 pour ouvrir la grille du boss.',
  ],
  objectives: [
    { id: 'props', label: 'Valves thermiques activees (ordre impose)', mandatory: true, total: 3 },
    { id: 'boss', label: 'Vaincre Magmaron', mandatory: true, total: 1 },
    { id: 'exit', label: 'Rejoindre la sortie', mandatory: true, total: 1 },
    { id: 'secrets', label: 'Passages secrets decouverts', mandatory: false, total: 2 },
    { id: 'kills', label: 'Eliminer 8 ennemis', mandatory: false, total: 8 },
    { id: 'flawless', label: 'Terminer sans perdre une seule vie', mandatory: false, total: 1 },
  ],
  // Maximum theorique ~15100 : le rang SSS exige un sans-faute complet
  // (tous les ennemis, les 2 secrets, aucune vie perdue, sous le temps de reference).
  rankScores: { C: 0, B: 5500, A: 8000, S: 10500, SS: 12500, SSS: 14000 },
  vents: [
    { group: 1, periodMs: 5200, warnMs: 1100, activeMs: 1300, offsetMs: 0 },
    { group: 2, periodMs: 6400, warnMs: 1200, activeMs: 1500, offsetMs: 2600 },
  ],
  lavaFlow: {
    // Cases qui se remplissent de lave au fil de la partie : les itineraires changent.
    cells: [
      { x: 10, y: 6 },
      { x: 13, y: 7 },
      { x: 10, y: 13 },
      { x: 13, y: 14 },
      { x: 12, y: 2 },
    ],
    firstMs: 42000,
    intervalMs: 36000,
    warnMs: 4200,
  },
};
