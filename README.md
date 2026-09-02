# DeskAPI

Backend system (REST API) for booking shared resources — meeting rooms, TVs, sports courts, equipment, etc.

## How to run this project (Docker)

You only need **Docker Desktop** installed and running. No manual database setup, no `.env` files to create, no extra steps.

### 1. Clone the repository
```bash
git clone https://github.com/danieltavera/DeskAPI.git
cd DeskAPI
```

### 2. Start everything
```bash
docker compose up --build
```

This single command builds and starts:
- `auth-service` (port **3001**)
- `reservation-service` (port **3002**)
- `activity-service` (port **3003**)
- PostgreSQL (internal — port **5433** on your machine if you want to inspect it with a DB client)

The database schema (5 tables + a seeded admin account) is created **automatically** the first time Postgres starts — nothing to run by hand.

Wait until you see all 3 services print `listening on port ...` in the terminal.

### 3. Open the app
| Service | URL |
|---|---|
| Auth (login / sign up) | http://localhost:3001 |

### 4. Log in as the seeded admin
```
Email:    admin@deskapi.com
Password: Admin
```
Logging in redirects you automatically to the resources/bookings page, where the admin panel ("Add resource") is visible.

You can also register a brand-new account from http://localhost:3001 (Sign up tab) — new accounts always get the regular `user` role.

### 5. Stop everything
```bash
docker compose down
```
Add `-v` if you also want to wipe the database volume and start fully fresh next time:
```bash
docker compose down -v
```

---

## Architecture

| Service | Responsibility | Database |
|---|---|---|
| `auth-service` | Sign up / log in, JWT (access + refresh tokens), roles (admin/user) | PostgreSQL |
| `reservation-service` | Resources and bookings, no-overlap scheduling, public holiday validation | PostgreSQL |
| `activity-service` | Activity/audit log | PostgreSQL |

External API: [Nager.Date Holiday API](https://nagerholidays.com/api) — blocks bookings that fall on a public holiday (national or state-specific, for Australia).

## Notes for local development (without Docker)
If you prefer to run the services directly with Node (not required, only for development):
```bash
cp .env.example .env   # then fill in your own local Postgres credentials
npm install
npm run start:all
```
