const express = require('express');
const config = require('./config');
const logger = require('./utils/logger');
const routes = require('./routes');
const startConsumer = require('./consumer');

const app = express();

app.use(express.json());

// Region health
app.get('/:region/health', (req, res) => {
  res.status(200).send('OK');
});

// Internal health
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use('/', routes);

app.listen(8000, async () => {
  console.log(`Backend running for region: ${process.env.REGION}`);

  // 🔥 START KAFKA CONSUMER
  await startConsumer();
});