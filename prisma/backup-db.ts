/**
 * Read-only snapshot of EVERY table to backups/ (git-ignored; contains customer data and
 * password hashes, so keep it private). Run before any database change:
 *
 *   npx tsx prisma/backup-db.ts
 */
import { chmodSync, mkdirSync, writeFileSync } from 'node:fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const takenAt = new Date().toISOString();
  const data = {
    takenAt,
    products: await prisma.product.findMany(),
    categories: await prisma.category.findMany(),
    storeConfigs: await prisma.storeConfig.findMany(),
    orders: await prisma.order.findMany({ include: { items: true } }),
    reviews: await prisma.review.findMany(),
    repairBookings: await prisma.repairBooking.findMany(),
    solarQuoteRequests: await prisma.solarQuoteRequest.findMany(),
    users: await prisma.user.findMany(),
    adminUsers: await prisma.adminUser.findMany(),
  };

  mkdirSync('backups', { recursive: true });
  const file = `backups/db-backup-${takenAt.replace(/[:.]/g, '-')}.json`;
  writeFileSync(file, JSON.stringify(data, null, 1));
  chmodSync(file, 0o600);

  const counts = Object.fromEntries(
    Object.entries(data)
      .filter(([key]) => key !== 'takenAt')
      .map(([key, rows]) => [key, (rows as unknown[]).length])
  );
  console.log(file, counts);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
