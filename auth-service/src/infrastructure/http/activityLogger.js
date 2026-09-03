const amqp = require('amqplib');

const QUEUE_NAME = 'activity_logs';
let channelPromise;

function getChannel() {
  if (!channelPromise) {
    const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    channelPromise = amqp
      .connect(url)
      .then((conn) => {
        // if the broker restarts or drops the connection, invalidate the cache so the
        // next logEvent() call reconnects instead of silently publishing to a dead socket
        conn.on('error', () => { channelPromise = null; });
        conn.on('close', () => { channelPromise = null; });
        return conn.createChannel();
      })
      .then((channel) => channel.assertQueue(QUEUE_NAME, { durable: true }).then(() => channel));
  }
  return channelPromise;
}

// fire-and-forget: logging must never block or break the main request flow
function logEvent(event, userId, message) {
  getChannel()
    .then((channel) => {
      channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify({ event, userId, message })), {
        persistent: true,
      });
    })
    .catch((err) => {
      console.warn('Could not publish activity event to RabbitMQ:', err.message);
      channelPromise = null; // retry connecting next time instead of caching a broken connection
    });
}

module.exports = { logEvent };
