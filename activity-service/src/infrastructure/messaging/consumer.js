const amqp = require('amqplib');
const createLog = require('../../use-cases/createLog');

const QUEUE_NAME = 'activity_logs';
const RECONNECT_DELAY_MS = 3000;

async function startConsumer() {
  const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
  const conn = await amqp.connect(url);
  const channel = await conn.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });

  channel.consume(QUEUE_NAME, async (msg) => {
    if (!msg) return;
    try {
      const data = JSON.parse(msg.content.toString());
      await createLog(data);
      channel.ack(msg);
    } catch (err) {
      console.error('Failed to process activity log message:', err.message);
      channel.nack(msg, false, false); // discard malformed messages instead of requeueing forever
    }
  });

  console.log(`activity-service: listening for events on RabbitMQ queue "${QUEUE_NAME}"`);

  // an unhandled 'error' event on a Node EventEmitter crashes the whole process —
  // this listener must exist even if empty, "close" below handles the actual reconnect
  conn.on('error', (err) => {
    console.warn('RabbitMQ connection error:', err.message);
  });

  // if the broker restarts or drops the connection, reconnect instead of going silent forever
  conn.on('close', () => {
    console.warn('RabbitMQ connection closed, retrying in 3s...');
    setTimeout(() => {
      startConsumer().catch((err) => console.warn('RabbitMQ reconnect failed:', err.message));
    }, RECONNECT_DELAY_MS);
  });
}

module.exports = { startConsumer };
