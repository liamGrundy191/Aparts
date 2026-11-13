# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary (in-product): the property manager.** An independent landlord or small manager running a few buildings. Their jobs: keep track of properties and units, put tenants on leases, record rent payments, see what is overdue, and move maintenance requests to done.
- **Secondary (in-product): the tenant.** Logs in to see their own lease, unit and payment history, and to report maintenance issues and follow their status.
- **Real-world audience: reviewers.** Aparts is a portfolio/CV project. Recruiters and engineers sign in with the demo accounts and judge whether it looks finished, polished and deployable.

## Product Purpose

A small real-estate management web app: managers handle properties, units, tenants, leases, rent payments and maintenance, and tenants see their lease and report issues. Success means the MVP scope in `plan.md` is fully finished, polished and deployed, and a reviewer can click through both roles without hitting rough edges.

## Positioning

The tenant side is built in. One app serves both roles, with role-scoped data, so the landlord's records and the tenant's view of them stay in one place.

## Operating Context

- Manager workflow: properties → units → tenants → leases → monthly payments (paid / partial / overdue, computed per month) → maintenance (`OPEN` → `IN_PROGRESS` → `DONE`) → a dashboard with occupancy rate, rent expected vs. collected, overdue leases and open maintenance count.
- Tenant workflow: My lease, My payments, My requests.
- Reviewers arrive from a CV link and log in with seeded demo accounts (`manager@aparts.dev`, `tenant1@aparts.dev`, `tenant2@aparts.dev`).

## Capabilities and Constraints

- Roles: `MANAGER` and `TENANT`, enforced on the backend. Tenant queries are always scoped to the signed-in user.
- Stack (existing): React + Vite + TypeScript, TanStack Query, React Hook Form + Zod, Tailwind v4, shadcn/ui on Base UI, lucide icons, Geist font, sonner toasts, next-themes. NestJS + Prisma + PostgreSQL API.
- The scope is deliberately small. Out of scope: online payments, file and image uploads, email notifications, multi-organization, document generation, a mobile app.
- No binding currency, locale, RTL or accessibility standard has been set.

## Brand Commitments

Name: **Aparts**. No logo, voice guide or other brand assets exist yet.

## Evidence on Hand

- Seeded demo data and accounts only (`apps/api/prisma/seed.ts`).
- No real customers, testimonials, usage numbers or press. None of these may be invented.

## Product Principles

1. Finished beats broad: polish the MVP scope before adding features.
2. Two roles, one truth: managers and tenants see the same records, each scoped to what they may see.
3. Show what needs attention: overdue rent and open maintenance come first.
4. Reviewer-ready at all times: every screen should hold up in a cold demo click-through.
