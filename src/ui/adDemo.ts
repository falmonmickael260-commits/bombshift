const KEY = 'bombshift.ad-demo.v1';
export const AD_DEMO_MS = 30_000;
export interface AdDemoState { enabled: boolean; removed: boolean; nextAd?: number }
export const AD_CREATIVES = [
  { id: 'camouflip', name: 'CAMOUFLIP', tagline: 'Cache-toi. Transforme-toi. Survis !', description: 'Un chasseur. Jusqu’à six fugitifs. Qui se cache dans le décor ?', accent: '#ffbf62' },
  { id: 'la-meute', name: 'LA MEUTE', tagline: 'Un village. Des rôles secrets. Une nuit de trop.', description: 'Débusque les loups et protège ton village. Un jeu de déduction sociale de 6 à 15 joueurs.', accent: '#c5b4ff' },
  { id: 'president', name: 'PRÉSIDENT', tagline: 'Du trône au trou du cul, un seul coup suffit.', description: 'Débarrasse-toi de tes cartes et vise le trône. Défie tes amis de 3 à 6 joueurs.', accent: '#f5cb79' },
  { id: 'kilomax', name: 'KILOMAX', tagline: 'La route est à qui tient la distance.', description: 'Joue tes cartes, déjoue les attaques et fonce vers la victoire. Une course de 2 à 6 joueurs.', accent: '#ffb273' },
] as const;
export type AdCreative = typeof AD_CREATIVES[number];

/** Isolated from real saves, accounts and future paid entitlements. */
export class AdDemoPreferences {
  state: AdDemoState = { enabled: false, removed: false };
  constructor(private readonly storage: Pick<Storage, 'getItem' | 'setItem'> | null) {
    try {
      const raw = JSON.parse(storage?.getItem(KEY) ?? 'null');
      this.state = { enabled: raw?.enabled === true, removed: raw?.removed === true };
      if (Number.isInteger(raw?.nextAd) && raw.nextAd >= 0 && raw.nextAd < AD_CREATIVES.length) this.state.nextAd = raw.nextAd;
    } catch { /* The demo remains opt-in. */ }
  }
  get shouldShow(): boolean { return this.state.enabled && !this.state.removed; }
  set(state: AdDemoState): void {
    this.state = { ...this.state, ...state };
    try { this.storage?.setItem(KEY, JSON.stringify(this.state)); } catch { /* Session-only demo. */ }
  }
  nextCreative(): AdCreative {
    const index = this.state.nextAd ?? 0;
    this.set({ ...this.state, nextAd: (index + 1) % AD_CREATIVES.length });
    return AD_CREATIVES[index];
  }
}

/** Count foreground viewing only, including tab / purchase-dialog transitions. */
export class VisibleAdClock {
  remainingMs = AD_DEMO_MS;
  private last: number | null = null;
  private wasVisible = false;
  sample(now: number, visible: boolean): void {
    if (this.last !== null && visible && this.wasVisible) {
      this.remainingMs = Math.max(0, this.remainingMs - Math.max(0, now - this.last));
    }
    this.last = now;
    this.wasVisible = visible;
  }
  get seconds(): number { return Math.ceil(this.remainingMs / 1000); }
  get done(): boolean { return this.remainingMs === 0; }
}

export function demoStorage(): Storage | null {
  try { return localStorage; } catch { return null; }
}

