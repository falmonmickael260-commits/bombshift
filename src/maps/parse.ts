import { GridMap, makeTile } from '../core/grid';
import { Rng } from '../core/rng';
import { TileKind, type EnemyKind, type Vec2 } from '../core/types';
import type { MapDefinition, ParsedMap } from './mapTypes';

const ENEMY_CHARS: Record<string, EnemyKind> = {
  p: 'patroller',
  c: 'chaser',
  f: 'flanker',
  w: 'coward',
  h: 'heavy',
  g: 'guardian',
};

export class MapParseError extends Error {}

/**
 * Transforme la carte ASCII en grille jouable.
 * Toute incoherence leve une erreur explicite : les tests de cartes
 * echouent donc avant que le joueur ne rencontre le probleme.
 */
export function parseMap(def: MapDefinition): ParsedMap {
  const rows = def.rows;
  if (rows.length < 5) throw new MapParseError(`${def.id}: carte trop petite`);
  const width = rows[0].length;
  rows.forEach((r, y) => {
    if (r.length !== width) {
      throw new MapParseError(
        `${def.id}: ligne ${y} fait ${r.length} caracteres au lieu de ${width}`,
      );
    }
  });
  const height = rows.length;
  const grid = new GridMap(width, height, TileKind.Floor);
  const rng = new Rng(0xb0b5 + def.index * 7919);

  let playerSpawn: Vec2 | null = null;
  let bossSpawn: Vec2 | null = null;
  let exit: Vec2 | null = null;
  const parsed: ParsedMap = {
    def,
    grid,
    width,
    height,
    playerSpawn: { x: 1, y: 1 },
    bossSpawn: { x: 1, y: 1 },
    exit: { x: 1, y: 1 },
    enemies: [],
    props: [],
    bonusBlocks: [],
    secrets: [],
    plates: [],
    mechanisms: [],
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const ch = rows[y][x];
      const i = grid.idx(x, y);
      const variant = rng.int(0, 3);

      switch (ch) {
        case '#':
          grid.tiles[i] = makeTile(TileKind.Wall, variant);
          break;
        case '.':
          grid.tiles[i] = makeTile(TileKind.Floor, variant);
          break;
        case '~':
          grid.tiles[i] = makeTile(TileKind.Ice, variant);
          break;
        case 'b':
          grid.tiles[i] = makeTile(TileKind.Block, rng.int(0, 1));
          break;
        case '+':
          grid.tiles[i] = makeTile(TileKind.Block, rng.int(0, 1));
          parsed.bonusBlocks.push({ x, y });
          break;
        case '*':
          grid.tiles[i] = makeTile(TileKind.Secret, variant);
          parsed.secrets.push({ x, y });
          break;
        case 'C':
          grid.tiles[i] = makeTile(TileKind.Crystal, variant);
          break;
        case 'L':
          grid.tiles[i] = makeTile(TileKind.Lava, variant);
          break;
        case 'V':
          grid.tiles[i] = makeTile(TileKind.Vent, variant, 1 + ((x + y) % 2));
          break;
        case 'X':
          grid.tiles[i] = makeTile(TileKind.Toxic, variant, 1 + ((x + y) % 3));
          break;
        case 'D':
          grid.tiles[i] = makeTile(TileKind.Door, variant, 1);
          break;
        case 'd':
          grid.tiles[i] = makeTile(TileKind.Door, variant, 2);
          break;
        case '=':
          grid.tiles[i] = makeTile(TileKind.Gate, variant, 1);
          break;
        case '-':
          grid.tiles[i] = makeTile(TileKind.Gate, variant, 2);
          break;
        case 'P':
          // Dalle piegee.
          grid.tiles[i] = makeTile(TileKind.Plate, 0, 1);
          parsed.plates.push({ x, y });
          break;
        case 'Q':
          // Dalle-mecanisme : ouvre la grille de groupe 2 quand toutes sont enclenchees.
          grid.tiles[i] = makeTile(TileKind.Plate, 1, 2);
          parsed.mechanisms.push({ x, y });
          break;
        case 'E':
          grid.tiles[i] = makeTile(TileKind.Exit, 0);
          exit = { x, y };
          break;
        case '@':
          grid.tiles[i] = makeTile(TileKind.Floor, variant);
          playerSpawn = { x, y };
          break;
        case '!':
          grid.tiles[i] = makeTile(TileKind.Floor, variant);
          bossSpawn = { x, y };
          break;
        case '1':
        case '2':
        case '3':
        case '4':
          grid.tiles[i] = makeTile(TileKind.Floor, variant);
          parsed.props.push({
            index: Number(ch),
            cell: { x, y },
            kind: def.propKind,
          });
          break;
        default: {
          const enemy = ENEMY_CHARS[ch];
          if (!enemy) {
            throw new MapParseError(`${def.id}: caractere inconnu "${ch}" en (${x},${y})`);
          }
          grid.tiles[i] = makeTile(TileKind.Floor, variant);
          parsed.enemies.push({ kind: enemy, cell: { x, y } });
          break;
        }
      }
    }
  }

  if (!playerSpawn) throw new MapParseError(`${def.id}: aucun point d'apparition "@"`);
  if (!bossSpawn) throw new MapParseError(`${def.id}: aucune arene de boss "!"`);
  if (!exit) throw new MapParseError(`${def.id}: aucune sortie "E"`);

  parsed.playerSpawn = playerSpawn;
  parsed.bossSpawn = bossSpawn;
  parsed.exit = exit;

  if (parsed.props.length === 0) {
    throw new MapParseError(`${def.id}: aucun objectif principal (marqueurs 1..4)`);
  }
  if (parsed.secrets.length !== def.secretCount) {
    throw new MapParseError(
      `${def.id}: ${parsed.secrets.length} secrets trouves, ${def.secretCount} attendus`,
    );
  }

  // Bordure etanche : evite toute sortie de grille.
  for (let x = 0; x < width; x++) {
    if (grid.kindAt(x, 0) !== TileKind.Wall || grid.kindAt(x, height - 1) !== TileKind.Wall) {
      throw new MapParseError(`${def.id}: bordure horizontale ouverte en x=${x}`);
    }
  }
  for (let y = 0; y < height; y++) {
    if (grid.kindAt(0, y) !== TileKind.Wall || grid.kindAt(width - 1, y) !== TileKind.Wall) {
      throw new MapParseError(`${def.id}: bordure verticale ouverte en y=${y}`);
    }
  }

  return parsed;
}
