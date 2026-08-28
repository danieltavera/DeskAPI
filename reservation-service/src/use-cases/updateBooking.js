const bookingRepository = require('../interfaces/repositories/bookingRepository');
const resourceRepository = require('../interfaces/repositories/resourceRepository');
const { findHolidayForDate } = require('../infrastructure/http/holidayApiClient');
const AppError = require('./AppError');

const HOLIDAY_COUNTRY_CODE = process.env.HOLIDAY_COUNTRY_CODE || 'AU';

async function updateBooking(id, { startTime, endTime }, currentUser) {
  const booking = await bookingRepository.findById(id);
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }
  if (booking.userId !== currentUser.sub && currentUser.role !== 'admin') {
    throw new AppError('You can only edit your own bookings', 403);
  }

  const newStart = startTime || booking.startTime;
  const newEnd = endTime || booking.endTime;
  if (new Date(newEnd) <= new Date(newStart)) {
    throw new AppError('endTime must be after startTime', 400);
  }

  const resource = await resourceRepository.findById(booking.resourceId);
  const holiday = await findHolidayForDate(HOLIDAY_COUNTRY_CODE, newStart, resource ? resource.stateCode : null);
  if (holiday) {
    throw new AppError(`Bookings are not allowed on public holidays (${holiday.name})`, 409);
  }

  const overlaps = await bookingRepository.hasOverlap({
    resourceId: booking.resourceId,
    startTime: newStart,
    endTime: newEnd,
    excludeBookingId: id,
  });
  if (overlaps) {
    throw new AppError('This resource is already booked for that time range', 409);
  }

  return bookingRepository.update(id, { startTime: newStart, endTime: newEnd });
}

module.exports = updateBooking;
