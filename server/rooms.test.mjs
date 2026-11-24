import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import net from 'node:net';
import http from 'node:http';
import { once } from 'node:events';

async function portAvailable() {
  const server = net.createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}
function connectWebsocket(port) {
  return new Promise((resolve, reject) => {
    const socket = net.connect(port, '127.0.0.1');
    let buffer = Buffer.alloc(0);
    let handshake = false;
    const pending = [];
    const received = [];
    let handler = null;
    function emit(packet) {
      if (handler) { const next = handler; handler = null; next(packet); }
      else received.push(packet);
    }
    function parse() {
      if (!handshake) {
        const marker = buffer.indexOf('\r\n\r\n');
        if (marker < 0) return;
        const header = buffer.subarray(0, marker).toString();
        if (!header.includes('101 Switching Protocols')) return reject(new Error('WebSocket refused: '+header));
        handshake = true;
        buffer = buffer.subarray(marker + 4);
        resolve({
          send(packet) {
            const bytes = Buffer.from(JSON.stringify(packet));
            const mask = randomBytes(4);
            const head = bytes.length < 126
              ? Buffer.from([0x81, 0x80 | bytes.length])
              : Buffer.from([0x81, 0xfe, bytes.length >>> 8, bytes.length & 255]);
            const encrypted = Buffer.from(bytes);
            for (let i = 0; i < encrypted.length; i++) encrypted[i] ^= mask[i % 4];
            socket.write(Buffer.concat([head, mask, encrypted]));
          },
          next() {
            if (received.length) return Promise.resolve(received.shift());
            return new Promise((res, rej) => {
              const onPacket = packet => { clearTimeout(timeout); res(packet); };
              const timeout = setTimeout(() => {
                if (handler === onPacket) {
                  handler = null;
                  rej(new Error('No frame received'));
                }
              }, 3000);
              handler = onPacket;
            });
          },
          close() {
            if (socket.destroyed) return;
            // Navigateurs : une fermeture WebSocket masquée, puis FIN TCP.
            const mask = randomBytes(4);
            socket.end(Buffer.concat([Buffer.from([0x88, 0x80]), mask]));
          },
        });
      }
      while (buffer.length >= 2) {
        let length = buffer[1] & 127, headerLen = 2;
        if (length === 126) { if (buffer.length < 4) return; length = buffer.readUInt16BE(2); headerLen = 4; }
        if (buffer.length < headerLen + length) return;
        const opcode = buffer[0] & 0xf;
        const bytes = buffer.subarray(headerLen, headerLen + length);
        buffer = buffer.subarray(headerLen + length);
        if (opcode === 1) emit(JSON.parse(bytes.toString()));
        if (opcode === 8) socket.destroy();
      }
    }
    socket.on('data', chunk => { buffer = Buffer.concat([buffer, chunk]); parse(); });
    socket.on('error', reject);
    socket.on('connect', () => socket.write(
      'GET /multiplayer HTTP/1.1\r\nHost: 127.0.0.1:'+port+
      '\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: '+
      randomBytes(16).toString('base64')+
      '\r\nSec-WebSocket-Version: 13\r\n\r\n'
    ));
  });
}
test('Two clients can join a four-character room, play and exchange authoritative state', { timeout: 12000 }, async () => {
  const port = await portAvailable();
  console.error('duo-test: port allocated', port);
  const child = spawn(process.execPath, ['server/index.mjs'], {
    env: { ...process.env, PORT: String(port), COOP_LEADERBOARD_FILE: '/tmp/bombshift-test-leaderboard-' + port + '.json' },
    stdio: 'ignore',
  });
  const clients = [];
  try {
    let ready = false;
    for (let i = 0; i < 80; i++) {
      await new Promise(r => setTimeout(r, 30));
      ready = await new Promise(resolve => {
        http.get('http://127.0.0.1:'+port+'/health', res => { res.resume(); resolve(res.statusCode === 200); })
          .on('error', () => resolve(false));
      });
      if (ready) break;
    }
    assert.equal(ready, true);
    console.error('duo-test: health ready');
    const host = await connectWebsocket(port); clients.push(host);
    console.error('duo-test: host websocket connected');
    const guest = await connectWebsocket(port); clients.push(guest);
    console.error('duo-test: guest websocket connected');
    host.send({ type:'create', level:'level-140', difficulty:'normal', name:'Alex' });
    const created = await host.next();
    console.error('duo-test: room created', created.code);
    assert.equal(created.type, 'created');
    assert.match(created.code, /^[A-HJ-NP-Z2-9]{4}$/);
    guest.send({ type:'join', code: created.code, name:'Léa' });
    assert.equal((await guest.next()).type, 'joined');
    console.error('duo-test: guest joined');
    assert.equal((await host.next()).type, 'peer-joined');
    console.error('duo-test: host sees guest');
    const third = await connectWebsocket(port); clients.push(third);
    console.error('duo-test: third connected');
    third.send({ type:'join', code: created.code, name:'X' });
    assert.match((await third.next()).message, /complet/);
    console.error('duo-test: third rejected');
    host.send({ type:'start' });
    assert.equal((await host.next()).role, 'host');
    console.error('duo-test: host started');
    assert.equal((await guest.next()).role, 'guest');
    console.error('duo-test: guest started');
    guest.send({ type:'input', input: { moveX: 1, moveY:0, magnitude:1, bombPressed:true } });
    const input = await host.next();
    console.error('duo-test: input received');
    assert.equal(input.type, 'input');
    assert.equal(input.input.bombPressed, true);
    host.send({ type:'state', state: { timeMs: 200, players: [{ x:12,y:14 }, { x:23,y:24 }], bombs:[] } });
    const state = await guest.next();
    console.error('duo-test: state received');
    assert.equal(state.type, 'state');
    assert.equal(state.state.players[1].x, 23);
    guest.send({ type: 'heartbeat' });
    assert.equal((await guest.next()).type, 'heartbeat');
    console.error('duo-test: heartbeat received');
    guest.close();
    assert.equal((await host.next()).type, 'peer-left');
    console.error('duo-test: peer-left received');
  } finally {
    console.error('duo-test: cleanup');
    clients.forEach(c=>c.close());
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
  }
});
