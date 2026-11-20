const KEY = 'bombshift.active-run.v1';
type TabStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/** Only a map ID, scoped to this browser tab; never an account token. */
export class RunRecovery {
  constructor(private readonly storage: TabStorage | null) {}
  get mapId(): string | null {
    try { return this.storage?.getItem(KEY) ?? null; } catch { return null; }
  }
  mark(mapId: string): void {
    try { this.storage?.setItem(KEY, mapId); } catch { /* Manual resume remains available. */ }
  }
  clear(): void {
    try { this.storage?.removeItem(KEY); } catch { /* Storage may be blocked. */ }
  }
}
export function tabStorage(): Storage | null {
  try { return sessionStorage; } catch { return null; }
}
