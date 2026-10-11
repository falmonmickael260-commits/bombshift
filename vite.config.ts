import { defineConfig } from 'vite';
import { frameSink } from './tools/frameSink';

export default defineConfig({
  base: './',
  // Capture de sequences de jeu en developpement (voir tools/frameSink.ts).
  plugins: [frameSink()],
  server: { host: true, port: 5180 },
  build: {
    target: 'es2020',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: { phaser: ['phaser'] },
      },
    },
  },
});
