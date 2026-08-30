const logRepository = require('../interfaces/repositories/logRepository');
const AppError = require('./AppError');

async function createLog({ event, userId, message }) {
  if (!event || !message) {
    throw new AppError('event and message are required', 400);
  }
  return logRepository.create({ event, userId, message });
}

module.exports = createLog;
