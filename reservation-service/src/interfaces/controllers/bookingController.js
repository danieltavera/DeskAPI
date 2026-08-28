const listMyBookings = require('../../use-cases/listMyBookings');
const createBooking = require('../../use-cases/createBooking');
const updateBooking = require('../../use-cases/updateBooking');
const cancelBooking = require('../../use-cases/cancelBooking');
const AppError = require('../../use-cases/AppError');

function handleError(err, res) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  console.error(err);
  return res.status(500).json({ message: 'Internal server error' });
}

async function list(req, res) {
  try {
    const bookings = await listMyBookings(req.user);
    res.json(bookings);
  } catch (err) {
    handleError(err, res);
  }
}

async function create(req, res) {
  try {
    const booking = await createBooking(req.body, req.user);
    res.status(201).json(booking);
  } catch (err) {
    handleError(err, res);
  }
}

async function update(req, res) {
  try {
    const booking = await updateBooking(req.params.id, req.body, req.user);
    res.json(booking);
  } catch (err) {
    handleError(err, res);
  }
}

async function remove(req, res) {
  try {
    await cancelBooking(req.params.id, req.user);
    res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
}

module.exports = { list, create, update, remove };
