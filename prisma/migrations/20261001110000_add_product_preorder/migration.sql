-- Additive only. Existing products get isPreorder = false (they stay "available" exactly as
-- today) and preorderNote = NULL. No existing values are changed or removed.
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "isPreorder" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "preorderNote" TEXT;
