const express = require('express');
const authenticate = require('../middlewares/authenticate');
const authController = require('./authController');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);

module.exports = router;
