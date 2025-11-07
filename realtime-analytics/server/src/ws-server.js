const { WebSocketServer } = require('ws');
const jwt = require('jsonwebtoken');
const config = require('./config');
const aggregator = require('./aggregator');
const logger = require('./logger');

const rooms = new Map();

function attach(server) {
  const wss = new WebSocketServer({ server, maxPayload: config.wsMaxPayload });
  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, 'http://localhost');
    const token = url.searchParams.get('token');
    const room = url.searchParams.get('room') || 'global';

    try {
      jwt.verify(token, config.jwtSecret);
    } catch {
      ws.close(1008, 'unauthorized');
      return;
    }

    if (!rooms.has(room)) rooms.set(room, new Set());
    rooms.get(room).add(ws);

    ws.on('message', (msg) => {
      try {
        const data = JSON.parse(msg);
        if (data.type === 'event') aggregator.ingest(data.event, room);
      } catch (e) {
        logger.warn(e);
      }
    });

    ws.on('close', () => rooms.get(room).delete(ws));
  });
}

function broadcast(room, msg) {
  const sockets = rooms.get(room);
  if (!sockets) return;
  const data = JSON.stringify(msg);
  for (const ws of sockets)
    ws.readyState === ws.OPEN && ws.send(data);
}

module.exports = { attach, broadcast };