/** Local poster today; a video can later replace the poster without changing the gate. */
export function renderAdDemo(container: HTMLElement, complete: () => void, simulatePurchase: () => void, creative: AdCreative = AD_CREATIVES[0]): () => void {
  container.innerHTML = `
    <div class="ad-demo__poster" aria-hidden="true"></div>
    <header class="ad-demo__header">
      <span class="ad-demo__badge">PUBLICITÉ · ESSAI</span>
      <button type="button" class="ad-demo__continue" id="ad-continue" disabled>Continuer dans 30 s</button>
    </header>
    <div class="ad-demo__copy">
      <p class="ad-demo__eyebrow">UN AUTRE JEU REVANCHE GAMES</p>
      <h1></h1>
      <p class="ad-demo__tagline"></p>
      <p class="ad-demo__description"></p>
      <button type="button" class="ad-demo__download" id="ad-download">TÉLÉCHARGER <span>Essai sans lien</span></button>
      <p id="ad-demo-message" class="ad-demo__message" role="status"></p>
    </div>
    <footer class="ad-demo__footer">
      <div class="ad-demo__progress" role="progressbar" aria-label="Temps de publicité écoulé" aria-valuemin="0" aria-valuemax="30" aria-valuenow="0"><i></i></div>
      <div class="ad-demo__footer-row"><span>Affiche de démonstration · 30 secondes</span><button type="button" id="ad-no-ads">Sans publicité</button></div>
    </footer>
    <div class="ad-demo__purchase" id="ad-purchase" hidden role="dialog" aria-modal="true" aria-labelledby="ad-purchase-title">
      <div class="ad-demo__purchase-card">
        <span class="ad-demo__badge">DÉMONSTRATION GRATUITE</span>
        <h2 id="ad-purchase-title">Jouer sans publicité</h2>
        <p>Dans la version finale, un achat unique supprimera les publicités.</p>
        <p><strong>Pour cet essai : aucun paiement, aucun débit.</strong> La suppression est simulée uniquement sur cet appareil.</p>
        <button type="button" class="btn btn--primary" id="ad-confirm">SIMULER L’ACHAT GRATUITEMENT</button>
        <button type="button" class="btn btn--ghost" id="ad-cancel">REVENIR À LA PUBLICITÉ</button>
      </div>
    </div>`;
  const get = <T extends HTMLElement>(id: string): T => container.querySelector<T>(`#${id}`)!;
  container.setAttribute('aria-label', `Publicité de démonstration pour ${creative.name}`);
  container.dataset.adGame = creative.id;
  const title = container.querySelector<HTMLElement>('h1')!;
  title.textContent = creative.name;
  title.style.color = creative.accent;
  container.querySelector<HTMLElement>('.ad-demo__tagline')!.textContent = creative.tagline;
  container.querySelector<HTMLElement>('.ad-demo__description')!.textContent = creative.description;
  container.querySelector<HTMLElement>('.ad-demo__poster')!.style.backgroundImage = `url("${import.meta.env.BASE_URL}ads/${creative.id}.webp")`;
  const next = get<HTMLButtonElement>('ad-continue');
  const purchase = get('ad-purchase');
  const noAds = get<HTMLButtonElement>('ad-no-ads');
  const clock = new VisibleAdClock();
  let closed = false;
  const paint = (): void => {
    clock.sample(performance.now(), !document.hidden && purchase.hidden);
    next.disabled = !clock.done;
    next.textContent = clock.done ? 'CONTINUER ✕' : `Continuer dans ${clock.seconds} s`;
    const elapsed = (AD_DEMO_MS - clock.remainingMs) / 1000;
    const progress = container.querySelector<HTMLElement>('[role=progressbar]')!;
    progress.setAttribute('aria-valuenow', String(Math.floor(elapsed)));
    progress.querySelector<HTMLElement>('i')!.style.transform = `scaleX(${elapsed / 30})`;
  };
  const timer = window.setInterval(paint, 100);
  const dispose = (): void => {
    if (closed) return;
    closed = true; window.clearInterval(timer);
    document.removeEventListener('visibilitychange', paint);
    container.removeEventListener('keydown', keys);
  };
  const closePurchase = (): void => { purchase.hidden = true; paint(); noAds.focus(); };
  const keys = (ev: KeyboardEvent): void => {
    if (ev.key === 'Escape' && !purchase.hidden) { ev.preventDefault(); closePurchase(); }
    if (ev.key !== 'Tab') return;
    const scope = purchase.hidden ? container : purchase;
    const buttons = [...scope.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')].filter((b) => b.getClientRects().length);
    const first = buttons[0], last = buttons[buttons.length - 1];
    if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last?.focus(); }
    else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first?.focus(); }
  };
  next.onclick = () => { if (!clock.done || closed) return; dispose(); complete(); };
  noAds.onclick = () => { purchase.hidden = false; paint(); get('ad-confirm').focus(); };
  get('ad-cancel').onclick = closePurchase;
  get('ad-confirm').onclick = () => { if (closed) return; dispose(); simulatePurchase(); };
  get('ad-download').onclick = () => { get('ad-demo-message').textContent = 'Essai : aucun lien de téléchargement pour le moment.'; };
  document.addEventListener('visibilitychange', paint);
  container.addEventListener('keydown', keys);
  paint(); noAds.focus();
  return dispose;
}
