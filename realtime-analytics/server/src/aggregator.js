const EventModel = require('./models/event.model');
const AggregateModel = require('./models/aggregate.model');
const wsServer = require('./ws-server'); // ✅ correct import

const resolutions = [1000, 5000, 60000];
const buckets = new Map();

function bucketTs(ts, res) {
  return Math.floor(ts / res) * res;
}

async function ingest(event, room = 'global') {
  const ts = new Date(event.timestamp || Date.now());
  await EventModel.create({ ...event, timestamp: ts });

  if (!buckets.has(room)) buckets.set(room, {});
  const roomBuckets = buckets.get(room);

  for (const res of resolutions) {
    roomBuckets[res] = roomBuckets[res] || new Map();
    const bts = bucketTs(ts.getTime(), res);
    const stats = roomBuckets[res].get(bts) || { count: 0, uniques: new Set(), errors: 0 };
    stats.count++;
    if (event.userId) stats.uniques.add(event.userId);
    if (event.action === 'error') stats.errors++;
    roomBuckets[res].set(bts, stats);

    const payload = {
      room,
      resolution: res,
      timestamp: new Date(bts),
      count: stats.count,
      uniques: stats.uniques.size,
      errors: stats.errors,
    };

    // ✅ correct broadcast call
    wsServer.broadcast(room, { type: 'delta', payload });

    // Save aggregate snapshot
    await AggregateModel.updateOne(
      { room, resolution: res, timestamp: payload.timestamp },
      { $set: payload },
      { upsert: true }
    );
  }
}

module.exports = { ingest };
