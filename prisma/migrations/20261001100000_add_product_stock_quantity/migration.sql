-- Additive only: a nullable column with no default. Existing rows get NULL ("not tracked"),
-- so no existing data is changed and older app versions keep working.
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "stockQuantity" INTEGER;
