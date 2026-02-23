require('dotenv').config();

const requiredEnvVars = [
  'REGION',
  'DATABASE_URL',
  'KAFKA_BROKER'
];

// Validate required environment variables
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

const config = {
  app: {
    port: process.env.PORT || 8000,
    region: process.env.REGION,
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  database: {
    url: process.env.DATABASE_URL,
  },

  kafka: {
    broker: process.env.KAFKA_BROKER,
    topic: 'property-updates',
    consumerGroup: process.env.REGION,
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  replication: {
    lagWarningThresholdSeconds: parseInt(
      process.env.REPLICATION_LAG_WARNING || '10',
      10
    ),
  }
};

module.exports = config;