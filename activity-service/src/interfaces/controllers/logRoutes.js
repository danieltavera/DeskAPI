const express = require('express');
const logController = require('./logController');

const router = express.Router();

router.get('/', logController.list);
router.post('/', logController.create);

module.exports = router;
