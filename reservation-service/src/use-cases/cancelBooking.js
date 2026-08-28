const bookingRepository = require('../interfaces/repositories/bookingRepository');
const AppError = require('./AppError');

async function cancelBooking(id, currentUser) {
  const booking = await bookingRepository.findById(id);
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }
  if (booking.userId !== currentUser.sub && currentUser.role !== 'admin') {
    throw new AppError('You can only cancel your own bookings', 403);
  }

  await bookingRepository.remove(id);
}

module.exports = cancelBooking;
