import type { MapDefinition } from './mapTypes';

/** Niveaux 21–40 : cartes et rencontres fixes, indépendantes des cartes d’origine. */
export const EXTENSION: readonly MapDefinition[] = [
  {
    "id": "level-21",
    "index": 20,
    "name": "Le Parvis du Givre",
    "tagline": "Freinez sur les îlots de pierre avant de viser les générateurs.",
    "difficulty": "normal",
    "theme": "ice",
    "bossKind": "cryon",
    "bossName": "CRYON",
    "bossHp": 8,
    "propKind": "generator",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "slippery": true,
    "parTimeMs": 420000,
    "rows": [
      "#########################",
      "#@...............#......#",
      "#..+.b.p..b......#......#",
      "#..1.....b..#.c..#......#",
      "#...########D....#......#",
      "#.b.........#..f.#......#",
      "#.~~~~~~~~~~#~...#......#",
      "#.~~~~~~~~~~#~.b.#......#",
      "#*.............2.#......#",
      "#..............g.#......#",
      "#.#########......#......#",
      "#..............b.#......#",
      "#.b...#.~~~~~~~..#......#",
      "#.....D.~~~~~~~..=...!..#",
      "#.p...#.~~~~~~h..#......#",
      "#...b.#b.......+.#......#",
      "#..3.w....c.b.b.*#....E.#",
      "#................#......#",
      "#########################"
    ],
    "intro": [
      "Freinez sur les îlots de pierre avant de viser les générateurs.",
      "Faites exploser les trois générateurs pour ouvrir la grille du boss.",
      "La sortie s’ouvre après la victoire sur le boss. Les faux murs cachent deux secrets.",
      "Les portes se ferment par cycles ; elles ne se referment jamais sur votre personnage.",
      "Relâchez la direction avant les îlots de pierre : les personnages et les bombes glissent sur la glace."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Générateurs alimentés par explosion",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre le boss",
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
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les huit gardes",
        "mandatory": false,
        "total": 8
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
      "B": 5500,
      "A": 8000,
      "S": 10500,
      "SS": 12500,
      "SSS": 14000
    },
    "doors": [
      {
        "group": 1,
        "periodMs": 6400,
        "closedRatio": 0.42,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7200,
        "closedRatio": 0.4,
        "offsetMs": 2600
      }
    ]
  },
  {
    "id": "level-22",
    "index": 21,
    "name": "Les Cloîtres Gelés",
    "tagline": "Deux cloîtres et des portes décalées : choisissez votre fenêtre.",
    "difficulty": "normal",
    "theme": "ice",
    "bossKind": "cryon",
    "bossName": "CRYON",
    "bossHp": 8,
    "propKind": "generator",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "slippery": true,
    "parTimeMs": 420000,
    "rows": [
      "#########################",
      "#@...............#......#",
      "#..+.#~p~~b......#......#",
      "#....#~~~~....2..#......#",
      "#....#~~~~.......#......#",
      "#.b#####d####..f.#......#",
      "#................#......#",
      "#.~.~~~~~~~#~~.b.#......#",
      "#*.1.~~~~~~#~~...#......#",
      "#.~.~~~~~~~#~~.g.#......#",
      "#.....b..........#......#",
      "#..####d#####..b.#......#",
      "#.b..............#......#",
      "#................=...!..#",
      "#.p.......b...h..#......#",
      "#...b..b..p....+.#......#",
      "#....w....c.3.b.*#....E.#",
      "#................#......#",
      "#########################"
    ],
    "intro": [
      "Deux cloîtres et des portes décalées : choisissez votre fenêtre.",
      "Faites exploser les trois générateurs pour ouvrir la grille du boss.",
      "La sortie s’ouvre après la victoire sur le boss. Les faux murs cachent deux secrets.",
      "Les portes se ferment par cycles ; elles ne se referment jamais sur votre personnage.",
      "Relâchez la direction avant les îlots de pierre : les personnages et les bombes glissent sur la glace."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Générateurs alimentés par explosion",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre le boss",
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
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les huit gardes",
        "mandatory": false,
        "total": 8
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
      "B": 5500,
      "A": 8000,
      "S": 10500,
      "SS": 12500,
      "SSS": 14000
    },
    "doors": [
      {
        "group": 1,
        "periodMs": 6360,
        "closedRatio": 0.42,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7160,
        "closedRatio": 0.4,
        "offsetMs": 2600
      }
    ]
  },
  {
    "id": "level-23",
    "index": 22,
    "name": "La Galerie des Cristaux",
    "tagline": "Les piliers arrêtent les bombes glissantes ; visez depuis les traverses.",
    "difficulty": "difficile",
    "theme": "ice",
    "bossKind": "cryon",
    "bossName": "CRYON",
    "bossHp": 8,
    "propKind": "generator",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "slippery": true,
    "parTimeMs": 420000,
    "rows": [
      "#########################",
      "#@...............#......#",
      "#..+.1.p..b......#......#",
      "#.~~~..#.b....c..#......#",
      "#.~~~~.#....#....#......#",
      "#.~~~~.#....#..f.#......#",
      "#...........C....#......#",
      "#.##C###....#..b.#......#",
      "#*.......~~~#~~~.#......#",
      "#........~~~~~~g.#......#",
      "#.....b..~~~~~~~.#......#",
      "#..............b.#......#",
      "#.b.......####C..#......#",
      "#..............2.=...!..#",
      "#.p.......b...h..#......#",
      "#...b..b.......+.#......#",
      "#.3..w....c.b.b.*#....E.#",
      "#................#......#",
      "#########################"
    ],
    "intro": [
      "Les piliers arrêtent les bombes glissantes ; visez depuis les traverses.",
      "Faites exploser les trois générateurs pour ouvrir la grille du boss.",
      "La sortie s’ouvre après la victoire sur le boss. Les faux murs cachent deux secrets.",
      "Relâchez la direction avant les îlots de pierre : les personnages et les bombes glissent sur la glace."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Générateurs alimentés par explosion",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre le boss",
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
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les huit gardes",
        "mandatory": false,
        "total": 8
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
      "B": 5500,
      "A": 8000,
      "S": 10500,
      "SS": 12500,
      "SSS": 14000
    }
  },
  {
    "id": "level-24",
    "index": 23,
    "name": "Le Dégel du Sanctuaire",
    "tagline": "Glace, portes et dalles : quittez les couloirs avant leur fermeture.",
    "difficulty": "difficile",
    "theme": "ice",
    "bossKind": "cryon",
    "bossName": "CRYON",
    "bossHp": 8,
    "propKind": "generator",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "slippery": true,
    "parTimeMs": 420000,
    "rows": [
      "#########################",
      "#@...............#......#",
      "#..+.bPp..b...2..#......#",
      "#........b....c..#......#",
      "#..###P#######...#......#",
      "#.~~~~~.#...b..f.#......#",
      "#..~~~~.#........#......#",
      "#.1.~~~.P......b.#......#",
      "#*.~~~~.#........#......#",
      "#.P............g.#......#",
      "#...#######P##...#......#",
      "#........~~~~~~~.#......#",
      "#.b.#....~~~~~~~.#......#",
      "#...#....~~~~~~~.=...!..#",
      "#.p.#....~~~~~h~.#......#",
      "#...#..b..p...P+.#......#",
      "#....w....3.b.b.*#....E.#",
      "#................#......#",
      "#########################"
    ],
    "intro": [
      "Glace, portes et dalles : quittez les couloirs avant leur fermeture.",
      "Faites exploser les trois générateurs pour ouvrir la grille du boss.",
      "La sortie s’ouvre après la victoire sur le boss. Les faux murs cachent deux secrets.",
      "Relâchez la direction avant les îlots de pierre : les personnages et les bombes glissent sur la glace.",
      "Une dalle piégée frappe après un bref délai : continuez à avancer."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Générateurs alimentés par explosion",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre le boss",
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
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les huit gardes",
        "mandatory": false,
        "total": 8
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
      "B": 5500,
      "A": 8000,
      "S": 10500,
      "SS": 12500,
      "SSS": 14000
    }
  },
  {
    "id": "level-25",
    "index": 24,
    "name": "Les Rives Incandescentes",
    "tagline": "Contournez les bassins de lave pour ouvrir les trois valves dans l’ordre.",
    "difficulty": "normal",
    "theme": "volcano",
    "bossKind": "magmaron",
    "bossName": "MAGMARON",
    "bossHp": 8,
    "propKind": "valve",
    "orderedProps": true,
    "secretCount": 2,
    "mirrorControls": false,
    "slippery": false,
    "parTimeMs": 420000,
    "rows": [
      "#########################",
      "#@...............#......#",
      "#..+.b.p..b.LL...#......#",
      "#..1.....b..LLc..#......#",
      "#................#......#",
      "#.b####V#####..f.#......#",
      "#................#......#",
      "#....LL..#.....b.#......#",
      "#*...LL..V....2..#......#",
      "#....LL..#.....g.#......#",
      "#.....b..#.......#......#",
      "#..............b.#......#",
      "#.b.######V###...#......#",
      "#................=...!..#",
      "#.p.......b...h..#......#",
      "#...b..b.......+.#......#",
      "#..3.w....c.b.b.*#....E.#",
      "#................#......#",
      "#########################"
    ],
    "intro": [
      "Contournez les bassins de lave pour ouvrir les trois valves dans l’ordre.",
      "Activez les valves dans l’ordre 1, 2, 3 pour ouvrir la grille du boss.",
      "La sortie s’ouvre après la victoire sur le boss. Les faux murs cachent deux secrets.",
      "Attendez la fin de l’éruption des évents avant de traverser."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Valves activées dans l’ordre",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre le boss",
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
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les huit gardes",
        "mandatory": false,
        "total": 8
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
      "B": 5500,
      "A": 8000,
      "S": 10500,
      "SS": 12500,
      "SSS": 14000
    },
    "vents": [
      {
        "group": 1,
        "periodMs": 7440,
        "warnMs": 1400,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 8040,
        "warnMs": 1400,
        "activeMs": 1700,
        "offsetMs": 2100
      }
    ]
  },
  {
    "id": "level-26",
    "index": 25,
    "name": "Le Pont des Éruptions",
    "tagline": "Trois traverses sûres séparent les évents ; gardez une voie de repli.",
    "difficulty": "difficile",
    "theme": "volcano",
    "bossKind": "magmaron",
    "bossName": "MAGMARON",
    "bossHp": 9,
    "propKind": "valve",
    "orderedProps": true,
    "secretCount": 2,
    "mirrorControls": false,
    "slippery": false,
    "parTimeMs": 480000,
    "rows": [
      "#########################",
      "#@...............#......#",
      "#..+.b#p..b......#......#",
      "#.....#..b....2..#......#",
      "#.....#..........#......#",
      "#.b.........b..f.#......#",
      "#.##V#####V####..#......#",
      "#......LL......b.#......#",
      "#*.....LL........#......#",
      "#..1...LL......g.#......#",
      "#.....b..........#......#",
      "#.####V#####V##b.#......#",
      "#.b..............#......#",
      "#..........#LL...=...!..#",
      "#.p.......b#LLh..#......#",
      "#...b..b..p#LL.+.#......#",
      "#....w..3.c.b.b.*#....E.#",
      "#................#......#",
      "#########################"
    ],
    "intro": [
      "Trois traverses sûres séparent les évents ; gardez une voie de repli.",
      "Activez les valves dans l’ordre 1, 2, 3 pour ouvrir la grille du boss.",
      "La sortie s’ouvre après la victoire sur le boss. Les faux murs cachent deux secrets.",
      "Attendez la fin de l’éruption des évents avant de traverser."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Valves activées dans l’ordre",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre le boss",
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
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les huit gardes",
        "mandatory": false,
        "total": 8
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
      "B": 5500,
      "A": 8000,
      "S": 10500,
      "SS": 12500,
      "SSS": 14000
    },
    "vents": [
      {
        "group": 1,
        "periodMs": 7400,
        "warnMs": 1400,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 8000,
        "warnMs": 1400,
        "activeMs": 1700,
        "offsetMs": 2100
      }
    ]
  },
  {
    "id": "level-27",
    "index": 26,
    "name": "Les Fourneaux Jumeaux",
    "tagline": "Deux fourneaux décalés : traversez après l’avertissement jaune.",
    "difficulty": "difficile",
    "theme": "volcano",
    "bossKind": "magmaron",
    "bossName": "MAGMARON",
    "bossHp": 9,
    "propKind": "valve",
    "orderedProps": true,
    "secretCount": 2,
    "mirrorControls": false,
    "slippery": false,
    "parTimeMs": 480000,
    "rows": [
      "#########################",
      "#@...............#......#",
      "#..+.b.p..b......#......#",
      "#........b....c..#......#",
      "#...####V####....#......#",
      "#.b.#.......b#.f.#......#",
      "#...#.LL.....#...#......#",
      "#...V.LL.....#.b.#......#",
      "#*1.#.LL..LL.V.2.#......#",
      "#...#.....LL.#.g.#......#",
      "#...#.b...LL.#...#......#",
      "#..............b.#......#",
      "#.b..............#......#",
      "#...####V####....=...!..#",
      "#.p.......b...h..#......#",
      "#...b..b.......+.#......#",
      "#....w..3.c.b.b.*#....E.#",
      "#................#......#",
      "#########################"
    ],
    "intro": [
      "Deux fourneaux décalés : traversez après l’avertissement jaune.",
      "Activez les valves dans l’ordre 1, 2, 3 pour ouvrir la grille du boss.",
      "La sortie s’ouvre après la victoire sur le boss. Les faux murs cachent deux secrets.",
      "Attendez la fin de l’éruption des évents avant de traverser.",
      "Une coulée annoncée gagne le nord de l’arène ; le passage sud reste ouvert."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Valves activées dans l’ordre",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre le boss",
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
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les huit gardes",
        "mandatory": false,
        "total": 8
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
      "B": 5500,
      "A": 8000,
      "S": 10500,
      "SS": 12500,
      "SSS": 14000
    },
    "lavaFlow": {
      "cells": [
        {
          "x": 20,
          "y": 2
        },
        {
          "x": 20,
          "y": 3
        },
        {
          "x": 20,
          "y": 4
        },
        {
          "x": 20,
          "y": 5
        }
      ],
      "firstMs": 90000,
      "intervalMs": 20000,
      "warnMs": 4200
    },
    "vents": [
      {
        "group": 1,
        "periodMs": 7360,
        "warnMs": 1400,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7960,
        "warnMs": 1400,
        "activeMs": 1700,
        "offsetMs": 2100
      }
    ]
  },
  {
    "id": "level-28",
    "index": 27,
    "name": "La Faille des Valves",
    "tagline": "Les valves imposent un détour ; les bombes nettoient les alcôves.",
    "difficulty": "difficile",
    "theme": "volcano",
    "bossKind": "magmaron",
    "bossName": "MAGMARON",
    "bossHp": 9,
    "propKind": "valve",
    "orderedProps": true,
    "secretCount": 2,
    "mirrorControls": false,
    "slippery": false,
    "parTimeMs": 480000,
    "rows": [
      "#########################",
      "#@...............#......#",
      "#..+.bPp..b......#......#",
      "#...1...#b..LLc..#......#",
      "#.......#...LL...#......#",
      "#.b.....P...LL.f.#......#",
      "#.......#........#......#",
      "#.......#......b.#......#",
      "#*###P##..###P##.#......#",
      "#.P............g.#......#",
      "#..LL.b.#........#......#",
      "#..LL...#......b.#......#",
      "#.bLL...P........#......#",
      "#.......#........=...!..#",
      "#.p.....#.b...h..#......#",
      "#...b..b#....2P+.#......#",
      "#.3..w....c.b.b.*#....E.#",
      "#................#......#",
      "#########################"
    ],
    "intro": [
      "Les valves imposent un détour ; les bombes nettoient les alcôves.",
      "Activez les valves dans l’ordre 1, 2, 3 pour ouvrir la grille du boss.",
      "La sortie s’ouvre après la victoire sur le boss. Les faux murs cachent deux secrets.",
      "Une dalle piégée frappe après un bref délai : continuez à avancer."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Valves activées dans l’ordre",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre le boss",
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
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les huit gardes",
        "mandatory": false,
        "total": 8
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
      "B": 5500,
      "A": 8000,
      "S": 10500,
      "SS": 12500,
      "SSS": 14000
    }
  },
  {
    "id": "level-29",
    "index": 28,
    "name": "La Couronne du Magma",
    "tagline": "Le cœur reste dangereux ; circulez par les galeries périphériques.",
    "difficulty": "difficile",
    "theme": "volcano",
    "bossKind": "magmaron",
    "bossName": "MAGMARON",
    "bossHp": 9,
    "propKind": "valve",
    "orderedProps": true,
    "secretCount": 2,
    "mirrorControls": false,
    "slippery": false,
    "parTimeMs": 480000,
    "rows": [
      "#########################",
      "#@...............#......#",
      "#..+.b.p..b......#......#",
      "#..1.....b....c..#......#",
      "#................#......#",
      "#.b..###V###b..f.#......#",
      "#....#.....#..2..#......#",
      "#....#.LL..#...b.#......#",
      "#*...V.LL..V.....#......#",
      "#....#.....#...g.#......#",
      "#....#b....#.....#......#",
      "#....###V###...b.#......#",
      "#.b..........LL..#......#",
      "#............LL..=...!..#",
      "#.p.......b..Lh..#......#",
      "#...b..b3......+.#......#",
      "#....w....c.b.b.*#....E.#",
      "#................#......#",
      "#########################"
    ],
    "intro": [
      "Le cœur reste dangereux ; circulez par les galeries périphériques.",
      "Activez les valves dans l’ordre 1, 2, 3 pour ouvrir la grille du boss.",
      "La sortie s’ouvre après la victoire sur le boss. Les faux murs cachent deux secrets.",
      "Attendez la fin de l’éruption des évents avant de traverser.",
      "Une coulée annoncée gagne le nord de l’arène ; le passage sud reste ouvert."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Valves activées dans l’ordre",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre le boss",
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
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les huit gardes",
        "mandatory": false,
        "total": 8
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
      "B": 5500,
      "A": 8000,
      "S": 10500,
      "SS": 12500,
      "SSS": 14000
    },
    "lavaFlow": {
      "cells": [
        {
          "x": 20,
          "y": 2
        },
        {
          "x": 20,
          "y": 3
        },
        {
          "x": 20,
          "y": 4
        },
        {
          "x": 20,
          "y": 5
        }
      ],
      "firstMs": 75000,
      "intervalMs": 20000,
      "warnMs": 4200
    },
    "vents": [
      {
        "group": 1,
        "periodMs": 7280,
        "warnMs": 1400,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7880,
        "warnMs": 1400,
        "activeMs": 1700,
        "offsetMs": 2100
      }
    ]
  },
  {
    "id": "level-30",
    "index": 29,
    "name": "Le Miroir des Failles",
    "tagline": "MONDE MIROIR : les deux axes sont inversés ; les portails relient les ailes.",
    "difficulty": "difficile",
    "theme": "dimension",
    "bossKind": "gardien",
    "bossName": "LE GARDIEN",
    "bossHp": 9,
    "propKind": "relic",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": true,
    "slippery": false,
    "parTimeMs": 480000,
    "rows": [
      "#########################",
      "#@...............#......#",
      "#..+.b.p..b......#......#",
      "#..1.....b....c..#......#",
      "#................#......#",
      "#.b##D##..##D##f.#......#",
      "#................#......#",
      "#...XX..#...XX.b.#......#",
      "#*..XX..#...XX...#......#",
      "#...XX..#...X.2g.#......#",
      "#.....b.#........#......#",
      "#..............b.#......#",
      "#.b##D##..##D##..#......#",
      "#................=...!..#",
      "#.p.......b...h..#......#",
      "#...b..b.......+.#......#",
      "#....w3...c.b.b.*#....E.#",
      "#................#......#",
      "#########################"
    ],
    "intro": [
      "MONDE MIROIR : les deux axes sont inversés ; les portails relient les ailes.",
      "Rassemblez les trois reliques pour ouvrir la grille du boss.",
      "La sortie s’ouvre après la victoire sur le boss. Les faux murs cachent deux secrets.",
      "Les portes se ferment par cycles ; elles ne se referment jamais sur votre personnage.",
      "Les anneaux portant la même lettre sont reliés. La destination doit être libre et sans danger imminent ; ressortez de l’anneau pour le réutiliser.",
      "Les champs pulsent : l’avertissement précède toujours la phase dangereuse."
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
        "label": "Vaincre le boss",
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
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les huit gardes",
        "mandatory": false,
        "total": 8
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
      "B": 5500,
      "A": 8000,
      "S": 10500,
      "SS": 12500,
      "SSS": 14000
    },
    "portals": [
      {
        "a": {
          "x": 2,
          "y": 3
        },
        "b": {
          "x": 15,
          "y": 16
        }
      }
    ],
    "doors": [
      {
        "group": 1,
        "periodMs": 6040,
        "closedRatio": 0.42,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 6840,
        "closedRatio": 0.4,
        "offsetMs": 2600
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 7240,
        "warnMs": 1400,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7840,
        "warnMs": 1400,
        "activeMs": 1700,
        "offsetMs": 2100
      },
      {
        "group": 3,
        "periodMs": 8440,
        "warnMs": 1400,
        "activeMs": 1800,
        "offsetMs": 4200
      }
    ]
  },
  {
    "id": "level-31",
    "index": 30,
    "name": "Le Réseau Néon",
    "tagline": "Alimentez les générateurs par explosion et traversez les portes automatiques.",
    "difficulty": "normal",
    "theme": "electric",
    "bossKind": "gardien",
    "bossName": "LE GARDIEN",
    "bossHp": 10,
    "propKind": "generator",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "slippery": false,
    "parTimeMs": 540000,
    "rows": [
      "#########################",
      "#@...............#......#",
      "#..+.b.p..b......#......#",
      "#..1.....b....c..#......#",
      "#................#......#",
      "#.b###D#######.f.#......#",
      "#......#.........#......#",
      "#......#..XXX..b.#......#",
      "#*.....D..XXX.2..#......#",
      "#......#.......g.#......#",
      "#.....b..........#......#",
      "#..########D##.b.#......#",
      "#.b..............#......#",
      "#................=...!..#",
      "#.p.......b...h..#......#",
      "#...b..b.......+.#......#",
      "#..3.w....c.b.b.*#....E.#",
      "#................#......#",
      "#########################"
    ],
    "intro": [
      "Alimentez les générateurs par explosion et traversez les portes automatiques.",
      "Faites exploser les trois générateurs pour ouvrir la grille du boss.",
      "La sortie s’ouvre après la victoire sur le boss. Les faux murs cachent deux secrets.",
      "Les portes se ferment par cycles ; elles ne se referment jamais sur votre personnage.",
      "Les champs pulsent : l’avertissement précède toujours la phase dangereuse."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Générateurs alimentés par explosion",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre le boss",
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
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les huit gardes",
        "mandatory": false,
        "total": 8
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
      "B": 5500,
      "A": 8000,
      "S": 10500,
      "SS": 12500,
      "SSS": 14000
    },
    "doors": [
      {
        "group": 1,
        "periodMs": 6000,
        "closedRatio": 0.42,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 6800,
        "closedRatio": 0.4,
        "offsetMs": 2600
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 7200,
        "warnMs": 1400,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7800,
        "warnMs": 1400,
        "activeMs": 1700,
        "offsetMs": 2100
      },
      {
        "group": 3,
        "periodMs": 8400,
        "warnMs": 1400,
        "activeMs": 1800,
        "offsetMs": 4200
      }
    ]
  },
  {
    "id": "level-32",
    "index": 31,
    "name": "Les Transformateurs",
    "tagline": "Les champs énergétiques alternent ; les niches protègent vos préparatifs.",
    "difficulty": "difficile",
    "theme": "electric",
    "bossKind": "gardien",
    "bossName": "LE GARDIEN",
    "bossHp": 10,
    "propKind": "generator",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "slippery": false,
    "parTimeMs": 540000,
    "rows": [
      "#########################",
      "#@...............#......#",
      "#..+.b.p..b......#......#",
      "#........b....c..#......#",
      "#..##X##..#####..#......#",
      "#.b.........b..2.#......#",
      "#.......#........#......#",
      "#...XX..#...XX.b.#......#",
      "#*1.XX..X...XX...#......#",
      "#...XX..#...XX.g.#......#",
      "#.....b.#........#......#",
      "#..............b.#......#",
      "#.b#####..##X##..#......#",
      "#................=...!..#",
      "#.p.......b...h..#......#",
      "#...b..b..p....+.#......#",
      "#....w...3c.b.b.*#....E.#",
      "#................#......#",
      "#########################"
    ],
    "intro": [
      "Les champs énergétiques alternent ; les niches protègent vos préparatifs.",
      "Faites exploser les trois générateurs pour ouvrir la grille du boss.",
      "La sortie s’ouvre après la victoire sur le boss. Les faux murs cachent deux secrets.",
      "Les champs pulsent : l’avertissement précède toujours la phase dangereuse."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Générateurs alimentés par explosion",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre le boss",
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
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les huit gardes",
        "mandatory": false,
        "total": 8
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
      "B": 5500,
      "A": 8000,
      "S": 10500,
      "SS": 12500,
      "SSS": 14000
    },
    "toxic": [
      {
        "group": 1,
        "periodMs": 7160,
        "warnMs": 1400,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7760,
        "warnMs": 1400,
        "activeMs": 1700,
        "offsetMs": 2100
      },
      {
        "group": 3,
        "periodMs": 8360,
        "warnMs": 1400,
        "activeMs": 1800,
        "offsetMs": 4200
      }
    ]
  },
  {
    "id": "level-33",
    "index": 32,
    "name": "Le Circuit des Portails",
    "tagline": "Les portails A et B raccourcissent les trajets entre les générateurs.",
    "difficulty": "difficile",
    "theme": "electric",
    "bossKind": "gardien",
    "bossName": "LE GARDIEN",
    "bossHp": 10,
    "propKind": "generator",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "slippery": false,
    "parTimeMs": 540000,
    "rows": [
      "#########################",
      "#@...............#......#",
      "#..+.b#p..b......#......#",
      "#..1..#..b....c..#......#",
      "#.....#..........#......#",
      "#.b...#.....b..f.#......#",
      "#................#......#",
      "#.###d########.b.#......#",
      "#*.........#.....#......#",
      "#......XX..d...g.#......#",
      "#.....bXX..#..2..#......#",
      "#..........#...b.#......#",
      "#.b..............#......#",
      "#...######d####..=...!..#",
      "#.p.......b...h..#......#",
      "#...b..b.......+.#......#",
      "#..3.w....c.b.b.*#....E.#",
      "#................#......#",
      "#########################"
    ],
    "intro": [
      "Les portails A et B raccourcissent les trajets entre les générateurs.",
      "Faites exploser les trois générateurs pour ouvrir la grille du boss.",
      "La sortie s’ouvre après la victoire sur le boss. Les faux murs cachent deux secrets.",
      "Les portes se ferment par cycles ; elles ne se referment jamais sur votre personnage.",
      "Les anneaux portant la même lettre sont reliés. La destination doit être libre et sans danger imminent ; ressortez de l’anneau pour le réutiliser.",
      "Les champs pulsent : l’avertissement précède toujours la phase dangereuse."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Générateurs alimentés par explosion",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre le boss",
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
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les huit gardes",
        "mandatory": false,
        "total": 8
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
      "B": 5500,
      "A": 8000,
      "S": 10500,
      "SS": 12500,
      "SSS": 14000
    },
    "portals": [
      {
        "a": {
          "x": 2,
          "y": 3
        },
        "b": {
          "x": 15,
          "y": 16
        }
      }
    ],
    "doors": [
      {
        "group": 1,
        "periodMs": 5920,
        "closedRatio": 0.42,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 6720,
        "closedRatio": 0.4,
        "offsetMs": 2600
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 7120,
        "warnMs": 1400,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7720,
        "warnMs": 1400,
        "activeMs": 1700,
        "offsetMs": 2100
      },
      {
        "group": 3,
        "periodMs": 8320,
        "warnMs": 1400,
        "activeMs": 1800,
        "offsetMs": 4200
      }
    ]
  },
  {
    "id": "level-34",
    "index": 33,
    "name": "Le Palais des Arcs",
    "tagline": "Combinez les passages temporisés et les décharges annoncées.",
    "difficulty": "difficile",
    "theme": "electric",
    "bossKind": "gardien",
    "bossName": "LE GARDIEN",
    "bossHp": 10,
    "propKind": "generator",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "slippery": false,
    "parTimeMs": 540000,
    "rows": [
      "#########################",
      "#@...............#......#",
      "#..+.bPp..b......#......#",
      "#........b....c2.#......#",
      "#...####D####....#......#",
      "#.b.#.......b..f.#......#",
      "#...#..XXX.......#......#",
      "#...#..XXX.....b.#......#",
      "#*1..............#......#",
      "#.P.####D####..g.#......#",
      "#.....b......#...#......#",
      "#......XXX...#.b.#......#",
      "#.b....XXX...#...#......#",
      "#................=...!..#",
      "#.p.####D####.h..#......#",
      "#...b..b......P+.#......#",
      "#....w...3c.b.b.*#....E.#",
      "#................#......#",
      "#########################"
    ],
    "intro": [
      "Combinez les passages temporisés et les décharges annoncées.",
      "Faites exploser les trois générateurs pour ouvrir la grille du boss.",
      "La sortie s’ouvre après la victoire sur le boss. Les faux murs cachent deux secrets.",
      "Les portes se ferment par cycles ; elles ne se referment jamais sur votre personnage.",
      "Les champs pulsent : l’avertissement précède toujours la phase dangereuse.",
      "Une dalle piégée frappe après un bref délai : continuez à avancer."
    ],
    "objectives": [
      {
        "id": "props",
        "label": "Générateurs alimentés par explosion",
        "mandatory": true,
        "total": 3
      },
      {
        "id": "boss",
        "label": "Vaincre le boss",
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
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les huit gardes",
        "mandatory": false,
        "total": 8
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
      "B": 5500,
      "A": 8000,
      "S": 10500,
      "SS": 12500,
      "SSS": 14000
    },
    "doors": [
      {
        "group": 1,
        "periodMs": 5880,
        "closedRatio": 0.42,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 6680,
        "closedRatio": 0.4,
        "offsetMs": 2600
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 7080,
        "warnMs": 1400,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7680,
        "warnMs": 1400,
        "activeMs": 1700,
        "offsetMs": 2100
      },
      {
        "group": 3,
        "periodMs": 8280,
        "warnMs": 1400,
        "activeMs": 1800,
        "offsetMs": 4200
      }
    ]
  },
  {
    "id": "level-35",
    "index": 34,
    "name": "Les Îles Suspendues",
    "tagline": "Les arches instables s’ouvrent par cycles ; traversez d’île en île.",
    "difficulty": "difficile",
    "theme": "dimension",
    "bossKind": "gardien",
    "bossName": "LE GARDIEN",
    "bossHp": 10,
    "propKind": "relic",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "slippery": false,
    "parTimeMs": 540000,
    "rows": [
      "#########################",
      "#@...............#......#",
      "#..+.b.p..b......#......#",
      "#...1...#b....c..#......#",
      "#.......#........#......#",
      "#.b##D##D...b.2f.#......#",
      "#.......#........#......#",
      "#...XX.........b.#......#",
      "#*..XX....##D##..#......#",
      "#...XX.........g.#......#",
      "#.....b.#........#......#",
      "#.......#...XX.b.#......#",
      "#.b##D###...XX...#......#",
      "#.......#...XX...=...!..#",
      "#.p.....#.b...h..#......#",
      "#...b..b.......+.#......#",
      "#..3.w....c.b.b.*#....E.#",
      "#................#......#",
      "#########################"
    ],
    "intro": [
      "Les arches instables s’ouvrent par cycles ; traversez d’île en île.",
      "Rassemblez les trois reliques pour ouvrir la grille du boss.",
      "La sortie s’ouvre après la victoire sur le boss. Les faux murs cachent deux secrets.",
      "Les portes se ferment par cycles ; elles ne se referment jamais sur votre personnage.",
      "Les anneaux portant la même lettre sont reliés. La destination doit être libre et sans danger imminent ; ressortez de l’anneau pour le réutiliser.",
      "Les champs pulsent : l’avertissement précède toujours la phase dangereuse."
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
        "label": "Vaincre le boss",
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
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les huit gardes",
        "mandatory": false,
        "total": 8
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
      "B": 5500,
      "A": 8000,
      "S": 10500,
      "SS": 12500,
      "SSS": 14000
    },
    "portals": [
      {
        "a": {
          "x": 2,
          "y": 3
        },
        "b": {
          "x": 15,
          "y": 16
        }
      }
    ],
    "doors": [
      {
        "group": 1,
        "periodMs": 5840,
        "closedRatio": 0.42,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 6640,
        "closedRatio": 0.4,
        "offsetMs": 2600
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 7040,
        "warnMs": 1400,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7640,
        "warnMs": 1400,
        "activeMs": 1700,
        "offsetMs": 2100
      },
      {
        "group": 3,
        "periodMs": 8240,
        "warnMs": 1400,
        "activeMs": 1800,
        "offsetMs": 4200
      }
    ]
  },
  {
    "id": "level-36",
    "index": 35,
    "name": "Le Labyrinthe des Échos",
    "tagline": "Trois couloirs décalés et deux portails : préparez votre itinéraire.",
    "difficulty": "difficile",
    "theme": "dimension",
    "bossKind": "gardien",
    "bossName": "LE GARDIEN",
    "bossHp": 11,
    "propKind": "relic",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "slippery": false,
    "parTimeMs": 600000,
    "rows": [
      "#########################",
      "#@...............#......#",
      "#..+.bPp..b..#...#......#",
      "#..1.....b...#c..#......#",
      "#............#...#......#",
      "#.####P#####b..f.#......#",
      "#.....XXX........#......#",
      "#.....XXX......b.#......#",
      "#*...............#......#",
      "#.P..######P###g.#......#",
      "#...#.b...XXX....#......#",
      "#...#.....XXX..b.#......#",
      "#.b.#............#......#",
      "#.####P#####...2.=...!..#",
      "#.p.......b...h..#......#",
      "#...b..b......P+.#......#",
      "#....w..3.c.b.b.*#....E.#",
      "#................#......#",
      "#########################"
    ],
    "intro": [
      "Trois couloirs décalés et deux portails : préparez votre itinéraire.",
      "Rassemblez les trois reliques pour ouvrir la grille du boss.",
      "La sortie s’ouvre après la victoire sur le boss. Les faux murs cachent deux secrets.",
      "Les anneaux portant la même lettre sont reliés. La destination doit être libre et sans danger imminent ; ressortez de l’anneau pour le réutiliser.",
      "Les champs pulsent : l’avertissement précède toujours la phase dangereuse.",
      "Une dalle piégée frappe après un bref délai : continuez à avancer."
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
        "label": "Vaincre le boss",
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
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les huit gardes",
        "mandatory": false,
        "total": 8
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
      "B": 5500,
      "A": 8000,
      "S": 10500,
      "SS": 12500,
      "SSS": 14000
    },
    "portals": [
      {
        "a": {
          "x": 2,
          "y": 3
        },
        "b": {
          "x": 15,
          "y": 16
        }
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 7000,
        "warnMs": 1400,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7600,
        "warnMs": 1400,
        "activeMs": 1700,
        "offsetMs": 2100
      },
      {
        "group": 3,
        "periodMs": 8200,
        "warnMs": 1400,
        "activeMs": 1800,
        "offsetMs": 4200
      }
    ]
  },
  {
    "id": "level-37",
    "index": 36,
    "name": "Les Chambres Hors du Temps",
    "tagline": "Chaque chambre possède son rythme : observez les portes avant de poser une bombe.",
    "difficulty": "difficile",
    "theme": "dimension",
    "bossKind": "gardien",
    "bossName": "LE GARDIEN",
    "bossHp": 11,
    "propKind": "relic",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "slippery": false,
    "parTimeMs": 600000,
    "rows": [
      "#########################",
      "#@...............#......#",
      "#..+.b.p2.b......#......#",
      "#........b....c..#......#",
      "#..#####d#####...#......#",
      "#.b..#.....#b..f.#......#",
      "#....#.XX..#.....#......#",
      "#....#.XX..#...b.#......#",
      "#*.1.d.XX..d.....#......#",
      "#....#.....#...g.#......#",
      "#....#b....#.....#......#",
      "#....#.....#...b.#......#",
      "#.b#####d#####...#......#",
      "#................=...!..#",
      "#.p.......b...h..#......#",
      "#...b..b.......+.#......#",
      "#....w....c.b.3.*#....E.#",
      "#................#......#",
      "#########################"
    ],
    "intro": [
      "Chaque chambre possède son rythme : observez les portes avant de poser une bombe.",
      "Rassemblez les trois reliques pour ouvrir la grille du boss.",
      "La sortie s’ouvre après la victoire sur le boss. Les faux murs cachent deux secrets.",
      "Les portes se ferment par cycles ; elles ne se referment jamais sur votre personnage.",
      "Les anneaux portant la même lettre sont reliés. La destination doit être libre et sans danger imminent ; ressortez de l’anneau pour le réutiliser.",
      "Les champs pulsent : l’avertissement précède toujours la phase dangereuse."
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
        "label": "Vaincre le boss",
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
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les huit gardes",
        "mandatory": false,
        "total": 8
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
      "B": 5500,
      "A": 8000,
      "S": 10500,
      "SS": 12500,
      "SSS": 14000
    },
    "portals": [
      {
        "a": {
          "x": 2,
          "y": 3
        },
        "b": {
          "x": 15,
          "y": 16
        }
      }
    ],
    "doors": [
      {
        "group": 1,
        "periodMs": 5760,
        "closedRatio": 0.42,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 6560,
        "closedRatio": 0.4,
        "offsetMs": 2600
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 6960,
        "warnMs": 1400,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7560,
        "warnMs": 1400,
        "activeMs": 1700,
        "offsetMs": 2100
      },
      {
        "group": 3,
        "periodMs": 8160,
        "warnMs": 1400,
        "activeMs": 1800,
        "offsetMs": 4200
      }
    ]
  },
  {
    "id": "level-38",
    "index": 37,
    "name": "La Spirale Brisée",
    "tagline": "Les galeries concentriques mélangent dalles, passages et failles.",
    "difficulty": "difficile",
    "theme": "dimension",
    "bossKind": "gardien",
    "bossName": "LE GARDIEN",
    "bossHp": 11,
    "propKind": "relic",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "slippery": false,
    "parTimeMs": 600000,
    "rows": [
      "#########################",
      "#@...............#......#",
      "#.1+.bPp..b......#......#",
      "#........b....c..#......#",
      "#..#####D#####...#......#",
      "#.b#........b.#f.#......#",
      "#..#..........#..#......#",
      "#..#..#####...#b.#......#",
      "#*.D..#........2.#......#",
      "#.P#..#..XXX..#g.#......#",
      "#..#..#..XXX..D..#......#",
      "#..#..#.......#b.#......#",
      "#.b...........#..#......#",
      "#.............#..=...!..#",
      "#.p#######D###h..#......#",
      "#...b..b......P+.#......#",
      "#....w..3.c.b.b.*#....E.#",
      "#................#......#",
      "#########################"
    ],
    "intro": [
      "Les galeries concentriques mélangent dalles, passages et failles.",
      "Rassemblez les trois reliques pour ouvrir la grille du boss.",
      "La sortie s’ouvre après la victoire sur le boss. Les faux murs cachent deux secrets.",
      "Les portes se ferment par cycles ; elles ne se referment jamais sur votre personnage.",
      "Les anneaux portant la même lettre sont reliés. La destination doit être libre et sans danger imminent ; ressortez de l’anneau pour le réutiliser.",
      "Les champs pulsent : l’avertissement précède toujours la phase dangereuse.",
      "Une dalle piégée frappe après un bref délai : continuez à avancer."
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
        "label": "Vaincre le boss",
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
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les huit gardes",
        "mandatory": false,
        "total": 8
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
      "B": 5500,
      "A": 8000,
      "S": 10500,
      "SS": 12500,
      "SSS": 14000
    },
    "portals": [
      {
        "a": {
          "x": 2,
          "y": 3
        },
        "b": {
          "x": 15,
          "y": 16
        }
      }
    ],
    "doors": [
      {
        "group": 1,
        "periodMs": 5720,
        "closedRatio": 0.42,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 6520,
        "closedRatio": 0.4,
        "offsetMs": 2600
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 6920,
        "warnMs": 1400,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7520,
        "warnMs": 1400,
        "activeMs": 1700,
        "offsetMs": 2100
      },
      {
        "group": 3,
        "periodMs": 8120,
        "warnMs": 1400,
        "activeMs": 1800,
        "offsetMs": 4200
      }
    ]
  },
  {
    "id": "level-39",
    "index": 38,
    "name": "Le Nexus Instable",
    "tagline": "Réunissez les reliques au milieu des champs alternés et des portails.",
    "difficulty": "difficile",
    "theme": "dimension",
    "bossKind": "gardien",
    "bossName": "LE GARDIEN",
    "bossHp": 11,
    "propKind": "relic",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": false,
    "slippery": false,
    "parTimeMs": 600000,
    "rows": [
      "#########################",
      "#@...............#......#",
      "#..+.bPp..b......#......#",
      "#...1...#b....c..#......#",
      "#.......#........#......#",
      "#.b.....#...b..f.#......#",
      "#.###P##..##P###.#......#",
      "#..............b.#......#",
      "#*..XX......XX...#......#",
      "#.P.XX......XX.2.#......#",
      "#.....b..........#......#",
      "#.###P##..##P###.#......#",
      "#.b.....#........#......#",
      "#.......#........=...!..#",
      "#.p.....#.b...h..#......#",
      "#...b..b#.p...P+.#......#",
      "#...3w....c.b.b.*#....E.#",
      "#................#......#",
      "#########################"
    ],
    "intro": [
      "Réunissez les reliques au milieu des champs alternés et des portails.",
      "Rassemblez les trois reliques pour ouvrir la grille du boss.",
      "La sortie s’ouvre après la victoire sur le boss. Les faux murs cachent deux secrets.",
      "Les anneaux portant la même lettre sont reliés. La destination doit être libre et sans danger imminent ; ressortez de l’anneau pour le réutiliser.",
      "Les champs pulsent : l’avertissement précède toujours la phase dangereuse.",
      "Une dalle piégée frappe après un bref délai : continuez à avancer."
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
        "label": "Vaincre le boss",
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
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les huit gardes",
        "mandatory": false,
        "total": 8
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
      "B": 5500,
      "A": 8000,
      "S": 10500,
      "SS": 12500,
      "SSS": 14000
    },
    "portals": [
      {
        "a": {
          "x": 2,
          "y": 3
        },
        "b": {
          "x": 15,
          "y": 16
        }
      },
      {
        "a": {
          "x": 15,
          "y": 2
        },
        "b": {
          "x": 2,
          "y": 15
        }
      }
    ],
    "toxic": [
      {
        "group": 1,
        "periodMs": 6880,
        "warnMs": 1400,
        "activeMs": 1600,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 7480,
        "warnMs": 1400,
        "activeMs": 1700,
        "offsetMs": 2100
      },
      {
        "group": 3,
        "periodMs": 8080,
        "warnMs": 1400,
        "activeMs": 1800,
        "offsetMs": 4200
      }
    ]
  },
  {
    "id": "level-40",
    "index": 39,
    "name": "Le Miroir du Nexus",
    "tagline": "MONDE MIROIR : portails, glace, décharges et portes composent l’épreuve finale.",
    "difficulty": "difficile",
    "theme": "dimension",
    "bossKind": "gardien",
    "bossName": "LE GARDIEN",
    "bossHp": 11,
    "propKind": "relic",
    "orderedProps": false,
    "secretCount": 2,
    "mirrorControls": true,
    "slippery": true,
    "parTimeMs": 600000,
    "rows": [
      "#########################",
      "#@...............#......#",
      "#..+.bPp..b......#......#",
      "#..1.....b....c..#......#",
      "#................#......#",
      "#.b##D##..##D##f.#......#",
      "#.......#........#......#",
      "#...~~..#..~~..b.#......#",
      "#*..~~..D..~~....#......#",
      "#.P.~~..#..~~.2g.#......#",
      "#.....b.#........#......#",
      "#.......#......b.#......#",
      "#.b##D##..##D##..#......#",
      "#................=...!..#",
      "#.p.......b...h..#......#",
      "#...b..b......P+.#......#",
      "#....w3...c.b.b.*#....E.#",
      "#................#......#",
      "#########################"
    ],
    "intro": [
      "MONDE MIROIR : portails, glace, décharges et portes composent l’épreuve finale.",
      "Rassemblez les trois reliques pour ouvrir la grille du boss.",
      "La sortie s’ouvre après la victoire sur le boss. Les faux murs cachent deux secrets.",
      "Les portes se ferment par cycles ; elles ne se referment jamais sur votre personnage.",
      "Relâchez la direction avant les îlots de pierre : les personnages et les bombes glissent sur la glace.",
      "Les anneaux portant la même lettre sont reliés. La destination doit être libre et sans danger imminent ; ressortez de l’anneau pour le réutiliser.",
      "Une dalle piégée frappe après un bref délai : continuez à avancer."
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
        "label": "Vaincre le boss",
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
        "id": "secrets",
        "label": "Passages secrets découverts",
        "mandatory": false,
        "total": 2
      },
      {
        "id": "kills",
        "label": "Éliminer les huit gardes",
        "mandatory": false,
        "total": 8
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
      "B": 5500,
      "A": 8000,
      "S": 10500,
      "SS": 12500,
      "SSS": 14000
    },
    "portals": [
      {
        "a": {
          "x": 2,
          "y": 3
        },
        "b": {
          "x": 15,
          "y": 16
        }
      },
      {
        "a": {
          "x": 15,
          "y": 2
        },
        "b": {
          "x": 2,
          "y": 15
        }
      }
    ],
    "doors": [
      {
        "group": 1,
        "periodMs": 5640,
        "closedRatio": 0.42,
        "offsetMs": 0
      },
      {
        "group": 2,
        "periodMs": 6440,
        "closedRatio": 0.4,
        "offsetMs": 2600
      }
    ]
  }
];
