const createLog = require('../../use-cases/createLog');
const listLogs = require('../../use-cases/listLogs');
const AppError = require('../../use-cases/AppError');

function handleError(err, res) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  console.error(err);
  return res.status(500).json({ message: 'Internal server error' });
}

async function list(req, res) {
  try {
    const logs = await listLogs();
    res.json(logs);
  } catch (err) {
    handleError(err, res);
  }
}

async function create(req, res) {
  try {
    const log = await createLog(req.body);
    res.status(201).json(log);
  } catch (err) {
    handleError(err, res);
  }
}

module.exports = { list, create };
