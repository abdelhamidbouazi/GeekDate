# Matcha

A modern dating platform built with .NET and Next.js.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- 4GB+ RAM (SQL Server requires ~2GB)

## Quick Start

```bash
# 1. Copy environment template and set the SQL Server password
cp .env.example .env
# Edit .env and set MSSQL_SA_PASSWORD (must meet complexity: 8+ chars, upper/lower/digits/symbols)

# 2. Start the full stack
docker compose up --build

# Or use Make
make up
```

## URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| Swagger | http://localhost:8080/swagger |
| SQL Server | localhost:1433 (for debugging) |

## Makefile Commands

| Command | Description |
|---------|-------------|
| `make up` | Start stack (build + run in background) |
| `make down` | Stop stack |
| `make build` | Build/rebuild images |
| `make restart` | Stop then start stack |
| `make logs` | Follow all service logs |
| `make logs-backend` | Follow backend logs |
| `make logs-frontend` | Follow frontend logs |
| `make logs-db` | Follow SQL Server logs |
| `make ps` | List running containers |
| `make shell-backend` | Shell into backend container |
| `make shell-frontend` | Shell into frontend container |
| `make shell-db` | Shell into SQL Server container |
| `make seed` | Run database seed (migrations + 500 profiles) |
| `make migrate` | Alias for seed |
| `make reset-db` | Full DB reset (remove volumes, restart stack) |
| `make clean` | Stop stack, remove volumes, prune Docker |
| `make help` | Show all commands |

## Seeding

- **Automatic**: On first startup, the backend runs migrations and seeds the database if empty (500 profiles by default).
- **Manual seed**: If the stack is already running and you need to re-seed:
  1. `make reset-db` to clear the database
  2. `make up` to start fresh (seed runs automatically)

  Or run seed in isolation (requires stack to be up):
  ```bash
  make seed
  ```

- **Seed count**: Set `SEED_USER_COUNT` in `.env` (default: 500). The Matcha evaluation requires at least 500 profiles.

## Project Structure

```
matcha/
├── backend/          # .NET 8 API, EF Core, SQL Server
├── frontend/         # Next.js 16, React 19
├── compose.yaml      # Docker Compose stack
├── Makefile          # Developer workflows
└── .env.example      # Environment template
```

## Environment Variables

See [.env.example](.env.example) for all supported variables.

## Dev-only: Impersonate a user (JWT + reset link)

For local development, you can impersonate an existing user by **username or email** and get back a signed JWT plus a reset-password link.

- **Endpoint**: `POST /api/dev/impersonate`
- **Enabled only when**: `ASPNETCORE_ENVIRONMENT=Development`
- **Auth**: `X-Dev-Secret` header must match `DEV_IMPERSONATE_SECRET`

Example:

```bash
export DEV_IMPERSONATE_SECRET="dev-secret-change-me"

curl -s -X POST "http://localhost:8080/api/dev/impersonate" \
  -H "Content-Type: application/json" \
  -H "X-Dev-Secret: ${DEV_IMPERSONATE_SECRET}" \
  -d '{"identifier":"user42"}'
```

Then paste the returned `token` into the browser console:

```js
localStorage.setItem("accessToken", "<token>");
location.href = "/browse";
```

## Troubleshooting

- **SQL Server won't start**: Ensure 2GB+ RAM is available. Check with `docker stats`.
- **Backend can't connect to DB**: Ensure `make up` has completed and SQL Server healthcheck passed. Check `make logs-db`.
- **Port already in use**: Change ports in `compose.yaml` or stop conflicting services.
