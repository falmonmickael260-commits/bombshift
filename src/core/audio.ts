import type { Theme } from './types';

export type SfxName =
  | 'uiClick'
  | 'uiBack'
  | 'uiConfirm'
  | 'bombPlace'
  | 'bombShift'
  | 'explosion'
  | 'explosionBig'
  | 'blockBreak'
  | 'pickup'
  | 'lifeUp'
  | 'hurt'
  | 'shield'
  | 'enemyDie'
  | 'bossHurt'
  | 'bossRoar'
  | 'switchOn'
  | 'generatorOn'
  | 'relic'
  | 'gateOpen'
  | 'doorMove'
  | 'trap'
  | 'warning'
  | 'secret'
  | 'victory'
  | 'defeat';

interface MusicPattern {
  bpm: number;
  /** Degres de la gamme utilises par la basse, -1 = silence. */
  bass: number[];
  /** Arpege melodique. */
  lead: number[];
  /** Grosse caisse / caisse claire / charley sur 16 pas. */
  kick: number[];
  snare: number[];
  hat: number[];
  /** Notes MIDI de la gamme. */
  scale: number[];
  rootMidi: number;
  leadWave: OscillatorType;
  bassWave: OscillatorType;
  filter: number;
}

const MUSIC: Record<Theme, MusicPattern> = {
  // Forteresse volcanique : mineur harmonique, tempo soutenu, basse martelee.
  volcano: {
    bpm: 132,
    scale: [0, 2, 3, 5, 7, 8, 11],
    rootMidi: 38,
    bass: [0, -1, 0, 0, 4, -1, 0, -1, 2, -1, 2, 2, 5, -1, 4, -1],
    lead: [7, -1, 6, 4, -1, 3, 4, -1, 2, -1, 4, -1, 6, 7, -1, 4],
    kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1],
    hat: [0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1],
    leadWave: 'sawtooth',
    bassWave: 'square',
    filter: 1900,
  },
  // Labyrinthe de glace : gamme suspendue, tempo lent, textures cristallines.
  ice: {
    bpm: 104,
    scale: [0, 2, 4, 7, 9, 11, 14],
    rootMidi: 45,
    bass: [0, -1, -1, -1, 3, -1, -1, -1, 5, -1, -1, -1, 4, -1, -1, -1],
    lead: [4, 6, -1, 5, 4, -1, 2, 3, -1, 4, 6, -1, 5, -1, 3, -1],
    kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0],
    leadWave: 'triangle',
    bassWave: 'sine',
    filter: 2600,
  },
  // Temple oublie : mode phrygien, percussions tribales, ambiance oppressante.
  temple: {
    bpm: 118,
    scale: [0, 1, 3, 5, 7, 8, 10],
    rootMidi: 40,
    bass: [0, 0, -1, 0, -1, 3, -1, 0, 1, -1, 1, -1, 5, -1, 3, 0],
    lead: [0, -1, 3, -1, 5, 4, -1, 3, -1, 1, 0, -1, 3, -1, 5, -1],
    kick: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0],
    snare: [0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1],
    hat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    leadWave: 'square',
    bassWave: 'triangle',
    filter: 1500,
  },
};

const midiToFreq = (m: number): number => 440 * Math.pow(2, (m - 69) / 12);

/**
 * Moteur audio 100% procedural (WebAudio) : aucun fichier a telecharger,
 * donc aucun asset distant qui pourrait disparaitre, et un poids nul.
 */
