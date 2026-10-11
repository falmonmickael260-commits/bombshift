import './ui/styles.css';
import { App } from './ui/app';

const app = new App();
app.start();

// Outils de test automatise exposes uniquement hors production.
if (import.meta.env.DEV) app.exposeDebug();
