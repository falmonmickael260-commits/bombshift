import Phaser from 'phaser';
import { audio } from '../core/audio';
import { BOMB, CAMERA, DIFFICULTIES, PLAYER, TEX, THEME_COLORS, TILE } from '../core/constants';
import { DangerMap, type GridMap } from '../core/grid';
import { Rng } from '../core/rng';
import type { Abilities, RunSnapshot, Settings } from '../core/save';
import {
  TileKind,
  type BombType,
  type EnemyKind,
  type GamePhase,
  type InputState,
  type ObjectiveState,
  type PowerUpKind,
  type Rank,
  type RunStats,
  type ScoreBreakdown,
  type Vec2,
} from '../core/types';
import { BombManager } from '../gameplay/bombs';
import { createBoss, type Boss } from '../gameplay/boss';
import { Coach } from '../gameplay/coach';
import { Enemy } from '../gameplay/enemy';
import { Fx } from '../gameplay/fx';
import { HazardController } from '../gameplay/hazards';
import { bodyCellRange, cellOf, centerOf } from '../gameplay/motion';
import { ObjectiveController } from '../gameplay/objectives';
import { Player } from '../gameplay/player';
import { PowerUpManager } from '../gameplay/powerups';
import { ProjectileManager } from '../gameplay/projectiles';
import { computeScore, emptyStats } from '../gameplay/scoring';
import { TileRenderer } from '../gameplay/tileRenderer';
import type { ProjectileSpec, World } from '../gameplay/worldApi';
import { getMap, parseMap, type MapDefinition, type MapId, type ParsedMap } from '../maps';

export interface HudBossState {
  name: string;
  hp: number;
  maxHp: number;
  phase: number;
  vulnerable: boolean;
}

export interface HudState {
  lives: number;
  maxLives: number;
  bombsActive: number;
  bombsMax: number;
  range: number;
  speed: number;
  pierce: number;
  shieldMs: number;
  timeMs: number;
  score: number;
  objectives: ObjectiveState[];
  boss: HudBossState | null;
  ability: { unlocked: boolean; ratio: number; label: string } | null;
  ability2: { unlocked: boolean; ratio: number; label: string } | null;
  phase: GamePhase;
}

export interface RunResult {
  mapId: MapId;
  victory: boolean;
  stats: RunStats;
  score: ScoreBreakdown;
  rank: Rank;
  objectives: ObjectiveState[];
}

export interface GameSceneData {
  mapId: MapId;
  /** Affiche les conseils contextuels (premiere decouverte de la carte). */
  showHints?: boolean;
  /** Reprise d'une tentative sauvegardee (optionnel). */
  snapshot?: RunSnapshot | null;
  settings: Settings;
  abilities: Abilities;
  input: InputState;
  onHud: (state: HudState) => void;
  onNotify: (text: string, tone: 'info' | 'good' | 'bad') => void;
  onEnd: (result: RunResult) => void;
}

/**
 * Scene de jeu : orchestre tous les systemes.
 *
 * Elle expose un objet `World` aux entites (plutot que de leur donner la scene
 * entiere) afin de garder des dependances explicites et unidirectionnelles.
 */
export class GameScene extends Phaser.Scene {
  static readonly KEY = 'game';

  private cfg!: GameSceneData;
  private def!: MapDefinition;
  private parsed!: ParsedMap;
  private grid!: GridMap;
  private danger!: DangerMap;
  private world!: World;

  private fxLayer!: Fx;
  private tiles!: TileRenderer;
  private player!: Player;
  private bombs!: BombManager;
  private powerups!: PowerUpManager;
  private projectiles!: ProjectileManager;
  private hazards!: HazardController;
  private objectives!: ObjectiveController;
  private boss: Boss | null = null;
  private coach!: Coach;
  private enemies: Enemy[] = [];
  private arena = new Set<number>();

  private stats!: RunStats;
  private elapsed = 0;
  private phase: GamePhase = 'playing';
  private rng = new Rng(1);
  private lastCell: Vec2 = { x: -1, y: -1 };
  private secretsFound = new Set<number>();
  private hudAt = 0;
  private endingAt = 0;
  private bonusBlockSet = new Set<number>();
  private destroyed = false;
  private readonly damageCauses: Record<string, number> = {};
  private dangerMarks: Phaser.GameObjects.Image[] = [];
  private compass: Phaser.GameObjects.Image | null = null;
  private compassLabel: Phaser.GameObjects.Text | null = null;
  private dangerAt = 0;

  constructor() {
    super({ key: GameScene.KEY });
  }

  init(data: GameSceneData): void {
    this.cfg = data;
    this.destroyed = false;
    this.phase = 'playing';
    this.elapsed = 0;
    this.enemies = [];
    this.boss = null;
    this.secretsFound = new Set();
    this.endingAt = 0;
    for (const k of Object.keys(this.damageCauses)) delete this.damageCauses[k];
  }

