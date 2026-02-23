const db = require('./db');

async function isDuplicate(requestId) {
  const result = await db.query(
    'SELECT request_id FROM idempotency_keys WHERE request_id = $1',
    [requestId]
  );
  return result.rows.length > 0;
}

async function saveRequestId(requestId) {
  await db.query(
    'INSERT INTO idempotency_keys(request_id) VALUES($1)',
    [requestId]
  );
}

module.exports = { isDuplicate, saveRequestId };