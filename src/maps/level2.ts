import type { MapDefinition } from './mapTypes';

/**
 * CARTE 2 - LE LABYRINTHE DE GLACE
 * Mecaniques : sols glissants (inertie), bombes qui derapent, portes temporisees
 * en deux groupes desynchronises, generateurs a alimenter par explosion,
 * boss Cryon qui exploite le glissement et les portes.
 */
export const ICE: MapDefinition = {
  id: 'ice',
  index: 1,
  name: 'Le Labyrinthe de Glace',
  tagline: 'Complexe gele aux cristaux lumineux',
  theme: 'ice',
  bossKind: 'cryon',
  bossName: 'CRYON',
  bossHp: 7,
  propKind: 'generator',
  orderedProps: false,
  secretCount: 2,
  slippery: true,
  parTimeMs: 6 * 60 * 1000,
  rows: [
    '#########################',
    '#@..b..~~..b#b..~~~~C2.b#',
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
    'Les portes bleues suivent deux cycles differents : observez avant de passer.',
    'Les cristaux sont indestructibles. Alimentez les 3 generateurs EN LES FAISANT EXPLOSER.',
  ],
  objectives: [
    { id: 'props', label: 'Generateurs alimentes par explosion', mandatory: true, total: 3 },
    { id: 'boss', label: 'Vaincre Cryon', mandatory: true, total: 1 },
    { id: 'exit', label: 'Rejoindre la sortie', mandatory: true, total: 1 },
    { id: 'secrets', label: 'Passages secrets decouverts', mandatory: false, total: 2 },
    { id: 'kills', label: 'Eliminer 8 ennemis', mandatory: false, total: 8 },
    { id: 'flawless', label: 'Terminer sans perdre une seule vie', mandatory: false, total: 1 },
  ],
  // Maximum theorique ~15000.
  rankScores: { C: 0, B: 5700, A: 8200, S: 10700, SS: 12700, SSS: 14100 },
  doors: [
    { group: 1, periodMs: 7200, closedRatio: 0.45, offsetMs: 0 },
    { group: 2, periodMs: 5600, closedRatio: 0.5, offsetMs: 2800 },
  ],
};
