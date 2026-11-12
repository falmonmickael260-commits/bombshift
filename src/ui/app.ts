import Phaser from 'phaser';
import { audio } from '../core/audio';
import {
  clearRun,
  loadRun,
  saveRun,
  SaveManager,
  migrate,
  type SaveData,
  type RunSnapshot,
  type Settings,
} from '../core/save';
import type { Difficulty, Rank } from '../core/types';
import { getMap, isMirrorLevel, MAPS, type MapDefinition, type MapId } from '../maps';
import { BootScene } from '../scenes/BootScene';
import { GameScene, type GameSceneData, type HudState, type RunResult } from '../scenes/GameScene';
import { TouchControls } from './controls';
import { Hud } from './hud';
import { renderMinimap } from './minimap';
import {
  renderBriefing,
  renderHowTo,
  renderMapList,
  renderPauseObjectives,
  renderProgress,
  renderResult,
  renderSettings,
} from './screens';

/**
 * Choix du moteur de rendu.
 *
 * Certains environnements (GPU bride, navigateur en mode logiciel, vieux
 * mobiles) exposent un contexte WebGL incapable d'attacher un framebuffer :
 * Phaser plante alors au demarrage. On verifie donc reellement la capacite
 * avant de choisir, avec repli sur le rendu Canvas 2D.
 */
function detectRenderer(): number {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const gl = (canvas.getContext('webgl2') ?? canvas.getContext('webgl')) as
      | WebGLRenderingContext
      | null;
    if (!gl) return Phaser.CANVAS;
    const tex = gl.createTexture();
    const fb = gl.createFramebuffer();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 64, 64, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(fb);
    gl.deleteTexture(tex);
    return status === gl.FRAMEBUFFER_COMPLETE ? Phaser.WEBGL : Phaser.CANVAS;
  } catch {
    return Phaser.CANVAS;
  }
}

function mergeProgress(remote: unknown, local: Readonly<SaveData>): SaveData {
  const account = migrate(remote);
  const device = migrate(local);
  const rankValue: Record<string, number> = { C: 1, B: 2, A: 3, S: 4, SS: 5, SSS: 6 };
  const maps: SaveData['maps'] = {};
  for (const id of new Set([...Object.keys(account.maps), ...Object.keys(device.maps)])) {
    const a = account.maps[id], b = device.maps[id];
    if (!a || !b) { maps[id] = a ?? b; continue; }
    const rank = !a.bestRank ? b.bestRank : !b.bestRank ? a.bestRank
      : rankValue[a.bestRank] >= rankValue[b.bestRank] ? a.bestRank : b.bestRank;
    const times = [a.bestTimeMs, b.bestTimeMs].filter((value): value is number => value !== null);
    maps[id] = {
      cleared: a.cleared || b.cleared,
      bestScore: Math.max(a.bestScore, b.bestScore),
      bestRank: rank,
      bestTimeMs: times.length ? Math.min(...times) : null,
      attempts: Math.max(a.attempts, b.attempts),
      wins: Math.max(a.wins, b.wins),
      secrets: [...new Set([...a.secrets, ...b.secrets])],
      objectivesSeen: Math.max(a.objectivesSeen, b.objectivesSeen),
    };
  }
  const stats = { ...account.stats };
  for (const key of Object.keys(stats) as (keyof SaveData['stats'])[]) {
    stats[key] = Math.max(stats[key] ?? 0, device.stats[key] ?? 0);
  }
  return migrate({
    ...account,
    unlockedMaps: Math.max(account.unlockedMaps, device.unlockedMaps),
    maps,
    stats,
    abilities: {
      shift: account.abilities.shift || device.abilities.shift,
      slow: account.abilities.slow || device.abilities.slow,
    },
  });
}

type ScreenName =
  | 'loading'
  | 'title'
  | 'maps'
  | 'brief'
  | 'settings'
  | 'progress'
  | 'howto'
  | 'result'
  | 'pause'
  | 'game';

const SCREEN_IDS: Record<Exclude<ScreenName, 'game'>, string> = {
  loading: 'screen-loading',
  title: 'screen-title',
  maps: 'screen-maps',
  brief: 'screen-brief',
  settings: 'screen-settings',
  progress: 'screen-progress',
  howto: 'screen-howto',
  result: 'screen-result',
  pause: 'screen-pause',
};

