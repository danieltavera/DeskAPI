require('dotenv').config();

const pool = require('../src/infrastructure/db/pool');
const createResource = require('../src/use-cases/createResource');
const createBooking = require('../src/use-cases/createBooking');

let adminId;

function uniqueName(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

beforeAll(async () => {
  const { rows } = await pool.query("SELECT id FROM users WHERE email = 'admin@deskapi.com'");
  if (!rows[0]) {
    throw new Error('Seeded admin (admin@deskapi.com) not found — run the DB seed first');
  }
  adminId = rows[0].id;
});

afterAll(async () => {
  await pool.end();
});

describe('createResource', () => {
  // admin creates a resource with a brand-new type, which should be auto find-or-created
  test('admin can create a resource, auto-creating its type', async () => {
    const admin = { sub: adminId, role: 'admin' };
    const type = uniqueName('type');

    const resource = await createResource(
      { name: uniqueName('Room'), type, location: 'Melbourne, VIC', stateCode: 'AU-VIC' },
      admin
    );

    expect(resource.type).toBe(type);
    expect(resource.stateCode).toBe('AU-VIC');
  });

  // only admins are allowed to create resources
  test('rejects a non-admin with 403', async () => {
    const regularUser = { sub: adminId, role: 'user' };

    await expect(
      createResource({ name: uniqueName('Room'), type: 'room', location: 'Sydney, NSW' }, regularUser)
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  // location is a required field
  test('rejects a missing location with 400', async () => {
    const admin = { sub: adminId, role: 'admin' };

    await expect(
      createResource({ name: uniqueName('Room'), type: 'room' }, admin)
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('createBooking', () => {
  let resourceId;

  beforeAll(async () => {
    const admin = { sub: adminId, role: 'admin' };
    const resource = await createResource(
      { name: uniqueName('Booking Test Room'), type: uniqueName('type'), location: 'Melbourne, VIC', stateCode: 'AU-VIC' },
      admin
    );
    resourceId = resource.id;
  });

  // a normal booking on a free time slot should succeed
  test('creates a booking successfully', async () => {
    const user = { sub: adminId, role: 'user' };

    const booking = await createBooking(
      { resourceId, startTime: '2026-07-06T10:00:00Z', endTime: '2026-07-06T11:00:00Z' },
      user
    );

    expect(booking.resourceId).toBe(resourceId);
    expect(booking.status).toBe('confirmed');
  });

  // the same resource cannot be double-booked for an overlapping time range
  test('rejects an overlapping booking with 409', async () => {
    const user = { sub: adminId, role: 'user' };

    await expect(
      createBooking(
        { resourceId, startTime: '2026-07-06T10:30:00Z', endTime: '2026-07-06T11:30:00Z' },
        user
      )
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  // a booking on a national public holiday (Australia Day) must be blocked
  test('rejects a booking on a public holiday with 409', async () => {
    const user = { sub: adminId, role: 'user' };

    await expect(
      createBooking(
        { resourceId, startTime: '2026-01-26T10:00:00Z', endTime: '2026-01-26T11:00:00Z' },
        user
      )
    ).rejects.toMatchObject({ statusCode: 409 });
  });
});
