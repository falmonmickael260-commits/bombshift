/**
 * Zero-dependency WebSocket room relay for BombShift co-op.
 * Deploy this service on Railway (npm run build && npm start).
 * Each room belongs to one campaign level and accepts exactly two players.
 */
import http from 'node:http';
import { cleanName, addCoopResult, listCoopResults } from './leaderboard.mjs';
import { createHash, randomInt } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const PORT = Number(process.env.PORT || 3000);
const PUBLIC = resolve(process.cwd(), 'dist');
const ROOMS = new Map();
const CLIENTS = new Set();
const MAX_MESSAGE = 32 * 1024;
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_CODE_LENGTH = 4; // 4 caractères faciles à communiquer, invitation par lien prioritaire
const MAX_JOIN_ATTEMPTS = 6;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };

function send(client, message) {
  if (client.socket.destroyed) return;
  const data = Buffer.from(JSON.stringify(message));
  const hdr = data.length < 126
    ? Buffer.from([0x81, data.length])
    : Buffer.from([0x81, 126, data.length >>> 8, data.length & 255]);
  client.socket.write(Buffer.concat([hdr, data]));
}
function closeFrame(client, code = 1000) {
  if (!client.socket.destroyed) {
    try { client.socket.write(Buffer.from([0x88, 0x02, code >>> 8, code & 255])); } catch {}
    client.socket.end();
  }
}
function detach(client) {
  const room = client.room;
  if (!room) return;
  client.room = null;
  ROOMS.delete(room.code);
  const other = room.host === client ? room.guest : room.host;
  if (other && other.room === room) {
    other.room = null;
    send(other, { type: 'peer-left' });
  }
}
function newCode() {
  let code;
  do {
    code = Array.from({ length: ROOM_CODE_LENGTH }, () => CODE_CHARS[randomInt(CODE_CHARS.length)]).join('');
  } while (ROOMS.has(code));
  return code;
}
function validLevel(value) {
  return typeof value === 'string' &&
    (/^(volcano|ice|temple)(2|3)?$/.test(value) || /^level-(1[0-9]|[2-9][0-9]|10[0-9]|1[1-3][0-9]|140)$/.test(value));
}
function handle(client, packet) {
  if (!packet || typeof packet !== 'object') return;
  const { type } = packet;
  if (type === 'heartbeat') { send(client, { type: 'heartbeat' }); return; }
  if (type === 'leave') { detach(client); return; }
  if (type === 'create') {
    if (client.room) return send(client, { type: 'error', message: 'Quittez votre salon actuel.' });
    if (!validLevel(packet.level)) return send(client, { type: 'error', message: 'Niveau inconnu.' });
    const difficulty = ['detente', 'normal', 'veteran'].includes(packet.difficulty)
      ? packet.difficulty : 'normal';
    const room = { code: newCode(), level: packet.level, difficulty, host: client,
      guest: null, hostName: cleanName(packet.name), guestName: 'Joueur 2',
      started: false, startedAt: null, finished: false, completedAt: null, createdAt: Date.now() };
    ROOMS.set(room.code, room);
    client.room = room;
    send(client, { type: 'created', code: room.code, level: room.level });
    return;
  }
  if (type === 'join') {
    const now = Date.now();
    if (now - client.joinWindow > 60000) { client.joinWindow = now; client.joinAttempts = 0; }
    if (++client.joinAttempts > MAX_JOIN_ATTEMPTS) {
      return send(client, { type: 'error', message: 'Trop de tentatives. Réessaie dans une minute.' });
    }
    if (client.room) return send(client, { type: 'error', message: 'Quittez votre salon actuel.' });
    const code = String(packet.code || '').trim().toUpperCase();
    const room = ROOMS.get(code);
    if (!room) return send(client, { type: 'error', message: 'Salon introuvable ou expiré.' });
    if (room.guest || room.started) return send(client, { type: 'error', message: 'Salon déjà complet.' });
    room.guest = client; room.guestName = cleanName(packet.name); client.room = room;
    send(client, { type: 'joined', code, level: room.level, difficulty: room.difficulty, host: room.hostName });
    send(room.host, { type: 'peer-joined', guest: room.guestName });
    return;
  }
  const room = client.room;
  if (!room) return send(client, { type: 'error', message: 'Rejoignez un salon avant de jouer.' });
  if (type === 'start') {
    if (client !== room.host || !room.guest || room.started) return;
    room.started = true;
    room.startedAt = Date.now();
    const seed = randomInt(0x7fffffff);
    send(room.host, { type: 'started', level: room.level, difficulty: room.difficulty, role: 'host', seed });
    send(room.guest, { type: 'started', level: room.level, difficulty: room.difficulty, role: 'guest', seed });
    return;
  }
  if (!room.started || !room.guest) return;
  const other = client === room.host ? room.guest : room.host;
  if (type === 'input') {
    const input = packet.input;
    if (!input || typeof input !== 'object') return;
    const moveX = Number(input.moveX), moveY = Number(input.moveY), magnitude = Number(input.magnitude);
    if (![moveX, moveY, magnitude].every(Number.isFinite)) return;
    send(other, { type: 'input', input: {
      moveX: Math.max(-1, Math.min(1, moveX)),
      moveY: Math.max(-1, Math.min(1, moveY)),
      magnitude: Math.max(0, Math.min(1, magnitude)),
      bombPressed: input.bombPressed === true,
      abilityPressed: input.abilityPressed === true,
      ability2Pressed: input.ability2Pressed === true,
    } });
  } else if (type === 'state' && client === room.host && packet.state) {
    // Host-authoritative correction; reject oversized payloads before relaying.
    send(other, { type: 'state', state: packet.state });
  } else if (type === 'result' && client === room.host && packet.result && !room.finished) {
    room.finished = true;
    room.completedAt = Date.now();
    room.hostVictory = packet.result.victory === true;
    send(other, { type: 'result', result: { victory: room.hostVictory } });
  } else if (type === 'confirm-result' && client === room.guest && room.finished && room.hostVictory && !room.recorded) {
    // Both browsers confirm the same outcome; elapsed time comes from the server.
    room.recorded = true;
    const elapsed = room.completedAt - room.startedAt;
    if (elapsed >= 10000 && elapsed <= 2 * 60 * 60 * 1000) {
      try {
        addCoopResult({ level: room.level, host: room.hostName, guest: room.guestName, timeMs: elapsed });
        send(room.host, { type: 'recorded', time_ms: elapsed });
        send(room.guest, { type: 'recorded', time_ms: elapsed });
      } catch (error) { console.error('Coop leaderboard storage error:', error); }
    }
  }
}
function readFrames(client, data) {
  client.buffer = Buffer.concat([client.buffer, data]);
  while (client.buffer.length >= 2) {
    const b0 = client.buffer[0], b1 = client.buffer[1];
    let size = b1 & 127, offset = 2;
    if (!(b1 & 128) || (b0 & 0x70)) return closeFrame(client, 1002);
    if (size === 126) {
      if (client.buffer.length < 4) return;
      size = client.buffer.readUInt16BE(2); offset = 4;
    } else if (size === 127) {
      if (client.buffer.length < 10) return;
      const big = client.buffer.readBigUInt64BE(2);
      if (big > BigInt(MAX_MESSAGE)) return closeFrame(client, 1009);
      size = Number(big); offset = 10;
    }
    if (size > MAX_MESSAGE) return closeFrame(client, 1009);
    if (client.buffer.length < offset + 4 + size) return;
    const mask = client.buffer.subarray(offset, offset + 4);
    const payload = Buffer.from(client.buffer.subarray(offset + 4, offset + 4 + size));
    client.buffer = client.buffer.subarray(offset + 4 + size);
    for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i & 3];
    const op = b0 & 15;
    if (op === 8) { closeFrame(client); return; }
    if (op === 9) {
      client.socket.write(Buffer.concat([Buffer.from([0x8a, payload.length]), payload]));
      continue;
    }
    if (op !== 1 || !(b0 & 0x80)) return closeFrame(client, 1003);
    const now = Date.now();
    if (now - client.windowStart > 1000) { client.windowStart = now; client.messages = 0; }
    if (++client.messages > 80) return closeFrame(client, 1008);
    try { handle(client, JSON.parse(payload.toString('utf8'))); } catch {
      send(client, { type: 'error', message: 'Message invalide.' });
    }
  }
  if (client.buffer.length > MAX_MESSAGE + 14) closeFrame(client, 1009);
}
const server = http.createServer((req, res) => {
  if ((req.url || '').startsWith('/api/coop/leaderboard')) {
    const address = new URL(req.url || '/', 'http://localhost');
    const level = address.searchParams.get('level');
    if (level && !validLevel(level)) { res.writeHead(400); return res.end('Invalid level'); }
    const body = JSON.stringify({ level: level || null, entries: listCoopResults(level) });
    res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store',
      'access-control-allow-origin': '*' });
    return res.end(body);
  }
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, rooms: ROOMS.size }));
  }
  const url = new URL(req.url || '/', 'http://localhost');
  const rawPath = decodeURIComponent(url.pathname);
  const safe = normalize(rawPath).replace(/^(\.\.[/\\])+/, '').replace(/^[/\\]/, '');
  const target = resolve(PUBLIC, safe || 'index.html');
  if (!target.startsWith(PUBLIC + '/') && target !== PUBLIC) { res.writeHead(403); return res.end(); }
  const file = existsSync(target) && statSync(target).isFile() ? target : join(PUBLIC, 'index.html');
  if (!existsSync(file)) { res.writeHead(503); return res.end('Build missing: run npm run build'); }
  res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream',
    'cache-control': file.endsWith('index.html') ? 'no-store' : 'public, max-age=3600' });
  res.end(readFileSync(file));
});
server.on('upgrade', (req, socket, head) => {
  if (req.url?.split('?')[0] !== '/multiplayer' || req.headers.upgrade?.toLowerCase() !== 'websocket') {
    socket.destroy(); return;
  }
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (allowed.length && !allowed.includes(String(req.headers.origin || ''))) { socket.destroy(); return; }
  const key = req.headers['sec-websocket-key'];
  if (typeof key !== 'string' || Buffer.from(key, 'base64').length !== 16) { socket.destroy(); return; }
  const hash = createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + hash + '\r\n\r\n');
  const client = { socket, buffer: Buffer.alloc(0), room: null, windowStart: Date.now(), messages: 0, joinWindow: Date.now(), joinAttempts: 0 };
  CLIENTS.add(client);
  socket.on('data', (chunk) => readFrames(client, chunk));
  socket.on('close', () => { detach(client); CLIENTS.delete(client); });
  socket.on('error', () => { detach(client); CLIENTS.delete(client); });
  if (head.length) readFrames(client, head);
});
setInterval(() => {
  for (const room of ROOMS.values()) {
    if (Date.now() - room.createdAt > (room.started ? 2 * 60 * 60 * 1000 : 20 * 60 * 1000)) {
      send(room.host, { type: 'error', message: 'Salon expiré.' });
      if (room.guest) send(room.guest, { type: 'error', message: 'Salon expiré.' });
      detach(room.host);
    }
  }
}, 60000).unref();
server.listen(PORT, '0.0.0.0', () => console.log('BombShift co-op listening on ' + PORT));