export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private musicTimer: ReturnType<typeof setInterval> | null = null;
  private step = 0;
  private nextNoteTime = 0;
  private currentTheme: Theme | null = null;
  private sfxVolume = 0.8;
  private musicVolume = 0.45;
  private lastPlayed = new Map<SfxName, number>();
  private muted = false;
  private bossMode = false;

  /** Doit etre appele depuis un geste utilisateur (politique mobile). */
  unlock(): void {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 1;
      this.master.connect(this.ctx.destination);

      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = this.sfxVolume;
      this.sfxBus.connect(this.master);

      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.ratio.value = 7;
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = this.musicVolume;
      this.musicBus.connect(comp);
      comp.connect(this.master);

      const len = Math.floor(this.ctx.sampleRate * 1.2);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
      this.noiseBuffer = buf;
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  setVolumes(sfx: number, music: number): void {
    this.sfxVolume = sfx;
    this.musicVolume = music;
    if (this.sfxBus) this.sfxBus.gain.value = this.muted ? 0 : sfx;
    if (this.musicBus) this.musicBus.gain.value = this.muted ? 0 : music;
  }

  /** Coupe tout (mise en arriere-plan de l'application). */
  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.sfxBus) this.sfxBus.gain.value = muted ? 0 : this.sfxVolume;
    if (this.musicBus) this.musicBus.gain.value = muted ? 0 : this.musicVolume;
    if (muted) {
      if (this.ctx && this.ctx.state === 'running') void this.ctx.suspend();
    } else if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  // --- Briques de synthese ---------------------------------------------------

  private tone(opts: {
    freq: number;
    dur: number;
    type?: OscillatorType;
    gain?: number;
    attack?: number;
    sweepTo?: number;
    bus?: GainNode | null;
    detune?: number;
    when?: number;
  }): void {
    const ctx = this.ctx;
    const bus = opts.bus ?? this.sfxBus;
    if (!ctx || !bus) return;
    const t0 = opts.when ?? ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = opts.type ?? 'sine';
    osc.frequency.setValueAtTime(Math.max(20, opts.freq), t0);
    if (opts.sweepTo !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.sweepTo), t0 + opts.dur);
    }
    if (opts.detune) osc.detune.value = opts.detune;
    const peak = opts.gain ?? 0.3;
    const atk = opts.attack ?? 0.004;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(peak, t0 + atk);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur);
    osc.connect(gain);
    gain.connect(bus);
    osc.start(t0);
    osc.stop(t0 + opts.dur + 0.02);
  }

  private noise(opts: {
    dur: number;
    gain?: number;
    from?: number;
    to?: number;
    q?: number;
    type?: BiquadFilterType;
    bus?: GainNode | null;
    when?: number;
    playbackRate?: number;
  }): void {
    const ctx = this.ctx;
    const bus = opts.bus ?? this.sfxBus;
    if (!ctx || !bus || !this.noiseBuffer) return;
    const t0 = opts.when ?? ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.playbackRate.value = opts.playbackRate ?? 1;
    const filter = ctx.createBiquadFilter();
    filter.type = opts.type ?? 'lowpass';
    filter.Q.value = opts.q ?? 1;
    filter.frequency.setValueAtTime(opts.from ?? 1200, t0);
    if (opts.to !== undefined) {
      filter.frequency.exponentialRampToValueAtTime(Math.max(40, opts.to), t0 + opts.dur);
    }
    const gain = ctx.createGain();
    const peak = opts.gain ?? 0.3;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(peak, t0 + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(bus);
    src.start(t0, Math.random() * 0.2);
    src.stop(t0 + opts.dur + 0.02);
  }

  // --- Effets ---------------------------------------------------------------

  play(name: SfxName): void {
    if (!this.ctx || this.muted) return;
    // Anti-saturation : un meme effet ne se declenche pas 20 fois dans la meme frame.
    const now = performance.now();
    const minGap = name === 'explosion' || name === 'blockBreak' ? 35 : 15;
    if (now - (this.lastPlayed.get(name) ?? -1e9) < minGap) return;
    this.lastPlayed.set(name, now);

    switch (name) {
      case 'uiClick':
        this.tone({ freq: 660, dur: 0.07, type: 'square', gain: 0.14 });
        break;
      case 'uiBack':
        this.tone({ freq: 380, dur: 0.09, type: 'square', gain: 0.13, sweepTo: 240 });
        break;
      case 'uiConfirm':
        this.tone({ freq: 520, dur: 0.1, type: 'triangle', gain: 0.18 });
        this.tone({ freq: 780, dur: 0.14, type: 'triangle', gain: 0.14, when: this.at(0.06) });
        break;
      case 'bombPlace':
        this.tone({ freq: 300, dur: 0.1, type: 'sine', gain: 0.22, sweepTo: 150 });
        this.noise({ dur: 0.06, gain: 0.1, from: 2400, to: 600 });
        break;
      case 'bombShift':
        this.noise({ dur: 0.34, gain: 0.12, from: 900, to: 2600, type: 'bandpass', q: 3 });
        break;
      case 'explosion':
        this.noise({ dur: 0.44, gain: 0.5, from: 1700, to: 90, q: 0.9 });
        this.tone({ freq: 118, dur: 0.38, type: 'sine', gain: 0.4, sweepTo: 38 });
        break;
      case 'explosionBig':
        this.noise({ dur: 0.8, gain: 0.6, from: 2300, to: 60, q: 1.1 });
        this.tone({ freq: 90, dur: 0.7, type: 'sine', gain: 0.5, sweepTo: 28 });
        this.noise({ dur: 0.5, gain: 0.2, from: 400, to: 160, when: this.at(0.1) });
        break;
      case 'blockBreak':
        this.noise({ dur: 0.18, gain: 0.26, from: 3000, to: 420, q: 1.6, playbackRate: 1.4 });
        break;
      case 'pickup':
        this.tone({ freq: 720, dur: 0.09, type: 'triangle', gain: 0.2 });
        this.tone({ freq: 1080, dur: 0.12, type: 'triangle', gain: 0.17, when: this.at(0.07) });
        break;
      case 'lifeUp':
        [660, 880, 1320].forEach((f, i) =>
          this.tone({ freq: f, dur: 0.16, type: 'triangle', gain: 0.2, when: this.at(i * 0.08) }),
        );
        break;
      case 'hurt':
        this.tone({ freq: 420, dur: 0.26, type: 'sawtooth', gain: 0.3, sweepTo: 90 });
        this.noise({ dur: 0.16, gain: 0.2, from: 1200, to: 200 });
        break;
      case 'shield':
        this.tone({ freq: 480, dur: 0.3, type: 'sine', gain: 0.22, sweepTo: 960 });
        break;
      case 'enemyDie':
        this.tone({ freq: 560, dur: 0.2, type: 'square', gain: 0.18, sweepTo: 120 });
        this.noise({ dur: 0.2, gain: 0.18, from: 1800, to: 300 });
        break;
      case 'bossHurt':
        this.tone({ freq: 220, dur: 0.3, type: 'sawtooth', gain: 0.3, sweepTo: 70 });
        this.noise({ dur: 0.3, gain: 0.25, from: 900, to: 120 });
        break;
      case 'bossRoar':
        this.tone({ freq: 70, dur: 1.1, type: 'sawtooth', gain: 0.38, sweepTo: 46 });
        this.noise({ dur: 1.2, gain: 0.3, from: 300, to: 1400, type: 'bandpass', q: 2 });
        break;
      case 'switchOn':
        this.tone({ freq: 300, dur: 0.1, type: 'square', gain: 0.2 });
        this.tone({ freq: 900, dur: 0.22, type: 'square', gain: 0.16, when: this.at(0.08) });
        break;
      case 'generatorOn':
        this.tone({ freq: 160, dur: 0.6, type: 'sawtooth', gain: 0.24, sweepTo: 640 });
        this.noise({ dur: 0.5, gain: 0.14, from: 600, to: 3200, type: 'bandpass', q: 4 });
        break;
      case 'relic':
        [784, 988, 1175, 1568].forEach((f, i) =>
          this.tone({ freq: f, dur: 0.5, type: 'sine', gain: 0.17, when: this.at(i * 0.1) }),
        );
        break;
      case 'gateOpen':
        this.tone({ freq: 120, dur: 0.8, type: 'sawtooth', gain: 0.25, sweepTo: 300 });
        this.noise({ dur: 0.9, gain: 0.18, from: 300, to: 1200 });
        break;
      case 'doorMove':
        this.noise({ dur: 0.3, gain: 0.16, from: 500, to: 1500, type: 'bandpass', q: 2 });
        break;
      case 'trap':
        this.noise({ dur: 0.12, gain: 0.3, from: 4000, to: 900, q: 2, playbackRate: 1.8 });
        this.tone({ freq: 1400, dur: 0.1, type: 'square', gain: 0.14, sweepTo: 500 });
        break;
      case 'warning':
        this.tone({ freq: 880, dur: 0.12, type: 'square', gain: 0.16 });
        this.tone({ freq: 880, dur: 0.12, type: 'square', gain: 0.16, when: this.at(0.18) });
        break;
      case 'secret':
        [523, 659, 784, 1046, 1318].forEach((f, i) =>
          this.tone({ freq: f, dur: 0.4, type: 'triangle', gain: 0.16, when: this.at(i * 0.07) }),
        );
        break;
      case 'victory':
        [523, 659, 784, 1046].forEach((f, i) =>
          this.tone({ freq: f, dur: 0.6, type: 'triangle', gain: 0.22, when: this.at(i * 0.14) }),
        );
        break;
      case 'defeat':
        [392, 330, 262, 196].forEach((f, i) =>
          this.tone({ freq: f, dur: 0.5, type: 'sawtooth', gain: 0.2, when: this.at(i * 0.18) }),
        );
        break;
    }
  }

  private at(offset: number): number {
    return (this.ctx?.currentTime ?? 0) + offset;
  }

  // --- Musique --------------------------------------------------------------

  /**
   * Bascule la musique en mode combat : tempo accelere et basse doublee.
   * Donne un relief immediat a l'arrivee d'un boss sans charger d'autre piste.
   */
  setBossMode(on: boolean): void {
    this.bossMode = on;
  }

  playMusic(theme: Theme): void {
    if (!this.ctx) return;
    if (this.currentTheme === theme && this.musicTimer !== null) return;
    this.stopMusic();
    this.currentTheme = theme;
    this.step = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.1;
    this.musicTimer = setInterval(() => this.scheduleMusic(), 25);
  }

  stopMusic(): void {
    this.bossMode = false;
    if (this.musicTimer !== null) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    this.currentTheme = null;
  }

  private scheduleMusic(): void {
    const ctx = this.ctx;
    if (!ctx || !this.currentTheme || this.muted) return;
    const pat = MUSIC[this.currentTheme];
    const bpm = this.bossMode ? pat.bpm * 1.18 : pat.bpm;
    const stepDur = 60 / bpm / 4;
    while (this.nextNoteTime < ctx.currentTime + 0.12) {
      const s = this.step % 16;
      const t = this.nextNoteTime;

      const bassDeg = this.bossMode && pat.bass[s] < 0 && s % 2 === 0 ? 0 : pat.bass[s];
      if (bassDeg >= 0) {
        const midi = pat.rootMidi + pat.scale[bassDeg % pat.scale.length] - 12;
        this.tone({
          freq: midiToFreq(midi),
          dur: stepDur * 1.6,
          type: pat.bassWave,
          gain: 0.3,
          bus: this.musicBus,
          when: t,
        });
      }

      const leadDeg = pat.lead[s];
      if (leadDeg >= 0) {
        const midi = pat.rootMidi + pat.scale[leadDeg % pat.scale.length] + 12;
        this.tone({
          freq: midiToFreq(midi),
          dur: stepDur * 1.2,
          type: pat.leadWave,
          gain: 0.09,
          bus: this.musicBus,
          when: t,
          detune: -4,
        });
      }

      if (pat.kick[s]) {
        this.tone({
          freq: 150,
          dur: 0.18,
          type: 'sine',
          gain: 0.4,
          sweepTo: 44,
          bus: this.musicBus,
          when: t,
        });
      }
      if (pat.snare[s]) {
        this.noise({
          dur: 0.12,
          gain: 0.16,
          from: 2200,
          to: 700,
          bus: this.musicBus,
          when: t,
          playbackRate: 1.3,
        });
      }
      if (pat.hat[s]) {
        this.noise({
          dur: 0.05,
          gain: 0.06,
          from: pat.filter * 2,
          to: pat.filter,
          type: 'highpass',
          bus: this.musicBus,
          when: t,
          playbackRate: 1.8,
        });
      }

      this.nextNoteTime += stepDur;
      this.step++;
    }
  }

  destroy(): void {
    this.stopMusic();
    if (this.ctx) void this.ctx.close();
    this.ctx = null;
  }
}

export const audio = new AudioEngine();
