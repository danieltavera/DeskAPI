const express = require('express');
const authenticate = require('../middlewares/authenticate');
const bookingController = require('./bookingController');

const router = express.Router();

router.get('/', authenticate, bookingController.list);
router.post('/', authenticate, bookingController.create);
router.put('/:id', authenticate, bookingController.update);
router.delete('/:id', authenticate, bookingController.remove);

module.exports = router;
