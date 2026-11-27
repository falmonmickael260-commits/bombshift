import type { InputState } from '../core/types';
import type { Difficulty } from '../core/types';
import type { MapId } from '../maps';

export type CoopRole = 'host' | 'guest';
export interface CoopPlayerState { x: number; y: number; lives: number; alive: boolean; maxBombs: number; range: number; speedBonus: number; pierceCharges: number; shieldLeftMs: number; }
export interface CoopState {
  players: [CoopPlayerState, CoopPlayerState];
  tiles: number[];
  tileFlags: number[];
  enemies: Array<{ kind: 'patroller' | 'chaser' | 'flanker' | 'coward' | 'heavy' | 'guardian'; x: number; y: number; hp: number; alive: boolean; asleep: boolean }>;
  boss: { x: number; y: number; hp: number; active: boolean; alive: boolean; phase: number; vulnerable: boolean } | null;
  bombs: Array<{ id: number; x: number; y: number; type: 'classic' | 'pierce' | 'shift' | 'slow'; range: number; pierce: number; fuseLeftMs: number; slide: { x: number; y: number } | null; owner: 'player' | 'partner' | 'boss' }>;
  flames: Array<{ x: number; y: number; leftMs: number; tint: number; owner: 'player' | 'world' }>;
  powerups: Array<{ kind: 'range' | 'bomb' | 'speed' | 'shield' | 'pierce' | 'ability' | 'life'; cell: { x: number; y: number } }>;
  projectiles: Array<{ x: number; y: number; vx: number; vy: number; leftMs: number; radius: number }>;
  propsDone: boolean[];
  objectives: Array<{ id: string; current: number; done: boolean }>;
  bossDead: boolean;
  timeMs: number;
}
type RoomEvent =
  | { type: 'created' | 'joined'; code: string; level: MapId; difficulty?: Difficulty }
  | { type: 'started'; level: MapId; difficulty: Difficulty; role: CoopRole; seed: number }
  | { type: 'peer-joined' | 'peer-left'; guest?: string }
  | { type: 'input'; input: InputState }
  | { type: 'state'; state: CoopState }
  | { type: 'result'; result: { victory: boolean } }
  | { type: 'recorded'; time_ms: number }
  | { type: 'error'; message: string };

export class CoopClient {
  private socket: WebSocket | null = null;
  private listener: ((event: RoomEvent) => void) | null = null;
  private connected = false;
  private heartbeat: number | null = null;
  private stateFrame = 0;
  private latestState: CoopState | null = null;
  role: CoopRole | null = null;
  code = '';
  level: MapId | null = null;
  get isConnected(): boolean { return this.connected && this.socket?.readyState === WebSocket.OPEN; }

  onEvent(listener: (event: RoomEvent) => void): void { this.listener = listener; }
  connect(): Promise<void> {
    this.disconnect();
    return new Promise((resolve, reject) => {
      // An optional external relay can be set when the frontend is hosted on GitHub Pages.
      const relay = (import.meta.env.VITE_COOP_WS_URL as string | undefined)?.trim();
      const url = relay || 'wss://bombshift-duo-production.up.railway.app/multiplayer';
      const socket = new WebSocket(url);
      this.socket = socket;
      const timeout = window.setTimeout(() => {
        if (socket.readyState !== WebSocket.OPEN) { socket.close(); reject(new Error('Serveur multijoueur indisponible.')); }
      }, 9000);
      socket.onopen = () => {
        window.clearTimeout(timeout);
        if (this.socket !== socket) return;
        this.connected = true;
        this.heartbeat = window.setInterval(() => this.send({ type: 'heartbeat' }), 20000);
        resolve();
      };
      socket.onmessage = (event) => {
        if (this.socket !== socket) return;
        try {
          const packet = JSON.parse(String(event.data)) as RoomEvent;
          if (packet.type === 'created' || packet.type === 'joined') {
            this.code = packet.code; this.level = packet.level;
          }
          if (packet.type === 'started') { this.role = packet.role; this.level = packet.level; }
          if (packet.type === 'peer-left') {
            this.role = null;
            this.code = '';
            this.level = null;
          }
          if(packet.type==='state'){
            this.latestState=packet.state;
            if(!this.stateFrame)this.stateFrame=requestAnimationFrame(()=>{this.stateFrame=0;const state=this.latestState;this.latestState=null;if(state&&this.socket===socket)this.listener?.({type:'state',state});});
          }else this.listener?.(packet);
        } catch { /* Malformed packets are ignored. */ }
      };
      socket.onerror = () => { if (!this.connected) { window.clearTimeout(timeout); reject(new Error('Connexion au serveur impossible.')); } };
      socket.onclose = () => {
        if (this.socket !== socket) return;
        const wasConnected = this.connected;
        this.connected = false; this.role = null; this.code = ''; this.level = null;
        if (this.heartbeat !== null) window.clearInterval(this.heartbeat);
        this.heartbeat = null;
        if (wasConnected) this.listener?.({ type: 'peer-left' });
      };
    });
  }
  send(packet: Record<string, unknown>): void {
    if (this.isConnected) this.socket!.send(JSON.stringify(packet));
  }
  create(level: MapId, difficulty: Difficulty, name: string): void { this.send({ type: 'create', level, difficulty, name }); }
  join(code: string, name: string): void { this.send({ type: 'join', code: code.trim().toUpperCase(), name }); }
  start(): void { this.send({ type: 'start' }); }
  sendInput(input: InputState): void { this.send({ type: 'input', input: { ...input } }); }
  sendState(state: CoopState): void { if(this.socket && this.socket.bufferedAmount<96*1024)this.send({ type: 'state', state }); }
  sendResult(victory: boolean): void { this.send({ type: 'result', result: { victory } }); }
  confirmResult(): void { this.send({ type: 'confirm-result' }); }
  get apiOrigin(): string {
    const socketUrl = (import.meta.env.VITE_COOP_WS_URL as string | undefined)?.trim();
    return socketUrl ? new URL(socketUrl).origin.replace(/^ws/, 'http') : 'https://bombshift-duo-production.up.railway.app';
  }
  disconnect(): void {
    if(this.stateFrame)cancelAnimationFrame(this.stateFrame);this.stateFrame=0;this.latestState=null;
    if (this.heartbeat !== null) window.clearInterval(this.heartbeat);
    this.heartbeat = null;
    if (this.socket) {
      if (this.socket.readyState === WebSocket.OPEN) this.send({ type: 'leave' });
      this.socket.close();
    }
    this.socket = null; this.connected = false; this.role = null; this.code = ''; this.level = null;
  }
}
