require('dotenv').config();

const { test, after } = require('node:test');
const assert = require('node:assert');

const pool = require('../src/infrastructure/db/pool');
const registerUser = require('../src/use-cases/registerUser');
const loginUser = require('../src/use-cases/loginUser');
const AppError = require('../src/use-cases/AppError');

function uniqueEmail() {
  return `test_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;
}



// a new user should be persisted with the forced 'user' role, never trusting client input
test('registerUser creates a user with role "user"', async () => {
  const email = uniqueEmail();
  const user = await registerUser({ name: 'Test User', email, password: 'secret123' });

  assert.strictEqual(user.email, email);
  assert.strictEqual(user.role, 'user');
  assert.ok(user.id);
});



// name/email/password are all required for registration
test('registerUser rejects missing fields with 400', async () => {
  await assert.rejects(
    () => registerUser({ email: uniqueEmail() }),
    (err) => err instanceof AppError && err.statusCode === 400
  );
});



// the same email cannot be registered twice
test('registerUser rejects duplicate email with 409', async () => {
  const email = uniqueEmail();
  await registerUser({ name: 'Test User', email, password: 'secret123' });

  await assert.rejects(
    () => registerUser({ name: 'Another', email, password: 'secret123' }),
    (err) => err instanceof AppError && err.statusCode === 409
  );
});



// a valid login should return a real access + refresh JWT pair
test('loginUser returns tokens for correct credentials', async () => {
  const email = uniqueEmail();
  const password = 'secret123';
  await registerUser({ name: 'Test User', email, password });

  const tokens = await loginUser({ email, password });

  assert.strictEqual(typeof tokens.accessToken, 'string');
  assert.strictEqual(typeof tokens.refreshToken, 'string');
});



// wrong password for an existing user must not authenticate
test('loginUser rejects wrong password with 401', async () => {
  const email = uniqueEmail();
  await registerUser({ name: 'Test User', email, password: 'secret123' });

  await assert.rejects(
    () => loginUser({ email, password: 'wrongpass' }),
    (err) => err instanceof AppError && err.statusCode === 401
  );
});



// logging in with an email that was never registered must not authenticate
test('loginUser rejects unknown email with 401', async () => {
  await assert.rejects(
    () => loginUser({ email: uniqueEmail(), password: 'whatever' }),
    (err) => err instanceof AppError && err.statusCode === 401
  );
});


after(async () => {
  await pool.end();
});
