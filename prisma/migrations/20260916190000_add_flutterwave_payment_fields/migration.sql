ALTER TABLE "orders"
  ADD COLUMN "paymentReference" TEXT,
  ADD COLUMN "flutterwaveTransactionId" TEXT,
  ADD COLUMN "paymentMethod" TEXT,
  ADD COLUMN "paidAt" TIMESTAMP(3),
  ADD COLUMN "paymentFailureReason" TEXT;

CREATE UNIQUE INDEX "orders_paymentReference_key"
  ON "orders"("paymentReference");

CREATE UNIQUE INDEX "orders_flutterwaveTransactionId_key"
  ON "orders"("flutterwaveTransactionId");
