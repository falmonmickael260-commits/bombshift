import type { MapDefinition } from './mapTypes';

/**
 * CARTE 8 - LE GLACIER INTERDIT (glace, difficile)
 * Portes plus rapides, un garde supplementaire : la glace devient hostile.
 */
export const ICE_III: MapDefinition = {
  id: 'ice3',
  index: 7,
  name: 'Le Glacier Interdit',
  tagline: 'Faille glaciaire que nul n\'a traversee',
  difficulty: 'difficile',
  theme: 'ice',
  bossKind: 'cryon',
  bossName: 'CRYON',
  bossHp: 8,
  propKind: 'generator',
  orderedProps: false,
  secretCount: 2,
  slippery: true,
  parTimeMs: 6.75 * 60 * 1000,
  rows: [
    '#########################',
    '#@..b..~~..b#b..~~~~C2fb#',
    '#..bb..~~.1.#.b~~c~~~~g.#',
    '#b..p.~~~~.b#~~~~C~~b~~~#',
    '#..b.~~Cb~~.D~~b~~~~~C~~#',
    '#b.b~~C..~~b#C~~~~b~~~~~#',
    '#.~~~~b.~~~.#~h~b~~~C~~b#',
    '#b~~C~~.b~~.*~~~~~~~~~~.#',
    '#.~~~~~w~~~b#b~~C~~f~~~b#',
    '##*##d###D########=######',
    '#~~~b~~~~~~b#~~~~~~~~~~~#',
    '#~cC~~~b~~~~#~~C~~~~~C~~#',
    '#b~~~~h~~C~~#~~~~~~~~~~~#',
    '#~~b~~~~~~~b#~~~~~!~~~~~#',
    '#~C~~~b~~f~~#~~~~~~~~~~~#',
    '#~~~~~~~C~~b#~~C~~~~~C~~#',
    '#b~~3~~g~~~~#~~~~~~~~~~~#',
    '#~~~~~b~~~c~#~~~~~~~~~E~#',
    '#########################',
  ],
  intro: [
    'La glace a de l\'inertie : relachez le joystick AVANT l\'obstacle.',
    'Une bombe posee sur la glace glisse jusqu\'au premier obstacle.',
    'Les portes bleues cyclent plus vite qu\'ailleurs : la fenetre de passage est courte.',
    'Les cristaux sont indestructibles. Alimentez les 3 generateurs EN LES FAISANT EXPLOSER.',
  ],
  objectives: [
    { id: 'props', label: 'Generateurs alimentes par explosion', mandatory: true, total: 3 },
    { id: 'boss', label: 'Vaincre Cryon', mandatory: true, total: 1 },
    { id: 'exit', label: 'Rejoindre la sortie', mandatory: true, total: 1 },
    { id: 'secrets', label: 'Passages secrets decouverts', mandatory: false, total: 2 },
    { id: 'kills', label: 'Eliminer 9 ennemis', mandatory: false, total: 9 },
    { id: 'flawless', label: 'Terminer sans perdre une seule vie', mandatory: false, total: 1 },
  ],
  rankScores: { C: 0, B: 6000, A: 8500, S: 11000, SS: 13000, SSS: 14400 },
  doors: [
    { group: 1, periodMs: 5600, closedRatio: 0.52, offsetMs: 0 },
    { group: 2, periodMs: 4600, closedRatio: 0.55, offsetMs: 2200 },
  ],
};
