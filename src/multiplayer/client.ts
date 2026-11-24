import type { InputState } from '../core/types';
import type { Difficulty } from '../core/types';
import type { MapId } from '../maps';

export type CoopRole = 'host' | 'guest';
export interface CoopPlayerState { x: number; y: number; lives: number; alive: boolean; }
export interface CoopState {
  players: [CoopPlayerState, CoopPlayerState];
  tiles: number[];
  bossHp: number | null;
  bossAlive: boolean;
  timeMs: number;
}
type RoomEvent =
  | { type: 'created' | 'joined'; code: string; level: MapId; difficulty?: Difficulty }
  | { type: 'started'; level: MapId; difficulty: Difficulty; role: CoopRole; seed: number }
  | { type: 'peer-joined' | 'peer-left' }
  | { type: 'input'; input: InputState }
  | { type: 'state'; state: CoopState }
  | { type: 'result'; result: { victory: boolean } }
  | { type: 'error'; message: string };

export class CoopClient {
  private socket: WebSocket | null = null;
  private listener: ((event: RoomEvent) => void) | null = null;
  private connected = false;
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
      const url = relay || window.location.origin.replace(/^http/, 'ws') + '/multiplayer';
      const socket = new WebSocket(url);
      this.socket = socket;
      const timeout = window.setTimeout(() => {
        if (socket.readyState !== WebSocket.OPEN) { socket.close(); reject(new Error('Serveur multijoueur indisponible.')); }
      }, 9000);
      socket.onopen = () => { window.clearTimeout(timeout); this.connected = true; resolve(); };
      socket.onmessage = (event) => {
        try {
          const packet = JSON.parse(String(event.data)) as RoomEvent;
          if (packet.type === 'created' || packet.type === 'joined') {
            this.code = packet.code; this.level = packet.level;
          }
          if (packet.type === 'started') { this.role = packet.role; this.level = packet.level; }
          if (packet.type === 'peer-left') this.role = null;
          this.listener?.(packet);
        } catch { /* Malformed packets are ignored. */ }
      };
      socket.onerror = () => { if (!this.connected) { window.clearTimeout(timeout); reject(new Error('Connexion au serveur impossible.')); } };
      socket.onclose = () => {
        const wasConnected = this.connected;
        this.connected = false; this.role = null;
        if (wasConnected) this.listener?.({ type: 'peer-left' });
      };
    });
  }
  send(packet: Record<string, unknown>): void {
    if (this.isConnected) this.socket!.send(JSON.stringify(packet));
  }
  create(level: MapId, difficulty: Difficulty): void { this.send({ type: 'create', level, difficulty }); }
  join(code: string): void { this.send({ type: 'join', code: code.trim().toUpperCase() }); }
  start(): void { this.send({ type: 'start' }); }
  sendInput(input: InputState): void { this.send({ type: 'input', input: { ...input } }); }
  sendState(state: CoopState): void { this.send({ type: 'state', state }); }
  sendResult(victory: boolean): void { this.send({ type: 'result', result: { victory } }); }
  disconnect(): void {
    if (this.socket) {
      if (this.socket.readyState === WebSocket.OPEN) this.send({ type: 'leave' });
      this.socket.close();
    }
    this.socket = null; this.connected = false; this.role = null; this.code = ''; this.level = null;
  }
}
