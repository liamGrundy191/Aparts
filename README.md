# Aparts

Real estate management app: managers handle properties, units, tenants, leases, rent payments and maintenance requests, and tenants see their lease and report issues.

**Stack:** pnpm monorepo · NestJS · Prisma · PostgreSQL · React (Vite) · TanStack Query · Tailwind · JWT auth with roles · Docker · GitHub Actions

> Work in progress. See [plan.md](plan.md) for the MVP scope and milestones.

## Structure

```
apps/api         NestJS REST API (Prisma, Swagger at /api/docs)
apps/web         React + Vite frontend
packages/shared  Enums, Zod schemas and types shared by both apps
```

## Getting started

Requirements: Node 20+, pnpm 9, Docker.

```bash
pnpm install
cp .env.example apps/api/.env   # edit secrets if you like
pnpm db:up                      # start Postgres in Docker
pnpm db:migrate                 # apply migrations
pnpm db:seed                    # demo data
pnpm dev                        # api on :3000, web on :5173
```

- Web: http://localhost:5173
- API: http://localhost:3000/api
- Swagger: http://localhost:3000/api/docs
- Health: http://localhost:3000/api/health

Demo login after seeding: `manager@aparts.dev` / `Password123!` (tenants: `tenant1@aparts.dev`, `tenant2@aparts.dev`, same password).

## Scripts (repo root)

| Script                       | What it does                                  |
| ---------------------------- | --------------------------------------------- |
| `pnpm dev`                   | Build shared, then run all apps in watch mode |
| `pnpm build`                 | Build every package                           |
| `pnpm lint` / `pnpm test`    | Lint / unit-test every package                |
| `pnpm format`                | Prettier on the whole repo                    |
| `pnpm db:up` / `db:down`     | Start / stop local Postgres                   |
| `pnpm db:migrate`            | `prisma migrate dev`                          |
| `pnpm db:seed` / `db:studio` | Seed demo data / open Prisma Studio           |

E2E tests need the database running: `pnpm --filter api test:e2e`.

## Full stack in Docker

```bash
docker compose -f docker-compose.prod.yml up --build
```

Open http://localhost:8080. nginx serves the React build and proxies `/api` to the API container, which runs migrations on startup.
