import type { MapDefinition } from './mapTypes';

/** Encounters 61–80: fixed layouts, stable save IDs and mirror milestones. */
export const EXTENSION_III: readonly MapDefinition[] = [
  {
    "id": "level-61",
    "index": 60,
    "name": "Les Jardins Suspendus",
    "tagline": "Les racines dessinent trois jardins reliés par des passages étroits.",
    "difficulty": "difficile",
    "theme": "jungle",
    "bossKind": "gardien",
    "bossName": "LE ROI DES LIANES",
    "bossHp": 10,
    "propKind": "relic",
    "orderedProps": true,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 600000,
    "rows": [
      "###############################",
      "#@.....................#......#",
      "#..+...................#......#",
      "#.....p............2...#......#",
      "#....b.......b.w.......#......#",
      "#.#.b###############.D.#......#",
      "#....X..p..b.....X.....#......#",
      "#..bmmmmm...#.......w..#......#",
      "#........b.m#m.........#......#",
      "#...Q...Xmmm#c......b..#......#",
      "#.####.h###########.d#.#......#",
      "#.*.........b.mmmmb....=...!..#",
      "#.........bX.....#c....#......#",
      "#..........3h...b#.....#......#",
      "#....f..b........#.....#......#",
      "#.#######..#######.b##.#......#",
      "#.....b..........g.....#......#",
      "#.......#.....X..b.....#......#",
      "#..1b...#.f........Q...#......#",
      "#...g...#......b.......#......#",
      "#....................*.#....E.#",
      "#......................#......#",
      "###############################"
    ],
    "intro": [
      "Les racines dessinent trois jardins reliés par des passages étroits.",
      "Ramassez les reliques dans l’ordre 1 → 2 → 3.",
      "Réunissez les trois reliques pour ouvrir la chambre du gardien.",
      "Marchez sur les deux consoles pour neutraliser les poussées.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire.",
      "Les lianes au sol ralentissent tous les personnages. Les spores brillent avant leur activation."
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
        "label": "Vaincre LE ROI DES LIANES",
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
        "total": 2
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 12 gardes",
        "mandatory": false,
        "total": 12
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
        "periodMs": 7800,
        "closedRatio": 0.3,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 8400,
        "closedRatio": 0.3,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 5200
      }
    ]
  },
  {
    "id": "level-62",
    "index": 61,
    "name": "Le Fleuve des Lianes",
    "tagline": "Remontez le courant et activez les totems pour apaiser la rivière.",
    "difficulty": "difficile",
    "theme": "jungle",
    "bossKind": "gardien",
    "bossName": "LE ROI DES LIANES",
    "bossHp": 10,
    "propKind": "relic",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 600000,
    "rows": [
      "#################################",
      "#@.......................#......#",
      "#..+.....................#......#",
      "#.....b........w.....2...#......#",
      "#....pX...b......b.......#......#",
      "#.##..###############.D#.#......#",
      "#..b......b.........w....#......#",
      "#...mmmmm.p....#.........#......#",
      "#........mb....#.....X...#......#",
      "#..bQh...Xmmmm.#.b.......#......#",
      "#.#####..###########.d##.#......#",
      "#.........b...mcmmm......#......#",
      "#.*.......h......b..#....=...!..#",
      "#...........X....b.c#....#......#",
      "#..b........3..g....#....#......#",
      "#.########b.##########...#......#",
      "#....f...........b.......#......#",
      "#........#.....X.........#......#",
      "#..b.....#b.........g....#......#",
      "#..1.....#f......b.......#......#",
      "#.###########..######Q.#.#......#",
      "#..b..............X......#......#",
      "#......................*.#....E.#",
      "#........................#......#",
      "#################################"
    ],
    "intro": [
      "Remontez le courant et activez les totems pour apaiser la rivière.",
      "Réunissez les trois reliques pour ouvrir la chambre du gardien.",
      "Marchez sur les deux consoles pour neutraliser les poussées.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire.",
      "Les lianes au sol ralentissent tous les personnages. Les spores brillent avant leur activation."
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
        "label": "Vaincre LE ROI DES LIANES",
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
        "total": 2
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 12 gardes",
        "mandatory": false,
        "total": 12
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
        "periodMs": 7775,
        "closedRatio": 0.3,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 8375,
        "closedRatio": 0.3,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 21,
        "width": 21,
        "height": 2,
        "direction": "left",
        "kind": "current",
        "speed": 45,
        "affectsBombs": false,
        "stopsOnSwitches": true
      }
    ]
  },
  {
    "id": "level-63",
    "index": 62,
    "name": "La Pyramide Vivante",
    "tagline": "Trois idoles attendent derrière les terrasses envahies par les lianes.",
    "difficulty": "difficile",
    "theme": "jungle",
    "bossKind": "gardien",
    "bossName": "LE ROI DES LIANES",
    "bossHp": 10,
    "propKind": "relic",
    "orderedProps": true,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 600000,
    "rows": [
      "###################################",
      "#@.........................#......#",
      "#..+.......................#......#",
      "#.....b................2...#......#",
      "#......pb...........w......#......#",
      "#.###.X###############.D##.#......#",
      "#..b.................bX....#......#",
      "#...mmmmm.......b.#........#......#",
      "#..h......Xbpm....#........#......#",
      "#....X...mbmmm.b..#........#......#",
      "#.######..##############.d.#......#",
      "#...Qb..h.....mmmcm........#......#",
      "#....#.......X.........b...#......#",
      "#.*..#.......g....b........=...!..#",
      "#....#.......3...b....c....#......#",
      "#.#########..##########..#.#......#",
      "#...........b..............#......#",
      "#....f.b..#.....X.g........#......#",
      "#.b.......#................#......#",
      "#.........#.............b..#......#",
      "#.############..######..##.#......#",
      "#.........f.......Xb.......#......#",
      "#..1..........b#.......Q...#......#",
      "#........b....w#...........#......#",
      "#..............#.........*.#....E.#",
      "#..........................#......#",
      "###################################"
    ],
    "intro": [
      "Trois idoles attendent derrière les terrasses envahies par les lianes.",
      "Ramassez les reliques dans l’ordre 1 → 2 → 3.",
      "Réunissez les trois reliques pour ouvrir la chambre du gardien.",
      "Activez tous les totems par explosion.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire.",
      "Les lianes au sol ralentissent tous les personnages. Les spores brillent avant leur activation."
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
        "label": "Vaincre LE ROI DES LIANES",
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
        "total": 2
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 12 gardes",
        "mandatory": false,
        "total": 12
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
        "periodMs": 7750,
        "closedRatio": 0.3,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 8350,
        "closedRatio": 0.3,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 23,
        "width": 23,
        "height": 2,
        "direction": "right",
        "kind": "current",
        "speed": 45,
        "affectsBombs": false,
        "stopsOnSwitches": true
      }
    ]
  },
  {
    "id": "level-64",
    "index": 63,
    "name": "Le Cœur de la Canopée",
    "tagline": "Les totems explosifs protègent le dernier sanctuaire de la jungle.",
    "difficulty": "difficile",
    "theme": "jungle",
    "bossKind": "gardien",
    "bossName": "LE ROI DES LIANES",
    "bossHp": 10,
    "propKind": "relic",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 600000,
    "rows": [
      "#####################################",
      "#@...........................#......#",
      "#..+.........................#......#",
      "#.....b.................b2...#......#",
      "#....b..X.f.....g............#......#",
      "#.####..##################.D.#......#",
      "#..b...mbp..........X........#......#",
      "#...mmmbm......w.....#.......#......#",
      "#.....b....Xbm.......#.......#......#",
      "#...Q....mmbmmp.....w#.X.....#......#",
      "#.#######.b##############.d#.#......#",
      "#.*...........mbmmm..........=...!..#",
      "#.....#.......b....c.........#......#",
      "#.....#......b3X...b.....h...#......#",
      "#.....#..........bb.......X..#......#",
      "#.##########..##########c.##.#......#",
      "#.....h...............b......#......#",
      "#..........#.....X...b.......#......#",
      "#..1.f.X...#.............Qb..#......#",
      "#.........g#.............b...#......#",
      "#..........................*.#....E.#",
      "#............................#......#",
      "#####################################"
    ],
    "intro": [
      "Les totems explosifs protègent le dernier sanctuaire de la jungle.",
      "Réunissez les trois reliques pour ouvrir la chambre du gardien.",
      "Activez tous les totems par explosion.",
      "Vainquez le gardien, puis rejoignez la sortie. La progression est sauvegardée après la victoire.",
      "Les lianes au sol ralentissent tous les personnages. Les spores brillent avant leur activation."
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
        "label": "Vaincre LE ROI DES LIANES",
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
        "total": 2
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 12 gardes",
        "mandatory": false,
        "total": 12
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
        "periodMs": 7725,
        "closedRatio": 0.3,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 8325,
        "closedRatio": 0.3,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 19,
        "width": 25,
        "height": 2,
        "direction": "left",
        "kind": "current",
        "speed": 45,
        "affectsBombs": false,
        "stopsOnSwitches": true
      }
    ]
  },
  {
    "id": "level-65",
    "index": 64,
    "name": "La Promenade Sucrée",
    "tagline": "Des rubans roulants traversent les ateliers de confiserie.",
    "difficulty": "difficile",
    "theme": "candy",
    "bossKind": "gardien",
    "bossName": "LE CONFISEUR FOU",
    "bossHp": 11,
    "propKind": "generator",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 600000,
    "rows": [
      "#############################",
      "#@...................#......#",
      "#..+.................#......#",
      "#.....bb.....g...2...#......#",
      "#....b...X...........#......#",
      "#.#####..########.D#.#......#",
      "#..bf..X.........bg..#......#",
      "#..........p#b.b.....#......#",
      "#........w..#b.......#......#",
      "#...Q....b.b#X.......#......#",
      "#.########..####pd##.#......#",
      "#.*..b.b......w......=...!..#",
      "#..b.#...............#......#",
      "#..bc#....3....X.....#......#",
      "#..h.#..........b.b..#......#",
      "#.###########..###...#......#",
      "#.........c...b......#......#",
      "#.......h.#.b.....X..#......#",
      "#..1.....b#b.....Q...#......#",
      "#.......b.#....f.....#......#",
      "#..................*.#....E.#",
      "#....................#......#",
      "#############################"
    ],
    "intro": [
      "Des rubans roulants traversent les ateliers de confiserie.",
      "Chargez les trois noyaux par explosion.",
      "Marchez sur les deux consoles pour neutraliser les poussées.",
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
        "label": "Vaincre LE CONFISEUR FOU",
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
        "total": 2
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 12 gardes",
        "mandatory": false,
        "total": 12
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
        "periodMs": 7700,
        "closedRatio": 0.3,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 8300,
        "closedRatio": 0.3,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 5200
      }
    ]
  },
  {
    "id": "level-66",
    "index": 65,
    "name": "Les Canaux de Caramel",
    "tagline": "Choisissez le bon tapis pour traverser les bassins de caramel.",
    "difficulty": "difficile",
    "theme": "candy",
    "bossKind": "gardien",
    "bossName": "LE CONFISEUR FOU",
    "bossHp": 11,
    "propKind": "generator",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 660000,
    "rows": [
      "###############################",
      "#@.....................#......#",
      "#..+...................#......#",
      "#......b......g....2...#......#",
      "#.....b...X.....b...f..#......#",
      "#.######..########.D##.#......#",
      "#..............b.......#......#",
      "#....b.w.....#.........#......#",
      "#........X..p#b........#......#",
      "#...b.......X#.........#......#",
      "#.#########.w#######.d.#......#",
      "#..bQ........b....p....#......#",
      "#.*...............#....=...!..#",
      "#.b........b....Xh#....#......#",
      "#....c.....3......#....#......#",
      "#.############..###.b#.#......#",
      "#...h.....b............#......#",
      "#........#c........X...#......#",
      "#.......b#.............#......#",
      "#..1....g#.....f..b....#......#",
      "#.###############..Q##.#......#",
      "#.....X.b........b.....#......#",
      "#....................*.#....E.#",
      "#......................#......#",
      "###############################"
    ],
    "intro": [
      "Choisissez le bon tapis pour traverser les bassins de caramel.",
      "Chargez les trois noyaux par explosion.",
      "Marchez sur les deux consoles pour neutraliser les poussées.",
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
        "label": "Vaincre LE CONFISEUR FOU",
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
        "total": 2
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 12 gardes",
        "mandatory": false,
        "total": 12
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
        "periodMs": 7675,
        "closedRatio": 0.3,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 8275,
        "closedRatio": 0.3,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 21,
        "width": 19,
        "height": 2,
        "direction": "left",
        "kind": "conveyor",
        "speed": 60,
        "affectsBombs": true,
        "stopsOnSwitches": true
      }
    ]
  },
  {
    "id": "level-67",
    "index": 66,
    "name": "Le Labyrinthe des Sucres",
    "tagline": "Les portes rythment la traversée de quatre ateliers reliés.",
    "difficulty": "difficile",
    "theme": "candy",
    "bossKind": "gardien",
    "bossName": "LE CONFISEUR FOU",
    "bossHp": 11,
    "propKind": "generator",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 660000,
    "rows": [
      "#################################",
      "#@.......................#......#",
      "#..+.....................#......#",
      "#.......b...........f2...#......#",
      "#..........X...b......b..#......#",
      "#.#######..###########.D.#......#",
      "#....w.Xb................#......#",
      "#.............#.......b..#......#",
      "#.............#b.........#......#",
      "#.........wX.X#p......b..#......#",
      "#.##########..#######.d#.#......#",
      "#...Q..........b.........#......#",
      "#.......b......h...#p....#......#",
      "#.*..............X.#..b..=...!..#",
      "#....c..b...3......#.....#......#",
      "#.#############..###h.##.#......#",
      "#.....................b..#......#",
      "#.......#......b....X....#......#",
      "#....g.b#.c..............#......#",
      "#.......#......b.........#......#",
      "#.################..##...#......#",
      "#....X..b.g....f.........#......#",
      "#..1.........#.......Qb..#......#",
      "#............#.b.........#......#",
      "#............#.........*.#....E.#",
      "#........................#......#",
      "#################################"
    ],
    "intro": [
      "Les portes rythment la traversée de quatre ateliers reliés.",
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
        "label": "Vaincre LE CONFISEUR FOU",
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
        "total": 2
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 12 gardes",
        "mandatory": false,
        "total": 12
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
        "periodMs": 7650,
        "closedRatio": 0.3,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 8250,
        "closedRatio": 0.3,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 23,
        "width": 21,
        "height": 2,
        "direction": "right",
        "kind": "conveyor",
        "speed": 60,
        "affectsBombs": true,
        "stopsOnSwitches": true
      }
    ]
  },
  {
    "id": "level-68",
    "index": 67,
    "name": "Les Tours de Réglisse",
    "tagline": "Chargez les machines à bonbons sans vous laisser emporter.",
    "difficulty": "difficile",
    "theme": "candy",
    "bossKind": "gardien",
    "bossName": "LE CONFISEUR FOU",
    "bossHp": 11,
    "propKind": "generator",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 660000,
    "rows": [
      "###################################",
      "#@.........................#......#",
      "#..+.......................#......#",
      "#........b...b....h....2...#......#",
      "#...........b..f...........#......#",
      "#.########.X###########.D#.#......#",
      "#.............bb.......gX..#......#",
      "#..............#.b..b......#......#",
      "#..............#b...f......#......#",
      "#...Q.gX......X#.p.b.......#......#",
      "#.###########..#######bd##.#......#",
      "#.*w.................b.....=...!..#",
      "#...................#...b..#......#",
      "#............3....X.#.pb...#......#",
      "#..b..b.w.X.........#......#......#",
      "#.##############..######...#......#",
      "#...bc.....................#......#",
      "#......#b....h.......X.....#......#",
      "#..1..b#..b..X.........Q...#......#",
      "#......#..c................#......#",
      "#........................*.#....E.#",
      "#..........................#......#",
      "###################################"
    ],
    "intro": [
      "Chargez les machines à bonbons sans vous laisser emporter.",
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
        "label": "Vaincre LE CONFISEUR FOU",
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
        "total": 2
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 12 gardes",
        "mandatory": false,
        "total": 12
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
        "periodMs": 7625,
        "closedRatio": 0.3,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 8225,
        "closedRatio": 0.3,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 19,
        "width": 23,
        "height": 2,
        "direction": "left",
        "kind": "conveyor",
        "speed": 60,
        "affectsBombs": true,
        "stopsOnSwitches": true
      }
    ]
  },
  {
    "id": "level-69",
    "index": 68,
    "name": "Le Palais du Nougat",
    "tagline": "Les rubans poussent les bombes entre les consoles du palais.",
    "difficulty": "difficile",
    "theme": "candy",
    "bossKind": "gardien",
    "bossName": "LE CONFISEUR FOU",
    "bossHp": 12,
    "propKind": "generator",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 660000,
    "rows": [
      "#####################################",
      "#@...........................#......#",
      "#..+.........................#......#",
      "#.....b..bc..............2...#......#",
      "#.......bb...X..h............#......#",
      "#.#########..###########.D##.#......#",
      "#............b.f.........X...#......#",
      "#...........b...#....g.......#......#",
      "#..........b....#b...........#......#",
      "#...Q..........b#X..f........#......#",
      "#.############.b##########gd.#......#",
      "#.*................pb........=...!..#",
      "#..................b.#...w...#......#",
      "#.............3...bX.#..b....#......#",
      "#.....w..............#bbp....#......#",
      "#.###############..######..#.#......#",
      "#.b..........................#......#",
      "#....c#...............X...b..#......#",
      "#..1.b#....h.............Q...#......#",
      "#....b#......................#......#",
      "#..........................*.#....E.#",
      "#............................#......#",
      "#####################################"
    ],
    "intro": [
      "Les rubans poussent les bombes entre les consoles du palais.",
      "Chargez les trois noyaux par explosion.",
      "Marchez sur les deux consoles pour neutraliser les poussées.",
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
        "label": "Vaincre LE CONFISEUR FOU",
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
        "total": 2
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 12 gardes",
        "mandatory": false,
        "total": 12
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
        "periodMs": 7600,
        "closedRatio": 0.3,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 8200,
        "closedRatio": 0.3,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 5200
      }
    ]
  },
  {
    "id": "level-70",
    "index": 69,
    "name": "Le Miroir des Saveurs",
    "tagline": "Commandes inversées, rubans opposés et prismes à charger par explosion.",
    "difficulty": "difficile",
    "theme": "mirror",
    "bossKind": "cryon",
    "bossName": "LE GARDIEN DES ÉTOILES",
    "bossHp": 12,
    "propKind": "generator",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": true,
    "parTimeMs": 660000,
    "rows": [
      "#############################",
      "#@...................#......#",
      "#..+.................#......#",
      "#.......b.Qb.....2...#......#",
      "#....b.g.f....X.b....#......#",
      "#.##########..####.D.#......#",
      "#.........b....X.....#......#",
      "#...b.......g..#.....#......#",
      "#.............f#b.b..#......#",
      "#...Q.b.....b..#.X...#......#",
      "#.#############...d#.#......#",
      "#..w.............b...#......#",
      "#.*..p..#..b.........=...!..#",
      "#.....Xb#............#......#",
      "#.b....w#.3..b.......#......#",
      "#.##############.....#......#",
      "#......b..p..h.......#......#",
      "#........X...#.b..b..#......#",
      "#............#.c.....#......#",
      "#..1.....b...#...Q...#......#",
      "#.###..###########h..#......#",
      "#..bc.....Q.X.b......#......#",
      "#..................*.#....E.#",
      "#....................#......#",
      "#############################"
    ],
    "intro": [
      "MONDE MIROIR : gauche ↔ droite et haut ↔ bas, au clavier comme au joystick. Les bombes restent normales.",
      "Commandes inversées, rubans opposés et prismes à charger par explosion.",
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
        "label": "Vaincre LE GARDIEN DES ÉTOILES",
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
        "label": "Éliminer les 12 gardes",
        "mandatory": false,
        "total": 12
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
        "periodMs": 7575,
        "closedRatio": 0.3,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 8175,
        "closedRatio": 0.3,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 21,
        "width": 17,
        "height": 2,
        "direction": "left",
        "kind": "gravity",
        "speed": 45,
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
          "x": 18,
          "y": 22
        }
      }
    ]
  },
  {
    "id": "level-71",
    "index": 70,
    "name": "La Descente des Abysses",
    "tagline": "Les courants profonds relient les vestiges d’une cité oubliée.",
    "difficulty": "difficile",
    "theme": "abyss",
    "bossKind": "gardien",
    "bossName": "LE LÉVIATHAN",
    "bossHp": 12,
    "propKind": "relic",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 720000,
    "rows": [
      "###############################",
      "#@.....................#......#",
      "#..+...................#......#",
      "#...........b......2...#......#",
      "#.....gfb......X.......#......#",
      "#.###########..####.D#.#......#",
      "#.............X...b....#......#",
      "#........b..f.#........#......#",
      "#.............#....b...#......#",
      "#.............#b.XX....#......#",
      "#.##############.w.d##.#......#",
      "#...Q.b................#......#",
      "#...w#..........b......#......#",
      "#.*.p#Xb...............=...!..#",
      "#..b.#.....3...........#......#",
      "#.#################....#......#",
      "#........hp..b.........#......#",
      "#...b...X.#............#......#",
      "#.........#...b........#......#",
      "#.........#...hc.......#......#",
      "#.##..#############..#.#......#",
      "#.........bX.......Qb..#......#",
      "#..1.......b...#...gc..#......#",
      "#.b............#.......#......#",
      "#..............#.....*.#....E.#",
      "#......................#......#",
      "###############################"
    ],
    "intro": [
      "Les courants profonds relient les vestiges d’une cité oubliée.",
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
        "label": "Vaincre LE LÉVIATHAN",
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
        "total": 2
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 12 gardes",
        "mandatory": false,
        "total": 12
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
        "periodMs": 7550,
        "closedRatio": 0.3,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 8150,
        "closedRatio": 0.3,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 23,
        "width": 19,
        "height": 2,
        "direction": "right",
        "kind": "current",
        "speed": 45,
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
          "y": 24
        }
      }
    ]
  },
  {
    "id": "level-72",
    "index": 71,
    "name": "Les Fosses Lumineuses",
    "tagline": "Les balises relient les galeries séparées par des portes cycliques.",
    "difficulty": "difficile",
    "theme": "abyss",
    "bossKind": "gardien",
    "bossName": "LE LÉVIATHAN",
    "bossHp": 12,
    "propKind": "relic",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 720000,
    "rows": [
      "#################################",
      "#@.......................#......#",
      "#..+.....................#......#",
      "#.....b......b.c.....2...#......#",
      "#....hb.........X...b....#......#",
      "#.############..####bD##.#......#",
      "#.........X.........c....#......#",
      "#.....b...h..#...........#......#",
      "#............#......b....#......#",
      "#...Qfb.....X#.g...X.....#......#",
      "#.###############..###.d.#......#",
      "#.*...b......b...........=...!..#",
      "#.........f..b....#......#......#",
      "#.....b.....3.....#.g.X..#......#",
      "#....p.......b.wX.#......#......#",
      "#.##################b..#.#......#",
      "#......X.....b...........#......#",
      "#......#..p.........b....#......#",
      "#..1...#.....b.....XwQ...#......#",
      "#......#............b....#......#",
      "#......................*.#....E.#",
      "#........................#......#",
      "#################################"
    ],
    "intro": [
      "Les balises relient les galeries séparées par des portes cycliques.",
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
        "label": "Vaincre LE LÉVIATHAN",
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
        "total": 2
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 12 gardes",
        "mandatory": false,
        "total": 12
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
        "periodMs": 7525,
        "closedRatio": 0.3,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 8125,
        "closedRatio": 0.3,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 19,
        "width": 21,
        "height": 2,
        "direction": "left",
        "kind": "current",
        "speed": 45,
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
          "x": 22,
          "y": 20
        }
      }
    ]
  },
  {
    "id": "level-73",
    "index": 72,
    "name": "Le Temple des Marées Noires",
    "tagline": "Les téléporteurs ouvrent des raccourcis vers les reliques englouties.",
    "difficulty": "difficile",
    "theme": "abyss",
    "bossKind": "gardien",
    "bossName": "LE LÉVIATHAN",
    "bossHp": 13,
    "propKind": "relic",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 720000,
    "rows": [
      "###################################",
      "#@.........................#......#",
      "#..+.......................#......#",
      "#.............b...b....2...#......#",
      "#..............c.b..b..h...#......#",
      "#.#############.X#######.D.#......#",
      "#........X.........b.......#......#",
      "#...........#.......c.b....#......#",
      "#.b.Q.h.....#........b.....#......#",
      "#..fb.......#.......X...b..#......#",
      "#.################..###.d#.#......#",
      "#.*b.......g...............=...!..#",
      "#.....b..........#.........#......#",
      "#....b..f....3...#.....X...#......#",
      "#....p..b..b....g#.........#......#",
      "#.###################...##.#......#",
      "#.........b..w.............#......#",
      "#.....X......b........#....#......#",
      "#..1......p.b.........#Q...#......#",
      "#..............b..w...#....#......#",
      "#........................*.#....E.#",
      "#..........................#......#",
      "###################################"
    ],
    "intro": [
      "Les téléporteurs ouvrent des raccourcis vers les reliques englouties.",
      "Réunissez les trois reliques pour ouvrir la chambre du gardien.",
      "Marchez sur les deux consoles pour neutraliser les poussées.",
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
        "label": "Vaincre LE LÉVIATHAN",
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
        "total": 2
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 12 gardes",
        "mandatory": false,
        "total": 12
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
        "periodMs": 7500,
        "closedRatio": 0.3,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 8100,
        "closedRatio": 0.3,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 2000,
        "activeMs": 1600,
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
          "x": 24,
          "y": 20
        }
      }
    ]
  },
  {
    "id": "level-74",
    "index": 73,
    "name": "Le Trône du Léviathan",
    "tagline": "Chargez les balises au milieu des courants avant le gardien.",
    "difficulty": "difficile",
    "theme": "abyss",
    "bossKind": "gardien",
    "bossName": "LE LÉVIATHAN",
    "bossHp": 13,
    "propKind": "relic",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 720000,
    "rows": [
      "#####################################",
      "#@...........................#......#",
      "#..+.........................#......#",
      "#.............bc.......b.2...#......#",
      "#.................b..b....h..#......#",
      "#.##############.X#######.D#.#......#",
      "#...................c...b....#......#",
      "#.b........#.................#......#",
      "#......g..X#..........b..b...#......#",
      "#..bQ......#.........X...f...#......#",
      "#.#################..###.d##.#......#",
      "#.....b.....g................#......#",
      "#.*...f..b......#............=...!..#",
      "#...b...........#.......X....#......#",
      "#......b..bw..3.#............#......#",
      "#.####################..##...#......#",
      "#....p.......b...............#......#",
      "#....X..........b....#.......#......#",
      "#..........b....w....#.......#......#",
      "#..1......p...b..b...#.......#......#",
      "#.#######################Q.#.#......#",
      "#.......X...........bh.......#......#",
      "#..........................*.#....E.#",
      "#............................#......#",
      "#####################################"
    ],
    "intro": [
      "Chargez les balises au milieu des courants avant le gardien.",
      "Réunissez les trois reliques pour ouvrir la chambre du gardien.",
      "Marchez sur les deux consoles pour neutraliser les poussées.",
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
        "label": "Vaincre LE LÉVIATHAN",
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
        "total": 2
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 12 gardes",
        "mandatory": false,
        "total": 12
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
        "periodMs": 7475,
        "closedRatio": 0.3,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 8075,
        "closedRatio": 0.3,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 21,
        "width": 25,
        "height": 2,
        "direction": "left",
        "kind": "current",
        "speed": 45,
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
    "id": "level-75",
    "index": 74,
    "name": "Le Quai des Étoiles",
    "tagline": "La gravité pulse sur les passerelles de la colonie lunaire.",
    "difficulty": "difficile",
    "theme": "lunar",
    "bossKind": "cryon",
    "bossName": "LE COMMANDANT SÉLÉNITE",
    "bossHp": 13,
    "propKind": "generator",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 720000,
    "rows": [
      "#############################",
      "#@...................#......#",
      "#..+.................#......#",
      "#...............b2...#......#",
      "#....b........c.b....#......#",
      "#.##############.gD#.#......#",
      "#....XX....b.........#......#",
      "#.....#..........b...#......#",
      "#..f.g#b.............#......#",
      "#....b#.XX..b........#......#",
      "#.##..############.d.#......#",
      "#...Q...f.........b..#......#",
      "#......b...#.........#......#",
      "#.*.......X#.b.......=...!..#",
      "#.b.......3#bw.......#......#",
      "#.#####..########..#.#......#",
      "#.......b.....X......#......#",
      "#.............bp#.w..#......#",
      "#..b............#....#......#",
      "#..bp..h.b......#....#......#",
      "#.########..####..##.#......#",
      "#..............b.X...#......#",
      "#..1b....#.......Q...#......#",
      "#.......c#b.h........#......#",
      "#........#.........*.#....E.#",
      "#....................#......#",
      "#############################"
    ],
    "intro": [
      "La gravité pulse sur les passerelles de la colonie lunaire.",
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
        "label": "Vaincre LE COMMANDANT SÉLÉNITE",
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
        "total": 2
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 12 gardes",
        "mandatory": false,
        "total": 12
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
        "periodMs": 7450,
        "closedRatio": 0.3,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 8050,
        "closedRatio": 0.3,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 23,
        "width": 17,
        "height": 2,
        "direction": "right",
        "kind": "gravity",
        "speed": 45,
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
          "x": 18,
          "y": 24
        }
      }
    ]
  },
  {
    "id": "level-76",
    "index": 75,
    "name": "Les Cratères Silencieux",
    "tagline": "Les sas cycliques imposent le rythme entre les modules.",
    "difficulty": "difficile",
    "theme": "lunar",
    "bossKind": "cryon",
    "bossName": "LE COMMANDANT SÉLÉNITE",
    "bossHp": 13,
    "propKind": "generator",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 780000,
    "rows": [
      "###############################",
      "#@.....................#......#",
      "#..+...................#......#",
      "#................b.2...#......#",
      "#........b....w.....p..#......#",
      "#.################.XbD.#......#",
      "#......b........X......#......#",
      "#......c.......#..b....#......#",
      "#....b.........#...h...#......#",
      "#...Q..Xb...c..#b......#......#",
      "#.#..##############Xd#.#......#",
      "#.*...h.......b........=...!..#",
      "#....b#................#......#",
      "#.....#...X3b....f.....#......#",
      "#...bX#....g...b.......#......#",
      "#.####..##########..##.#......#",
      "#.b.f........X.........#......#",
      "#..........#.b..g..Q...#......#",
      "#..1.....X.#...p...b...#......#",
      "#........wb#...........#......#",
      "#....................*.#....E.#",
      "#......................#......#",
      "###############################"
    ],
    "intro": [
      "Les sas cycliques imposent le rythme entre les modules.",
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
        "label": "Vaincre LE COMMANDANT SÉLÉNITE",
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
        "total": 2
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 12 gardes",
        "mandatory": false,
        "total": 12
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
        "periodMs": 7425,
        "closedRatio": 0.3,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 8025,
        "closedRatio": 0.3,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 19,
        "width": 19,
        "height": 2,
        "direction": "left",
        "kind": "gravity",
        "speed": 45,
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
          "x": 20,
          "y": 20
        }
      }
    ]
  },
  {
    "id": "level-77",
    "index": 76,
    "name": "L’Observatoire Brisé",
    "tagline": "Traversez les champs de gravité pour alimenter les antennes.",
    "difficulty": "difficile",
    "theme": "lunar",
    "bossKind": "cryon",
    "bossName": "LE COMMANDANT SÉLÉNITE",
    "bossHp": 14,
    "propKind": "generator",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 780000,
    "rows": [
      "#################################",
      "#@.......................#......#",
      "#..+.....................#......#",
      "#.....w....b......b..2...#......#",
      "#....b.....b.............#......#",
      "#.#################.pXD#.#......#",
      "#...b.....w....X.........#......#",
      "#..........b#............#......#",
      "#...bc......#............#......#",
      "#...Q.X....b#..h..b......#......#",
      "#.##################...d.#......#",
      "#.*.......cb.............=...!..#",
      "#................#b.h....#......#",
      "#........X.b3....#.......#......#",
      "#...b..........f.#b......#......#",
      "#.###g.###############...#......#",
      "#.................b......#......#",
      "#...b.#.....X.......f....#......#",
      "#..1..#...g.......b..Q...#......#",
      "#...b.#........p.........#......#",
      "#......................*.#....E.#",
      "#........................#......#",
      "#################################"
    ],
    "intro": [
      "Traversez les champs de gravité pour alimenter les antennes.",
      "Chargez les trois noyaux par explosion.",
      "Marchez sur les deux consoles pour neutraliser les poussées.",
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
        "label": "Vaincre LE COMMANDANT SÉLÉNITE",
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
        "total": 2
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 12 gardes",
        "mandatory": false,
        "total": 12
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
        "closedRatio": 0.3,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 8000,
        "closedRatio": 0.3,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 2000,
        "activeMs": 1600,
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
          "x": 22,
          "y": 20
        }
      }
    ]
  },
  {
    "id": "level-78",
    "index": 77,
    "name": "Le Réacteur de Séléné",
    "tagline": "Coupez les poussées aux consoles et chargez les trois réacteurs.",
    "difficulty": "difficile",
    "theme": "lunar",
    "bossKind": "cryon",
    "bossName": "LE COMMANDANT SÉLÉNITE",
    "bossHp": 14,
    "propKind": "generator",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 780000,
    "rows": [
      "###################################",
      "#@.........................#......#",
      "#..+.......................#......#",
      "#.....w............b...2...#......#",
      "#.....b.............p...b..#......#",
      "#.##################..XD##.#......#",
      "#.........bh...............#......#",
      "#..c.....#......b..........#......#",
      "#..b....b#.......X.........#......#",
      "#...QX..c#...b..h..........#......#",
      "#.#####################..d.#......#",
      "#.................b........#......#",
      "#.*...........#......g.b...=...!..#",
      "#.......X.b..f#............#......#",
      "#............3#b....b......#......#",
      "#.##g.#################..#.#......#",
      "#.b...............f........#......#",
      "#......b...X.......#.......#......#",
      "#................b.#.......#......#",
      "#..1b..........p...#..bw...#......#",
      "#.#####..#############.Q##.#......#",
      "#........b....X............#......#",
      "#........................*.#....E.#",
      "#..........................#......#",
      "###################################"
    ],
    "intro": [
      "Coupez les poussées aux consoles et chargez les trois réacteurs.",
      "Chargez les trois noyaux par explosion.",
      "Marchez sur les deux consoles pour neutraliser les poussées.",
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
        "label": "Vaincre LE COMMANDANT SÉLÉNITE",
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
        "total": 2
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 12 gardes",
        "mandatory": false,
        "total": 12
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
        "periodMs": 7375,
        "closedRatio": 0.3,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7975,
        "closedRatio": 0.3,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 21,
        "width": 23,
        "height": 2,
        "direction": "left",
        "kind": "gravity",
        "speed": 45,
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
    "id": "level-79",
    "index": 78,
    "name": "La Porte du Satellite",
    "tagline": "Les relais relient les derniers modules autour du commandant.",
    "difficulty": "difficile",
    "theme": "lunar",
    "bossKind": "cryon",
    "bossName": "LE COMMANDANT SÉLÉNITE",
    "bossHp": 14,
    "propKind": "generator",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "parTimeMs": 780000,
    "rows": [
      "#####################################",
      "#@...........................#......#",
      "#..+.........................#......#",
      "#......h...........bp....2...#......#",
      "#..........b..b........X.....#......#",
      "#.###################..###.D.#......#",
      "#.......b...h...X........c...#......#",
      "#....b#......................#......#",
      "#.b...#......................#......#",
      "#....c#..........gbX.b....X..#......#",
      "#.######################..d#.#......#",
      "#...Q......f...b.............#......#",
      "#..........#b.........g......#......#",
      "#.*....X.b.#.................=...!..#",
      "#..b.......#..3.f............#......#",
      "#.#..###################.b##.#......#",
      "#.....................b......#......#",
      "#.........X.....#..b.........#......#",
      "#..............b#....w.......#......#",
      "#...............#............#......#",
      "#.####.b##################...#......#",
      "#...b........X.p..........w..#......#",
      "#..1.................#...Qb..#......#",
      "#....................#.b.....#......#",
      "#....................#.....*.#....E.#",
      "#............................#......#",
      "#####################################"
    ],
    "intro": [
      "Les relais relient les derniers modules autour du commandant.",
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
        "label": "Vaincre LE COMMANDANT SÉLÉNITE",
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
        "total": 2
      },
      {
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les 12 gardes",
        "mandatory": false,
        "total": 12
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
        "periodMs": 7350,
        "closedRatio": 0.3,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7950,
        "closedRatio": 0.3,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 23,
        "width": 25,
        "height": 2,
        "direction": "right",
        "kind": "gravity",
        "speed": 45,
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
          "x": 26,
          "y": 24
        }
      }
    ]
  },
  {
    "id": "level-80",
    "index": 79,
    "name": "Le Miroir des Étoiles",
    "tagline": "Deux axes inversés, quatre sceaux et une ultime chambre gravitationnelle.",
    "difficulty": "difficile",
    "theme": "mirror",
    "bossKind": "cryon",
    "bossName": "LE GARDIEN DES ÉTOILES",
    "bossHp": 14,
    "propKind": "generator",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": true,
    "parTimeMs": 780000,
    "rows": [
      "#############################",
      "#@...................#......#",
      "#..+.................#......#",
      "#.....bb..Q......2f..#......#",
      "#....b...pX.....g....#......#",
      "#.####..#########bD#.#......#",
      "#......wX......b.....#......#",
      "#........#.b.b.......#......#",
      "#........#.b..p......#......#",
      "#...Q..bb#.XwX.......#......#",
      "#.#######..#####.d##.#......#",
      "#.*c.b...............=...!..#",
      "#..b..........#..hb..#......#",
      "#.........3...#.X.b..#......#",
      "#.....h.c....X#.b....#......#",
      "#.##########.b####...#......#",
      "#...........b........#......#",
      "#....X.#b.b..f...Q...#......#",
      "#..1...#b..g.....X...#......#",
      "#.....b#..Q..........#......#",
      "#..................*.#....E.#",
      "#....................#......#",
      "#############################"
    ],
    "intro": [
      "MONDE MIROIR : gauche ↔ droite et haut ↔ bas, au clavier comme au joystick. Les bombes restent normales.",
      "Deux axes inversés, quatre sceaux et une ultime chambre gravitationnelle.",
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
        "label": "Vaincre LE GARDIEN DES ÉTOILES",
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
        "label": "Éliminer les 12 gardes",
        "mandatory": false,
        "total": 12
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
        "periodMs": 7325,
        "closedRatio": 0.3,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7925,
        "closedRatio": 0.3,
        "offsetMs": 3000
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 9000,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 9600,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 2600
      },
      {
        "group": 3,
        "periodMs": 10200,
        "warnMs": 2000,
        "activeMs": 1600,
        "offsetMs": 5200
      }
    ],
    "flows": [
      {
        "x": 2,
        "y": 19,
        "width": 17,
        "height": 2,
        "direction": "left",
        "kind": "gravity",
        "speed": 45,
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
          "x": 18,
          "y": 20
        }
      }
    ]
  }
];
