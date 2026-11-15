-- A unit can have at most one ACTIVE lease. Prisma's schema language can't express a partial
-- unique index, so it lives only here. Two requests racing past the service's checks both reach
-- the INSERT, and this index rejects the second one (Prisma error P2002).
CREATE UNIQUE INDEX "Lease_one_active_per_unit" ON "Lease"("unitId") WHERE "status" = 'ACTIVE';
