import type { HudState } from '../scenes/GameScene';

const fmtTime = (ms: number): string => {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

/**
 * HUD en DOM : lisible, net sur tous les ecrans, et sans cout de rendu
 * dans la boucle Phaser. Les ecritures sont filtrees pour eviter de
 * toucher le DOM a chaque frame.
 */
export class Hud {
  private readonly root = document.getElementById('hud')!;
  private readonly lives = document.getElementById('hud-lives')!;
  private readonly bombs = document.getElementById('hud-bombs')!;
  private readonly range = document.getElementById('hud-range')!;
  private readonly time = document.getElementById('hud-time')!;
  private readonly objectives = document.getElementById('hud-objectives')!;
  private readonly bossBox = document.getElementById('hud-boss')!;
  private readonly bossName = document.getElementById('hud-boss-name')!;
  private readonly bossFill = document.getElementById('hud-boss-fill')!;
  private readonly bossState = document.getElementById('hud-boss-state')!;
  private readonly toasts = document.getElementById('toasts')!;

  private last = {
    lives: -1,
    maxLives: -1,
    bombs: '',
    range: '',
    time: '',
    objectives: '',
    boss: '',
  };

  setVisible(visible: boolean): void {
    this.root.hidden = !visible;
    if (!visible) this.toasts.replaceChildren();
  }

  render(state: HudState): void {
    if (state.lives !== this.last.lives || state.maxLives !== this.last.maxLives) {
      this.last.lives = state.lives;
      this.last.maxLives = state.maxLives;
      this.lives.replaceChildren();
      for (let i = 0; i < Math.max(3, state.maxLives); i++) {
        const h = document.createElement('span');
        h.className = i < state.lives ? 'heart' : 'heart heart--empty';
        this.lives.appendChild(h);
      }
    }

    const bombsText = `${state.bombsMax - state.bombsActive}/${state.bombsMax}`;
    if (bombsText !== this.last.bombs) {
      this.last.bombs = bombsText;
      this.bombs.textContent = `BOMBES ${bombsText}`;
    }

    const rangeText =
      `PORTEE ${state.range}` +
      (state.pierce > 0 ? ` · PERF ${state.pierce}` : '') +
      (state.shieldMs > 0 ? ` · BOUCLIER ${Math.ceil(state.shieldMs / 1000)}s` : '');
    if (rangeText !== this.last.range) {
      this.last.range = rangeText;
      this.range.textContent = rangeText;
    }

    const t = fmtTime(state.timeMs);
    if (t !== this.last.time) {
      this.last.time = t;
      this.time.textContent = t;
    }

    const objKey = state.objectives.map((o) => `${o.id}${o.current}${o.done}`).join('|');
    if (objKey !== this.last.objectives) {
      this.last.objectives = objKey;
      this.objectives.replaceChildren();
      // Seuls les objectifs obligatoires sont affiches en jeu, et on masque
      // ceux deja valides : le HUD ne doit jamais couvrir l'arene.
      const shown = state.objectives.filter((o) => o.mandatory && !o.done).slice(0, 3);
      for (const o of shown) {
        const div = document.createElement('div');
        div.className = 'hud-obj';
        const progress = o.total > 1 ? ` ${o.current}/${o.total}` : '';
        div.textContent = `${o.label}${progress}`;
        this.objectives.appendChild(div);
      }
      const bonus = state.objectives.filter((o) => !o.mandatory);
      const bonusDone = bonus.filter((o) => o.done).length;
      if (bonus.length > 0) {
        const div = document.createElement('div');
        div.className = 'hud-obj hud-obj--optional';
        div.textContent = `Bonus ${bonusDone}/${bonus.length} (details en pause)`;
        this.objectives.appendChild(div);
      }
    }

    const bossKey = state.boss
      ? `${state.boss.name}${state.boss.hp}${state.boss.phase}${state.boss.vulnerable}`
      : '';
    if (bossKey !== this.last.boss) {
      this.last.boss = bossKey;
      if (state.boss) {
        this.bossBox.hidden = false;
        this.bossName.textContent = `${state.boss.name} — PHASE ${state.boss.phase}`;
        this.bossFill.style.width = `${(state.boss.hp / state.boss.maxHp) * 100}%`;
        this.bossState.textContent = state.boss.vulnerable ? 'VULNERABLE' : 'BLINDE';
        this.bossState.className =
          'hud-boss__state' + (state.boss.vulnerable ? ' hud-boss__state--vuln' : '');
      } else {
        this.bossBox.hidden = true;
      }
    }
  }

  toast(text: string, tone: 'info' | 'good' | 'bad' = 'info'): void {
    const div = document.createElement('div');
    div.className = `toast toast--${tone}`;
    div.textContent = text;
    this.toasts.appendChild(div);
    // Au plus 3 messages simultanes : le HUD ne masque jamais l'arene.
    while (this.toasts.children.length > 3) this.toasts.firstElementChild?.remove();
    setTimeout(() => {
      div.style.transition = 'opacity 260ms ease, transform 260ms ease';
      div.style.opacity = '0';
      div.style.transform = 'translateY(-6px)';
      setTimeout(() => div.remove(), 280);
    }, 2200);
  }
}
