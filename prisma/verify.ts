import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDatabase() {
  console.log('🔍 Connecting to Supabase PostgreSQL database...');

  try {
    const adminCount = await prisma.adminUser.count();
    console.log(`✅ admin_users table active! Admin user count: ${adminCount}`);

    const categoryCount = await prisma.category.count();
    console.log(`✅ categories table active! Category count: ${categoryCount}`);

    const productCount = await prisma.product.count();
    console.log(`✅ products table active! Product count: ${productCount}`);

    const orderCount = await prisma.order.count();
    console.log(`✅ orders table active! Order count: ${orderCount}`);

    const repairCount = await prisma.repairBooking.count();
    console.log(`✅ repair_bookings table active! Repair booking count: ${repairCount}`);

    const solarCount = await prisma.solarQuoteRequest.count();
    console.log(`✅ solar_quote_requests table active! Solar quote count: ${solarCount}`);

    const storeConfigCount = await prisma.storeConfig.count();
    console.log(`✅ store_configs table active! Store config count: ${storeConfigCount}`);

    console.log('\n🎉 ALL SUPABASE POSTGRESQL TABLES ARE LIVE, CONNECTED AND 100% OPERATIONAL!');
  } catch (error: any) {
    console.error('❌ Supabase Database Verification Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();
