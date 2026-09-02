const jwt = require('jsonwebtoken');
const registerUser = require('../../use-cases/registerUser');
const loginUser = require('../../use-cases/loginUser');
const logoutUser = require('../../use-cases/logoutUser');
const refreshAccessToken = require('../../use-cases/refreshAccessToken');
const AppError = require('../../use-cases/AppError');
const { logEvent } = require('../../infrastructure/http/activityLogger');

async function register(req, res) {
  try {
    const user = await registerUser(req.body);
    logEvent('user_registered', user.id, `User ${user.name} registered`);
    res.status(201).json(user); // 201 Registered successfully
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: 'Internal server error' }); // 500 Internal server error
  }
}

async function login(req, res) {
  try {
    const tokens = await loginUser(req.body);
    const { sub: userId } = jwt.decode(tokens.accessToken);
    logEvent('user_login', userId, `User ${userId} logged in`);
    res.status(200).json(tokens); // 200 Login successful
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: 'Internal server error' }); // 500 Internal server error
  }
}

async function logout(req, res) {
  try {
    await logoutUser(req.user);
    logEvent('user_logout', req.user.sub, `User ${req.user.sub} logged out`);
    res.status(204).send(); // 204 Logged out, refresh tokens wiped
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function refresh(req, res) {
  try {
    const tokens = await refreshAccessToken(req.body);
    res.status(200).json(tokens); // 200 New access token issued
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { register, login, logout, refresh };
