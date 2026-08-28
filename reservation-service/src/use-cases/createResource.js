const resourceRepository = require('../interfaces/repositories/resourceRepository');
const resourceTypeRepository = require('../interfaces/repositories/resourceTypeRepository');
const AppError = require('./AppError');

async function createResource({ name, type, location, attributes }, currentUser) {
  if (currentUser.role !== 'admin') {
    throw new AppError('Only admins can create resources', 403);
  }
  if (!name || !type) {
    throw new AppError('Name and type are required', 400);
  }

  const resourceType = await resourceTypeRepository.findOrCreate(type);

  return resourceRepository.create({
    name,
    description: null,
    typeId: resourceType.id,
    location,
    attributes,
    createdBy: currentUser.sub,
  });
}

module.exports = createResource;
