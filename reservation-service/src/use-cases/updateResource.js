const resourceRepository = require('../interfaces/repositories/resourceRepository');
const AppError = require('./AppError');

async function updateResource(id, changes, currentUser) {
  if (currentUser.role !== 'admin') {
    throw new AppError('Only admins can update resources', 403);
  }

  const updated = await resourceRepository.update(id, changes);
  if (!updated) {
    throw new AppError('Resource not found', 404);
  }
  return updated;
}

module.exports = updateResource;
