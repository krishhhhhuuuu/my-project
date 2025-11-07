const router = require('express').Router();
const aggregator = require('../aggregator');

router.post('/', async (req, res) => {
  try {
    await aggregator.ingest(req.body, 'rest');
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
