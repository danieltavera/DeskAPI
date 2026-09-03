require('dotenv').config();

const pool = require('../src/infrastructure/db/pool');
const registerUser = require('../src/use-cases/registerUser');
const loginUser = require('../src/use-cases/loginUser');

function uniqueEmail() {
  return `test_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;
}

afterAll(async () => {
  await pool.end();
});

describe('registerUser', () => {
  // a new user should be persisted with the forced 'user' role, never trusting client input
  test('creates a user with role "user"', async () => {
    const email = uniqueEmail();
    const user = await registerUser({ name: 'Test User', email, password: 'secret123' });

    expect(user.email).toBe(email);
    expect(user.role).toBe('user');
    expect(user.id).toBeTruthy();
  });

  // name/email/password are all required for registration
  test('rejects missing fields with 400', async () => {
    await expect(registerUser({ email: uniqueEmail() })).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  // the same email cannot be registered twice
  test('rejects duplicate email with 409', async () => {
    const email = uniqueEmail();
    await registerUser({ name: 'Test User', email, password: 'secret123' });

    await expect(
      registerUser({ name: 'Another', email, password: 'secret123' })
    ).rejects.toMatchObject({ statusCode: 409 });
  });
});

describe('loginUser', () => {
  // a valid login should return a real access + refresh JWT pair
  test('returns tokens for correct credentials', async () => {
    const email = uniqueEmail();
    const password = 'secret123';
    await registerUser({ name: 'Test User', email, password });

    const tokens = await loginUser({ email, password });

    expect(typeof tokens.accessToken).toBe('string');
    expect(typeof tokens.refreshToken).toBe('string');
  });

  // wrong password for an existing user must not authenticate
  test('rejects wrong password with 401', async () => {
    const email = uniqueEmail();
    await registerUser({ name: 'Test User', email, password: 'secret123' });

    await expect(loginUser({ email, password: 'wrongpass' })).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  // logging in with an email that was never registered must not authenticate
  test('rejects unknown email with 401', async () => {
    await expect(
      loginUser({ email: uniqueEmail(), password: 'whatever' })
    ).rejects.toMatchObject({ statusCode: 401 });
  });
});

