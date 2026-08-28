const bookingRepository = require('../interfaces/repositories/bookingRepository');
const resourceRepository = require('../interfaces/repositories/resourceRepository');
const { findHolidayForDate } = require('../infrastructure/http/holidayApiClient');
const AppError = require('./AppError');

const HOLIDAY_COUNTRY_CODE = process.env.HOLIDAY_COUNTRY_CODE || 'AU';

async function createBooking({ resourceId, startTime, endTime }, currentUser) {
  if (!resourceId || !startTime || !endTime) {
    throw new AppError('resourceId, startTime and endTime are required', 400);
  }
  if (new Date(endTime) <= new Date(startTime)) {
    throw new AppError('endTime must be after startTime', 400);
  }

  const resource = await resourceRepository.findById(resourceId);
  if (!resource) {
    throw new AppError('Resource not found', 404);
  }

  const holiday = await findHolidayForDate(HOLIDAY_COUNTRY_CODE, startTime, resource.stateCode);
  if (holiday) {
    throw new AppError(`Bookings are not allowed on public holidays (${holiday.name})`, 409);
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
