/**
 * Restores a JSON backup written by the backup step into an EMPTY database.
 * It refuses to run if any target table already has rows, so it can never overwrite data.
 *
 *   npx tsx prisma/restore-backup.ts backups/db-backup-<timestamp>.json
 */
import { readFileSync } from 'node:fs';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const json = (value: unknown) => (value === null || value === undefined ? Prisma.DbNull : (value as Prisma.InputJsonValue));

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error('Pass the backup file path.');
  const backup = JSON.parse(readFileSync(file, 'utf8'));

  const existing = {
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    storeConfigs: await prisma.storeConfig.count(),
    orders: await prisma.order.count(),
    orderItems: await prisma.orderItem.count(),
    reviews: await prisma.review.count(),
    repairBookings: await prisma.repairBooking.count(),
    solarQuoteRequests: await prisma.solarQuoteRequest.count(),
  };
  if (Object.values(existing).some((count) => count > 0)) {
    throw new Error(`Refusing to restore into a non-empty database: ${JSON.stringify(existing)}`);
  }

  const userIds = new Set((await prisma.user.findMany({ select: { id: true } })).map((u) => u.id));

  await prisma.$transaction(
    async (tx) => {
      await tx.category.createMany({ data: backup.categories });
      await tx.product.createMany({
        data: backup.products.map((p: Record<string, unknown>) => ({ ...p, options: json(p.options) })),
      });
      await tx.storeConfig.createMany({ data: backup.storeConfigs });
      await tx.order.createMany({
        data: backup.orders.map((order: Record<string, unknown>) => ({
          ...Object.fromEntries(Object.entries(order).filter(([key]) => key !== 'items')),
          // Orders keep their customer details; the account link is dropped only if the account is gone.
          userId: order.userId && userIds.has(order.userId as string) ? order.userId : null,
        })),
      });
      await tx.orderItem.createMany({
        data: backup.orders.flatMap((order: { items: Record<string, unknown>[] }) =>
          order.items.map((item) => ({ ...item, selectedOptions: json(item.selectedOptions) }))
        ),
      });
      if (backup.reviews.length) await tx.review.createMany({ data: backup.reviews });
      if (backup.repairBookings.length) await tx.repairBooking.createMany({ data: backup.repairBookings });
      if (backup.solarQuoteRequests.length) await tx.solarQuoteRequest.createMany({ data: backup.solarQuoteRequests });
    },
    { timeout: 120_000 }
  );

  const restored = {
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    storeConfigs: await prisma.storeConfig.count(),
    orders: await prisma.order.count(),
    orderItems: await prisma.orderItem.count(),
  };
  console.log('Restored:', restored);
  const expectedItems = backup.orders.reduce((sum: number, o: { items: unknown[] }) => sum + o.items.length, 0);
  console.log('Expected:', {
    categories: backup.categories.length,
    products: backup.products.length,
    storeConfigs: backup.storeConfigs.length,
    orders: backup.orders.length,
    orderItems: expectedItems,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
