import { CosmeticShop } from './cosmeticShop';
import { CoopClient, type CoopState } from '../multiplayer/client';
import { AdDemoPreferences, demoStorage, renderAdDemo } from './adDemo';
import { mountSpeedLeaderboard } from './leaderboard';
import { RunRecovery, tabStorage } from './runRecovery';
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
  | 'shop'
  | 'loading'
  | 'title'
  | 'maps'
  | 'coop'
  | 'brief'
  | 'settings'
  | 'progress'
  | 'howto'
  | 'ad'
  | 'result'
  | 'pause'
  | 'game';

const SCREEN_IDS: Record<Exclude<ScreenName, 'game'>, string> = {
  shop: 'screen-shop',
  loading: 'screen-loading',
  title: 'screen-title',
  maps: 'screen-maps',
  coop: 'screen-coop',
  brief: 'screen-brief',
  settings: 'screen-settings',
  progress: 'screen-progress',
  howto: 'screen-howto',
  ad: 'screen-ad',
  result: 'screen-result',
  pause: 'screen-pause',
};

/**
 * Application : navigation entre les ecrans, cycle de vie du jeu,
 * sauvegarde et reprise apres mise en arriere-plan.
 */
export class App {
  private readonly save = new SaveManager();
  private shop: CosmeticShop | null = null;
  private shopRequestId=0;
  private shopPending=new Map<number,{resolve:(value:any)=>void;reject:(error:Error)=>void;timer:number}>();
  private readonly adDemo = new AdDemoPreferences(demoStorage());
  private disposeAd: (() => void) | null = null;
  private disposeLeaderboard: (() => void) | null = null;
  private readonly controls = new TouchControls();
  private readonly hud = new Hud();
  private readonly coop = new CoopClient();
  private coopPeerReady = false;
  private coopLeaderboardAbort: AbortController | null = null;
  private coopRoomHost = false;
  private coopAutoJoined = '';
  private coopConnecting = false;
  private coopRequestTimer: number | null = null;
  private coopConnectionEpoch = 0;
  private lastRemoteInputAt = 0;
  private coopPlatformName: string | null = null;
  private coopResultPending = false;
  private coopSeed: number | null = null;
  private remoteCoopInput = { moveX: 0, moveY: 0, magnitude: 0, bombPressed: false,
    abilityPressed: false, ability2Pressed: false };
  private game: Phaser.Game | null = null;
  private screen: ScreenName = 'loading';
  private settingsReturn: ScreenName = 'title';
  private selected: MapDefinition = MAPS[0];
  private lastHud: HudState | null = null;
  private ready = false;
  private wasPlayingBeforeHide = false;
  private debugClock = 0;
  private pendingRun: RunSnapshot | null = null;
  private readonly recovery = new RunRecovery(tabStorage());
  private completedRun: { result: RunResult; meta: ReturnType<App['recordRunResult']> } | null = null;
  private bootWatchdog: ReturnType<typeof setInterval> | null = null;
  private bootRecoveries = 0;
  private paidNoAds = false;
  private purchasePending = false;
  private accountSyncOrigin: string | null = null;
  private accountSyncLaunch: string | null = null;
  private accountSyncReady = false;
  private accountSyncTimer: number | null = null;
  private accountSyncRetry: number | null = null;
  private accountSyncLastSent = '';
  private accountSyncInFlight: string | null = null;
  private accountSyncSaveRetry: number | null = null;
  private accountSyncAuthenticated = false;
  private accountSyncRequest = 0;

