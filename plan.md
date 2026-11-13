# Aparts: Real Estate Management MVP

## 1. Goal

A web app where a **property manager** (the owner) manages properties, units, tenants, leases, rent payments and maintenance requests. A **tenant** (member) logs in to see their lease and payments and to report maintenance issues.

The scope is kept small on purpose so the project gets finished, polished and deployed.

## 2. Roles

| Role      | Can do                                                                                                                              |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `MANAGER` | Full CRUD on properties, units and leases; invite and create tenants; record payments; update maintenance status; see the dashboard |
| `TENANT`  | Read their own lease, unit and payments; create maintenance requests and see their status                                           |

Everything is enforced on the backend with a `@Roles()` decorator plus a `RolesGuard`. Tenant queries are always scoped to `req.user.id`, so a tenant can never read another tenant's data.

## 3. MVP features

1. **Auth**: register (the first user becomes the manager, or the manager is created by a seed), login, logout, JWT access token (15 min) + refresh token (7 days, httpOnly cookie, stored hashed in the DB), and `GET /auth/me`.
2. **Properties**: name, address, notes.
3. **Units**: belong to a property; unit number, bedrooms, rent amount, status (`VACANT`/`OCCUPIED`).
4. **Tenants**: the manager creates a tenant account (email + temporary password).
5. **Leases**: link a tenant to a unit with a start date, end date, monthly rent and status (`ACTIVE`/`ENDED`). Creating a lease marks the unit `OCCUPIED`.
6. **Payments**: the manager records payments for a lease (amount, date, period month, method). A status of paid, partial or overdue is computed per month.
7. **Maintenance requests**: the tenant creates one (title, description, priority). The manager moves it through `OPEN` → `IN_PROGRESS` → `DONE`.
8. **Manager dashboard**: occupancy rate, rent expected vs. collected this month, overdue leases, open maintenance count.

### Out of scope (possible v2)

Online payments (Stripe), file and image uploads, email notifications, multiple organizations or multi-tenancy, a document generator, a mobile app.

## 4. Tech stack

- **Monorepo:** pnpm workspaces (+ Turborepo optional, for `build`/`lint`/`test` pipelines)
- **Backend:** NestJS, TypeScript, Prisma, PostgreSQL, `@nestjs/jwt` + Passport, bcrypt, `class-validator`, Swagger (`@nestjs/swagger`)
- **Frontend:** React + Vite + TypeScript, React Router, TanStack Query, React Hook Form + Zod, Tailwind CSS (+ shadcn/ui optional)
- **Shared:** a `packages/shared` package with enums, DTO types and Zod schemas used by both apps
- **Testing:** Jest (unit tests for services) + Supertest (e2e tests for auth and role guards); Vitest optional for the web app
- **DevOps:** Docker and docker-compose, GitHub Actions CI, deployed to Render or Railway (or a single VPS with compose)

## 5. Repo structure

```
aparts/
├─ apps/
│  ├─ api/                 # NestJS
│  │  ├─ src/
│  │  │  ├─ auth/          # controller, service, jwt strategy, guards, decorators
│  │  │  ├─ users/
│  │  │  ├─ properties/
│  │  │  ├─ units/
│  │  │  ├─ leases/
│  │  │  ├─ payments/
│  │  │  ├─ maintenance/
│  │  │  ├─ dashboard/
│  │  │  └─ prisma/        # PrismaService module
│  │  ├─ prisma/schema.prisma, migrations/, seed.ts
│  │  ├─ test/             # e2e
│  │  └─ Dockerfile
│  └─ web/                 # React + Vite
│     ├─ src/
│     │  ├─ api/           # axios client + interceptors (refresh)
│     │  ├─ auth/          # AuthContext, ProtectedRoute, RoleRoute
│     │  ├─ pages/manager/ # Dashboard, Properties, Units, Leases, Payments, Maintenance
│     │  ├─ pages/tenant/  # MyLease, MyPayments, MyRequests
│     │  └─ components/
│     ├─ nginx.conf
│     └─ Dockerfile
├─ packages/
│  └─ shared/              # enums, zod schemas, types
├─ docker-compose.yml      # postgres (dev)
├─ docker-compose.prod.yml # db + api + web
├─ .github/workflows/ci.yml
├─ pnpm-workspace.yaml
├─ package.json
├─ .env.example
└─ README.md
```

