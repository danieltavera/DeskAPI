const resourceRepository = require('../interfaces/repositories/resourceRepository');
const AppError = require('./AppError');

async function deleteResource(id, currentUser) {
  if (currentUser.role !== 'admin') {
    throw new AppError('Only admins can delete resources', 403);
  }

  const deleted = await resourceRepository.remove(id);
  if (!deleted) {
    throw new AppError('Resource not found', 404);
  }
}

module.exports = deleteResource;
