import type { InputState } from '../core/types';
import type { MapId } from '../maps';

export interface SelfTestDeps {
  startMap: (id: MapId) => void;
  tick: (ms: number) => void;
  state: () => Record<string, unknown>;
  teleport: (x: number, y: number) => void;
  bomb: () => void;
  blast: (x: number, y: number, r?: number) => void;
  cell: (x: number, y: number) => Record<string, unknown>;
  killBoss: () => void;
  completeProps: () => void;
  scene: () => unknown;
  input: InputState;
}

interface Check {
  name: string;
  ok: boolean;
  detail: string;
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/**
 * Suite d'auto-tests qui pilote le JEU REEL (et non des fonctions isolees) :
 * demarrage de carte, deplacements, collisions, explosions, degats, objectifs,
 * boss et victoire. Complement des tests unitaires, qui eux ne chargent pas
 * le moteur.
 *
 * Utilisation (mode developpement) : `await __BOMBSHIFT__.selfTest()`
 */
export async function runSelfTest(deps: SelfTestDeps): Promise<{
  passed: number;
  failed: number;
  checks: Check[];
}> {
  const checks: Check[] = [];
  const check = (name: string, ok: boolean, detail: unknown = ''): void => {
    checks.push({ name, ok, detail: String(detail) });
  };

  type Scene = {
    player: { lives: number; maxBombs: number; range: number; cell: { x: number; y: number } };
    stats: Record<string, number>;
    bombs: { playerBombCount: number; bombs: { type: string; slide: unknown }[] };
    powerups: { pickups?: { kind: string }[] } & Record<string, unknown>;
    boss: { hp: number; active: boolean; alive: boolean; vulnerable: boolean } | null;
    serialize: () => unknown;
  };
  const sc = (): Scene => deps.scene() as Scene;
  const st = (): Record<string, unknown> => deps.state();
  const player = (): { x: number; y: number } => st().player as { x: number; y: number };

  const start = async (id: MapId): Promise<void> => {
    deps.startMap(id);
    await sleep(420);
    deps.tick(300);
  };

  /* ---------------------------------------------- carte 1 : les bases ---- */
  await start('volcano');
  check('demarrage de la carte', st().phase === 'playing', st().phase);
  check('ennemis en place', (st().enemies as number) >= 10, st().enemies);
  check('trois vies', sc().player.lives === 3 || sc().player.lives === 4, sc().player.lives);

  // deplacement libre
  deps.teleport(1, 1);
  deps.tick(100);
  Object.assign(deps.input, { moveX: 1, moveY: 0, magnitude: 1 });
  deps.tick(700);
  Object.assign(deps.input, { moveX: 0, moveY: 0, magnitude: 0 });
  deps.tick(100);
  check('deplacement horizontal', player().x > 1, JSON.stringify(player()));

  // collision contre le mur de bordure
  const before = player();
  Object.assign(deps.input, { moveX: 0, moveY: -1, magnitude: 1 });
  deps.tick(900);
  Object.assign(deps.input, { moveX: 0, moveY: 0, magnitude: 0 });
  deps.tick(100);
  check('mur infranchissable', player().y === before.y, JSON.stringify(player()));

  // explosion et destruction de bloc
  const kindBefore = deps.cell(4, 1).kind;
  deps.blast(3, 1, 2);
  deps.tick(120);
  check(
    'explosion detruit un bloc',
    kindBefore === 'Block' && deps.cell(4, 1).kind === 'Floor',
    `${kindBefore} -> ${deps.cell(4, 1).kind}`,
  );
  check('mur intact apres explosion', deps.cell(8, 1).kind === 'Wall', deps.cell(8, 1).kind);

  // la bombe du joueur ne le bloque pas
  deps.teleport(2, 1);
  deps.tick(80);
  deps.bomb();
  deps.tick(60);
  Object.assign(deps.input, { moveX: 1, moveY: 0, magnitude: 1 });
  deps.tick(450);
  Object.assign(deps.input, { moveX: 0, moveY: 0, magnitude: 0 });
  check('le joueur quitte sa propre bombe', player().x > 2, JSON.stringify(player()));
  deps.tick(2600);

  // degats par flamme
  const lives0 = sc().player.lives;
  deps.teleport(6, 1);
  deps.tick(80);
  sc().player.lives = lives0;
  (sc().player as unknown as { invulnUntil: number }).invulnUntil = 0;
  deps.blast(6, 1, 2);
  deps.tick(150);
  check('les flammes blessent le joueur', sc().player.lives < lives0, `${lives0} -> ${sc().player.lives}`);

  /* ------------------------------------------- objectifs et boss --------- */
  await start('volcano');
  sc().player.lives = 99;
  deps.teleport(18, 2);
  deps.tick(200);
  const wrongOrder = (st().objectives as string[]).find((o) => o.startsWith('props'));
  check('ordre des valves impose', wrongOrder === 'props:0/3', wrongOrder);

  deps.teleport(2, 15);
  deps.tick(200);
  deps.teleport(18, 2);
  deps.tick(200);
  deps.teleport(12, 10);
  deps.tick(200);
  const done = (st().objectives as string[]).find((o) => o.startsWith('props'));
  check('trois valves activees', done === 'props:3/3', done);
  check('grille du boss ouverte', deps.cell(15, 13).kind === 'Floor', deps.cell(15, 13).kind);

  deps.teleport(18, 13);
  deps.tick(300);
  check('boss active a l\'entree de l\'arene', sc().boss?.active === true, sc().boss?.active);
  check('sortie encore verrouillee', st().exitOpen === false, st().exitOpen);
  deps.killBoss();
  deps.tick(300);
  check('sortie ouverte apres le boss', st().exitOpen === true, st().exitOpen);

  deps.teleport(23, 16);
  deps.tick(250);
  check('victoire validee a la sortie', st().phase === 'victory', st().phase);

  /* ------------------------------------------------ carte 2 : glace ------ */
  await start('ice');
  sc().player.lives = 99;
  const gen = (st().objectives as string[]).find((o) => o.startsWith('props'));
  deps.teleport(10, 2);
  deps.tick(200);
  const afterWalk = (st().objectives as string[]).find((o) => o.startsWith('props'));
  deps.blast(10, 3, 2);
  deps.tick(200);
  const afterBlast = (st().objectives as string[]).find((o) => o.startsWith('props'));
  check(
    'generateur alimente seulement par explosion',
    gen === afterWalk && afterBlast !== afterWalk,
    `${gen} / ${afterWalk} / ${afterBlast}`,
  );

  deps.teleport(2, 15);
  deps.tick(120);
  Object.assign(deps.input, { moveX: 1, moveY: 0, magnitude: 1 });
  deps.tick(320);
  deps.bomb();
  deps.tick(60);
  const slid = sc().bombs.bombs.some((b) => b.type === 'classic' && b.slide !== null);
  Object.assign(deps.input, { moveX: 0, moveY: 0, magnitude: 0 });
  check('bombe qui derape sur la glace', slid, slid);
  deps.tick(2600);

  /* ----------------------------------------------- carte 3 : temple ------ */
  await start('temple');
  sc().player.lives = 99;
  deps.teleport(3, 2);
  deps.tick(120);
  const flameBefore = deps.cell(3, 2).flame;
  deps.tick(900);
  check(
    'dalle piegee a retardement',
    flameBefore === false && deps.cell(3, 2).flame === true,
    `${flameBefore} -> ${deps.cell(3, 2).flame}`,
  );

  deps.teleport(11, 3);
  deps.tick(200);
  deps.teleport(13, 6);
  deps.tick(200);
  deps.teleport(19, 6);
  deps.tick(200);
  check('mecanismes ouvrent la chambre', deps.cell(12, 13).kind === 'Floor', deps.cell(12, 13).kind);

  /* -------------------------------------- sauvegarde de la tentative ----- */
  const snap = sc().serialize();
  check('instantane de partie produit', snap !== null && typeof snap === 'object', typeof snap);

  const failed = checks.filter((c) => !c.ok).length;
  return { passed: checks.length - failed, failed, checks };
}
