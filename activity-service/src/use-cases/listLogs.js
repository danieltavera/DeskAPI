const logRepository = require('../interfaces/repositories/logRepository');

async function listLogs() {
  return logRepository.findAll();
}

module.exports = listLogs;
