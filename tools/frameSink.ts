import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

/**
 * Outil de developpement : recoit les images du canvas envoyees par la page
 * et les ecrit sur disque. Sert a enregistrer des sequences de jeu
 * (captures, bandes-annonces, verification visuelle image par image).
 * Actif uniquement avec le serveur de developpement.
 */
export function frameSink(dir = '/tmp/bombshift-frames'): Plugin {
  return {
    name: 'bombshift-frame-sink',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__frame', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end();
          return;
        }
        const name = String(req.headers['x-frame-name'] ?? 'frame').replace(/[^a-z0-9_.-]/gi, '');
        const chunks: Buffer[] = [];
        req.on('data', (c: Buffer) => chunks.push(c));
        req.on('end', () => {
          try {
            fs.mkdirSync(dir, { recursive: true });
            const base64 = Buffer.concat(chunks).toString('utf8');
            fs.writeFileSync(path.join(dir, `${name}.png`), Buffer.from(base64, 'base64'));
            res.statusCode = 204;
          } catch {
            res.statusCode = 500;
          }
          res.end();
        });
      });
      server.middlewares.use('/__frames-clear', (_req, res) => {
        fs.rmSync(dir, { recursive: true, force: true });
        fs.mkdirSync(dir, { recursive: true });
        res.statusCode = 204;
        res.end();
      });
    },
  };
}
