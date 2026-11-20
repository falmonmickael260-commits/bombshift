import type { MapDefinition } from './mapTypes';

/** Encounters 81–110: fixed layouts, stable save IDs and mirror milestones. */
export const EXTENSION_IV: readonly MapDefinition[] = [
  {
    "id": "level-81",
    "index": 80,
    "name": "Les Récifs Interdits",
    "tagline": "Des couloirs de corail obligent à choisir le bon courant.",
    "difficulty": "difficile",
    "theme": "ocean",
    "bossKind": "gardien",
    "bossName": "LE KRAKEN DE NACRE",
    "bossHp": 14,
    "propKind": "relic",
    "orderedProps": true,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 720000,
    "rows": [
      "#################################",
      "#@.......................#......#",
      "#..+.....................#......#",
      "#.....p..b..Q........2...#......#",
      "#....b..gb......b.f......#......#",
      "#.#.X#################.D.#......#",
      "#..b....p................#......#",
      "#........b..#............#......#",
      "#..w.....b..#...b...X....#......#",
      "#.b.Q...X...#p..b........#......#",
      "#.####..#############.d#.#......#",
      "#.......wb...............#......#",
      "#.*..X..........b#c......=...!..#",
      "#.b........X....b#.......#......#",
      "#.bc........3h...#.......#......#",
      "#.#######b.#########..##.#......#",
      "#...............b........#......#",
      "#.b...#.......X...h......#......#",
      "#.b...#.c................#......#",
      "#..1..#..b......b....Q...#......#",
      "#.##########..########...#......#",
      "#.bg.........f...X.......#......#",
      "#......................*.#....E.#",
      "#........................#......#",
      "#################################"
    ],
    "intro": [
      "Des couloirs de corail obligent à choisir le bon courant.",
      "Ramassez les reliques dans l’ordre 1 → 2 → 3.",
      "Réunissez les trois reliques pour ouvrir la chambre du gardien.",
      "Marchez sur les trois consoles pour neutraliser les poussées.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire.",
      "Les anneaux de même lettre sont reliés. Sortez de l’anneau d’arrivée avant de le réutiliser."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Reliques réunies",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre LE KRAKEN DE NACRE",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "exit",
        "label": "Rejoindre la sortie",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "mechanism",
        "label": "Consoles activées",
        "mandatory": false,
        "total": 3
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 14 gardes",
        "mandatory": false,
        "total": 14
      },
      {
        "id": "flawless",
        "label": "Terminer sans perdre de vie",
        "mandatory": false,
        "total": 1
      }
    ],
    "rankScores": {
      "C": 0,
      "B": 6000,
      "A": 8500,
      "S": 11000,
      "SS": 13000,
      "SSS": 14500
    },
    "mechanismTrigger": "step",
    "doors": [
      {
        "group": 1,
        "periodMs": 7400,
        "closedRatio": 0.34,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 8000,
        "closedRatio": 0.34,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 5200
      }
    ],
    "portals": [
      {
        "a": {
          "x": 6,
          "y": 4
        },
        "b": {
          "x": 22,
          "y": 22
        }
      }
    ]
  },
  {
    "id": "level-82",
    "index": 81,
    "name": "Le Chenal des Épaves",
    "tagline": "Trois balises neutralisent les courants du chantier englouti.",
    "difficulty": "difficile",
    "theme": "ocean",
    "bossKind": "gardien",
    "bossName": "LE KRAKEN DE NACRE",
    "bossHp": 14,
    "propKind": "relic",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 720000,
    "rows": [
      "###################################",
      "#@.........................#......#",
      "#..+.......................#......#",
      "#.....b.....bQ.........2...#......#",
      "#....pXb..........f........#......#",
      "#.##b.#################.D#.#......#",
      "#..............b....bX.....#......#",
      "#.........p....#.......w...#......#",
      "#........Xb....#...b.......#......#",
      "#.....w..b....b#........X..#......#",
      "#.#####..#############.d##.#......#",
      "#..Qb..........p...........#......#",
      "#...................#.b....#......#",
      "#.*........hX....b.c#......=...!..#",
      "#......X.....3..b...#b.....#......#",
      "#.########..############...#......#",
      "#..c.......b....h..........#......#",
      "#.....b#.......X...........#......#",
      "#......#................b..#......#",
      "#....b.#c............g.....#......#",
      "#.###########..########b.#.#......#",
      "#............b...Xb........#......#",
      "#..1g.......#f.........Q...#......#",
      "#.......b...#..............#......#",
      "#...........#............*.#....E.#",
      "#..........................#......#",
      "###################################"
    ],
    "intro": [
      "Trois balises neutralisent les courants du chantier englouti.",
      "Réunissez les trois reliques pour ouvrir la chambre du gardien.",
      "Marchez sur les trois consoles pour neutraliser les poussées.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire.",
      "Les anneaux de même lettre sont reliés. Sortez de l’anneau d’arrivée avant de le réutiliser."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Reliques réunies",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre LE KRAKEN DE NACRE",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "exit",
        "label": "Rejoindre la sortie",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "mechanism",
        "label": "Consoles activées",
        "mandatory": false,
        "total": 3
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 14 gardes",
        "mandatory": false,
        "total": 14
      },
      {
        "id": "flawless",
        "label": "Terminer sans perdre de vie",
        "mandatory": false,
        "total": 1
      }
    ],
    "rankScores": {
      "C": 0,
      "B": 6000,
      "A": 8500,
      "S": 11000,
      "SS": 13000,
      "SSS": 14500
    },
    "mechanismTrigger": "step",
    "doors": [
      {
        "group": 1,
        "periodMs": 7388,
        "closedRatio": 0.34,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7988,
        "closedRatio": 0.34,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 23,
        "width": 23,
        "height": 2,
        "direction": "left",
        "kind": "current",
        "speed": 48,
        "affectsBombs": false,
        "stopsOnSwitches": true
      }
    ],
    "portals": [
      {
        "a": {
          "x": 3,
          "y": 6
        },
        "b": {
          "x": 24,
          "y": 24
        }
      }
    ]
  },
  {
    "id": "level-83",
    "index": 82,
    "name": "Les Docks du Kraken",
    "tagline": "Chargez les reliques des docks entre les deux cycles de marée.",
    "difficulty": "difficile",
    "theme": "ocean",
    "bossKind": "gardien",
    "bossName": "LE KRAKEN DE NACRE",
    "bossHp": 14,
    "propKind": "relic",
    "orderedProps": true,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 720000,
    "rows": [
      "#####################################",
      "#@...........................#......#",
      "#..+.........................#......#",
      "#.....bb....b.Q....g.....2...#......#",
      "#......p..b..f.b.............#......#",
      "#.###.X#################.D##.#......#",
      "#............b....f.....g....#......#",
      "#...............b.#..........#......#",
      "#..........bp.....#b..X......#......#",
      "#...Q.....X...b..b#....w.....#......#",
      "#.######..################.d.#......#",
      "#................p..b..b.....#......#",
      "#.*....................#.X...=...!..#",
      "#...w........X....b....#..b..#......#",
      "#.............3......bc#b....#......#",
      "#.#########..############..#.#......#",
      "#.b...X..h...................#......#",
      "#..c.b..#.......X............#......#",
      "#..b...b#................b...#......#",
      "#..1..b.#X....h..............#......#",
      "#.############..########.Q##.#......#",
      "#.......cb.........X.........#......#",
      "#..........................*.#....E.#",
      "#............................#......#",
      "#####################################"
    ],
    "intro": [
      "Chargez les reliques des docks entre les deux cycles de marée.",
      "Ramassez les reliques dans l’ordre 1 → 2 → 3.",
      "Réunissez les trois reliques pour ouvrir la chambre du gardien.",
      "Activez tous les totems par explosion.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire.",
      "Les anneaux de même lettre sont reliés. Sortez de l’anneau d’arrivée avant de le réutiliser."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Reliques réunies",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre LE KRAKEN DE NACRE",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "exit",
        "label": "Rejoindre la sortie",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "mechanism",
        "label": "Totems chargés",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 14 gardes",
        "mandatory": false,
        "total": 14
      },
      {
        "id": "flawless",
        "label": "Terminer sans perdre de vie",
        "mandatory": false,
        "total": 1
      }
    ],
    "rankScores": {
      "C": 0,
      "B": 6000,
      "A": 8500,
      "S": 11000,
      "SS": 13000,
      "SSS": 14500
    },
    "mechanismTrigger": "blast",
    "doors": [
      {
        "group": 1,
        "periodMs": 7376,
        "closedRatio": 0.34,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7976,
        "closedRatio": 0.34,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 21,
        "width": 25,
        "height": 2,
        "direction": "right",
        "kind": "current",
        "speed": 48,
        "affectsBombs": false,
        "stopsOnSwitches": true
      }
    ],
    "portals": [
      {
        "a": {
          "x": 5,
          "y": 4
        },
        "b": {
          "x": 26,
          "y": 22
        }
      }
    ]
  },
  {
    "id": "level-84",
    "index": 83,
    "name": "La Citadelle de Nacre",
    "tagline": "Les trois consoles protègent le passage vers le Kraken.",
    "difficulty": "difficile",
    "theme": "ocean",
    "bossKind": "gardien",
    "bossName": "LE KRAKEN DE NACRE",
    "bossHp": 14,
    "propKind": "relic",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 720000,
    "rows": [
      "###############################",
      "#@.....................#......#",
      "#..+...................#......#",
      "#.....b.b..Q..b....2...#......#",
      "#.......f..............#......#",
      "#.####.X############.D.#......#",
      "#..b.b...p.............#......#",
      "#......#.....w....b....#......#",
      "#.b....#..X.b..........#......#",
      "#......#...X..pb..w....#......#",
      "#.#######b.########.d#.#......#",
      "#...........b..........#......#",
      "#...Q.b.....#......p...#......#",
      "#....h......#.X....b...#......#",
      "#.*b..c.....#...b......=...!..#",
      "#.##########..####..##.#......#",
      "#.........h3.....X.b...#......#",
      "#............b...#.....#......#",
      "#......b...c.....#.....#......#",
      "#...b.....b....g.#.....#......#",
      "#.#############..###X..#......#",
      "#......b........c...b..#......#",
      "#.......#...........g..#......#",
      "#..f....#.....b........#......#",
      "#..1....#........b.Q...#......#",
      "#......X...b...........#......#",
      "#....................*.#....E.#",
      "#......................#......#",
      "###############################"
    ],
    "intro": [
      "Les trois consoles protègent le passage vers le Kraken.",
      "Réunissez les trois reliques pour ouvrir la chambre du gardien.",
      "Activez tous les totems par explosion.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire.",
      "Les anneaux de même lettre sont reliés. Sortez de l’anneau d’arrivée avant de le réutiliser."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Reliques réunies",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre LE KRAKEN DE NACRE",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "exit",
        "label": "Rejoindre la sortie",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "mechanism",
        "label": "Totems chargés",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 14 gardes",
        "mandatory": false,
        "total": 14
      },
      {
        "id": "flawless",
        "label": "Terminer sans perdre de vie",
        "mandatory": false,
        "total": 1
      }
    ],
    "rankScores": {
      "C": 0,
      "B": 6000,
      "A": 8500,
      "S": 11000,
      "SS": 13000,
      "SSS": 14500
    },
    "mechanismTrigger": "blast",
    "doors": [
      {
        "group": 1,
        "periodMs": 7364,
        "closedRatio": 0.34,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7964,
        "closedRatio": 0.34,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 25,
        "width": 19,
        "height": 2,
        "direction": "left",
        "kind": "current",
        "speed": 48,
        "affectsBombs": false,
        "stopsOnSwitches": true
      }
    ],
    "portals": [
      {
        "a": {
          "x": 5,
          "y": 4
        },
        "b": {
          "x": 20,
          "y": 26
        }
      }
    ]
  },
  {
    "id": "level-85",
    "index": 84,
    "name": "Les Marches de l’Obélisque",
    "tagline": "Contournez les terrasses de sable et collectez les reliques dans l’ordre.",
    "difficulty": "difficile",
    "theme": "desert",
    "bossKind": "gardien",
    "bossName": "LE ROI DU SOLEIL NOIR",
    "bossHp": 14,
    "propKind": "relic",
    "orderedProps": true,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 720000,
    "rows": [
      "###################################",
      "#@.........................#......#",
      "#..+.......................#......#",
      "#.....b......Qc........2b..#......#",
      "#....gb..X.b....b..........#......#",
      "#.#####..##############.D#.#......#",
      "#..................f.b.....#......#",
      "#..b..#....p...............#......#",
      "#.....#.b.g..b..........X..#......#",
      "#...Q.#.....Xb..p.b....bf..#......#",
      "#.########..##########.d##.#......#",
      "#....b.X...................#......#",
      "#.*....w..b#...X...........=...!..#",
      "#..........#...b....bp.....#......#",
      "#.b....b...#w3......b......#......#",
      "#.###########..#########...#......#",
      "#...c.....X.b..............#......#",
      "#...............#bX........#......#",
      "#...b....b......#h....b....#......#",
      "#..1.....c....b.#..........#......#",
      "#.##############..#####Q.#.#......#",
      "#..................b.Xh....#......#",
      "#........................*.#....E.#",
      "#..........................#......#",
      "###################################"
    ],
    "intro": [
      "Contournez les terrasses de sable et collectez les reliques dans l’ordre.",
      "Ramassez les reliques dans l’ordre 1 → 2 → 3.",
      "Réunissez les trois reliques pour ouvrir la chambre du gardien.",
      "Marchez sur les trois consoles pour neutraliser les poussées.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Reliques réunies",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre LE ROI DU SOLEIL NOIR",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "exit",
        "label": "Rejoindre la sortie",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "mechanism",
        "label": "Consoles activées",
        "mandatory": false,
        "total": 3
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 14 gardes",
        "mandatory": false,
        "total": 14
      },
      {
        "id": "flawless",
        "label": "Terminer sans perdre de vie",
        "mandatory": false,
        "total": 1
      }
    ],
    "rankScores": {
      "C": 0,
      "B": 6000,
      "A": 8500,
      "S": 11000,
      "SS": 13000,
      "SSS": 14500
    },
    "mechanismTrigger": "step",
    "doors": [
      {
        "group": 1,
        "periodMs": 7352,
        "closedRatio": 0.34,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7952,
        "closedRatio": 0.34,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 5200
      }
    ]
  },
  {
    "id": "level-86",
    "index": 85,
    "name": "La Caravane Disparue",
    "tagline": "Les vents croisent les voies de la caravane : cherchez les abris.",
    "difficulty": "difficile",
    "theme": "desert",
    "bossKind": "gardien",
    "bossName": "LE ROI DU SOLEIL NOIR",
    "bossHp": 14,
    "propKind": "relic",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 720000,
    "rows": [
      "#################################",
      "#@.......................#......#",
      "#..+.....................#......#",
      "#.....bb....Q........2...#......#",
      "#.........X...b...g..b...#......#",
      "#.######..##########.D##.#......#",
      "#..f..Xb.................#......#",
      "#..........#.........b...#......#",
      "#.......f..#.pb..........#......#",
      "#......b..X#.X.......b...#......#",
      "#.#########..#########.d.#......#",
      "#...Q........wb...p......#......#",
      "#......b........#........#......#",
      "#.*............X#....b...=...!..#",
      "#..p...b....3Xb.#.w......#......#",
      "#.############..#####..#.#......#",
      "#....................b...#......#",
      "#..h.#..c.....b....X.....#......#",
      "#....#.b........X........#......#",
      "#....#..h....cb......b...#......#",
      "#.###############..#..##.#......#",
      "#......b.............QX..#......#",
      "#..1......#..........b...#......#",
      "#.........#..gb...c......#......#",
      "#.........#............*.#....E.#",
      "#........................#......#",
      "#################################"
    ],
    "intro": [
      "Les vents croisent les voies de la caravane : cherchez les abris.",
      "Réunissez les trois reliques pour ouvrir la chambre du gardien.",
      "Marchez sur les trois consoles pour neutraliser les poussées.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Reliques réunies",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre LE ROI DU SOLEIL NOIR",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "exit",
        "label": "Rejoindre la sortie",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "mechanism",
        "label": "Consoles activées",
        "mandatory": false,
        "total": 3
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 14 gardes",
        "mandatory": false,
        "total": 14
      },
      {
        "id": "flawless",
        "label": "Terminer sans perdre de vie",
        "mandatory": false,
        "total": 1
      }
    ],
    "rankScores": {
      "C": 0,
      "B": 6000,
      "A": 8500,
      "S": 11000,
      "SS": 13000,
      "SSS": 14500
    },
    "mechanismTrigger": "step",
    "doors": [
      {
        "group": 1,
        "periodMs": 7340,
        "closedRatio": 0.34,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7940,
        "closedRatio": 0.34,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 23,
        "width": 21,
        "height": 2,
        "direction": "left",
        "kind": "wind",
        "speed": 48,
        "affectsBombs": false,
        "stopsOnSwitches": true
      }
    ]
  },
  {
    "id": "level-87",
    "index": 86,
    "name": "Le Sablier des Rois",
    "tagline": "Déclenchez les sceaux entre les rafales et les portes cycliques.",
    "difficulty": "difficile",
    "theme": "desert",
    "bossKind": "gardien",
    "bossName": "LE ROI DU SOLEIL NOIR",
    "bossHp": 14,
    "propKind": "relic",
    "orderedProps": true,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 720000,
    "rows": [
      "###################################",
      "#@.........................#......#",
      "#..+.......................#......#",
      "#.....b.b....Q.........2...#......#",
      "#....h.....X.b....c........#......#",
      "#.#######..#############.D.#......#",
      "#.................b....b...#......#",
      "#....b...g..#..............#......#",
      "#.....X...b.#.Xb.......f...#......#",
      "#.b.Q.......#.gp....b......#......#",
      "#.##########..#########.d#.#......#",
      "#.....fb...................#......#",
      "#.*......X..b....#..p......=...!..#",
      "#...............b#X...b....#......#",
      "#..pb....b.w.3...#.........#......#",
      "#.#############..#####..##.#......#",
      "#.............b............#......#",
      "#...............w..bX.#....#......#",
      "#.....b.c.............#.b..#......#",
      "#..1.......b....b....h#Q...#......#",
      "#.################..####...#......#",
      "#............c.......b.X...#......#",
      "#........................*.#....E.#",
      "#..........................#......#",
      "###################################"
    ],
    "intro": [
      "Déclenchez les sceaux entre les rafales et les portes cycliques.",
      "Ramassez les reliques dans l’ordre 1 → 2 → 3.",
      "Réunissez les trois reliques pour ouvrir la chambre du gardien.",
      "Activez tous les totems par explosion.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Reliques réunies",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre LE ROI DU SOLEIL NOIR",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "exit",
        "label": "Rejoindre la sortie",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "mechanism",
        "label": "Totems chargés",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 14 gardes",
        "mandatory": false,
        "total": 14
      },
      {
        "id": "flawless",
        "label": "Terminer sans perdre de vie",
        "mandatory": false,
        "total": 1
      }
    ],
    "rankScores": {
      "C": 0,
      "B": 6000,
      "A": 8500,
      "S": 11000,
      "SS": 13000,
      "SSS": 14500
    },
    "mechanismTrigger": "blast",
    "doors": [
      {
        "group": 1,
        "periodMs": 7328,
        "closedRatio": 0.34,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7928,
        "closedRatio": 0.34,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 21,
        "width": 23,
        "height": 2,
        "direction": "right",
        "kind": "wind",
        "speed": 48,
        "affectsBombs": false,
        "stopsOnSwitches": true
      }
    ]
  },
  {
    "id": "level-88",
    "index": 87,
    "name": "Les Jardins de Quartz",
    "tagline": "Les couloirs de quartz réservent des poches sûres entre les dangers.",
    "difficulty": "difficile",
    "theme": "desert",
    "bossKind": "gardien",
    "bossName": "LE ROI DU SOLEIL NOIR",
    "bossHp": 14,
    "propKind": "relic",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 720000,
    "rows": [
      "#####################################",
      "#@...........................#......#",
      "#..+.........................#......#",
      "#........bg...Q.....b....2...#......#",
      "#......b....X......b...f.....#......#",
      "#.########..#############.D#.#......#",
      "#................b...........#......#",
      "#...b........#...............#......#",
      "#...f...X....#..b............#......#",
      "#............#bX.p........b..#......#",
      "#.###########..#########.d##.#......#",
      "#........w.X............b....#......#",
      "#...Q......b......#..........#......#",
      "#................X#...pb.....#......#",
      "#.*.....b.....w...#..b.......=...!..#",
      "#.##############..########...#......#",
      "#..p..b.......3..............#......#",
      "#.................bh.X.#.....#......#",
      "#....b.................#.....#......#",
      "#..b....c......b.......#h....#......#",
      "#.#################..####..#.#......#",
      "#............b..........X....#......#",
      "#.......#....c...........b...#......#",
      "#....g..#...b................#......#",
      "#..1....#.b..............Q...#......#",
      "#....X............c...b......#......#",
      "#..........................*.#....E.#",
      "#............................#......#",
      "#####################################"
    ],
    "intro": [
      "Les couloirs de quartz réservent des poches sûres entre les dangers.",
      "Réunissez les trois reliques pour ouvrir la chambre du gardien.",
      "Activez tous les totems par explosion.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Reliques réunies",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre LE ROI DU SOLEIL NOIR",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "exit",
        "label": "Rejoindre la sortie",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "mechanism",
        "label": "Totems chargés",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 14 gardes",
        "mandatory": false,
        "total": 14
      },
      {
        "id": "flawless",
        "label": "Terminer sans perdre de vie",
        "mandatory": false,
        "total": 1
      }
    ],
    "rankScores": {
      "C": 0,
      "B": 6000,
      "A": 8500,
      "S": 11000,
      "SS": 13000,
      "SSS": 14500
    },
    "mechanismTrigger": "blast",
    "doors": [
      {
        "group": 1,
        "periodMs": 7316,
        "closedRatio": 0.34,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7916,
        "closedRatio": 0.34,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 25,
        "width": 25,
        "height": 2,
        "direction": "left",
        "kind": "wind",
        "speed": 48,
        "affectsBombs": false,
        "stopsOnSwitches": true
      }
    ]
  },
  {
    "id": "level-89",
    "index": 88,
    "name": "Le Tombeau du Soleil Noir",
    "tagline": "Chargez les trois sceaux du tombeau pour ouvrir le dernier portail.",
    "difficulty": "difficile",
    "theme": "desert",
    "bossKind": "gardien",
    "bossName": "LE ROI DU SOLEIL NOIR",
    "bossHp": 14,
    "propKind": "relic",
    "orderedProps": true,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 720000,
    "rows": [
      "###############################",
      "#@.....................#......#",
      "#..+...................#......#",
      "#........bbQ...h...2...#......#",
      "#....c...b...X....bb...#......#",
      "#.#########..#####.D##.#......#",
      "#.......c.........b.h..#......#",
      "#......b#........b.....#......#",
      "#......b#...X...Xb.....#......#",
      "#...Q.bg#....f..b......#......#",
      "#.############..####.d.#......#",
      "#.....b........X...p...#......#",
      "#.*..b......g#.b.......=...!..#",
      "#....b.......#....fX...#......#",
      "#...b.p....3.#b........#......#",
      "#.###############....#.#......#",
      "#....w.......b....X....#......#",
      "#..b..X....pb.....#....#......#",
      "#...........b.....#....#......#",
      "#.b1.X....wb....c.#....#......#",
      "#.################.Q...#......#",
      "#........X..........b..#......#",
      "#....................*.#....E.#",
      "#......................#......#",
      "###############################"
    ],
    "intro": [
      "Chargez les trois sceaux du tombeau pour ouvrir le dernier portail.",
      "Ramassez les reliques dans l’ordre 1 → 2 → 3.",
      "Réunissez les trois reliques pour ouvrir la chambre du gardien.",
      "Marchez sur les trois consoles pour neutraliser les poussées.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Reliques réunies",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre LE ROI DU SOLEIL NOIR",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "exit",
        "label": "Rejoindre la sortie",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "mechanism",
        "label": "Consoles activées",
        "mandatory": false,
        "total": 3
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 14 gardes",
        "mandatory": false,
        "total": 14
      },
      {
        "id": "flawless",
        "label": "Terminer sans perdre de vie",
        "mandatory": false,
        "total": 1
      }
    ],
    "rankScores": {
      "C": 0,
      "B": 6000,
      "A": 8500,
      "S": 11000,
      "SS": 13000,
      "SSS": 14500
    },
    "mechanismTrigger": "step",
    "doors": [
      {
        "group": 1,
        "periodMs": 7304,
        "closedRatio": 0.34,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7904,
        "closedRatio": 0.34,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 5200
      }
    ]
  },
  {
    "id": "level-90",
    "index": 89,
    "name": "Le Miroir des Marées",
    "tagline": "Les deux axes sont inversés au milieu des courants opposés.",
    "difficulty": "difficile",
    "theme": "mirror",
    "bossKind": "cryon",
    "bossName": "LE GARDIEN DES ÉCHOS",
    "bossHp": 14,
    "propKind": "generator",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": true,
    "parTimeMs": 720000,
    "rows": [
      "###################################",
      "#@.........................#......#",
      "#..+.......................#......#",
      "#.........hb.Q.....cb..2...#......#",
      "#.........b...Xb...........#......#",
      "#.##########..##########.D.#......#",
      "#....b...X.....g........c..#......#",
      "#....................#.b...#......#",
      "#...b............Xb..#.....#......#",
      "#......f....X....b..g#b....#......#",
      "#.#############..######.d#.#......#",
      "#...Q.......b..............#......#",
      "#.b....b#...f........p.....#......#",
      "#.*.....#..b........X......=...!..#",
      "#...p.b.#....3...w......b..#......#",
      "#.################..##..##.#......#",
      "#..................b.......#......#",
      "#........b...#b........X...#......#",
      "#........p...#....b...w....#......#",
      "#.......b...b#.............#......#",
      "#.###################..#...#......#",
      "#..b.hX.......c............#......#",
      "#..1..............#..b.Q...#......#",
      "#.b..........Q..b.#........#......#",
      "#.................#......*.#....E.#",
      "#..........................#......#",
      "###################################"
    ],
    "intro": [
      "MONDE MIROIR : gauche ↔ droite et haut ↔ bas, au clavier comme au joystick. Les bombes restent normales.",
      "Les deux axes sont inversés au milieu des courants opposés.",
      "Chargez les trois noyaux par explosion.",
      "Activez tous les totems par explosion.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire.",
      "Les champs de gravité préviennent avant chaque poussée. Les consoles les désactivent.",
      "Les anneaux de même lettre sont reliés. Sortez de l’anneau d’arrivée avant de le réutiliser."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Noyaux chargés par explosion",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre LE GARDIEN DES ÉCHOS",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "exit",
        "label": "Rejoindre la sortie",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "mechanism",
        "label": "Totems chargés",
        "mandatory": true,
        "total": 4
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 14 gardes",
        "mandatory": false,
        "total": 14
      },
      {
        "id": "flawless",
        "label": "Terminer sans perdre de vie",
        "mandatory": false,
        "total": 1
      }
    ],
    "rankScores": {
      "C": 0,
      "B": 6000,
      "A": 8500,
      "S": 11000,
      "SS": 13000,
      "SSS": 14500
    },
    "mechanismTrigger": "blast",
    "doors": [
      {
        "group": 1,
        "periodMs": 7292,
        "closedRatio": 0.34,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7892,
        "closedRatio": 0.34,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 23,
        "width": 23,
        "height": 2,
        "direction": "left",
        "kind": "gravity",
        "speed": 48,
        "affectsBombs": false,
        "stopsOnSwitches": true,
        "periodMs": 8000,
        "warnMs": 1800,
        "activeMs": 2200
      }
    ],
    "portals": [
      {
        "a": {
          "x": 5,
          "y": 4
        },
        "b": {
          "x": 24,
          "y": 24
        }
      }
    ]
  },
  {
    "id": "level-91",
    "index": 90,
    "name": "Le Terminal Ionique",
    "tagline": "Quatorze sentinelles surveillent les chemins du terminal.",
    "difficulty": "difficile",
    "theme": "electric",
    "bossKind": "gardien",
    "bossName": "LA SENTINELLE IONIQUE",
    "bossHp": 15,
    "propKind": "generator",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 780000,
    "rows": [
      "#################################",
      "#@.......................#......#",
      "#..+.....................#......#",
      "#..........Qb.....cb.2...#......#",
      "#....b.........X...b.....#......#",
      "#.###########h.######.D#.#......#",
      "#..c........b............#......#",
      "#.........#........b.....#......#",
      "#....b....#.X.....hb.....#......#",
      "#...Qb..c.#.b.....X......#......#",
      "#.##############..##.d##.#......#",
      "#..g...........X...b.....#......#",
      "#.*..b......bf.#.........=...!..#",
      "#..p.b......b..#.....X...#......#",
      "#.......g...3..#..f......#......#",
      "#.#################b.#...#......#",
      "#....b..p.........X......#......#",
      "#.....X.....b.......#....#......#",
      "#..w........b.......#....#......#",
      "#..1.b.......p.....b#....#......#",
      "#.###################Q...#......#",
      "#.......wX..b............#......#",
      "#......................*.#....E.#",
      "#........................#......#",
      "#################################"
    ],
    "intro": [
      "Quatorze sentinelles surveillent les chemins du terminal.",
      "Chargez les trois noyaux par explosion.",
      "Activez tous les totems par explosion.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire.",
      "Les rubans transportent les personnages ET les bombes. Leur direction est dessinée au sol."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Noyaux chargés par explosion",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre LA SENTINELLE IONIQUE",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "exit",
        "label": "Rejoindre la sortie",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "mechanism",
        "label": "Totems chargés",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 14 gardes",
        "mandatory": false,
        "total": 14
      },
      {
        "id": "flawless",
        "label": "Terminer sans perdre de vie",
        "mandatory": false,
        "total": 1
      }
    ],
    "rankScores": {
      "C": 0,
      "B": 6000,
      "A": 8500,
      "S": 11000,
      "SS": 13000,
      "SSS": 14500
    },
    "mechanismTrigger": "blast",
    "doors": [
      {
        "group": 1,
        "periodMs": 7280,
        "closedRatio": 0.34,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7880,
        "closedRatio": 0.34,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 21,
        "width": 21,
        "height": 2,
        "direction": "right",
        "kind": "conveyor",
        "speed": 62,
        "affectsBombs": true,
        "stopsOnSwitches": true
      }
    ]
  },
  {
    "id": "level-92",
    "index": 91,
    "name": "Les Rails de Plasma",
    "tagline": "Les tapis déplacent aussi les bombes : anticipez leur trajectoire.",
    "difficulty": "difficile",
    "theme": "electric",
    "bossKind": "gardien",
    "bossName": "LA SENTINELLE IONIQUE",
    "bossHp": 15,
    "propKind": "generator",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 780000,
    "rows": [
      "###################################",
      "#@.........................#......#",
      "#..+.......................#......#",
      "#...........Qb.....b..c2...#......#",
      "#...............X..g.......#......#",
      "#.############..######.D##.#......#",
      "#..b..c.b..................#......#",
      "#........#....b.........g..#......#",
      "#........#....X.....b......#......#",
      "#..b.....#.f.......X.......#......#",
      "#.###############..#####.d.#......#",
      "#........b.....b...........#......#",
      "#...Q.........#.fX...b.....#......#",
      "#...b.........#.......X....#......#",
      "#.*p......b...#.b..........=...!..#",
      "#.##################.w#..#.#......#",
      "#....X.......3......X.b....#......#",
      "#....b..p..........#.......#......#",
      "#...w......b.......#.......#......#",
      "#............p...b.#.......#......#",
      "#.####################.b.#.#......#",
      "#.....b.Xh.................#......#",
      "#.....#.....b.....b........#......#",
      "#.....#...........c........#......#",
      "#..1..#.......h........Qb..#......#",
      "#......b...X...............#......#",
      "#........................*.#....E.#",
      "#..........................#......#",
      "###################################"
    ],
    "intro": [
      "Les tapis déplacent aussi les bombes : anticipez leur trajectoire.",
      "Chargez les trois noyaux par explosion.",
      "Activez tous les totems par explosion.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire.",
      "Les rubans transportent les personnages ET les bombes. Leur direction est dessinée au sol."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Noyaux chargés par explosion",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre LA SENTINELLE IONIQUE",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "exit",
        "label": "Rejoindre la sortie",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "mechanism",
        "label": "Totems chargés",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 14 gardes",
        "mandatory": false,
        "total": 14
      },
      {
        "id": "flawless",
        "label": "Terminer sans perdre de vie",
        "mandatory": false,
        "total": 1
      }
    ],
    "rankScores": {
      "C": 0,
      "B": 6000,
      "A": 8500,
      "S": 11000,
      "SS": 13000,
      "SSS": 14500
    },
    "mechanismTrigger": "blast",
    "doors": [
      {
        "group": 1,
        "periodMs": 7268,
        "closedRatio": 0.34,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7868,
        "closedRatio": 0.34,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 25,
        "width": 23,
        "height": 2,
        "direction": "left",
        "kind": "conveyor",
        "speed": 62,
        "affectsBombs": true,
        "stopsOnSwitches": true
      }
    ]
  },
  {
    "id": "level-93",
    "index": 92,
    "name": "Le Dépôt des Sentinelles",
    "tagline": "Chargez les circuits puis traversez les portes entre deux décharges.",
    "difficulty": "difficile",
    "theme": "electric",
    "bossKind": "gardien",
    "bossName": "LA SENTINELLE IONIQUE",
    "bossHp": 15,
    "propKind": "generator",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 780000,
    "rows": [
      "#####################################",
      "#@...........................#......#",
      "#..+.........................#......#",
      "#............Qb.......b..2...#......#",
      "#................bc.b...wb...#......#",
      "#.#############.X#########.D.#......#",
      "#......................b.....#......#",
      "#....h..#.................b..#......#",
      "#...b...#.X..........b.c.....#......#",
      "#.b.Q...#.h.........X...b....#......#",
      "#.################..#####.d#.#......#",
      "#...cb.......X...............#......#",
      "#.*.....b....#...............=...!..#",
      "#..b.......b.#.g.......X.....#......#",
      "#..p..b..f...#3..............#......#",
      "#.###################..#..##.#......#",
      "#........b..b.......g........#......#",
      "#.............fb..#.......X..#......#",
      "#.......p.b......b#..........#......#",
      "#..1.........b..b.#w.........#......#",
      "#.######################.Q...#......#",
      "#......X.....p.....b.........#......#",
      "#..........................*.#....E.#",
      "#............................#......#",
      "#####################################"
    ],
    "intro": [
      "Chargez les circuits puis traversez les portes entre deux décharges.",
      "Chargez les trois noyaux par explosion.",
      "Marchez sur les trois consoles pour neutraliser les poussées.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire.",
      "Les rubans transportent les personnages ET les bombes. Leur direction est dessinée au sol."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Noyaux chargés par explosion",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre LA SENTINELLE IONIQUE",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "exit",
        "label": "Rejoindre la sortie",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "mechanism",
        "label": "Consoles activées",
        "mandatory": false,
        "total": 3
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 14 gardes",
        "mandatory": false,
        "total": 14
      },
      {
        "id": "flawless",
        "label": "Terminer sans perdre de vie",
        "mandatory": false,
        "total": 1
      }
    ],
    "rankScores": {
      "C": 0,
      "B": 6000,
      "A": 8500,
      "S": 11000,
      "SS": 13000,
      "SSS": 14500
    },
    "mechanismTrigger": "step",
    "doors": [
      {
        "group": 1,
        "periodMs": 7256,
        "closedRatio": 0.34,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7856,
        "closedRatio": 0.34,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 5200
      }
    ]
  },
  {
    "id": "level-94",
    "index": 93,
    "name": "Le Réacteur Zéro",
    "tagline": "Les trois consoles arrêtent les tapis devant le réacteur.",
    "difficulty": "difficile",
    "theme": "electric",
    "bossKind": "gardien",
    "bossName": "LA SENTINELLE IONIQUE",
    "bossHp": 15,
    "propKind": "generator",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 780000,
    "rows": [
      "###############################",
      "#@.....................#......#",
      "#..+...................#......#",
      "#.........bQ...b...2...#......#",
      "#......hc..b......X.b..#......#",
      "#.##############..#.D#.#......#",
      "#..b........b....X.....#......#",
      "#........#..hc.........#......#",
      "#..b.....#.......b.....#......#",
      "#....X..b#.......gb.X..#......#",
      "#.################c.d#.#......#",
      "#...Q....b.............#......#",
      "#....b........#....b...#......#",
      "#.*.gf..X.b...#........=...!..#",
      "#.....bX...3..#b.......#......#",
      "#.##..##############...#......#",
      "#.........fp....b......#......#",
      "#....#.b...X...........#......#",
      "#....#......b....b.....#......#",
      "#..b.#.......b.wp......#......#",
      "#.#####..##########..#.#......#",
      "#..pb.........X........#......#",
      "#..1......#...b....Qw..#......#",
      "#....b....#............#......#",
      "#.........#..........*.#....E.#",
      "#......................#......#",
      "###############################"
    ],
    "intro": [
      "Les trois consoles arrêtent les tapis devant le réacteur.",
      "Chargez les trois noyaux par explosion.",
      "Marchez sur les trois consoles pour neutraliser les poussées.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire.",
      "Les rubans transportent les personnages ET les bombes. Leur direction est dessinée au sol."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Noyaux chargés par explosion",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre LA SENTINELLE IONIQUE",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "exit",
        "label": "Rejoindre la sortie",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "mechanism",
        "label": "Consoles activées",
        "mandatory": false,
        "total": 3
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 14 gardes",
        "mandatory": false,
        "total": 14
      },
      {
        "id": "flawless",
        "label": "Terminer sans perdre de vie",
        "mandatory": false,
        "total": 1
      }
    ],
    "rankScores": {
      "C": 0,
      "B": 6000,
      "A": 8500,
      "S": 11000,
      "SS": 13000,
      "SSS": 14500
    },
    "mechanismTrigger": "step",
    "doors": [
      {
        "group": 1,
        "periodMs": 7244,
        "closedRatio": 0.34,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7844,
        "closedRatio": 0.34,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 23,
        "width": 19,
        "height": 2,
        "direction": "left",
        "kind": "conveyor",
        "speed": 62,
        "affectsBombs": true,
        "stopsOnSwitches": true
      }
    ]
  },
  {
    "id": "level-95",
    "index": 94,
    "name": "Les Falaises du Zéphyr",
    "tagline": "Les vents traversent les terrasses : utilisez les murs comme abris.",
    "difficulty": "difficile",
    "theme": "sky",
    "bossKind": "cryon",
    "bossName": "LE MAÎTRE DES ALIZÉS",
    "bossHp": 15,
    "propKind": "relic",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 780000,
    "rows": [
      "###################################",
      "#@.........................#......#",
      "#..+.......................#......#",
      "#.....w....b.Q..b......2...#......#",
      "#...............b..p.b.....#......#",
      "#.###############.X###.D##.#......#",
      "#..b....b.w................#......#",
      "#............b....#.....c..#......#",
      "#.............X..b#....b...#......#",
      "#...Qb.c..b....h..#...Xb...#......#",
      "#.##################..##.d.#......#",
      "#..............b....b......#......#",
      "#.*..#...........X..h......=...!..#",
      "#.b.X#.b....c..............#......#",
      "#..g.#.b....b3...b.........#......#",
      "#.#####################..#.#......#",
      "#................f..X.b....#......#",
      "#...b...Xp#................#......#",
      "#.......gb#...b............#......#",
      "#..1......#...p....b..fQb..#......#",
      "#.##..################.X##.#......#",
      "#.....b....X...............#......#",
      "#........................*.#....E.#",
      "#..........................#......#",
      "###################################"
    ],
    "intro": [
      "Les vents traversent les terrasses : utilisez les murs comme abris.",
      "Réunissez les trois reliques pour ouvrir la chambre du gardien.",
      "Activez tous les totems par explosion.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Reliques réunies",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre LE MAÎTRE DES ALIZÉS",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "exit",
        "label": "Rejoindre la sortie",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "mechanism",
        "label": "Totems chargés",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 14 gardes",
        "mandatory": false,
        "total": 14
      },
      {
        "id": "flawless",
        "label": "Terminer sans perdre de vie",
        "mandatory": false,
        "total": 1
      }
    ],
    "rankScores": {
      "C": 0,
      "B": 6000,
      "A": 8500,
      "S": 11000,
      "SS": 13000,
      "SSS": 14500
    },
    "mechanismTrigger": "blast",
    "doors": [
      {
        "group": 1,
        "periodMs": 7232,
        "closedRatio": 0.34,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7832,
        "closedRatio": 0.34,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 21,
        "width": 23,
        "height": 2,
        "direction": "right",
        "kind": "wind",
        "speed": 48,
        "affectsBombs": false,
        "stopsOnSwitches": true
      }
    ]
  },
  {
    "id": "level-96",
    "index": 95,
    "name": "Les Voiles de l’Aube",
    "tagline": "Les trois consoles calment les couloirs de vent du sanctuaire.",
    "difficulty": "difficile",
    "theme": "sky",
    "bossKind": "cryon",
    "bossName": "LE MAÎTRE DES ALIZÉS",
    "bossHp": 15,
    "propKind": "relic",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 780000,
    "rows": [
      "#################################",
      "#@.......................#......#",
      "#..+.....................#......#",
      "#.........b.Q....b...2...#......#",
      "#.......c.b.........X....#......#",
      "#.################..##.D.#......#",
      "#..b....h................#......#",
      "#..b.....#...c...........#......#",
      "#..b.....#...g...b..X....#......#",
      "#....X...#.......bc......#......#",
      "#.###################.d#.#......#",
      "#.........b.......g......#......#",
      "#...Q.....b...#..........#......#",
      "#..f....X.b...#..........#......#",
      "#.*bb.........#..........=...!..#",
      "#.##..##############..##.#......#",
      "#.......f...3....b.......#......#",
      "#..........X.....b.#.....#......#",
      "#.........b..p...b.#.....#......#",
      "#.........b..w.....#.....#......#",
      "#.#####..#############...#......#",
      "#..b..........X...p......#......#",
      "#..b....#.........w......#......#",
      "#..p....#................#......#",
      "#..1....#........b...Q...#......#",
      "#..h............Xb.......#......#",
      "#......................*.#....E.#",
      "#........................#......#",
      "#################################"
    ],
    "intro": [
      "Les trois consoles calment les couloirs de vent du sanctuaire.",
      "Réunissez les trois reliques pour ouvrir la chambre du gardien.",
      "Activez tous les totems par explosion.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Reliques réunies",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre LE MAÎTRE DES ALIZÉS",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "exit",
        "label": "Rejoindre la sortie",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "mechanism",
        "label": "Totems chargés",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 14 gardes",
        "mandatory": false,
        "total": 14
      },
      {
        "id": "flawless",
        "label": "Terminer sans perdre de vie",
        "mandatory": false,
        "total": 1
      }
    ],
    "rankScores": {
      "C": 0,
      "B": 6000,
      "A": 8500,
      "S": 11000,
      "SS": 13000,
      "SSS": 14500
    },
    "mechanismTrigger": "blast",
    "doors": [
      {
        "group": 1,
        "periodMs": 7220,
        "closedRatio": 0.34,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7820,
        "closedRatio": 0.34,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 25,
        "width": 21,
        "height": 2,
        "direction": "left",
        "kind": "wind",
        "speed": 48,
        "affectsBombs": false,
        "stopsOnSwitches": true
      }
    ]
  },
  {
    "id": "level-97",
    "index": 96,
    "name": "Le Belvédère des Orages",
    "tagline": "Lisez les avertissements des orages avant de charger les sceaux.",
    "difficulty": "difficile",
    "theme": "sky",
    "bossKind": "cryon",
    "bossName": "LE MAÎTRE DES ALIZÉS",
    "bossHp": 15,
    "propKind": "relic",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 780000,
    "rows": [
      "###################################",
      "#@.........................#......#",
      "#..+.......................#......#",
      "#...........Qb...bp....2...#......#",
      "#....b...w...........X.b...#......#",
      "#.#################..##.D#.#......#",
      "#.........b............p...#......#",
      "#.....#........b...........#......#",
      "#.b...#.......w.X...b......#......#",
      "#...Qc#b....b...........X..#......#",
      "#.####################.d##.#......#",
      "#..........c.....b.h.......#......#",
      "#.*........#.......X..b....=...!..#",
      "#...b..X.b.#...............#......#",
      "#..........#.3b.c..b....h..#......#",
      "#.#..###################...#......#",
      "#.....................X.b..#......#",
      "#.....bg..X.....#..........#......#",
      "#..........b...b#....f.....#......#",
      "#..1........gp..#....b.....#......#",
      "#.####..###############Q.#.#......#",
      "#..bf...b....X.............#......#",
      "#........................*.#....E.#",
      "#..........................#......#",
      "###################################"
    ],
    "intro": [
      "Lisez les avertissements des orages avant de charger les sceaux.",
      "Réunissez les trois reliques pour ouvrir la chambre du gardien.",
      "Marchez sur les trois consoles pour neutraliser les poussées.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Reliques réunies",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre LE MAÎTRE DES ALIZÉS",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "exit",
        "label": "Rejoindre la sortie",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "mechanism",
        "label": "Consoles activées",
        "mandatory": false,
        "total": 3
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 14 gardes",
        "mandatory": false,
        "total": 14
      },
      {
        "id": "flawless",
        "label": "Terminer sans perdre de vie",
        "mandatory": false,
        "total": 1
      }
    ],
    "rankScores": {
      "C": 0,
      "B": 6000,
      "A": 8500,
      "S": 11000,
      "SS": 13000,
      "SSS": 14500
    },
    "mechanismTrigger": "step",
    "doors": [
      {
        "group": 1,
        "periodMs": 7208,
        "closedRatio": 0.34,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7808,
        "closedRatio": 0.34,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 5200
      }
    ]
  },
  {
    "id": "level-98",
    "index": 97,
    "name": "Le Palais des Alizés",
    "tagline": "Choisissez une voie entre les portes cycliques et les rafales.",
    "difficulty": "difficile",
    "theme": "sky",
    "bossKind": "cryon",
    "bossName": "LE MAÎTRE DES ALIZÉS",
    "bossHp": 15,
    "propKind": "relic",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 780000,
    "rows": [
      "#####################################",
      "#@...........................#......#",
      "#..+.........................#......#",
      "#.............Q.b..b.....2...#......#",
      "#.........w..b........Xp.....#......#",
      "#.##################..##.D##.#......#",
      "#......b..b....X.............#......#",
      "#...b..................#.....#......#",
      "#...c..........h......b#..b..#......#",
      "#................bX.b..#.X...#......#",
      "#.#####################..#.d.#......#",
      "#...Q....c....b.....h........#......#",
      "#.......#..b.................#......#",
      "#.*..bXb#.....c..............=...!..#",
      "#.b.....#.....3......X..bg...#......#",
      "#.#######################....#......#",
      "#....................b.......#......#",
      "#.....g..X...#....bf.........#......#",
      "#............#.b........X....#......#",
      "#........b...#...............#......#",
      "#.###.b#################f.##.#......#",
      "#..b........Xp...........Q...#......#",
      "#..1..............#......b...#......#",
      "#....w...........p#...b......#......#",
      "#.................#........*.#....E.#",
      "#............................#......#",
      "#####################################"
    ],
    "intro": [
      "Choisissez une voie entre les portes cycliques et les rafales.",
      "Réunissez les trois reliques pour ouvrir la chambre du gardien.",
      "Marchez sur les trois consoles pour neutraliser les poussées.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Reliques réunies",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre LE MAÎTRE DES ALIZÉS",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "exit",
        "label": "Rejoindre la sortie",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "mechanism",
        "label": "Consoles activées",
        "mandatory": false,
        "total": 3
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 14 gardes",
        "mandatory": false,
        "total": 14
      },
      {
        "id": "flawless",
        "label": "Terminer sans perdre de vie",
        "mandatory": false,
        "total": 1
      }
    ],
    "rankScores": {
      "C": 0,
      "B": 6000,
      "A": 8500,
      "S": 11000,
      "SS": 13000,
      "SSS": 14500
    },
    "mechanismTrigger": "step",
    "doors": [
      {
        "group": 1,
        "periodMs": 7196,
        "closedRatio": 0.34,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7796,
        "closedRatio": 0.34,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 23,
        "width": 25,
        "height": 2,
        "direction": "left",
        "kind": "wind",
        "speed": 48,
        "affectsBombs": false,
        "stopsOnSwitches": true
      }
    ]
  },
  {
    "id": "level-99",
    "index": 98,
    "name": "La Couronne des Tempêtes",
    "tagline": "Les consoles du palais doivent être chargées avant la sortie.",
    "difficulty": "difficile",
    "theme": "sky",
    "bossKind": "cryon",
    "bossName": "LE MAÎTRE DES ALIZÉS",
    "bossHp": 15,
    "propKind": "relic",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 780000,
    "rows": [
      "###############################",
      "#@.....................#......#",
      "#..+...................#......#",
      "#.........bQ..g....2bb.#......#",
      "#......Xp.b........bf..#......#",
      "#.#..###############.D.#......#",
      "#........b.............#......#",
      "#......wb.#.......b....#......#",
      "#.....X.b.#..p...b.....#......#",
      "#...Q....X#.w....b.....#......#",
      "#.####.b###########.d#.#......#",
      "#...............b.c....#......#",
      "#.*...b..X.....#.......=...!..#",
      "#....b.......Xb#bh.....#......#",
      "#....c.....3..b#.......#......#",
      "#.#######..#######..##.#......#",
      "#..bh..................#......#",
      "#..b..#...c..b..X......#......#",
      "#..b..#................#......#",
      "#.b1..#..g..b..f...Q...#......#",
      "#.##########..######...#......#",
      "#..p.......b.......X...#......#",
      "#....................*.#....E.#",
      "#......................#......#",
      "###############################"
    ],
    "intro": [
      "Les consoles du palais doivent être chargées avant la sortie.",
      "Réunissez les trois reliques pour ouvrir la chambre du gardien.",
      "Activez tous les totems par explosion.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Reliques réunies",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre LE MAÎTRE DES ALIZÉS",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "exit",
        "label": "Rejoindre la sortie",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "mechanism",
        "label": "Totems chargés",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 14 gardes",
        "mandatory": false,
        "total": 14
      },
      {
        "id": "flawless",
        "label": "Terminer sans perdre de vie",
        "mandatory": false,
        "total": 1
      }
    ],
    "rankScores": {
      "C": 0,
      "B": 6000,
      "A": 8500,
      "S": 11000,
      "SS": 13000,
      "SSS": 14500
    },
    "mechanismTrigger": "blast",
    "doors": [
      {
        "group": 1,
        "periodMs": 7184,
        "closedRatio": 0.34,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7784,
        "closedRatio": 0.34,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 21,
        "width": 19,
        "height": 2,
        "direction": "right",
        "kind": "wind",
        "speed": 48,
        "affectsBombs": false,
        "stopsOnSwitches": true
      }
    ]
  },
  {
    "id": "level-100",
    "index": 99,
    "name": "Le Miroir des Tempêtes",
    "tagline": "Les commandes inversées imposent un autre rythme sur les passerelles.",
    "difficulty": "difficile",
    "theme": "mirror",
    "bossKind": "cryon",
    "bossName": "LE GARDIEN DES ÉCHOS",
    "bossHp": 15,
    "propKind": "generator",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": true,
    "parTimeMs": 780000,
    "rows": [
      "###################################",
      "#@.........................#......#",
      "#..+.......................#......#",
      "#............Q......wbb2...#......#",
      "#....b.p..b.............X..#......#",
      "#.####################..D#.#......#",
      "#..h............b..........#......#",
      "#....b.........#......b....#......#",
      "#....b......c..#......X....#......#",
      "#......Xh..b...#.b.........#......#",
      "#.#..#################.d##.#......#",
      "#................c.....b...#......#",
      "#...QXb.....bg......#......#......#",
      "#.........X.b.....b.#......#......#",
      "#.*...............g.#.c....=...!..#",
      "#.####..################b..#......#",
      "#......b.....3.............#......#",
      "#....f.#....Xb.............#......#",
      "#......#...........b.......#......#",
      "#.b....#b..................#......#",
      "#.#######.f############..#.#......#",
      "#.............b.X..........#......#",
      "#...........#......pb......#......#",
      "#..b........#..w...........#......#",
      "#..1.....b..#..........Q...#......#",
      "#............Q.b...X....p..#......#",
      "#........................*.#....E.#",
      "#..........................#......#",
      "###################################"
    ],
    "intro": [
      "MONDE MIROIR : gauche ↔ droite et haut ↔ bas, au clavier comme au joystick. Les bombes restent normales.",
      "Les commandes inversées imposent un autre rythme sur les passerelles.",
      "Chargez les trois noyaux par explosion.",
      "Activez tous les totems par explosion.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire.",
      "Les champs de gravité préviennent avant chaque poussée. Les consoles les désactivent.",
      "Les anneaux de même lettre sont reliés. Sortez de l’anneau d’arrivée avant de le réutiliser."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Noyaux chargés par explosion",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre LE GARDIEN DES ÉCHOS",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "exit",
        "label": "Rejoindre la sortie",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "mechanism",
        "label": "Totems chargés",
        "mandatory": true,
        "total": 4
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 14 gardes",
        "mandatory": false,
        "total": 14
      },
      {
        "id": "flawless",
        "label": "Terminer sans perdre de vie",
        "mandatory": false,
        "total": 1
      }
    ],
    "rankScores": {
      "C": 0,
      "B": 6000,
      "A": 8500,
      "S": 11000,
      "SS": 13000,
      "SSS": 14500
    },
    "mechanismTrigger": "blast",
    "doors": [
      {
        "group": 1,
        "periodMs": 7172,
        "closedRatio": 0.34,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7772,
        "closedRatio": 0.34,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 25,
        "width": 23,
        "height": 2,
        "direction": "left",
        "kind": "gravity",
        "speed": 48,
        "affectsBombs": false,
        "stopsOnSwitches": true,
        "periodMs": 8000,
        "warnMs": 1800,
        "activeMs": 2200
      }
    ],
    "portals": [
      {
        "a": {
          "x": 6,
          "y": 4
        },
        "b": {
          "x": 24,
          "y": 26
        }
      }
    ]
  },
  {
    "id": "level-101",
    "index": 100,
    "name": "Les Ateliers du Pendule",
    "tagline": "Les tapis des ateliers se croisent entre les piliers de cuivre.",
    "difficulty": "difficile",
    "theme": "clockwork",
    "bossKind": "gardien",
    "bossName": "LE GARDIEN DU PENDULE",
    "bossHp": 16,
    "propKind": "generator",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 840000,
    "rows": [
      "#################################",
      "#@.......................#......#",
      "#..+.....................#......#",
      "#......bb...Qf.......2b..#......#",
      "#....p.Xg......b.........#......#",
      "#.#..###############.D##.#......#",
      "#.......p.........f...b..#......#",
      "#......b#................#......#",
      "#......b#......b......X..#......#",
      "#..wQ...#.X..p.b.........#......#",
      "#.####..##############bd.#......#",
      "#.......b................#......#",
      "#.*....Xw....#.b.........=...!..#",
      "#...........X#.b..c...b..#......#",
      "#.......b...3#........b..#......#",
      "#.#######..##########..#.#......#",
      "#..c......X..h.b.........#......#",
      "#...............X.#...b..#......#",
      "#.......b........h#...b..#......#",
      "#..1....c......b..#......#......#",
      "#.##########.X######.Q##.#......#",
      "#..g...............X..b..#......#",
      "#......................*.#....E.#",
      "#........................#......#",
      "#################################"
    ],
    "intro": [
      "Les tapis des ateliers se croisent entre les piliers de cuivre.",
      "Chargez les trois noyaux par explosion.",
      "Marchez sur les trois consoles pour neutraliser les poussées.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire.",
      "Les rubans transportent les personnages ET les bombes. Leur direction est dessinée au sol."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Noyaux chargés par explosion",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre LE GARDIEN DU PENDULE",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "exit",
        "label": "Rejoindre la sortie",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "mechanism",
        "label": "Consoles activées",
        "mandatory": false,
        "total": 3
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 14 gardes",
        "mandatory": false,
        "total": 14
      },
      {
        "id": "flawless",
        "label": "Terminer sans perdre de vie",
        "mandatory": false,
        "total": 1
      }
    ],
    "rankScores": {
      "C": 0,
      "B": 6000,
      "A": 8500,
      "S": 11000,
      "SS": 13000,
      "SSS": 14500
    },
    "mechanismTrigger": "step",
    "doors": [
      {
        "group": 1,
        "periodMs": 7160,
        "closedRatio": 0.34,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7760,
        "closedRatio": 0.34,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 5200
      }
    ]
  },
  {
    "id": "level-102",
    "index": 101,
    "name": "Les Rouages Sous Pression",
    "tagline": "Déplacez vos bombes avec les rubans, puis coupez les machines.",
    "difficulty": "difficile",
    "theme": "clockwork",
    "bossKind": "gardien",
    "bossName": "LE GARDIEN DU PENDULE",
    "bossHp": 16,
    "propKind": "generator",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 840000,
    "rows": [
      "###################################",
      "#@.........................#......#",
      "#..+.......................#......#",
      "#........b...Qf.......p2b..#......#",
      "#....bX...............b....#......#",
      "#.######################.D.#......#",
      "#.....p..........b.w.X.....#......#",
      "#...........b........#.....#......#",
      "#......b...b....b....#.....#......#",
      "#........X.p.........#..w..#......#",
      "#.###.b################Xd#.#......#",
      "#...Q...................b..#......#",
      "#......h#.......c..b.......#......#",
      "#.*.....#...X.b............=...!..#",
      "#.......#...h3....b..c.....#......#",
      "#.######..############..##.#......#",
      "#.......b....b.............#......#",
      "#..b.........#.X...........#......#",
      "#...c........#...g...b.....#......#",
      "#.b..........#......b......#......#",
      "#.#########..###########...#......#",
      "#........f.....b..X...g....#......#",
      "#..1......b.......#....Q...#......#",
      "#....b............#........#......#",
      "#.................#......*.#....E.#",
      "#..........................#......#",
      "###################################"
    ],
    "intro": [
      "Déplacez vos bombes avec les rubans, puis coupez les machines.",
      "Chargez les trois noyaux par explosion.",
      "Marchez sur les trois consoles pour neutraliser les poussées.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire.",
      "Les rubans transportent les personnages ET les bombes. Leur direction est dessinée au sol."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Noyaux chargés par explosion",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre LE GARDIEN DU PENDULE",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "exit",
        "label": "Rejoindre la sortie",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "mechanism",
        "label": "Consoles activées",
        "mandatory": false,
        "total": 3
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 14 gardes",
        "mandatory": false,
        "total": 14
      },
      {
        "id": "flawless",
        "label": "Terminer sans perdre de vie",
        "mandatory": false,
        "total": 1
      }
    ],
    "rankScores": {
      "C": 0,
      "B": 6000,
      "A": 8500,
      "S": 11000,
      "SS": 13000,
      "SSS": 14500
    },
    "mechanismTrigger": "step",
    "doors": [
      {
        "group": 1,
        "periodMs": 7148,
        "closedRatio": 0.34,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7748,
        "closedRatio": 0.34,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 23,
        "width": 23,
        "height": 2,
        "direction": "left",
        "kind": "conveyor",
        "speed": 62,
        "affectsBombs": true,
        "stopsOnSwitches": true
      }
    ]
  },
  {
    "id": "level-103",
    "index": 102,
    "name": "L’Horloge Sans Aiguilles",
    "tagline": "Chargez les trois mécanismes de l’horloge avant le gardien.",
    "difficulty": "difficile",
    "theme": "clockwork",
    "bossKind": "gardien",
    "bossName": "LE GARDIEN DU PENDULE",
    "bossHp": 16,
    "propKind": "generator",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 840000,
    "rows": [
      "#####################################",
      "#@...........................#......#",
      "#..+.........................#......#",
      "#......b......Q.........b2...#......#",
      "#....fX...bg.................#......#",
      "#.#######################.D#.#......#",
      "#..b.b..b..............p.....#......#",
      "#..........b....g.#..........#......#",
      "#.....b...f...b...#.X........#......#",
      "#...p...Xb..b.....#..........#......#",
      "#.##Q.##################.d##.#......#",
      "#.............bw.......X.....#......#",
      "#.*......p........b....#.....=...!..#",
      "#..........X.b.......b.#.....#......#",
      "#.............3.b..bw..#.....#......#",
      "#.#####..#################...#......#",
      "#.............c.......b..bX..#......#",
      "#.......#.....X..........h...#......#",
      "#..b....#..........cb........#......#",
      "#..1..h.#..............b.....#......#",
      "#.########..#############Qb#.#......#",
      "#...b............X......c....#......#",
      "#..........................*.#....E.#",
      "#............................#......#",
      "#####################################"
    ],
    "intro": [
      "Chargez les trois mécanismes de l’horloge avant le gardien.",
      "Chargez les trois noyaux par explosion.",
      "Activez tous les totems par explosion.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire.",
      "Les rubans transportent les personnages ET les bombes. Leur direction est dessinée au sol."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Noyaux chargés par explosion",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre LE GARDIEN DU PENDULE",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "exit",
        "label": "Rejoindre la sortie",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "mechanism",
        "label": "Totems chargés",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 14 gardes",
        "mandatory": false,
        "total": 14
      },
      {
        "id": "flawless",
        "label": "Terminer sans perdre de vie",
        "mandatory": false,
        "total": 1
      }
    ],
    "rankScores": {
      "C": 0,
      "B": 6000,
      "A": 8500,
      "S": 11000,
      "SS": 13000,
      "SSS": 14500
    },
    "mechanismTrigger": "blast",
    "doors": [
      {
        "group": 1,
        "periodMs": 7136,
        "closedRatio": 0.34,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7736,
        "closedRatio": 0.34,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 21,
        "width": 25,
        "height": 2,
        "direction": "right",
        "kind": "conveyor",
        "speed": 62,
        "affectsBombs": true,
        "stopsOnSwitches": true
      }
    ]
  },
  {
    "id": "level-104",
    "index": 103,
    "name": "La Forge des Secondes",
    "tagline": "Les portes se referment plus vite : gardez une voie de repli.",
    "difficulty": "difficile",
    "theme": "clockwork",
    "bossKind": "gardien",
    "bossName": "LE GARDIEN DU PENDULE",
    "bossHp": 16,
    "propKind": "generator",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 840000,
    "rows": [
      "###############################",
      "#@.....................#......#",
      "#..+...................#......#",
      "#.....b....Q.p.b...2...#......#",
      "#........b..X....w.....#......#",
      "#.######..########.D##.#......#",
      "#..b..b...........p....#......#",
      "#...w......#.......b...#......#",
      "#..b.......#.bX........#......#",
      "#....p...hb#...Xb......#......#",
      "#.#########..#######.d.#......#",
      "#............b.........#......#",
      "#...Q..b..c.....#X.....#......#",
      "#.............h.#.X.b..#......#",
      "#.*.b...........#b.....=...!..#",
      "#.############.c###.X#.#......#",
      "#..........3.......gb..#......#",
      "#....X.#......b........#......#",
      "#......#b...........c..#......#",
      "#....bg#...b...........#......#",
      "#.###############...##.#......#",
      "#......fbX.............#......#",
      "#.b.........#..........#......#",
      "#...........#..b.......#......#",
      "#..1.......f#.....bQ...#......#",
      "#..........Xb..........#......#",
      "#....................*.#....E.#",
      "#......................#......#",
      "###############################"
    ],
    "intro": [
      "Les portes se referment plus vite : gardez une voie de repli.",
      "Chargez les trois noyaux par explosion.",
      "Activez tous les totems par explosion.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire.",
      "Les rubans transportent les personnages ET les bombes. Leur direction est dessinée au sol."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Noyaux chargés par explosion",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre LE GARDIEN DU PENDULE",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "exit",
        "label": "Rejoindre la sortie",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "mechanism",
        "label": "Totems chargés",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 14 gardes",
        "mandatory": false,
        "total": 14
      },
      {
        "id": "flawless",
        "label": "Terminer sans perdre de vie",
        "mandatory": false,
        "total": 1
      }
    ],
    "rankScores": {
      "C": 0,
      "B": 6000,
      "A": 8500,
      "S": 11000,
      "SS": 13000,
      "SSS": 14500
    },
    "mechanismTrigger": "blast",
    "doors": [
      {
        "group": 1,
        "periodMs": 7124,
        "closedRatio": 0.34,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7724,
        "closedRatio": 0.34,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 25,
        "width": 19,
        "height": 2,
        "direction": "left",
        "kind": "conveyor",
        "speed": 62,
        "affectsBombs": true,
        "stopsOnSwitches": true
      }
    ]
  },
  {
    "id": "level-105",
    "index": 104,
    "name": "Le Vestibule des Murmures",
    "tagline": "Les lanternes des galeries révèlent une route vers les reliques.",
    "difficulty": "difficile",
    "theme": "haunted",
    "bossKind": "gardien",
    "bossName": "LE SEIGNEUR DE MINUIT",
    "bossHp": 16,
    "propKind": "relic",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 840000,
    "rows": [
      "###################################",
      "#@.........................#......#",
      "#..+.......................#......#",
      "#.....b......Q....h..b.2...#......#",
      "#....b..bXc..b.............#......#",
      "#.###..#################.D.#......#",
      "#.................b....g...#......#",
      "#...........#..f.......b...#......#",
      "#....b.p..b.#...........X..#......#",
      "#...Q.g...bX#..b....f......#......#",
      "#.######..#############.d#.#......#",
      "#.b....X....p.......b......#......#",
      "#.*....b.........#.........=...!..#",
      "#..w........b..Xb#.........#......#",
      "#...b........3..p#b...b....#......#",
      "#.#########..#########..##.#......#",
      "#.......wb............c....#......#",
      "#.............b...X...#....#......#",
      "#..................b..#.b..#......#",
      "#..1.cb....b.h........#Q...#......#",
      "#.############..########...#......#",
      "#...............b....X.....#......#",
      "#........................*.#....E.#",
      "#..........................#......#",
      "###################################"
    ],
    "intro": [
      "Les lanternes des galeries révèlent une route vers les reliques.",
      "Réunissez les trois reliques pour ouvrir la chambre du gardien.",
      "Marchez sur les trois consoles pour neutraliser les poussées.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire.",
      "Les anneaux de même lettre sont reliés. Sortez de l’anneau d’arrivée avant de le réutiliser."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Reliques réunies",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre LE SEIGNEUR DE MINUIT",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "exit",
        "label": "Rejoindre la sortie",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "mechanism",
        "label": "Consoles activées",
        "mandatory": false,
        "total": 3
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 14 gardes",
        "mandatory": false,
        "total": 14
      },
      {
        "id": "flawless",
        "label": "Terminer sans perdre de vie",
        "mandatory": false,
        "total": 1
      }
    ],
    "rankScores": {
      "C": 0,
      "B": 6000,
      "A": 8500,
      "S": 11000,
      "SS": 13000,
      "SSS": 14500
    },
    "mechanismTrigger": "step",
    "doors": [
      {
        "group": 1,
        "periodMs": 7112,
        "closedRatio": 0.34,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7712,
        "closedRatio": 0.34,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 5200
      }
    ],
    "portals": [
      {
        "a": {
          "x": 3,
          "y": 6
        },
        "b": {
          "x": 24,
          "y": 22
        }
      }
    ]
  },
  {
    "id": "level-106",
    "index": 105,
    "name": "Les Archives Scellées",
    "tagline": "Les portails rapprochent les archives séparées par les portes anciennes.",
    "difficulty": "difficile",
    "theme": "haunted",
    "bossKind": "gardien",
    "bossName": "LE SEIGNEUR DE MINUIT",
    "bossHp": 16,
    "propKind": "relic",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 840000,
    "rows": [
      "#################################",
      "#@.......................#......#",
      "#..+.....................#......#",
      "#.....bb....Q........2...#......#",
      "#....f......Xb....g.b....#......#",
      "#.######..###########.D#.#......#",
      "#.....b..X...............#......#",
      "#......#f....p......b....#......#",
      "#......#.....b...........#......#",
      "#.....b#.....w.X..p......#......#",
      "#.#########.X#######bd##.#......#",
      "#...Q........b...........#......#",
      "#.....b.....#.....X......#......#",
      "#.*p........#.....w.b....=...!..#",
      "#.....b.....#b.X.........#......#",
      "#.############..######...#......#",
      "#..h....c...3.......b....#......#",
      "#............b...#...X...#......#",
      "#.....b..........#.......#......#",
      "#.......h....c...#..b....#......#",
      "#.###############..##..#.#......#",
      "#....Xb......b...........#......#",
      "#..1..#......g....c.bQ...#......#",
      "#.....#......b...........#......#",
      "#.....#................*.#....E.#",
      "#........................#......#",
      "#################################"
    ],
    "intro": [
      "Les portails rapprochent les archives séparées par les portes anciennes.",
      "Réunissez les trois reliques pour ouvrir la chambre du gardien.",
      "Marchez sur les trois consoles pour neutraliser les poussées.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire.",
      "Les anneaux de même lettre sont reliés. Sortez de l’anneau d’arrivée avant de le réutiliser."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Reliques réunies",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre LE SEIGNEUR DE MINUIT",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "exit",
        "label": "Rejoindre la sortie",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "mechanism",
        "label": "Consoles activées",
        "mandatory": false,
        "total": 3
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 14 gardes",
        "mandatory": false,
        "total": 14
      },
      {
        "id": "flawless",
        "label": "Terminer sans perdre de vie",
        "mandatory": false,
        "total": 1
      }
    ],
    "rankScores": {
      "C": 0,
      "B": 6000,
      "A": 8500,
      "S": 11000,
      "SS": 13000,
      "SSS": 14500
    },
    "mechanismTrigger": "step",
    "doors": [
      {
        "group": 1,
        "periodMs": 7100,
        "closedRatio": 0.34,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7700,
        "closedRatio": 0.34,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 23,
        "width": 21,
        "height": 2,
        "direction": "left",
        "kind": "gravity",
        "speed": 48,
        "affectsBombs": false,
        "stopsOnSwitches": true,
        "periodMs": 8000,
        "warnMs": 1800,
        "activeMs": 2200
      }
    ],
    "portals": [
      {
        "a": {
          "x": 3,
          "y": 6
        },
        "b": {
          "x": 22,
          "y": 24
        }
      }
    ]
  },
  {
    "id": "level-107",
    "index": 106,
    "name": "Le Théâtre des Revenants",
    "tagline": "Trois sceaux doivent être chargés avant le dernier acte.",
    "difficulty": "difficile",
    "theme": "haunted",
    "bossKind": "gardien",
    "bossName": "LE SEIGNEUR DE MINUIT",
    "bossHp": 16,
    "propKind": "relic",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 840000,
    "rows": [
      "###################################",
      "#@.........................#......#",
      "#..+.......................#......#",
      "#.....b..c...Q........b2...#......#",
      "#.........bX...b...........#......#",
      "#.#####..#############hD##.#......#",
      "#.............c.....b......#......#",
      "#.b...............#........#......#",
      "#....gXb....b.....#........#......#",
      "#...Q.........X..b#f..b....#......#",
      "#.########.p############.d.#......#",
      "#...b....Xg................#......#",
      "#.*..#...b..............f..=...!..#",
      "#....#........b.pX.b.......#......#",
      "#....#bw.....3..........b..#......#",
      "#.###########..########..#.#......#",
      "#..........bX........p.....#......#",
      "#.........#.....b...X......#......#",
      "#..b......#.w........b.....#......#",
      "#..1c...b.#..b.X...........#......#",
      "#.##############..####.Q##.#......#",
      "#................hb....X...#......#",
      "#........................*.#....E.#",
      "#..........................#......#",
      "###################################"
    ],
    "intro": [
      "Trois sceaux doivent être chargés avant le dernier acte.",
      "Réunissez les trois reliques pour ouvrir la chambre du gardien.",
      "Activez tous les totems par explosion.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire.",
      "Les anneaux de même lettre sont reliés. Sortez de l’anneau d’arrivée avant de le réutiliser."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Reliques réunies",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre LE SEIGNEUR DE MINUIT",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "exit",
        "label": "Rejoindre la sortie",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "mechanism",
        "label": "Totems chargés",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 14 gardes",
        "mandatory": false,
        "total": 14
      },
      {
        "id": "flawless",
        "label": "Terminer sans perdre de vie",
        "mandatory": false,
        "total": 1
      }
    ],
    "rankScores": {
      "C": 0,
      "B": 6000,
      "A": 8500,
      "S": 11000,
      "SS": 13000,
      "SSS": 14500
    },
    "mechanismTrigger": "blast",
    "doors": [
      {
        "group": 1,
        "periodMs": 7088,
        "closedRatio": 0.34,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7688,
        "closedRatio": 0.34,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 21,
        "width": 23,
        "height": 2,
        "direction": "right",
        "kind": "gravity",
        "speed": 48,
        "affectsBombs": false,
        "stopsOnSwitches": true,
        "periodMs": 8000,
        "warnMs": 1800,
        "activeMs": 2200
      }
    ],
    "portals": [
      {
        "a": {
          "x": 5,
          "y": 4
        },
        "b": {
          "x": 24,
          "y": 22
        }
      }
    ]
  },
  {
    "id": "level-108",
    "index": 107,
    "name": "Les Escaliers de Minuit",
    "tagline": "Gardez les lanternes en vue et contournez les dalles piégées.",
    "difficulty": "difficile",
    "theme": "haunted",
    "bossKind": "gardien",
    "bossName": "LE SEIGNEUR DE MINUIT",
    "bossHp": 16,
    "propKind": "relic",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 840000,
    "rows": [
      "#####################################",
      "#@...........................#......#",
      "#..+.........................#......#",
      "#.....b.......Qb.........2...#......#",
      "#....b....X...b.....f........#......#",
      "#.####..##################.D.#......#",
      "#...........b................#......#",
      "#........p...#..........b....#......#",
      "#.....X....b.#...........w...#......#",
      "#........b..X#p......b.......#......#",
      "#.#######..##############.d#.#......#",
      "#.....w............b.........#......#",
      "#...Q.b...........#..........#......#",
      "#...............Xb#p.........#......#",
      "#.*b.......h....b.#..........=...!..#",
      "#.##########..##########..##.#......#",
      "#.............3.........c.b..#......#",
      "#............b..h..X...#.....#......#",
      "#......................#.b...#......#",
      "#....c....b..........gb#.....#......#",
      "#.#############..#########...#......#",
      "#.......b.............X......#......#",
      "#.......#.c.........b........#......#",
      "#......b#.................g..#......#",
      "#..1.b..#................Q...#......#",
      "#..............f.b.......X...#......#",
      "#..........................*.#....E.#",
      "#............................#......#",
      "#####################################"
    ],
    "intro": [
      "Gardez les lanternes en vue et contournez les dalles piégées.",
      "Réunissez les trois reliques pour ouvrir la chambre du gardien.",
      "Activez tous les totems par explosion.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire.",
      "Les anneaux de même lettre sont reliés. Sortez de l’anneau d’arrivée avant de le réutiliser."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Reliques réunies",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre LE SEIGNEUR DE MINUIT",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "exit",
        "label": "Rejoindre la sortie",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "mechanism",
        "label": "Totems chargés",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 14 gardes",
        "mandatory": false,
        "total": 14
      },
      {
        "id": "flawless",
        "label": "Terminer sans perdre de vie",
        "mandatory": false,
        "total": 1
      }
    ],
    "rankScores": {
      "C": 0,
      "B": 6000,
      "A": 8500,
      "S": 11000,
      "SS": 13000,
      "SSS": 14500
    },
    "mechanismTrigger": "blast",
    "doors": [
      {
        "group": 1,
        "periodMs": 7076,
        "closedRatio": 0.34,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7676,
        "closedRatio": 0.34,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 25,
        "width": 25,
        "height": 2,
        "direction": "left",
        "kind": "gravity",
        "speed": 48,
        "affectsBombs": false,
        "stopsOnSwitches": true,
        "periodMs": 8000,
        "warnMs": 1800,
        "activeMs": 2200
      }
    ],
    "portals": [
      {
        "a": {
          "x": 3,
          "y": 6
        },
        "b": {
          "x": 26,
          "y": 26
        }
      }
    ]
  },
  {
    "id": "level-109",
    "index": 108,
    "name": "Le Château des Dernières Ombres",
    "tagline": "Chargez les sceaux du château avant de défier son gardien.",
    "difficulty": "difficile",
    "theme": "haunted",
    "bossKind": "gardien",
    "bossName": "LE SEIGNEUR DE MINUIT",
    "bossHp": 16,
    "propKind": "relic",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 840000,
    "rows": [
      "###############################",
      "#@.....................#......#",
      "#..+...................#......#",
      "#.........bbQ......2b..#......#",
      "#......c..b......X.hb..#......#",
      "#.###########..####.D#.#......#",
      "#..................b...#......#",
      "#.....h..b..#.....b....#......#",
      "#.......b..c#...X.b....#......#",
      "#...Q...b..g#.......X..#......#",
      "#.##############.b.d##.#......#",
      "#......b.........f.....#......#",
      "#.*..pb.........b#.X...=...!..#",
      "#.....bX........g#.....#......#",
      "#...fb....p3...b.#.....#......#",
      "#.#################....#......#",
      "#.....X.......b........#......#",
      "#...b...#wX..b.........#......#",
      "#..b....#....b.p.......#......#",
      "#..1....#...b.w........#......#",
      "#.##..#############Q.#.#......#",
      "#.b..........X......c..#......#",
      "#....................*.#....E.#",
      "#......................#......#",
      "###############################"
    ],
    "intro": [
      "Chargez les sceaux du château avant de défier son gardien.",
      "Réunissez les trois reliques pour ouvrir la chambre du gardien.",
      "Marchez sur les trois consoles pour neutraliser les poussées.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire.",
      "Les anneaux de même lettre sont reliés. Sortez de l’anneau d’arrivée avant de le réutiliser."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Reliques réunies",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre LE SEIGNEUR DE MINUIT",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "exit",
        "label": "Rejoindre la sortie",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "mechanism",
        "label": "Consoles activées",
        "mandatory": false,
        "total": 3
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 14 gardes",
        "mandatory": false,
        "total": 14
      },
      {
        "id": "flawless",
        "label": "Terminer sans perdre de vie",
        "mandatory": false,
        "total": 1
      }
    ],
    "rankScores": {
      "C": 0,
      "B": 6000,
      "A": 8500,
      "S": 11000,
      "SS": 13000,
      "SSS": 14500
    },
    "mechanismTrigger": "step",
    "doors": [
      {
        "group": 1,
        "periodMs": 7064,
        "closedRatio": 0.34,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7664,
        "closedRatio": 0.34,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 5200
      }
    ],
    "portals": [
      {
        "a": {
          "x": 5,
          "y": 4
        },
        "b": {
          "x": 20,
          "y": 22
        }
      }
    ]
  },
  {
    "id": "level-110",
    "index": 109,
    "name": "Le Miroir du Dernier Écho",
    "tagline": "Les deux axes sont inversés pour cet ultime parcours aux quatre sceaux.",
    "difficulty": "difficile",
    "theme": "mirror",
    "bossKind": "cryon",
    "bossName": "LE GARDIEN DES ÉCHOS",
    "bossHp": 16,
    "propKind": "generator",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": true,
    "parTimeMs": 840000,
    "rows": [
      "###################################",
      "#@.........................#......#",
      "#..+.......................#......#",
      "#.......b....Q...b.....2...#......#",
      "#......b....b.X.....c......#......#",
      "#.########.g##########.D##.#......#",
      "#..b.....X.................#......#",
      "#........#..........b......#......#",
      "#..f.....#.....bg.......b..#......#",
      "#........#..X....X.b.......#......#",
      "#.###########.b#########.d.#......#",
      "#...Q...fb.......p.........#......#",
      "#...b.........#............#......#",
      "#.*.....b....w#.....X.b....=...!..#",
      "#..b.........3#X.....bp....#......#",
      "#.##############..#####..#.#......#",
      "#...............b..........#......#",
      "#....p.....b......w#...X...#......#",
      "#.....b...b....b..X#.......#......#",
      "#....b....c........#.......#......#",
      "#.#################..#.h##.#......#",
      "#.....X................b...#......#",
      "#..1..#......Q....b....Q...#......#",
      "#....h#......b.c......b....#......#",
      "#.....#..................*.#....E.#",
      "#..........................#......#",
      "###################################"
    ],
    "intro": [
      "MONDE MIROIR : gauche ↔ droite et haut ↔ bas, au clavier comme au joystick. Les bombes restent normales.",
      "Les deux axes sont inversés pour cet ultime parcours aux quatre sceaux.",
      "Chargez les trois noyaux par explosion.",
      "Activez tous les totems par explosion.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire.",
      "Les champs de gravité préviennent avant chaque poussée. Les consoles les désactivent.",
      "Les anneaux de même lettre sont reliés. Sortez de l’anneau d’arrivée avant de le réutiliser."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Noyaux chargés par explosion",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre LE GARDIEN DES ÉCHOS",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "exit",
        "label": "Rejoindre la sortie",
        "mandatory": true,
        "total": 1
      },
      {
        "id": "mechanism",
        "label": "Totems chargés",
        "mandatory": true,
        "total": 4
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 14 gardes",
        "mandatory": false,
        "total": 14
      },
      {
        "id": "flawless",
        "label": "Terminer sans perdre de vie",
        "mandatory": false,
        "total": 1
      }
    ],
    "rankScores": {
      "C": 0,
      "B": 6000,
      "A": 8500,
      "S": 11000,
      "SS": 13000,
      "SSS": 14500
    },
    "mechanismTrigger": "blast",
    "doors": [
      {
        "group": 1,
        "periodMs": 7052,
        "closedRatio": 0.34,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7652,
        "closedRatio": 0.34,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 1800,
        "activeMs": 1800,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 23,
        "width": 23,
        "height": 2,
        "direction": "left",
        "kind": "gravity",
        "speed": 48,
        "affectsBombs": false,
        "stopsOnSwitches": true,
        "periodMs": 8000,
        "warnMs": 1800,
        "activeMs": 2200
      }
    ],
    "portals": [
      {
        "a": {
          "x": 5,
          "y": 4
        },
        "b": {
          "x": 24,
          "y": 24
        }
      }
    ]
  }
];
