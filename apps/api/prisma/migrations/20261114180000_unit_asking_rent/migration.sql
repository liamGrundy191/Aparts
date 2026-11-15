-- Rename, not drop + add, so existing values are kept.
ALTER TABLE "Unit" RENAME COLUMN "rentAmount" TO "askingRent";

CREATE UNIQUE INDEX "Lease_one_active_per_unit" ON "Lease"("unitId") WHERE status = 'ACTIVE';