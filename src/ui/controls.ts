import type { Settings } from '../core/save';
import type { InputState } from '../core/types';

const DEAD_ZONE = 0.16;

/**
 * Commandes tactiles.
 *
 * Choix d'ergonomie :
 * - le joystick est "flottant" : il se place sous le pouce au moment du contact,
 *   ce qui evite de devoir viser un cercle fixe ;
 * - la zone du joystick couvre la moitie basse d'un cote de l'ecran, mais les
 *   boutons gardent la priorite (ils interceptent leurs propres pointeurs) ;
 * - chaque bouton est a usage unique par appui (anti double-action), le jeu
 *   consomme le drapeau a la frame suivante ;
 * - le clavier reste gere pour tester sur ordinateur.
 */
export class TouchControls {
  readonly input: InputState = {
    moveX: 0,
    moveY: 0,
    magnitude: 0,
    bombPressed: false,
    abilityPressed: false,
    ability2Pressed: false,
  };

  private readonly root: HTMLElement;
  private readonly stick: HTMLElement;
  private readonly thumb: HTMLElement;
  private readonly bombBtn: HTMLButtonElement;
  private readonly abilityBtn: HTMLButtonElement;
  private readonly ability2Btn: HTMLButtonElement;
  private readonly cd1: HTMLElement;
  private readonly cd2: HTMLElement;

  private stickPointer: number | null = null;
  private origin = { x: 0, y: 0 };
  private radius = 58;
  private side: 'left' | 'right' = 'left';
  private enabled = false;
  private readonly keys = new Set<string>();
  private onPause: (() => void) | null = null;
  private haptics = true;

  constructor() {
    this.root = must('controls');
    this.stick = must('stick');
    this.thumb = must('stick-thumb');
    this.bombBtn = must('btn-bomb') as HTMLButtonElement;
    this.abilityBtn = must('btn-ability') as HTMLButtonElement;
    this.ability2Btn = must('btn-ability2') as HTMLButtonElement;
    this.cd1 = must('cd-ability');
    this.cd2 = must('cd-ability2');

    this.bindButton(this.bombBtn, () => {
      this.input.bombPressed = true;
    });
    this.bindButton(this.abilityBtn, () => {
      this.input.abilityPressed = true;
    });
    this.bindButton(this.ability2Btn, () => {
      this.input.ability2Pressed = true;
    });

    window.addEventListener('pointerdown', this.onPointerDown, { passive: false });
    window.addEventListener('pointermove', this.onPointerMove, { passive: false });
    window.addEventListener('pointerup', this.onPointerUp, { passive: true });
    window.addEventListener('pointercancel', this.onPointerUp, { passive: true });
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', () => this.reset());
  }

  setPauseHandler(fn: () => void): void {
    this.onPause = fn;
  }

  private bindButton(btn: HTMLElement, action: () => void): void {
    // pointerdown : reaction immediate, sans attendre le "click" (~300ms sur mobile).
    btn.addEventListener(
      'pointerdown',
      (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        if (!this.enabled) return;
        action();
        btn.setAttribute('data-pressed', '1');
        if (this.haptics && navigator.vibrate) {
          try {
            navigator.vibrate(8);
          } catch {
            /* vibration non supportee */
          }
        }
      },
      { passive: false },
    );
    const release = (ev: Event): void => {
      ev.stopPropagation();
      btn.removeAttribute('data-pressed');
    };
    btn.addEventListener('pointerup', release);
    btn.addEventListener('pointercancel', release);
    btn.addEventListener('pointerleave', release);
    btn.addEventListener('contextmenu', (ev) => ev.preventDefault());
  }

  applySettings(settings: Settings): void {
    this.haptics = settings.haptics;
    this.side = settings.joystickSide;
    this.root.classList.toggle('controls--right', this.side === 'right');
    this.root.style.setProperty('--stick-scale', String(settings.joystickSize));
    this.radius = 58 * settings.joystickSize;
  }

  setVisible(visible: boolean): void {
    this.enabled = visible;
    this.root.hidden = !visible;
    if (!visible) this.reset();
  }

  setAbilities(shift: boolean, slow: boolean): void {
    this.abilityBtn.hidden = !shift;
    this.ability2Btn.hidden = !slow;
  }

  /** ratio 0 = pret, 1 = recharge complete. */
  setCooldowns(r1: number, r2: number): void {
    this.cd1.style.transform = `scaleY(${r1})`;
    this.cd2.style.transform = `scaleY(${r2})`;
    this.abilityBtn.dataset.ready = r1 <= 0 ? '1' : '0';
    this.ability2Btn.dataset.ready = r2 <= 0 ? '1' : '0';
  }

  /* ------------------------------------------------------- joystick ---- */

