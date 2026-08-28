const bookingRepository = require('../interfaces/repositories/bookingRepository');

async function listMyBookings(currentUser) {
  return bookingRepository.findByUserId(currentUser.sub);
}

module.exports = listMyBookings;