  create(): void {
    const settings = this.cfg.settings;
    this.def = getMap(this.cfg.mapId);
    this.parsed = parseMap(this.def);
    this.grid = this.parsed.grid;
    this.danger = new DangerMap(this.grid.width, this.grid.height);
    this.rng = new Rng(0x51ed + Date.now() % 100000);
    const profile = DIFFICULTIES[settings.difficulty] ?? DIFFICULTIES.normal;
    this.stats = emptyStats(profile.lives);
    this.bonusBlockSet = new Set(this.parsed.bonusBlocks.map((c) => this.grid.idx(c.x, c.y)));

    const colors = THEME_COLORS[this.def.theme];
    this.cameras.main.setBackgroundColor(colors.bg);

    this.world = this.buildWorld();
    this.fxLayer = new Fx(this);
    this.fxLayer.configure(settings);
    this.tiles = new TileRenderer(this, this.grid, this.def.theme);

    this.player = new Player(this.world, this.parsed.playerSpawn, profile.lives);
    this.bombs = new BombManager(this.world, {
      onTileDestroyed: (cell, kind) => this.onTileDestroyed(cell, kind),
      onBlast: (center, cells) => {
        this.objectives.onBlastCells(cells);
        this.powerups.onBlastCells(cells);
        void center;
      },
    });
    this.powerups = new PowerUpManager(this.world, this.def.theme);
    this.projectiles = new ProjectileManager(this.world);

    this.hazards = new HazardController(this.world, this.parsed, {
      onTileChanged: (cell) => this.tiles.refresh(cell),
      onMechanismComplete: () => {
        const opened = this.grid.openGates(2);
        if (opened > 0) {
          this.refreshAllTiles();
          audio.play('gateOpen');
          this.notify('Chambre de la relique ouverte !', 'good');
        }
      },
      onMechanismProgress: (done) => this.objectives.onMechanismProgress(done),
    });

    this.objectives = new ObjectiveController(this.world, this.parsed, {
      onChanged: () => this.emitHud(true),
      onPropsComplete: () => {
        this.grid.openGates(1);
        this.refreshAllTiles();
      },
      onVictory: () => this.endRun(true),
    });

    // Ennemis initiaux : les gardiens memorisent la case qu'ils protegent.
    for (const spawn of this.parsed.enemies) {
      const home =
        spawn.kind === 'guardian' ? this.nearestPropCell(spawn.cell) ?? spawn.cell : null;
      this.enemies.push(new Enemy(this.world, spawn.kind, spawn.cell, home));
    }

    this.coach = new Coach(this.world, this.cfg.showHints !== false);

    this.arena = this.computeArena(this.parsed.bossSpawn);
    this.boss = createBoss(
      this.world,
      this.def.bossKind,
      this.parsed.bossSpawn,
      this.def.bossHp,
      this.arena,
    );

    this.setupCamera();
    this.setupVignette();
    this.setupCompass();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.setupCamera, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());

    if (this.cfg.snapshot) this.applySnapshot(this.cfg.snapshot);

