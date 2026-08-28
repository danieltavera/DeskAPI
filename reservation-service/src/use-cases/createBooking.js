const bookingRepository = require('../interfaces/repositories/bookingRepository');
const AppError = require('./AppError');

async function createBooking({ resourceId, startTime, endTime }, currentUser) {
  if (!resourceId || !startTime || !endTime) {
    throw new AppError('resourceId, startTime and endTime are required', 400);
  }
  if (new Date(endTime) <= new Date(startTime)) {
    throw new AppError('endTime must be after startTime', 400);
  }

  const overlaps = await bookingRepository.hasOverlap({ resourceId, startTime, endTime });
  if (overlaps) {
    throw new AppError('This resource is already booked for that time range', 409);
  }

  return bookingRepository.create({
    userId: currentUser.sub,
    resourceId,
    startTime,
    endTime,
  });
}

module.exports = createBooking;
