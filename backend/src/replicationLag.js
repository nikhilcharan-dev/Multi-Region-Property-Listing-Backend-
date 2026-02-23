let lastConsumedTimestamp = null;

function updateLastConsumed(timestamp) {
  lastConsumedTimestamp = new Date(timestamp);
}

function getLagSeconds() {
  if (!lastConsumedTimestamp) return 0;
  return (Date.now() - lastConsumedTimestamp.getTime()) / 1000;
}

module.exports = { updateLastConsumed, getLagSeconds };