/**
 * Application : navigation entre les ecrans, cycle de vie du jeu,
 * sauvegarde et reprise apres mise en arriere-plan.
 */
export class App {
  private readonly save = new SaveManager();
  private readonly controls = new TouchControls();
  private readonly hud = new Hud();
  private game: Phaser.Game | null = null;
  private screen: ScreenName = 'loading';
  private settingsReturn: ScreenName = 'title';
  private selected: MapDefinition = MAPS[0];
  private lastHud: HudState | null = null;
  private ready = false;
  private wasPlayingBeforeHide = false;
  private debugClock = 0;
  private pendingRun: RunSnapshot | null = null;
  private bootWatchdog: ReturnType<typeof setInterval> | null = null;
  private bootRecoveries = 0;
  private accountSyncOrigin: string | null = null;
  private accountSyncLaunch: string | null = null;
  private accountSyncReady = false;
  private accountSyncTimer: number | null = null;
  private accountSyncRetry: number | null = null;
  private accountSyncLastSent = '';

  start(): void {
    this.bindAccountProgressSync();
    this.bindStaticButtons();
    this.controls.applySettings(this.save.get().settings);
    this.controls.setPauseHandler(() => this.togglePause());
    audio.setVolumes(this.save.get().settings.sfxVolume, this.save.get().settings.musicVolume);

    this.createGame();
    this.bindLifecycle();
    this.unlockAudioOnFirstGesture();
  }

