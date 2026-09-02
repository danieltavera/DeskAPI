-- DeskAPI — full database schema, run automatically by Postgres on first container start
-- (mounted into /docker-entrypoint-initdb.d/ via docker-compose.yml)

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE resource_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    type_id INTEGER NOT NULL REFERENCES resource_types(id),
    location VARCHAR(150),
    state_code VARCHAR(10),
    status VARCHAR(20) NOT NULL DEFAULT 'available',
    attributes JSONB,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    resource_id INTEGER NOT NULL REFERENCES resources(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_time_order CHECK (end_time > start_time)
);

-- used by activity-service — no FK to users on purpose, logs must survive user deletion
CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    event VARCHAR(100) NOT NULL,
    user_id INTEGER,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- seed admin (email: admin@deskapi.com / password: Admin)
-- hash pre-generated with bcrypt (cost 10) since this script cannot run Node code
INSERT INTO users (name, email, password_hash, role)
VALUES ('Admin', 'admin@deskapi.com', '$2a$10$FSQfgyP9S2dLg6JjjIUBuuMpLHKgiCORRDkUgT05MRJhVMz9Ddg6e', 'admin')
ON CONFLICT (email) DO NOTHING;