    // Le mode combat de la musique est propre a une rencontre de boss :
    // il ne doit jamais survivre a une tentative precedente.
    audio.setBossMode(this.boss?.active === true && this.boss.alive);
    audio.playMusic(this.def.theme);
    this.lastCell = { ...this.player.cell };
    this.emitHud(true);
  }

  /* ------------------------------------------------------------- world ---- */

  private buildWorld(): World {
    const self = this;
    return {
      scene: self as Phaser.Scene,
      get grid() {
        return self.grid;
      },
      get danger() {
        return self.danger;
      },
      get def() {
        return self.def;
      },
      get fx() {
        return self.fxLayer;
      },
      get audio() {
        return audio;
      },
      get settings() {
        return self.cfg.settings;
      },
      get difficulty() {
        return DIFFICULTIES[self.cfg.settings.difficulty] ?? DIFFICULTIES.normal;
      },
      get stats() {
        return self.stats;
      },
      get elapsedMs() {
        return self.elapsed;
      },
      playerPos: () => self.player.pos,
      playerCell: () => self.player.cell,
      actorBlocked: (cx, cy, selfCell) => self.actorBlocked(cx, cy, selfCell),
      playerBlocked: (cx, cy) => self.grid.isSolid(cx, cy) || self.bombs.blocksPlayer(cx, cy),
      notify: (text, tone = 'info') => self.notify(text, tone),
      igniteCell: (cell, durationMs, tint) =>
        self.bombs.addFlame(cell, durationMs, tint ?? 0xffffff, undefined, 'world'),
      requestBlast: (cell, range, pierce) => self.bombs.blast(cell, range, pierce),
      spawnProjectile: (spec: ProjectileSpec) => self.projectiles.spawn(spec),
      spawnMinion: (kind: EnemyKind, cell: Vec2) => {
        if (self.enemies.filter((e) => e.alive).length > 18) return;
        self.enemies.push(new Enemy(self.world, kind, cell, null));
        self.fxLayer.shockwave(centerOf(cell), TILE, 0xff7a2f);
      },
      freeCellNear: (cell, radius) => self.freeCellNear(cell, radius),
      hasBombAt: (cell) => self.bombs.bombAt(cell.x, cell.y) !== null,
      onTileChanged: (cell) => self.tiles.refresh(cell),
      spreadToxic: (cell, durationMs) => self.hazards.addTempToxic(cell, durationMs),
    };
  }

  private actorBlocked(cx: number, cy: number, selfCell?: Vec2): boolean {
    if (this.grid.isSolid(cx, cy)) return true;
    return this.bombs.blocksActor(cx, cy, selfCell);
  }

  private freeCellNear(cell: Vec2, radius: number): Vec2 | null {
    const pc = this.player.cell;
    const candidates: Vec2[] = [];
    for (let r = 1; r <= radius; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const c = { x: cell.x + dx, y: cell.y + dy };
          if (!this.grid.inBounds(c.x, c.y)) continue;
          if (this.grid.isSolid(c.x, c.y) || this.grid.isLethalFloor(c.x, c.y)) continue;
          if (this.bombs.bombAt(c.x, c.y)) continue;
          if (c.x === pc.x && c.y === pc.y) continue;
          candidates.push(c);
        }
      }
      if (candidates.length > 0) break;
    }
    if (candidates.length === 0) return null;
    return candidates[this.rng.int(0, candidates.length - 1)];
  }

  /** Region de l'arene du boss : bornee par les murs et les grilles. */
  private computeArena(start: Vec2): Set<number> {
    const seen = new Set<number>();
    const passable = (x: number, y: number): boolean => {
      if (!this.grid.inBounds(x, y)) return false;
      const k = this.grid.kindAt(x, y);
      return k !== TileKind.Wall && k !== TileKind.Crystal && k !== TileKind.Gate;
    };
    if (!passable(start.x, start.y)) return seen;
    const queue = [this.grid.idx(start.x, start.y)];
    seen.add(queue[0]);
    while (queue.length > 0) {
      const cur = queue.pop()!;
      const x = cur % this.grid.width;
      const y = (cur - x) / this.grid.width;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const nx = x + dx;
        const ny = y + dy;
        if (!passable(nx, ny)) continue;
        const ni = this.grid.idx(nx, ny);
        if (seen.has(ni)) continue;
        seen.add(ni);
        queue.push(ni);
      }
    }
    return seen;
  }

  private nearestPropCell(from: Vec2): Vec2 | null {
    let best: Vec2 | null = null;
    let bestD = Infinity;
    for (const p of this.parsed.props) {
      const d = Math.abs(p.cell.x - from.x) + Math.abs(p.cell.y - from.y);
      if (d < bestD) {
        bestD = d;
        best = p.cell;
      }
    }
    return bestD <= 8 ? best : null;
  }

  /* ------------------------------------------------------------ camera ---- */

  private vignette: Phaser.GameObjects.Image | null = null;

  private setupCamera(): void {
    const cam = this.cameras.main;
    const w = this.scale.width;
    const h = this.scale.height;

    // En portrait, on reserve le bas de l'ecran aux commandes : l'arene n'est
    // jamais recouverte par le joystick ou les boutons.
    const portrait = h > w;
    const reserved = portrait ? Math.min(260, Math.max(150, h * 0.26)) : 0;
    const viewH = Math.max(120, h - reserved);
    cam.setViewport(0, 0, w, viewH);

    const tilesX = portrait ? CAMERA.viewTilesX : CAMERA.viewTilesX + 2;
    const tilesY = portrait ? CAMERA.viewTilesY + 1 : CAMERA.viewTilesY;
    const zoom = Math.min(w / (tilesX * TILE), viewH / (tilesY * TILE));
    cam.setZoom(Math.max(CAMERA.minZoom, Math.min(CAMERA.maxZoom, zoom)));
    cam.setBounds(0, 0, this.grid.width * TILE, this.grid.height * TILE);
    if (this.player) cam.centerOn(this.player.pos.x, this.player.pos.y);
    this.positionVignette();
  }

  private setupVignette(): void {
    this.vignette = this.add.image(0, 0, TEX.vignette);
    this.vignette.setScrollFactor(0).setDepth(55).setAlpha(0.55);
    this.positionVignette();
  }

  private positionVignette(): void {
    if (!this.vignette) return;
    const cam = this.cameras.main;
    this.vignette.setPosition(cam.width / 2, cam.height / 2);
    this.vignette.setDisplaySize(cam.width / cam.zoom + 8, cam.height / cam.zoom + 8);
    this.vignette.setScale(
      (cam.width / cam.zoom + 8) / 256,
      (cam.height / cam.zoom + 8) / 256,
    );
  }

  /* -------------------------------------------------------------- loop ---- */

  override update(_time: number, delta: number): void {
    if (this.destroyed || this.phase === 'paused') return;
    const dt = Math.min(50, delta);

    // Partie terminee : on laisse vivre les effets, mais plus aucune entite
    // ne bouge et le joueur conserve son animation de fin.
    if (this.phase === 'victory' || this.phase === 'defeat') {
      this.updateCompass();
      this.player.idleUpdate();
      this.followPlayer(Math.min(50, delta));
      return;
    }

    if (this.phase === 'playing') {
      this.elapsed += dt;
      this.stats.timeMs = this.elapsed;
    }

    this.hazards.update(dt);

    const input = this.cfg.input;
    const intents = this.player.update(dt, input);

    // Les appuis sont a usage unique : un bouton maintenu ne spamme pas d'actions.
    input.bombPressed = false;
    input.abilityPressed = false;
    input.ability2Pressed = false;

    if (this.phase === 'playing') {
      if (intents.wantBomb) this.tryPlaceBomb();
      if (intents.wantAbility) this.tryAbility('shift');
      if (intents.wantAbility2) this.tryAbility('slow');
    }

    // La solidite des bombes est evaluee avant le deplacement, sur l'emprise
    // complete du corps du joueur.
    const span = bodyCellRange(this.player.body);
    this.bombs.refreshPlayerSolidity(span.minX, span.minY, span.maxX, span.maxY);
    this.bombs.update(dt);

    const occupied = new Set<number>();
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const c = e.cell;
      occupied.add(this.grid.idx(c.x, c.y));
    }
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const c = e.cell;
      occupied.delete(this.grid.idx(c.x, c.y));
      e.update(dt, occupied);
      const nc = e.cell;
      occupied.add(this.grid.idx(nc.x, nc.y));
    }

    this.updateBoss(dt);
    this.projectiles.update(dt);
    this.resolveDamage();
    this.handleCellEntry();
    this.objectives.update();
    const taken = this.powerups.tryCollect(this.player);
    if (taken) this.stats.powerupsTaken++;

    this.cleanupDeadEnemies();
    this.coach.update({
      playerCell: this.player.cell,
      bombsPlaced: this.stats.bombsPlaced,
      blocksDestroyed: this.stats.blocksDestroyed,
      powerupsTaken: this.stats.powerupsTaken,
      activeBombs: this.bombs.playerBombCount,
    });
    this.updateDangerHints();
    this.updateCompass();
    this.followPlayer(dt);
    this.emitHud(false);
    this.checkEnd();
  }

  /**
   * Boussole d'objectif : une fleche en bord d'ecran pointe en permanence
   * la prochaine cible (valve, generateur, relique, puis boss, puis sortie).
   * Sans elle, une carte de 25x19 cases vue 10 par 10 se parcourt a l'aveugle.
   */
  private setupCompass(): void {
    this.compass = this.add.image(0, 0, TEX.arrow).setScrollFactor(0).setDepth(80);
    this.compass.setScale(1.25);
    this.compassLabel = this.add
      .text(0, 0, '', {
        fontFamily: 'Impact, "Arial Black", sans-serif',
        fontSize: '13px',
        color: '#ffe0a8',
        stroke: '#1a0b09',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(81);
  }

  private updateCompass(): void {
    const arrow = this.compass;
    const label = this.compassLabel;
    if (!arrow || !label) return;
    if (this.phase !== 'playing') {
      arrow.setVisible(false);
      label.setVisible(false);
      return;
    }

    const boss = this.boss;
    const target = this.objectives.nextTarget(
      this.player.cell,
      boss !== null && boss.alive,
      this.parsed.bossSpawn,
    );
    if (!target) {
      arrow.setVisible(false);
      label.setVisible(false);
      return;
    }

    const tp = centerOf(target);
    const pp = this.player.pos;
    const dx = tp.x - pp.x;
    const dy = tp.y - pp.y;
    const distTiles = Math.round(Math.hypot(dx, dy) / TILE);

    // Inutile de pointer ce qui est deja sous les yeux du joueur.
    if (distTiles <= 3) {
      arrow.setVisible(false);
      label.setVisible(false);
      return;
    }

    const cam = this.cameras.main;
    const vw = cam.width / cam.zoom;
    const vh = cam.height / cam.zoom;
    const angle = Math.atan2(dy, dx);
    const rx = vw / 2 - 34;
    const ry = vh / 2 - 46;
    const cx = vw / 2 + Math.cos(angle) * rx;
    const cy = vh / 2 + Math.sin(angle) * ry;

    arrow.setVisible(true).setPosition(cx, cy).setRotation(angle);
    arrow.setAlpha(0.72 + 0.22 * Math.sin(this.elapsed / 240));
    // L'etiquette se place vers l'interieur de l'ecran, jamais hors cadre.
    label
      .setVisible(true)
      .setPosition(cx - Math.cos(angle) * 26, cy - Math.sin(angle) * 26)
      .setText(`${distTiles}`);
  }

  /** Donnees de la mini-carte affichee en pause. */
  getMinimapData(): {
    width: number;
    height: number;
    tiles: number[];
    player: Vec2;
    exit: Vec2;
    exitOpen: boolean;
    props: { cell: Vec2; done: boolean; index: number }[];
    enemies: Vec2[];
    boss: { cell: Vec2; alive: boolean; active: boolean } | null;
  } {
    const tiles: number[] = new Array(this.grid.width * this.grid.height);
    this.grid.forEachTile((t, x, y) => {
      // Un faux mur non revele reste dessine comme un mur : pas de triche.
      tiles[y * this.grid.width + x] =
        t.kind === TileKind.Secret && !t.revealed ? TileKind.Wall : t.kind;
    });
    return {
      width: this.grid.width,
      height: this.grid.height,
      tiles,
      player: this.player.cell,
      exit: this.parsed.exit,
      exitOpen: this.objectives.exitIsOpen,
      props: this.objectives.propMarkers,
      enemies: this.enemies.filter((e) => e.alive && !e.asleep).map((e) => e.cell),
      boss: this.boss
        ? { cell: this.boss.cell, alive: this.boss.alive, active: this.boss.active }
        : null,
    };
  }

  /**
   * Surcouche optionnelle (reglage "Indices de danger") : marque les cases
   * qui seront soufflees dans la seconde. Mise a jour a 8 Hz et limitee au
   * champ de la camera pour rester gratuite sur mobile.
   */
  private updateDangerHints(): void {
    const enabled = this.cfg.settings.showDangerHints;
    const now = this.time.now;
    if (!enabled) {
      if (this.dangerMarks.length > 0) {
        for (const m of this.dangerMarks) m.setVisible(false);
      }
      return;
    }
    if (now - this.dangerAt < 120) return;
    this.dangerAt = now;

    const cam = this.cameras.main;
    const halfW = cam.width / cam.zoom / 2 + TILE;
    const halfH = cam.height / cam.zoom / 2 + TILE;
    const min = this.grid.worldToCell(cam.midPoint.x - halfW, cam.midPoint.y - halfH);
    const max = this.grid.worldToCell(cam.midPoint.x + halfW, cam.midPoint.y + halfH);

    let used = 0;
    for (let cy = Math.max(0, min.y); cy <= Math.min(this.grid.height - 1, max.y); cy++) {
      for (let cx = Math.max(0, min.x); cx <= Math.min(this.grid.width - 1, max.x); cx++) {
        const t = this.danger.at(cx, cy);
        if (t > 1100 || this.grid.isSolid(cx, cy)) continue;
        if (used >= 60) break;
        let mark = this.dangerMarks[used];
        if (!mark) {
          mark = this.add.image(0, 0, TEX.warning).setDepth(19).setAlpha(0.35);
          this.dangerMarks.push(mark);
        }
        const p = centerOf({ x: cx, y: cy });
        mark.setPosition(p.x, p.y).setVisible(true);
        mark.setAlpha(0.18 + 0.3 * (1 - t / 1100));
        used++;
      }
    }
    for (let i = used; i < this.dangerMarks.length; i++) this.dangerMarks[i].setVisible(false);
  }

  private followPlayer(dt: number): void {
    const cam = this.cameras.main;
    const target = this.player.pos;
    // En paysage, les commandes occupent les coins bas : on remonte legerement
    // le personnage pour qu'il ne passe jamais sous un bouton.
    const landscape = this.scale.width > this.scale.height;
    const offsetY = landscape ? (cam.height / cam.zoom) * 0.09 : 0;
    const lerp = 1 - Math.pow(0.0025, dt / 1000);
    const cx = cam.midPoint.x + (target.x - cam.midPoint.x) * lerp;
    const cy = cam.midPoint.y + (target.y + offsetY - cam.midPoint.y) * lerp;
    cam.centerOn(cx, cy);
    this.positionVignette();
  }

  private updateBoss(dt: number): void {
    const boss = this.boss;
    if (!boss || !boss.alive) return;
    const pc = this.player.cell;
    if (!boss.active && this.arena.has(this.grid.idx(pc.x, pc.y))) {
      boss.activate();
      this.notify(`${this.def.bossName} vous defie !`, 'bad');
    }
    boss.update(dt);
  }

  /* ------------------------------------------------------------ degats ---- */

  private resolveDamage(): void {
    const pc = this.player.cell;

    // Flammes contre le joueur.
    if (this.player.alive && this.bombs.isFlameAt(pc.x, pc.y)) this.damagePlayer('flamme');

    // Sol mortel.
    if (this.player.alive && this.player.standingOnLethalFloor()) this.damagePlayer('sol');

    // Contact ennemi : test au centre, tolerant d'un quart de case.
    if (this.player.alive) {
      const pp = this.player.pos;
      for (const e of this.enemies) {
        if (!e.alive) continue;
        if (Math.hypot(e.pos.x - pp.x, e.pos.y - pp.y) < e.contactRadius + TILE * 0.22) {
          this.damagePlayer('ennemi');
          break;
        }
      }
    }

    // Contact boss et projectiles.
    if (this.player.alive && this.boss?.alive && this.boss.active) {
      const pp = this.player.pos;
      if (Math.hypot(this.boss.x - pp.x, this.boss.y - pp.y) < this.boss.contactRadius + TILE * 0.2) {
        this.damagePlayer('boss');
      }
    }
    if (this.player.alive && this.projectiles.hitsPlayer(this.player.pos, TILE * 0.3)) {
      this.damagePlayer('projectile');
    }

    // Flammes contre les ennemis.
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const c = e.cell;
      if (!this.bombs.isFlameAt(c.x, c.y)) continue;
      e.hit(1);
    }

    // Flammes contre le boss : son empreinte couvre 3x3 cases.
    const boss = this.boss;
    if (boss && boss.alive && boss.active) {
      const bc = boss.cell;
      let hit = false;
      for (let dy = -1; dy <= 1 && !hit; dy++) {
        for (let dx = -1; dx <= 1 && !hit; dx++) {
          if (this.bombs.isPlayerFlameAt(bc.x + dx, bc.y + dy)) hit = true;
        }
      }
      if (hit && boss.hit()) {
        this.stats.bossKills++;
        this.objectives.onBossKilled();
        this.notify(`${this.def.bossName} est vaincu !`, 'good');
      }
    }
  }

  private damagePlayer(cause: string): void {
    if (!this.player.hit()) return;
    this.stats.damageTaken++;
    this.damageCauses[cause] = (this.damageCauses[cause] ?? 0) + 1;
    this.objectives.onPlayerDamaged();
    if (this.player.lives > 0) {
      // Reapparition sur une case sure proche du lieu de la perte : le joueur
      // ne refait pas tout le trajet, mais il ne reapparait jamais dans une
      // zone de souffle ni au contact d'un ennemi. La carte garde son etat.
      const spot = this.safeRespawnCell(this.player.cell) ?? this.parsed.playerSpawn;
      this.player.respawn(spot);
      this.lastCell = { ...spot };
      this.notify(`Vie perdue - ${this.player.lives} restante(s)`, 'bad');
    }
    this.emitHud(true);
  }

  /** Case sure la plus proche pour reapparaitre (rayon limite). */
  private safeRespawnCell(from: Vec2): Vec2 | null {
    const enemyNear = (c: Vec2): boolean =>
      this.enemies.some(
        (e) => e.alive && Math.abs(e.cell.x - c.x) + Math.abs(e.cell.y - c.y) <= 2,
      ) ||
      (this.boss?.active === true &&
        this.boss.alive &&
        Math.abs(this.boss.cell.x - c.x) + Math.abs(this.boss.cell.y - c.y) <= 3);

    for (let r = 0; r <= 5; r++) {
      const candidates: Vec2[] = [];
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const c = { x: from.x + dx, y: from.y + dy };
          if (!this.grid.inBounds(c.x, c.y)) continue;
          if (this.grid.isSolid(c.x, c.y) || this.grid.isLethalFloor(c.x, c.y)) continue;
          if (this.bombs.bombAt(c.x, c.y) || this.bombs.isFlameAt(c.x, c.y)) continue;
          if (this.danger.isDangerous(c.x, c.y, 2500)) continue;
          if (enemyNear(c)) continue;
          candidates.push(c);
        }
      }
      if (candidates.length > 0) return candidates[this.rng.int(0, candidates.length - 1)];
    }
    return null;
  }

  private onEnemyKilled(at: Vec2): void {
    this.stats.kills++;
    this.objectives.onEnemyKilled(this.stats.kills);
    this.fxLayer.floatingText(at, '+120', '#ffd27a');
  }

  private cleanupDeadEnemies(): void {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (e.alive) continue;
      // Un ennemi attire dans la lave ou une zone toxique compte aussi :
      // c'est une elimination voulue par le joueur dans la grande majorite des cas.
      if (!e.counted) {
        e.counted = true;
        this.onEnemyKilled(e.pos);
      }
      e.destroy();
      this.enemies.splice(i, 1);
    }
  }

  /* ------------------------------------------------------- interactions -- */

  private handleCellEntry(): void {
    const c = this.player.cell;
    if (c.x === this.lastCell.x && c.y === this.lastCell.y) return;
    this.lastCell = { ...c };
    this.hazards.onPlayerEnterCell(c);
    this.objectives.onPlayerEnterCell(c);
  }

  private onTileDestroyed(cell: Vec2, kind: TileKind): void {
    this.tiles.onDestroyed(cell);
    this.stats.blocksDestroyed++;
    const colors = THEME_COLORS[this.def.theme];
    this.fxLayer.debris(centerOf(cell), colors.blockTop);
    audio.play('blockBreak');

    if (kind === TileKind.Secret) {
      const idx = this.grid.idx(cell.x, cell.y);
      if (!this.secretsFound.has(idx)) {
        this.secretsFound.add(idx);
        this.stats.secretsFound = this.secretsFound.size;
        this.objectives.onSecretFound(this.secretsFound.size);
        this.fxLayer.flash(0xffe08a, 180);
      }
      return;
    }

    const guaranteed = this.bonusBlockSet.has(this.grid.idx(cell.x, cell.y));
    this.powerups.rollForBlock(cell, this.rng, guaranteed);
  }

  private tryPlaceBomb(): void {
    const cell = this.player.cell;
    if (!this.player.canPlaceBomb(this.bombs.playerBombCount)) {
      audio.play('uiBack');
      return;
    }
    if (this.bombs.bombAt(cell.x, cell.y)) return;
    if (this.grid.isLethalFloor(cell.x, cell.y)) return;

    const usePierce = this.player.pierceCharges > 0;
    const type: BombType = usePierce ? 'pierce' : 'classic';
    // Sur la glace, une bombe posee en mouvement derape jusqu'a l'obstacle.
    const slide =
      this.grid.isSlippery(cell.x, cell.y) && this.player.speedMagnitude > 70
        ? this.player.facingVector()
        : null;
    const bomb = this.bombs.place(
      cell,
      type,
      this.player.range,
      usePierce ? BOMB.pierceBlocks : 0,
      slide,
    );
    if (!bomb) return;
    this.stats.bombsPlaced++;
    if (usePierce) this.player.pierceCharges--;
    this.emitHud(true);
  }

  private tryAbility(kind: 'shift' | 'slow'): void {
    const unlocked = kind === 'shift' ? this.cfg.abilities.shift : this.cfg.abilities.slow;
    if (!unlocked) return;
    const ready =
      kind === 'shift'
        ? this.player.canUseAbility(true)
        : this.player.canUseAbility2(true);
    if (!ready) {
      audio.play('uiBack');
      return;
    }
    const cell = this.player.cell;
    if (this.bombs.bombAt(cell.x, cell.y)) return;

    if (kind === 'shift') {
      const bomb = this.bombs.place(cell, 'shift', this.player.range + 1, 0, this.player.facingVector());
      if (!bomb) return;
      this.player.startAbilityCooldown();
      this.notify('Bombe SHIFT lancee', 'info');
    } else {
      const bomb = this.bombs.place(cell, 'slow', this.player.range + 2, BOMB.pierceBlocks, null);
      if (!bomb) return;
      this.player.startAbility2Cooldown();
      this.notify('Charge lente amorcee', 'info');
    }
    this.stats.bombsPlaced++;
    this.emitHud(true);
  }

  private refreshAllTiles(): void {
    for (let y = 0; y < this.grid.height; y++) {
      for (let x = 0; x < this.grid.width; x++) this.tiles.refresh({ x, y });
    }
  }

  /* ----------------------------------------------------------- hud/fin ---- */

  private notify(text: string, tone: 'info' | 'good' | 'bad' = 'info'): void {
    this.cfg.onNotify(text, tone);
  }

  private emitHud(force: boolean): void {
    // Le controleur d'objectifs notifie des sa construction : on ignore les
    // appels tant que tous les systemes ne sont pas en place.
    if (!this.objectives || !this.player || !this.bombs) return;
    const now = this.time.now;
    if (!force && now - this.hudAt < 90) return;
    this.hudAt = now;

    const boss = this.boss;
    const score = computeScore(
      { ...this.stats, objectivesDone: this.objectives.completedForScore, livesLeft: this.player.lives },
      this.def,
      this.world.difficulty.scoreFactor,
    );

    this.cfg.onHud({
      lives: this.player.lives,
      maxLives: Math.max(PLAYER.maxLives, this.player.lives),
      bombsActive: this.bombs.playerBombCount,
      bombsMax: this.player.maxBombs,
      range: this.player.range,
      speed: this.player.speedBonus,
      pierce: this.player.pierceCharges,
      shieldMs: Math.max(0, this.player.shieldUntil - this.elapsed),
      timeMs: this.elapsed,
      score: score.total,
      objectives: this.objectives.list,
      boss:
        boss && boss.active && boss.alive
          ? {
              name: this.def.bossName,
              hp: boss.hp,
              maxHp: boss.maxHp,
              phase: boss.phase,
              vulnerable: boss.vulnerable,
            }
          : null,
      ability: this.cfg.abilities.shift
        ? { unlocked: true, ratio: this.player.abilityCooldownRatio, label: 'SHIFT' }
        : null,
      ability2: this.cfg.abilities.slow
        ? { unlocked: true, ratio: this.player.ability2CooldownRatio, label: 'LENTE' }
        : null,
      phase: this.phase,
    });
  }

  private checkEnd(): void {
    if (this.phase !== 'playing') return;
    if (this.player.lives <= 0 && !this.player.alive) {
      if (this.endingAt === 0) {
        this.endingAt = this.elapsed;
        this.player.playDefeat();
        this.bombs.clear();
        audio.play('defeat');
      } else if (this.elapsed - this.endingAt > 1200) {
        this.endRun(false);
      }
    }
  }

  private endRun(victory: boolean): void {
    if (this.phase === 'victory' || this.phase === 'defeat') return;
    this.phase = victory ? 'victory' : 'defeat';

    if (victory) {
      if (this.stats.damageTaken === 0) this.objectives.markFlawless();
      this.player.playVictory();
      audio.play('victory');
      this.fxLayer.flash(0xffffff, 320);
    }

    // Securite : plus aucune bombe, flamme ou projectile ne reste actif,
    // et la musique repasse en mode normal.
    this.bombs.clear();
    this.projectiles.clear();
    audio.setBossMode(false);

    const stats: RunStats = {
      ...this.stats,
      objectivesDone: this.objectives.completedForScore,
      livesLeft: Math.max(0, this.player.lives),
      timeMs: this.elapsed,
    };
    const score = computeScore(stats, this.def, this.world.difficulty.scoreFactor);

    this.time.delayedCall(victory ? 900 : 200, () => {
      this.cfg.onEnd({
        mapId: this.def.id,
        victory,
        stats,
        score,
        rank: score.rank,
        objectives: this.objectives.list,
      });
    });
  }

  /* ------------------------------------------------------------ public ---- */

  pauseGame(): void {
    if (this.phase !== 'playing') return;
    this.phase = 'paused';
    this.scene.pause();
    audio.setMuted(true);
    this.emitHud(true);
  }

  resumeGame(): void {
    if (this.phase !== 'paused') return;
    this.phase = 'playing';
    this.scene.resume();
    audio.setMuted(false);
    audio.playMusic(this.def.theme);
    this.emitHud(true);
  }

  get isPaused(): boolean {
    return this.phase === 'paused';
  }

  get currentPhase(): GamePhase {
    return this.phase;
  }

  applySettings(settings: Settings): void {
    this.cfg.settings = settings;
    this.fxLayer.configure(settings);
    audio.setVolumes(settings.sfxVolume, settings.musicVolume);
  }

  private cleanup(): void {
    this.destroyed = true;
    audio.setBossMode(false);
    for (const m of this.dangerMarks) m.destroy();
    this.dangerMarks = [];
    this.compass?.destroy();
    this.compass = null;
    this.compassLabel?.destroy();
    this.compassLabel = null;
    this.scale.off(Phaser.Scale.Events.RESIZE, this.setupCamera, this);
    this.bombs?.clear();
    this.projectiles?.clear();
    this.powerups?.clear();
    for (const e of this.enemies) e.destroy();
    this.enemies = [];
    this.boss?.destroy();
    this.boss = null;
    this.objectives?.destroy();
    this.player?.destroy();
    this.tiles?.destroy();
    this.fxLayer?.destroy();
    this.vignette?.destroy();
    this.vignette = null;
  }

  /* ------------------------------------------- reprise de partie --------- */

  /**
   * Instantane de la tentative en cours.
   * Bombes, flammes et projectiles sont volontairement exclus : reprendre
   * au milieu d'une explosion serait injuste.
   */
  serialize(): RunSnapshot | null {
    if (this.destroyed || this.phase === 'victory' || this.phase === 'defeat') return null;
    const tileKinds: number[] = new Array(this.grid.width * this.grid.height);
    const revealed: number[] = [];
    const latched: number[] = [];
    this.grid.forEachTile((t, x, y) => {
      const i = this.grid.idx(x, y);
      tileKinds[i] = t.kind;
      if (t.revealed) revealed.push(i);
      if (t.latched) latched.push(i);
    });

    return {
      v: 1,
      mapId: this.def.id,
      difficulty: this.cfg.settings.difficulty,
      elapsedMs: this.elapsed,
      savedAt: Date.now(),
      tileKinds,
      revealed,
      latched,
      player: {
        cx: this.player.cell.x,
        cy: this.player.cell.y,
        lives: this.player.lives,
        maxBombs: this.player.maxBombs,
        range: this.player.range,
        speedBonus: this.player.speedBonus,
        pierceCharges: this.player.pierceCharges,
        shieldLeftMs: Math.max(0, this.player.shieldUntil - this.elapsed),
      },
      enemies: this.enemies
        .filter((e) => e.alive)
        .map((e) => ({ kind: e.kind, cx: e.cell.x, cy: e.cell.y, hp: e.hp, asleep: e.asleep })),
      powerups: this.powerups.list().map((p) => ({ kind: p.kind, cx: p.cell.x, cy: p.cell.y })),
      propsDone: this.objectives.propsDone,
      objectives: this.objectives.list.map((o) => ({ id: o.id, current: o.current, done: o.done })),
      boss: this.boss
        ? {
            hp: this.boss.hp,
            active: this.boss.active,
            phase: this.boss.phase,
            alive: this.boss.alive,
          }
        : null,
      stats: { ...this.stats } as unknown as Record<string, number>,
      secrets: [...this.secretsFound],
    };
  }

  private applySnapshot(snap: RunSnapshot): void {
    // 0. Le temps est restaure en premier : tous les delais (invulnerabilite,
    // bouclier, cycles) se calculent a partir de l'horloge reprise.
    this.elapsed = snap.elapsedMs;
    this.stats.timeMs = snap.elapsedMs;

    // 1. Grille : destructions, passages secrets, mecanismes.
    snap.tileKinds.forEach((kind, i) => {
      const t = this.grid.tiles[i];
      if (!t) return;
      if (t.kind !== kind) {
        t.kind = kind as TileKind;
        t.active = false;
      }
    });
    for (const i of snap.revealed) {
      const t = this.grid.tiles[i];
      if (t) t.revealed = true;
    }
    for (const i of snap.latched) {
      const t = this.grid.tiles[i];
      if (t) t.latched = true;
    }
    this.refreshAllTiles();

    // 2. Joueur.
    this.player.respawn({ x: snap.player.cx, y: snap.player.cy });
    this.player.lives = snap.player.lives;
    this.player.maxBombs = snap.player.maxBombs;
    this.player.range = snap.player.range;
    this.player.speedBonus = snap.player.speedBonus;
    this.player.pierceCharges = snap.player.pierceCharges;
    this.player.shieldUntil = snap.elapsedMs + snap.player.shieldLeftMs;

    // 3. Ennemis : on remplace la population initiale.
    for (const e of this.enemies) e.destroy();
    this.enemies = [];
    for (const e of snap.enemies) {
      const kind = e.kind as EnemyKind;
      const home =
        kind === 'guardian' ? (this.nearestPropCell({ x: e.cx, y: e.cy }) ?? { x: e.cx, y: e.cy }) : null;
      const enemy = new Enemy(this.world, kind, { x: e.cx, y: e.cy }, home);
      enemy.hp = e.hp;
      if (!e.asleep) enemy.wake();
      this.enemies.push(enemy);
    }

    // 4. Bonus au sol, objectifs, boss, statistiques.
    for (const p of snap.powerups) {
      this.powerups.spawn({ x: p.cx, y: p.cy }, p.kind as PowerUpKind);
    }
    this.objectives.restoreState(
      snap.propsDone,
      snap.objectives,
      snap.boss ? !snap.boss.alive : false,
    );
    // Les dalles-mecanismes enclenchees doivent etre recomptees, sinon la
    // grille qu'elles ouvrent resterait verrouillee pour toujours.
    this.hazards.syncMechanismsFromGrid();
    if (this.boss && snap.boss) {
      this.boss.restoreState(snap.boss.hp, snap.boss.active, snap.boss.phase, snap.boss.alive);
    }
    this.secretsFound = new Set(snap.secrets);
    Object.assign(this.stats, snap.stats);
    this.stats.timeMs = snap.elapsedMs;

    // 5. Repit a la reprise : on ne reprend jamais une partie en se faisant
    // toucher avant d'avoir eu le temps de regarder l'ecran.
    this.player.invulnUntil = this.elapsed + PLAYER.spawnGraceMs * 1.5;
  }

  /* ------------------------------------------------- outils de debug ----- */

  /** Expose un etat minimal pour les tests automatises (mode dev uniquement). */
  debugState(): Record<string, unknown> {
    if (!this.objectives || !this.player) return { phase: 'loading' };
    return {
      phase: this.phase,
      elapsed: Math.round(this.elapsed),
      player: { ...this.player.cell, lives: this.player.lives, range: this.player.range },
      bombs: this.bombs.playerBombCount,
      enemies: this.enemies.filter((e) => e.alive).length,
      boss: this.boss ? { hp: this.boss.hp, active: this.boss.active, phase: this.boss.phase } : null,
      objectives: this.objectives.list.map((o) => `${o.id}:${o.current}/${o.total}`),
      exitOpen: this.objectives.exitIsOpen,
      secrets: this.secretsFound.size,
      damageCauses: { ...this.damageCauses },
    };
  }

  debugTeleport(cx: number, cy: number): void {
    const p = centerOf({ x: cx, y: cy });
    this.player.body.x = p.x;
    this.player.body.y = p.y;
    this.player.body.vx = 0;
    this.player.body.vy = 0;
    this.lastCell = { x: -1, y: -1 };
  }

  debugPlaceBomb(): void {
    this.tryPlaceBomb();
  }

  debugBlastAt(cx: number, cy: number, range = 3): void {
    this.bombs.blast({ x: cx, y: cy }, range, 0);
  }

  debugCellInfo(cx: number, cy: number): Record<string, unknown> {
    const t = this.grid.tileAt(cx, cy);
    return {
      kind: t ? TileKind[t.kind] : 'out',
      solid: this.grid.isSolid(cx, cy),
      lethal: this.grid.isLethalFloor(cx, cy),
      flame: this.bombs.isFlameAt(cx, cy),
      danger: this.danger.at(cx, cy),
      cell: cellOf(centerOf({ x: cx, y: cy })),
    };
  }

  debugKillBoss(): void {
    const boss = this.boss;
    if (!boss || !boss.alive) return;
    boss.activate();
    boss.debugForceKill();
    this.stats.bossKills++;
    this.objectives.onBossKilled();
  }

  debugCompleteProps(): void {
    for (const p of this.parsed.props) {
      if (p.kind === 'generator') this.objectives.onBlastCells([p.cell]);
      else {
        this.debugTeleport(p.cell.x, p.cell.y);
        this.handleCellEntry();
      }
    }
  }
}
