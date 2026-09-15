import { PrismaClient } from '@prisma/client';
import { CATEGORIES, DEFAULT_STORE_CONFIG } from '../src/data/storeCatalog';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 0. Seed Admin Account
  console.log('🔐 Provisioning Admin Account...');
  const hashedPassword = await bcrypt.hash('Gnaathcomm', 10);
  await prisma.adminUser.upsert({
    where: { email: 'gnaathglobal@gmail.com' },
    update: {
      password: hashedPassword,
      name: 'G Naath Admin',
      role: 'ADMIN',
    },
    create: {
      email: 'gnaathglobal@gmail.com',
      password: hashedPassword,
      name: 'G Naath Admin',
      role: 'ADMIN',
    },
  });

  // 1. Seed Store Config
  console.log('📌 Upserting store configuration...');
  await prisma.storeConfig.upsert({
    where: { id: 'default' },
    update: {
      storeName: DEFAULT_STORE_CONFIG.storeName,
      motto: DEFAULT_STORE_CONFIG.motto,
      rcNumber: DEFAULT_STORE_CONFIG.rcNumber,
      tagline: DEFAULT_STORE_CONFIG.tagline,
      whatsappNumber: DEFAULT_STORE_CONFIG.whatsappNumber,
      whatsappDisplayNumber: DEFAULT_STORE_CONFIG.whatsappDisplayNumber,
      email: DEFAULT_STORE_CONFIG.email,
      facebookName: DEFAULT_STORE_CONFIG.facebookName,
      facebookUrl: DEFAULT_STORE_CONFIG.facebookUrl,
      currencySymbol: DEFAULT_STORE_CONFIG.currencySymbol,
      currencyCode: DEFAULT_STORE_CONFIG.currencyCode,
      bannerAnnouncement: DEFAULT_STORE_CONFIG.bannerAnnouncement,
      headOfficeAddress: DEFAULT_STORE_CONFIG.headOfficeAddress,
      headOfficeLandmark: DEFAULT_STORE_CONFIG.headOfficeLandmark,
      branchOfficeAddress: DEFAULT_STORE_CONFIG.branchOfficeAddress,
      branchOfficeLandmark: DEFAULT_STORE_CONFIG.branchOfficeLandmark,
      businessHours: DEFAULT_STORE_CONFIG.businessHours,
      logoUrl: DEFAULT_STORE_CONFIG.logoUrl,
      brands: DEFAULT_STORE_CONFIG.brands,
    },
    create: {
      id: 'default',
      storeName: DEFAULT_STORE_CONFIG.storeName,
      motto: DEFAULT_STORE_CONFIG.motto,
      rcNumber: DEFAULT_STORE_CONFIG.rcNumber,
      tagline: DEFAULT_STORE_CONFIG.tagline,
      whatsappNumber: DEFAULT_STORE_CONFIG.whatsappNumber,
      whatsappDisplayNumber: DEFAULT_STORE_CONFIG.whatsappDisplayNumber,
      email: DEFAULT_STORE_CONFIG.email,
      facebookName: DEFAULT_STORE_CONFIG.facebookName,
      facebookUrl: DEFAULT_STORE_CONFIG.facebookUrl,
      currencySymbol: DEFAULT_STORE_CONFIG.currencySymbol,
      currencyCode: DEFAULT_STORE_CONFIG.currencyCode,
      bannerAnnouncement: DEFAULT_STORE_CONFIG.bannerAnnouncement,
      headOfficeAddress: DEFAULT_STORE_CONFIG.headOfficeAddress,
      headOfficeLandmark: DEFAULT_STORE_CONFIG.headOfficeLandmark,
      branchOfficeAddress: DEFAULT_STORE_CONFIG.branchOfficeAddress,
      branchOfficeLandmark: DEFAULT_STORE_CONFIG.branchOfficeLandmark,
      businessHours: DEFAULT_STORE_CONFIG.businessHours,
      logoUrl: DEFAULT_STORE_CONFIG.logoUrl,
      brands: DEFAULT_STORE_CONFIG.brands,
    },
  });

  // 2. Seed Categories
  console.log('📦 Upserting categories...');
  const categoryMap: Record<string, string> = {};

  for (const cat of CATEGORIES) {
    if (cat.id === 'all') continue; // Skip all pseudo-category

    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        image: cat.image,
        iconName: cat.iconName,
        itemCount: cat.itemCount,
      },
      create: {
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        image: cat.image,
        iconName: cat.iconName,
        itemCount: cat.itemCount,
      },
    });

    categoryMap[cat.id] = category.id;
    categoryMap[cat.slug] = category.id;
  }

  console.log('✅ Database configuration seeded. Products must be added through the admin dashboard.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