  private inStickZone(x: number, y: number): boolean {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (y < h * 0.38) return false;
    return this.side === 'left' ? x < w * 0.5 : x > w * 0.5;
  }

  private onPointerDown = (ev: PointerEvent): void => {
    if (!this.enabled || this.stickPointer !== null) return;
    if (!this.inStickZone(ev.clientX, ev.clientY)) return;
    ev.preventDefault();
    this.stickPointer = ev.pointerId;
    this.origin = { x: ev.clientX, y: ev.clientY };
    // Le joystick se materialise sous le pouce.
    this.stick.style.left = `${ev.clientX - this.radius}px`;
    this.stick.style.bottom = 'auto';
    this.stick.style.top = `${ev.clientY - this.radius}px`;
    this.stick.style.right = 'auto';
    this.stick.style.width = `${this.radius * 2}px`;
    this.stick.style.height = `${this.radius * 2}px`;
    this.stick.classList.add('stick--active');
    this.updateVector(0, 0);
  };

  private onPointerMove = (ev: PointerEvent): void => {
    if (this.stickPointer !== ev.pointerId) return;
    ev.preventDefault();
    this.updateVector(ev.clientX - this.origin.x, ev.clientY - this.origin.y);
  };

  private onPointerUp = (ev: PointerEvent): void => {
    if (this.stickPointer !== ev.pointerId) return;
    this.stickPointer = null;
    this.stick.classList.remove('stick--active');
    this.stick.style.left = '';
    this.stick.style.top = '';
    this.stick.style.bottom = '';
    this.stick.style.right = '';
    this.stick.style.width = '';
    this.stick.style.height = '';
    this.thumb.style.transform = '';
    this.input.moveX = 0;
    this.input.moveY = 0;
    this.input.magnitude = 0;
  };

  private updateVector(dx: number, dy: number): void {
    const dist = Math.hypot(dx, dy);
    const clamped = Math.min(dist, this.radius);
    const nx = dist > 0 ? (dx / dist) * clamped : 0;
    const ny = dist > 0 ? (dy / dist) * clamped : 0;
    this.thumb.style.transform = `translate(${nx}px, ${ny}px)`;

    const mag = clamped / this.radius;
    if (mag < DEAD_ZONE) {
      this.input.moveX = 0;
      this.input.moveY = 0;
      this.input.magnitude = 0;
      return;
    }
    // Au-dela de la zone morte on renormalise pour garder toute la plage utile.
    const scaled = (mag - DEAD_ZONE) / (1 - DEAD_ZONE);
    const len = Math.hypot(nx, ny) || 1;
    this.input.moveX = (nx / len) * scaled;
    this.input.moveY = (ny / len) * scaled;
    this.input.magnitude = scaled;
  }

  /* --------------------------------------------------------- clavier ---- */

  private onKeyDown = (ev: KeyboardEvent): void => {
    if (!this.enabled) return;
    const k = ev.key.toLowerCase();
    if (k === 'escape' || k === 'p') {
      this.onPause?.();
      return;
    }
    if (this.keys.has(k)) return;
    this.keys.add(k);
    if (k === ' ' || k === 'enter') {
      this.input.bombPressed = true;
      ev.preventDefault();
    }
    if (k === 'e') this.input.abilityPressed = true;
    if (k === 'f') this.input.ability2Pressed = true;
    this.applyKeyVector();
  };

  private onKeyUp = (ev: KeyboardEvent): void => {
    this.keys.delete(ev.key.toLowerCase());
    this.applyKeyVector();
  };

  private applyKeyVector(): void {
    if (this.stickPointer !== null) return;
    let x = 0;
    let y = 0;
    if (this.keys.has('arrowleft') || this.keys.has('a') || this.keys.has('q')) x -= 1;
    if (this.keys.has('arrowright') || this.keys.has('d')) x += 1;
    if (this.keys.has('arrowup') || this.keys.has('w') || this.keys.has('z')) y -= 1;
    if (this.keys.has('arrowdown') || this.keys.has('s')) y += 1;
    const len = Math.hypot(x, y);
    this.input.moveX = len > 0 ? x / len : 0;
    this.input.moveY = len > 0 ? y / len : 0;
    this.input.magnitude = len > 0 ? 1 : 0;
  }

  reset(): void {
    this.stickPointer = null;
    this.keys.clear();
    this.input.moveX = 0;
    this.input.moveY = 0;
    this.input.magnitude = 0;
    this.input.bombPressed = false;
    this.input.abilityPressed = false;
    this.input.ability2Pressed = false;
    this.thumb.style.transform = '';
    this.stick.classList.remove('stick--active');
  }
}

function must(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`element #${id} manquant`);
  return el;
}