  start(): void {
    this.bindAccountProgressSync();
    this.coop.onEvent((event) => {
      switch (event.type) {
        case 'created':
          this.finishCoopRequest();
          this.coopRoomHost = true;
          this.coopMessage('Salon ' + event.code + ' créé pour ' + getMap(event.level).name + '.');
          this.updateCoopRoom(event.code, false);
          break;
        case 'joined':
          this.finishCoopRequest();
          this.coopRoomHost = false;
          this.selected = getMap(event.level);
          this.coopMessage('Salon rejoint : ' + this.selected.name + '.');
          this.coopPeerReady = true;
          this.updateCoopRoom(event.code, true);
          break;
        case 'peer-joined':
          this.coopPeerReady = true;
          this.coopMessage((event.guest || 'Ton ami') + ' a rejoint. La partie peut commencer !');
          this.updateCoopRoom(this.coop.code, true);
          break;
        case 'peer-left':
          this.finishCoopRequest();
          this.coopPeerReady = false;
          if (this.screen === 'game' && this.gameScene?.currentPhase === 'playing') {
            this.stopRun(); this.coop.disconnect(); this.coopSeed = null;
            this.show('coop');
          }
          this.coopMessage('Salon fermé : un joueur s’est déconnecté. Crée un nouveau salon.');
          this.updateCoopRoom('', false);
          break;
        case 'started':
          this.finishCoopRequest();
          Object.assign(this.remoteCoopInput,{moveX:0,moveY:0,magnitude:0,bombPressed:false,abilityPressed:false,ability2Pressed:false});
          this.lastRemoteInputAt=performance.now();
          this.coopSeed = event.seed;
          this.save.update(d => { d.settings.difficulty = event.difficulty; });
          this.startRun(event.level);
          break;
        case 'input':
          this.lastRemoteInputAt=performance.now();
          this.remoteCoopInput.moveX = event.input.moveX;
          this.remoteCoopInput.moveY = event.input.moveY;
          this.remoteCoopInput.magnitude = event.input.magnitude;
          this.remoteCoopInput.bombPressed ||= event.input.bombPressed;
          this.remoteCoopInput.abilityPressed ||= event.input.abilityPressed;
          this.remoteCoopInput.ability2Pressed ||= event.input.ability2Pressed;
          break;
        case 'state':
          this.gameScene?.applyCoopState(event.state as CoopState);
          break;
        case 'result':
          if (event.result.victory) this.coop.confirmResult();
          this.gameScene?.finishCoop(event.result.victory);
          break;
        case 'recorded':
          this.hud.toast('Temps duo enregistré dans le classement !', 'good');
          break;
        case 'error':
          this.finishCoopRequest();
          this.coopMessage(event.message);
          break;
      }
    });
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

    const allowedOrigins = ['https://revanchegames.com','https://www.revanchegames.com','https://revanchegames-production.up.railway.app'];
    if(import.meta.env.DEV)allowedOrigins.push('http://localhost:3000','http://127.0.0.1:3000');
    // Ready contains no account data. Probe only known platform origins,
    // including browsers that suppress document.referrer. Pin origin on reply.
    const sendReady = () => {
      for(const origin of this.accountSyncOrigin ? [this.accountSyncOrigin] : allowedOrigins)
        window.parent.postMessage({type:'rg:ready',v:1,game:'bombshift'},origin);
    };
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
      if (event.source !== window.parent || !allowedOrigins.includes(event.origin) || (this.accountSyncOrigin && event.origin !== this.accountSyncOrigin)) return;
      const data = event.data;
      if (!data || data.v !== 1 || data.game !== 'bombshift') return;
      if (data.type === 'rg:bootstrap' && typeof data.launch === 'string') {
        this.accountSyncOrigin = event.origin;
        if(data.entitlementUnavailable !== true) this.paidNoAds = data.noAds === true;
        this.refreshPurchaseStatus();
        if (this.paidNoAds && this.screen === 'ad') this.show('title');
        this.accountSyncReady = data.syncUnavailable !== true && data.entitlementUnavailable !== true;
        const identity = data.identity;
        if (identity && typeof identity === 'object' && typeof identity.username === 'string') {
          this.coopPlatformName = identity.username.trim().slice(0, 22) || null;
          const coopName = document.getElementById('coop-name') as HTMLInputElement | null;
          if (coopName && this.coopPlatformName) coopName.value = this.coopPlatformName;
        }
        this.accountSyncAuthenticated = data.authenticated === true;
        this.accountSyncLaunch = data.launch;
        if(this.accountSyncAuthenticated){this.shop??=new CosmeticShop(document.getElementById('skin-shop-body')!,this.requestCosmetics.bind(this));void this.shop.refresh();}
        if(this.coop.code) this.updateCoopRoom(this.coop.code,this.coopPeerReady);
        if (this.accountSyncRetry !== null) window.clearInterval(this.accountSyncRetry);
        this.accountSyncRetry = null;
        if (data.authenticated === true) {
          // Monotonic merge keeps the best local progress when the player
          // moves from this device to their account, without granting rewards.
          this.save.replace(mergeProgress(data.progress, this.save.get()));
          this.queueAccountProgressSave(0);
          this.setAccountSyncStatus('Progression liée au compte Revanche Games');
        } else if (data.syncUnavailable === true) {
          this.accountSyncRetry = window.setTimeout(sendReady, 5000);
          this.setAccountSyncStatus('Synchronisation indisponible — progression conservée sur cet appareil');
        } else {
          this.setAccountSyncStatus('Progression enregistrée sur cet appareil');
        }
        if(data.entitlementUnavailable === true && this.accountSyncRetry === null) this.accountSyncRetry = window.setTimeout(sendReady,5000);
      } else if (data.launch !== this.accountSyncLaunch) return;
      else if(data.type==='rg:cosmetics-result'){const pending=this.shopPending.get(data.requestId);if(!pending)return;clearTimeout(pending.timer);this.shopPending.delete(data.requestId);if(data.error||!data.result)pending.reject(new Error(data.error||'Boutique indisponible.'));else pending.resolve(data.result);}
      else if (data.type === 'rg:purchase-error') {
        this.purchasePending = false;
        this.refreshPurchaseStatus(typeof data.error === 'string' ? data.error : 'Paiement indisponible.');
      }
      else if (data.type === 'rg:progress-saved') {
        if (data.requestId !== undefined && data.requestId !== this.accountSyncRequest) return;
        if (this.accountSyncSaveRetry !== null) window.clearTimeout(this.accountSyncSaveRetry);
        this.accountSyncSaveRetry = null;
        this.accountSyncLastSent = this.accountSyncInFlight ?? this.accountSyncLastSent;
        this.accountSyncInFlight = null;
        this.setAccountSyncStatus('Progression du compte synchronisée');
        window.dispatchEvent(new Event('bombshift:account-synced'));
        this.queueAccountProgressSave(0);
      } else if (data.type === 'rg:progress-save-error') {
        if (data.requestId !== undefined && data.requestId !== this.accountSyncRequest) return;
        this.accountSyncInFlight = null;
        if(this.accountSyncSaveRetry!==null)window.clearTimeout(this.accountSyncSaveRetry);
        this.accountSyncSaveRetry=window.setTimeout(()=>{this.accountSyncSaveRetry=null;this.sendAccountProgress();},10000);
        this.setAccountSyncStatus('Synchronisation du compte indisponible — progression conservée sur cet appareil');
      }
    });

    let entitlementChecks = 0;
    const entitlementTimer = window.setInterval(() => {
      if (++entitlementChecks > 12 || this.paidNoAds) { window.clearInterval(entitlementTimer); return; }
      sendReady();
    }, 5000);
    let lastReconnect = -Infinity;
    const reconnect = (): void => {
      if (document.hidden || performance.now() - lastReconnect < 500) return;
      lastReconnect = performance.now();
      // A suspended tab may have missed the acknowledgement of its last save.
      if (this.accountSyncSaveRetry !== null) window.clearTimeout(this.accountSyncSaveRetry);
      this.accountSyncSaveRetry = null;
      this.accountSyncInFlight = null;
      this.accountSyncLastSent = '';
      this.accountSyncRequest++;
      this.accountSyncReady = false;
      if (this.accountSyncRetry !== null) window.clearInterval(this.accountSyncRetry);
      sendReady();
      let attempts = 0;
      this.accountSyncRetry = window.setInterval(() => {
        if (this.accountSyncReady || attempts++ >= 20) {
          if (this.accountSyncRetry !== null) window.clearInterval(this.accountSyncRetry);
          this.accountSyncRetry = null;
        } else sendReady();
      }, 700);
    };
    window.addEventListener('focus', reconnect);
    window.addEventListener('pageshow', reconnect);
    window.addEventListener('online', reconnect);
    this.save.onChange(() => this.queueAccountProgressSave());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.queueAccountProgressSave(0);
      else reconnect();
    });
    window.addEventListener('pagehide', () => this.queueAccountProgressSave(0));
  }

  private queueAccountProgressSave(delay = 800): void {
    if (!this.accountSyncOrigin || !this.accountSyncLaunch || !this.accountSyncAuthenticated) return;
    if (this.accountSyncTimer !== null) window.clearTimeout(this.accountSyncTimer);
    this.accountSyncTimer = null;
    if (delay === 0) this.sendAccountProgress();
    else this.accountSyncTimer = window.setTimeout(() => {
      this.accountSyncTimer = null;
      this.sendAccountProgress();
    }, delay);
  }

  private sendAccountProgress(): void {
    if (!this.accountSyncOrigin || !this.accountSyncLaunch || !this.accountSyncAuthenticated || this.accountSyncInFlight !== null) return;
    const progress = JSON.stringify(this.save.get());
    if (progress === this.accountSyncLastSent) return;
    this.accountSyncInFlight = progress;
    window.parent.postMessage({
      type: 'rg:progress-save', v: 1, game: 'bombshift',
      launch: this.accountSyncLaunch, requestId: ++this.accountSyncRequest, progress: JSON.parse(progress),
    }, this.accountSyncOrigin);
    if (this.accountSyncSaveRetry !== null) window.clearTimeout(this.accountSyncSaveRetry);
    this.accountSyncSaveRetry = window.setTimeout(() => {
      this.accountSyncSaveRetry = null;
      this.accountSyncInFlight = null;
      this.sendAccountProgress();
    }, 5000);
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
        width: Math.max(1, document.getElementById('game-root')?.clientWidth || window.innerWidth),
        height: Math.max(1, document.getElementById('game-root')?.clientHeight || window.innerHeight),
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
      setTimeout(() => {
        const snap = loadRun();
        const map = snap ? MAPS.find((candidate) => candidate.id === snap.mapId) : null;
        const params = new URLSearchParams(window.location.search);
        const invited = params.has('rg_room') || params.has('room');
        if (!invited && snap && map && this.recovery.mapId === snap.mapId) {
          this.save.update((data) => { data.settings.difficulty = snap.difficulty as Difficulty; });
          this.startRun(map.id, snap, true);
        } else {
          this.recovery.clear();
          this.show(invited ? 'coop' : 'title');
        }
      }, 420);
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

  private requestCosmetics(action:string,item?:string,price?:number,requestKey?:string):Promise<any>{
    if(!this.accountSyncOrigin||!this.accountSyncLaunch||!this.accountSyncAuthenticated)return Promise.reject(new Error('Connecte-toi à Revanche Games pour acheter.'));
    return new Promise((resolve,reject)=>{const requestId=++this.shopRequestId;const timer=window.setTimeout(()=>{this.shopPending.delete(requestId);reject(new Error('Réponse indisponible. Actualise ta collection avant de réessayer.'));},15000);this.shopPending.set(requestId,{resolve,reject,timer});window.parent.postMessage({type:'rg:cosmetics',v:1,game:'bombshift',launch:this.accountSyncLaunch,requestId,action,item,price,requestKey},this.accountSyncOrigin!);});
  }
  private show(name: ScreenName): void {
    if(name!=='shop')this.shop?.close();
    else{this.shop??=new CosmeticShop(document.getElementById('skin-shop-body')!,this.requestCosmetics.bind(this));this.shop.open();}
    this.disposeLeaderboard?.();
    this.disposeLeaderboard = null;
    if (this.screen === 'ad' && name !== 'ad') { this.disposeAd?.(); this.disposeAd = null; }
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

    if (name === 'title') {
      this.refreshResumeButton();
      this.refreshPurchaseStatus();
      const status = document.getElementById('ad-demo-status');
      if (status) status.textContent = this.paidNoAds ? 'Sans publicité activé sur ton compte' : this.adDemo.state.removed
        ? 'Sans pub activé pour cet essai · achat fictif'
        : this.adDemo.shouldShow ? 'Essai actif après chaque victoire · aucun paiement' : 'Camouflip · La Meute · Président · Kilomax · essai gratuit';
      const stop = document.getElementById('ad-demo-stop');
      if (stop) stop.hidden = !this.adDemo.state.enabled;
    }
    if (name === 'coop') this.renderCoopLevels();
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
    if (name === 'brief' || name === 'result') {
      this.disposeLeaderboard = mountSpeedLeaderboard(document.getElementById(name === 'brief' ? 'brief-body' : 'result-body')!,
        this.selected, this.accountSyncOrigin, this.accountSyncAuthenticated);
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
    if (this.coopSeed !== null || (this.screen !== 'game' && this.screen !== 'pause')) return;
    const snap = this.gameScene?.serialize();
    if (snap) { saveRun(snap); this.recovery.mark(snap.mapId); }
  }

  private bindStaticButtons(): void {
    document.body.addEventListener('click', (ev) => {
      const target = (ev.target as HTMLElement).closest('[data-action]');
      if (!target) return;
      const action = target.getAttribute('data-action');
      audio.play(action === 'back-title' || action === 'back-maps' ? 'uiBack' : 'uiClick');
      switch (action) {
        case 'buy-no-ads':
          this.purchaseNoAds();
          break;
        case 'ad-demo':
          this.adDemo.set({ enabled: true, removed: false });
          this.openAdDemo('title');
          break;
        case 'ad-demo-stop':
          this.adDemo.set({ enabled: false, removed: false });
          this.show('title');
          break;
        case 'shop':
          this.show('shop');
          break;
        case 'play':
          this.show('maps');
          break;
        case 'coop':
          this.coopPeerReady = false; this.coopSeed = null;
          this.coopRoomHost = false;
          this.coop.disconnect();
          this.show('coop');
          break;
        case 'coop-create':
          void this.connectCoop('create');
          break;
        case 'coop-join':
          void this.connectCoop('join');
          break;
        case 'coop-start':
          if(this.coopRoomHost && this.coopPeerReady) this.coop.start();
          break;
        case 'coop-invite-friend':
          if(this.coop.code && this.accountSyncOrigin && this.accountSyncLaunch) window.parent.postMessage({type:'rg:bombshift-invite',v:1,game:'bombshift',launch:this.accountSyncLaunch,room:this.coop.code},this.accountSyncOrigin);
          else void this.copyCoopInvitation();
          break;
        case 'coop-copy':
          void this.copyCoopInvitation();
          break;
        case 'coop-share':
          void this.shareCoopInvitation();
          break;
        case 'coop-board-refresh':
          void this.loadCoopLeaderboard();
          break;
        case 'coop-leave':
          this.coopConnectionEpoch++; this.finishCoopRequest();
          this.coop.disconnect(); this.coopSeed = null; this.coopPeerReady = false;
          this.updateCoopRoom('', false);
          this.show('title');
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
          // Seul le solo conserve sa tentative. Quitter le duo ferme la connexion
          // afin de ne jamais relancer une partie solo comme une ancienne room.
          this.persistRun();
          this.stopRun();
          if (this.coopSeed !== null || this.coop.code) {
            this.coop.disconnect();
            this.coopSeed = null;
            this.coopRoomHost = false;
            this.coopPeerReady = false;
          }
          this.show('title');
          break;
      }
    });

    document.getElementById('btn-pause')?.addEventListener('click', (ev) => {
      ev.stopPropagation();
      this.togglePause();
    });
  }

  /* --------------------------------------------------- cooperation -------- */
  private renderCoopLevels(): void {
    const select = document.getElementById('coop-level') as HTMLSelectElement | null;
    if (!select) return;
    select.replaceChildren();
    MAPS.forEach(map => {
      const option = document.createElement('option');
      option.value = map.id;
      option.textContent = String(map.index + 1).padStart(2, '0') + ' · ' + map.name;
      select.appendChild(option);
    });
    select.value = this.selected.id;
    const boardFilter = document.getElementById('coop-board-filter') as HTMLSelectElement | null;
    if (boardFilter) {
      boardFilter.replaceChildren();
      const all = document.createElement('option');
      all.value = ''; all.textContent = 'Tous les niveaux'; boardFilter.appendChild(all);
      MAPS.forEach(map => {
        const option = document.createElement('option');
        option.value = map.id;
        option.textContent = String(map.index + 1).padStart(2, '0') + ' · ' + map.name;
        boardFilter.appendChild(option);
      });
      boardFilter.onchange = () => { void this.loadCoopLeaderboard(); };
    }
    void this.loadCoopLeaderboard();
    const launch = new URLSearchParams(window.location.search);
    const code = launch.get('rg_room') || launch.get('room');
    const codeInput = document.getElementById('coop-code') as HTMLInputElement | null;
    if (codeInput && code && !this.coop.code) codeInput.value = code.toUpperCase();
    // Ouverture de l'invitation = entrée automatique dans le salon.
    if (code && code !== this.coopAutoJoined && !this.coop.code && !this.coopConnecting) {
      this.coopAutoJoined = code;
      void this.connectCoop('join');
    }
    const nameInput = document.getElementById('coop-name') as HTMLInputElement | null;
    if (nameInput && !nameInput.value) {
      try { nameInput.value = this.coopPlatformName || localStorage.getItem('bombshift.coop.name') || ''; }
      catch { nameInput.value = ''; }
    }
    this.updateCoopRoom(this.coop.code, this.coopPeerReady);
  }

  private coopMessage(message: string): void {
    const el = document.getElementById('coop-status');
    if (el) el.textContent = message;
  }

  private updateCoopRoom(code: string, peerReady: boolean): void {
    const room = document.getElementById('coop-room');
    if (room) room.hidden = !code;
    const setup=document.getElementById('coop-setup'); if(setup) setup.hidden=!!code;
    const status=document.getElementById('coop-room-players');if(status)status.textContent=peerReady?'2 / 2 joueurs connectés':'1 / 2 — en attente de ton ami';
    const invite=document.getElementById('coop-invite-friend');if(invite)invite.hidden=!code||!this.coopRoomHost||!this.accountSyncOrigin;
    if(this.accountSyncOrigin && this.accountSyncLaunch)window.parent.postMessage({type:'rg:bombshift-room',v:1,game:'bombshift',launch:this.accountSyncLaunch,room:code||null},this.accountSyncOrigin);
    const invitation = document.getElementById('coop-invite-link') as HTMLInputElement | null;
    if (invitation) invitation.value = code ? this.coopInviteUrl() : '';
    const label = document.getElementById('coop-room-code');
    if (label) label.textContent = code || '—';
    const button = document.getElementById('coop-launch') as HTMLButtonElement | null;
    if (button) {
      button.hidden = !code || !this.coopRoomHost;
      button.disabled = !peerReady;
    }
  }

  private coopInviteUrl(): string {
    const onPlatform = this.accountSyncOrigin !== null || new URLSearchParams(location.search).has('rg_token');
    if (onPlatform) {
      const origin = this.accountSyncOrigin || 'https://revanchegames.com';
      const link = new URL('/play/bombshift', origin);
      link.searchParams.set('room', this.coop.code);
      return link.toString();
    }
    const link = new URL(window.location.href);
    link.searchParams.set('room', this.coop.code);
    link.searchParams.delete('rg_room');
    link.searchParams.delete('rg_token');
    return link.toString();
  }

  private async copyCoopInvitation(): Promise<void> {
    if (!this.coop.code) return;
    try {
      await navigator.clipboard.writeText(this.coopInviteUrl());
      this.coopMessage('Invitation copiée ! Ton ami rejoint directement en ouvrant le lien.');
    } catch {
      const field = document.getElementById('coop-invite-link') as HTMLInputElement | null;
      if (field) {
        field.focus(); field.select();
        try { document.execCommand('copy'); } catch { /* selection pour copie manuelle */ }
      }
      this.coopMessage('Le lien est sélectionné : partage-le directement, sans communiquer de code.');
    }
  }

  private async shareCoopInvitation(): Promise<void> {
    if (!this.coop.code) return;
    const message = 'Rejoins directement mon salon BombShift Duo !';
    if (navigator.share) {
      try { await navigator.share({ title: 'BombShift en duo', text: message, url: this.coopInviteUrl() }); }
      catch { await this.copyCoopInvitation(); }
    } else await this.copyCoopInvitation();
  }

  private async loadCoopLeaderboard(): Promise<void> {
    const container = document.getElementById('coop-board-content');
    if (!container || this.screen !== 'coop') return;
    this.coopLeaderboardAbort?.abort();
    const abort = new AbortController(); this.coopLeaderboardAbort = abort;
    const filter = document.getElementById('coop-board-filter') as HTMLSelectElement | null;
    const level = filter?.value || '';
    container.textContent = 'Chargement du classement duo…';
    try {
      const response = await fetch(this.coop.apiOrigin + '/api/coop/leaderboard' +
        (level ? '?level=' + encodeURIComponent(level) : ''), { signal: abort.signal, cache: 'no-store' });
      if (!response.ok) throw new Error('Classement indisponible');
      const data = await response.json() as { entries?: Array<{ host: string; guest: string; level: string; time_ms: number }> };
      if (abort.signal.aborted) return;
      container.replaceChildren();
      if (!data.entries?.length) { container.textContent = 'Aucune victoire en duo enregistrée pour le moment.'; return; }
      const table = document.createElement('table');
      table.className = 'speed-board__table';
      const head = document.createElement('thead');
      const tr = document.createElement('tr');
      for (const title of ['Rang', 'Équipe', 'Niveau', 'Temps']) {
        const th = document.createElement('th'); th.textContent = title; tr.appendChild(th);
      }
      head.appendChild(tr); table.appendChild(head);
      const body = document.createElement('tbody');
      data.entries.slice(0, 10).forEach((entry, index) => {
        if (!Number.isFinite(entry.time_ms) || entry.time_ms <= 0) return;
        const row = document.createElement('tr');
        const minutes = Math.floor(entry.time_ms / 60000);
        const seconds = String(Math.floor(entry.time_ms / 1000) % 60).padStart(2, '0');
        const map = MAPS.find(m => m.id === entry.level);
        for (const value of [String(index + 1), entry.host + ' + ' + entry.guest,
          map ? String(map.index + 1) : entry.level, minutes + ':' + seconds]) {
          const cell = document.createElement('td'); cell.textContent = value; row.appendChild(cell);
        }
        body.appendChild(row);
      });
      table.appendChild(body); container.appendChild(table);
    } catch {
      if (!abort.signal.aborted) container.textContent = 'Classement temporairement inaccessible.';
    }
  }

  private finishCoopRequest():void {
    this.coopConnecting=false;
    if(this.coopRequestTimer!==null)window.clearTimeout(this.coopRequestTimer);
    this.coopRequestTimer=null;
    document.querySelectorAll<HTMLButtonElement>('[data-action="coop-create"],[data-action="coop-join"]').forEach(b=>b.disabled=false);
  }
  private async connectCoop(mode: 'create' | 'join'): Promise<void> {
    if(this.coopConnecting||this.coop.code)return;
    const input=document.getElementById('coop-code') as HTMLInputElement;
    const code=input.value.trim().toUpperCase();
    if(mode==='join'&&!/^[A-HJ-NP-Z2-9]{4}$/.test(code)){this.coopMessage('Code invalide. Utilise le lien reçu ou les 4 caractères.');return;}
    this.coopConnecting=true;
    const epoch=++this.coopConnectionEpoch;
    document.querySelectorAll<HTMLButtonElement>('[data-action="coop-create"],[data-action="coop-join"]').forEach(b=>b.disabled=true);
    try {
      this.coopMessage('Connexion au serveur multijoueur…');
      await this.coop.connect();
      if(epoch!==this.coopConnectionEpoch||this.screen!=='coop')return;
      const nick=this.coopPlatformName||(document.getElementById('coop-name') as HTMLInputElement).value.trim().slice(0,22)||'Joueur';
      try{localStorage.setItem('bombshift.coop.name',nick);}catch{}
      this.coopPeerReady=false; this.coopSeed=null;
      this.coopMessage(mode==='create'?'Création du salon…':'Recherche du salon…');
      this.coopRequestTimer=window.setTimeout(()=>{if(epoch!==this.coopConnectionEpoch)return;this.coop.disconnect();this.finishCoopRequest();this.coopMessage('Le serveur ne répond pas. Réessaie.');},10000);
      if(mode==='create'){const select=document.getElementById('coop-level') as HTMLSelectElement;this.selected=getMap(select.value as MapId);this.coop.create(this.selected.id,this.save.get().settings.difficulty,nick);}
      else this.coop.join(code,nick);
    }catch(error){if(epoch===this.coopConnectionEpoch){this.finishCoopRequest();this.coopMessage(error instanceof Error?error.message:'Connexion impossible.');}}
  }

  /* -------------------------------------------------------- partie -------- */

  private startRun(mapId: MapId, snapshot: RunSnapshot | null = null, paused = false): void {
    if (!this.ready || !this.game) return;
    const def = getMap(mapId);
    this.selected = def;

    if (!snapshot && this.coopSeed === null) clearRun();
    if (this.coopSeed === null) this.save.update((d) => {
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
      heroSkin:this.shop?.hero,
      bombSkin:this.shop?.bomb,
      mapId,
      snapshot,
      ...(this.coopSeed !== null && this.coop.role ? {
        coop: {
          role: this.coop.role,
          seed: this.coopSeed,
          sendInput: (input: typeof this.remoteCoopInput) => this.coop.sendInput(input),
          sendState: (state: CoopState) => this.coop.sendState(state),
          onResult: (victory: boolean) => this.coop.sendResult(victory),
        },
        remoteInput: this.remoteCoopInput,
        remoteInputFresh: () => performance.now()-this.lastRemoteInputAt<700,
      } : {}),
      onReady: () => {
        this.show('game');
        this.persistRun();
        if (this.coopSeed === null && (paused || document.hidden)) this.pause();
      },
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
      onComplete: (result) => {
        if (this.coopSeed === null) this.completedRun = { result, meta: this.recordRunResult(result) };
      },
      onEnd: (result) => this.onRunEnd(result),
    };

    const manager = this.game.scene;
    if (manager.getScene(GameScene.KEY)) manager.stop(GameScene.KEY);
    // Un tick d'attente garantit que le shutdown precedent a bien libere
    // sprites, minuteurs et ecouteurs avant la nouvelle tentative.
    setTimeout(() => {
      manager.start(GameScene.KEY, data);
    }, 60);
  }

  private resumeSavedRun(): void {
    const snap = this.pendingRun ?? loadRun();
    if (!snap) {
      this.refreshResumeButton();
      this.refreshPurchaseStatus();
      return;
    }
    const map = MAPS.find((m) => m.id === snap.mapId);
    if (!map) {
      clearRun();
      this.refreshResumeButton();
      this.refreshPurchaseStatus();
      return;
    }
    // La difficulte de la tentative sauvegardee prime : on reprend a l'identique.
    this.save.update((d) => {
      d.settings.difficulty = snap.difficulty as Difficulty;
    });
    this.startRun(map.id, snap);
  }

  private stopRun(): void {
    this.recovery.clear();
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
    if (this.screen === 'game' && this.coopSeed === null) this.pause();
    else if (this.screen === 'pause') this.resume();
  }

  private pause(): void {
    const scene = this.gameScene;
    if (!scene || scene.currentPhase !== 'playing') return;
    if (this.coopSeed !== null) {
      this.hud.toast('Pause désactivée en coopération en ligne', 'info');
      return;
    }
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

  private recordRunResult(result: RunResult): { victory: boolean; newRecord: boolean; unlockedMap: string | null; unlockedAbility: string | null; saved: boolean } {
    const mandatoryDone = result.objectives.filter((o) => o.mandatory).every((o) => o.done);
    // Garde-fou : une victoire n'est enregistree que si les objectifs
    // obligatoires sont reellement valides.
    const victory = result.victory && mandatoryDone;

    let newRecord = false;
    let unlockedMap: string | null = null;
    let unlockedAbility: string | null = null;

    this.save.update((d) => {
      const p = d.maps[result.mapId] ??= this.save.mapProgress(result.mapId);
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
    const saved = this.save.flush();
    this.queueAccountProgressSave(0);
    clearRun();
    this.recovery.clear();
    return { victory, newRecord, unlockedMap, unlockedAbility, saved };
  }

  private onRunEnd(result: RunResult): void {
    const def = getMap(result.mapId);
    const inDuo = this.coopSeed !== null;
    this.coopResultPending = inDuo;
    const meta = inDuo
      ? { victory: result.victory, newRecord: false, unlockedMap: null, unlockedAbility: null, saved: true }
      : this.completedRun?.result === result ? this.completedRun.meta : this.recordRunResult(result);
    this.completedRun = null;
    const { victory, newRecord, unlockedMap, unlockedAbility } = meta;
    audio.stopMusic();
    this.stopRun();
    if (this.coopSeed !== null) {
      this.coop.disconnect(); this.coopSeed = null; this.coopPeerReady = false;
    }

    const isCoopResult = this.coopResultPending;
    this.coopResultPending = false;
    renderResult(
      document.getElementById('result-body')!,
      { ...result, victory },
      def,
      { newRecord, unlockedMap, unlockedAbility },
      (action) => {
        audio.play('uiClick');
        if (action === 'retry') { if (isCoopResult) this.show('coop'); else this.startRun(result.mapId); }
        else if (action === 'maps') this.show('maps');
        else this.show('title');
      },
    );
    const receipt = document.createElement('p');
    receipt.className = 'save-receipt';
    receipt.setAttribute('role', 'status');
    receipt.textContent = meta.saved
      ? '✓ Progression sauvegardée sur cet appareil'
      : 'Sauvegarde locale indisponible : autorisez le stockage du navigateur pour conserver la progression.';
    document.getElementById('result-body')!.appendChild(receipt);
    if (victory && !this.paidNoAds && this.adDemo.shouldShow) this.openAdDemo('result');
    else this.show('result');
  }

  private openAdDemo(returnTo: 'title' | 'result'): void {
    if (this.paidNoAds) { this.show(returnTo); return; }
    this.show('ad');
    this.disposeAd?.();
    this.disposeAd = renderAdDemo(document.getElementById('screen-ad')!,
      () => this.show(returnTo),
      () => {
        this.purchaseNoAds();
      }, this.adDemo.nextCreative());
  }

  private refreshPurchaseStatus(message?: string): void {
    const button = document.getElementById('buy-no-ads') as HTMLButtonElement | null;
    if (button) {
      button.disabled = this.paidNoAds || this.purchasePending;
      button.textContent = this.paidNoAds ? 'SANS PUBLICITÉ ACTIVÉ' : this.purchasePending ? 'OUVERTURE DU PAIEMENT…' : 'SANS PUBLICITÉ · 0,99 €';
    }
    const note = document.getElementById('buy-no-ads-note');
    if (note) note.textContent = message || (this.paidNoAds ? 'Achat restauré depuis ton compte Revanche Games.' : 'Achat unique de 0,99 € · compte Revanche Games requis');
    const error = document.getElementById('ad-purchase-message');
    if (error) error.textContent = message || '';
    const confirm = document.getElementById('ad-confirm') as HTMLButtonElement | null;
    if (confirm) confirm.disabled = this.purchasePending;
  }

  private purchaseNoAds(): void {
    if (this.paidNoAds || this.purchasePending) return;
    if (!this.accountSyncOrigin || !this.accountSyncLaunch) {
      this.refreshPurchaseStatus('Ouvre BombShift depuis la plateforme Revanche Games pour acheter cette option.');
      return;
    }
    this.purchasePending = true;
    this.refreshPurchaseStatus('Ouverture du paiement sécurisé Stripe…');
    window.parent.postMessage({ type: 'rg:purchase-no-ads', v: 1, game: 'bombshift', launch: this.accountSyncLaunch }, this.accountSyncOrigin);
    window.setTimeout(() => {
      if (!this.purchasePending) return;
      this.purchasePending = false;
      this.refreshPurchaseStatus('Le paiement ne s’est pas ouvert. Tu peux réessayer.');
    }, 20000);
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
        if (this.wasPlayingBeforeHide && this.coopSeed === null) this.pause();
        this.persistRun();
        this.save.flush();
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

    // Mobile operating systems can discard a tab without another lifecycle event.
    window.setInterval(() => {
      if (this.screen === 'game' && !document.hidden) this.persistRun();
    }, 5000);
    window.addEventListener('pageshow', () => {
      if (this.screen === 'game') this.pause();
      if (!this.ready) this.recoverStalledBoot();
    });
    document.addEventListener('freeze', () => {
      if (this.screen === 'game') this.pause();
      this.persistRun();
      this.save.flush();
    });

    window.addEventListener('beforeunload', () => { this.coop.disconnect(); this.save.flush(); });

    // Orientation / redimensionnement : Phaser gere le canvas, on recalcule
    // seulement la taille du jeu.
    const root = document.getElementById('game-root');
    let resizeFrame = 0;
    const onResize = (): void => {
      if(resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeFrame=requestAnimationFrame(()=>{
        resizeFrame=0;
        const w=Math.round(root?.clientWidth || 0), h=Math.round(root?.clientHeight || 0);
        const scale=this.game?.scale;
        if(!scale || w<32 || h<32) return;
        if(scale.gameSize.width!==w || scale.gameSize.height!==h) scale.resize(w,h);
        scale.updateBounds();
      });
    };
    if(root && typeof ResizeObserver!=='undefined') new ResizeObserver(onResize).observe(root);
    window.addEventListener('resize', onResize);
    window.visualViewport?.addEventListener('resize',onResize);
    document.addEventListener('fullscreenchange',onResize);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)onResize();});
    window.addEventListener('pageshow',onResize);
    window.addEventListener('orientationchange',()=>{onResize();setTimeout(onResize,150);setTimeout(onResize,500);});
    onResize();

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
