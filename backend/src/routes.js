const express = require('express');
const router = express.Router();
const db = require('./db');
const publishEvent = require('./kafka');
const { isDuplicate, saveRequestId } = require('./idempotency');
const { getLagSeconds } = require('./replicationLag');

// =========================================
// GET PROPERTY
// =========================================
router.get('/:region/properties/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "SELECT * FROM properties WHERE id = $1",
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Property not found" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// =========================================
// PUT PROPERTY
// =========================================
router.put('/:region/properties/:id', async (req, res) => {
  const { price, version } = req.body;
  const { id } = req.params;
  const requestId = req.header('X-Request-ID');

  if (!requestId) {
    return res.status(400).json({ error: 'Missing X-Request-ID' });
  }

  if (await isDuplicate(requestId)) {
    return res.status(422).json({ error: 'Duplicate request' });
  }

  try {
    const result = await db.query(
      `UPDATE properties
       SET price = $1,
           version = version + 1,
           updated_at = NOW()
       WHERE id = $2 AND version = $3
       RETURNING *`,
      [price, id, version]
    );

    if (!result.rows.length) {
      return res.status(409).json({ error: 'Version conflict' });
    }

    const updatedProperty = result.rows[0];

    await saveRequestId(requestId);
    await publishEvent(updatedProperty);

    res.status(200).json(updatedProperty);

  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =========================================
// REPLICATION LAG
// =========================================
router.get('/:region/replication-lag', (req, res) => {
  res.json({ lag_seconds: getLagSeconds() });
});

module.exports = router;