## 6. Data model (Prisma)

```prisma
enum Role { MANAGER TENANT }
enum UnitStatus { VACANT OCCUPIED }
enum LeaseStatus { ACTIVE ENDED }
enum MaintenanceStatus { OPEN IN_PROGRESS DONE }
enum Priority { LOW MEDIUM HIGH }

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  firstName    String
  lastName     String
  phone        String?
  role         Role     @default(TENANT)
  refreshTokenHash String?
  leases       Lease[]
  requests     MaintenanceRequest[]
  createdAt    DateTime @default(now())
}

model Property {
  id        String @id @default(uuid())
  name      String
  address   String
  city      String
  notes     String?
  units     Unit[]
  createdAt DateTime @default(now())
}

model Unit {
  id          String     @id @default(uuid())
  propertyId  String
  property    Property   @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  unitNumber  String
  bedrooms    Int
  rentAmount  Decimal    @db.Decimal(10, 2)
  status      UnitStatus @default(VACANT)
  leases      Lease[]
  requests    MaintenanceRequest[]
  @@unique([propertyId, unitNumber])
}

model Lease {
  id          String      @id @default(uuid())
  unitId      String
  unit        Unit        @relation(fields: [unitId], references: [id])
  tenantId    String
  tenant      User        @relation(fields: [tenantId], references: [id])
  startDate   DateTime
  endDate     DateTime
  monthlyRent Decimal     @db.Decimal(10, 2)
  status      LeaseStatus @default(ACTIVE)
  payments    Payment[]
}

model Payment {
  id          String   @id @default(uuid())
  leaseId     String
  lease       Lease    @relation(fields: [leaseId], references: [id])
  amount      Decimal  @db.Decimal(10, 2)
  paidAt      DateTime
  periodMonth String   // "2026-11"
  method      String   // cash / transfer / check
  note        String?
}

model MaintenanceRequest {
  id          String            @id @default(uuid())
  unitId      String
  unit        Unit              @relation(fields: [unitId], references: [id])
  tenantId    String
  tenant      User              @relation(fields: [tenantId], references: [id])
  title       String
  description String
  priority    Priority          @default(MEDIUM)
  status      MaintenanceStatus @default(OPEN)
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
}
```

Business rule: a unit can have at most one `ACTIVE` lease. Check this in `LeasesService` inside a Prisma transaction.

## 7. API endpoints

| Method   | Path                                                 | Role          |
| -------- | ---------------------------------------------------- | ------------- |
| POST     | `/auth/login`, `/auth/refresh`, `/auth/logout`       | public / auth |
| GET      | `/auth/me`                                           | any           |
| CRUD     | `/properties`, `/properties/:id/units`, `/units/:id` | MANAGER       |
| GET/POST | `/tenants`                                           | MANAGER       |
| CRUD     | `/leases`, `POST /leases/:id/end`                    | MANAGER       |
| GET/POST | `/leases/:id/payments`                               | MANAGER       |
| GET      | `/dashboard/summary`                                 | MANAGER       |
| GET      | `/me/lease`, `/me/payments`                          | TENANT        |
| GET/POST | `/maintenance` (scoped by role)                      | both          |
| PATCH    | `/maintenance/:id/status`                            | MANAGER       |

Swagger docs are served at `/api/docs`. List endpoints get simple pagination (`?page&limit`).

## 8. Frontend pages

- **Public:** Login
- **Manager:** Dashboard (stat cards), Properties list/detail (with units), Tenants, Leases (create and end), Payments (per lease, add payment), Maintenance board (filter by status)
- **Tenant:** My Lease, My Payments, Maintenance (create a request, see the list)
- Role-based routing: `<ProtectedRoute>` + `<RoleRoute role="MANAGER">`. An axios interceptor refreshes the access token automatically when a request returns 401.

## 9. Milestones