  /**
   * Account progress is relayed by the Revanche Games iframe host. The game
   * never receives a Supabase key or writes directly to the platform API.
   */
  private bindAccountProgressSync(): void {
    const params = new URLSearchParams(window.location.search);
    if (window.parent === window || !params.has('rg_token')) return;

    try {
      const referrerOrigin = document.referrer ? new URL(document.referrer).origin : '';
      const allowedOrigins = [
        'https://revanchegames-production.up.railway.app',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
      ];
      this.accountSyncOrigin = allowedOrigins.includes(referrerOrigin) ? referrerOrigin : null;
    } catch { this.accountSyncOrigin = null; }
    if (!this.accountSyncOrigin) return;

    const sendReady = () => window.parent.postMessage(
      { type: 'rg:ready', v: 1, game: 'bombshift' },
      this.accountSyncOrigin!,
    );
    sendReady();
    let retries = 0;
    this.accountSyncRetry = window.setInterval(() => {
      if (this.accountSyncReady || retries++ >= 20) {
        if (this.accountSyncRetry !== null) window.clearInterval(this.accountSyncRetry);
        this.accountSyncRetry = null;
        return;
      }
      sendReady();
    }, 700);

    window.addEventListener('message', (event: MessageEvent) => {
      if (event.source !== window.parent || event.origin !== this.accountSyncOrigin) return;
      const data = event.data;
      if (!data || data.v !== 1 || data.game !== 'bombshift') return;
      if (data.type === 'rg:bootstrap' && typeof data.launch === 'string') {
        this.accountSyncReady = true;
        this.accountSyncLaunch = data.launch;
        if (this.accountSyncRetry !== null) window.clearInterval(this.accountSyncRetry);
        this.accountSyncRetry = null;
        if (data.authenticated === true) {
          // Monotonic merge keeps the best local progress when the player
          // moves from this device to their account, without granting rewards.
          this.save.replace(mergeProgress(data.progress, this.save.get()));
          this.queueAccountProgressSave(0);
          this.setAccountSyncStatus('Progression liée au compte Revanche Games');
        } else if (data.syncUnavailable === true) {
          this.setAccountSyncStatus('Synchronisation indisponible — progression conservée sur cet appareil');
        } else {
          this.setAccountSyncStatus('Progression enregistrée sur cet appareil');
        }
      } else if (data.launch !== this.accountSyncLaunch) return;
      else if (data.type === 'rg:progress-saved') {
        this.setAccountSyncStatus('Progression du compte synchronisée');
      } else if (data.type === 'rg:progress-save-error') {
        this.setAccountSyncStatus('Synchronisation du compte indisponible — progression conservée sur cet appareil');
      }
    });

    this.save.onChange(() => this.queueAccountProgressSave());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.queueAccountProgressSave(0);
    });
    window.addEventListener('pagehide', () => this.queueAccountProgressSave(0));
  }

  private queueAccountProgressSave(delay = 800): void {
    if (!this.accountSyncOrigin || !this.accountSyncLaunch) return;
    if (this.accountSyncTimer !== null) window.clearTimeout(this.accountSyncTimer);
    this.accountSyncTimer = window.setTimeout(() => {
      this.accountSyncTimer = null;
      const progress = JSON.stringify(this.save.get());
      if (progress === this.accountSyncLastSent) return;
      this.accountSyncLastSent = progress;
      window.parent.postMessage({
        type: 'rg:progress-save', v: 1, game: 'bombshift',
        launch: this.accountSyncLaunch,
        progress: JSON.parse(progress),
      }, this.accountSyncOrigin!);
    }, delay);
  }

  private setAccountSyncStatus(message: string): void {
    const status = document.getElementById('account-sync-status');
    if (status) status.textContent = message;
  }

  /* ----------------------------------------------------------- phaser ---- */

  private createGame(): void {
    const fill = document.getElementById('loading-fill');
    const text = document.getElementById('loading-text');

    // Phaser ne peut pas terminer son demarrage dans un onglet masque : sa
    // boucle repose sur requestAnimationFrame, et l'evenement de fin de
    // chargement des textures peut etre emis avant qu'il ne l'ecoute. On
    // attend donc que la page soit reellement affichee.
    if (document.visibilityState === 'hidden') {
      if (text) text.textContent = 'Le jeu demarre des que cet onglet est affiche.';
      document.addEventListener(
        'visibilitychange',
        () => {
          if (document.visibilityState === 'visible' && !this.game) this.createGame();
        },
        { once: true },
      );
      return;
    }

    if (fill) fill.style.width = '35%';
    if (text) text.textContent = 'Forge des textures...';

    this.game = new Phaser.Game({
      type: detectRenderer(),
      parent: 'game-root',
      backgroundColor: '#07060c',
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.NO_CENTER,
        width: window.innerWidth,
        height: window.innerHeight,
      },
      render: { antialias: true, powerPreference: 'high-performance' },
      fps: { target: 60, min: 30 },
      // Le moteur audio du jeu est maison (WebAudio procedural) : on desactive
      // celui de Phaser pour ne pas charger de decodeur inutile.
      audio: { noAudio: true },
      input: { activePointers: 4 },
      banner: false,
      scene: [BootScene, GameScene],
    });

    this.game.events.once(BootScene.READY_EVENT, () => {
      this.ready = true;
      if (this.bootWatchdog !== null) {
        clearInterval(this.bootWatchdog);
        this.bootWatchdog = null;
      }
      if (fill) fill.style.width = '100%';
      if (text) text.textContent = 'Pret !';
      setTimeout(() => this.show('title'), 420);
    });

    // Filet de securite : si la boucle de jeu n'a pas demarre au bout de
    // quelques secondes, on le dit clairement plutot que de laisser une
    // barre de chargement figee.
    let waited = 0;
    this.bootWatchdog = setInterval(() => {
      waited += 1000;
      if (this.ready) {
        if (this.bootWatchdog !== null) clearInterval(this.bootWatchdog);
        this.bootWatchdog = null;
        return;
      }
      this.recoverStalledBoot();
      if (waited >= 8000 && text) {
        text.textContent = 'Demarrage plus long que prevu — touchez l\'ecran ou rechargez la page.';
        const bar = document.getElementById('loading-fill');
        if (bar) bar.style.width = '70%';
      }
    }, 1000);
  }

  /**
   * Repare un demarrage interrompu.
   *
   * Si l'onglet devient masque pendant le boot de Phaser, sa boucle n'est
   * jamais lancee (requestAnimationFrame suspendu) et le jeu reste bloque sur
   * l'ecran de chargement, meme une fois l'onglet reaffiche. On repart alors
   * sur une instance neuve — uniquement quand la page est visible, et deux
   * fois au maximum pour ne jamais boucler.
   */
  private recoverStalledBoot(): void {
    const game = this.game;
    if (!game || this.ready) return;
    if (document.visibilityState !== 'visible') return;
    if (game.isBooted && game.isRunning) return;
    if (!game.isBooted) return;
    if (this.bootRecoveries >= 2) return;

    this.bootRecoveries++;
    try {
      game.destroy(true);
    } catch {
      /* instance deja perdue : on repart quand meme */
    }
    this.game = null;
    if (this.bootWatchdog !== null) {
      clearInterval(this.bootWatchdog);
      this.bootWatchdog = null;
    }
    this.createGame();
  }

  private get gameScene(): GameScene | null {
    const scene = this.game?.scene.getScene(GameScene.KEY);
    return (scene as unknown as GameScene | null) ?? null;
  }

  /* ----------------------------------------------------------- ecrans ---- */

  private show(name: ScreenName): void {
    this.screen = name;
    for (const [key, id] of Object.entries(SCREEN_IDS)) {
      const el = document.getElementById(id);
      if (!el) continue;
      el.classList.toggle('screen--active', key === name);
    }

    const inGame = name === 'game' || name === 'pause';
    if (!inGame) this.controls.setMirrored(false);
    this.hud.setVisible(inGame);
    this.controls.setVisible(name === 'game');
    document.getElementById('game-root')?.setAttribute('aria-hidden', String(!inGame));

    if (name === 'title') this.refreshResumeButton();
    if (name === 'maps') {
      renderMapList(document.getElementById('map-list')!, this.save.get(), (def, locked) => {
        if (locked) {
          this.hud.toast('Carte verrouillee', 'bad');
          audio.play('uiBack');
          return;
        }
        audio.play('uiClick');
        this.selected = def;
        this.show('brief');
      });
    }
    if (name === 'brief') {
      document.getElementById('brief-title')!.textContent = this.selected.name.toUpperCase();
      renderBriefing(document.getElementById('brief-body')!, this.selected, this.save.get(), (d) => {
        this.save.update((data) => {
          data.settings.difficulty = d;
        });
        audio.play('uiClick');
      });
    }
    if (name === 'settings') {
      renderSettings(
        document.getElementById('settings-body')!,
        this.save,
        (settings) => this.applySettings(settings),
        () => {
          this.save.reset();
          this.applySettings(this.save.get().settings);
          this.show('title');
        },
      );
    }
    if (name === 'progress') renderProgress(document.getElementById('progress-body')!, this.save.get());
    if (name === 'howto') renderHowTo(document.getElementById('howto-body')!);
    if (name === 'pause') {
      if (this.lastHud) {
        renderPauseObjectives(document.getElementById('pause-objectives')!, this.lastHud.objectives);
      }
      const canvas = document.getElementById('pause-minimap') as HTMLCanvasElement | null;
      const scene = this.gameScene;
      if (canvas && scene) renderMinimap(canvas, scene.getMinimapData());
    }
  }

  /** Affiche le bouton de reprise si une tentative est sauvegardee. */
  private refreshResumeButton(): void {
    const btn = document.getElementById('btn-resume-run');
    const sub = document.getElementById('resume-sub');
    if (!btn) return;
    this.pendingRun = loadRun();
    const map = this.pendingRun ? MAPS.find((m) => m.id === this.pendingRun!.mapId) : null;
    if (!this.pendingRun || !map) {
      btn.hidden = true;
      return;
    }
    btn.hidden = false;
    if (sub) {
      const t = Math.floor(this.pendingRun.elapsedMs / 1000);
      sub.textContent =
        `${map.name} · ${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}` +
        ` · ${this.pendingRun.player.lives} vie(s)`;
    }
  }

  /** Sauvegarde la tentative en cours (pause, mise en arriere-plan, fermeture). */
  private persistRun(): void {
    const snap = this.gameScene?.serialize();
    if (snap) saveRun(snap);
  }

  private bindStaticButtons(): void {
    document.body.addEventListener('click', (ev) => {
      const target = (ev.target as HTMLElement).closest('[data-action]');
      if (!target) return;
      const action = target.getAttribute('data-action');
      audio.play(action === 'back-title' || action === 'back-maps' ? 'uiBack' : 'uiClick');
      switch (action) {
        case 'play':
          this.show('maps');
          break;
        case 'resume-run':
          this.resumeSavedRun();
          break;
        case 'settings':
          this.settingsReturn = 'title';
          this.show('settings');
          break;
        case 'pause-settings':
          this.settingsReturn = 'pause';
          this.show('settings');
          break;
        case 'progress':
          this.show('progress');
          break;
        case 'howto':
          this.show('howto');
          break;
        case 'back-title':
          this.show('title');
          break;
        case 'back-maps':
          this.show('maps');
          break;
        case 'back-auto':
          this.show(this.settingsReturn);
          break;
        case 'start':
          this.startRun(this.selected.id);
          break;
        case 'resume':
          this.resume();
          break;
        case 'restart':
          clearRun();
          this.startRun(this.selected.id);
          break;
        case 'quit':
          // On conserve la tentative : elle sera proposee a la reprise.
          this.persistRun();
          this.stopRun();
          this.show('title');
          break;
      }
    });

    document.getElementById('btn-pause')?.addEventListener('click', (ev) => {
      ev.stopPropagation();
      this.togglePause();
    });
  }

  /* -------------------------------------------------------- partie -------- */

  private startRun(mapId: MapId, snapshot: RunSnapshot | null = null): void {
    if (!this.ready || !this.game) return;
    const def = getMap(mapId);
    this.selected = def;

    if (!snapshot) clearRun();
    this.save.update((d) => {
      const p = d.maps[mapId] ?? (d.maps[mapId] = {
        cleared: false,
        bestScore: 0,
        bestRank: null,
        bestTimeMs: null,
        attempts: 0,
        wins: 0,
        secrets: [],
        objectivesSeen: 0,
      });
      if (!snapshot) {
        p.attempts++;
        d.stats.runs++;
      }
      p.objectivesSeen = def.objectives.length;
    });

    audio.unlock();
    this.controls.reset();
    this.controls.setMirrored(def.mirrorControls ?? isMirrorLevel(def.index));
    this.controls.setAbilities(this.save.get().abilities.shift, this.save.get().abilities.slow);

    const data: GameSceneData = {
      mapId,
      snapshot,
      showHints: !(this.save.get().maps[mapId]?.cleared ?? false),
      settings: { ...this.save.get().settings },
      abilities: { ...this.save.get().abilities },
      input: this.controls.input,
      onHud: (state) => {
        this.lastHud = state;
        this.hud.render(state);
        this.controls.setCooldowns(state.ability?.ratio ?? 0, state.ability2?.ratio ?? 0);
      },
      onNotify: (text, tone) => this.hud.toast(text, tone),
      onEnd: (result) => this.onRunEnd(result),
    };

    const manager = this.game.scene;
    if (manager.getScene(GameScene.KEY)) manager.stop(GameScene.KEY);
    // Un tick d'attente garantit que le shutdown precedent a bien libere
    // sprites, minuteurs et ecouteurs avant la nouvelle tentative.
    setTimeout(() => {
      manager.start(GameScene.KEY, data);
      this.show('game');
    }, 60);
  }

  private resumeSavedRun(): void {
    const snap = this.pendingRun ?? loadRun();
    if (!snap) {
      this.refreshResumeButton();
      return;
    }
    const map = MAPS.find((m) => m.id === snap.mapId);
    if (!map) {
      clearRun();
      this.refreshResumeButton();
      return;
    }
    // La difficulte de la tentative sauvegardee prime : on reprend a l'identique.
    this.save.update((d) => {
      d.settings.difficulty = snap.difficulty as Difficulty;
    });
    this.startRun(map.id, snap);
  }

  private stopRun(): void {
    const scene = this.gameScene;
    if (scene) {
      if (scene.isPaused) scene.resumeGame();
      this.game?.scene.stop(GameScene.KEY);
    }
    audio.stopMusic();
    audio.setMuted(false);
    this.controls.reset();
  }

  private togglePause(): void {
    if (this.screen === 'game') this.pause();
    else if (this.screen === 'pause') this.resume();
  }

  private pause(): void {
    const scene = this.gameScene;
    if (!scene || scene.currentPhase !== 'playing') return;
    scene.pauseGame();
    this.persistRun();
    this.controls.reset();
    this.show('pause');
  }

  private resume(): void {
    const scene = this.gameScene;
    if (!scene) {
      this.show('title');
      return;
    }
    this.show('game');
    scene.resumeGame();
  }

  private onRunEnd(result: RunResult): void {
    const def = getMap(result.mapId);
    const mandatoryDone = result.objectives.filter((o) => o.mandatory).every((o) => o.done);
    // Garde-fou : une victoire n'est enregistree que si les objectifs
    // obligatoires sont reellement valides.
    const victory = result.victory && mandatoryDone;

    let newRecord = false;
    let unlockedMap: string | null = null;
    let unlockedAbility: string | null = null;

    this.save.update((d) => {
      const p = d.maps[result.mapId]!;
      d.stats.totalKills += result.stats.kills;
      d.stats.totalBombs += result.stats.bombsPlaced;
      d.stats.totalBlocks += result.stats.blocksDestroyed;
      d.stats.totalPowerups += result.stats.powerupsTaken;
      d.stats.totalPlaytimeMs += result.stats.timeMs;
      if (!victory) d.stats.totalDeaths++;

      const secretIds = Array.from({ length: result.stats.secretsFound }, (_, i) => `${result.mapId}-s${i + 1}`);
      p.secrets = Array.from(new Set([...p.secrets, ...secretIds]));

      // Un rang ne se gagne qu'en terminant reellement la carte.
      if (victory && result.score.total > p.bestScore) {
        p.bestScore = result.score.total;
        p.bestRank = result.score.rank as Rank;
        newRecord = true;
      }

      if (victory) {
        p.wins++;
        p.cleared = true;
        if (p.bestTimeMs === null || result.stats.timeMs < p.bestTimeMs) {
          p.bestTimeMs = result.stats.timeMs;
        }
        // Debloque la carte suivante dans l'ordre de MAPS, quelle que soit la carte terminee.
        const clearedIndex = MAPS.findIndex((m) => m.id === result.mapId);
        if (clearedIndex >= 0 && clearedIndex + 1 < MAPS.length && d.unlockedMaps < clearedIndex + 2) {
          d.unlockedMaps = clearedIndex + 2;
          unlockedMap = MAPS[clearedIndex + 1].name;
        }
        if (result.mapId === 'volcano' && !d.abilities.shift) {
          d.abilities.shift = true;
          unlockedAbility = 'Bombe SHIFT';
        }
        if (result.mapId === 'ice' && !d.abilities.slow) {
          d.abilities.slow = true;
          unlockedAbility = 'Charge lente';
        }
      }
    });
    this.save.flush();
    clearRun();

    audio.stopMusic();
    this.stopRun();

    renderResult(
      document.getElementById('result-body')!,
      { ...result, victory },
      def,
      { newRecord, unlockedMap, unlockedAbility },
      (action) => {
        audio.play('uiClick');
        if (action === 'retry') this.startRun(result.mapId);
        else if (action === 'maps') this.show('maps');
        else this.show('title');
      },
    );
    this.show('result');
  }

  /* --------------------------------------------------------- systeme ---- */

  private applySettings(settings: Settings): void {
    this.controls.applySettings(settings);
    audio.setVolumes(settings.sfxVolume, settings.musicVolume);
    this.gameScene?.applySettings(settings);
  }

  private unlockAudioOnFirstGesture(): void {
    const unlock = (): void => {
      audio.unlock();
      audio.setVolumes(this.save.get().settings.sfxVolume, this.save.get().settings.musicVolume);
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock, { once: false });
    window.addEventListener('keydown', unlock, { once: false });
  }

  private bindLifecycle(): void {
    // Retour au premier plan : on ne reprend jamais la partie en cours sans
    // action du joueur (sinon il se fait toucher pendant le retour).
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.wasPlayingBeforeHide = this.screen === 'game';
        if (this.wasPlayingBeforeHide) this.pause();
        this.persistRun();
        audio.setMuted(true);
      } else {
        if (this.screen !== 'game') audio.setMuted(this.screen === 'pause');
        // Le demarrage a pu etre interrompu pendant que l'onglet etait masque.
        if (!this.ready) this.recoverStalledBoot();
      }
    });

    window.addEventListener('pagehide', () => {
      if (this.screen === 'game') this.pause();
      this.persistRun();
      this.save.flush();
    });

    window.addEventListener('beforeunload', () => this.save.flush());

    // Orientation / redimensionnement : Phaser gere le canvas, on recalcule
    // seulement la taille du jeu.
    const onResize = (): void => {
      this.game?.scale.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', () => setTimeout(onResize, 120));

    // Empeche le zoom par double-tap et le defilement elastique sur iOS.
    document.addEventListener(
      'touchmove',
      (ev) => {
        if (ev.touches.length > 1) ev.preventDefault();
      },
      { passive: false },
    );
    document.addEventListener('gesturestart', (ev) => ev.preventDefault());
    document.addEventListener('dblclick', (ev) => ev.preventDefault());
  }

  /** Expose les outils de test automatise (uniquement en developpement). */
  exposeDebug(): void {
    const api = {
      app: this,
      get scene() {
        const s = (window as unknown as { __bsApp: App }).__bsApp;
        return (s as unknown as { gameScene: GameScene | null }).gameScene;
      },
      state: (): unknown => this.gameScene?.debugState() ?? { phase: 'menu', screen: this.screen },
      screen: (): string => this.screen,
      save: (): unknown => this.save.get(),
      startMap: (id: MapId): void => this.startRun(id),
      teleport: (x: number, y: number): void => this.gameScene?.debugTeleport(x, y),
      bomb: (): void => this.gameScene?.debugPlaceBomb(),
      blast: (x: number, y: number, r?: number): void => this.gameScene?.debugBlastAt(x, y, r),
      cell: (x: number, y: number): unknown => this.gameScene?.debugCellInfo(x, y),
      killBoss: (): void => this.gameScene?.debugKillBoss(),
      completeProps: (): void => this.gameScene?.debugCompleteProps(),
      input: this.controls.input,
      /**
       * Avance la simulation manuellement (tests automatises). Indispensable
       * quand requestAnimationFrame est suspendu, par exemple lorsque l'onglet
       * n'est pas affiche.
       */
      tick: (totalMs: number, stepMs = 1000 / 60): number => {
        const game = this.game;
        if (!game) return 0;
        const steps = Math.max(1, Math.round(totalMs / stepMs));
        for (let i = 0; i < steps; i++) {
          this.debugClock += stepMs;
          game.step(this.debugClock, stepMs);
        }
        return steps;
      },
      pause: (): void => this.pause(),
      resume: (): void => this.resume(),
      /** Auto-tests pilotant le jeu reel (voir src/dev/selfTest.ts). */
      selfTest: async (): Promise<unknown> => {
        const { runSelfTest } = await import('../dev/selfTest');
        const report = await runSelfTest({
          startMap: (id) => this.startRun(id),
          tick: (ms) => api.tick(ms),
          state: () => (this.gameScene?.debugState() ?? {}) as Record<string, unknown>,
          teleport: (x, y) => this.gameScene?.debugTeleport(x, y),
          bomb: () => this.gameScene?.debugPlaceBomb(),
          blast: (x, y, r) => this.gameScene?.debugBlastAt(x, y, r),
          cell: (x, y) => (this.gameScene?.debugCellInfo(x, y) ?? {}) as Record<string, unknown>,
          killBoss: () => this.gameScene?.debugKillBoss(),
          completeProps: () => this.gameScene?.debugCompleteProps(),
          scene: () => this.gameScene,
          input: this.controls.input,
        });
        // eslint-disable-next-line no-console
        console.table(report.checks);
        return report;
      },
      unlockAll: (): void =>
        this.save.update((d) => {
          d.unlockedMaps = MAPS.length;
          d.abilities.shift = true;
          d.abilities.slow = true;
        }),
    };
    (window as unknown as Record<string, unknown>).__BOMBSHIFT__ = api;
    (window as unknown as Record<string, unknown>).__bsApp = this;
  }
}
