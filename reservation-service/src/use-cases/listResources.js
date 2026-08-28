const resourceRepository = require('../interfaces/repositories/resourceRepository');

async function listResources() {
  return resourceRepository.findAll();
}

module.exports = listResources;