1. **Setup**: pnpm workspace, the `api`/`web`/`shared` apps, ESLint + Prettier, Postgres in docker-compose, Prisma schema + first migration + seed (1 manager, 2 properties, units, 2 tenants)
2. **Auth**: login, refresh and logout, JWT strategy, `RolesGuard`, `@Roles`/`@CurrentUser` decorators, e2e tests
3. **Core CRUD**: properties, units, tenants and leases (API + manager UI)
4. **Payments + maintenance**: API + UI for both roles
5. **Dashboard**: aggregate queries + stat cards
6. **Docker + CI**: multi-stage Dockerfiles, `docker-compose.prod.yml`, GitHub Actions (install → lint → test → build)
7. **Deploy + polish**: deploy (DB + API + web), README with screenshots, architecture diagram, demo credentials and the live URL

## 10. Definition of done / verification

- `pnpm install && docker compose up -d && pnpm --filter api prisma migrate dev && pnpm dev` runs both apps locally
- `pnpm test` passes. It covers unit tests for the lease and payment logic and e2e tests for login, refresh, and a tenant getting **403** on manager routes
- `docker compose -f docker-compose.prod.yml up --build` runs the full stack
- CI is green on every push to `main`
- Manual check on the live URL: log in as the demo manager and create a property → unit → tenant → lease → payment; log in as the tenant and see the lease and payment, submit a maintenance request; the manager marks it `DONE`

## 11. Auth follow-ups

Small issues found in the review of `feat/auth`. None of them block the MVP.

- [x] **Redirect logged-in users away from `/login`.** `/` always goes to `/login`, and `RoleRoute` sends a user with the wrong role to `/`, so a logged-in tenant who opens `/manager` lands on the login page. Send logged-in users to `/${user.role.toLowerCase()}` instead (`App.tsx`, `auth/guards.tsx`, `LoginPage.tsx`).
- [x] **Web lint fails locally.** `apps/web/eslint.config.js` ignores `dist` but not Vite's `.vite/` cache. Change `ignores: ['dist']` to `['dist', '.vite']`.
- [ ] **`react-hooks/exhaustive-deps` warning** in `AuthContext.tsx` (the mount `useEffect` doesn't list `logoutUtil`). Either keep it and add an eslint-disable comment explaining it should run once on mount, or wrap `logoutUtil` in `useCallback`.
- [ ] **Login timing reveals which emails exist.** When the email is unknown, `AuthService.login` skips `bcrypt.compare`, so it answers faster. Compare against a dummy hash in that case.
- [ ] **No rate limiting on `POST /auth/login`.** Add `@nestjs/throttler` (v2 is fine).
- [ ] **Logout returns 500 for a deleted user.** `setRefreshTokenHash` uses `update`, which throws if the user no longer exists. Use `updateMany`, or catch Prisma's `P2025` error.
- [ ] **`UsersService` unit tests are still `it.todo`** (`users.service.spec.ts`).
- Accepted trade-off: an access token stays valid for up to 15 minutes after logout or after the user is deleted, because `JwtStrategy` doesn't look the user up.

## 12. v2: Property images (S3)

The MVP shows a generated placeholder on each property card. Real image uploads come after the MVP is deployed.

- **Storage:** S3, or an S3-compatible service like Cloudflare R2. Render and Railway disks are wiped on every deploy, so files can't live on the API server.
- **Upload flow:** the API issues a presigned PUT URL (`POST /properties/:id/image/upload-url`). The browser uploads directly to S3, then the API saves the object key on the property. Files never pass through the API.
- **Schema:** add `imageKey String?` to `Property`, plus a migration. Build the public URL (or a presigned GET URL for a private bucket) when returning properties.
- **Validation:** check the content type (jpeg/png/webp) and the size limit (around 5 MB) when issuing the URL. Restrict them in the bucket's CORS too.
- **Cleanup:** delete the S3 object when the property is deleted or its image is replaced.
- **Frontend:** a file picker with a preview on the property form. Show the image on the card, and fall back to the placeholder.
- **Config:** add the bucket, region and credentials as env vars, and update `.env.example`.
