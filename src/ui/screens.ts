import type { SaveData, SaveManager, Settings } from '../core/save';
import { DIFFICULTIES } from '../core/constants';
import type { Difficulty, ObjectiveState, Rank } from '../core/types';
import type { RunResult } from '../scenes/GameScene';
import { MAPS, type MapDefinition } from '../maps';

const fmtTime = (ms: number | null): string => {
  if (ms === null) return '—';
  const total = Math.floor(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

const DIFFICULTY_LABELS: Record<MapDefinition['difficulty'], string> = {
  facile: 'Facile',
  normal: 'Normal',
  difficile: 'Difficile',
};

/* ----------------------------------------------------- selection carte -- */

export function renderMapList(
  container: HTMLElement,
  save: SaveData,
  onPick: (def: MapDefinition, locked: boolean) => void,
): void {
  container.replaceChildren();
  MAPS.forEach((def, i) => {
    const locked = i >= save.unlockedMaps;
    const progress = save.maps[def.id];
    const card = el(
      'button',
      `map-card map-card--${def.id} map-card--theme-${def.theme}${locked ? ' map-card--locked' : ''}`,
    );
    card.type = 'button';

    card.appendChild(el('span', 'map-card__index', String(i + 1)));
    card.appendChild(el('h3', 'map-card__name', def.name.toUpperCase()));
    card.appendChild(el('p', 'map-card__tag', def.tagline));

    const meta = el('div', 'map-card__meta');
    if (locked) {
      const prev = MAPS[i - 1];
      meta.appendChild(
        el('span', 'tag tag--locked', `Terminez "${prev?.name ?? '???'}" pour debloquer`),
      );
    } else {
      meta.appendChild(el('span', `tag tag--difficulty tag--difficulty-${def.difficulty}`, DIFFICULTY_LABELS[def.difficulty]));
      meta.appendChild(el('span', 'tag', `Boss : ${def.bossName}`));
      meta.appendChild(el('span', 'tag', `Objectifs : ${def.objectives.filter((o) => o.mandatory).length}`));
      if (progress?.bestRank) meta.appendChild(el('span', 'tag tag--rank', `RANG ${progress.bestRank}`));
      if (progress?.bestScore) meta.appendChild(el('span', 'tag', `Record ${progress.bestScore}`));
      if (progress?.bestTimeMs) meta.appendChild(el('span', 'tag', `Temps ${fmtTime(progress.bestTimeMs)}`));
      if (progress?.cleared) meta.appendChild(el('span', 'tag', '✔ Terminee'));
    }
    card.appendChild(meta);

    card.addEventListener('click', () => onPick(def, locked));
    container.appendChild(card);
  });
}

/** Selecteur de difficulte, utilise dans le briefing et dans les parametres. */
export function buildDifficultyPicker(
  current: Difficulty,
  onPick: (d: Difficulty) => void,
): HTMLElement {
  const wrap = el('div', 'setting');
  const head = el('div', 'setting__label');
  head.appendChild(el('span', undefined, 'Difficulte'));
  const value = el('span', 'setting__value', DIFFICULTIES[current].label);
  head.appendChild(value);
  wrap.appendChild(head);

  const seg = el('div', 'segmented');
  const desc = el('p', 'difficulty-desc', DIFFICULTIES[current].description);
  for (const d of Object.values(DIFFICULTIES)) {
    const b = el('button', undefined, d.label);
    b.type = 'button';
    b.setAttribute('aria-pressed', String(d.id === current));
    b.addEventListener('click', () => {
      onPick(d.id);
      value.textContent = d.label;
      desc.textContent = d.description;
      for (const child of Array.from(seg.children)) {
        child.setAttribute('aria-pressed', String(child === b));
      }
    });
    seg.appendChild(b);
  }
  wrap.appendChild(seg);
  wrap.appendChild(desc);
  return wrap;
}

/* ------------------------------------------------------------ briefing -- */

export function renderBriefing(
  container: HTMLElement,
  def: MapDefinition,
  save: SaveData,
  onDifficulty: (d: Difficulty) => void,
): void {
  container.replaceChildren();
  const progress = save.maps[def.id];

  // Le choix de difficulte se fait juste avant de lancer la tentative.
  container.appendChild(buildDifficultyPicker(save.settings.difficulty, onDifficulty));

  const intro = el('div', 'brief-section');
  intro.appendChild(el('h3', undefined, 'Mecaniques de la carte'));
  const list = el('ul', 'brief-list');
  for (const line of def.intro) list.appendChild(el('li', undefined, line));
  intro.appendChild(list);
  container.appendChild(intro);

  const obj = el('div', 'brief-section');
  obj.appendChild(el('h3', undefined, 'Objectifs'));
  for (const o of def.objectives) {
    const line = el('div', `obj-line${o.mandatory ? '' : ' obj-line--optional'}`);
    line.appendChild(el('span', 'obj-line__dot'));
    const text = el('span', undefined, o.label + (o.total > 1 ? ` (${o.total})` : ''));
    line.appendChild(text);
    if (!o.mandatory) line.appendChild(el('span', 'obj-line__opt', 'BONUS'));
    obj.appendChild(line);
  }
  container.appendChild(obj);

  const info = el('div', 'brief-section');
  info.appendChild(el('h3', undefined, 'Informations'));
  const grid = el('div', 'stat-grid');
  const box = (value: string, label: string): HTMLElement => {
    const b = el('div', 'stat-box');
    b.appendChild(el('div', 'stat-box__value', value));
    b.appendChild(el('div', 'stat-box__label', label));
    return b;
  };
  grid.appendChild(box(`${def.bossHp}`, 'Explosions pour le boss'));
  grid.appendChild(box(fmtTime(def.parTimeMs), 'Temps de reference'));
  grid.appendChild(
    box(String(DIFFICULTIES[save.settings.difficulty].lives), 'Vies par tentative'),
  );
  grid.appendChild(box(progress?.bestRank ?? '—', 'Meilleur rang'));
  info.appendChild(grid);
  container.appendChild(info);

  const ranks = el('div', 'brief-section');
  ranks.appendChild(el('h3', undefined, 'Seuils de rang'));
  const table = el('table', 'score-table');
  (['C', 'B', 'A', 'S', 'SS', 'SSS'] as Rank[]).forEach((r) => {
    const tr = el('tr');
    tr.appendChild(el('td', undefined, `Rang ${r}`));
    tr.appendChild(el('td', undefined, String(def.rankScores[r])));
    table.appendChild(tr);
  });
  ranks.appendChild(table);
  container.appendChild(ranks);
}

/* ---------------------------------------------------------- parametres -- */

export function renderSettings(
  container: HTMLElement,
  manager: SaveManager,
  onChange: (settings: Settings) => void,
  onReset: () => void,
): void {
  container.replaceChildren();
  const s = manager.get().settings;

  const slider = (
    label: string,
    value: number,
    apply: (v: number) => void,
    min = 0,
    max = 1,
    step = 0.05,
    fmt: (v: number) => string = (v) => `${Math.round(v * 100)}%`,
  ): void => {
    const wrap = el('div', 'setting');
    const head = el('div', 'setting__label');
    head.appendChild(el('span', undefined, label));
    const val = el('span', 'setting__value', fmt(value));
    head.appendChild(val);
    wrap.appendChild(head);
    const input = el('input');
    input.type = 'range';
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(value);
    input.addEventListener('input', () => {
      const v = Number(input.value);
      val.textContent = fmt(v);
      apply(v);
      onChange(manager.get().settings);
    });
    wrap.appendChild(input);
    container.appendChild(wrap);
  };

  const segmented = (
    label: string,
    options: { value: string; text: string }[],
    current: string,
    apply: (v: string) => void,
  ): void => {
    const wrap = el('div', 'setting');
    const head = el('div', 'setting__label');
    head.appendChild(el('span', undefined, label));
    wrap.appendChild(head);
    const seg = el('div', 'segmented');
    for (const opt of options) {
      const b = el('button', undefined, opt.text);
      b.type = 'button';
      b.setAttribute('aria-pressed', String(opt.value === current));
      b.addEventListener('click', () => {
        apply(opt.value);
        onChange(manager.get().settings);
        for (const child of Array.from(seg.children)) {
          child.setAttribute('aria-pressed', String(child === b));
        }
      });
      seg.appendChild(b);
    }
    wrap.appendChild(seg);
    container.appendChild(wrap);
  };

  const toggle = (label: string, value: boolean, apply: (v: boolean) => void): void => {
    const row = el('div', 'switch-row');
    row.appendChild(el('span', undefined, label));
    const sw = el('div', 'switch');
    sw.setAttribute('role', 'switch');
    sw.setAttribute('aria-checked', String(value));
    sw.addEventListener('click', () => {
      const next = sw.getAttribute('aria-checked') !== 'true';
      sw.setAttribute('aria-checked', String(next));
      apply(next);
      onChange(manager.get().settings);
    });
    row.appendChild(sw);
    container.appendChild(row);
  };

  container.appendChild(
    buildDifficultyPicker(s.difficulty, (d) =>
      manager.update((data) => {
        data.settings.difficulty = d;
      }),
    ),
  );

  slider('Volume des effets', s.sfxVolume, (v) =>
    manager.update((d) => {
      d.settings.sfxVolume = v;
    }),
  );
  slider('Volume de la musique', s.musicVolume, (v) =>
    manager.update((d) => {
      d.settings.musicVolume = v;
    }),
  );
  segmented(
    'Niveau d\'effets visuels',
    [
      { value: 'low', text: 'Econome' },
      { value: 'medium', text: 'Moyen' },
      { value: 'high', text: 'Maximum' },
    ],
    s.effects,
    (v) =>
      manager.update((d) => {
        d.settings.effects = v as Settings['effects'];
      }),
  );
  segmented(
    'Cote du joystick',
    [
      { value: 'left', text: 'Gauche' },
      { value: 'right', text: 'Droite' },
    ],
    s.joystickSide,
    (v) =>
      manager.update((d) => {
        d.settings.joystickSide = v as Settings['joystickSide'];
      }),
  );
  slider(
    'Taille des commandes',
    s.joystickSize,
    (v) =>
      manager.update((d) => {
        d.settings.joystickSize = v;
      }),
    0.7,
    1.4,
    0.05,
    (v) => `${Math.round(v * 100)}%`,
  );
  toggle('Secousses de camera', s.screenShake, (v) =>
    manager.update((d) => {
      d.settings.screenShake = v;
    }),
  );
  toggle('Reduire les flashs', s.reduceFlashes, (v) =>
    manager.update((d) => {
      d.settings.reduceFlashes = v;
    }),
  );
  toggle('Indices de danger', s.showDangerHints, (v) =>
    manager.update((d) => {
      d.settings.showDangerHints = v;
    }),
  );
  toggle('Vibrations', s.haptics, (v) =>
    manager.update((d) => {
      d.settings.haptics = v;
    }),
  );

  const danger = el('div', 'setting');
  const resetBtn = el('button', 'btn btn--danger', 'EFFACER LA PROGRESSION');
  resetBtn.type = 'button';
  let armed = false;
  resetBtn.addEventListener('click', () => {
    if (!armed) {
      armed = true;
      resetBtn.textContent = 'CONFIRMER L\'EFFACEMENT';
      setTimeout(() => {
        armed = false;
        resetBtn.textContent = 'EFFACER LA PROGRESSION';
      }, 4000);
      return;
    }
    onReset();
  });
  danger.appendChild(resetBtn);
  container.appendChild(danger);
}

/* --------------------------------------------------------- progression -- */

export function renderProgress(container: HTMLElement, save: SaveData): void {
  container.replaceChildren();

  const global = el('div', 'brief-section');
  global.appendChild(el('h3', undefined, 'Statistiques globales'));
  const grid = el('div', 'stat-grid');
  const box = (value: string, label: string): HTMLElement => {
    const b = el('div', 'stat-box');
    b.appendChild(el('div', 'stat-box__value', value));
    b.appendChild(el('div', 'stat-box__label', label));
    return b;
  };
  grid.appendChild(box(String(save.stats.runs), 'Tentatives'));
  grid.appendChild(box(String(save.stats.totalKills), 'Ennemis elimines'));
  grid.appendChild(box(String(save.stats.totalBombs), 'Bombes posees'));
  grid.appendChild(box(String(save.stats.totalBlocks), 'Blocs detruits'));
  grid.appendChild(box(String(save.stats.totalPowerups), 'Bonus ramasses'));
  grid.appendChild(box(String(save.stats.totalDeaths), 'Defaites'));
  global.appendChild(grid);
  container.appendChild(global);

  for (const def of MAPS) {
    const p = save.maps[def.id];
    const section = el('div', 'brief-section');
    section.appendChild(el('h3', undefined, def.name));
    const table = el('table', 'score-table');
    const row = (k: string, v: string): void => {
      const tr = el('tr');
      tr.appendChild(el('td', undefined, k));
      tr.appendChild(el('td', undefined, v));
      table.appendChild(tr);
    };
    row('Etat', p?.cleared ? 'Terminee' : def.index < save.unlockedMaps ? 'Debloquee' : 'Verrouillee');
    row('Meilleur score', String(p?.bestScore ?? 0));
    row('Meilleur rang', p?.bestRank ?? '—');
    row('Meilleur temps', fmtTime(p?.bestTimeMs ?? null));
    row('Tentatives', String(p?.attempts ?? 0));
    row('Victoires', String(p?.wins ?? 0));
    row('Secrets', `${p?.secrets.length ?? 0}/${def.secretCount}`);
    section.appendChild(table);
    container.appendChild(section);
  }

  const ab = el('div', 'brief-section');
  ab.appendChild(el('h3', undefined, 'Capacites debloquees'));
  const list = el('ul', 'brief-list');
  list.appendChild(
    el(
      'li',
      undefined,
      `Bombe SHIFT (glisse jusqu'a l'obstacle) : ${save.abilities.shift ? 'DEBLOQUEE' : 'verrouillee - battre la carte 1'}`,
    ),
  );
  list.appendChild(
    el(
      'li',
      undefined,
      `Charge lente (longue meche, grande portee) : ${save.abilities.slow ? 'DEBLOQUEE' : 'verrouillee - battre la carte 2'}`,
    ),
  );
  ab.appendChild(list);
  container.appendChild(ab);
}

/* ---------------------------------------------------------------- aide -- */

export function renderHowTo(container: HTMLElement): void {
  container.replaceChildren();
  const section = (title: string, lines: string[]): void => {
    const s = el('div', 'brief-section');
    s.appendChild(el('h3', undefined, title));
    const ul = el('ul', 'brief-list');
    for (const l of lines) ul.appendChild(el('li', undefined, l));
    s.appendChild(ul);
    container.appendChild(s);
  };

  section('Commandes', [
    'Joystick : posez le pouce n\'importe ou dans la moitie basse de votre cote d\'ecran.',
    'Bouton rouge : poser une bombe.',
    'Boutons bleus : capacites speciales, une fois debloquees (SHIFT puis CHARGE LENTE).',
    'Clavier (ordinateur) : fleches/ZQSD, Espace = bombe, E et F = capacites, Echap = pause.',
  ]);
  section('Regles', [
    'Les explosions se propagent en croix et s\'arretent sur les murs.',
    'Un bloc destructible stoppe le souffle mais peut liberer un bonus.',
    'Une bombe prise dans une explosion detone en chaine.',
    'Vous etes vulnerable a vos propres bombes. Trois vies par tentative.',
    'Apres un degat, vous etes brievement invulnerable et perdez 1 de portee.',
  ]);
  section('Bonus', [
    'PORTEE +1 : souffle plus long (max 7).',
    'BOMBE +1 : une bombe simultanee de plus (max 6).',
    'VITESSE +1 : deplacement plus rapide.',
    'BOUCLIER : protection temporaire de 7 secondes.',
    'PERFORANTE : les 3 prochaines bombes traversent un bloc.',
    'VIE +1 : rare.',
  ]);
  section('Rangs', [
    'Le rang depend des objectifs, des secrets, du temps, des degats evites et des vies restantes.',
    'Detruire des blocs rapporte peu : la maitrise compte davantage.',
    'Rang maximum : SSS.',
  ]);
}

/* ------------------------------------------------------------ resultat -- */

export function renderResult(
  container: HTMLElement,
  result: RunResult,
  def: MapDefinition,
  extra: { newRecord: boolean; unlockedMap: string | null; unlockedAbility: string | null },
  onAction: (action: 'retry' | 'maps' | 'title') => void,
): void {
  container.replaceChildren();

  container.appendChild(
    el(
      'h2',
      `result__title result__title--${result.victory ? 'win' : 'lose'}`,
      result.victory ? 'VICTOIRE' : 'DEFAITE',
    ),
  );
  container.appendChild(el('p', 'map-card__tag', `${def.name} — ${def.bossName}`));

  if (result.victory) {
    container.appendChild(el('div', 'rank-badge', result.rank));
  }

  const table = el('table', 'score-table');
  const row = (k: string, v: string, cls?: string): void => {
    const tr = el('tr', cls);
    tr.appendChild(el('td', undefined, k));
    tr.appendChild(el('td', undefined, v));
    table.appendChild(tr);
  };
  row('Ennemis elimines', `${result.stats.kills} (+${result.score.kills})`);
  row('Boss vaincu', `${result.stats.bossKills > 0 ? 'oui' : 'non'} (+${result.score.boss})`);
  row('Objectifs remplis', `${result.stats.objectivesDone} (+${result.score.objectives})`);
  row('Secrets', `${result.stats.secretsFound} (+${result.score.secrets})`);
  row('Bonus de temps', `+${result.score.time}`);
  row('Sans degat', `+${result.score.noDamage}`);
  row('Vies restantes', `${result.stats.livesLeft} (+${result.score.lives})`);
  row('TOTAL', String(result.score.total), 'total');
  container.appendChild(table);

  const grid = el('div', 'stat-grid');
  const box = (value: string, label: string): HTMLElement => {
    const b = el('div', 'stat-box');
    b.appendChild(el('div', 'stat-box__value', value));
    b.appendChild(el('div', 'stat-box__label', label));
    return b;
  };
  grid.appendChild(box(fmtTime(result.stats.timeMs), 'Temps'));
  grid.appendChild(box(String(result.stats.blocksDestroyed), 'Blocs detruits'));
  grid.appendChild(box(String(result.stats.bombsPlaced), 'Bombes posees'));
  grid.appendChild(box(String(result.stats.damageTaken), 'Degats subis'));
  container.appendChild(grid);

  const objSection = el('div', 'brief-section');
  objSection.appendChild(el('h3', undefined, 'Objectifs'));
  for (const o of result.objectives) {
    const line = el('div', `obj-line${o.mandatory ? '' : ' obj-line--optional'}`);
    line.appendChild(el('span', 'obj-line__dot'));
    line.appendChild(
      el('span', undefined, `${o.done ? '✔' : '✘'} ${o.label}${o.total > 1 ? ` ${o.current}/${o.total}` : ''}`),
    );
    objSection.appendChild(line);
  }
  container.appendChild(objSection);

  if (extra.newRecord) container.appendChild(el('div', 'unlock-note', 'Nouveau record personnel !'));
  if (extra.unlockedMap) {
    container.appendChild(el('div', 'unlock-note', `Nouvelle carte debloquee : ${extra.unlockedMap}`));
  }
  if (extra.unlockedAbility) {
    container.appendChild(
      el('div', 'unlock-note', `Nouvelle capacite debloquee : ${extra.unlockedAbility}`),
    );
  }

  const actions = el('div', 'actions actions--column');
  const retry = el('button', 'btn btn--primary', result.victory ? 'REJOUER LA CARTE' : 'RECOMMENCER');
  retry.type = 'button';
  retry.addEventListener('click', () => onAction('retry'));
  const maps = el('button', 'btn', 'CHOISIR UNE CARTE');
  maps.type = 'button';
  maps.addEventListener('click', () => onAction('maps'));
  const title = el('button', 'btn btn--ghost', 'MENU PRINCIPAL');
  title.type = 'button';
  title.addEventListener('click', () => onAction('title'));
  actions.append(retry, maps, title);
  container.appendChild(actions);
}

/* ------------------------------------------------------ objectifs pause - */

export function renderPauseObjectives(container: HTMLElement, objectives: ObjectiveState[]): void {
  container.replaceChildren();
  for (const o of objectives) {
    const line = el('div', `obj-line${o.mandatory ? '' : ' obj-line--optional'}`);
    line.appendChild(el('span', 'obj-line__dot'));
    line.appendChild(
      el('span', undefined, `${o.done ? '✔' : '•'} ${o.label}${o.total > 1 ? ` ${o.current}/${o.total}` : ''}`),
    );
    container.appendChild(line);
  }
}
