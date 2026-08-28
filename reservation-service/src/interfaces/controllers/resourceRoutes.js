const express = require('express');
const authenticate = require('../middlewares/authenticate');
const resourceController = require('./resourceController');

const router = express.Router();

router.get('/', authenticate, resourceController.list);
router.post('/', authenticate, resourceController.create);
router.put('/:id', authenticate, resourceController.update);
router.delete('/:id', authenticate, resourceController.remove);

module.exports = router;
