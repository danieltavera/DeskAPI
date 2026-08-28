const resourceTypeRepository = require('../interfaces/repositories/resourceTypeRepository');

async function listResourceTypes() {
  return resourceTypeRepository.findAll();
}

module.exports = listResourceTypes;
