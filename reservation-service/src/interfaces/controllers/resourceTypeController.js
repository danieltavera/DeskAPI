const listResourceTypes = require('../../use-cases/listResourceTypes');

async function list(req, res) {
  try {
    const types = await listResourceTypes();
    res.json(types);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { list };
