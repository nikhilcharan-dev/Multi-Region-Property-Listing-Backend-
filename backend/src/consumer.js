const { Kafka } = require('kafkajs');
const config = require('./config');
const db = require('./db');
const { updateLastConsumed } = require('./replicationLag');

module.exports = async function startConsumer() {

  const kafka = new Kafka({
    brokers: [process.env.KAFKA_BROKER],
  });

  const admin = kafka.admin();
  await admin.connect();

  // ✅ Ensure topic exists before consuming
  const topics = await admin.listTopics();

  if (!topics.includes('property-updates')) {
    await admin.createTopics({
      topics: [
        {
          topic: 'property-updates',
          numPartitions: 1,
          replicationFactor: 1,
        },
      ],
    });
    console.log("Created topic: property-updates");
  }

  await admin.disconnect();

  const consumer = kafka.consumer({
    groupId: process.env.REGION,
  });

  await consumer.connect();
  await consumer.subscribe({
    topic: 'property-updates',
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const property = JSON.parse(message.value.toString());

      // Ignore events from same region
      if (property.region_origin === process.env.REGION) {
        return;
      }

      await db.query(
        `UPDATE properties
         SET price = $1,
             version = $2,
             updated_at = $3
         WHERE id = $4`,
        [
          property.price,
          property.version,
          property.updated_at,
          property.id,
        ]
      );

      updateLastConsumed(property.updated_at);
    },
  });
};