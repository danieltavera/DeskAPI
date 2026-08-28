const express = require('express');
const authenticate = require('../middlewares/authenticate');
const resourceTypeController = require('./resourceTypeController');

const router = express.Router();

router.get('/', authenticate, resourceTypeController.list);

module.exports = router;
