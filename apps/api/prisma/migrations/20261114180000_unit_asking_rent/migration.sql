-- Rename, not drop + add, so existing values are kept.
ALTER TABLE "Unit" RENAME COLUMN "rentAmount" TO "askingRent";
