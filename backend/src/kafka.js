const { Kafka } = require('kafkajs');
const config = require('./config');

const kafka = new Kafka({
  brokers: [process.env.KAFKA_BROKER],
});

const producer = kafka.producer();

let connected = false;

async function publishEvent(property) {
  if (!connected) {
    await producer.connect();
    connected = true;
  }

  await producer.send({
    topic: 'property-updates',
    messages: [{ value: JSON.stringify(property) }],
  });
}

module.exports = publishEvent;